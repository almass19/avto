import { ListingParseError, parseListing } from "./parse-listing";
import type { Listing } from "./types";

const FETCH_TIMEOUT_MS = 10_000;

// Kolesa answers 418 to bare requests; a regular browser header set gets the page.
const BROWSER_HEADERS = {
  "User-Agent":
    "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/130.0.0.0 Safari/537.36",
  Accept: "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
  "Accept-Language": "ru-RU,ru;q=0.9",
  "Sec-Fetch-Mode": "navigate",
  "Sec-Fetch-Site": "none",
  "Sec-Fetch-Dest": "document",
  "Upgrade-Insecure-Requests": "1",
};

/** `canonicalUrl` must come from normalizeKolesaUrl — never pass raw user input here. */
export async function fetchListing(canonicalUrl: string): Promise<Listing> {
  let response: Response;
  try {
    response = await fetch(canonicalUrl, {
      headers: BROWSER_HEADERS,
      signal: AbortSignal.timeout(FETCH_TIMEOUT_MS),
      cache: "no-store",
    });
  } catch (error) {
    console.error("[kolesa] fetch failed", canonicalUrl, error);
    throw new ListingParseError("Kolesa не ответил. Попробуйте ещё раз через минуту.");
  }

  if (response.status === 404) {
    throw new ListingParseError("Объявление не найдено — возможно, его уже сняли.");
  }
  if (!response.ok) {
    console.error("[kolesa] unexpected status", response.status, canonicalUrl);
    throw new ListingParseError("Не получилось открыть объявление. Попробуйте ещё раз.");
  }

  return parseListing(await response.text());
}
