import Link from "next/link";
import type { ReactNode } from "react";
import { InspectionChecklist } from "@/components/report/InspectionChecklist";
import { PriceGauge } from "@/components/report/PriceGauge";
import { PRICE_VERDICT_TEXT } from "@/components/report/PriceScale";
import { SAMPLE_LISTING, SAMPLE_PRICE, SAMPLE_REPORT } from "@/lib/report/sample-report";

const SEVERITY_BAR = { low: "border-line", medium: "border-caution", high: "border-avoid" } as const;

type TileProps = {
  title: string;
  description: string;
  className?: string;
  children: ReactNode;
};

function Tile({ title, description, className = "", children }: TileProps) {
  return (
    <article className={`flex flex-col rounded-3xl bg-surface p-3 ${className}`}>
      <div className="flex-1 rounded-2xl bg-road/60 p-4 sm:p-5">{children}</div>
      <div className="px-3 pb-3 pt-5">
        <h3 className="font-display text-lg font-bold">{title}</h3>
        <p className="mt-1.5 leading-relaxed text-asphalt-soft">{description}</p>
      </div>
    </article>
  );
}

export function ReportShowcase() {
  const { weakPoints, sellerQuestions, inspectionChecklist, price } = SAMPLE_REPORT;

  return (
    <section id="inside" aria-labelledby="inside-heading" className="mx-auto w-full max-w-6xl scroll-mt-4 px-4 py-20 sm:px-6 lg:py-28">
      <div className="max-w-2xl">
        <h2 id="inside-heading" className="font-display text-3xl font-bold leading-tight sm:text-4xl">
          Что вы узнаете до встречи с продавцом
        </h2>
        <p className="mt-4 text-lg leading-relaxed text-asphalt-soft">
          Ниже — фрагменты настоящего разбора Toyota Estima 2008 года.{" "}
          <Link href="/primer" className="font-medium text-sky-deep underline underline-offset-4">
            Открыть отчёт целиком
          </Link>
        </p>
      </div>

      <div className="mt-12 grid gap-4 lg:grid-cols-6">
        <Tile
          className="lg:col-span-4"
          title="Слабые места именно этой модели"
          description="Что ломается у этого мотора и коробки, на каком пробеге и во сколько обойдётся ремонт. Плюс странности в самом объявлении."
        >
          <ul className="space-y-2.5">
            {weakPoints.slice(0, 3).map((point) => (
              <li key={point.title} className={`rounded-r-xl border-l-4 bg-surface px-4 py-3 ${SEVERITY_BAR[point.severity]}`}>
                <p className="font-medium">{point.title}</p>
                <p className="mt-0.5 text-sm text-asphalt-soft">{point.details}</p>
              </li>
            ))}
          </ul>
        </Tile>

        <Tile
          className="lg:col-span-2"
          title="Цена и торг"
          description="Сравним с рынком и подскажем, на чём сбивать цену."
        >
          <div className="rounded-xl bg-surface p-4">
            <p className="text-sm font-semibold">
              {PRICE_VERDICT_TEXT[SAMPLE_PRICE.verdict]}{" "}
              <span className="font-normal text-asphalt-soft">
                −{Math.abs(SAMPLE_PRICE.deltaPercent!)}% к рынку
              </span>
            </p>
            <div className="mt-4">
              <PriceGauge deltaPercent={SAMPLE_PRICE.deltaPercent!} avgPriceKzt={SAMPLE_LISTING.avgPriceKzt!} compact />
            </div>
          </div>
          <p className="mt-3 rounded-r-xl border-l-4 border-sky bg-surface px-4 py-3 text-sm leading-relaxed">
            {price.negotiationTip}
          </p>
        </Tile>

        <Tile
          className="lg:col-span-3"
          title="Чек-лист для осмотра"
          description="Открываете отчёт на телефоне и отмечаете пункты прямо у машины."
        >
          <div className="rounded-xl bg-surface px-4 pb-1 pt-2">
            <InspectionChecklist items={inspectionChecklist.slice(0, 2)} compact />
          </div>
        </Tile>

        <Tile
          className="lg:col-span-3"
          title="Вопросы продавцу"
          description="Задайте их по телефону — и половина вариантов отсеется без поездки."
        >
          <ol className="list-decimal space-y-2 rounded-xl bg-surface py-4 pl-9 pr-4 marker:font-display marker:text-sky-deep">
            {sellerQuestions.slice(0, 5).map((question) => (
              <li key={question} className="pl-1 text-sm leading-relaxed">{question}</li>
            ))}
          </ol>
        </Tile>
      </div>
    </section>
  );
}
