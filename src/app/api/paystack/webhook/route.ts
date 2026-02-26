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

/**
 * Lightweight in-memory dedupe to reduce double notifications on retries.
 * Note: serverless instances can restart; true dedupe needs storage (Supabase later).
 */
const seenRefs = new Set<string>();

export async function POST(req: Request) {
  const secretKey = process.env.PAYSTACK_SECRET_KEY;

  // Always respond fast; only validate when secret exists.
  if (!secretKey) {
    return NextResponse.json({ ok: false, error: "PAYSTACK_SECRET_KEY not set" }, { status: 400 });
  }

  const signature = req.headers.get("x-paystack-signature") || "";
  const rawBody = await req.text();

  console.log("PAYSTACK WEBHOOK HIT", new Date().toISOString());

  const hash = crypto.createHmac("sha512", secretKey).update(rawBody).digest("hex");
  if (hash !== signature) {
    return NextResponse.json({ ok: false, error: "Invalid signature" }, { status: 401 });
  }

  let event: any;
  try {
    event = JSON.parse(rawBody);
  } catch {
    return NextResponse.json({ ok: false, error: "Invalid JSON body" }, { status: 400 });
  }

  // Only care about successful charges
  if (event?.event !== "charge.success") {
    return NextResponse.json({ ok: true });
  }

  const data = event?.data || {};
  const reference: string = data?.reference || "";
  const amountPesewas: number = Number(data?.amount || 0);
  const currency: string = data?.currency || "GHS";
  const paidAt: string | undefined = data?.paid_at;
  const metadata: any = data?.metadata || {};

  // Only notify for our inspection bookings (prevents other random payments)
  if (metadata?.kind !== "inspection_booking") {
    return NextResponse.json({ ok: true });
  }

  // Dedupe (best effort)
  if (reference) {
    if (seenRefs.has(reference)) {
      return NextResponse.json({ ok: true, deduped: true });
    }
    seenRefs.add(reference);
  }

  const fullName = metadata?.fullName || "—";
  const phone = metadata?.phone || "—";
  const area = metadata?.area || "—";
  const date = metadata?.date || "—";
  const time = metadata?.time || "—";

  // feeGhs may be provided in metadata; otherwise fallback to amount/100
  const feeFromMeta =
    typeof metadata?.feeGhs === "number" && Number.isFinite(metadata.feeGhs) ? metadata.feeGhs : null;

  const feeGhs = feeFromMeta ?? (amountPesewas ? amountPesewas / 100 : 0);
  const feeDisplay = Number.isFinite(feeGhs) ? feeGhs.toFixed(2) : String(feeGhs);

  const msg =
`✅ New Inspection Booking (Paid)
Name: ${fullName}
Phone: ${phone}
Area: ${area}
Slot: ${date} @ ${time}
Amount: ${currency} ${feeDisplay}
Ref: ${reference || "—"}
Paid at: ${paidAt || "—"}`;

  // Fire notifications (don’t fail webhook if one channel fails)
  try {
    await sendTelegram(msg);
  } catch (e) {
    console.error("Telegram notify failed:", e);
  }

  try {
    await sendEmail(
      `New Booking — ${fullName} — ${date} ${time}`,
      `
        <div style="font-family:system-ui">
          <h2>New Inspection Booking (Paid)</h2>
          <p><b>Name:</b> ${fullName}</p>
          <p><b>Phone:</b> ${phone}</p>
          <p><b>Area:</b> ${area}</p>
          <p><b>Slot:</b> ${date} @ ${time}</p>
          <p><b>Amount:</b> ${currency} ${feeDisplay}</p>
          <p><b>Reference:</b> ${reference || "—"}</p>
          <p><b>Paid at:</b> ${paidAt || "—"}</p>
        </div>
      `
    );
  } catch (e) {
    console.error("Email notify failed:", e);
  }

  return NextResponse.json({ ok: true });
}