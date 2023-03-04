import { type LoaderArgs, redirect } from "@remix-run/node";
import { Form, Link, NavLink, Outlet } from "@remix-run/react";

import { useUser } from "~/utils";
import { getUserId } from "~/session.server";

export async function loader({ request }: LoaderArgs) {
  const userId = await getUserId(request);
  if (!userId) return redirect("/login");

  return null;
}

export default function StoreFrontPage() {
  const user = useUser();
  const isAdmin = user.role === "ADMIN";
  const activeClassName = "rounded-xl bg-green-300 p-2 px-6 shadow-md";
  const nonActiveClassName =
    "rounded-xl bg-green-light p-2 px-6 shadow-md hover:bg-green-300 hover:shadow-xl duration-300";

  return (
    <div className="flex h-full min-h-screen flex-col font-secondary-secular">
      <header className="flex items-center justify-between bg-gray-900 p-4 px-8 text-white">
        <h1 className="text-3xl font-bold">
          <Link className="flex items-baseline justify-center text-xl gap-1" to=".">
            <span className="font-primary-solid text-3xl text-green-primary">Taco Delite</span> Store Front
          </Link>
        </h1>
        <p className="text-2xl">Sup, {user.name} 😎</p>
        <Form action="/logout" method="post">
          <button
            type="submit"
            className="rounded bg-red-700 py-2 px-4 font-semibold text-white hover:bg-red-900 active:bg-red-900 duration-300"
          >
            Logout
          </button>
        </Form>
      </header>

      {/* sub-header  */}
      <header className="border-b-2 border-b-gray-700 bg-green-50 p-6">
        <ul className="mx-auto flex w-3/4 items-center justify-around font-bold text-green-dark ">
          {isAdmin && (
            <li>
              <NavLink
                to="./users"
                className={({ isActive }) =>
                  isActive ? activeClassName : nonActiveClassName
                }
              >
                Users
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
              Food Items
            </NavLink>
          </li>
          <li>
            <NavLink
              className={({ isActive }) =>
                isActive ? activeClassName : nonActiveClassName
              }
              to="./announcements"
            >
              Announcements
            </NavLink>
          </li>
        </ul>
      </header>
      <Outlet />
    </div>
  );
}
