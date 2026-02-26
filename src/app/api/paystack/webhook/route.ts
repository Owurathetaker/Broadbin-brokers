import crypto from "crypto";
import { NextResponse } from "next/server";

async function sendTelegram(text: string) {
  const token = process.env.TELEGRAM_BOT_TOKEN;
  const chatId = process.env.TELEGRAM_CHAT_ID;
  if (!token || !chatId) return;

  await fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      chat_id: chatId,
      text,
      disable_web_page_preview: true,
    }),
  });
}

async function sendEmail(subject: string, html: string) {
  const apiKey = process.env.RESEND_API_KEY;
  const to = process.env.NOTIFY_EMAIL_TO || "broadbinbiz@gmail.com";
  if (!apiKey) return;

  await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      from: "BroadBin Brokers <onboarding@resend.dev>", // OK for start
      to: [to],
      subject,
      html,
    }),
  });
}

export async function POST(req: Request) {
  const secretKey = process.env.PAYSTACK_SECRET_KEY;
  if (!secretKey) {
    return NextResponse.json({ ok: false, error: "PAYSTACK_SECRET_KEY not set" }, { status: 400 });
  }

  // Paystack signature header
  const signature = req.headers.get("x-paystack-signature") || "";

  // Raw body required for signature verification
  const rawBody = await req.text();
  
  console.log("PAYSTACK WEBHOOK HIT", new Date().toISOString());

  const hash = crypto.createHmac("sha512", secretKey).update(rawBody).digest("hex");

  if (hash !== signature) {
    return NextResponse.json({ ok: false, error: "Invalid signature" }, { status: 401 });
  }

  const event = JSON.parse(rawBody);

  // We only care about successful charges
  if (event?.event !== "charge.success") {
    return NextResponse.json({ ok: true });
  }

  const data = event?.data;
  const reference = data?.reference;
  const amount = data?.amount; // in pesewas
  const currency = data?.currency || "GHS";
  const paidAt = data?.paid_at;
  const metadata = data?.metadata || {};

  // Only notify for our inspection bookings (prevents other random payments)
  if (metadata?.kind !== "inspection_booking") {
    return NextResponse.json({ ok: true });
  }

  const fullName = metadata?.fullName || "—";
  const phone = metadata?.phone || "—";
  const area = metadata?.area || "—";
  const date = metadata?.date || "—";
  const time = metadata?.time || "—";
  const feeGhs = typeof metadata?.feeGhs === "number" ? metadata.feeGhs : amount ? amount / 100 : "—";

  const msg =
`✅ New Inspection Booking (Paid)
Name: ${fullName}
Phone: ${phone}
Area: ${area}
Slot: ${date} @ ${time}
Amount: ${currency} ${feeGhs}
Ref: ${reference}
Paid at: ${paidAt || "—"}`;

  // Telegram notification
  await sendTelegram(msg);

  // Email notification
  await sendEmail(
    `New Booking — ${fullName} — ${date} ${time}`,
    `
      <div style="font-family:system-ui">
        <h2>New Inspection Booking (Paid)</h2>
        <p><b>Name:</b> ${fullName}</p>
        <p><b>Phone:</b> ${phone}</p>
        <p><b>Area:</b> ${area}</p>
        <p><b>Slot:</b> ${date} @ ${time}</p>
        <p><b>Amount:</b> ${currency} ${feeGhs}</p>
        <p><b>Reference:</b> ${reference}</p>
        <p><b>Paid at:</b> ${paidAt || "—"}</p>
      </div>
    `
  );

  return NextResponse.json({ ok: true });
}