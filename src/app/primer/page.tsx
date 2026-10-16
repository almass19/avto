import type { Metadata } from "next";
import Link from "next/link";
import { SiteFooter } from "@/components/landing/Faq";
import { SiteHeader } from "@/components/landing/SiteHeader";
import { ReportView } from "@/components/report/ReportView";
import { SAMPLE_LISTING, SAMPLE_PRICE, SAMPLE_REPORT } from "@/lib/report/sample-report";

export const metadata: Metadata = {
  title: "Пример разбора объявления — Toyota Estima 2008",
  description: "Так выглядит разбор объявления с Kolesa: цена, болячки модели, чек-лист осмотра и вопросы продавцу.",
};

export default function SampleReportPage() {
  return (
    <>
      <SiteHeader />
      <main className="mx-auto w-full max-w-3xl px-4 pb-20 pt-6 sm:px-6">
        <p className="mb-6 rounded-2xl bg-surface px-5 py-4 text-asphalt-soft">
          Это пример разбора. Ваш отчёт будет выглядеть так же — только про вашу машину.
        </p>
        <ReportView result={{ listing: SAMPLE_LISTING, price: SAMPLE_PRICE, report: SAMPLE_REPORT }} />
        <Link
          href="/#check"
          className="mt-14 inline-block rounded-2xl bg-sky px-7 py-4 font-display font-bold text-white transition-colors duration-[var(--duration-fast)] hover:bg-sky-deep"
        >
          Разобрать своё объявление
        </Link>
      </main>
      <SiteFooter />
    </>
  );
}
