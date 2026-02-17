"use client";

import { useState } from "react";

type SuggestionItem = {
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
};

type Suggestion = {
  explanation: string;
  score: number;
  items: {
    top: SuggestionItem;
    bottom: SuggestionItem;
    shoes: SuggestionItem;
    outerwear?: SuggestionItem;
    accessory?: SuggestionItem;
  };
};

type ApiResponse = {
  error?: string;
  suggestions?: Suggestion[];
  missingRequiredCategories?: string[];
  constraintsApplied?: string[];
  limitations?: string;
};

function ItemSummary({ label, item }: { label: string; item?: SuggestionItem }) {
  if (!item) {
    return null;
  }

  return (
    <li className="rounded-md border border-slate-200 bg-slate-50 p-3">
      <div className="text-xs font-semibold uppercase tracking-wide text-slate-500">{label}</div>
      <div className="mt-1 text-sm font-medium text-slate-900">{item.name}</div>
      {item.brand || item.subtype ? (
        <div className="text-xs text-slate-600">{[item.brand, item.subtype].filter(Boolean).join(" · ")}</div>
      ) : null}
      <div className="text-sm text-slate-700">Category: {item.category}</div>
      <div className="text-sm text-slate-700">Colors: {item.colors.join(", ") || "-"}</div>
      <div className="text-sm text-slate-700">Warmth: {item.warmth}</div>
      <div className="text-sm text-slate-700">Formality: {item.formality}</div>
      {item.material ? <div className="text-sm text-slate-700">Material: {item.material}</div> : null}
    </li>
  );
}

export function OutfitSuggestionsClient() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [suggestions, setSuggestions] = useState<Suggestion[]>([]);
  const [missingCategories, setMissingCategories] = useState<string[]>([]);
  const [constraintsApplied, setConstraintsApplied] = useState<string[]>([]);
  const [limitations, setLimitations] = useState<string | null>(null);

  async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setIsLoading(true);
    setError(null);

    const formData = new FormData(event.currentTarget);

    try {
      const response = await fetch("/api/outfits/suggest", {
        method: "POST",
        body: formData,
      });

      const payload = (await response.json()) as ApiResponse;

      if (!response.ok) {
        setSuggestions([]);
        setMissingCategories([]);
        setConstraintsApplied([]);
        setLimitations(null);
        setError(payload.error ?? "Unable to generate outfit suggestions right now.");
        return;
      }

      setSuggestions(payload.suggestions ?? []);
      setMissingCategories(payload.missingRequiredCategories ?? []);
      setConstraintsApplied(payload.constraintsApplied ?? []);
      setLimitations(payload.limitations ?? null);
      setError(null);
    } catch {
      setSuggestions([]);
      setMissingCategories([]);
      setConstraintsApplied([]);
      setLimitations(null);
      setError("Network error while generating suggestions. Please try again.");
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className="space-y-6">
      <form onSubmit={onSubmit} className="rounded-lg border border-slate-200 bg-white p-6 shadow-sm">
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <div>
            <label htmlFor="occasion" className="mb-1 block text-sm font-medium text-slate-700">
              Occasion
            </label>
            <input
              id="occasion"
              name="occasion"
              type="text"
              required
              placeholder="casual, date, interview"
              className="block w-full rounded-md border border-slate-300 px-3 py-2 text-sm"
            />
          </div>
          <div>
            <label htmlFor="vibe" className="mb-1 block text-sm font-medium text-slate-700">
              Vibe (optional)
            </label>
            <input
              id="vibe"
              name="vibe"
              type="text"
              placeholder="minimal, edgy, classic"
              className="block w-full rounded-md border border-slate-300 px-3 py-2 text-sm"
            />
          </div>
        </div>

        <div className="mt-4 grid grid-cols-1 gap-4 md:grid-cols-2">
          <div>
            <label htmlFor="temperatureC" className="mb-1 block text-sm font-medium text-slate-700">
              Temperature (optional, °C)
            </label>
            <input
              id="temperatureC"
              name="temperatureC"
              type="number"
              step="1"
              placeholder="18"
              className="block w-full rounded-md border border-slate-300 px-3 py-2 text-sm"
            />
          </div>

          <div>
            <label htmlFor="weather" className="mb-1 block text-sm font-medium text-slate-700">
              Weather (optional)
            </label>
            <select
              id="weather"
              name="weather"
              defaultValue=""
              className="block w-full rounded-md border border-slate-300 px-3 py-2 text-sm"
            >
              <option value="">Auto / not set</option>
              <option value="cold">Cold</option>
              <option value="mild">Mild</option>
              <option value="hot">Hot</option>
            </select>
          </div>
        </div>

        <div className="mt-4">
          <label htmlFor="constraints" className="mb-1 block text-sm font-medium text-slate-700">
            Constraints (optional)
          </label>
          <textarea
            id="constraints"
            name="constraints"
            rows={3}
            placeholder="no hoodies, no white shoes"
            className="block w-full rounded-md border border-slate-300 px-3 py-2 text-sm"
          />
        </div>

        <button
          type="submit"
          disabled={isLoading}
          className="mt-4 rounded-md bg-slate-900 px-4 py-2 text-sm font-medium text-white hover:bg-slate-700 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {isLoading ? "Generating..." : "Get suggestions"}
        </button>
      </form>

      <section className="rounded-lg border border-slate-200 bg-white p-6 shadow-sm">
        <h2 className="text-xl font-semibold text-slate-900">Suggestions</h2>

        {error ? (
          <p className="mt-3 rounded-md border border-red-200 bg-red-50 p-3 text-sm text-red-700">{error}</p>
        ) : null}

        {missingCategories.length > 0 ? (
          <p className="mt-3 rounded-md border border-amber-200 bg-amber-50 p-3 text-sm text-amber-700">
            You need at least one {missingCategories.join(", ")} item to get suggestions with your current
            constraints. Add more items in your closet and try again.
          </p>
        ) : null}

        {!error && missingCategories.length === 0 && suggestions.length === 0 ? (
          <p className="mt-3 text-sm text-slate-600">
            Submit the form to get 1-3 outfit suggestions from your closet.
          </p>
        ) : null}

        <div className="mt-4 space-y-4">
          {suggestions.map((suggestion, index) => (
            <article key={`${suggestion.items.top.id}-${suggestion.items.bottom.id}-${suggestion.items.shoes.id}-${index}`} className="rounded-lg border border-slate-200 p-4">
              <h3 className="text-base font-semibold text-slate-900">Outfit {index + 1}</h3>
              <p className="mt-1 text-sm text-slate-700">{suggestion.explanation}</p>

              <ul className="mt-3 grid grid-cols-1 gap-3 md:grid-cols-2">
                <ItemSummary label="Top" item={suggestion.items.top} />
                <ItemSummary label="Bottom" item={suggestion.items.bottom} />
                <ItemSummary label="Shoes" item={suggestion.items.shoes} />
                <ItemSummary label="Outerwear" item={suggestion.items.outerwear} />
                <ItemSummary label="Accessory" item={suggestion.items.accessory} />
              </ul>
            </article>
          ))}
        </div>

        {constraintsApplied.length > 0 ? (
          <p className="mt-4 text-xs text-slate-500">Constraints applied: {constraintsApplied.join(", ")}</p>
        ) : null}

        {limitations ? <p className="mt-2 text-xs text-slate-500">Note: {limitations}</p> : null}
      </section>
    </div>
  );
}
