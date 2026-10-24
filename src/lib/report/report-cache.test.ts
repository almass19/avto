import { expect, test } from "vitest";
import { buildCacheKey, isFresh } from "./report-cache";

const URL_A = "https://kolesa.kz/a/show/123456";

test("same listing without seller text gives the same key", () => {
  expect(buildCacheKey(URL_A, null)).toBe(buildCacheKey(URL_A, "   "));
});

test("seller text changes the key, surrounding whitespace does not", () => {
  const plain = buildCacheKey(URL_A, null);
  const withText = buildCacheKey(URL_A, "Не бита, не крашена");

  expect(withText).not.toBe(plain);
  expect(buildCacheKey(URL_A, "  Не бита, не крашена\n")).toBe(withText);
});

test("different listings never share a key", () => {
  expect(buildCacheKey(URL_A, null)).not.toBe(buildCacheKey("https://kolesa.kz/a/show/654321", null));
});

test("cached report is fresh for 24 hours", () => {
  const createdAt = "2026-10-24T10:00:00.000Z";
  const created = Date.parse(createdAt);

  expect(isFresh(createdAt, created + 23 * 60 * 60 * 1000)).toBe(true);
  expect(isFresh(createdAt, created + 25 * 60 * 60 * 1000)).toBe(false);
  expect(isFresh("not a date", created)).toBe(false);
});
