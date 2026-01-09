import { getUserIdFromRequest } from "../lib/auth.js";
import { query } from "../lib/db.js";
import { parseJsonBody, sendJson } from "../lib/http.js";

export default async function handler(req, res) {
  const userId = getUserIdFromRequest(req);
  if (!userId) {
    return sendJson(res, 401, { error: "Unauthorized" });
  }

  if (req.method === "GET") {
    const rows = await query(
      "SELECT id, date, time_slot, route_tag, is_available FROM availability WHERE date >= CURDATE() AND date <= DATE_ADD(CURDATE(), INTERVAL 30 DAY) ORDER BY date, time_slot"
    );
    return sendJson(res, 200, { slots: rows });
  }

  if (req.method === "POST") {
    const data = await parseJsonBody(req);
    if (!data.date || !data.time_slot) {
      return sendJson(res, 400, { error: "Missing date or time" });
    }
    await query(
      "INSERT INTO availability (date, time_slot, route_tag, is_available) VALUES (?, ?, ?, ?) ON DUPLICATE KEY UPDATE is_available = VALUES(is_available)",
      [data.date, data.time_slot, data.route_tag || null, Number(data.is_available) || 0]
    );
    return sendJson(res, 200, { ok: true });
  }

  if (req.method === "PUT") {
    const data = await parseJsonBody(req);
    if (!data.id) return sendJson(res, 400, { error: "Missing id" });
    if (data.toggle) {
      await query(
        "UPDATE availability SET is_available = NOT is_available WHERE id = ?",
        [data.id]
      );
      return sendJson(res, 200, { ok: true });
    }
    await query(
      "UPDATE availability SET date = ?, time_slot = ?, route_tag = ?, is_available = ? WHERE id = ?",
      [data.date, data.time_slot, data.route_tag || null, Number(data.is_available) || 0, data.id]
    );
    return sendJson(res, 200, { ok: true });
  }

  if (req.method === "DELETE") {
    const url = new URL(req.url, `http://${req.headers.host}`);
    const id = url.searchParams.get("id");
    if (!id) return sendJson(res, 400, { error: "Missing id" });
    await query("DELETE FROM availability WHERE id = ?", [id]);
    return sendJson(res, 200, { ok: true });
  }

  res.setHeader("Allow", "GET, POST, PUT, DELETE");
  return sendJson(res, 405, { error: "Method not allowed" });
}
