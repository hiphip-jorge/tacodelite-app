import type { DataFunctionArgs } from "@remix-run/node";

export async function loader({ request }: DataFunctionArgs) {
  const { pathname } = new URL(request.url);
  const url = `http://localhost:5555${pathname.replace("/prisma-studio", "")}`;
  return fetch(url, {
    headers: request.headers,
  });
}

export async function action({ request }: DataFunctionArgs) {
  // await requireAdminUser(request);
  const { pathname } = new URL(request.url);
  const url = `http://localhost:5555${pathname.replace("/prisma-studio", "")}`;
  return fetch(url, {
    method: request.method,
    body: request.body,
    headers: request.headers,
  });
}
