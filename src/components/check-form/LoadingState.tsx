"use client";

import { useEffect, useState } from "react";

const STEPS = [
  "Открываем объявление",
  "Сравниваем цену с рынком",
  "Вспоминаем болячки этой модели",
  "Собираем чек-лист для осмотра",
  "Формулируем вопросы продавцу",
];
const STEP_INTERVAL_MS = 7000;

export function LoadingState() {
  const [step, setStep] = useState(0);

  useEffect(() => {
    const timer = setInterval(
      () => setStep((current) => Math.min(current + 1, STEPS.length - 1)),
      STEP_INTERVAL_MS,
    );
    return () => clearInterval(timer);
  }, []);

  return (
    <section
      aria-live="polite"
      className="rounded-2xl border border-line bg-surface p-6"
    >
      <p className="font-display text-lg font-medium">Разбираем объявление — это около минуты</p>
      <ol className="mt-5 space-y-3">
        {STEPS.map((label, index) => {
          const isDone = index < step;
          const isActive = index === step;
          return (
            <li
              key={label}
              className={`flex items-center gap-3 ${isDone || isActive ? "text-asphalt" : "text-asphalt-soft/50"}`}
            >
              <span
                aria-hidden
                className={`h-2.5 w-2.5 shrink-0 rounded-full ${
                  isDone ? "bg-go" : isActive ? "animate-pulse bg-caution" : "bg-line"
                }`}
              />
              {label}
            </li>
          );
        })}
      </ol>
    </section>
  );
}
