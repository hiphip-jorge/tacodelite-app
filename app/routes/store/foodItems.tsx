import { Outlet, useLoaderData } from "@remix-run/react";
import type { LoaderArgs } from "@remix-run/server-runtime";
import { createServerClient } from "@supabase/auth-helpers-remix";
import { Link, NavLink } from "react-router-dom";

export async function loader({ request }: LoaderArgs) {
  const response = new Response();
  const supabase = createServerClient(
    process.env.SUPABASE_URL!,
    process.env.SUPABASE_ANON_KEY!,
    { request, response }
  );

  const { data, error } = await supabase.from("menu").select("*").order("id");

  return { data, error };
}

const FoodItemsPage = () => {
  const { data } = useLoaderData<typeof loader>();

  return (
    <main className="flex h-full bg-white">
      <div className="h-full w-1/3 overflow-scroll border-r bg-gray-50 md:w-80">
        <Link
          to="new"
          className="block bg-gray-100 p-4 text-xl text-green-primary hover:bg-green-light"
        >
          + New Food Item
        </Link>

        <hr />

        {data?.length === 0 ? (
          <p className="p-4">No food yet.</p>
        ) : (
          <ol>
            {data?.map((item, idx) => (
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

      <div className="w-2/3 flex-1 p-8 text-sm md:w-auto md:text-base">
        <Outlet context={data} />
      </div>
    </main>
  );
};

export default FoodItemsPage;
