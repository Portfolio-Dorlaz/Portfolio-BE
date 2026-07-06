export const refreshCookieOptions = {
  httpOnly: process.env.NODE_ENV === "production",
  secure: process.env.NODE_ENV === "production",
  sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
  path: '/',
  maxAge: 7 * 24 * 60 * 60 * 1000,
};