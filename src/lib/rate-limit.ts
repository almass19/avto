import { getSupabase } from "@/lib/supabase/server-client";

const WINDOW_MS = 60 * 60 * 1000;
const MAX_REQUESTS_PER_WINDOW = 10;

const hits = new Map<string, readonly number[]>();

// Per server instance only: used when Supabase is not configured or unreachable.
export function isRateLimitedLocally(key: string, now = Date.now()): boolean {
  const recent = (hits.get(key) ?? []).filter((t) => now - t < WINDOW_MS);
  if (recent.length >= MAX_REQUESTS_PER_WINDOW) {
    hits.set(key, recent);
    return true;
  }
  hits.set(key, [...recent, now]);
  return false;
}

export async function isRateLimited(key: string): Promise<boolean> {
  const supabase = getSupabase();
  if (!supabase) return isRateLimitedLocally(key);

  const { data, error } = await supabase.rpc("check_rate_limit", {
    p_key: key,
    p_window_seconds: WINDOW_MS / 1000,
    p_max: MAX_REQUESTS_PER_WINDOW,
  });

  if (error || typeof data !== "boolean") {
    console.error("[rate-limit] shared limiter failed, using local fallback", error);
    return isRateLimitedLocally(key);
  }
  return data;
}
