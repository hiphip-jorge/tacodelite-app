import { Outlet, useLoaderData } from "@remix-run/react";
import { json, type DataFunctionArgs } from "@remix-run/node";
import { Link, NavLink } from "react-router-dom";
import { createServerClient } from "@supabase/auth-helpers-remix";

export async function loader({ request }: DataFunctionArgs) {
  const response = new Response();
  const supabase = createServerClient(
    process.env.SUPABASE_URL!,
    process.env.SUPABASE_ANON_KEY!,
    { request, response }
  );

  const { data, error } = await supabase.from("profiles").select("*");

  return json({ data, error });
}

const UsersPage = () => {
  const { data, error } = useLoaderData<typeof loader>();
  const users = data;

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

        {users?.length === 0 ? (
          <p className="p-4">No food yet.</p>
        ) : (
          <ol>
            {users?.map((user, idx) => (
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
        <Outlet context={users}/>
      </div>
    </main>
  );
};

export default UsersPage;
