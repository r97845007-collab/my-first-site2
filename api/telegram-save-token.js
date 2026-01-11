import { getUserIdFromRequest } from "../lib/auth.js";
import { encrypt } from "../lib/crypto.js";
import { query } from "../lib/db.js";
import { parseJsonBody, sendJson } from "../lib/http.js";

export default async function handler(req, res) {
  if (req.method !== "POST") {
    res.setHeader("Allow", "POST");
    return sendJson(res, 405, { error: "Method not allowed" });
  }
  const userId = getUserIdFromRequest(req);
  if (!userId) {
    return sendJson(res, 401, { error: "Unauthorized" });
  }
  try {
    const { botToken } = await parseJsonBody(req);
    if (!botToken || !/^\d+:[\w-]+$/.test(botToken)) {
      return sendJson(res, 400, { error: "Invalid bot token" });
    }
    const encrypted = encrypt(botToken);
    await query(
      "INSERT INTO user_telegram (user_id, bot_token_enc, bot_token_iv, bot_token_tag) VALUES (?, ?, ?, ?) ON DUPLICATE KEY UPDATE bot_token_enc = VALUES(bot_token_enc), bot_token_iv = VALUES(bot_token_iv), bot_token_tag = VALUES(bot_token_tag)",
      [userId, encrypted.enc, encrypted.iv, encrypted.tag]
    );
    return sendJson(res, 200, { ok: true });
  } catch (error) {
    return sendJson(res, 500, { error: "Server error" });
  }
}
