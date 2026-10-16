import * as cheerio from "cheerio";
import type { Listing } from "./types";

const ALLOWED_HOSTS = new Set(["kolesa.kz", "www.kolesa.kz", "m.kolesa.kz"]);
const AD_PATH = /^\/a\/show\/(\d+)\/?$/;
const YEAR_IN_TITLE = /\b(19\d{2}|20\d{2})\s*г/;

export class ListingParseError extends Error {}

/** Returns canonical https://kolesa.kz/a/show/<id> or null if the link is not a Kolesa ad. */
export function normalizeKolesaUrl(input: string): string | null {
  const trimmed = input.trim();
  const withProtocol = /^https?:\/\//i.test(trimmed) ? trimmed : `https://${trimmed}`;

  let url: URL;
  try {
    url = new URL(withProtocol);
  } catch {
    return null;
  }

  if (!ALLOWED_HOSTS.has(url.hostname.toLowerCase())) return null;

  const match = url.pathname.match(AD_PATH);
  return match ? `https://kolesa.kz/a/show/${match[1]}` : null;
}

/** Extracts a balanced JSON object literal that follows `marker` in the source. */
function extractJsonObject(source: string, marker: string): unknown | null {
  const markerIndex = source.indexOf(marker);
  if (markerIndex === -1) return null;

  const start = source.indexOf("{", markerIndex);
  if (start === -1) return null;

  let depth = 0;
  let inString = false;
  for (let i = start; i < source.length; i++) {
    const char = source[i];
    if (inString) {
      if (char === "\\") i++;
      else if (char === '"') inString = false;
      continue;
    }
    if (char === '"') inString = true;
    else if (char === "{") depth++;
    else if (char === "}" && --depth === 0) {
      try {
        return JSON.parse(source.slice(start, i + 1));
      } catch {
        return null;
      }
    }
  }
  return null;
}

type DigitalDataProduct = {
  id?: number;
  name?: string;
  unitPrice?: number;
  photoCount?: number;
  publicationDate?: string;
  attributes?: { brand?: string; model?: string; avgPrice?: number };
  seller?: { userTypeId?: number };
};

function readProduct(html: string): DigitalDataProduct | null {
  const data = extractJsonObject(html, "digitalData = ") as
    | { product?: DigitalDataProduct }
    | null;
  return data?.product?.id ? data.product : null;
}

function readParams($: cheerio.CheerioAPI): Record<string, string> {
  const entries = $(".offer__parameters dl")
    .toArray()
    .map((dl) => {
      const key = $(dl).find("dt").first().text().replace(/ /g, " ").trim();
      const value = $(dl).find("dd").first().text().replace(/\s+/g, " ").trim();
      return [key, value] as const;
    })
    .filter(([key, value]) => key && value);

  return Object.fromEntries(entries);
}

export function parseListing(html: string): Listing {
  const product = readProduct(html);
  if (!product || !product.attributes?.brand) {
    throw new ListingParseError(
      "Не удалось прочитать объявление. Проверьте, что ссылка ведёт на активное объявление Kolesa.",
    );
  }

  const $ = cheerio.load(html);
  const title = product.name ?? `${product.attributes.brand} ${product.attributes.model ?? ""}`;
  const yearMatch = title.match(YEAR_IN_TITLE);

  return {
    id: product.id!,
    url: `https://kolesa.kz/a/show/${product.id}`,
    title: title.trim(),
    brand: product.attributes.brand,
    model: product.attributes.model ?? "",
    year: yearMatch ? Number(yearMatch[1]) : null,
    priceKzt: product.unitPrice ?? null,
    avgPriceKzt: product.attributes.avgPrice ?? null,
    photoCount: product.photoCount ?? 0,
    publishedAt: product.publicationDate ?? null,
    imageUrl: $('meta[property="og:image"]').attr("content") ?? null,
    params: readParams($),
  };
}
