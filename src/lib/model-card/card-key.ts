import type { Listing } from "@/lib/kolesa/types";

export type VehicleDescriptor = {
  brand: string;
  model: string;
  /** Kolesa's "Поколение", or the model year when Kolesa has none. */
  generation: string;
  engine: string | null;
  gearbox: string | null;
};

const normalize = (value: string): string => value.toLowerCase().replace(/\s+/g, " ").trim();

export function describeVehicle(listing: Listing): VehicleDescriptor | null {
  const generation = listing.params["Поколение"]?.trim() || (listing.year ? String(listing.year) : "");
  if (!listing.brand || !listing.model || !generation) return null;

  return {
    brand: listing.brand,
    model: listing.model,
    generation,
    engine: listing.params["Объем двигателя, л"]?.trim() || null,
    gearbox: listing.params["Коробка передач"]?.trim() || null,
  };
}

/** One card per brand + model + generation + engine + gearbox: year, mileage and city don't matter. */
export function buildCardKey(listing: Listing): string | null {
  const vehicle = describeVehicle(listing);
  if (!vehicle) return null;

  return [vehicle.brand, vehicle.model, vehicle.generation, vehicle.engine ?? "-", vehicle.gearbox ?? "-"]
    .map(normalize)
    .join("|");
}
