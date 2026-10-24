import { createClient, type SupabaseClient } from "@supabase/supabase-js";

let client: SupabaseClient | null | undefined;

/**
 * Server-side client with the secret key. Returns null when Supabase is not
 * configured (local dev), so callers can fall back to in-memory behaviour.
 * Never import this from client components: the secret key bypasses RLS.
 */
export function getSupabase(): SupabaseClient | null {
  if (client !== undefined) return client;

  const url = process.env.SUPABASE_URL;
  const secretKey = process.env.SUPABASE_SECRET_KEY;
  if (!url || !secretKey) {
    console.warn("[supabase] SUPABASE_URL / SUPABASE_SECRET_KEY not set, running without database");
    client = null;
    return client;
  }

  client = createClient(url, secretKey, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
  return client;
}
