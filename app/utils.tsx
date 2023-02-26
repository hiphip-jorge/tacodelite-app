import { useMatches } from "@remix-run/react";
import { useEffect, useMemo, useState } from "react";
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

// ./routes/admin/foodItems/new
export function validatePrice(price: unknown): price is string {
  if (typeof price === "string" && price.length >= 4 && price.length < 6) {
    if (!Number(price.at(0)) && price.at(0) !== "0") {
      return false;
    }
    if (!Number(price.at(1)) && price.at(1) !== "0" && price.at(1) !== ".") {
      return false;
    }
    if (!Number(price.at(2)) && price.at(2) !== "0" && price.at(2) !== ".") {
      return false;
    }
    if (!Number(price.at(3)) && price.at(3) !== "0") {
      return false;
    }
    if (price.length === 5 && !Number(price.at(4)) && price.at(4) !== "0") {
      return false;
    }
  } else {
    return false;
  }

  return true;
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
      className="h-full w-full text-center font-primary-solid text-lg md:text-2xl"
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
    className="h-full w-full text-center font-primary-solid text-lg md:text-2xl"
    href={item.url}
  >
    {item.name}
  </a>
);

export const scrollTo = (id: string, block = "center") => {
  const getMeTo = document.getElementById(id);
  if (getMeTo && block === "center") {
    getMeTo && getMeTo.scrollIntoView({ behavior: "smooth", block: "center" });
  } else if (getMeTo) {
    getMeTo && getMeTo.scrollIntoView({ behavior: "smooth" });
  }
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

  for (let i = 0; i < categoryRefs.length; i++) {
    if (categoryRefs[i].inView && !hasInView) {
      hasInView = true;
      inView.push(true);
    } else {
      inView.push(false);
    }
  }

  return { inView: inView, categoryRefs };
};

export function useWindowSize() {
  // Initialize state with undefined width/height so server and client renders match
  // Learn more here: https://joshwcomeau.com/react/the-perils-of-rehydration/
  const [windowSize, setWindowSize] = useState({ width: 0, height: 0 });
  useEffect(() => {
    // Handler to call on window resize
    function handleResize() {
      // Set window width/height to state
      setWindowSize({
        width: window.innerWidth,
        height: window.innerHeight,
      });
    }
    // Add event listener
    window.addEventListener("resize", handleResize);
    // Call handler right away so state gets updated with initial window size
    handleResize();
    // Remove event listener on cleanup
    return () => window.removeEventListener("resize", handleResize);
  }, []); // Empty array ensures that effect is only run on mount
  return windowSize;
}
