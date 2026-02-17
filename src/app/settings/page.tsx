import Link from "next/link";

import { SettingsResetClosetForm } from "@/components/settings-reset-closet-form";
import { requireUser } from "@/lib/auth";

export default async function SettingsPage() {
  await requireUser();

  return (
    <div className="mx-auto w-full max-w-3xl px-4 py-8">
      <header className="mb-6 flex items-center justify-between gap-2">
        <div>
          <h1 className="text-2xl font-semibold text-slate-900">Settings</h1>
          <p className="text-sm text-slate-600">Manage account-level preferences and data actions.</p>
        </div>
        <Link href="/closet" className="text-sm font-medium underline">
          Back to Closet
        </Link>
      </header>

      <section className="rounded-lg border border-slate-200 bg-white p-6 shadow-sm">
        <h2 className="text-lg font-semibold text-slate-900">Danger Zone</h2>
        <p className="mt-1 text-sm text-slate-600">This action removes all closet items for your account.</p>

        <div className="mt-4">
          <SettingsResetClosetForm />
        </div>
      </section>
    </div>
  );
}
