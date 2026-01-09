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
    if (!email || !email.includes("@")) {
      return sendJson(res, 400, { error: "Invalid email" });
    }
    if (!password || password.length < 8) {
      return sendJson(res, 400, { error: "Password too short" });
    }
    const existing = await query("SELECT id FROM users WHERE email = ?", [email]);
    if (existing.length) {
      return sendJson(res, 400, { error: "Email already registered" });
    }
    const passwordHash = await bcrypt.hash(password, 12);
    const result = await query("INSERT INTO users (email, password_hash) VALUES (?, ?)", [
      email,
      passwordHash,
    ]);
    const token = signJwt({ userId: result.insertId });
    res.setHeader("Set-Cookie", buildSessionCookie(token));
    return sendJson(res, 200, { ok: true });
  } catch (error) {
    return sendJson(res, 500, { error: "Server error" });
  }
}
