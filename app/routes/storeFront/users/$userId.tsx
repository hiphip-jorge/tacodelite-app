import type { ActionArgs, LoaderArgs } from "@remix-run/node";
import { redirect } from "@remix-run/node";
import { Form, useCatch, useLoaderData } from "@remix-run/react";
import { useState } from "react";
import invariant from "tiny-invariant";
import { cancel_icon, edit_icon } from "~/assets/svg";
import { deleteUserById, getUserById, updateUser } from "~/models/user.server";

export async function loader({ params }: LoaderArgs) {
  const user = await getUserById(params.userId);
  invariant(params.userId, "userId not found");

  if (!user) {
    throw new Response("User Not Found", { status: 404 });
  }

  return { user };
}

export async function action({ request, params }: ActionArgs) {
  let formData = await request.formData();
  let { _action, ...values } = Object.fromEntries(formData);

  invariant(params.userId, "userId not found");

  if (_action === "delete") {
    await deleteUserById(params.userId);

    return redirect("/storeFront/users");
  } else {
    const user = await getUserById(params.userId);

    let name = values.name ? String(values.name) : user?.name;
    let email = values.email ? String(values.email) : user?.email;
    let role = String(values.role);
    console.log("role", role);

    await updateUser(params.userId, name, email, role);
  }

  return redirect(`/storeFront/users/${params.userId}`);
}

export default function FoodItemDetailsPage() {
  const { user } = useLoaderData<typeof loader>();
  const [inEditMode, setInEditMode] = useState(false);

  return (
    <main>
      {inEditMode ? (
        <Form method="post">
          <div className="flex items-center justify-between">
            <input
              name="name"
              placeholder={user.name}
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
            <label className="text-green-800">Email:</label>
            <input
              name="description"
              placeholder={user.email}
              type="email"
              className={"rounded-lg border-2 border-gray-100 p-2"}
            />
          </div>
          <div className="my-4 flex flex-col">
            <span className="text-green-800">Role:</span>
            <select
              className="select appearance-none rounded-lg border-2 border-gray-100 p-2"
              name="role"
              id="role"
              defaultValue={user.role}
            >
              <option value="MEMBER">MEMBER</option>
              <option value="ADMIN">ADMIN</option>
            </select>
          </div>
          <div className="my-4 flex flex-col">
            <span className="text-green-800">User since:</span>
            <p>{user.createdAt}</p>
          </div>
          <div className="my-4 flex flex-col">
            <span className="text-green-800">Last Update:</span>
            <p>{user.updatedAt}</p>
          </div>

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
                {user.name}
              </h3>
              <button
                className="w-10 rounded-lg border-2 border-green-dark bg-green-light p-2 hover:bg-green-200"
                onClick={() => setInEditMode((prev) => !prev)}
              >
                {edit_icon}
              </button>
            </div>
            <div className="my-4 flex flex-col">
              <span className="text-green-800">Email:</span>
              <p>{user.email}</p>
            </div>
            <div className="my-4 flex flex-col">
              <span className="text-green-800">Role:</span>
              <p>{user.role}</p>
            </div>
            <div className="my-4 flex flex-col">
              <span className="text-green-800">User since:</span>
              <p>{user.createdAt}</p>
            </div>
            <div className="my-4 flex flex-col">
              <span className="text-green-800">Last Update:</span>
              <p>{user.updatedAt}</p>
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
