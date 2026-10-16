import { CheckFlow } from "@/components/check-form/CheckFlow";

export default function Home() {
  return (
    <main className="mx-auto w-full max-w-3xl px-4 pb-24 pt-10 sm:px-6 sm:pt-16">
      <CheckFlow />
      <footer className="mt-20 border-t border-line pt-6 text-sm text-asphalt-soft">
        Разбор составляет AI по данным объявления. Это подсказка перед осмотром, а не
        диагностика: машину всё равно стоит проверить на СТО.
      </footer>
    </main>
  );
}
