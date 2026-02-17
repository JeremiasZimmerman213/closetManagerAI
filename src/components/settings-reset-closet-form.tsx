"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

const REQUIRED_CONFIRMATION = "DELETE";

type ResetResponse = {
  ok?: boolean;
  message?: string;
  error?: string;
};

export function SettingsResetClosetForm() {
  const router = useRouter();
  const [confirmation, setConfirmation] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (confirmation !== REQUIRED_CONFIRMATION) {
      setError(`Type ${REQUIRED_CONFIRMATION} to confirm.`);
      return;
    }

    setIsLoading(true);
    setError(null);

    const formData = new FormData();
    formData.append("confirmation", confirmation);

    try {
      const response = await fetch("/api/settings/reset-closet", {
        method: "POST",
        body: formData,
      });

      const payload = (await response.json()) as ResetResponse;

      if (!response.ok) {
        setError(payload.error ?? "Failed to reset closet.");
        return;
      }

      const message = payload.message ?? "Deleted all closet items";
      router.push(`/closet?message=${encodeURIComponent(message)}`);
      router.refresh();
    } catch {
      setError("Network error while resetting closet. Please try again.");
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <form onSubmit={onSubmit} className="space-y-4 rounded-lg border border-red-200 bg-red-50 p-4">
      <p className="text-sm text-red-800">
        This permanently deletes all clothing items in your closet. To confirm, type <strong>DELETE</strong>.
      </p>

      <div>
        <label htmlFor="confirmation" className="mb-1 block text-sm font-medium text-red-900">
          Confirmation
        </label>
        <input
          id="confirmation"
          name="confirmation"
          type="text"
          value={confirmation}
          onChange={(event) => setConfirmation(event.target.value)}
          placeholder="DELETE"
          className="block w-full rounded-md border border-red-300 bg-white px-3 py-2 text-sm"
        />
      </div>

      {error ? (
        <div className="rounded-md border border-red-300 bg-white p-3 text-sm text-red-700">{error}</div>
      ) : null}

      <button
        type="submit"
        disabled={isLoading || confirmation !== REQUIRED_CONFIRMATION}
        className="rounded-md bg-red-700 px-4 py-2 text-sm font-medium text-white hover:bg-red-800 disabled:cursor-not-allowed disabled:opacity-60"
      >
        {isLoading ? "Deleting..." : "Delete all my closet items"}
      </button>
    </form>
  );
}
