import { getSupabase } from "@/lib/supabase/server-client";
import type { VehicleDescriptor } from "./card-key";
import { modelCardSchema, type CardSource, type ModelCard } from "./schema";

export type StoredCard = { card: ModelCard; sources: CardSource[] };

function readSources(value: unknown): CardSource[] {
  if (!Array.isArray(value)) return [];
  return value.filter(
    (item): item is CardSource =>
      typeof item?.url === "string" && /^https?:\/\//.test(item.url) && typeof item?.title === "string",
  );
}

/**
 * Returns the stored card, or null on a miss or any database problem (logged).
 * A card being refreshed (or whose refresh failed) keeps serving its last version.
 */
export async function findCard(cardKey: string): Promise<StoredCard | null> {
  const supabase = getSupabase();
  if (!supabase) return null;

  const { data, error } = await supabase
    .from("model_cards")
    .select("card, sources")
    .eq("card_key", cardKey)
    .not("card", "is", null)
    .maybeSingle();

  if (error) {
    console.error("[model-card] read failed", error);
    return null;
  }
  const parsed = modelCardSchema.safeParse(data?.card);
  return parsed.success ? { card: parsed.data, sources: readSources(data?.sources) } : null;
}

/** True when this caller should run the research; false if someone else has it or the card is fresh. */
export async function claimResearch(cardKey: string, vehicle: VehicleDescriptor): Promise<boolean> {
  const supabase = getSupabase();
  if (!supabase) return false;

  const { data, error } = await supabase.rpc("claim_model_card_research", {
    p_key: cardKey,
    p_vehicle: vehicle,
  });
  if (error) {
    console.error("[model-card] claim failed", error);
    return false;
  }
  return data === true;
}

export async function saveCard(cardKey: string, stored: StoredCard): Promise<void> {
  const supabase = getSupabase();
  if (!supabase) return;

  const { error } = await supabase
    .from("model_cards")
    .update({ status: "ready", card: stored.card, sources: stored.sources, updated_at: new Date().toISOString() })
    .eq("card_key", cardKey);
  if (error) console.error("[model-card] save failed", cardKey, error);
}

export async function markFailed(cardKey: string): Promise<void> {
  const supabase = getSupabase();
  if (!supabase) return;

  const { error } = await supabase
    .from("model_cards")
    .update({ status: "failed", updated_at: new Date().toISOString() })
    .eq("card_key", cardKey);
  if (error) console.error("[model-card] mark failed failed", cardKey, error);
}
