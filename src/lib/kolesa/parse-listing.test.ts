import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, test } from "vitest";
import { normalizeKolesaUrl, parseListing } from "./parse-listing";

const fixtureHtml = readFileSync(
  join(__dirname, "__fixtures__", "kolesa-ad.html"),
  "utf8",
);

describe("normalizeKolesaUrl", () => {
  test("accepts a desktop ad link and strips query params", () => {
    expect(normalizeKolesaUrl("https://kolesa.kz/a/show/231907524?utm=x")).toBe(
      "https://kolesa.kz/a/show/231907524",
    );
  });

  test("accepts mobile host and missing protocol", () => {
    expect(normalizeKolesaUrl("m.kolesa.kz/a/show/231907524")).toBe(
      "https://kolesa.kz/a/show/231907524",
    );
  });

  test("returns null for other hosts", () => {
    expect(normalizeKolesaUrl("https://evil.com/a/show/231907524")).toBeNull();
    expect(normalizeKolesaUrl("https://kolesa.kz.evil.com/a/show/1")).toBeNull();
  });

  test("returns null for non-ad kolesa pages", () => {
    expect(normalizeKolesaUrl("https://kolesa.kz/cars/")).toBeNull();
  });

  test("returns null for garbage input", () => {
    expect(normalizeKolesaUrl("not a url at all")).toBeNull();
  });
});

describe("parseListing", () => {
  test("extracts core fields from digitalData", () => {
    const listing = parseListing(fixtureHtml);

    expect(listing.id).toBe(231907524);
    expect(listing.brand).toBe("Toyota");
    expect(listing.model).toBe("Estima");
    expect(listing.year).toBe(2008);
    expect(listing.priceKzt).toBe(5500000);
    expect(listing.avgPriceKzt).toBe(5729000);
    expect(listing.photoCount).toBe(14);
  });

  test("extracts the parameters table", () => {
    const { params } = parseListing(fixtureHtml);

    expect(params["Пробег"]).toBe("260 000 км");
    expect(params["Объем двигателя, л"]).toBe("3.5 (бензин)");
    expect(params["Коробка передач"]).toBe("Автомат");
    expect(params["Руль"]).toBe("Справа");
    expect(params["Город"]).toBe("Жанаозен, Мангистауская область");
  });

  test("throws a readable error when the page is not an ad", () => {
    expect(() => parseListing("<html><body>nope</body></html>")).toThrow(
      /объявлени/i,
    );
  });
});
