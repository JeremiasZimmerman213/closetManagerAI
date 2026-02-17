import fs from "node:fs";
import path from "node:path";

import { createClient } from "@supabase/supabase-js";

import { type Category, type Formality, type Warmth } from "../src/lib/clothing";

type SeedItem = {
  name: string;
  brand: string | null;
  subtype: string | null;
  category: Category;
  colors: string[];
  material: string | null;
  warmth: Warmth;
  formality: Formality;
  notes: string;
};

type ExistingItemRow = {
  name: string;
  category: Category;
  colors: string[];
  material: string | null;
  notes: string | null;
};

const DEFAULT_SEED_EMAIL = "test@example.com";
const DEFAULT_SEED_PASSWORD = "testpass";

function loadDotEnvLocal() {
  const filePath = path.resolve(process.cwd(), ".env.local");

  if (!fs.existsSync(filePath)) {
    throw new Error(".env.local was not found. Create it before running the seed script.");
  }

  const raw = fs.readFileSync(filePath, "utf8");

  for (const rawLine of raw.split(/\r?\n/)) {
    const line = rawLine.trim();

    if (!line || line.startsWith("#")) {
      continue;
    }

    const equalsIndex = line.indexOf("=");
    if (equalsIndex <= 0) {
      continue;
    }

    const key = line.slice(0, equalsIndex).trim();
    let value = line.slice(equalsIndex + 1).trim();

    if (
      (value.startsWith('"') && value.endsWith('"'))
      || (value.startsWith("'") && value.endsWith("'"))
    ) {
      value = value.slice(1, -1);
    }

    if (!process.env[key]) {
      process.env[key] = value;
    }
  }
}

function normalizeColors(colors: string[]) {
  return colors.map((color) => color.trim().toLowerCase()).sort().join("|");
}

function itemKey(item: { name: string; category: string; material: string | null; colors: string[]; notes: string | null }) {
  return [
    item.name.trim().toLowerCase(),
    item.category.trim().toLowerCase(),
    (item.material ?? "").trim().toLowerCase(),
    normalizeColors(item.colors),
    (item.notes ?? "").trim().toLowerCase(),
  ].join("::");
}

function getSeedItems(): SeedItem[] {
  return [
    {
      name: "Classic White Tee",
      brand: "Uniqlo",
      subtype: "tee",
      category: "top",
      colors: ["white"],
      material: "cotton",
      warmth: "light",
      formality: "casual",
      notes: "plain white tee",
    },
    {
      name: "Black Everyday Tee",
      brand: "H&M",
      subtype: "tee",
      category: "top",
      colors: ["black"],
      material: "cotton",
      warmth: "light",
      formality: "casual",
      notes: "plain black tee",
    },
    {
      name: "Heather Gray Hoodie",
      brand: "Nike",
      subtype: "hoodie",
      category: "top",
      colors: ["gray"],
      material: "fleece",
      warmth: "heavy",
      formality: "casual",
      notes: "gray hoodie",
    },
    {
      name: "Navy Crewneck Sweatshirt",
      brand: "Champion",
      subtype: "crewneck",
      category: "top",
      colors: ["navy"],
      material: "cotton",
      warmth: "medium",
      formality: "casual",
      notes: "navy crewneck",
    },
    {
      name: "Light Blue Oxford Shirt",
      brand: "J.Crew",
      subtype: "button-up",
      category: "top",
      colors: ["light blue"],
      material: "cotton",
      warmth: "light",
      formality: "smart",
      notes: "light blue button-up",
    },
    {
      name: "Charcoal Quarter Zip",
      brand: "Banana Republic",
      subtype: "quarter zip",
      category: "top",
      colors: ["charcoal"],
      material: "polyester blend",
      warmth: "medium",
      formality: "smart",
      notes: "charcoal quarter zip",
    },
    {
      name: "Dark Wash Jeans",
      brand: "Levi's",
      subtype: "jeans",
      category: "bottom",
      colors: ["dark blue"],
      material: "denim",
      warmth: "medium",
      formality: "casual",
      notes: "dark jeans",
    },
    {
      name: "Light Wash Jeans",
      brand: "Levi's",
      subtype: "jeans",
      category: "bottom",
      colors: ["light blue"],
      material: "denim",
      warmth: "light",
      formality: "casual",
      notes: "light jeans",
    },
    {
      name: "Black Tailored Trousers",
      brand: "Uniqlo",
      subtype: "trousers",
      category: "bottom",
      colors: ["black"],
      material: "wool blend",
      warmth: "medium",
      formality: "business",
      notes: "black trousers",
    },
    {
      name: "Gray Fleece Sweatpants",
      brand: "Adidas",
      subtype: "sweatpants",
      category: "bottom",
      colors: ["gray"],
      material: "cotton fleece",
      warmth: "medium",
      formality: "casual",
      notes: "gray sweats",
    },
    {
      name: "Blue Denim Jacket",
      brand: "Levi's",
      subtype: "jacket",
      category: "outerwear",
      colors: ["blue"],
      material: "denim",
      warmth: "medium",
      formality: "casual",
      notes: "denim jacket",
    },
    {
      name: "Black Puffer Jacket",
      brand: "North Face",
      subtype: "puffer",
      category: "outerwear",
      colors: ["black"],
      material: "nylon",
      warmth: "heavy",
      formality: "casual",
      notes: "black puffer jacket",
    },
    {
      name: "White Leather Sneakers",
      brand: "Common Projects",
      subtype: "sneakers",
      category: "shoes",
      colors: ["white"],
      material: "leather",
      warmth: "light",
      formality: "smart",
      notes: "white sneakers",
    },
    {
      name: "Black Running Shoes",
      brand: "Asics",
      subtype: "running shoes",
      category: "shoes",
      colors: ["black"],
      material: "mesh",
      warmth: "light",
      formality: "casual",
      notes: "black running shoes",
    },
    {
      name: "Silver Everyday Watch",
      brand: "Seiko",
      subtype: "watch",
      category: "accessory",
      colors: ["silver", "black"],
      material: "stainless steel",
      warmth: "light",
      formality: "smart",
      notes: "silver watch",
    },
  ];
}

async function main() {
  loadDotEnvLocal();

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseAnonKey) {
    throw new Error(
      "Missing NEXT_PUBLIC_SUPABASE_URL or NEXT_PUBLIC_SUPABASE_ANON_KEY in .env.local.",
    );
  }

  const seedEmail = process.env.SEED_EMAIL ?? DEFAULT_SEED_EMAIL;
  const seedPassword = process.env.SEED_PASSWORD ?? DEFAULT_SEED_PASSWORD;

  const supabase = createClient(supabaseUrl, supabaseAnonKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
      detectSessionInUrl: false,
    },
  });

  const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
    email: seedEmail,
    password: seedPassword,
  });

  if (authError) {
    throw new Error(`Failed to sign in as ${seedEmail}: ${authError.message}`);
  }

  if (!authData.user) {
    throw new Error("Sign-in succeeded but no user was returned.");
  }

  const userId = authData.user.id;
  const seedItems = getSeedItems();

  const { data: existingRows, error: existingError } = await supabase
    .from("clothing_items")
    .select("name, category, colors, material, notes")
    .eq("user_id", userId);

  if (existingError) {
    throw new Error(`Failed to load existing clothing items: ${existingError.message}`);
  }

  const existingKeys = new Set(((existingRows ?? []) as ExistingItemRow[]).map((item) => itemKey(item)));

  const toInsert = seedItems
    .filter((item) => !existingKeys.has(itemKey(item)))
    .map((item) => ({
      user_id: userId,
      name: item.name,
      brand: item.brand,
      subtype: item.subtype,
      category: item.category,
      colors: item.colors,
      material: item.material,
      warmth: item.warmth,
      formality: item.formality,
      notes: item.notes,
      // clothing_items.photo_path is currently non-nullable, so seed with empty path.
      photo_path: "",
    }));

  if (toInsert.length === 0) {
    console.log(`Seed complete: no new items needed for ${seedEmail}.`);
    return;
  }

  const { error: insertError } = await supabase.from("clothing_items").insert(toInsert);

  if (insertError) {
    throw new Error(`Failed to insert seed items: ${insertError.message}`);
  }

  console.log(`Seed complete: inserted ${toInsert.length} closet items for ${seedEmail}.`);
}

main().catch((error: unknown) => {
  const message = error instanceof Error ? error.message : "Unknown error";
  console.error(message);
  process.exit(1);
});
