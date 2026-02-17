import {
  isCategory,
  isFormality,
  isWarmth,
  parseColors,
  sanitizeFilename,
} from "@/lib/clothing";
import { redirectWithQuery } from "@/lib/redirect";
import { createSupabaseServerClient } from "@/lib/supabaseServer";

export async function POST(request: Request) {
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return redirectWithQuery(request, "/auth/sign-in", { error: "Please sign in first." });
  }

  const formData = await request.formData();
  const category = String(formData.get("category") ?? "");
  const colorsInput = String(formData.get("colors") ?? "");
  const materialInput = String(formData.get("material") ?? "").trim();
  const warmth = String(formData.get("warmth") ?? "");
  const formality = String(formData.get("formality") ?? "");
  const notesInput = String(formData.get("notes") ?? "").trim();
  const photo = formData.get("photo");

  if (!isCategory(category) || !isWarmth(warmth) || !isFormality(formality)) {
    return redirectWithQuery(request, "/closet/new", { error: "Invalid category, warmth, or formality." });
  }

  const colors = parseColors(colorsInput);
  if (colors.length === 0) {
    return redirectWithQuery(request, "/closet/new", { error: "Please provide at least one color." });
  }

  if (!(photo instanceof File) || photo.size === 0) {
    return redirectWithQuery(request, "/closet/new", { error: "Photo is required." });
  }

  if (!photo.type.startsWith("image/")) {
    return redirectWithQuery(request, "/closet/new", { error: "Photo must be an image." });
  }

  const itemId = crypto.randomUUID();
  const safeName = sanitizeFilename(photo.name || "photo.jpg");
  const photoPath = `${user.id}/${itemId}/${Date.now()}-${safeName}`;

  const { error: uploadError } = await supabase
    .storage
    .from("closet-photos")
    .upload(photoPath, photo, { contentType: photo.type, upsert: false });

  if (uploadError) {
    return redirectWithQuery(request, "/closet/new", { error: `Photo upload failed: ${uploadError.message}` });
  }

  const { error: insertError } = await supabase.from("clothing_items").insert({
    id: itemId,
    user_id: user.id,
    category,
    colors,
    material: materialInput || null,
    warmth,
    formality,
    notes: notesInput || null,
    photo_path: photoPath,
  });

  if (insertError) {
    await supabase.storage.from("closet-photos").remove([photoPath]);
    return redirectWithQuery(request, "/closet/new", { error: `Failed to save item: ${insertError.message}` });
  }

  return redirectWithQuery(request, "/closet", { message: "Item added" });
}
