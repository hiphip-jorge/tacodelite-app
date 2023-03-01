import { Outlet, useLoaderData } from "@remix-run/react";
import type { DataFunctionArgs } from "@remix-run/node";
import { Link, NavLink } from "react-router-dom";
import { getUserList } from "~/models/user.server";
import { requireAdminUser } from "~/session.server";

export async function loader({ request }: DataFunctionArgs) {
  // await requireAdminUser(request, "/admin");
  const userList = await getUserList();
  return userList;
}

const UsersPage = () => {
  const userList = useLoaderData<typeof loader>();

  return (
    <main className="flex h-full bg-white">
      <div className="h-full w-80 overflow-scroll border-r bg-gray-50">
        <Link
          to="new"
          className="block bg-gray-100 p-4 text-xl text-blue-500 hover:bg-blue-200"
        >
          + New User
        </Link>

        <hr />

        {userList.length === 0 ? (
          <p className="p-4">No food yet.</p>
        ) : (
          <ol>
            {userList.map((user, idx) => (
              <li key={idx}>
                <NavLink
                  className={({ isActive }) =>
                    `block border-b p-4 text-xl capitalize ${
                      isActive ? "bg-white" : ""
                    }`
                  }
                  to={user.id.toString()}
                >
                  {user.name}
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
  );
};

export default UsersPage;
