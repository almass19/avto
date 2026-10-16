import type { Listing } from "@/lib/kolesa/types";
import type { PriceComparison } from "@/lib/report/price";
import type { Report } from "@/lib/report/schema";

const SCALE_RANGE_PERCENT = 30;
const FAIR_BAND_PERCENT = 5;

const VERDICT_TEXT = {
  below_market: "Дешевле рынка",
  fair: "В рынке",
  above_market: "Дороже рынка",
  unknown: "Не с чем сравнить",
} as const;

function toScalePosition(deltaPercent: number): number {
  const clamped = Math.max(-SCALE_RANGE_PERCENT, Math.min(SCALE_RANGE_PERCENT, deltaPercent));
  return ((clamped + SCALE_RANGE_PERCENT) / (SCALE_RANGE_PERCENT * 2)) * 100;
}

const formatKzt = (value: number) => `${value.toLocaleString("ru-RU")} ₸`;

type PriceScaleProps = {
  listing: Listing;
  price: PriceComparison;
  advice: Report["price"];
};

export function PriceScale({ listing, price, advice }: PriceScaleProps) {
  const hasScale = price.deltaPercent !== null && listing.avgPriceKzt;
  const bandWidth = (FAIR_BAND_PERCENT * 2 * 100) / (SCALE_RANGE_PERCENT * 2);

  return (
    <section aria-labelledby="price-heading" className="rounded-2xl border border-line bg-surface p-6 sm:p-8">
      <div className="flex flex-wrap items-baseline justify-between gap-x-6 gap-y-2">
        <h2 id="price-heading" className="font-display text-xl font-bold">
          {VERDICT_TEXT[price.verdict]}
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

      {hasScale && (
        <figure className="mt-8" aria-label={`Цена объявления относительно средней по Kolesa: ${price.deltaPercent}%`}>
          <div className="relative h-3 rounded-full bg-linear-to-r from-go/25 via-road to-avoid/25">
            <div
              className="absolute inset-y-0 rounded-full bg-go/30"
              style={{ left: `${50 - bandWidth / 2}%`, width: `${bandWidth}%` }}
            />
            <div className="absolute inset-y-[-6px] left-1/2 w-px bg-asphalt-soft" />
            <div
              className="absolute top-1/2 h-6 w-6 -translate-x-1/2 -translate-y-1/2 rounded-full border-4 border-surface bg-asphalt shadow-md"
              style={{ left: `${toScalePosition(price.deltaPercent!)}%` }}
            />
          </div>
          <figcaption className="mt-3 flex justify-between text-sm text-asphalt-soft">
            <span>−{SCALE_RANGE_PERCENT}%</span>
            <span>средняя {formatKzt(listing.avgPriceKzt!)}</span>
            <span>+{SCALE_RANGE_PERCENT}%</span>
          </figcaption>
        </figure>
      )}

      <p className="mt-6 leading-relaxed">{advice.comment}</p>
      <p className="mt-4 border-l-4 border-sky pl-4 leading-relaxed">
        <span className="font-medium">Как торговаться: </span>
        {advice.negotiationTip}
      </p>
    </section>
  );
}
