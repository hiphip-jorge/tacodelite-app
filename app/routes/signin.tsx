import type { ActionArgs, LoaderArgs, MetaFunction } from "@remix-run/node";
import { json, redirect } from "@remix-run/node";
import { Form, useActionData } from "@remix-run/react";
import * as React from "react";

import { validateEmail } from "~/utils";
import taco_delite from "~/assets/td-logo_2021.webp";

import { createServerClient } from "@supabase/auth-helpers-remix";
import { isProfileSignedIn } from "~/modules/profiles.server";

export async function loader({ request }: LoaderArgs) {
  const response = new Response();
  const isSignedIn = await isProfileSignedIn(request);

  if (isSignedIn) {
    return redirect("/store", {
      headers: response.headers,
    });
  }

  return json({});
}

export async function action({ request }: ActionArgs) {
  const formData = await request.formData();
  const email = formData.get("email");
  const password = formData.get("password");

  const response = new Response();
  const supabase = createServerClient(
    process.env.SUPABASE_URL!,
    process.env.SUPABASE_ANON_KEY!,
    { request, response }
  );

  if (!validateEmail(email)) {
    return json(
      { errors: { email: "Email is invalid", password: null } },
      { status: 400 }
    );
  }

  if (typeof password !== "string" || password.length === 0) {
    return json(
      { errors: { email: null, password: "Password is required" } },
      { status: 400 }
    );
  }

  if (password.length < 8) {
    return json(
      { errors: { email: null, password: "Password is too short" } },
      { status: 400 }
    );
  }

  if (process.env.VALID_EMAILS?.includes(email)) {
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (!error) {
      return redirect("/store", { headers: response.headers });
    } else {
      return json(
        { errors: { email: null, password: String(error) } },
        { status: 403 }
      );
    }
  } else {
    return json(
      { errors: { email: "Invalid email", password: null } },
      { status: 403 }
    );
  }
}

export const meta: MetaFunction = () => {
  return {
    title: "Taco Delite | Sign in",
  };
};

export default function LoginPage() {
  const actionData = useActionData<typeof action>();
  const emailRef = React.useRef<HTMLInputElement>(null);
  const passwordRef = React.useRef<HTMLInputElement>(null);

  React.useEffect(() => {
    if (actionData?.errors?.email) {
      emailRef.current?.focus();
    } else if (actionData?.errors?.password) {
      passwordRef.current?.focus();
    }
  }, [actionData]);

  return (
    <div className="flex min-h-full flex-col items-center justify-center">
      <div className="mx-auto w-full max-w-md px-8">
        <a className="flex justify-center" href="/">
          <img src={taco_delite} alt="taco delite logo" className="w-28" />
        </a>
        <Form className="flex flex-col gap-2" method="post">
          {/* <label htmlFor="">email</label>
        <input className="border" type="email" /> */}
          <div>
            <label
              htmlFor="email"
              className="block text-sm font-medium text-gray-700"
            >
              Email address
            </label>
            <div className="mt-1">
              <input
                ref={emailRef}
                id="email"
                required
                autoFocus={true}
                name="email"
                type="email"
                autoComplete="email"
                aria-invalid={actionData?.errors?.email ? true : undefined}
                aria-describedby="email-error"
                className="w-full rounded border border-gray-500 px-2 py-1 text-lg"
              />
              {actionData?.errors?.email && (
                <div className="pt-1 text-red-700" id="email-error">
                  {actionData.errors.email}
                </div>
              )}
            </div>
          </div>

          <div>
            <label
              htmlFor="password"
              className="block text-sm font-medium text-gray-700"
            >
              Password
            </label>
            <div className="mt-1">
              <input
                id="password"
                ref={passwordRef}
                name="password"
                type="password"
                autoComplete="current-password"
                aria-invalid={actionData?.errors?.password ? true : undefined}
                aria-describedby="password-error"
                className="w-full rounded border border-gray-500 px-2 py-1 text-lg"
              />
              {actionData?.errors?.password && (
                <div className="pt-1 text-red-700" id="password-error">
                  {actionData.errors.password}
                </div>
              )}
            </div>
          </div>

          <button type="submit" className="bg-blue-500 p-2 text-white">
            sign in
          </button>
        </Form>
      </div>
    </div>
  );
}
