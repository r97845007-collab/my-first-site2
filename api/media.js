import { query } from "../lib/db.js";

const getRecord = async (type, id) => {
  if (type === "story") {
    const rows = await query(
      "SELECT telegram_file_id, media_kind FROM stories WHERE id = ?",
      [id]
    );
    return rows[0];
  }
  const rows = await query(
    "SELECT telegram_file_id, media_kind FROM posts WHERE id = ?",
    [id]
  );
  return rows[0];
};

export default async function handler(req, res) {
  if (req.method !== "GET") {
    res.statusCode = 405;
    res.end("Method not allowed");
    return;
  }

  const url = new URL(req.url, `http://${req.headers.host}`);
  const type = url.searchParams.get("type") || "post";
  const id = url.searchParams.get("id");
  if (!id) {
    res.statusCode = 400;
    res.end("Missing id");
    return;
  }

  const token = process.env.TELEGRAM_BOT_TOKEN;
  if (!token) {
    res.statusCode = 500;
    res.end("Telegram token missing");
    return;
  }

  const record = await getRecord(type, id);
  if (!record?.telegram_file_id) {
    res.statusCode = 404;
    res.end("Not found");
    return;
  }

  const fileResponse = await fetch(
    `https://api.telegram.org/bot${token}/getFile?file_id=${record.telegram_file_id}`
  );
  const fileData = await fileResponse.json();
  if (!fileData.ok) {
    res.statusCode = 404;
    res.end("File not found");
    return;
  }

  const fileUrl = `https://api.telegram.org/file/bot${token}/${fileData.result.file_path}`;
  const mediaResponse = await fetch(fileUrl);
  if (!mediaResponse.ok) {
    res.statusCode = 404;
    res.end("File not found");
    return;
  }

  res.setHeader("Content-Type", mediaResponse.headers.get("Content-Type") || "application/octet-stream");
  const arrayBuffer = await mediaResponse.arrayBuffer();
  res.end(Buffer.from(arrayBuffer));
}
