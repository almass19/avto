export type PriceVerdict = "below_market" | "fair" | "above_market" | "unknown";

export type PriceComparison = {
  verdict: PriceVerdict;
  /** Rounded % difference from market average; negative = cheaper. */
  deltaPercent: number | null;
};

const FAIR_BAND_PERCENT = 5;

export function comparePrice(
  priceKzt: number | null,
  avgPriceKzt: number | null,
): PriceComparison {
  if (!priceKzt || !avgPriceKzt) return { verdict: "unknown", deltaPercent: null };

  const deltaPercent = Math.round(((priceKzt - avgPriceKzt) / avgPriceKzt) * 100);

  if (deltaPercent < -FAIR_BAND_PERCENT) return { verdict: "below_market", deltaPercent };
  if (deltaPercent > FAIR_BAND_PERCENT) return { verdict: "above_market", deltaPercent };
  return { verdict: "fair", deltaPercent };
}
