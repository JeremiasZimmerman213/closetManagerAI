import Link from "next/link";

import { FlashMessage } from "@/components/flash-message";

interface SignInPageProps {
  searchParams?:
    | Promise<Record<string, string | string[] | undefined>>
    | Record<string, string | string[] | undefined>;
}

function asString(value: string | string[] | undefined) {
  return Array.isArray(value) ? value[0] : value;
}

export default async function SignInPage({ searchParams }: SignInPageProps) {
  const resolvedSearchParams = await Promise.resolve(searchParams);
  const error = asString(resolvedSearchParams?.error);
  const message = asString(resolvedSearchParams?.message);

  return (
    <div className="mx-auto flex min-h-screen w-full max-w-md items-center px-4">
      <div className="w-full rounded-lg border border-slate-200 bg-white p-6 shadow-sm">
        <h1 className="text-2xl font-semibold text-slate-900">Sign In</h1>
        <p className="mt-1 text-sm text-slate-600">Access your closet.</p>
        <div className="mt-4">
          <FlashMessage error={error} message={message} />
        </div>
        <form action="/api/auth/sign-in" method="post" className="space-y-4">
          <div>
            <label className="mb-1 block text-sm font-medium text-slate-700" htmlFor="email">
              Email
            </label>
            <input
              id="email"
              name="email"
              type="email"
              required
              className="block w-full rounded-md border border-slate-300 px-3 py-2 text-sm"
            />
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium text-slate-700" htmlFor="password">
              Password
            </label>
            <input
              id="password"
              name="password"
              type="password"
              required
              className="block w-full rounded-md border border-slate-300 px-3 py-2 text-sm"
            />
          </div>
          <button
            type="submit"
            className="w-full rounded-md bg-slate-900 px-4 py-2 text-sm font-medium text-white hover:bg-slate-700"
          >
            Sign In
          </button>
        </form>
        <p className="mt-4 text-sm text-slate-600">
          Need an account?{" "}
          <Link className="underline" href="/auth/sign-up">
            Sign up
          </Link>
        </p>
      </div>
    </div>
  );
}
