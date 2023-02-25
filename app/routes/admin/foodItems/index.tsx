import { Link } from "@remix-run/react";

export default function FoodItemIndexPage() {
  return (
    <p>
      No item selected. Select a food item on the left, or{" "}
      <Link to="new" className="text-blue-500 underline">
        add a new food item.
      </Link>
    </p>
  );
}
