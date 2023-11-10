import { Outlet, useLoaderData } from "@remix-run/react";
import { Link, NavLink } from "react-router-dom";
import { getFoodItemList } from "~/models/foodItem.server";

export async function loader() {
  
  const foodItemList = await getFoodItemList();
  return foodItemList;
}

const FoodItemsPage = () => {
  const foodItemList = useLoaderData<typeof loader>();

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

      <div className="w-2/3 flex-1 p-8 md:w-auto text-sm md:text-base">
        <Outlet />
      </div>
    </main>
  );
};

export default FoodItemsPage;
