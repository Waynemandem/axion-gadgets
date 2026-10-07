"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

const STATUSES: [string, string][] = [
  ["pending", "Pending payment"],
  ["paid", "Paid"],
  ["sourcing", "Sourcing the phone"],
  ["ready_for_pickup", "Ready for pickup"],
  ["out_for_delivery", "Out for delivery"],
  ["completed", "Completed"],
  ["cancelled", "Cancelled"],
  ["refunded", "Refunded"],
  ["failed", "Failed"],
];

export default function OrderControls({
  id,
  reference,
  status,
}: {
  id: string;
  reference: string;
  status: string;
}) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  async function setStatus(value: string) {
    setBusy(true);
    setMessage(null);
    const supabase = createClient();
    const { error } = await supabase
      .from("orders")
      .update({ status: value })
      .eq("id", id);
    if (error) setMessage(error.message);
    setBusy(false);
    router.refresh();
  }

  async function recheck() {
    setBusy(true);
    setMessage(null);
    try {
      const res = await fetch("/api/admin/recheck", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ reference }),
      });
      const data = await res.json();
      setMessage(
        res.ok ? `Paystack says: ${data.state}` : data.error ?? "Check failed"
      );
    } catch {
      setMessage("Network problem.");
    }
    setBusy(false);
    router.refresh();
  }

  return (
    <div className="flex flex-wrap items-center gap-2">
      <select
        value={status}
        disabled={busy}
        onChange={(e) => setStatus(e.target.value)}
        className="rounded-full border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold"
      >
        {STATUSES.map(([value, label]) => (
          <option key={value} value={value}>
            {label}
          </option>
        ))}
      </select>

      {(status === "pending" || status === "failed") && (
        <button
          onClick={recheck}
          disabled={busy}
          className="rounded-full border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold disabled:opacity-40"
        >
          Re-check payment
        </button>
      )}

      {message && <span className="text-xs text-[var(--muted)]">{message}</span>}
    </div>
  );
}