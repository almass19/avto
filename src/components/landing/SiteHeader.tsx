import Link from "next/link";
import { SITE } from "@/lib/site-config";

const NAV = [
  { href: "/primer", label: "Пример отчёта" },
  { href: "/#how", label: "Как это работает" },
  { href: "/#faq", label: "Вопросы" },
];

type SiteHeaderProps = { tone?: "dark" | "light" };

export function SiteHeader({ tone = "light" }: SiteHeaderProps) {
  const isDark = tone === "dark";
  const linkColor = isDark ? "text-white/70 hover:text-white" : "text-asphalt-soft hover:text-asphalt";

  return (
    <header className="mx-auto flex w-full max-w-6xl items-center justify-between gap-6 px-4 py-5 sm:px-6">
      <Link
        href="/"
        className={`flex items-center gap-2 font-display text-xl font-bold ${isDark ? "text-white" : "text-asphalt"}`}
      >
        <span aria-hidden className="lamp h-2.5 w-2.5 rounded-full bg-current text-go [animation:none]" />
        {SITE.name.toLowerCase()}
      </Link>

      <nav aria-label="Основная навигация" className="hidden items-center gap-7 md:flex">
        {NAV.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className={`text-sm font-medium transition-colors duration-[var(--duration-fast)] ${linkColor}`}
          >
            {item.label}
          </Link>
        ))}
      </nav>

      <Link
        href="/#check"
        className="rounded-full bg-sky px-4 py-2 text-sm font-semibold text-white transition-colors duration-[var(--duration-fast)] hover:bg-sky-deep"
      >
        Проверить авто
      </Link>
    </header>
  );
}
