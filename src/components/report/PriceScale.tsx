import type { Listing } from "@/lib/kolesa/types";
import type { PriceComparison } from "@/lib/report/price";
import type { Report } from "@/lib/report/schema";
import { formatKzt } from "@/lib/site-config";
import { PriceGauge } from "./PriceGauge";

export const PRICE_VERDICT_TEXT = {
  below_market: "Дешевле рынка",
  fair: "В рынке",
  above_market: "Дороже рынка",
  unknown: "Не с чем сравнить",
} as const;

type PriceScaleProps = {
  listing: Listing;
  price: PriceComparison;
  advice: Report["price"];
};

export function PriceScale({ listing, price, advice }: PriceScaleProps) {
  return (
    <section aria-labelledby="price-heading" className="rounded-2xl border border-line bg-surface p-6 sm:p-8">
      <div className="flex flex-wrap items-baseline justify-between gap-x-6 gap-y-2">
        <h2 id="price-heading" className="font-display text-xl font-bold">
          {PRICE_VERDICT_TEXT[price.verdict]}
          {price.deltaPercent !== null && price.deltaPercent !== 0 && (
            <span className="ml-2 font-sans text-base font-medium text-asphalt-soft">
              {price.deltaPercent > 0 ? "+" : "−"}
              {Math.abs(price.deltaPercent)}%
            </span>
          )}
        </h2>
        {listing.priceKzt && (
          <p className="font-display text-2xl font-bold tabular-nums">{formatKzt(listing.priceKzt)}</p>
        )}
      </div>

      {price.deltaPercent !== null && listing.avgPriceKzt && (
        <div className="mt-8">
          <PriceGauge deltaPercent={price.deltaPercent} avgPriceKzt={listing.avgPriceKzt} />
        </div>
      )}

      <p className="mt-6 leading-relaxed">{advice.comment}</p>
      <p className="mt-4 border-l-4 border-sky pl-4 leading-relaxed">
        <span className="font-medium">Как торговаться: </span>
        {advice.negotiationTip}
      </p>
    </section>
  );
}
