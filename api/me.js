import { query } from "../lib/db.js";
import { getUserIdFromRequest } from "../lib/auth.js";
import { sendJson } from "../lib/http.js";

export default async function handler(req, res) {
  if (req.method !== "GET") {
    res.setHeader("Allow", "GET");
    return sendJson(res, 405, { error: "Method not allowed" });
  }
  const userId = getUserIdFromRequest(req);
  if (!userId) {
    return sendJson(res, 401, { error: "Unauthorized" });
  }
  const rows = await query("SELECT id, email FROM users WHERE id = ?", [userId]);
  if (!rows.length) {
    return sendJson(res, 401, { error: "Unauthorized" });
  }
  return sendJson(res, 200, rows[0]);
}
