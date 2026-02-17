import { redirectWithQuery } from "@/lib/redirect";
import { createSupabaseServerClient } from "@/lib/supabaseServer";

export async function POST(request: Request) {
  const formData = await request.formData();
  const email = String(formData.get("email") ?? "").trim();
  const password = String(formData.get("password") ?? "");

  if (!email || !password) {
    return redirectWithQuery(request, "/auth/sign-up", {
      error: "Email and password are required.",
    });
  }

  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase.auth.signUp({ email, password });

  if (error) {
    return redirectWithQuery(request, "/auth/sign-up", { error: error.message });
  }

  if (data.session) {
    return redirectWithQuery(request, "/closet", { message: "Welcome to Closet Manager AI." });
  }

  return redirectWithQuery(request, "/auth/sign-in", {
    message: "Account created. Verify your email if confirmation is enabled, then sign in.",
  });
}
