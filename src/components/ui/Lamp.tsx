import type { Report } from "@/lib/report/schema";

type VerdictLevel = Report["verdict"]["level"];

export const VERDICT_STYLE = {
  go: { color: "text-go", label: "Можно ехать смотреть" },
  caution: { color: "text-caution", label: "Есть вопросы" },
  avoid: { color: "text-avoid", label: "Лучше пропустить" },
} as const satisfies Record<VerdictLevel, { color: string; label: string }>;

type LampProps = { level: VerdictLevel; size?: "sm" | "md"; animated?: boolean };

/** Dashboard-style indicator light for a verdict level. */
export function Lamp({ level, size = "md", animated = true }: LampProps) {
  const dimensions = size === "sm" ? "h-2.5 w-2.5" : "h-4 w-4";
  return (
    <span
      aria-hidden
      className={`lamp inline-block shrink-0 rounded-full bg-current ${dimensions} ${VERDICT_STYLE[level].color} ${animated ? "" : "[animation:none]"}`}
    />
  );
}
