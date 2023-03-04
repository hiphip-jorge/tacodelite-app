import { Link, useActionData } from "@remix-run/react";
import { createFoodCategories } from "~/models/foodItem.server";
import { Form } from "@remix-run/react";
import { useEffect, useRef } from "react";
import { json } from "@remix-run/node";

export async function action() {
  const categories = createFoodCategories();

  if (!(await categories).length) {
    return json(
      { errors: { category: "Categories already exist." } },
      { status: 400 }
    );
  }

  return json({ errors: null }, { status: 200 });
}

export default function FoodItemIndexPage() {
  const actionData = useActionData<typeof action>();
  const categoryRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (actionData?.errors?.category) {
      categoryRef.current?.focus();
    }
  }, [actionData]);

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
          ref={categoryRef}
          type="submit"
          onClick={createFoodCategories}
          className="mt-12 mb-4 rounded-xl bg-purple-200 p-4 shadow-md duration-300 hover:bg-purple-100 hover:shadow-xl"
        >
          Create categories
        </button>
        {actionData?.errors?.category && (
          <div className="pt-1 text-red-700" id="category-error">
            {actionData.errors.category}
          </div>
        )}
      </Form>
    </div>
  );
}
