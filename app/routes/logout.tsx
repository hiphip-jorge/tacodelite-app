import type { ActionArgs } from "@remix-run/node";
import { redirect } from "@remix-run/node";
import { createServerClient } from "@supabase/auth-helpers-remix";

export async function action({ request }: ActionArgs) {
  const response = new Response();
  const supabase = createServerClient(
    process.env.SUPABASE_URL!,
    process.env.SUPABASE_ANON_KEY!,
    { request, response }
  );

  return await supabase.auth.signOut();
}

export async function loader() {
  return redirect("/");
}
