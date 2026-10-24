import { zodOutputFormat } from "@anthropic-ai/sdk/helpers/zod";
import { getAnthropic, logUsage } from "@/lib/anthropic";
import type { Listing } from "@/lib/kolesa/types";
import type { StoredCard } from "@/lib/model-card";
import type { CardSource } from "@/lib/model-card/schema";
import { comparePrice, type PriceComparison } from "./price";
import { buildUserPrompt, SYSTEM_PROMPT } from "./prompt";
import { SAMPLE_REPORT } from "./sample-report";
import { reportSchema, type Report } from "./schema";

const DEFAULT_MODEL = "claude-sonnet-5-5";
// Russian JSON is token-heavy: a full report runs past 6k tokens and got cut off.
const MAX_TOKENS = 16000;

export class ReportGenerationError extends Error {}

export type ReportResult = {
  listing: Listing;
  price: PriceComparison;
  report: Report;
  /** Where the weak points come from; absent in reports cached before model cards existed. */
  sources?: CardSource[];
};

export async function generateReport(
  listing: Listing,
  sellerText: string | null,
  modelCard: StoredCard | null = null,
): Promise<ReportResult> {
  const price = comparePrice(listing.priceKzt, listing.avgPriceKzt);

  if (process.env.MOCK_REPORT === "1") {
    return { listing, price, report: SAMPLE_REPORT };
  }

  let message;
  try {
    message = await getAnthropic().messages.parse({
      model: process.env.ANTHROPIC_MODEL ?? DEFAULT_MODEL,
      max_tokens: MAX_TOKENS,
      system: SYSTEM_PROMPT,
      messages: [
        { role: "user", content: buildUserPrompt(listing, price, sellerText, modelCard?.card ?? null) },
      ],
      // Low effort: the facts are in the prompt, the job is writing them up. Keeps the report fast and cheap.
      output_config: { format: zodOutputFormat(reportSchema), effort: "low" },
    });
  } catch (error) {
    // The SDK throws when the JSON is cut off (max_tokens) or invalid.
    console.error("[report] structured output failed", error);
    throw new ReportGenerationError("Не удалось составить отчёт. Попробуйте ещё раз.");
  }

  logUsage("report", message.usage);

  if (!message.parsed_output) {
    console.error("[report] empty parsed output", message.stop_reason, message.id);
    throw new ReportGenerationError("Не удалось составить отчёт. Попробуйте ещё раз.");
  }

  return { listing, price, report: message.parsed_output, sources: modelCard?.sources ?? [] };
}
