"use client";

import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";

type VerifiedOk = {
  ok: true;
  status: "success" | string;
  amount: number;
  currency: string;
  paidAt?: string;
  reference: string;
  metadata: {
    fullName?: string;
    phone?: string;
    area?: string;
    date?: string;
    time?: string;
    [key: string]: unknown;
  } | null;
};

type VerifiedErr = {
  ok: false;
  error: string;
};

type VerifiedState = VerifiedOk | VerifiedErr;

export default function ConfirmedClient() {
  const sp = useSearchParams();
  const reference = sp.get("reference");

  const [loading, setLoading] = useState(true);
  const [result, setResult] = useState<VerifiedState | null>(null);

  const [email, setEmail] = useState("");
  const [done, setDone] = useState(false);

  useEffect(() => {
    let mounted = true;

    async function run() {
      if (!reference) {
        setResult({ ok: false, error: "Missing payment reference. Please complete payment first." });
        setLoading(false);
        return;
      }

      try {
        const res = await fetch("/api/paystack/verify", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ reference }),
        });

        const data = await res.json();

        if (!mounted) return;

        // If API returned an error
        if (!res.ok) {
          setResult({ ok: false, error: data?.error || "Unable to verify payment." });
          return;
        }

        // If API returned ok payload
        if (data?.ok === true) {
          if (data.status === "success") {
            setResult({
              ok: true,
              status: data.status,
              amount: data.amount,
              currency: data.currency,
              paidAt: data.paidAt,
              reference: data.reference,
              metadata: data.metadata ?? null,
            });
          } else {
            setResult({ ok: false, error: `Payment status is "${data.status}".` });
          }
          return;
        }

        setResult({ ok: false, error: data?.error || "Unable to verify payment." });
      } catch (e: any) {
        if (!mounted) return;
        setResult({ ok: false, error: e?.message || "Unable to verify payment." });
      } finally {
        if (!mounted) return;
        setLoading(false);
      }
    }

    run();
    return () => {
      mounted = false;
    };
  }, [reference]);

  async function submitEmail() {
    if (!email.includes("@")) return;
    setDone(true);
  }

  return (
    <div className="mx-auto max-w-2xl px-4 py-12">
      <div className="rounded-2xl border border-zinc-800 bg-zinc-900/40 p-6">
        <h1 className="text-2xl font-semibold">Payment confirmation</h1>

        {loading ? (
          <p className="mt-3 text-sm text-zinc-400">Verifying payment…</p>
        ) : !result ? (
          <div className="mt-4 rounded-xl border border-red-900/40 bg-red-950/30 p-4 text-sm text-red-200">
            Unable to verify payment.
          </div>
        ) : result.ok === false ? (
          <div className="mt-4 rounded-xl border border-red-900/40 bg-red-950/30 p-4 text-sm text-red-200">
            {result.error}
          </div>
        ) : (
          <>
            <div className="mt-4 rounded-xl border border-emerald-900/40 bg-emerald-950/30 p-4 text-sm text-emerald-200">
              ✅ Payment verified. Your inspection booking is confirmed.
            </div>

            <div className="mt-4 grid gap-2 text-sm text-zinc-300">
              <div>
                Reference: <span className="font-semibold text-zinc-100">{result.reference}</span>
              </div>
              <div>
                Amount:{" "}
                <span className="font-semibold text-zinc-100">
                  {result.currency} {(result.amount / 100).toFixed(2)}
                </span>
              </div>

              {result.metadata?.fullName ? (
                <div>
                  Name: <span className="font-semibold text-zinc-100">{result.metadata.fullName}</span>
                </div>
              ) : null}

              {result.metadata?.phone ? (
                <div>
                  Phone: <span className="font-semibold text-zinc-100">{result.metadata.phone}</span>
                </div>
              ) : null}

              {result.metadata?.date && result.metadata?.time ? (
                <div>
                  Slot:{" "}
                  <span className="font-semibold text-zinc-100">
                    {result.metadata.date} at {result.metadata.time}
                  </span>
                </div>
              ) : null}
            </div>

            {!done ? (
              <div className="mt-6">
                <h2 className="text-lg font-semibold">Receive a copy</h2>
                <p className="mt-1 text-sm text-zinc-400">
                  Enter your email to receive your booking confirmation and agreement copy.
                </p>

                <input
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@example.com"
                  className="mt-4 w-full rounded-xl border border-zinc-800 bg-zinc-950/40 px-3 py-2.5 text-sm text-zinc-100 placeholder:text-zinc-600 outline-none focus:border-amber-400/60 focus:ring-2 focus:ring-amber-400/20"
                />

                <button
                  onClick={submitEmail}
                  className="mt-4 w-full rounded-2xl bg-amber-400 px-5 py-3 text-sm font-semibold text-zinc-950 hover:bg-amber-300"
                >
                  Send me a copy
                </button>

                <p className="mt-3 text-center text-xs text-zinc-500">
                  Support: broadbinbiz@gmail.com · +233 547 891 011
                </p>
              </div>
            ) : (
              <div className="mt-6 rounded-xl border border-emerald-900/40 bg-emerald-950/30 p-4 text-sm text-emerald-200">
                Noted. You’ll receive your copy shortly.
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}