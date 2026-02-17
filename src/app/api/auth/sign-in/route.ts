import { redirectWithQuery } from "@/lib/redirect";
import { createSupabaseServerClient } from "@/lib/supabaseServer";

export async function POST(request: Request) {
  const formData = await request.formData();
  const email = String(formData.get("email") ?? "").trim();
  const password = String(formData.get("password") ?? "");

  if (!email || !password) {
    return redirectWithQuery(request, "/auth/sign-in", {
      error: "Email and password are required.",
    });
  }

  const supabase = await createSupabaseServerClient();
  const { error } = await supabase.auth.signInWithPassword({ email, password });

  if (error) {
    return redirectWithQuery(request, "/auth/sign-in", { error: error.message });
  }

  return redirectWithQuery(request, "/closet", { message: "Signed in successfully." });
}
