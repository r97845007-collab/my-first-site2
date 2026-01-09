import jwt from "jsonwebtoken";
import { parseCookies } from "./http.js";

const COOKIE_NAME = "session";
const WEEK = 60 * 60 * 24 * 7;

const isSecureCookie = () => {
  const origin = process.env.APP_ORIGIN || "";
  return origin.startsWith("https://");
};

export const signJwt = (payload) =>
  jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: "7d" });

export const verifyJwt = (token) => {
  try {
    return jwt.verify(token, process.env.JWT_SECRET);
  } catch (error) {
    return null;
  }
};

export const getUserIdFromRequest = (req) => {
  const cookies = parseCookies(req);
  if (!cookies[COOKIE_NAME]) return null;
  const payload = verifyJwt(cookies[COOKIE_NAME]);
  return payload?.userId || null;
};

export const buildSessionCookie = (token) => {
  const secure = isSecureCookie();
  const parts = [
    `${COOKIE_NAME}=${token}`,
    "HttpOnly",
    "Path=/",
    "SameSite=Lax",
    `Max-Age=${WEEK}`,
  ];
  if (secure) parts.push("Secure");
  return parts.join("; ");
};

export const clearSessionCookie = () => {
  const secure = isSecureCookie();
  const parts = [
    `${COOKIE_NAME}=`,
    "HttpOnly",
    "Path=/",
    "SameSite=Lax",
    "Max-Age=0",
  ];
  if (secure) parts.push("Secure");
  return parts.join("; ");
};
