import { Link } from "@remix-run/react";
import { createFoodCategories } from "~/models/foodItem.server";
import { Form } from "@remix-run/react";

export async function action() {
  createFoodCategories();
  return null;
}

export default function FoodItemIndexPage() {
  return (
    <div>
      <p>
        No item selected. Select a food item on the left, or{" "}
        <Link to="new" className="text-blue-500 underline">
          add a new food item.
        </Link>
      </p>
      <Form method="post">
        <button
          type="submit"
          onClick={createFoodCategories}
          className="mt-12 rounded-xl bg-green-200 p-4 shadow-md hover:bg-green-100"
        >
          Create categories
        </button>
      </Form>
    </div>
  );
}
