import { type Category, type Formality, type Warmth } from "@/lib/clothing";

export type RequiredCategory = "top" | "bottom" | "shoes";
export type OptionalCategory = "outerwear" | "accessory";
export type WeatherBand = "cold" | "mild" | "hot";

const REQUIRED_CATEGORIES: RequiredCategory[] = ["top", "bottom", "shoes"];
const NEUTRAL_COLORS = new Set(["black", "white", "gray", "grey", "navy", "beige", "cream"]);

export interface ClothingItem {
  id: string;
  user_id: string;
  name: string;
  brand: string | null;
  subtype: string | null;
  category: Category;
  colors: string[];
  material: string | null;
  warmth: Warmth;
  formality: Formality;
  notes: string | null;
  photo_path: string | null;
}

export interface OutfitRequest {
  occasion: string;
  vibe?: string;
  temperatureC?: number | null;
  weather?: string;
  constraints?: string;
}

export interface OutfitSuggestion {
  score: number;
  explanation: string;
  items: {
    top: ClothingItem;
    bottom: ClothingItem;
    shoes: ClothingItem;
    outerwear?: ClothingItem;
    accessory?: ClothingItem;
  };
}

export interface OutfitSuggestionResult {
  suggestions: OutfitSuggestion[];
  missingRequiredCategories: RequiredCategory[];
  constraintsApplied: string[];
  limitations: string;
}

interface ParsedConstraints {
  applied: string[];
  bannedTerms: string[];
  bannedShoeColors: string[];
  noHoodies: boolean;
  noSneakers: boolean;
  noJeans: boolean;
  noWhiteShoes: boolean;
}

function normalize(value: string | null | undefined) {
  return (value ?? "").trim().toLowerCase();
}

function getOccasionBucket(occasion: string): "interview" | "date" | "casual" {
  const normalized = normalize(occasion);

  if (normalized.includes("interview")) {
    return "interview";
  }

  if (normalized.includes("date")) {
    return "date";
  }

  return "casual";
}

export function parseWeatherBand(
  temperatureC: number | null | undefined,
  weather: string | null | undefined,
): WeatherBand | null {
  if (typeof temperatureC === "number" && Number.isFinite(temperatureC)) {
    if (temperatureC <= 12) {
      return "cold";
    }

    if (temperatureC >= 24) {
      return "hot";
    }

    return "mild";
  }

  const normalized = normalize(weather);

  if (!normalized) {
    return null;
  }

  if (["cold", "chilly", "winter"].some((word) => normalized.includes(word))) {
    return "cold";
  }

  if (["hot", "warm", "summer"].some((word) => normalized.includes(word))) {
    return "hot";
  }

  if (["mild", "cool"].some((word) => normalized.includes(word))) {
    return "mild";
  }

  return null;
}

export function parseConstraints(rawConstraints: string | null | undefined): ParsedConstraints {
  const text = normalize(rawConstraints);

  if (!text) {
    return {
      applied: [],
      bannedTerms: [],
      bannedShoeColors: [],
      noHoodies: false,
      noSneakers: false,
      noJeans: false,
      noWhiteShoes: false,
    };
  }

  const noHoodies = /\bno\s+hoodies?\b/.test(text);
  const noSneakers = /\bno\s+sneakers?\b/.test(text);
  const noJeans = /\bno\s+jeans?\b/.test(text);
  const noWhiteShoes = /\bno\s+white\s+shoes?\b/.test(text);

  const bannedShoeColors = Array.from(
    text.matchAll(/\bno\s+(black|white|gray|grey|navy|beige|cream|red|blue|green|yellow|orange|purple|pink|brown)\s+shoes?\b/g),
  ).map((match) => match[1]);

  const bannedTerms = Array.from(text.matchAll(/\bno\s+([a-z]{3,})\b/g))
    .map((match) => match[1])
    .filter((term) => !["white", "black", "gray", "grey", "navy", "beige", "cream", "shoes", "shoe"].includes(term));

  const applied: string[] = [];
  if (noHoodies) {
    applied.push("no hoodies");
  }
  if (noWhiteShoes) {
    applied.push("no white shoes");
  }
  if (noSneakers) {
    applied.push("no sneakers");
  }
  if (noJeans) {
    applied.push("no jeans");
  }

  return {
    applied,
    bannedTerms,
    bannedShoeColors,
    noHoodies,
    noSneakers,
    noJeans,
    noWhiteShoes,
  };
}

function includesText(item: ClothingItem, value: string) {
  const haystack = [
    item.name,
    item.brand ?? "",
    item.subtype ?? "",
    item.category,
    item.material ?? "",
    item.notes ?? "",
    item.colors.join(" "),
  ]
    .join(" ")
    .toLowerCase();

  return haystack.includes(value.toLowerCase());
}

function matchesConstraints(item: ClothingItem, constraints: ParsedConstraints) {
  if (constraints.noHoodies && includesText(item, "hoodie")) {
    return false;
  }

  if (constraints.noSneakers && item.category === "shoes" && includesText(item, "sneaker")) {
    return false;
  }

  if (constraints.noJeans && (includesText(item, "jean") || includesText(item, "denim"))) {
    return false;
  }

  if (
    constraints.noWhiteShoes
    && item.category === "shoes"
    && item.colors.some((color) => normalize(color) === "white")
  ) {
    return false;
  }

  if (
    item.category === "shoes"
    && constraints.bannedShoeColors.some((banned) => item.colors.some((color) => normalize(color) === banned))
  ) {
    return false;
  }

  if (constraints.bannedTerms.some((term) => includesText(item, term))) {
    return false;
  }

  return true;
}

function formalityScore(formality: Formality, occasion: "interview" | "date" | "casual") {
  if (occasion === "interview") {
    if (formality === "business") {
      return 6;
    }

    if (formality === "smart") {
      return 3;
    }

    return -4;
  }

  if (occasion === "date") {
    if (formality === "smart") {
      return 5;
    }

    if (formality === "casual") {
      return 3;
    }

    return 2;
  }

  if (formality === "casual") {
    return 5;
  }

  if (formality === "smart") {
    return 2;
  }

  return -2;
}

function warmthScore(warmth: Warmth, weather: WeatherBand | null) {
  if (!weather) {
    return 0;
  }

  if (weather === "cold") {
    if (warmth === "heavy") {
      return 3;
    }

    if (warmth === "medium") {
      return 1;
    }

    return -2;
  }

  if (weather === "mild") {
    if (warmth === "medium") {
      return 3;
    }

    if (warmth === "light") {
      return 1;
    }

    return 1;
  }

  if (warmth === "light") {
    return 3;
  }

  if (warmth === "medium") {
    return 1;
  }

  return -3;
}

function dominantColor(item: ClothingItem) {
  return normalize(item.colors[0]);
}

function colorPairScore(a: ClothingItem, b: ClothingItem) {
  const colorA = dominantColor(a);
  const colorB = dominantColor(b);

  if (!colorA || !colorB) {
    return 0;
  }

  if (NEUTRAL_COLORS.has(colorA) || NEUTRAL_COLORS.has(colorB)) {
    return 2;
  }

  if (colorA === colorB) {
    return 1;
  }

  return -2;
}

function colorScore(top: ClothingItem, bottom: ClothingItem, shoes: ClothingItem) {
  return colorPairScore(top, bottom) + colorPairScore(top, shoes) + colorPairScore(bottom, shoes);
}

function optionalOuterwearBonus(
  item: ClothingItem,
  occasion: "interview" | "date" | "casual",
  weather: WeatherBand | null,
) {
  let score = formalityScore(item.formality, occasion) / 2;

  if (weather === "cold") {
    score += item.warmth === "heavy" ? 4 : item.warmth === "medium" ? 2 : 1;
  } else if (weather === "mild") {
    score += item.warmth === "medium" ? 2 : item.warmth === "light" ? 1 : 0;
  } else if (weather === "hot") {
    score += item.warmth === "heavy" ? -5 : item.warmth === "medium" ? -2 : -1;
  }

  return score;
}

function optionalAccessoryBonus(item: ClothingItem, occasion: "interview" | "date" | "casual") {
  let score = formalityScore(item.formality, occasion) / 2;

  if (occasion === "casual" && item.formality === "casual") {
    score += 1;
  }

  return score;
}

function explanationFor(
  top: ClothingItem,
  bottom: ClothingItem,
  shoes: ClothingItem,
  occasion: "interview" | "date" | "casual",
  weather: WeatherBand | null,
  hasOuterwear: boolean,
  constraintsApplied: string[],
) {
  const parts: string[] = [];

  parts.push(`Built around ${top.name}, ${bottom.name}, and ${shoes.name}`);

  if (occasion === "interview") {
    parts.push("to keep the look business-leaning for interview settings");
  } else if (occasion === "date") {
    parts.push("to balance smart and approachable pieces for a date");
  } else {
    parts.push("to keep things casual and easy to wear");
  }

  if (weather === "cold") {
    parts.push(hasOuterwear ? "with added outerwear for cold weather" : "using warmer pieces for cold weather");
  } else if (weather === "mild") {
    parts.push("with medium warmth for mild weather");
  } else if (weather === "hot") {
    parts.push("with lighter pieces for hot weather");
  }

  if (constraintsApplied.length > 0) {
    parts.push("while respecting your constraints");
  }

  return `${parts.join(" ")}.`;
}

function byCategory(items: ClothingItem[], category: RequiredCategory | OptionalCategory) {
  return items.filter((item) => item.category === category);
}

function missingRequiredCategories(items: ClothingItem[]): RequiredCategory[] {
  return REQUIRED_CATEGORIES.filter((category) => !items.some((item) => item.category === category));
}

export function suggestOutfits(items: ClothingItem[], request: OutfitRequest): OutfitSuggestionResult {
  const constraints = parseConstraints(request.constraints);
  const occasion = getOccasionBucket(request.occasion);
  const weather = parseWeatherBand(request.temperatureC, request.weather);
  const filtered = items.filter((item) => matchesConstraints(item, constraints));

  const missing = missingRequiredCategories(filtered);
  if (missing.length > 0) {
    return {
      suggestions: [],
      missingRequiredCategories: missing,
      constraintsApplied: constraints.applied,
      limitations:
        "Constraint parsing is keyword-based for now (hoodies, sneakers, jeans, and simple shoe-color exclusions).",
    };
  }

  const tops = byCategory(filtered, "top");
  const bottoms = byCategory(filtered, "bottom");
  const shoes = byCategory(filtered, "shoes");
  const outerwear = byCategory(filtered, "outerwear");
  const accessories = byCategory(filtered, "accessory");

  const allSuggestions: OutfitSuggestion[] = [];

  for (const top of tops) {
    for (const bottom of bottoms) {
      for (const shoe of shoes) {
        const baseScore =
          formalityScore(top.formality, occasion)
          + formalityScore(bottom.formality, occasion)
          + formalityScore(shoe.formality, occasion)
          + warmthScore(top.warmth, weather)
          + warmthScore(bottom.warmth, weather)
          + warmthScore(shoe.warmth, weather)
          + colorScore(top, bottom, shoe);

        let score = baseScore;
        let chosenOuterwear: ClothingItem | undefined;
        let chosenAccessory: ClothingItem | undefined;

        if (outerwear.length > 0) {
          let bestOuterwear: { item: ClothingItem; bonus: number } | null = null;

          for (const candidate of outerwear) {
            const bonus =
              optionalOuterwearBonus(candidate, occasion, weather)
              + colorPairScore(candidate, top)
              + colorPairScore(candidate, bottom);

            if (!bestOuterwear || bonus > bestOuterwear.bonus) {
              bestOuterwear = { item: candidate, bonus };
            }
          }

          if (bestOuterwear && bestOuterwear.bonus > 1) {
            chosenOuterwear = bestOuterwear.item;
            score += bestOuterwear.bonus;
          }
        }

        if (accessories.length > 0) {
          let bestAccessory: { item: ClothingItem; bonus: number } | null = null;

          for (const candidate of accessories) {
            const bonus =
              optionalAccessoryBonus(candidate, occasion)
              + colorPairScore(candidate, top)
              + colorPairScore(candidate, shoe);

            if (!bestAccessory || bonus > bestAccessory.bonus) {
              bestAccessory = { item: candidate, bonus };
            }
          }

          if (bestAccessory && bestAccessory.bonus > 0) {
            chosenAccessory = bestAccessory.item;
            score += bestAccessory.bonus;
          }
        }

        allSuggestions.push({
          score,
          explanation: explanationFor(
            top,
            bottom,
            shoe,
            occasion,
            weather,
            Boolean(chosenOuterwear),
            constraints.applied,
          ),
          items: {
            top,
            bottom,
            shoes: shoe,
            outerwear: chosenOuterwear,
            accessory: chosenAccessory,
          },
        });
      }
    }
  }

  const topSuggestions = allSuggestions
    .sort((a, b) => {
      if (b.score !== a.score) {
        return b.score - a.score;
      }

      const aKey = `${a.items.top.id}-${a.items.bottom.id}-${a.items.shoes.id}`;
      const bKey = `${b.items.top.id}-${b.items.bottom.id}-${b.items.shoes.id}`;
      return aKey.localeCompare(bKey);
    })
    .slice(0, 3);

  return {
    suggestions: topSuggestions,
    missingRequiredCategories: [],
    constraintsApplied: constraints.applied,
    limitations:
      "Constraint parsing is keyword-based for now (hoodies, sneakers, jeans, and simple shoe-color exclusions).",
  };
}
