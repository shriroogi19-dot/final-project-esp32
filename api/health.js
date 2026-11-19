export default async function handler(req, res) {
  if (req.method !== "GET") {
    res.setHeader("Allow", "GET");
    return res.status(405).json({ ok: false, error: "Method not allowed" });
  }
  if (!process.env.MSG91_AUTHKEY || !process.env.MSG91_TEMPLATE_ID) {
    return res.status(503).json({
      ok: false,
      provider: "MSG91",
      error: "Missing MSG91_AUTHKEY or MSG91_TEMPLATE_ID in Vercel environment variables"
    });
  }
  return res.status(200).json({ ok: true, provider: "MSG91" });
}
