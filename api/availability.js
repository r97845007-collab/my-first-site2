import { query } from "../lib/db.js";
import { sendJson } from "../lib/http.js";

export default async function handler(req, res) {
  if (req.method !== "GET") {
    res.setHeader("Allow", "GET");
    return sendJson(res, 405, { error: "Method not allowed" });
  }
  const url = new URL(req.url, `http://${req.headers.host}`);
  const routeTag = url.searchParams.get("route");
  const rows = await query(
    "SELECT id, date, time_slot, route_tag, is_available FROM availability WHERE date >= CURDATE() AND date <= DATE_ADD(CURDATE(), INTERVAL 30 DAY) ORDER BY date, time_slot"
  );
  const filtered = routeTag ? rows.filter((row) => row.route_tag === routeTag) : rows;
  const slots = filtered.map((row) => ({
    id: row.id,
    date: row.date,
    time: row.time_slot,
    label: row.route_tag || "Свободный слот",
    is_available: row.is_available,
  }));
  return sendJson(res, 200, { slots });
}
