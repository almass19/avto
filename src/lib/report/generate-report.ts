import Anthropic from "@anthropic-ai/sdk";
import { zodOutputFormat } from "@anthropic-ai/sdk/helpers/zod";
import type { Listing } from "@/lib/kolesa/types";
import { comparePrice, type PriceComparison } from "./price";
import { buildUserPrompt, SYSTEM_PROMPT } from "./prompt";
import { SAMPLE_REPORT } from "./sample-report";
import { reportSchema, type Report } from "./schema";

const DEFAULT_MODEL = "claude-sonnet-5-5";
const MAX_TOKENS = 6000;

export class ReportGenerationError extends Error {}

export type ReportResult = {
  listing: Listing;
  price: PriceComparison;
  report: Report;
};

let client: Anthropic | null = null;
function getClient(): Anthropic {
  if (!process.env.ANTHROPIC_API_KEY) {
    throw new Error("ANTHROPIC_API_KEY is not set");
  }
  client ??= new Anthropic();
  return client;
}

export async function generateReport(
  listing: Listing,
  sellerText: string | null,
): Promise<ReportResult> {
  const price = comparePrice(listing.priceKzt, listing.avgPriceKzt);

  if (process.env.MOCK_REPORT === "1") {
    return { listing, price, report: SAMPLE_REPORT };
  }

  const message = await getClient().messages.parse({
    model: process.env.ANTHROPIC_MODEL ?? DEFAULT_MODEL,
    max_tokens: MAX_TOKENS,
    system: SYSTEM_PROMPT,
    messages: [{ role: "user", content: buildUserPrompt(listing, price, sellerText) }],
    output_config: { format: zodOutputFormat(reportSchema) },
  });

  if (!message.parsed_output) {
    console.error("[report] empty parsed output", message.stop_reason, message.id);
    throw new ReportGenerationError("Не удалось составить отчёт. Попробуйте ещё раз.");
  }

  return { listing, price, report: message.parsed_output };
}
