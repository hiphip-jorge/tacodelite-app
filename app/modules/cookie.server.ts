import { createCookie } from "@remix-run/node";

export const lastMenuUpdateCookie = createCookie('lastMenuUpdate', {
    maxAge: 31_535_000, // one year
})