import { expect, test } from "vitest";
import { isRateLimitedLocally as isRateLimited } from "./rate-limit";

test("allows 10 requests per hour per key, then blocks", () => {
  const now = 1_000_000;
  const results = Array.from({ length: 11 }, () => isRateLimited("ip-a", now));

  expect(results.slice(0, 10).every((limited) => !limited)).toBe(true);
  expect(results[10]).toBe(true);
});

test("unblocks after the window passes and keeps keys independent", () => {
  const now = 2_000_000;
  for (let i = 0; i < 10; i++) isRateLimited("ip-b", now);

  expect(isRateLimited("ip-b", now)).toBe(true);
  expect(isRateLimited("ip-c", now)).toBe(false);
  expect(isRateLimited("ip-b", now + 60 * 60 * 1000 + 1)).toBe(false);
});
