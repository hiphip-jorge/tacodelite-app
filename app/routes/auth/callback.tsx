import { redirect } from "@remix-run/node";
import { createServerClient } from "@supabase/auth-helpers-remix";

import type { LoaderArgs } from "@remix-run/node";

export const loader = async ({ request }: LoaderArgs) => {
  const response = new Response();
  const url = new URL(request.url);
  const code = url.searchParams.get("code");

  console.log("code: ", code);
  if (code) {
    const supabase = createServerClient(
      process.env.SUPABASE_URL!,
      process.env.SUPABASE_ANON_KEY!,
      { request, response }
    );

    await supabase.auth.exchangeCodeForSession(code);

    return redirect("/store", {
      headers: response.headers,
    });
  }

  return redirect("/", {
    headers: response.headers,
  });
};
