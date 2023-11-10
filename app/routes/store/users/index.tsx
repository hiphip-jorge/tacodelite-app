import { Link } from "@remix-run/react";

export default function UsersIndexPage() {
  return (
    <p>
      No user selected. Select a user on the left, or{" "}
      <Link to="new" className="text-blue-500 underline">
        add a user.
      </Link>
    </p>
  );
}
