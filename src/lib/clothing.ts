export const CATEGORIES = [
  "top",
  "bottom",
  "shoes",
  "outerwear",
  "accessory",
] as const;

export const WARMTH_LEVELS = ["light", "medium", "heavy"] as const;

export const FORMALITY_LEVELS = ["casual", "smart", "business"] as const;

export type Category = (typeof CATEGORIES)[number];
export type Warmth = (typeof WARMTH_LEVELS)[number];
export type Formality = (typeof FORMALITY_LEVELS)[number];

export function isCategory(value: string): value is Category {
  return CATEGORIES.includes(value as Category);
}

export function isWarmth(value: string): value is Warmth {
  return WARMTH_LEVELS.includes(value as Warmth);
}

export function isFormality(value: string): value is Formality {
  return FORMALITY_LEVELS.includes(value as Formality);
}

export function parseColors(rawColors: string) {
  return rawColors
    .split(",")
    .map((value) => value.trim())
    .filter(Boolean);
}

export function sanitizeFilename(filename: string) {
  return filename.replace(/[^a-zA-Z0-9._-]/g, "_");
}
