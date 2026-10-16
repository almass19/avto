export const SITE = {
  name: "Капот",
  /** Price shown on the landing; payments are not wired up yet. */
  reportPriceKzt: 1990,
} as const;

export const formatKzt = (value: number): string => `${value.toLocaleString("ru-RU")} ₸`;
