export default function MaureenHeipsChannelPage() {
  const STRIPE_PAYMENT_LINK = "https://buy.stripe.com/5kQbJ3eBy8Tt5eg0DS5Vu01";

  return (
    <main className="min-h-screen bg-zinc-950 text-zinc-100">
      <div className="mx-auto flex min-h-screen max-w-3xl flex-col justify-center px-6 py-16">
        <div className="mb-6 inline-flex w-fit items-center gap-2 rounded-full border border-zinc-800 bg-zinc-900/50 px-3 py-1 text-xs text-zinc-300">
          <span className="h-2 w-2 rounded-full bg-amber-400" />
          Private access
        </div>

        <h1 className="text-4xl font-semibold tracking-tight sm:text-5xl">
          Maureen Heip’s Channel
        </h1>

        <p className="mt-4 max-w-2xl text-base leading-7 text-zinc-300 sm:text-lg">
          Private access for serious people only. This is a one-time payment for
          entry into the channel.
        </p>

        <div className="mt-8 rounded-2xl border border-zinc-800 bg-zinc-900/40 p-6">
          <div className="flex items-end justify-between gap-4 border-b border-zinc-800 pb-5">
            <div>
              <p className="text-sm uppercase tracking-wide text-zinc-400">
                Access Fee
              </p>
              <h2 className="mt-2 text-3xl font-semibold">$350</h2>
            </div>
            <p className="text-sm text-zinc-400">One-time payment</p>
          </div>

          <div className="mt-5 grid gap-3 text-sm text-zinc-300">
            <div className="rounded-xl border border-zinc-800 bg-zinc-950/40 p-3">
              Private Telegram channel access
            </div>
            <div className="rounded-xl border border-zinc-800 bg-zinc-950/40 p-3">
              Secure checkout via Stripe
            </div>
            <div className="rounded-xl border border-zinc-800 bg-zinc-950/40 p-3">
              Channel link sent after payment confirmation
            </div>
          </div>

          <a
            href={STRIPE_PAYMENT_LINK}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-6 inline-flex w-full items-center justify-center rounded-2xl bg-amber-400 px-5 py-4 text-sm font-semibold text-zinc-950 transition hover:bg-amber-300"
          >
            Pay $350 to Access
          </a>

          <p className="mt-4 text-center text-xs text-zinc-500">
            Once payment is confirmed, your private access link will be sent.
          </p>
        </div>

        <footer className="mt-8 text-xs text-zinc-500">
          BroadBin · Secure digital access processing
        </footer>
      </div>
    </main>
  );
}