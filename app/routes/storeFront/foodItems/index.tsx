import { Link, useActionData } from "@remix-run/react";
import {
  seedCategories,
  seedFoodItems,
  getFoodItemList,
  getCategoryList,
} from "~/models/foodItem.server";
import { Form } from "@remix-run/react";
import { useEffect, useRef } from "react";
import { ActionArgs, json } from "@remix-run/node";

export async function action({ request, params }: ActionArgs) {
  let formData = await request.formData();
  let { _action } = Object.fromEntries(formData);

  const foodList = getFoodItemList();
  const categoryList = getCategoryList();

  if (_action === "Add Original Food Items" && (await foodList).length) {
    return json(
      { errors: { category: null, foodItems: "Food Items already exist." } },
      { status: 400 }
    );
  } else if (_action === "Add Original Food Items") {
    seedFoodItems();
  }

  if (_action === "Create categories" && (await categoryList).length) {
    return json(
      { errors: { category: "Categories already exist.", foodItems: null } },
      { status: 400 }
    );
  } else if (_action === "Create categories") {
    seedCategories();
  }

  return json({ errors: null }, { status: 200 });
}

export default function FoodItemIndexPage() {
  const actionData = useActionData<typeof action>();
  const categoryRef = useRef<HTMLInputElement>(null);
  const foodItemsRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (actionData?.errors?.category) {
      categoryRef.current?.focus();
    }
    if (actionData?.errors?.foodItems) {
      foodItemsRef.current?.focus();
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
      <Form method="post" className="flex w-64 flex-col">
        <input
          name="_action"
          ref={categoryRef}
          type="submit"
          className="mt-12 mb-4 rounded-xl bg-purple-200 p-4 shadow-md duration-300 hover:bg-purple-100 hover:shadow-xl"
          value="Create categories"
        />
        {actionData?.errors?.category && (
          <div className="pt-1 text-red-700" id="category-error">
            {actionData.errors.category}
          </div>
        )}
        <input
          name="_action"
          ref={foodItemsRef}
          type="submit"
          className="mt-12 mb-4 rounded-xl bg-orange-300 p-4 shadow-md duration-300 hover:bg-orange-200 hover:shadow-xl"
          value="Add Original Food Items"
        />
        {actionData?.errors?.foodItems && (
          <div className="pt-1 text-red-700" id="category-error">
            {actionData.errors.foodItems}
          </div>
        )}
      </Form>
    </div>
  );
}
