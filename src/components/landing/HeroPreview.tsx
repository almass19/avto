import type { CSSProperties } from "react";
import { PriceGauge } from "@/components/report/PriceGauge";
import { PRICE_VERDICT_TEXT } from "@/components/report/PriceScale";
import { Lamp, VERDICT_STYLE } from "@/components/ui/Lamp";
import { SAMPLE_LISTING, SAMPLE_PRICE, SAMPLE_REPORT } from "@/lib/report/sample-report";
import { formatKzt } from "@/lib/site-config";

/**
 * A miniature report that assembles itself on load: listing → verdict lamp → price.
 * Purely illustrative, so it is hidden from assistive tech.
 */
export function HeroPreview() {
  const { verdict } = SAMPLE_REPORT;
  const listing = SAMPLE_LISTING;

  return (
    <div aria-hidden className="relative mx-auto w-full max-w-md select-none">
      <div className="reveal rounded-2xl bg-surface p-4 text-asphalt shadow-xl sm:-rotate-2" style={{ "--delay": "100ms" } as CSSProperties}>
        <p className="truncate text-xs text-asphalt-soft">kolesa.kz/a/show/{listing.id}</p>
        <div className="mt-1 flex items-baseline justify-between gap-3">
          <p className="font-display font-bold">{listing.title}</p>
          <p className="shrink-0 whitespace-nowrap font-display text-sm font-bold tabular-nums">{formatKzt(listing.priceKzt!)}</p>
        </div>
        <p className="mt-1 text-sm text-asphalt-soft">
          {listing.params["Пробег"]}, {listing.params["Объем двигателя, л"]}, руль справа
        </p>
      </div>

      <div
        className="reveal relative z-10 -mt-2 ml-4 rounded-2xl border border-white/10 bg-[#283142] p-5 text-white shadow-2xl sm:ml-10"
        style={{ "--delay": "650ms" } as CSSProperties}
      >
        <div className="flex items-center gap-2.5">
          <Lamp level={verdict.level} size="sm" />
          <span className={`text-sm font-medium ${VERDICT_STYLE[verdict.level].color}`}>
            {VERDICT_STYLE[verdict.level].label}
          </span>
        </div>
        <p className="mt-3 font-display text-lg font-bold leading-snug">{verdict.headline}</p>
      </div>

      <div
        className="reveal relative z-20 mt-3 mr-2 rounded-2xl bg-surface p-4 text-asphalt shadow-xl sm:-mr-6 sm:rotate-[1.5deg]"
        style={{ "--delay": "1200ms" } as CSSProperties}
      >
        <p className="mb-4 text-sm font-semibold">
          {PRICE_VERDICT_TEXT[SAMPLE_PRICE.verdict]}{" "}
          <span className="font-normal text-asphalt-soft">−{Math.abs(SAMPLE_PRICE.deltaPercent!)}% к рынку</span>
        </p>
        <PriceGauge deltaPercent={SAMPLE_PRICE.deltaPercent!} avgPriceKzt={listing.avgPriceKzt!} compact />
      </div>
    </div>
  );
}
