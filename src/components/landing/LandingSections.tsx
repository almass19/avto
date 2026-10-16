import Link from "next/link";
import { formatKzt, SITE } from "@/lib/site-config";

const VIN_CHECK = [
  "Владельцы и регионы учёта",
  "Залог и ограничения",
  "ДТП, оформленные полицией",
  "Штрафы и техосмотр",
];

const OUR_CHECK = [
  "Справедлива ли цена относительно рынка",
  "Болячки этой модели и цена их ремонта",
  "Что проверить на осмотре и тест-драйве",
  "О чём спросить продавца по телефону",
];

export function Positioning() {
  return (
    <section aria-labelledby="vin-heading" className="mx-auto w-full max-w-6xl px-4 pb-20 sm:px-6 lg:pb-28">
      <h2 id="vin-heading" className="max-w-2xl font-display text-3xl font-bold leading-tight sm:text-4xl">
        Проверка по VIN говорит, чистая ли машина. Мы — стоит ли она своих денег
      </h2>
      <div className="mt-10 grid gap-4 md:grid-cols-2">
        <div className="rounded-3xl border border-line p-6 sm:p-8">
          <h3 className="font-display text-lg font-bold text-asphalt-soft">Проверка по VIN в госбазах</h3>
          <ul className="mt-5 space-y-3">
            {VIN_CHECK.map((item) => (
              <li key={item} className="flex gap-3 text-asphalt-soft">
                <span aria-hidden className="mt-2.5 h-1.5 w-1.5 shrink-0 rounded-full bg-asphalt-soft/50" />
                {item}
              </li>
            ))}
          </ul>
        </div>
        <div className="rounded-3xl bg-asphalt p-6 text-white sm:p-8">
          <h3 className="font-display text-lg font-bold">Разбор объявления в {SITE.name}е</h3>
          <ul className="mt-5 space-y-3">
            {OUR_CHECK.map((item) => (
              <li key={item} className="flex gap-3">
                <span aria-hidden className="lamp mt-2 h-2 w-2 shrink-0 rounded-full bg-current text-go [animation:none]" />
                {item}
              </li>
            ))}
          </ul>
        </div>
      </div>
      <p className="mt-6 max-w-2xl leading-relaxed text-asphalt-soft">
        Лучше всего — вместе: разбором отсейте лишние варианты по ссылке, а VIN проверьте у той
        машины, которую решили покупать.
      </p>
    </section>
  );
}

const STEPS = [
  {
    title: "Скопируйте ссылку",
    text: "Откройте объявление на Kolesa.kz в браузере или приложении и нажмите «Поделиться».",
  },
  {
    title: "Подождите минуту",
    text: "Сравним цену с рынком и разберём модель, мотор и коробку именно этой машины.",
  },
  {
    title: "Езжайте на осмотр подготовленным",
    text: "С вопросами для продавца, чек-листом и пониманием, на чём торговаться.",
  },
];

export function HowItWorks() {
  return (
    <section id="how" aria-labelledby="how-heading" className="scroll-mt-4 bg-surface">
      <div className="mx-auto w-full max-w-6xl px-4 py-20 sm:px-6 lg:py-28">
        <h2 id="how-heading" className="font-display text-3xl font-bold sm:text-4xl">
          Как это работает
        </h2>
        <ol className="mt-12 grid gap-10 md:grid-cols-3 md:gap-8">
          {STEPS.map((step, index) => (
            <li key={step.title} className="border-t-2 border-asphalt pt-6">
              <span className="font-display text-5xl font-bold text-sky">{index + 1}</span>
              <h3 className="mt-4 font-display text-lg font-bold">{step.title}</h3>
              <p className="mt-2 leading-relaxed text-asphalt-soft">{step.text}</p>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}

export function PriceBlock() {
  return (
    <section aria-labelledby="price-block-heading" className="bg-sky text-white">
      <div className="mx-auto flex w-full max-w-6xl flex-col gap-8 px-4 py-16 sm:px-6 md:flex-row md:items-center md:justify-between lg:py-20">
        <div className="max-w-xl">
          <h2 id="price-block-heading" className="font-display text-3xl font-bold leading-tight sm:text-4xl">
            Разбор дешевле, чем бензин до продавца
          </h2>
          <p className="mt-4 text-lg leading-relaxed text-white/85">
            Обычная цена — {formatKzt(SITE.reportPriceKzt)} за объявление. Пока сервис в бета-версии,
            разборы бесплатные.
          </p>
        </div>
        <Link
          href="/#check"
          className="shrink-0 self-start rounded-2xl bg-asphalt px-7 py-4 font-display font-bold transition-transform duration-[var(--duration-fast)] hover:-translate-y-0.5 active:translate-y-0 md:self-auto"
        >
          Разобрать объявление
        </Link>
      </div>
    </section>
  );
}
