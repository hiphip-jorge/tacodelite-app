import { type LoaderArgs, redirect } from "@remix-run/node";
import { json } from "@remix-run/node";
import { Form, Link, NavLink, Outlet } from "@remix-run/react";

import { useUser } from "~/utils";
import { getFoodItemList } from "~/models/foodItem.server";
import { getUserId } from "~/session.server";

export async function loader({ request }: LoaderArgs) {
  const userId = await getUserId(request);
  if (!userId) return redirect("/login");
  const foodItemList = await getFoodItemList();
  return json({ foodItemList });
}

export default function AdminPage() {
  const user = useUser();
  const isAdmin = user.role === "ADMIN";
  const activeClassName = "rounded-xl bg-green-300 p-2 px-6 shadow-sm";
  const nonActiveClassName =
    "rounded-xl bg-green-light p-2 px-6 shadow-sm hover:bg-green-300";

  return (
    <div className="flex h-full min-h-screen flex-col font-secondary-secular">
      <header className="flex items-center justify-between bg-dark p-4 px-8 text-white">
        <h1 className="text-3xl font-bold">
          <Link className="flex items-center justify-center gap-4" to=".">
            Admin
          </Link>
        </h1>
        <p className="text-xl">Sup, {user.name} 😎</p>
        <Form action="/logout" method="post">
          <button
            type="submit"
            className="rounded bg-green-primary py-2 px-4 font-semibold text-blue-100 hover:bg-green-dark active:bg-green-800"
          >
            Logout
          </button>
        </Form>
      </header>

      {/* sub-header  */}
      <header className="border border-b-green-primary bg-green-50 p-6">
        <ul className="mx-auto flex w-3/4 items-center justify-around font-bold text-green-dark">
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