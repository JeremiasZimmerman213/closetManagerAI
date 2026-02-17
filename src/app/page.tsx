import { redirect } from "next/navigation";

import { createSupabaseServerClient } from "@/lib/supabaseServer";

export default async function HomePage() {
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  redirect(user ? "/closet" : "/auth/sign-in");
}
