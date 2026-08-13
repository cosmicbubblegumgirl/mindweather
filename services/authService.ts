import type { GoogleIdentityProfile } from "@/services/googleIdentityService";

const ACCOUNT_KEY = "mindweather.local.accounts.v1";
const SESSION_KEY = "mindweather.local.session.v1";
const PASSWORD_ITERATIONS = 210_000;

export type AuthProvider = "password" | "google";

export interface AuthAccount {
  id: string;
  name: string;
  email: string;
  providers: AuthProvider[];
  verified: boolean;
}

interface StoredAccount {
  id?: string;
  name: string;
  email: string;
  passwordHash?: string;
  passwordSalt?: string;
  passwordIterations?: number;
  googleSubject?: string;
  providers?: AuthProvider[];
  verified: boolean;
}

function hex(bytes: Uint8Array) {
  return Array.from(bytes, (item) => item.toString(16).padStart(2, "0")).join("");
}

async function legacyHash(value: string) {
  const digest = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(value));
  return hex(new Uint8Array(digest));
}

async function passwordHash(value: string, salt: Uint8Array, iterations = PASSWORD_ITERATIONS) {
  const key = await crypto.subtle.importKey("raw", new TextEncoder().encode(value), "PBKDF2", false, ["deriveBits"]);
  const digest = await crypto.subtle.deriveBits(
    { name: "PBKDF2", hash: "SHA-256", salt: salt.buffer as ArrayBuffer, iterations },
    key,
    256,
  );
  return hex(new Uint8Array(digest));
}

function saltFromHex(value: string) {
  return new Uint8Array(value.match(/.{1,2}/g)?.map((byte) => Number.parseInt(byte, 16)) ?? []);
}

async function makePasswordRecord(password: string) {
  const salt = crypto.getRandomValues(new Uint8Array(16));
  return {
    passwordHash: await passwordHash(password, salt),
    passwordSalt: hex(salt),
    passwordIterations: PASSWORD_ITERATIONS,
  };
}

function providersFor(account: StoredAccount): AuthProvider[] {
  if (account.providers?.length) return [...new Set(account.providers)];
  const providers: AuthProvider[] = [];
  if (account.passwordHash) providers.push("password");
  if (account.googleSubject) providers.push("google");
  return providers;
}

function publicAccount(account: StoredAccount): AuthAccount {
  return {
    id: account.id || account.googleSubject || account.email,
    name: account.name,
    email: account.email,
    providers: providersFor(account),
    verified: account.verified,
  };
}

function accounts(): StoredAccount[] {
  if (typeof window === "undefined") return [];
  try {
    return JSON.parse(window.localStorage.getItem(ACCOUNT_KEY) ?? "[]") as StoredAccount[];
  } catch {
    return [];
  }
}

function saveAccounts(value: StoredAccount[]) {
  window.localStorage.setItem(ACCOUNT_KEY, JSON.stringify(value));
}

function openSession(account: StoredAccount) {
  window.localStorage.setItem(SESSION_KEY, account.email);
  return publicAccount(account);
}

export const authService = {
  async signUp(name: string, email: string, password: string) {
    const normalizedEmail = email.trim().toLowerCase();
    const all = accounts();
    const index = all.findIndex((account) => account.email === normalizedEmail);
    const passwordRecord = await makePasswordRecord(password);

    if (index >= 0) {
      const existing = all[index];
      if (providersFor(existing).includes("password")) throw new Error("A profile on this device already uses that email.");
      const linked: StoredAccount = {
        ...existing,
        ...passwordRecord,
        name: name.trim() || existing.name,
        providers: [...providersFor(existing), "password"],
      };
      all[index] = linked;
      saveAccounts(all);
      return openSession(linked);
    }

    const account: StoredAccount = {
      id: crypto.randomUUID(),
      name: name.trim(),
      email: normalizedEmail,
      ...passwordRecord,
      providers: ["password"],
      verified: false,
    };
    saveAccounts([...all, account]);
    return openSession(account);
  },

  async login(email: string, password: string) {
    const normalizedEmail = email.trim().toLowerCase();
    const all = accounts();
    const index = all.findIndex((account) => account.email === normalizedEmail);
    const account = all[index];
    if (!account?.passwordHash || !providersFor(account).includes("password")) {
      throw new Error("Use Continue with Google for that account, or create a local password first.");
    }

    const matches = account.passwordSalt
      ? await passwordHash(password, saltFromHex(account.passwordSalt), account.passwordIterations || PASSWORD_ITERATIONS) === account.passwordHash
      : await legacyHash(password) === account.passwordHash;
    if (!matches) throw new Error("That email and password do not match this device.");

    if (!account.passwordSalt) {
      const upgraded = { ...account, ...(await makePasswordRecord(password)), providers: providersFor(account) };
      all[index] = upgraded;
      saveAccounts(all);
      return openSession(upgraded);
    }
    return openSession(account);
  },

  signInWithGoogle(profile: GoogleIdentityProfile) {
    const all = accounts();
    const index = all.findIndex((account) => account.googleSubject === profile.id || account.email === profile.email);
    if (index >= 0) {
      const existing = all[index];
      const linked: StoredAccount = {
        ...existing,
        googleSubject: profile.id,
        providers: [...new Set([...providersFor(existing), "google" as const])],
        verified: true,
      };
      all[index] = linked;
      saveAccounts(all);
      return { account: openSession(linked), isNew: false };
    }

    const account: StoredAccount = {
      id: crypto.randomUUID(),
      name: profile.name,
      email: profile.email,
      googleSubject: profile.id,
      providers: ["google"],
      verified: true,
    };
    saveAccounts([...all, account]);
    return { account: openSession(account), isNew: true };
  },

  logout() {
    window.localStorage.removeItem(SESSION_KEY);
  },

  session() {
    if (typeof window === "undefined") return null;
    return window.localStorage.getItem(SESSION_KEY);
  },

  current() {
    const email = this.session();
    if (!email) return null;
    const account = accounts().find((item) => item.email === email);
    return account ? publicAccount(account) : null;
  },

  async resetPassword(email: string, password: string) {
    const normalizedEmail = email.trim().toLowerCase();
    const all = accounts();
    const index = all.findIndex((item) => item.email === normalizedEmail);
    if (index < 0) throw new Error("No profile on this device uses that email.");
    if (!providersFor(all[index]).includes("password")) {
      throw new Error("That account uses Google sign-in and does not have a local password.");
    }
    all[index] = { ...all[index], ...(await makePasswordRecord(password)), providers: providersFor(all[index]) };
    saveAccounts(all);
  },
};
