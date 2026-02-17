import { NextResponse } from "next/server";

import { createSupabaseServerClient } from "@/lib/supabaseServer";

const REQUIRED_CONFIRMATION = "DELETE";

function chunkArray<T>(items: T[], size: number) {
  const chunks: T[][] = [];

  for (let index = 0; index < items.length; index += size) {
    chunks.push(items.slice(index, index + size));
  }

  return chunks;
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
  const confirmation = String(formData.get("confirmation") ?? "").trim();

  if (confirmation !== REQUIRED_CONFIRMATION) {
    return NextResponse.json(
      { error: `Please type ${REQUIRED_CONFIRMATION} to confirm reset.` },
      { status: 400 },
    );
  }

  const { data: existingRows, error: existingError } = await supabase
    .from("clothing_items")
    .select("photo_path")
    .eq("user_id", user.id);

  if (existingError) {
    return NextResponse.json(
      { error: `Failed to load closet items: ${existingError.message}` },
      { status: 500 },
    );
  }

  const { error: deleteError } = await supabase
    .from("clothing_items")
    .delete()
    .eq("user_id", user.id);

  if (deleteError) {
    return NextResponse.json(
      { error: `Failed to delete closet items: ${deleteError.message}` },
      { status: 500 },
    );
  }

  const storagePaths = new Set<string>();

  for (const row of existingRows ?? []) {
    if (typeof row.photo_path === "string" && row.photo_path.startsWith(`${user.id}/`)) {
      storagePaths.add(row.photo_path);
    }
  }

  let warning: string | null = null;

  const { data: rootItems, error: listRootError } = await supabase
    .storage
    .from("closet-photos")
    .list(user.id, { limit: 1000 });

  if (listRootError) {
    warning = "Closet reset succeeded, but some photo files may not have been removed.";
  } else {
    for (const rootItem of rootItems ?? []) {
      if (!rootItem.name) {
        continue;
      }

      const rootPath = `${user.id}/${rootItem.name}`;
      const { data: childItems, error: childListError } = await supabase
        .storage
        .from("closet-photos")
        .list(rootPath, { limit: 1000 });

      if (childListError) {
        continue;
      }

      for (const childItem of childItems ?? []) {
        if (!childItem.name) {
          continue;
        }

        storagePaths.add(`${rootPath}/${childItem.name}`);
      }
    }

    if (storagePaths.size > 0) {
      for (const batch of chunkArray(Array.from(storagePaths), 100)) {
        const { error: removeError } = await supabase.storage.from("closet-photos").remove(batch);

        if (removeError) {
          warning = "Closet reset succeeded, but some photo files may not have been removed.";
          break;
        }
      }
    }
  }

  const message = warning ?? "Deleted all closet items";

  return NextResponse.json({ ok: true, message, warning });
}
