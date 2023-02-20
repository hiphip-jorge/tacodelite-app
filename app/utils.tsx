import { useMatches } from "@remix-run/react";
import { useMemo } from "react";
import { useInView } from "react-intersection-observer";

import type { User } from "~/models/user.server";
import type { modalContent } from "./routes";

const DEFAULT_REDIRECT = "/";

/**
 * This should be used any time the redirect path is user-provided
 * (Like the query string on our login/signup pages). This avoids
 * open-redirect vulnerabilities.
 * @param {string} to The redirect destination
 * @param {string} defaultRedirect The redirect to use if the to is unsafe.
 */
export function safeRedirect(
  to: FormDataEntryValue | string | null | undefined,
  defaultRedirect: string = DEFAULT_REDIRECT
) {
  if (!to || typeof to !== "string") {
    return defaultRedirect;
  }

  if (!to.startsWith("/") || to.startsWith("//")) {
    return defaultRedirect;
  }

  return to;
}

/**
 * This base hook is used in other hooks to quickly search for specific data
 * across all loader data using useMatches.
 * @param {string} id The route id
 * @returns {JSON|undefined} The router data or undefined if not found
 */
export function useMatchesData(
  id: string
): Record<string, unknown> | undefined {
  const matchingRoutes = useMatches();
  const route = useMemo(
    () => matchingRoutes.find((route) => route.id === id),
    [matchingRoutes, id]
  );
  return route?.data;
}

function isUser(user: any): user is User {
  return user && typeof user === "object" && typeof user.email === "string";
}

export function useOptionalUser(): User | undefined {
  const data = useMatchesData("root");
  if (!data || !isUser(data.user)) {
    return undefined;
  }
  return data.user;
}

export function useUser(): User {
  const maybeUser = useOptionalUser();
  if (!maybeUser) {
    throw new Error(
      "No user found in root loader, but user is required by useUser. If user is optional, try useOptionalUser instead."
    );
  }
  return maybeUser;
}

export function validateEmail(email: unknown): email is string {
  return typeof email === "string" && email.length > 3 && email.includes("@");
}

// index.tsx

export let aboutUs_p = `Taco Delite West Plano opened in Feburary of 1989 and is located at
the Prairie Creek Village Shopping Center. Since then, Taco Delite has
earned 4 "Food Safety and Excellence" nominations and continues to
claim the best customers, separating itself as a prestige fast food
restaurant in one of the most competitive cities in Texas.`;

// components/modal.tsx

export const buttons = (
  item: modalContent,
  handleClose: Function | undefined
) => {
  return (
    <button
      className="h-full w-full text-center font-primary-solid text-lg md:text-3xl"
      onClick={(e) => {
        handleClose && handleClose(e);
        scrollTo(item.name);
      }}
    >
      {item.name}
    </button>
  );
};

export const links = (item: modalContent) => (
  <a
    className="h-full w-full text-center font-primary-solid text-lg md:text-3xl"
    href={item.url}
  >
    {item.name}
  </a>
);

export const scrollTo = (id: string) => {
  const getMeTo = document.getElementById(id);
  getMeTo && getMeTo.scrollIntoView({ behavior: "smooth", block: "center" });
};

export const useCategoryInView = () => {
  let inView = [];
  let hasInView = false;

  const breakfastInView = useInView();
  const tacosInView = useInView();
  const burritosInView = useInView();
  const nachosInView = useInView();
  const saladsInView = useInView();
  const quesadillasInView = useInView();
  const tostadasInView = useInView();
  const sidesInView = useInView();
  const extrasInView = useInView();
  const chipsNstuffInView = useInView();
  const dinnersInView = useInView();
  const familyInView = useInView();
  const dessertsInView = useInView();
  const drinksInView = useInView();

  let categoryRefs = [
    breakfastInView,
    tacosInView,
    burritosInView,
    nachosInView,
    saladsInView,
    quesadillasInView,
    tostadasInView,
    sidesInView,
    extrasInView,
    chipsNstuffInView,
    dinnersInView,
    familyInView,
    dessertsInView,
    drinksInView,
  ];

  for (let i = categoryRefs.length - 1; i >= 0; i--) {
    if (categoryRefs[i].inView && !hasInView) {
      hasInView = true;
      inView.push(true);
    } else {
      inView.push(false);
    }
  }

  return { inView: inView.reverse(), categoryRefs };
};
