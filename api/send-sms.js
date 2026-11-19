const MSG91_URL = "https://control.msg91.com/api/v5/flow";

function normalizeNumber(value) {
  let n = String(value || "").replace(/[\s()-]/g, "");
  if (/^\d{10}$/.test(n)) n = "91" + n;
  else if (n.startsWith("+")) n = n.slice(1);
  if (!/^\d{10,15}$/.test(n)) throw new Error("Invalid phone number");
  return n;
}

export default async function handler(req, res) {
  if (req.method !== "POST") {
    res.setHeader("Allow", "POST");
    return res.status(405).json({ ok: false, error: "Method not allowed" });
  }
  if (process.env.ACCESS_CODE && req.headers["x-access-code"] !== process.env.ACCESS_CODE) {
    return res.status(401).json({ ok: false, error: "Invalid access code" });
  }
  const authkey = process.env.MSG91_AUTHKEY;
  const templateId = process.env.MSG91_TEMPLATE_ID;
  if (!authkey || !templateId) return res.status(503).json({ ok: false, error: "SMS provider is not configured" });

  try {
    const { numbers, message } = req.body || {};
    if (!Array.isArray(numbers) || numbers.length < 1 || numbers.length > 10) {
      return res.status(400).json({ ok: false, error: "Provide 1 to 10 phone numbers" });
    }
    if (typeof message !== "string" || !message.trim() || message.length > 450) {
      return res.status(400).json({ ok: false, error: "Message must be 1 to 450 characters" });
    }
    const recipients = numbers.map(n => ({ mobiles: normalizeNumber(n), VAR1: message.trim() }));
    const upstream = await fetch(MSG91_URL, {
      method: "POST",
      headers: { accept: "application/json", authkey, "content-type": "application/json" },
      body: JSON.stringify({ template_id: templateId, recipients })
    });
    const data = await upstream.json().catch(() => ({}));
    if (!upstream.ok || data.type === "error" || data.hasError === true) {
      console.error("MSG91 rejected request", upstream.status, data);
      return res.status(502).json({ ok: false, error: data.message || data.error || `MSG91 HTTP ${upstream.status}` });
    }
    return res.status(200).json({ ok: true, provider: "MSG91", providerResponse: data.message || "Request accepted" });
  } catch (e) {
    return res.status(400).json({ ok: false, error: e.message || "Invalid request" });
  }
}
