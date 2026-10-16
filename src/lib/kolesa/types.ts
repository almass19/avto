export type Listing = {
  id: number;
  url: string;
  title: string;
  brand: string;
  model: string;
  year: number | null;
  priceKzt: number | null;
  /** Kolesa's own market average for similar cars, when available. */
  avgPriceKzt: number | null;
  photoCount: number;
  publishedAt: string | null;
  imageUrl: string | null;
  /** Raw parameters table: "Пробег" → "260 000 км", etc. */
  params: Record<string, string>;
};
