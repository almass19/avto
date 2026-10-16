import { formatKzt } from "@/lib/site-config";

const SCALE_RANGE_PERCENT = 30;
const FAIR_BAND_PERCENT = 5;
const BAND_WIDTH = (FAIR_BAND_PERCENT * 2 * 100) / (SCALE_RANGE_PERCENT * 2);

function toScalePosition(deltaPercent: number): number {
  const clamped = Math.max(-SCALE_RANGE_PERCENT, Math.min(SCALE_RANGE_PERCENT, deltaPercent));
  return ((clamped + SCALE_RANGE_PERCENT) / (SCALE_RANGE_PERCENT * 2)) * 100;
}

type PriceGaugeProps = {
  deltaPercent: number;
  avgPriceKzt: number;
  compact?: boolean;
};

/** Horizontal scale: listing price vs Kolesa market average, ±30%. */
export function PriceGauge({ deltaPercent, avgPriceKzt, compact = false }: PriceGaugeProps) {
  return (
    <figure aria-label={`Цена относительно средней по Kolesa: ${deltaPercent}%`}>
      <div className={`relative rounded-full bg-linear-to-r from-go/25 via-road to-avoid/25 ${compact ? "h-2" : "h-3"}`}>
        <div
          className="absolute inset-y-0 rounded-full bg-go/30"
          style={{ left: `${50 - BAND_WIDTH / 2}%`, width: `${BAND_WIDTH}%` }}
        />
        <div className="absolute inset-y-[-6px] left-1/2 w-px bg-asphalt-soft" />
        <div
          className={`absolute top-1/2 -translate-x-1/2 -translate-y-1/2 rounded-full border-surface bg-asphalt shadow-md ${compact ? "h-4 w-4 border-[3px]" : "h-6 w-6 border-4"}`}
          style={{ left: `${toScalePosition(deltaPercent)}%` }}
        />
      </div>
      <figcaption className={`flex justify-between text-asphalt-soft ${compact ? "mt-2 text-xs" : "mt-3 text-sm"}`}>
        <span>−{SCALE_RANGE_PERCENT}%</span>
        <span>средняя {formatKzt(avgPriceKzt)}</span>
        <span>+{SCALE_RANGE_PERCENT}%</span>
      </figcaption>
    </figure>
  );
}
