"use client";

import { useState } from "react";
import Link from "next/link";
import { useCart } from "@/lib/cart";
import { NIGERIAN_STATES, PICKUP_NOTE, deliveryFee } from "@/lib/delivery";
import SectionHeading from "@/components/SectionHeading";

export default function Checkout() {
  const { items, subtotal, ready } = useCart();
  const [fulfilment, setFulfilment] = useState<"pickup" | "delivery">("pickup");
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [address, setAddress] = useState("");
  const [city, setCity] = useState("");
  const [state, setState] = useState("Lagos");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  if (!ready) {
    return <main className="mx-auto max-w-3xl px-4 py-10">Loading...</main>;
  }

  if (items.length === 0) {
    return (
      <main className="mx-auto max-w-3xl px-4 py-10">
        <div className="soft-card p-8 text-center">
          <p className="font-semibold">Your cart is empty.</p>
          <Link href="/products" className="btn-blue mt-4">
            Browse gadgets
          </Link>
        </div>
      </main>
    );
  }

  const fee = fulfilment === "delivery" ? deliveryFee(state) : 0;
  const total = subtotal + fee;

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const res = await fetch("/api/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          items: items.map((i) => ({ id: i.id, quantity: i.quantity })),
          fulfilment,
          name,
          phone,
          email,
          address,
          city,
          state,
        }),
      });
      const data = await res.json();

      if (!res.ok) {
        setError(data.error ?? "Something went wrong. Please try again.");
        setLoading(false);
        return;
      }

      window.location.href = data.url;
    } catch {
      setError("Network problem. Check your connection and try again.");
      setLoading(false);
    }
  }

  const input = "w-full rounded-xl border border-slate-200 bg-white p-3";
  const label = "mb-1 block text-sm font-semibold";
  const option = (active: boolean) =>
    `cursor-pointer rounded-2xl border-2 p-4 ${
      active ? "border-[var(--blue)] bg-[var(--blue-soft)]" : "border-slate-200 bg-white"
    }`;

  return (
    <main className="mx-auto max-w-3xl px-4 pb-8 pt-10">
      <SectionHeading eyebrow="Almost there" title="Checkout" />

      <form onSubmit={handleSubmit} className="space-y-5">
        <div className="soft-card space-y-3 p-5">
          <p className="font-extrabold">How do you want to get it?</p>
          <div className="grid gap-3 sm:grid-cols-2">
            <label className={option(fulfilment === "pickup")}>
              <input
                type="radio"
                name="fulfilment"
                className="mr-2"
                checked={fulfilment === "pickup"}
                onChange={() => setFulfilment("pickup")}
              />
              <span className="font-bold">Pickup in Ikeja</span>
              <p className="mt-1 text-sm text-[var(--muted)]">
                No delivery fee. {PICKUP_NOTE}
              </p>
            </label>
            <label className={option(fulfilment === "delivery")}>
              <input
                type="radio"
                name="fulfilment"
                className="mr-2"
                checked={fulfilment === "delivery"}
                onChange={() => setFulfilment("delivery")}
              />
              <span className="font-bold">Delivery</span>
              <p className="mt-1 text-sm text-[var(--muted)]">
                Delivered to your address. The fee is paid together with your
                order.
              </p>
            </label>
          </div>
        </div>

        <div className="soft-card space-y-4 p-5">
          <p className="font-extrabold">Your details</p>
          <div>
            <label className={label}>Full name</label>
            <input className={input} value={name} onChange={(e) => setName(e.target.value)} required />
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className={label}>Phone (WhatsApp preferred)</label>
              <input className={input} type="tel" value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="0801 234 5678" required />
            </div>
            <div>
              <label className={label}>Email (for your payment receipt)</label>
              <input className={input} type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
            </div>
          </div>

          {fulfilment === "delivery" && (
            <>
              <div>
                <label className={label}>Delivery address</label>
                <textarea className={input} rows={2} value={address} onChange={(e) => setAddress(e.target.value)} placeholder="House number, street, landmark" required />
              </div>
              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label className={label}>City / area</label>
                  <input className={input} value={city} onChange={(e) => setCity(e.target.value)} required />
                </div>
                <div>
                  <label className={label}>State</label>
                  <select className={input} value={state} onChange={(e) => setState(e.target.value)}>
                    {NIGERIAN_STATES.map((s) => (
                      <option key={s}>{s}</option>
                    ))}
                  </select>
                </div>
              </div>
            </>
          )}
        </div>

        <div className="soft-card p-5">
          <p className="font-extrabold">Order summary</p>
          <ul className="mt-3 space-y-2 text-sm">
            {items.map((i) => (
              <li key={i.id} className="flex justify-between gap-3">
                <span>
                  {i.quantity} × {i.name}
                </span>
                <span className="font-semibold">
                  ₦{(i.price * i.quantity).toLocaleString("en-NG")}
                </span>
              </li>
            ))}
          </ul>
          <div className="mt-4 space-y-1 border-t pt-3 text-sm">
            <div className="flex justify-between">
              <span>Subtotal</span>
              <span>₦{subtotal.toLocaleString("en-NG")}</span>
            </div>
            <div className="flex justify-between">
              <span>{fulfilment === "pickup" ? "Pickup" : "Delivery"}</span>
              <span>{fee === 0 ? "Free" : `₦${fee.toLocaleString("en-NG")}`}</span>
            </div>
            <div className="flex justify-between pt-2 text-lg font-extrabold">
              <span>Total</span>
              <span>₦{total.toLocaleString("en-NG")}</span>
            </div>
          </div>

          <p className="mt-4 text-xs text-[var(--muted)]">
            You pay in full online with Paystack (card, bank transfer or
            USSD). After payment we confirm your device and contact you on
            WhatsApp. If we can&apos;t get it, you&apos;re refunded.
          </p>

          {error && <p className="mt-3 text-sm font-semibold text-red-600">{error}</p>}

          <button disabled={loading} className="btn-blue mt-4 w-full !py-4 text-lg disabled:opacity-50">
            {loading ? "Starting payment..." : `Pay ₦${total.toLocaleString("en-NG")}`}
          </button>
        </div>
      </form>
    </main>
  );
}