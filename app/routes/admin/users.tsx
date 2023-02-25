import { Outlet, useLoaderData } from "@remix-run/react";
import { json } from "@remix-run/node";
import { Link, NavLink } from "react-router-dom";
import { getUserList } from "~/models/user.server";

export async function loader() {
  const userList = await getUserList();
  return userList;
}

const UsersPage = () => {
  const userList = useLoaderData<typeof loader>();

  return (
    <main className="flex bg-white">
      <div className="h-full w-80 border-r bg-gray-50">
        <Link
          to="new"
          className="block bg-gray-100 p-4 text-xl text-green-primary hover:bg-green-light"
        >
          + New Food Item
        </Link>

        <hr />

        {userList.length === 0 ? (
          <p className="p-4">No food yet.</p>
        ) : (
          <ol>
            {userList.map((item, idx) => (
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
  );
};

export default UsersPage;
