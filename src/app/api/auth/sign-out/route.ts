import { redirectWithQuery } from "@/lib/redirect";
import { createSupabaseServerClient } from "@/lib/supabaseServer";

export async function POST(request: Request) {
  const supabase = await createSupabaseServerClient();
  await supabase.auth.signOut();

  return redirectWithQuery(request, "/auth/sign-in", { message: "Signed out." });
}
