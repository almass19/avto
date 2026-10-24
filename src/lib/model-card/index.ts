import type { Listing } from "@/lib/kolesa/types";
import { buildCardKey, describeVehicle } from "./card-key";
import { researchModelCard } from "./research";
import { claimResearch, findCard, markFailed, saveCard, type StoredCard } from "./store";

export type { StoredCard } from "./store";

export async function findModelCard(listing: Listing): Promise<StoredCard | null> {
  const cardKey = buildCardKey(listing);
  return cardKey ? findCard(cardKey) : null;
}

/**
 * Researches the car's weak points once and stores them, so later reports
 * for the same generation/engine/gearbox use sourced facts. Never throws.
 */
export async function ensureModelCard(listing: Listing): Promise<void> {
  const cardKey = buildCardKey(listing);
  const vehicle = describeVehicle(listing);
  if (!cardKey || !vehicle) return;

  if (!(await claimResearch(cardKey, vehicle))) return;

  try {
    const stored = await researchModelCard(vehicle);
    await saveCard(cardKey, stored);
    console.info("[model-card] researched", cardKey, `${stored.card.weakPoints.length} weak points`);
  } catch (error) {
    console.error("[model-card] research failed", cardKey, error);
    await markFailed(cardKey);
  }
}
