import { NextResponse } from "next/server";

export function redirectWithQuery(
  request: Request,
  pathname: string,
  query: Record<string, string>,
) {
  const url = new URL(pathname, request.url);

  for (const [key, value] of Object.entries(query)) {
    if (value) {
      url.searchParams.set(key, value);
    }
  }

  return NextResponse.redirect(url, { status: 303 });
}
