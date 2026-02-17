import assert from "node:assert/strict";
import test from "node:test";

import { suggestOutfits, type ClothingItem } from "@/lib/recommendations/outfits";

function createItem(overrides: Partial<ClothingItem>): ClothingItem {
  return {
    id: overrides.id ?? crypto.randomUUID(),
    user_id: overrides.user_id ?? "user-1",
    category: overrides.category ?? "top",
    colors: overrides.colors ?? ["black"],
    material: overrides.material ?? null,
    warmth: overrides.warmth ?? "medium",
    formality: overrides.formality ?? "casual",
    notes: overrides.notes ?? null,
    photo_path: overrides.photo_path ?? "user-1/item/photo.jpg",
  };
}

test("returns outfit suggestions with required top/bottom/shoes", () => {
  const items: ClothingItem[] = [
    createItem({ id: "top-1", category: "top", formality: "casual", colors: ["white"] }),
    createItem({ id: "bottom-1", category: "bottom", formality: "casual", colors: ["navy"] }),
    createItem({ id: "shoes-1", category: "shoes", formality: "casual", colors: ["black"] }),
  ];

  const result = suggestOutfits(items, { occasion: "casual" });

  assert.equal(result.missingRequiredCategories.length, 0);
  assert.ok(result.suggestions.length >= 1);
  const first = result.suggestions[0];
  assert.equal(first.items.top.category, "top");
  assert.equal(first.items.bottom.category, "bottom");
  assert.equal(first.items.shoes.category, "shoes");
});

test("returns missing category when required items are not available", () => {
  const items: ClothingItem[] = [
    createItem({ id: "top-1", category: "top" }),
    createItem({ id: "bottom-1", category: "bottom" }),
  ];

  const result = suggestOutfits(items, { occasion: "casual" });

  assert.deepEqual(result.missingRequiredCategories, ["shoes"]);
  assert.equal(result.suggestions.length, 0);
});

test("respects simple constraints like no white shoes", () => {
  const items: ClothingItem[] = [
    createItem({ id: "top-1", category: "top", colors: ["black"] }),
    createItem({ id: "bottom-1", category: "bottom", colors: ["black"] }),
    createItem({ id: "shoes-white", category: "shoes", colors: ["white"], notes: "white sneakers" }),
    createItem({ id: "shoes-black", category: "shoes", colors: ["black"], notes: "derby" }),
  ];

  const result = suggestOutfits(items, {
    occasion: "casual",
    constraints: "no white shoes",
  });

  assert.ok(result.suggestions.length >= 1);
  assert.equal(result.suggestions[0].items.shoes.id, "shoes-black");
});

test("interview occasion prefers business or smart over casual", () => {
  const items: ClothingItem[] = [
    createItem({ id: "top-casual", category: "top", formality: "casual" }),
    createItem({ id: "top-business", category: "top", formality: "business" }),
    createItem({ id: "bottom-smart", category: "bottom", formality: "smart" }),
    createItem({ id: "shoes-business", category: "shoes", formality: "business" }),
  ];

  const result = suggestOutfits(items, { occasion: "interview" });

  assert.ok(result.suggestions.length >= 1);
  assert.equal(result.suggestions[0].items.top.id, "top-business");
});
