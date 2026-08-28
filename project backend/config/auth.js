import "dotenv/config";

// Single source of truth for how the auth token is signed and carried. Both the
// signer (userController.loginUser) and the verifier (AuthMiddleware) import from
// here — the secret used to be a hardcoded literal duplicated across those two
// files, so rotating it meant editing both and hoping they stayed in sync.
export const AUTH_COOKIE_NAME = "authToken";
export const JWT_EXPIRES_IN = "2d";
export const JWT_SECRET = process.env.JWT_SECRET;

// Fail at boot rather than at the first login attempt. Without this, an unset
// secret surfaces as jsonwebtoken's "secretOrPrivateKey must have a value" on
// whichever request happens to hit /login first — far from the actual cause.
if (!JWT_SECRET) {
  throw new Error(
    "JWT_SECRET is not set. Add it to project backend/.env before starting the server.",
  );
}

const TWO_DAYS_MS = 2 * 24 * 60 * 60 * 1000;

// The token lives in an httpOnly cookie so page JavaScript can't read it — that is
// the whole point of this setup, and why an XSS can no longer walk off with a
// 2-day session. The browser attaches it automatically instead.
export const authCookieOptions = {
  httpOnly: true,
  // Keeps the cookie off cross-site requests, which is what stands in for CSRF
  // protection here. Ports don't count for SameSite, so localhost:5173 -> :9000 is
  // same-site and works in dev. NOTE: if the API ever moves to a different
  // registrable domain than the frontend, "lax" stops being sufficient and this
  // needs SameSite=None plus a real CSRF token.
  sameSite: "lax",
  // Only send over HTTPS in production; dev runs on plain http://localhost.
  secure: process.env.NODE_ENV === "production",
  // Matches JWT_EXPIRES_IN so the cookie and the token it carries expire together.
  maxAge: TWO_DAYS_MS,
  path: "/",
};
