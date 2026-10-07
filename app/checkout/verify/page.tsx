import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { verifyOrder } from "@/lib/orders";
import { PICKUP_NOTE } from "@/lib/delivery";
import ClearCart from "@/components/ClearCart";

export const metadata: Metadata = {
  title: "Order status",
  robots: { index: false },
};

export default async function VerifyPage({
  searchParams,
}: {
  searchParams: Promise<{ reference?: string; trxref?: string }>;
}) {
  const sp = await searchParams;
  const reference = sp.reference ?? sp.trxref;
  if (!reference) redirect("/");

  const result = await verifyOrder(reference);

  const whatsapp = `https://wa.me/${
    process.env.NEXT_PUBLIC_WHATSAPP_NUMBER
  }?text=${encodeURIComponent(
    `Hello Axion Gadgets, my order reference is ${reference}.`
  )}`;

  return (
    <main className="mx-auto max-w-xl px-4 py-12">
      <div className="soft-card p-6 text-center">
        {result.state === "paid" && (
          <>
            <ClearCart />
            <p className="text-5xl">✅</p>
            <p className="eyebrow mt-3">Payment confirmed</p>
            <h1 className="mt-1 text-3xl font-extrabold tracking-tight">
              Thank you!
            </h1>
            <p className="mt-3 text-[var(--muted)]">
              We&apos;re now confirming your device and will message you on
              WhatsApp shortly.
              {result.order.fulfilment === "pickup"
                ? ` ${PICKUP_NOTE}`
                : " We'll arrange delivery and message you with the details."}
            </p>
            <div className="mt-5 rounded-2xl bg-[var(--blue-soft)] p-4 text-sm">
              <p>
                Order reference:{" "}
                <span className="font-extrabold">{result.order.reference}</span>
              </p>
              <p className="mt-1">
                Amount paid:{" "}
                <span className="font-extrabold">
                  ₦{result.order.total.toLocaleString("en-NG")}
                </span>
              </p>
            </div>
          </>
        )}

        {result.state === "pending" && (
          <>
            <p className="text-5xl">⏳</p>
            <h1 className="mt-3 text-2xl font-extrabold">
              We haven&apos;t confirmed your payment yet
            </h1>
            <p className="mt-3 text-[var(--muted)]">
              If you were charged, don&apos;t worry. Message us with your
              reference and we&apos;ll sort it out quickly.
            </p>
            <p className="mt-3 text-sm">
              Reference:{" "}
              <span className="font-extrabold">{result.order.reference}</span>
            </p>
          </>
        )}

        {result.state === "failed" && (
          <>
            <p className="text-5xl">❌</p>
            <h1 className="mt-3 text-2xl font-extrabold">Payment didn&apos;t go through</h1>
            <p className="mt-3 text-[var(--muted)]">
              You were not charged. Your cart is still saved, so you can try
              again.
            </p>
            <Link href="/cart" className="btn-blue mt-5">
              Back to cart
            </Link>
          </>
        )}

        {result.state === "closed" && (
          <>
            <p className="text-5xl">ℹ️</p>
            <h1 className="mt-3 text-2xl font-extrabold">This order is closed</h1>
            <p className="mt-3 text-[var(--muted)]">
              Message us if you have any questions about it.
            </p>
          </>
        )}

        {result.state === "not_found" && (
          <>
            <p className="text-5xl">🔍</p>
            <h1 className="mt-3 text-2xl font-extrabold">Order not found</h1>
            <p className="mt-3 text-[var(--muted)]">
              Check the link or message us with your reference.
            </p>
          </>
        )}

        <div className="mt-6 flex flex-wrap justify-center gap-3">
          <a
            href={whatsapp}
            target="_blank"
            rel="noopener noreferrer"
            className="btn-white"
          >
            Message us on WhatsApp
          </a>
          <Link href="/products" className="btn-blue">
            Keep shopping
          </Link>
        </div>
      </div>
    </main>
  );
}