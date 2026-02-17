import { NextResponse } from "next/server";

import { isCategory, isFormality, isWarmth } from "@/lib/clothing";
import {
  suggestOutfits,
  type ClothingItem,
} from "@/lib/recommendations/outfits";
import { createSupabaseServerClient } from "@/lib/supabaseServer";

function toStringOrEmpty(value: FormDataEntryValue | null) {
  return typeof value === "string" ? value.trim() : "";
}

export async function POST(request: Request) {
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Please sign in first." }, { status: 401 });
  }

  const formData = await request.formData();
  const occasion = toStringOrEmpty(formData.get("occasion"));
  const vibe = toStringOrEmpty(formData.get("vibe"));
  const weather = toStringOrEmpty(formData.get("weather"));
  const constraints = toStringOrEmpty(formData.get("constraints"));
  const temperatureInput = toStringOrEmpty(formData.get("temperatureC"));

  if (!occasion) {
    return NextResponse.json({ error: "Occasion is required." }, { status: 400 });
  }

  let temperatureC: number | null = null;
  if (temperatureInput) {
    const parsed = Number(temperatureInput);

    if (!Number.isFinite(parsed)) {
      return NextResponse.json({ error: "Temperature must be a valid number in °C." }, { status: 400 });
    }

    temperatureC = parsed;
  }

  const { data, error } = await supabase
    .from("clothing_items")
    .select("id, user_id, name, brand, subtype, category, colors, material, warmth, formality, notes, photo_path")
    .eq("user_id", user.id);

  if (error) {
    return NextResponse.json({ error: `Failed to load closet items: ${error.message}` }, { status: 500 });
  }

  const normalizedItems: ClothingItem[] = (data ?? [])
    .filter((row) => row.user_id === user.id)
    .filter((row) => isCategory(row.category) && isWarmth(row.warmth) && isFormality(row.formality))
    .map((row) => ({
      id: row.id,
      user_id: row.user_id,
      name:
        typeof row.name === "string" && row.name.trim()
          ? row.name.trim()
          : [row.colors?.[0] ?? "", row.subtype ?? row.category].join(" ").trim(),
      brand: row.brand,
      subtype: row.subtype,
      category: row.category,
      colors: Array.isArray(row.colors) ? row.colors.filter((color) => typeof color === "string") : [],
      material: row.material,
      warmth: row.warmth,
      formality: row.formality,
      notes: row.notes,
      photo_path: row.photo_path,
    }));

  const result = suggestOutfits(normalizedItems, {
    occasion,
    vibe,
    weather,
    temperatureC,
    constraints,
  });

  return NextResponse.json({
    suggestions: result.suggestions,
    missingRequiredCategories: result.missingRequiredCategories,
    constraintsApplied: result.constraintsApplied,
    limitations: result.limitations,
  });
}
