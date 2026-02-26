import { NextResponse } from "next/server";

type InitBody = {
  fullName: string;
  phone: string;
  area?: string;
  date: string;
  time: string;
  feeGhs: number;
};

export async function POST(req: Request) {
  try {
    const body = (await req.json()) as InitBody;

    const publicUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
    const secretKey = process.env.PAYSTACK_SECRET_KEY;

    if (!secretKey) {
      return NextResponse.json(
        { error: "PAYSTACK_SECRET_KEY is not set yet. Add it to .env.local first." },
        { status: 400 }
      );
    }

    if (!body.fullName || !body.phone || !body.date || !body.time) {
      return NextResponse.json({ error: "Missing required fields." }, { status: 400 });
    }

    const amountPesewas = Math.round(Number(body.feeGhs) * 100);

    // We need an email for Paystack init. If buyer hasn't provided one yet,
    // use a placeholder and capture email on /confirmed.
    const placeholderEmail = "booking@broadbinbrokers.local";

    const metadata = {
      fullName: body.fullName,
      phone: body.phone,
      area: body.area || "",
      date: body.date,
      time: body.time,
      agreedToTerms: true,
    };

    const resp = await fetch("https://api.paystack.co/transaction/initialize", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${secretKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        email: placeholderEmail,
        amount: amountPesewas,
        currency: "GHS",
        callback_url: `${publicUrl}/confirmed`,
        metadata,
      }),
    });

    const data = await resp.json();

    if (!resp.ok) {
      return NextResponse.json({ error: data?.message || "Paystack init failed.", raw: data }, { status: 400 });
    }

    return NextResponse.json({
      authorization_url: data.data.authorization_url,
      access_code: data.data.access_code,
      reference: data.data.reference,
    });
  } catch (e: any) {
    return NextResponse.json({ error: e.message || "Server error." }, { status: 500 });
  }
}