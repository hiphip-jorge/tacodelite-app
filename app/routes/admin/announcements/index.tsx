import { Link } from "@remix-run/react";

export default function AnnouncementsIndexPage() {
  return (
    <p>
      No item selected. Select an announcement on the left, or{" "}
      <Link to="new" className="text-yellow-500 underline">
        add a new announcement.
      </Link>
    </p>
  );
}
