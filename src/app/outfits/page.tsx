import Link from "next/link";

import { OutfitSuggestionsClient } from "@/components/outfit-suggestions-client";
import { requireUser } from "@/lib/auth";

export default async function OutfitsPage() {
  await requireUser();

  return (
    <div className="mx-auto w-full max-w-5xl px-4 py-8">
      <header className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold text-slate-900">Outfit Suggestions</h1>
          <p className="text-sm text-slate-600">Get explainable outfit recommendations from your closet.</p>
        </div>
        <Link
          href="/closet"
          className="rounded-md border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-100"
        >
          Back to Closet
        </Link>
      </header>

      <OutfitSuggestionsClient />
    </div>
  );
}
