import Link from "next/link";

import { ClothingForm } from "@/components/clothing-form";
import { requireUser } from "@/lib/auth";

interface ClosetNewPageProps {
  searchParams?:
    | Promise<Record<string, string | string[] | undefined>>
    | Record<string, string | string[] | undefined>;
}

function asString(value: string | string[] | undefined) {
  return Array.isArray(value) ? value[0] : value;
}

export default async function ClosetNewPage({ searchParams }: ClosetNewPageProps) {
  await requireUser();
  const resolvedSearchParams = await Promise.resolve(searchParams);

  const error = asString(resolvedSearchParams?.error);
  const message = asString(resolvedSearchParams?.message);

  return (
    <div className="mx-auto w-full max-w-3xl px-4 py-8">
      <div className="mb-4 flex items-center justify-between gap-2">
        <h1 className="text-2xl font-semibold text-slate-900">Add Clothing Item</h1>
        <Link href="/closet" className="text-sm font-medium underline">
          Back to Closet
        </Link>
      </div>
      <ClothingForm
        action="/api/closet/new"
        submitLabel="Save Item"
        requirePhoto
        error={error}
        message={message}
      />
    </div>
  );
}
