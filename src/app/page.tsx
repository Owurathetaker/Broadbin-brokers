"use client";

import { useMemo, useState } from "react";

const INSPECTION_FEE = Number(process.env.NEXT_PUBLIC_INSPECTION_FEE_GHS || 70);

// Hard-locked inspection dates (YYYY-MM-DD)
const ALLOWED_DATES = ["2026-02-28", "2026-03-01", "2026-03-02"] as const;

function isValidPhone(phone: string) {
  const cleaned = phone.replace(/\s+/g, "");
  return cleaned.length >= 9;
}

export default function HomePage() {
  const [fullName, setFullName] = useState("");
  const [phone, setPhone] = useState("");
  const [area, setArea] = useState("");
  const [date, setDate] = useState("");
  const [time, setTime] = useState("");
  const [agreed, setAgreed] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const canContinue = useMemo(() => {
    return (
      fullName.trim().length >= 3 &&
      isValidPhone(phone) &&
      date &&
      time &&
      agreed &&
      !submitting
    );
  }, [fullName, phone, date, time, agreed, submitting]);

  async function handleContinue() {
    setError(null);
    if (!canContinue) return;

    // Enforce allowed dates (cannot be bypassed by editing the DOM)
    if (!ALLOWED_DATES.includes(date as any)) {
      setError("Please select an available inspection date (Saturday, Sunday, or Monday).");
      return;
    }

    setSubmitting(true);
    try {
      const res = await fetch("/api/paystack/init", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          fullName: fullName.trim(),
          phone: phone.trim(),
          area: area.trim(),
          date,
          time,
          feeGhs: INSPECTION_FEE,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data?.error || "Unable to initiate payment.");

      window.location.href = data.authorization_url;
    } catch (e: any) {
      setError(e.message || "Something went wrong.");
      setSubmitting(false);
    }
  }

  return (
    <main className="relative">
      {/* Background */}
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute inset-0 bg-[radial-gradient(60%_50%_at_50%_0%,rgba(255,255,255,0.08),transparent_60%)]" />
        <div className="absolute inset-0 bg-[radial-gradient(40%_30%_at_20%_20%,rgba(234,179,8,0.08),transparent_60%)]" />
        <div className="absolute inset-0 bg-zinc-950" />
      </div>

      <div className="relative mx-auto max-w-3xl px-4 py-10 sm:py-14">
        {/* Header */}
        <header className="mb-8 flex items-center gap-3">
          <img
            src="/logo.png"
            alt="BroadBin Brokers"
            className="h-12 w-12 rounded-xl border border-zinc-800 bg-zinc-900/40 p-1"
          />
          <div>
            <h1 className="text-3xl font-semibold tracking-tight">BroadBin Brokers</h1>
            <p className="mt-1 text-zinc-300">
              Schedule a private electric bike inspection in Accra.
            </p>
          </div>
        </header>

        {/* Card */}
        <section className="rounded-2xl border border-zinc-800 bg-zinc-900/40 p-5 shadow-[0_0_0_1px_rgba(255,255,255,0.03)] sm:p-6">
          <h2 className="text-lg font-semibold">Inspection details</h2>
          <p className="mt-1 text-sm text-zinc-400">
            Complete the details below. You’ll review terms and proceed to secure payment.
          </p>

          <div className="mt-5 grid gap-4">
            <Field label="Full name (digital signature)">
              <input
                className={inputClass}
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                placeholder="e.g., Ama Mensah"
              />
            </Field>

            <Field label="Phone number">
              <input
                className={inputClass}
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="e.g., 0547891011"
              />
            </Field>

            <Field label="Area (optional)">
              <input
                className={inputClass}
                value={area}
                onChange={(e) => setArea(e.target.value)}
                placeholder="e.g., East Legon"
              />
            </Field>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <Field label="Available dates">
                <select
                  className={inputClass}
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                >
                  <option value="">Select a date</option>
                  {ALLOWED_DATES.map((d) => (
                    <option key={d} value={d}>
                      {d}
                    </option>
                  ))}
                </select>
              </Field>

              <Field label="Preferred time">
                <input
                  type="time"
                  className={inputClass}
                  value={time}
                  onChange={(e) => setTime(e.target.value)}
                />
              </Field>
            </div>
          </div>
        </section>

        {/* Terms */}
        <section className="mt-5 rounded-2xl border border-zinc-800 bg-zinc-900/40 p-5 sm:p-6">
          <h2 className="text-lg font-semibold">Inspection & transaction terms</h2>

          <div className="mt-4 grid gap-3 text-sm text-zinc-300">
            <Term>1) This booking secures a scheduled electric bike inspection.</Term>
            <Term>
              2) A{" "}
              <span className="font-semibold text-zinc-100">
                GHS {INSPECTION_FEE}
              </span>{" "}
              reservation fee confirms your appointment.
            </Term>
            <Term>3) If you proceed with purchase, the fee is deducted from the final price.</Term>
            <Term>4) If you do not proceed, the fee covers coordination and scheduling costs.</Term>
            <Term>
              5){" "}
              <span className="font-semibold text-zinc-100">
                All purchase payments must be processed exclusively through BroadBin Brokers.
              </span>
            </Term>
            <Term>6) Ownership transfers only upon full payment confirmation.</Term>
            <Term>7) Warranty and after-sales service are provided by the supplier.</Term>
          </div>

          <label className="mt-5 flex items-start gap-3 rounded-xl border border-zinc-800 bg-zinc-950/40 p-4">
            <input
              type="checkbox"
              className="mt-1 h-4 w-4 accent-amber-400"
              checked={agreed}
              onChange={(e) => setAgreed(e.target.checked)}
            />
            <span className="text-sm text-zinc-200">
              I confirm that I have read and agree to the terms above.
            </span>
          </label>

          {/* Trust line */}
          <div className="mt-4 flex flex-wrap items-center gap-x-4 gap-y-2 text-xs text-zinc-400">
            <span className="inline-flex items-center gap-2">
              <span className="h-1.5 w-1.5 rounded-full bg-amber-400/80" />
              Secure payment via Paystack
            </span>
            <span className="inline-flex items-center gap-2">
              <span className="h-1.5 w-1.5 rounded-full bg-zinc-500" />
              Booking record stored
            </span>
            <span className="inline-flex items-center gap-2">
              <span className="h-1.5 w-1.5 rounded-full bg-zinc-500" />
              Confirmation after payment
            </span>
          </div>
        </section>

        {/* Error */}
        {error && (
          <div className="mt-5 rounded-xl border border-red-900/40 bg-red-950/30 p-4 text-sm text-red-200">
            {error}
          </div>
        )}

        {/* CTA */}
        <div className="mt-6">
          <button
            onClick={handleContinue}
            disabled={!canContinue}
            className={[
              "group relative w-full rounded-2xl px-5 py-4 text-sm font-semibold",
              "transition focus:outline-none focus:ring-2 focus:ring-amber-400/50",
              canContinue
                ? "bg-amber-400 text-zinc-950 hover:bg-amber-300"
                : "cursor-not-allowed bg-zinc-800 text-zinc-400",
            ].join(" ")}
          >
            {submitting ? "Redirecting to secure payment..." : `Pay GHS ${INSPECTION_FEE} to confirm booking`}
            {canContinue && (
              <span className="pointer-events-none absolute inset-0 rounded-2xl ring-1 ring-white/10" />
            )}
          </button>

          <p className="mt-3 text-center text-xs text-zinc-500">
            Support: broadbinbiz@gmail.com · +233 547 891 011
          </p>
        </div>

        {/* Footer */}
        <footer className="mt-10 border-t border-zinc-900 pt-6 text-xs text-zinc-500">
          <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
            <span>BroadBin Brokers · Accra, Ghana</span>
            <span className="text-zinc-600">Inspection reservation fee: GHS {INSPECTION_FEE}</span>
          </div>
        </footer>
      </div>
    </main>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="grid gap-2">
      <span className="text-sm font-medium text-zinc-200">{label}</span>
      {children}
    </label>
  );
}

function Term({ children }: { children: React.ReactNode }) {
  return (
    <div className="rounded-xl border border-zinc-800 bg-zinc-950/30 p-3">
      {children}
    </div>
  );
}

const inputClass =
  "w-full rounded-xl border border-zinc-800 bg-zinc-950/40 px-3 py-2.5 text-sm text-zinc-100 " +
  "placeholder:text-zinc-600 outline-none focus:border-amber-400/60 focus:ring-2 focus:ring-amber-400/20";