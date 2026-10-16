import type { Report } from "@/lib/report/schema";
import { Lamp, VERDICT_STYLE } from "@/components/ui/Lamp";

export function VerdictBanner({ verdict }: { verdict: Report["verdict"] }) {
  const style = VERDICT_STYLE[verdict.level];

  return (
    <section
      aria-labelledby="verdict-heading"
      className="rounded-2xl bg-asphalt p-6 text-white sm:p-8"
    >
      <div className="flex items-center gap-3">
        <Lamp level={verdict.level} />
        <span className={`font-display text-sm font-medium ${style.color}`}>{style.label}</span>
      </div>
      <h2
        id="verdict-heading"
        className="mt-4 font-display text-2xl font-bold leading-tight sm:text-3xl"
      >
        {verdict.headline}
      </h2>
      <p className="mt-3 max-w-2xl leading-relaxed text-white/75">{verdict.summary}</p>
    </section>
  );
}
