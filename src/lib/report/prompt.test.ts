import { expect, test } from "vitest";
import type { Listing } from "@/lib/kolesa/types";
import type { ModelCard } from "@/lib/model-card/schema";
import { buildUserPrompt } from "./prompt";

const LISTING: Listing = {
  id: 1,
  url: "https://kolesa.kz/a/show/1",
  title: "Toyota Camry 2019 г.",
  brand: "Toyota",
  model: "Camry",
  year: 2019,
  priceKzt: 14_000_000,
  avgPriceKzt: 14_500_000,
  photoCount: 12,
  publishedAt: null,
  imageUrl: null,
  params: { "Поколение": "2017 - 2021 XV70" },
};

const PRICE = { verdict: "fair", deltaPercent: -3 } as const;

const CARD: ModelCard = {
  weakPoints: [
    {
      title: "Стук рулевой рейки",
      details: "Стучит на неровностях.",
      mileage: "60–100 тыс. км",
      repairCostKzt: "≈150–250 тыс. ₸",
      severity: "medium",
    },
  ],
  strengths: ["Надёжный мотор A25A"],
  notes: "Ранние машины попали под отзыв.",
};

test("without a model card the prompt has no research section", () => {
  expect(buildUserPrompt(LISTING, PRICE, null)).not.toContain("Проверенные данные");
});

test("model card facts are passed to the report model", () => {
  const prompt = buildUserPrompt(LISTING, PRICE, null, CARD);

  expect(prompt).toContain("Проверенные данные");
  expect(prompt).toContain("Стук рулевой рейки");
  expect(prompt).toContain("60–100 тыс. км");
  expect(prompt).toContain("≈150–250 тыс. ₸");
  expect(prompt).toContain("Надёжный мотор A25A");
  expect(prompt).toContain("Ранние машины попали под отзыв.");
});
