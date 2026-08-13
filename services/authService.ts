import { hostedAccountAvailable, supabase } from "@/lib/supabase";

export const authService = {
  available: hostedAccountAvailable,
  async signUp(name: string, email: string, password: string) {
    const normalizedEmail = email.trim().toLowerCase();
    const { data, error } = await supabase().auth.signUp({
      email: normalizedEmail,
      password,
      options: { data: { name: name.trim() }, emailRedirectTo: `${window.location.origin}/login/` },
    });
    if (error) throw error;
    return { name: name.trim(), email: normalizedEmail, verified: Boolean(data.session) };
  },
  async login(email: string, password: string) {
    const { data, error } = await supabase().auth.signInWithPassword({ email: email.trim().toLowerCase(), password });
    if (error) throw error;
    return data.user;
  },
  async logout() {
    const { error } = await supabase().auth.signOut();
    if (error) throw error;
  },
  async session() {
    if (!hostedAccountAvailable()) return null;
    const { data } = await supabase().auth.getSession();
    return data.session;
  },
  async resetPassword(email: string) {
    const { error } = await supabase().auth.resetPasswordForEmail(email.trim().toLowerCase(), {
      redirectTo: `${window.location.origin}/forgot-password/auth/`,
    });
    if (error) throw error;
  },
  async updatePassword(password: string) {
    const { error } = await supabase().auth.updateUser({ password });
    if (error) throw error;
  },
};
