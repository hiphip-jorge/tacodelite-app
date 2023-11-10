import { type LoaderArgs, redirect, json } from "@remix-run/node";
import {
  Link,
  NavLink,
  Outlet,
  useLoaderData,
  useOutletContext,
} from "@remix-run/react";

import { announcement_icon, user_icon, utensils } from "~/assets/svg";
import { SupabaseClient, createServerClient } from "@supabase/auth-helpers-remix";

export async function loader({ request }: LoaderArgs) {
  const response = new Response();
  const supabase = createServerClient(
    process.env.SUPABASE_URL!,
    process.env.SUPABASE_ANON_KEY!,
    { request, response }
  );

  const {
    data: { session },
  } = await supabase.auth.getSession();

  if (session?.user) {
    const { data, error } = await supabase
      .from("profiles")
      .select("*")
      .eq("id", session.user.id);

    return json({ data, error });
  } else {
    console.log("not auth'd");
    return redirect("/signin");
  }
}

export default function StorePage() {
  const { data } = useLoaderData();
  const profile = data[0];

  const user = { role: "ADMIN", name: profile.name };
  const isAdmin = profile.admin === true;

  const supabase = useOutletContext<SupabaseClient>();

  const activeClassName =
    "rounded-xl bg-green-300 p-2 px-6 shadow-md flex justify-center items-center w-16 md:w-fit min-h-[64px]";
  const nonActiveClassName =
    "rounded-xl bg-green-light p-2 px-6 shadow-md hover:bg-green-300 hover:shadow-xl duration-300 min-h-[48px] flex justify-center w-16 md:w-fit items-center";

  return (
    <div className="flex h-full min-h-screen flex-col font-secondary-secular">
      <header className="flex items-center justify-between bg-gray-900 p-4 px-8 text-white">
        <h1 className="text-3xl font-bold sm:hidden md:block">
          <Link
            className="flex items-baseline justify-center gap-1 text-xl"
            to="."
          >
            <span className="font-primary-solid text-3xl text-green-primary">
              Taco Delite
            </span>
          </Link>
        </h1>
        <p className="text-2xl">Sup, {user.name} 😎</p>
        {/* <Form action="/logout" method="post"> */}
        <button
          onClick={async () => await supabase.auth.signOut()}
          className="rounded bg-red-700 py-2 px-4 font-semibold text-white duration-300 hover:bg-red-900 active:bg-red-900"
        >
          Logout
        </button>
        {/* </Form> */}
      </header>

      {/* sub-header  */}
      <header className="border-b-2 border-b-gray-700 bg-green-50 p-6 sm:fixed sm:bottom-0 sm:w-full md:static">
        <ul className="mx-auto flex w-3/4 items-center justify-around font-bold text-green-dark ">
          {isAdmin && (
            <li>
              <NavLink
                to="./users"
                className={({ isActive }) =>
                  isActive ? activeClassName : nonActiveClassName
                }
              >
                <div className="w-6 md:hidden">{user_icon}</div>
                <span className="hidden md:block">Users</span>
              </NavLink>
            </li>
          )}
          <li>
            <NavLink
              className={({ isActive }) =>
                isActive ? activeClassName : nonActiveClassName
              }
              to="./foodItems"
            >
              <div className="w-6 md:hidden">{utensils("", "#43B64F")}</div>
              <span className="hidden md:block">Food Items</span>
            </NavLink>
          </li>
          <li>
            <NavLink
              className={({ isActive }) =>
                isActive ? activeClassName : nonActiveClassName
              }
              to="./announcements"
            >
              <div className="w-6 md:hidden">{announcement_icon}</div>
              <span className="hidden md:block">Announcements</span>
            </NavLink>
          </li>
        </ul>
      </header>
      <Outlet />
    </div>
  );
}
