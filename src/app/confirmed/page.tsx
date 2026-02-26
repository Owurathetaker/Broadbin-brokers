import { Suspense } from "react";
import ConfirmedClient from "./ConfirmedClient";

export const dynamic = "force-dynamic";

export default function ConfirmedPage() {
  return (
    <main className="min-h-screen bg-zinc-950 text-zinc-100">
      <Suspense
        fallback={
          <div className="mx-auto max-w-2xl px-4 py-12 text-sm text-zinc-400">
            Loading confirmation…
          </div>
        }
      >
        <ConfirmedClient />
      </Suspense>
    </main>
  );
}