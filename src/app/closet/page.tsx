import Link from "next/link";

import { ClosetGridClient } from "@/components/closet-grid-client";
import { FlashMessage } from "@/components/flash-message";
import { requireUser } from "@/lib/auth";

interface ClosetPageProps {
  searchParams?:
    | Promise<Record<string, string | string[] | undefined>>
    | Record<string, string | string[] | undefined>;
}

function asString(value: string | string[] | undefined) {
  return Array.isArray(value) ? value[0] : value;
}

type ClothingItemRow = {
  id: string;
  name: string;
  brand: string | null;
  subtype: string | null;
  category: string;
  colors: string[];
  material: string | null;
  warmth: string;
  formality: string;
  notes: string | null;
  photo_path: string | null;
};

type ClosetItemWithUrl = ClothingItemRow & {
  photoUrl: string | null;
};

export default async function ClosetPage({ searchParams }: ClosetPageProps) {
  const { supabase, user } = await requireUser();
  const resolvedSearchParams = await Promise.resolve(searchParams);

  const { data, error } = await supabase
    .from("clothing_items")
    .select("id, name, brand, subtype, category, colors, material, warmth, formality, notes, photo_path")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false });

  const items = (data ?? []) as ClothingItemRow[];

  const itemsWithUrls: ClosetItemWithUrl[] = await Promise.all(
    items.map(async (item) => {
      if (!item.photo_path) {
        return {
          ...item,
          photoUrl: null,
        };
      }

      const { data: signedUrlData } = await supabase
        .storage
        .from("closet-photos")
        .createSignedUrl(item.photo_path, 60 * 60);

      return {
        ...item,
        photoUrl: signedUrlData?.signedUrl ?? null,
      };
    }),
  );

  const errorMessage = asString(resolvedSearchParams?.error) ?? (error ? error.message : undefined);
  const message = asString(resolvedSearchParams?.message);

  return (
    <div className="mx-auto w-full max-w-5xl px-4 py-8">
      <header className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold text-slate-900">My Closet</h1>
          <p className="text-sm text-slate-600">Signed in as {user.email}</p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <Link
            href="/settings"
            className="rounded-md border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-100"
          >
            Settings
          </Link>
          <Link
            href="/outfits"
            className="rounded-md border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-100"
          >
            Outfit Suggestions
          </Link>
          <Link
            href="/closet/new"
            className="rounded-md bg-slate-900 px-4 py-2 text-sm font-medium text-white hover:bg-slate-700"
          >
            Add Item
          </Link>
          <form action="/api/auth/sign-out" method="post">
            <button
              type="submit"
              className="rounded-md border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-100"
            >
              Sign Out
            </button>
          </form>
        </div>
      </header>

      <FlashMessage error={errorMessage} message={message} />
      <ClosetGridClient initialItems={itemsWithUrls} />
    </div>
  );
}
