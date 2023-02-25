import type { ActionArgs, LoaderArgs } from "@remix-run/node";
import { json, redirect } from "@remix-run/node";
import { Form, useCatch, useLoaderData } from "@remix-run/react";
import { getCategory } from "prisma/seed-utils";
import { useState } from "react";
import invariant from "tiny-invariant";
import {
  deleteFoodItem,
  getFoodItem,
  updateFoodItem,
} from "~/models/foodItem.server";
import { cancel_icon, edit_icon } from "~/assets/svg";

export async function loader({ params }: LoaderArgs) {
  const item = await getFoodItem({ id: Number(params.foodItemId) });
  invariant(params.foodItemId, "foodItemId not found");

  if (!item) {
    throw new Response("Not Found", { status: 404 });
  }

  return json({ item });
}

export async function action({ request, params }: ActionArgs) {
  let formData = await request.formData();
  let { _action, ...values } = Object.fromEntries(formData);

  invariant(params.foodItemId, "foodItemId not found");

  if (_action === "delete") {
    await deleteFoodItem({ id: Number(params.foodItemId) });

    return redirect("/admin/foodItems");
  } else {
    const item = await getFoodItem({ id: Number(params.foodItemId) });

    let name = values.name ? values.name : item?.name;
    name = String(name) || "unknown name";
    let categoryId = values.categoryId
      ? Number(values.categoryId)
      : item?.categoryId;
    categoryId = categoryId || 0;
    let description = values.description
      ? values.description
      : item?.description;
    description = String(description) || "unknown description";
    let price = values.price ? values.price : item?.price;
    price = String(price) || "0.00";
    const active = values.active === "true";
    const vegetarian = values.vegetarian === "true";

    await updateFoodItem({
      name,
      categoryId,
      description,
      price,
      active,
      vegetarian,
      id: Number(params.foodItemId),
    });
  }

  return redirect(`/admin/foodItems/${params.foodItemId}`);
}

export default function FoodItemDetailsPage() {
  const data = useLoaderData<typeof loader>();
  const [inEditMode, setInEditMode] = useState(false);
  const categoryId = data.item.categoryId ? data.item.categoryId - 1 : 0;
  const category = getCategory()[categoryId].name;

  return (
    <main>
      {inEditMode ? (
        <Form method="post">
          <div className="flex items-center justify-between">
            <input
              name="name"
              placeholder={data.item.name}
              className="rounded-xl border-2 border-gray-100 p-2 text-2xl font-bold capitalize text-green-dark"
            />
            <button
              className="w-10 rounded-lg border-2 border-red-500 bg-red-300 p-2 hover:bg-red-200"
              onClick={() => setInEditMode((prev) => !prev)}
            >
              {cancel_icon}
            </button>
          </div>
          <div className="my-4 flex flex-col">
            <label className="text-green-800">Category:</label>

            <select
              className="rounded-lg border-2 border-gray-100 p-2"
              name="categoryId"
              id="category"
            >
              {getCategory().map((category, idx) => {
                return (
                  <option key={idx} value={category.id}>
                    {category.name}
                  </option>
                );
              })}
            </select>
          </div>
          <div className="my-4 flex flex-col">
            <label className="text-green-800">Description:</label>
            <textarea
              name="description"
              placeholder={data.item.description}
              className={"rounded-lg border-2 border-gray-100 p-2"}
            />
          </div>
          <div className="my-4 flex flex-col">
            <label className="text-green-800">Price:</label>
            <div className="flex items-center gap-1">
              <span>$</span>
              <input
                type="text"
                name="price"
                placeholder={data.item.price}
                className={"rounded-lg border-2 border-gray-100 p-2"}
              />
            </div>
          </div>
          <fieldset className="my-4 flex flex-col">
            <legend className="text-green-800">Currently Active:</legend>

            <div className="flex items-center gap-2">
              <input
                type="radio"
                id="true"
                name="active"
                value="true"
                checked={data.item.active}
                readOnly
              />
              <label className="self-end">True</label>
            </div>

            <div className="flex items-center gap-2">
              <input
                type="radio"
                id="false"
                name="active"
                value="false"
                checked={!data.item.active}
                readOnly
              />
              <label className="self-end">False</label>
            </div>
          </fieldset>
          <fieldset className="my-4 flex flex-col">
            <legend className="text-green-800">Vegetarian:</legend>

            <div className="flex items-center gap-2">
              <input
                type="radio"
                id="true"
                name="vegetarian"
                value="true"
                checked={data.item.vegetarian}
                readOnly
              />
              <label className="self-end">True</label>
            </div>

            <div className="flex items-center gap-2">
              <input
                type="radio"
                id="false"
                name="vegetarian"
                value="false"
                checked={!data.item.vegetarian}
                readOnly
              />
              <label className="self-end">False</label>
            </div>
          </fieldset>

          <hr className="my-4" />

          <button
            name="_action"
            value="update"
            onClick={() => {
              setTimeout(() => {
                setInEditMode(false);
              }, 1000);
            }}
            type="submit"
            className="w-24 rounded bg-blue-500 py-2  px-4 text-center text-white hover:bg-blue-600 focus:bg-blue-400"
          >
            Update
          </button>
        </Form>
      ) : (
        <Form method="post">
          <section>
            <div className="flex items-center justify-between">
              <h3 className="text-2xl font-bold capitalize text-green-dark">
                {data.item.name}
              </h3>
              <button
                className="w-10 rounded-lg border-2 border-green-dark bg-green-light p-2 hover:bg-green-200"
                onClick={() => setInEditMode((prev) => !prev)}
              >
                {edit_icon}
              </button>
            </div>
            <div className="my-4 flex flex-col">
              <span className="text-green-800">Category:</span>
              <p>{category}</p>
            </div>
            <div className="my-4 flex flex-col">
              <span className="text-green-800">Description:</span>
              <p>{data.item.description}</p>
            </div>
            <div className="my-4 flex flex-col">
              <span className="text-green-800">Price:</span>
              <p>${data.item.price}</p>
            </div>
            <div className="my-4 flex flex-col">
              <span className="text-green-800">Currently Active:</span>
              <p>{data.item.active ? "True" : "False"}</p>
            </div>
            <div className="my-4 flex flex-col">
              <span className="text-green-800">Vegetarian:</span>
              <p>{data.item.vegetarian ? "True" : "False"}</p>
            </div>
          </section>

          <hr className="my-4" />

          <button
            name="_action"
            value="delete"
            type="submit"
            className="w-24 rounded bg-red-500 py-2  px-4 text-center text-white hover:bg-blue-600 focus:bg-blue-400"
          >
            Delete
          </button>
        </Form>
      )}
    </main>
  );
}

export function ErrorBoundary({ error }: { error: Error }) {
  console.error(error);

  return <div>An unexpected error occurred: {error.message}</div>;
}

export function CatchBoundary() {
  const caught = useCatch();

  if (caught.status === 404) {
    return <div>Food item not found</div>;
  }

  throw new Error(`Unexpected caught response with status: ${caught.status}`);
}
