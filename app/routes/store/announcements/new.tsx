import type { ActionArgs } from "@remix-run/node";
import { json, redirect } from "@remix-run/node";
import { Form, useActionData } from "@remix-run/react";
import { useEffect, useRef } from "react";

// export async function loader({ request }: DataFunctionArgs) {
//   return await requireAdminUser(request, "/storeFront");
// }

export async function action({ request }: ActionArgs) {
  const formData = await request.formData();
  const title = String(formData.get("title"));
  const message = String(formData.get("message"));

  const startDate = new Date();
  const endDate = String(formData.get("endDate"));

  if (title?.length === 0) {
    return json(
      {
        errors: {
          title: "No title has been entered",
          message: null,
          endDate: null,
        },
      },
      { status: 400 }
    );
  }

  if (message?.length === 0) {
    return json(
      {
        errors: {
          title: null,
          message: "No message has been entered",
          endDate: null,
        },
      },
      { status: 400 }
    );
  }

  if (message.length > 120) {
    return json(
      {
        errors: { title: null, message: "message is too long", endDate: null },
      },
      { status: 400 }
    );
  }

  if (Date.parse(endDate) < Date.parse(startDate.toISOString())) {
    console.log("endDate", Date.parse(endDate));
    console.log("startDate", Date.parse(startDate.toISOString()));

    return json(
      {
        errors: {
          title: null,
          message: null,
          endDate: "End date cannot be before today",
        },
      },
      { status: 400 }
    );
  }

  //  TODO: creation of announcement
  const announcement = {
    id: 1,
    endDate: new Date(endDate),
    title,
    message,
  };

  return redirect(`../${announcement.id}`);
}

export default function NewNotePage() {
  const actionData = useActionData<typeof action>();
  const titleRef = useRef<HTMLInputElement>(null);
  const messageRef = useRef<HTMLInputElement>(null);
  const endDateRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (actionData?.errors?.title) {
      titleRef.current?.focus();
    } else if (actionData?.errors?.message) {
      messageRef.current?.focus();
    } else if (actionData?.errors?.endDate) {
      endDateRef.current?.focus();
    }
  }, [actionData]);

  return (
    <Form method="post" className="space-y-6">
      <div>
        <label
          htmlFor="title"
          className="block text-sm font-medium text-gray-700"
        >
          Title
        </label>
        <div className="mt-1">
          <input
            ref={titleRef}
            id="title"
            required
            autoFocus={true}
            name="title"
            aria-invalid={actionData?.errors?.title ? true : undefined}
            aria-describedby="title-error"
            className="w-full rounded border border-gray-500 px-2 py-1 text-lg"
          />
          {actionData?.errors?.title && (
            <div className="pt-1 text-red-700" id="email-error">
              {actionData.errors.title}
            </div>
          )}
        </div>
      </div>

      <div>
        <label
          htmlFor="message"
          className="block text-sm font-medium text-gray-700"
        >
          Message
        </label>
        <div className="mt-1">
          <input
            ref={messageRef}
            id="message"
            required
            maxLength={120}
            autoFocus={true}
            name="message"
            aria-invalid={actionData?.errors?.message ? true : undefined}
            aria-describedby="message-error"
            className="w-full rounded border border-gray-500 px-2 py-1 text-lg"
          />
          {actionData?.errors?.message && (
            <div className="pt-1 text-red-700" id="email-error">
              {actionData.errors.message}
            </div>
          )}
        </div>
      </div>

      <div>
        <label
          htmlFor="message"
          className="block text-sm font-medium text-gray-700"
        >
          End Date
        </label>
        <div className="mt-1">
          <input
            type="date"
            ref={endDateRef}
            id="endDate"
            required
            autoFocus={true}
            min={new Date().toDateString()}
            name="endDate"
            aria-invalid={actionData?.errors?.endDate ? true : undefined}
            aria-describedby="endDate-error"
            className="w-full rounded border border-gray-500 px-2 py-1 text-lg"
          />
          {actionData?.errors?.endDate && (
            <div className="pt-1 text-red-700" id="email-error">
              {actionData.errors.endDate}
            </div>
          )}
        </div>
      </div>

      <button
        type="submit"
        className="w-full rounded bg-yellow-500  py-2 px-4 text-white hover:bg-yellow-600 focus:bg-yellow-400"
      >
        Create Announcement
      </button>
    </Form>
  );
}
