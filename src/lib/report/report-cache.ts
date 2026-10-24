import { createHash } from "node:crypto";
import { getSupabase } from "@/lib/supabase/server-client";
import type { ReportResult } from "./generate-report";
import { reportSchema } from "./schema";

// Price and description on Kolesa change, so a report goes stale after a day.
const CACHE_TTL_MS = 24 * 60 * 60 * 1000;

export function buildCacheKey(listingUrl: string, sellerText: string | null): string {
  const text = sellerText?.trim() ?? "";
  const textHash = text ? createHash("sha256").update(text).digest("hex").slice(0, 16) : "none";
  return `${listingUrl}#${textHash}`;
}

export function isFresh(createdAt: string, now = Date.now()): boolean {
  const created = Date.parse(createdAt);
  return Number.isFinite(created) && now - created < CACHE_TTL_MS;
}

function isReportResult(value: unknown): value is ReportResult {
  if (typeof value !== "object" || value === null) return false;
  const candidate = value as Record<string, unknown>;
  return (
    typeof candidate.listing === "object" &&
    typeof candidate.price === "object" &&
    reportSchema.safeParse(candidate.report).success
  );
}

/** Cache failures never block a report: they are logged and treated as a miss. */
export async function getCachedReport(cacheKey: string): Promise<ReportResult | null> {
  const supabase = getSupabase();
  if (!supabase) return null;

  const { data, error } = await supabase
    .from("report_cache")
    .select("result, created_at")
    .eq("cache_key", cacheKey)
    .maybeSingle();

  if (error) {
    console.error("[report-cache] read failed", error);
    return null;
  }
  if (!data || !isFresh(data.created_at) || !isReportResult(data.result)) return null;
  return data.result;
}

export async function saveCachedReport(
  cacheKey: string,
  listingUrl: string,
  result: ReportResult,
): Promise<void> {
  const supabase = getSupabase();
  if (!supabase) return;

  const { error } = await supabase.from("report_cache").upsert({
    cache_key: cacheKey,
    listing_url: listingUrl,
    result,
    created_at: new Date().toISOString(),
  });

  if (error) console.error("[report-cache] write failed", error);
}
