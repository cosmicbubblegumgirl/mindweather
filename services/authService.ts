import type { Profile } from "@/lib/types";
import type { GoogleIdentityCredential } from "@/services/googleIdentityService";
import { getSupabaseClient, supabaseConfigured } from "@/services/supabaseClient";
import type { AuthChangeEvent, User } from "@supabase/supabase-js";

export type AuthProvider = "password" | "google";

export interface AuthAccount {
  id: string;
  name: string;
  email: string;
  providers: AuthProvider[];
  verified: boolean;
  onboarded: boolean;
}

export interface SignUpResult {
  account: AuthAccount | null;
  needsEmailConfirmation: boolean;
}

interface ProfileRow {
  name: string;
  email: string;
  onboarded: boolean;
}

function displayName(user: User, profile?: ProfileRow | null) {
  const metadataName = user.user_metadata?.name || user.user_metadata?.full_name;
  return profile?.name?.trim() || String(metadataName || "").trim() || user.email?.split("@")[0] || "MindWeather learner";
}

function providersFor(user: User): AuthProvider[] {
  const raw = Array.isArray(user.app_metadata?.providers)
    ? user.app_metadata.providers
    : user.identities?.map((identity) => identity.provider) ?? [];
  const providers = raw.flatMap<AuthProvider>((provider) => {
    if (provider === "google") return ["google"];
    if (provider === "email") return ["password"];
    return [];
  });
  return [...new Set(providers.length ? providers : ["password"])] as AuthProvider[];
}

function accountFromUser(user: User, profile?: ProfileRow | null): AuthAccount {
  return {
    id: user.id,
    name: displayName(user, profile),
    email: (profile?.email || user.email || "").toLowerCase(),
    providers: providersFor(user),
    verified: Boolean(user.email_confirmed_at),
    onboarded: profile?.onboarded ?? false,
  };
}

async function accountWithProfile(user: User) {
  const supabase = getSupabaseClient();
  const { data, error } = await supabase
    .from("profiles")
    .select("name,email,onboarded")
    .eq("id", user.id)
    .maybeSingle<ProfileRow>();
  if (error) throw error;
  return accountFromUser(user, data);
}

export const authService = {
  configured: supabaseConfigured,

  async signUp(name: string, email: string, password: string): Promise<SignUpResult> {
    const supabase = getSupabaseClient();
    const { data, error } = await supabase.auth.signUp({
      email: email.trim().toLowerCase(),
      password,
      options: { data: { name: name.trim(), full_name: name.trim() } },
    });
    if (error) throw error;
    if (!data.session || !data.user) {
      return { account: null, needsEmailConfirmation: true };
    }
    return { account: await accountWithProfile(data.user), needsEmailConfirmation: false };
  },

  async login(email: string, password: string) {
    const supabase = getSupabaseClient();
    const { data, error } = await supabase.auth.signInWithPassword({
      email: email.trim().toLowerCase(),
      password,
    });
    if (error) throw error;
    return accountWithProfile(data.user);
  },

  async signInWithGoogle(identity: GoogleIdentityCredential) {
    const supabase = getSupabaseClient();
    const { data, error } = await supabase.auth.signInWithIdToken({
      provider: "google",
      token: identity.credential,
      nonce: identity.nonce,
    });
    if (error) throw error;
    const account = await accountWithProfile(data.user);
    return { account, isNew: !account.onboarded };
  },

  async logout() {
    if (!supabaseConfigured()) return;
    const { error } = await getSupabaseClient().auth.signOut();
    if (error) throw error;
  },

  async current() {
    if (!supabaseConfigured()) return null;
    const { data, error } = await getSupabaseClient().auth.getUser();
    if (error || !data.user) return null;
    return accountWithProfile(data.user);
  },

  async resetPassword(email: string) {
    const { error } = await getSupabaseClient().auth.resetPasswordForEmail(email.trim().toLowerCase());
    if (error) throw error;
  },

  async updatePassword(password: string) {
    const { error } = await getSupabaseClient().auth.updateUser({ password });
    if (error) throw error;
  },

  onRecovery(callback: () => void) {
    if (!supabaseConfigured()) return () => undefined;
    const { data } = getSupabaseClient().auth.onAuthStateChange((event: AuthChangeEvent) => {
      if (event === "PASSWORD_RECOVERY") callback();
    });
    return () => data.subscription.unsubscribe();
  },

  async updateProfile(id: string, values: Partial<Profile>) {
    const payload: Record<string, unknown> = {};
    if (values.name !== undefined) payload.name = values.name;
    if (values.email !== undefined) payload.email = values.email;
    if (values.initials !== undefined) payload.initials = values.initials;
    if (values.field !== undefined) payload.field = values.field;
    if (values.focusWindow !== undefined) payload.focus_window = values.focusWindow;
    if (values.learningMethods !== undefined) payload.learning_methods = values.learningMethods;
    if (values.obstacles !== undefined) payload.obstacles = values.obstacles;
    if (values.onboarded !== undefined) payload.onboarded = values.onboarded;
    if (!Object.keys(payload).length) return;
    const { error } = await getSupabaseClient().from("profiles").update(payload).eq("id", id);
    if (error) throw error;
  },
};
