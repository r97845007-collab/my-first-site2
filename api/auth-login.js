import bcrypt from "bcryptjs";
import { query } from "../lib/db.js";
import { parseJsonBody, sendJson } from "../lib/http.js";
import { buildSessionCookie, signJwt } from "../lib/auth.js";

export default async function handler(req, res) {
  if (req.method !== "POST") {
    res.setHeader("Allow", "POST");
    return sendJson(res, 405, { error: "Method not allowed" });
  }

  try {
    const { email, password } = await parseJsonBody(req);
    if (!email || !password) {
      return sendJson(res, 400, { error: "Email and password required" });
    }
    const rows = await query("SELECT id, password_hash FROM users WHERE email = ?", [email]);
    if (!rows.length) {
      return sendJson(res, 401, { error: "Invalid credentials" });
    }
    const user = rows[0];
    const match = await bcrypt.compare(password, user.password_hash);
    if (!match) {
      return sendJson(res, 401, { error: "Invalid credentials" });
    }
    const token = signJwt({ userId: user.id });
    res.setHeader("Set-Cookie", buildSessionCookie(token));
    return sendJson(res, 200, { ok: true });
  } catch (error) {
    return sendJson(res, 500, { error: "Server error" });
  }
}
