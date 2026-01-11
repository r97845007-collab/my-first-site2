import { getUserIdFromRequest } from "../lib/auth.js";
import { decrypt } from "../lib/crypto.js";
import { query } from "../lib/db.js";
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

  const rows = await query(
    "SELECT bot_token_enc, bot_token_iv, bot_token_tag FROM user_telegram WHERE user_id = ?",
    [userId]
  );
  if (!rows.length) {
    return sendJson(res, 404, { error: "No token saved" });
  }
  try {
    const token = decrypt({
      enc: rows[0].bot_token_enc,
      iv: rows[0].bot_token_iv,
      tag: rows[0].bot_token_tag,
    });
    const response = await fetch(`https://api.telegram.org/bot${token}/getMe`);
    const data = await response.json();
    if (!data.ok) {
      return sendJson(res, 400, { error: "Invalid bot token" });
    }
    return sendJson(res, 200, { ok: true, telegram: data.result });
  } catch (error) {
    return sendJson(res, 400, { error: "Invalid bot token" });
  }
}
