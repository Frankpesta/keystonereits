import "server-only";
import { cookies } from "next/headers";

export const USER_SESSION_COOKIE = "keystone_user_session";
export const ADMIN_SESSION_COOKIE = "keystone_admin_session";

const isProd = process.env.NODE_ENV === "production";

function cookieOptions(expiresAt: number) {
  return {
    httpOnly: true,
    secure: isProd,
    sameSite: "lax" as const,
    path: "/",
    expires: new Date(expiresAt),
  };
}

async function setSessionCookie(name: string, token: string, expiresAt: number) {
  const store = await cookies();
  store.set(name, token, cookieOptions(expiresAt));
}

async function clearSessionCookie(name: string) {
  const store = await cookies();
  store.delete(name);
}

async function getSessionToken(name: string): Promise<string | undefined> {
  const store = await cookies();
  return store.get(name)?.value;
}

export const setUserSessionCookie = (token: string, expiresAt: number) =>
  setSessionCookie(USER_SESSION_COOKIE, token, expiresAt);
export const clearUserSessionCookie = () => clearSessionCookie(USER_SESSION_COOKIE);
export const getUserSessionToken = () => getSessionToken(USER_SESSION_COOKIE);

export const setAdminSessionCookie = (token: string, expiresAt: number) =>
  setSessionCookie(ADMIN_SESSION_COOKIE, token, expiresAt);
export const clearAdminSessionCookie = () => clearSessionCookie(ADMIN_SESSION_COOKIE);
export const getAdminSessionToken = () => getSessionToken(ADMIN_SESSION_COOKIE);
