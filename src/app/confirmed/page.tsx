"use client";
 
import { useSearchParams } from "next/navigation";
import { useState } from "react";
 
export default function ConfirmedPage() {
  const sp = useSearchParams();
  const reference = sp.get("reference");
  const [email, setEmail] = useState("");
  const [done, setDone] = useState(false);
 
  async function submitEmail() {
    if (!email.includes("@")) return;
    setDone(true);
  }
 
  return (
    <main className="min-h-screen bg-zinc-950 text-zinc-100">
      <div className="mx-auto max-w-2xl px-4 py-12">
        <div className="rounded-2xl border border-zinc-800 bg-zinc-900/40 p-6">
          <h1 className="text-2xl font-semibold">Booking confirmed</h1>
          <p className="mt-2 text-sm text-zinc-300">
            Your inspection reservation has been confirmed.
            {reference ? (
              <>
                {" "}
                Reference: <span className="font-semibold text-zinc-100">{reference}</span>
              </>
            ) : null}
          </p>
 
          {!done ? (
            <div className="mt-6">
              <h2 className="text-lg font-semibold">Get a copy of your agreement</h2>
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
        </div>
      </div>
    </main>
  );
}