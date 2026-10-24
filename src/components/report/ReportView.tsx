import type { ReactNode } from "react";
import type { CardSource } from "@/lib/model-card/schema";
import type { ReportResult } from "@/lib/report/generate-report";
import { InspectionChecklist } from "./InspectionChecklist";
import { PriceScale } from "./PriceScale";
import { VerdictBanner } from "./VerdictBanner";

const SEVERITY_BAR = {
  low: "border-line",
  medium: "border-caution",
  high: "border-avoid",
} as const;

const SEVERITY_LABEL = {
  low: "мелочь",
  medium: "стоит проверить",
  high: "серьёзно",
} as const;

function Section({ id, title, children }: { id: string; title: string; children: ReactNode }) {
  return (
    <section aria-labelledby={id} className="mt-12">
      <h2 id={id} className="font-display text-xl font-bold">
        {title}
      </h2>
      {children}
    </section>
  );
}

const MAX_SOURCE_LABEL = 40;

/** Short label: "drom.ru — Отзывы владельцев Toyota…" */
function sourceLabel(source: CardSource): string {
  let host = source.url;
  try {
    host = new URL(source.url).hostname.replace(/^www\./, "");
  } catch {
    // keep the raw url
  }
  const title = source.title.length > MAX_SOURCE_LABEL ? `${source.title.slice(0, MAX_SOURCE_LABEL)}…` : source.title;
  return title && title !== source.url ? `${host} — ${title}` : host;
}

type ReportViewProps = { result: ReportResult; onReset?: () => void };

export function ReportView({ result, onReset }: ReportViewProps) {
  const { listing, price, report } = result;
  // Cached results come from storage: only render real web links.
  const sources = (result.sources ?? []).filter((source) => /^https?:\/\//.test(source.url));
  const keyParams = ["Пробег", "Объем двигателя, л", "Коробка передач", "Привод", "Руль"]
    .map((key) => listing.params[key])
    .filter(Boolean);

  return (
    <article>
      {onReset && (
        <button
          type="button"
          onClick={onReset}
          className="mb-6 text-sm font-medium text-sky-deep underline decoration-sky/40 underline-offset-4 hover:decoration-sky"
        >
          Проверить другое объявление
        </button>
      )}

      <header>
        <h1 className="font-display text-3xl font-bold leading-tight sm:text-4xl">{listing.title}</h1>
        <p className="mt-2 text-asphalt-soft">{keyParams.join(", ")}</p>
        <a
          href={listing.url}
          target="_blank"
          rel="noopener noreferrer"
          className="mt-2 inline-block text-sm text-sky-deep underline underline-offset-4"
        >
          Открыть на Kolesa
        </a>
      </header>

      <div className="mt-8 grid gap-4">
        <VerdictBanner verdict={report.verdict} />
        <PriceScale listing={listing} price={price} advice={report.price} />
      </div>

      {report.redFlags.length > 0 && (
        <Section id="flags-heading" title="Что настораживает в объявлении">
          <ul className="mt-4 space-y-3">
            {report.redFlags.map((flag) => (
              <li key={flag.text} className={`border-l-4 bg-surface py-3 pl-4 pr-3 ${SEVERITY_BAR[flag.severity]}`}>
                {flag.text}
              </li>
            ))}
          </ul>
        </Section>
      )}

      <Section id="weak-heading" title="Слабые места модели">
        <ul className="mt-4 space-y-3">
          {report.weakPoints.map((point) => (
            <li key={point.title} className={`border-l-4 bg-surface p-4 ${SEVERITY_BAR[point.severity]}`}>
              <p className="flex flex-wrap items-baseline justify-between gap-2">
                <span className="font-medium">{point.title}</span>
                <span className="text-sm text-asphalt-soft">{SEVERITY_LABEL[point.severity]}</span>
              </p>
              <p className="mt-1 text-sm leading-relaxed text-asphalt-soft">{point.details}</p>
            </li>
          ))}
        </ul>
        {sources.length > 0 && (
          <div className="mt-4 text-sm text-asphalt-soft">
            <p>По отзывам владельцев и обзорам:</p>
            <ul className="mt-1 flex flex-wrap gap-x-4 gap-y-1">
              {sources.map((source) => (
                <li key={source.url}>
                  <a
                    href={source.url}
                    target="_blank"
                    rel="noopener noreferrer nofollow"
                    className="text-sky-deep underline decoration-sky/40 underline-offset-4 hover:decoration-sky"
                  >
                    {sourceLabel(source)}
                  </a>
                </li>
              ))}
            </ul>
          </div>
        )}
      </Section>

      <Section id="checklist-heading" title="Чек-лист для осмотра">
        <InspectionChecklist items={report.inspectionChecklist} />
      </Section>

      <Section id="questions-heading" title="Спросите продавца до встречи">
        <ol className="mt-4 list-decimal space-y-2 pl-6 marker:font-display marker:text-sky-deep">
          {report.sellerQuestions.map((question) => (
            <li key={question} className="pl-1 leading-relaxed">
              {question}
            </li>
          ))}
        </ol>
      </Section>

      <Section id="costs-heading" title="Во что обойдётся владение">
        <p className="mt-4 leading-relaxed">{report.ownershipNotes}</p>
      </Section>
    </article>
  );
}
