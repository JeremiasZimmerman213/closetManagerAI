import { redirect } from "next/navigation";

import { createSupabaseServerClient } from "@/lib/supabaseServer";

export async function requireUser() {
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/auth/sign-in");
  }

  return { supabase, user };
}
