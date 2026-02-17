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

  const { error: deleteError } = await supabase
    .from("clothing_items")
    .delete()
    .eq("id", resolvedParams.id)
    .eq("user_id", user.id);

  if (deleteError) {
    return redirectWithQuery(request, "/closet", { error: `Failed to delete item: ${deleteError.message}` });
  }

  if (existingItem.photo_path) {
    await supabase.storage.from("closet-photos").remove([existingItem.photo_path as string]);
  }

  return redirectWithQuery(request, "/closet", { message: "Item deleted" });
}
