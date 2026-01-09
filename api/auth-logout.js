import { clearSessionCookie } from "../lib/auth.js";
import { sendJson } from "../lib/http.js";

export default async function handler(req, res) {
  if (req.method !== "POST") {
    res.setHeader("Allow", "POST");
    return sendJson(res, 405, { error: "Method not allowed" });
  }
  res.setHeader("Set-Cookie", clearSessionCookie());
  return sendJson(res, 200, { ok: true });
}
