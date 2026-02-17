import {
  isCategory,
  isFormality,
  isWarmth,
  parseColors,
  sanitizeFilename,
} from "@/lib/clothing";
import { redirectWithQuery } from "@/lib/redirect";
import { createSupabaseServerClient } from "@/lib/supabaseServer";

interface RouteContext {
  params: Promise<{ id: string }> | { id: string };
}

export async function POST(request: Request, { params }: RouteContext) {
  const resolvedParams = await Promise.resolve(params);
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return redirectWithQuery(request, "/auth/sign-in", { error: "Please sign in first." });
  }

  const { data: existingItem, error: existingError } = await supabase
    .from("clothing_items")
    .select("id, photo_path")
    .eq("id", resolvedParams.id)
    .eq("user_id", user.id)
    .maybeSingle();

  if (existingError || !existingItem) {
    return redirectWithQuery(request, "/closet", { error: "Item not found." });
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
    return redirectWithQuery(request, `/closet/${resolvedParams.id}/edit`, {
      error: "Invalid category, warmth, or formality.",
    });
  }

  const colors = parseColors(colorsInput);
  if (colors.length === 0) {
    return redirectWithQuery(request, `/closet/${resolvedParams.id}/edit`, {
      error: "Please provide at least one color.",
    });
  }

  let nextPhotoPath = existingItem.photo_path as string;
  let uploadedNewPhotoPath: string | null = null;

  if (photo instanceof File && photo.size > 0) {
    if (!photo.type.startsWith("image/")) {
      return redirectWithQuery(request, `/closet/${resolvedParams.id}/edit`, {
        error: "Photo must be an image.",
      });
    }

    const safeName = sanitizeFilename(photo.name || "photo.jpg");
    uploadedNewPhotoPath = `${user.id}/${resolvedParams.id}/${Date.now()}-${safeName}`;

    const { error: uploadError } = await supabase
      .storage
      .from("closet-photos")
      .upload(uploadedNewPhotoPath, photo, {
        contentType: photo.type,
        upsert: false,
      });

    if (uploadError) {
      return redirectWithQuery(request, `/closet/${resolvedParams.id}/edit`, {
        error: `Photo upload failed: ${uploadError.message}`,
      });
    }

    nextPhotoPath = uploadedNewPhotoPath;
  }

  const { error: updateError } = await supabase
    .from("clothing_items")
    .update({
      category,
      colors,
      material: materialInput || null,
      warmth,
      formality,
      notes: notesInput || null,
      photo_path: nextPhotoPath,
    })
    .eq("id", resolvedParams.id)
    .eq("user_id", user.id);

  if (updateError) {
    if (uploadedNewPhotoPath) {
      await supabase.storage.from("closet-photos").remove([uploadedNewPhotoPath]);
    }

    return redirectWithQuery(request, `/closet/${resolvedParams.id}/edit`, {
      error: `Failed to update item: ${updateError.message}`,
    });
  }

  if (uploadedNewPhotoPath && existingItem.photo_path && existingItem.photo_path !== uploadedNewPhotoPath) {
    await supabase.storage.from("closet-photos").remove([existingItem.photo_path as string]);
  }

  return redirectWithQuery(request, "/closet", { message: "Item updated" });
}
