// Vercel Serverless Function: POST /api/register
// Required Vercel Environment Variables:
// TELEGRAM_BOT_TOKEN, TELEGRAM_CHAT_ID

const UNIVERSITIES = new Set([
  "XIAMEN",
  "APU",
  "UCSI",
  "ALFA UNIVERSITY",
  "CITY",
  "MAHSA",
  "OTHERS",
  "NOT_STUDENT"
]);

function clean(value, max = 120) {
  return String(value ?? "")
    .replace(/[\u0000-\u001F\u007F]/g, " ")
    .trim()
    .slice(0, max);
}

function normalizePhone(value) {
  const phone = String(value ?? "").replace(/[\s\-().]/g, "");

  if (/^(\+?60|0)1\d{8,9}$/.test(phone)) {
    const local = phone.replace(/^(\+?60|0)/, "");
    return `+60 ${local.slice(0, 2)} ${local.slice(2)}`;
  }

  if (/^(\+?998)?\d{9}$/.test(phone)) {
    const local = phone.slice(-9);
    return `+998 ${local.slice(0, 2)} ${local.slice(2, 5)} ${local.slice(5, 7)} ${local.slice(7)}`;
  }

  return null;
}

async function telegramRequest(token, method, payload) {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 8000);

  try {
    const response = await fetch(`https://api.telegram.org/bot${token}/${method}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
      signal: controller.signal
    });

    const result = await response.json().catch(() => ({}));
    if (!response.ok || !result.ok) {
      throw new Error(result.description || `Telegram API error (${response.status})`);
    }
    return result;
  } finally {
    clearTimeout(timeout);
  }
}

module.exports = async function handler(req, res) {
  res.setHeader("Cache-Control", "no-store");

  if (req.method !== "POST") {
    res.setHeader("Allow", "POST");
    return res.status(405).json({ ok: false, error: "method_not_allowed" });
  }

  let body = req.body;
  if (typeof body === "string") {
    try { body = JSON.parse(body); }
    catch { return res.status(400).json({ ok: false, error: "invalid_json" }); }
  }
  if (!body || typeof body !== "object") {
    return res.status(400).json({ ok: false, error: "invalid_json" });
  }

  // Honeypot: silently accept bot submissions without notifying the admin.
  if (clean(body.website, 200)) {
    return res.status(200).json({ ok: true });
  }

  const name = clean(body.name, 80);
  const phone = normalizePhone(body.phone);
  const uni = clean(body.uni, 40).toUpperCase();

  if (name.length < 2 || !phone || !UNIVERSITIES.has(uni)) {
    return res.status(400).json({ ok: false, error: "validation" });
  }

  const token = process.env.TELEGRAM_BOT_TOKEN;
  const adminChatId = process.env.TELEGRAM_CHAT_ID;

  if (!token || !adminChatId) {
    return res.status(500).json({ ok: false, error: "not_configured" });
  }

  const message = [
    "♟️ <b>Yangi WAYU Chess ro‘yxatdan o‘tishi</b>",
    "",
    `<b>Ism:</b> ${escapeHtml(name)}`,
    `<b>Telefon:</b> ${escapeHtml(phone)}`,
    `<b>Universitet:</b> ${escapeHtml(uni)}`
  ].join("\n");

  try {
    await telegramRequest(token, "sendMessage", {
      chat_id: adminChatId,
      text: message,
      parse_mode: "HTML"
    });
    return res.status(200).json({ ok: true });
  } catch (error) {
    console.error("WAYU registration Telegram error:", error.message);
    return res.status(502).json({ ok: false, error: "send_failed" });
  }
};

function escapeHtml(value) {
  return String(value).replace(/[&<>"']/g, character => ({
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    '"': "&quot;",
    "'": "&#39;"
  })[character]);
}
