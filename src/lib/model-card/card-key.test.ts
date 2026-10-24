import { expect, test } from "vitest";
import type { Listing } from "@/lib/kolesa/types";
import { buildCardKey, describeVehicle } from "./card-key";

function listing(params: Record<string, string>, year: number | null = 2019): Listing {
  return {
    id: 1,
    url: "https://kolesa.kz/a/show/1",
    title: "Toyota Camry",
    brand: "Toyota",
    model: "Camry",
    year,
    priceKzt: null,
    avgPriceKzt: null,
    photoCount: 0,
    publishedAt: null,
    imageUrl: null,
    params,
  };
}

const CAMRY_70 = {
  "Поколение": "2017 - 2021 XV70",
  "Объем двигателя, л": "2.5 (бензин)",
  "Коробка передач": "Автомат",
  "Пробег": "120 000 км",
  "Город": "Алматы",
};

test("same generation, engine and gearbox share a card regardless of year, mileage and city", () => {
  const other = { ...CAMRY_70, "Пробег": "40 000 км", "Город": "Астана" };

  expect(buildCardKey(listing(CAMRY_70, 2018))).toBe(buildCardKey(listing(other, 2020)));
});

test("key is case and whitespace insensitive", () => {
  const messy = { ...CAMRY_70, "Поколение": "2017  -  2021 xv70 ", "Коробка передач": "автомат" };

  expect(buildCardKey(listing(messy))).toBe(buildCardKey(listing(CAMRY_70)));
});

test("different engine or gearbox gets its own card", () => {
  const v6 = { ...CAMRY_70, "Объем двигателя, л": "3.5 (бензин)" };
  const manual = { ...CAMRY_70, "Коробка передач": "Механика" };

  expect(buildCardKey(listing(v6))).not.toBe(buildCardKey(listing(CAMRY_70)));
  expect(buildCardKey(listing(manual))).not.toBe(buildCardKey(listing(CAMRY_70)));
});

test("falls back to the year when Kolesa has no generation", () => {
  const noGeneration = Object.fromEntries(
    Object.entries(CAMRY_70).filter(([key]) => key !== "Поколение"),
  );

  expect(buildCardKey(listing(noGeneration, 2019))).toContain("2019");
  expect(buildCardKey(listing(noGeneration, 2019))).not.toBe(buildCardKey(listing(noGeneration, 2020)));
});

test("returns null when there is not enough to identify the car", () => {
  expect(buildCardKey(listing({}, null))).toBeNull();
  expect(buildCardKey({ ...listing(CAMRY_70), model: "" })).toBeNull();
});

test("describes the vehicle for research prompts", () => {
  expect(describeVehicle(listing(CAMRY_70))).toEqual({
    brand: "Toyota",
    model: "Camry",
    generation: "2017 - 2021 XV70",
    engine: "2.5 (бензин)",
    gearbox: "Автомат",
  });
});
