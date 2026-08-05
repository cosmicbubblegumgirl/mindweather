const ACCOUNT_KEY = "mindweather.local.accounts.v1";
const SESSION_KEY = "mindweather.local.session.v1";

interface LocalAccount {
  name: string;
  email: string;
  passwordHash: string;
  verified: boolean;
}

async function hash(value: string) {
  const bytes = new TextEncoder().encode(value);
  const digest = await crypto.subtle.digest("SHA-256", bytes);
  return Array.from(new Uint8Array(digest)).map((item) => item.toString(16).padStart(2, "0")).join("");
}

function accounts(): LocalAccount[] {
  try {
    return JSON.parse(localStorage.getItem(ACCOUNT_KEY) ?? "[]") as LocalAccount[];
  } catch {
    return [];
  }
}

export const authService = {
  async signUp(name: string, email: string, password: string) {
    const existing = accounts();
    if (existing.some((account) => account.email === email.toLowerCase())) throw new Error("A local profile already uses that email.");
    const account = { name, email: email.toLowerCase(), passwordHash: await hash(password), verified: true };
    localStorage.setItem(ACCOUNT_KEY, JSON.stringify([...existing, account]));
    localStorage.setItem(SESSION_KEY, account.email);
    return account;
  },
  async login(email: string, password: string) {
    const passwordHash = await hash(password);
    const account = accounts().find((item) => item.email === email.toLowerCase() && item.passwordHash === passwordHash);
    if (!account) throw new Error("That email and password do not match this device.");
    localStorage.setItem(SESSION_KEY, account.email);
    return account;
  },
  logout() {
    localStorage.removeItem(SESSION_KEY);
  },
  session() {
    return localStorage.getItem(SESSION_KEY);
  },
  async resetPassword(email: string, password: string) {
    const all = accounts();
    if (!all.some((item) => item.email === email.toLowerCase())) throw new Error("No local profile uses that email.");
    const passwordHash = await hash(password);
    localStorage.setItem(ACCOUNT_KEY, JSON.stringify(all.map((item) => (item.email === email.toLowerCase() ? { ...item, passwordHash } : item))));
  },
};
