import { Outlet, useLoaderData } from "@remix-run/react";
import { Link, NavLink } from "react-router-dom";

export async function loader() {
  const announcements = [{id:"id", title: "default", message: "default"}];
  return announcements;
}

const UsersPage = () => {
  const announcements = useLoaderData<typeof loader>();

  return (
    <main className="flex h-full bg-white">
      <div className="h-full w-80 overflow-scroll border-r bg-gray-50">
        <Link
          to="new"
          className="block bg-gray-100 p-4 text-xl text-yellow-500 hover:bg-yellow-50"
        >
          + New Announcement
        </Link>

        <hr />

        {announcements.length === 0 ? (
          <p className="p-4">No announcements yet.</p>
        ) : (
          <ol>
            {announcements.map((announcement, idx) => (
              <li key={idx}>
                <NavLink
                  className={({ isActive }) =>
                    `block border-b p-4 text-xl ${isActive ? "bg-white" : ""}`
                  }
                  to={announcement.id}
                >
                  {announcement.title}
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
