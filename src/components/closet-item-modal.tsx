"use client";

import Link from "next/link";
import { useState } from "react";
import { useEffect, useId, useRef } from "react";

import type { ClosetListItem } from "@/components/closet-grid-client";

interface ClosetItemModalProps {
  item: ClosetListItem;
  isDeleting: boolean;
  errorMessage?: string | null;
  onClose: () => void;
  onDelete: (item: ClosetListItem) => Promise<void>;
}

function getFocusableElements(container: HTMLElement | null) {
  if (!container) {
    return [] as HTMLElement[];
  }

  return Array.from(
    container.querySelectorAll<HTMLElement>(
      'a[href], button:not([disabled]), textarea, input, select, [tabindex]:not([tabindex="-1"])',
    ),
  ).filter((element) => !element.hasAttribute("disabled") && element.getAttribute("aria-hidden") !== "true");
}

export function ClosetItemModal({
  item,
  isDeleting,
  errorMessage,
  onClose,
  onDelete,
}: ClosetItemModalProps) {
  const titleId = useId();
  const modalRef = useRef<HTMLDivElement>(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  useEffect(() => {
    const previousActiveElement = document.activeElement as HTMLElement | null;

    const focusable = getFocusableElements(modalRef.current);
    focusable[0]?.focus();

    function onKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        event.preventDefault();
        onClose();
        return;
      }

      if (event.key === "Tab") {
        const elements = getFocusableElements(modalRef.current);

        if (elements.length === 0) {
          event.preventDefault();
          return;
        }

        const first = elements[0];
        const last = elements[elements.length - 1];
        const active = document.activeElement as HTMLElement | null;

        if (!event.shiftKey && active === last) {
          event.preventDefault();
          first.focus();
        }

        if (event.shiftKey && active === first) {
          event.preventDefault();
          last.focus();
        }
      }
    }

    document.addEventListener("keydown", onKeyDown);
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    return () => {
      document.removeEventListener("keydown", onKeyDown);
      document.body.style.overflow = previousOverflow;
      previousActiveElement?.focus();
    };
  }, [onClose]);

  async function handleDeleteConfirm() {
    await onDelete(item);
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/55 p-4"
      onClick={(event) => {
        if (event.target === event.currentTarget) {
          onClose();
        }
      }}
      aria-hidden={false}
    >
      <div
        ref={modalRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        className="max-h-[90vh] w-full max-w-xl overflow-auto rounded-xl border border-slate-200 bg-white p-5 shadow-xl"
      >
        <div className="mb-3 flex items-start justify-between gap-3">
          <div>
            <h2 id={titleId} className="text-xl font-semibold text-slate-900">
              {item.name}
            </h2>
            {item.brand || item.subtype ? (
              <p className="text-sm text-slate-600">{[item.brand, item.subtype].filter(Boolean).join(" · ")}</p>
            ) : null}
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-md border border-slate-300 bg-white px-2 py-1 text-sm text-slate-700 hover:bg-slate-100"
            aria-label="Close item details"
          >
            Close
          </button>
        </div>

        <div className="mb-4 grid grid-cols-1 gap-4 md:grid-cols-[220px_1fr]">
          {item.photoUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={item.photoUrl}
              alt={`${item.name} photo`}
              className="h-64 w-full rounded-lg object-cover"
            />
          ) : (
            <div className="flex h-64 items-center justify-center rounded-lg bg-slate-100 text-sm text-slate-500">
              No photo available
            </div>
          )}

          <div className="space-y-2 text-sm text-slate-700">
            <p>
              <span className="font-medium">Category:</span> <span className="capitalize">{item.category}</span>
            </p>
            <p>
              <span className="font-medium">Colors:</span> {item.colors.join(", ") || "-"}
            </p>
            <p>
              <span className="font-medium">Warmth:</span> {item.warmth}
            </p>
            <p>
              <span className="font-medium">Formality:</span> {item.formality}
            </p>
            <p>
              <span className="font-medium">Material:</span> {item.material || "-"}
            </p>
            <p>
              <span className="font-medium">Notes:</span> {item.notes || "-"}
            </p>
          </div>
        </div>

        {errorMessage ? (
          <div className="mb-4 rounded-md border border-red-200 bg-red-50 p-3 text-sm text-red-700">
            {errorMessage}
          </div>
        ) : null}

        <div className="flex flex-wrap gap-2">
          <Link
            href={`/closet/${item.id}/edit`}
            className="rounded-md bg-slate-900 px-4 py-2 text-sm font-medium text-white hover:bg-slate-700"
          >
            Edit
          </Link>
          <button
            type="button"
            onClick={() => setShowDeleteConfirm(true)}
            disabled={isDeleting}
            className="rounded-md border border-red-300 bg-red-50 px-4 py-2 text-sm font-medium text-red-700 hover:bg-red-100 disabled:cursor-not-allowed disabled:opacity-60"
          >
            Delete
          </button>
        </div>

        {showDeleteConfirm ? (
          <div className="mt-3 rounded-md border border-red-300 bg-red-50 p-3">
            <p className="text-sm text-red-800">
              Delete <span className="font-semibold">{item.name}</span>? This cannot be undone.
            </p>
            <div className="mt-3 flex flex-wrap gap-2">
              <button
                type="button"
                onClick={() => setShowDeleteConfirm(false)}
                disabled={isDeleting}
                className="rounded-md border border-slate-300 bg-white px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-60"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleDeleteConfirm}
                disabled={isDeleting}
                className="rounded-md bg-red-700 px-3 py-2 text-sm font-medium text-white hover:bg-red-800 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {isDeleting ? "Deleting..." : "Yes, delete item"}
              </button>
            </div>
          </div>
        ) : null}
      </div>
    </div>
  );
}
