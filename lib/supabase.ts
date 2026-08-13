import { createClient, type SupabaseClient } from "@supabase/supabase-js";

const url = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "";

let client: SupabaseClient | undefined;

export function hostedAccountAvailable() {
  return Boolean(url && anonKey);
}

export function supabase() {
  if (!hostedAccountAvailable()) {
    throw new Error("Hosted accounts are not configured yet.");
  }
  client ??= createClient(url, anonKey, {
    auth: { persistSession: true, autoRefreshToken: true, detectSessionInUrl: true },
  });
  return client;
}
