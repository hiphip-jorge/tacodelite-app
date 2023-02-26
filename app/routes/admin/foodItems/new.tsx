import type { ActionArgs } from "@remix-run/node";
import { json, redirect } from "@remix-run/node";
import { Form, useActionData } from "@remix-run/react";
import { getCategory } from "prisma/seed-utils";
import { useEffect, useRef } from "react";
import { createFoodItem } from "~/models/foodItem.server";
import { validatePrice } from "~/utils";

export async function action({ request }: ActionArgs) {
  const formData = await request.formData();
  let { ...values } = Object.fromEntries(formData);

  const name = String(values.name);
  const category = String(values.category);
  const description = String(values.description);
  const price = String(values.price);
  const active = values.active == "on" && true;
  const vegetarian = values.vegetarian == "on" && true;

  let newItem = { name, category, description, price, active, vegetarian };

  if (name?.length === 0) {
    return json(
      {
        errors: {
          name: "No name has been entered",
          description: null,
          price: null,
        },
      },
      { status: 400 }
    );
  }

  if (description?.length === 0) {
    return json(
      {
        errors: {
          name: null,
          description: "No name has been entered",
          price: null,
        },
      },
      { status: 400 }
    );
  }

  if (!validatePrice(price)) {
    return json(
      {
        errors: {
          name: null,
          description: null,
          price: "price is invalid",
        },
      },
      { status: 400 }
    );
  }

  const foodItem = await createFoodItem(newItem);

  return redirect(`../${foodItem.id}`);
}

export default function NewFoodItemPage() {
  const actionData = useActionData<typeof action>();
  const nameRef = useRef<HTMLInputElement>(null);
  const descriptionRef = useRef<HTMLInputElement>(null);
  const priceRef = useRef<HTMLInputElement>(null);

  console.log("actionData", actionData);

  useEffect(() => {
    if (actionData?.errors?.name) {
      nameRef.current?.focus();
    } else if (actionData?.errors?.description) {
      descriptionRef.current?.focus();
    } else if (actionData?.errors?.price) {
      priceRef.current?.focus();
    }
  }, [actionData]);

  return (
    <Form method="post" className="space-y-6">
      <div>
        <label
          htmlFor="name"
          className="block text-sm font-medium text-gray-700"
        >
          Name
        </label>
        <div className="mt-1">
          <input
            ref={nameRef}
            id="name"
            required
            autoFocus={true}
            name="name"
            aria-invalid={actionData?.errors?.name ? true : undefined}
            aria-describedby="name-error"
            className="w-full rounded border border-gray-500 px-2 py-1 text-lg"
          />
          {actionData?.errors?.name && (
            <div className="pt-1 text-red-700" id="name-error">
              {actionData.errors.name}
            </div>
          )}
        </div>
      </div>

      <div>
        <label
          htmlFor="category"
          className="block text-sm font-medium text-gray-700"
        >
          Category
        </label>
        <div className="mt-1">
          <select
            name="category"
            id="category"
            className="select w-full appearance-none rounded border border-gray-500 px-2 py-1 text-lg"
            autoFocus={true}
          >
            {getCategory().map((category, idx) => {
              return (
                <option key={idx} value={category.name}>
                  {category.name}
                </option>
              );
            })}
          </select>
        </div>
      </div>

      <div>
        <label
          htmlFor="description"
          className="block text-sm font-medium text-gray-700"
        >
          Description
        </label>
        <div className="mt-1">
          <input
            ref={descriptionRef}
            id="description"
            required
            autoFocus={true}
            name="description"
            aria-invalid={actionData?.errors?.description ? true : undefined}
            aria-describedby="description-error"
            className="w-full rounded border border-gray-500 px-2 py-1 text-lg"
          />
          {actionData?.errors?.description && (
            <div className="pt-1 text-red-700" id="description-error">
              {actionData.errors.description}
            </div>
          )}
        </div>
      </div>
      <div className="w-20">
        <label
          htmlFor="price"
          className="block text-sm font-medium text-gray-700"
        >
          Price
        </label>
        <div className="mt-1 flex items-center gap-2">
          $
          <input
            ref={priceRef}
            id="price"
            required
            autoFocus={true}
            placeholder="x.xx"
            name="price"
            aria-invalid={actionData?.errors?.price ? true : undefined}
            aria-describedby="price-error"
            className="w-full rounded border border-gray-500 px-2 py-1 text-lg"
          />
          {actionData?.errors?.price && (
            <div className="pt-1 text-red-700" id="price-error">
              {actionData.errors.price}
            </div>
          )}
        </div>
      </div>
      <div className="flex gap-6">
        <div>
          <div className="flex gap-4">
            <label
              htmlFor="vegetarian"
              className="block text-sm font-medium text-gray-700"
            >
              Vegetarian
            </label>
            <input
              id="vegetarian"
              type="checkbox"
              autoFocus={true}
              placeholder="x.xx"
              name="vegetarian"
              aria-describedby="vegetarian-error"
              className="rounded border border-gray-500 px-2 py-1 text-lg"
            />
          </div>
        </div>
        <div>
          <div className="flex gap-4">
            <label
              htmlFor="active"
              className="block text-sm font-medium text-gray-700"
            >
              Active
            </label>
            <input
              id="active"
              type="checkbox"
              autoFocus={true}
              defaultChecked
              placeholder="x.xx"
              name="active"
              aria-describedby="active-error"
              className="rounded border border-gray-500 px-2 py-1 text-lg"
            />
          </div>
        </div>
      </div>

      <button
        type="submit"
        className="w-full rounded bg-green-primary  py-2 px-4 text-white hover:bg-green-dark focus:bg-green-400"
      >
        Add item
      </button>
    </Form>
  );
}
