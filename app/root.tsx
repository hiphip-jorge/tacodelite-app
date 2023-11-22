import type { LinksFunction, LoaderArgs, MetaFunction } from "@remix-run/node";
import { useEffect, useState } from "react";
import { json } from "@remix-run/node";
import {
  Links,
  LiveReload,
  Meta,
  Outlet,
  Scripts,
  ScrollRestoration,
  useLoaderData,
  useRevalidator,
} from "@remix-run/react";
import {
  createBrowserClient,
  createServerClient,
} from "@supabase/auth-helpers-remix";

import tailwindStylesheetUrl from "./styles/tailwind.css";
import tacoDeliteFavicon from "./assets/td-logo_w-bg.png";

let acierBatStyleSheetUrl = "https://use.typekit.net/kui8jtg.css";
let secularOneStyleSheetUrl =
  "https://fonts.googleapis.com/css2?family=Secular+One&display=swap";

export const links: LinksFunction = () => {
  return [
    { rel: "icon", type: "image/png", href: tacoDeliteFavicon },
    {
      rel: "stylesheet",
      href: acierBatStyleSheetUrl,
      as: "font",
      type: "font/woff",
    },
    {
      rel: "stylesheet",
      href: secularOneStyleSheetUrl,
      as: "font",
      type: "font/woff",
    },
    { rel: "stylesheet", href: tailwindStylesheetUrl, as: "style" },
  ];
};

export const meta: MetaFunction = () => ({
  charset: "utf-8",
  title: "Taco Delite | 15th Street",
  viewport: "width=device-width,initial-scale=1",
  keywords: "Tacos,Plano,Richardson,Best,Fresh",
});

export const loader = async ({ request }: LoaderArgs) => {
  const env = {
    SUPABASE_URL: process.env.SUPABASE_URL,
    SUPABASE_ANON_KEY: process.env.SUPABASE_ANON_KEY,
  };

  const response = new Response();

  const supabase = createServerClient(
    process.env.SUPABASE_URL!,
    process.env.SUPABASE_ANON_KEY!,
    {
      request,
      response,
    }
  );

  const {
    data: { session },
  } = await supabase.auth.getSession();

  return json(
    {
      env,
      session,
    },
    {
      headers: response.headers,
    }
  );
};

export default function App() {
  const { env, session } = useLoaderData();
  const { revalidate } = useRevalidator();

  const [supabase] = useState(() =>
    createBrowserClient(env.SUPABASE_URL!, env.SUPABASE_ANON_KEY!)
  );

  const serverAccessToken = session?.access_token;

  useEffect(() => {
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event, session) => {
      if (
        event !== "INITIAL_SESSION" &&
        session?.access_token !== serverAccessToken
      ) {
        // server and client are out of sync.
        revalidate();
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, [serverAccessToken, supabase, revalidate]);

  return (
    <html lang="en" className="h-full">
      <head>
        <Meta />
        <Links />
      </head>
      <body className="h-full">
        <Outlet context={supabase} />
        <ScrollRestoration />
        <Scripts />
        <LiveReload />
      </body>
    </html>
  );
}
