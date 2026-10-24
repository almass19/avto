import { after } from "next/server";
import { z } from "zod";
import { fetchListing } from "@/lib/kolesa/fetch-listing";
import { ListingParseError, normalizeKolesaUrl } from "@/lib/kolesa/parse-listing";
import { ensureModelCard, findModelCard } from "@/lib/model-card";
import { generateReport, ReportGenerationError } from "@/lib/report/generate-report";
import { isRateLimited } from "@/lib/rate-limit";
import { buildCacheKey, getCachedReport, saveCachedReport } from "@/lib/report/report-cache";

// Covers the report itself plus the background model-card research in after().
export const maxDuration = 300;

const MAX_SELLER_TEXT = 4000;

const bodySchema = z.object({
  url: z.string().min(1).max(500),
  sellerText: z.string().max(MAX_SELLER_TEXT).optional(),
});

function fail(status: number, error: string) {
  return Response.json({ ok: false, error }, { status });
}

export async function POST(request: Request) {
  const ip = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ?? "local";
  if (await isRateLimited(ip)) {
    return fail(429, "Слишком много проверок подряд. Попробуйте через час.");
  }

  const parsed = bodySchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) {
    return fail(400, "Вставьте ссылку на объявление.");
  }

  const canonicalUrl = normalizeKolesaUrl(parsed.data.url);
  if (!canonicalUrl) {
    return fail(400, "Нужна ссылка на объявление Kolesa.kz вида kolesa.kz/a/show/123456.");
  }

  const sellerText = parsed.data.sellerText ?? null;
  const cacheKey = buildCacheKey(canonicalUrl, sellerText);

  try {
    const cached = await getCachedReport(cacheKey);
    if (cached) return Response.json({ ok: true, data: cached });

    const listing = await fetchListing(canonicalUrl);
    const modelCard = await findModelCard(listing);
    const result = await generateReport(listing, sellerText, modelCard);

    if (process.env.MOCK_REPORT !== "1") {
      await saveCachedReport(cacheKey, canonicalUrl, result);
      // Research runs after the response, so the user never waits for it; the
      // claim inside makes it a cheap no-op when the card is already fresh.
      after(() => ensureModelCard(listing));
    }
    return Response.json({ ok: true, data: result });
  } catch (error) {
    if (error instanceof ListingParseError || error instanceof ReportGenerationError) {
      return fail(422, error.message);
    }
    console.error("[api/report] unexpected error", error);
    return fail(500, "Что-то пошло не так. Мы уже разбираемся — попробуйте позже.");
  }
}
