"use client";

import { useMemo, useState } from "react";

import { ClosetItemModal } from "@/components/closet-item-modal";

export type ClosetListItem = {
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
  photoUrl: string | null;
};

interface ClosetGridClientProps {
  initialItems: ClosetListItem[];
}

type DeleteResponse = {
  ok?: boolean;
  message?: string;
  error?: string;
};

export function ClosetGridClient({ initialItems }: ClosetGridClientProps) {
  const [items, setItems] = useState<ClosetListItem[]>(initialItems);
  const [selectedItemId, setSelectedItemId] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState<string | null>(null);
  const [actionMessage, setActionMessage] = useState<string | null>(null);

  const selectedItem = useMemo(
    () => items.find((item) => item.id === selectedItemId) ?? null,
    [items, selectedItemId],
  );

  async function handleDelete(item: ClosetListItem) {
    setIsDeleting(true);
    setDeleteError(null);

    try {
      const response = await fetch(`/api/closet/${item.id}/delete`, {
        method: "POST",
        headers: {
          Accept: "application/json",
        },
      });

      const payload = (await response.json()) as DeleteResponse;

      if (!response.ok) {
        setDeleteError(payload.error ?? "Failed to delete item.");
        return;
      }

      setItems((previousItems) => previousItems.filter((previousItem) => previousItem.id !== item.id));
      setSelectedItemId(null);
      setActionMessage(payload.message ?? "Item deleted");
    } catch {
      setDeleteError("Network error while deleting item. Please try again.");
    } finally {
      setIsDeleting(false);
    }
  }

  return (
    <>
      {actionMessage ? (
        <div className="mb-4 rounded-md border border-green-200 bg-green-50 p-3 text-sm text-green-700">
          {actionMessage}
        </div>
      ) : null}

      {items.length === 0 ? (
        <div className="rounded-lg border border-dashed border-slate-300 bg-white p-8 text-center text-slate-600">
          No clothing items yet. Add your first item to start building your closet.
        </div>
      ) : (
        <ul className="grid grid-cols-2 gap-3 md:grid-cols-3 lg:grid-cols-4">
          {items.map((item) => (
            <li key={item.id}>
              <button
                type="button"
                onClick={() => {
                  setSelectedItemId(item.id);
                  setDeleteError(null);
                }}
                className="group block w-full overflow-hidden rounded-lg border border-slate-200 bg-white text-left shadow-sm transition hover:border-slate-300 hover:shadow"
                aria-label={`Open details for ${item.name}`}
              >
                {item.photoUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={item.photoUrl} alt={item.name} className="h-32 w-full object-cover" />
                ) : (
                  <div className="flex h-32 w-full items-center justify-center bg-slate-100 text-xs text-slate-500">
                    No photo
                  </div>
                )}
                <div className="p-2">
                  <p className="line-clamp-1 text-sm font-semibold text-slate-900">{item.name}</p>
                  {item.brand || item.subtype ? (
                    <p className="line-clamp-1 text-xs text-slate-600">{[item.brand, item.subtype].filter(Boolean).join(" · ")}</p>
                  ) : null}
                </div>
              </button>
            </li>
          ))}
        </ul>
      )}

      {selectedItem ? (
        <ClosetItemModal
          item={selectedItem}
          isDeleting={isDeleting}
          errorMessage={deleteError}
          onClose={() => {
            if (isDeleting) {
              return;
            }

            setSelectedItemId(null);
            setDeleteError(null);
          }}
          onDelete={handleDelete}
        />
      ) : null}
    </>
  );
}
