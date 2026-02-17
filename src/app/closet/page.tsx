/* eslint-disable @next/next/no-img-element */
import Link from "next/link";

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
  category: string;
  colors: string[];
  material: string | null;
  warmth: string;
  formality: string;
  notes: string | null;
  photo_path: string | null;
};

export default async function ClosetPage({ searchParams }: ClosetPageProps) {
  const { supabase, user } = await requireUser();
  const resolvedSearchParams = await Promise.resolve(searchParams);

  const { data, error } = await supabase
    .from("clothing_items")
    .select("id, category, colors, material, warmth, formality, notes, photo_path")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false });

  const items = (data ?? []) as ClothingItemRow[];

  const itemsWithUrls = await Promise.all(
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

      {itemsWithUrls.length === 0 ? (
        <div className="rounded-lg border border-dashed border-slate-300 bg-white p-8 text-center text-slate-600">
          No clothing items yet. Add your first item to start building your closet.
        </div>
      ) : (
        <ul className="grid grid-cols-1 gap-4 md:grid-cols-2">
          {itemsWithUrls.map((item) => (
            <li key={item.id} className="overflow-hidden rounded-lg border border-slate-200 bg-white shadow-sm">
              {item.photoUrl ? (
                <img src={item.photoUrl} alt={`${item.category} item`} className="h-64 w-full object-cover" />
              ) : (
                <div className="flex h-64 items-center justify-center bg-slate-100 text-sm text-slate-500">
                  No photo available
                </div>
              )}
              <div className="space-y-2 p-4 text-sm text-slate-700">
                <div className="font-medium capitalize text-slate-900">{item.category}</div>
                <div>
                  <span className="font-medium">Colors:</span> {item.colors.join(", ")}
                </div>
                <div>
                  <span className="font-medium">Warmth:</span> {item.warmth}
                </div>
                <div>
                  <span className="font-medium">Formality:</span> {item.formality}
                </div>
                <div>
                  <span className="font-medium">Material:</span> {item.material || "-"}
                </div>
                <div>
                  <span className="font-medium">Notes:</span> {item.notes || "-"}
                </div>
                <Link href={`/closet/${item.id}/edit`} className="inline-block font-medium underline">
                  Edit
                </Link>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
