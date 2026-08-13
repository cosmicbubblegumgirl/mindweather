import type { AppState } from "@/lib/types";
import { hostedAccountAvailable, supabase } from "@/lib/supabase";

export const cloudStateService = {
  available: hostedAccountAvailable,

  async load(userId: string): Promise<AppState | null> {
    const { data, error } = await supabase()
      .from("user_app_state")
      .select("state")
      .eq("user_id", userId)
      .maybeSingle();
    if (error) throw error;
    return (data?.state as AppState | undefined) ?? null;
  },

  async save(userId: string, state: AppState) {
    const { error } = await supabase()
      .from("user_app_state")
      .upsert({ user_id: userId, state, updated_at: new Date().toISOString() }, { onConflict: "user_id" });
    if (error) throw error;
  },

  async clear(userId: string) {
    const { error } = await supabase().from("user_app_state").delete().eq("user_id", userId);
    if (error) throw error;
  },
};
