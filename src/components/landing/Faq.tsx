import { SITE } from "@/lib/site-config";

const QUESTIONS = [
  {
    q: "Откуда берутся данные?",
    a: "Характеристики и цену мы берём из самого объявления на Kolesa, а среднюю цену — из данных Kolesa по похожим машинам. Разбор модели составляет AI, обученный на огромном объёме информации об автомобилях, с поправкой на условия Казахстана.",
  },
  {
    q: "Чем это отличается от проверки по VIN?",
    a: "Проверка по VIN показывает историю по документам: владельцы, залог, ДТП, штрафы. Мы разбираем техническую и денежную сторону: справедлива ли цена, что сломается и что проверить. Одно не заменяет другое — их лучше использовать вместе.",
  },
  {
    q: "Насколько точен разбор?",
    a: "Цена сравнивается с реальными данными рынка. Болячки модели — это типичные проблемы, о которых знают мастера и владельцы, но конкретная машина может быть в лучшем или худшем состоянии. Поэтому в отчёте всегда есть чек-лист и вопросы, которые помогут проверить её вживую.",
  },
  {
    q: "Какие объявления можно проверить?",
    a: "Сейчас — любые объявления о продаже легковых машин на Kolesa.kz. Поддержку Mycar.kz и OLX добавим позже.",
  },
  {
    q: `${SITE.name} заменяет осмотр на СТО?`,
    a: "Нет. Разбор помогает отсеять неудачные варианты и подготовиться к осмотру. Машину, которую решили покупать, обязательно покажите мастеру.",
  },
];

export function Faq() {
  return (
    <section id="faq" aria-labelledby="faq-heading" className="mx-auto w-full max-w-3xl scroll-mt-4 px-4 py-20 sm:px-6 lg:py-28">
      <h2 id="faq-heading" className="font-display text-3xl font-bold sm:text-4xl">
        Вопросы
      </h2>
      <div className="mt-10 divide-y divide-line border-y border-line">
        {QUESTIONS.map(({ q, a }) => (
          <details key={q} className="group">
            <summary className="flex cursor-pointer list-none items-center justify-between gap-6 py-5 font-display font-medium [&::-webkit-details-marker]:hidden">
              {q}
              <span
                aria-hidden
                className="text-2xl font-normal leading-none text-sky-deep transition-transform duration-[var(--duration-normal)] group-open:rotate-45"
              >
                +
              </span>
            </summary>
            <p className="pb-6 leading-relaxed text-asphalt-soft">{a}</p>
          </details>
        ))}
      </div>
    </section>
  );
}

export function SiteFooter() {
  return (
    <footer className="border-t border-line">
      <div className="mx-auto flex w-full max-w-6xl flex-col gap-3 px-4 py-10 text-sm text-asphalt-soft sm:px-6 md:flex-row md:justify-between">
        <p className="font-display font-bold text-asphalt">{SITE.name.toLowerCase()}</p>
        <p className="max-w-xl">
          Разбор составляет AI по данным объявления. Это подсказка перед осмотром, а не
          диагностика. Сервис не связан с Kolesa.kz.
        </p>
      </div>
    </footer>
  );
}
