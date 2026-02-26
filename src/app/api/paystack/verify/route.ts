import { NextResponse } from "next/server";
 
export async function POST(req: Request) {
  try {
    const secretKey = process.env.PAYSTACK_SECRET_KEY;
    if (!secretKey) {
      return NextResponse.json({ error: "PAYSTACK_SECRET_KEY not set." }, { status: 400 });
    }
 
    const { reference } = await req.json();
 
    if (!reference || typeof reference !== "string") {
      return NextResponse.json({ error: "Missing reference." }, { status: 400 });
    }
 
    const resp = await fetch(`https://api.paystack.co/transaction/verify/${encodeURIComponent(reference)}`, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${secretKey}`,
        "Content-Type": "application/json",
      },
      cache: "no-store",
    });
 
    const data = await resp.json();
 
    if (!resp.ok) {
      return NextResponse.json(
        { error: data?.message || "Paystack verify failed.", raw: data },
        { status: 400 }
      );
    }
 
    const status = data?.data?.status; // "success" if paid
    const amount = data?.data?.amount; // in pesewas
    const currency = data?.data?.currency;
    const paidAt = data?.data?.paid_at;
    const metadata = data?.data?.metadata || null;
 
    return NextResponse.json({
      ok: true,
      status,
      amount,
      currency,
      paidAt,
      reference: data?.data?.reference,
      metadata,
    });
  } catch (e: any) {
    return NextResponse.json({ error: e.message || "Server error." }, { status: 500 });
  }
}