import Link from "next/link";
import { redirect } from "next/navigation";

import { ClothingForm } from "@/components/clothing-form";
import { requireUser } from "@/lib/auth";

interface ClosetEditPageProps {
  params: Promise<{ id: string }> | { id: string };
  searchParams?:
    | Promise<Record<string, string | string[] | undefined>>
    | Record<string, string | string[] | undefined>;
}

function asString(value: string | string[] | undefined) {
  return Array.isArray(value) ? value[0] : value;
}

type ClothingItemRow = {
  id: string;
  category: "top" | "bottom" | "shoes" | "outerwear" | "accessory";
  colors: string[];
  material: string | null;
  warmth: "light" | "medium" | "heavy";
  formality: "casual" | "smart" | "business";
  notes: string | null;
};

export default async function ClosetEditPage({ params, searchParams }: ClosetEditPageProps) {
  const { supabase, user } = await requireUser();
  const resolvedParams = await Promise.resolve(params);
  const resolvedSearchParams = await Promise.resolve(searchParams);

  const { data, error } = await supabase
    .from("clothing_items")
    .select("id, category, colors, material, warmth, formality, notes")
    .eq("id", resolvedParams.id)
    .eq("user_id", user.id)
    .maybeSingle();

  if (error || !data) {
    redirect("/closet?error=Item%20not%20found.");
  }

  const item = data as ClothingItemRow;
  const formError = asString(resolvedSearchParams?.error);
  const message = asString(resolvedSearchParams?.message);

  return (
    <div className="mx-auto w-full max-w-3xl px-4 py-8">
      <div className="mb-4 flex items-center justify-between gap-2">
        <h1 className="text-2xl font-semibold text-slate-900">Edit Clothing Item</h1>
        <Link href="/closet" className="text-sm font-medium underline">
          Back to Closet
        </Link>
      </div>

      <ClothingForm
        action={`/api/closet/${resolvedParams.id}/edit`}
        submitLabel="Update Item"
        requirePhoto={false}
        error={formError}
        message={message}
        defaultValues={{
          category: item.category,
          colors: item.colors.join(", "),
          material: item.material ?? "",
          warmth: item.warmth,
          formality: item.formality,
          notes: item.notes ?? "",
        }}
      />

      <form action={`/api/closet/${resolvedParams.id}/delete`} method="post" className="mt-4">
        <button
          type="submit"
          className="rounded-md border border-red-300 bg-red-50 px-4 py-2 text-sm font-medium text-red-700 hover:bg-red-100"
        >
          Delete Item
        </button>
      </form>
    </div>
  );
}
