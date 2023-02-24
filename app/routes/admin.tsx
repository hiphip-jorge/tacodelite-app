import type { LoaderArgs } from "@remix-run/node";
import { json } from "@remix-run/node";
import { Form, Link, NavLink, Outlet, useLoaderData } from "@remix-run/react";

import { useUser } from "~/utils";
import { getFoodItemList } from "~/models/foodItem.server";

export async function loader({ request }: LoaderArgs) {
  const foodItemList = await getFoodItemList();
  return json({ foodItemList });
}

export default function NotesPage() {
  const { foodItemList } = useLoaderData<typeof loader>();
  const user = useUser();

//   const activeClassName = "rounded-xl bg-green-300 p-2 px-6 shadow-sm";
  const nonActiveClassName =
    "rounded-xl bg-green-200 p-2 px-6 shadow-sm hover:bg-green-300";

  return (
    <div className="flex h-full min-h-screen flex-col">
      <header className="flex items-center justify-between bg-dark p-4 px-8 text-white">
        <h1 className="text-3xl font-bold">
          <Link className="flex items-center justify-center gap-4" to=".">
            Admin
          </Link>
        </h1>
        <p>{user.email}</p>
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
      <header className="bg-green-light p-4">
        <ul className="mx-auto flex w-3/4 items-center justify-around font-bold text-green-dark">
          <li>
            <Link to="." className={nonActiveClassName}>
              Users
            </Link>
          </li>
          <li>
            <Link className={nonActiveClassName} to=".">
              Food Items
            </Link>
          </li>
          <li>
            <Link className={nonActiveClassName} to=".">
              Announcements
            </Link>
          </li>
        </ul>
      </header>

      <main className="flex bg-white">
        <div className="h-full w-80 border-r bg-gray-50">
          <Link to="new" className="block p-4 text-xl text-blue-500">
            + New Food Item
          </Link>

          <hr />

          {foodItemList.length === 0 ? (
            <p className="p-4">No food yet.</p>
          ) : (
            <ol>
              {foodItemList.map((item, idx) => (
                <li key={idx}>
                  <NavLink
                    className={({ isActive }) =>
                      `block border-b p-4 text-xl ${isActive ? "bg-white" : ""}`
                    }
                    to={item.id.toString()}
                  >
                    {item.name}
                  </NavLink>
                </li>
              ))}
            </ol>
          )}
        </div>

        <div className="flex-1 p-6">
          <Outlet />
        </div>
      </main>
    </div>
  );
}
