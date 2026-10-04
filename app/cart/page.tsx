"use client";

import Image from "next/image";
import Link from "next/link";
import { useCart } from "@/lib/cart";
import SectionHeading from "@/components/SectionHeading";

export default function CartPage() {
  const { items, subtotal, setQty, remove, ready } = useCart();

  if (!ready) {
    return <main className="mx-auto max-w-3xl px-4 py-10">Loading cart...</main>;
  }

  return (
    <main className="mx-auto max-w-3xl px-4 pb-8 pt-10">
      <SectionHeading
        eyebrow="Your order"
        title="Cart"
        pill={`${items.length} item${items.length === 1 ? "" : "s"}`}
      />

      {items.length === 0 ? (
        <div className="soft-card p-8 text-center">
          <p className="font-semibold">Your cart is empty.</p>
          <Link href="/products" className="btn-blue mt-4">
            Browse gadgets
          </Link>
        </div>
      ) : (
        <>
          <ul className="space-y-3">
            {items.map((item) => (
              <li key={item.id} className="soft-card flex gap-4 p-3">
                <Link
                  href={`/products/${item.slug}`}
                  className="relative h-24 w-24 shrink-0 overflow-hidden rounded-2xl bg-[var(--blue-soft)]"
                >
                  {item.image ? (
                    <Image
                      src={item.image}
                      alt={item.name}
                      fill
                      sizes="96px"
                      className="object-cover"
                    />
                  ) : (
                    <span className="grid h-full place-items-center text-3xl">
                      📱
                    </span>
                  )}
                </Link>

                <div className="flex min-w-0 flex-1 flex-col justify-between">
                  <div>
                    <p className="line-clamp-2 font-bold leading-snug">
                      {item.name}
                    </p>
                    <p className="font-extrabold text-[var(--blue)]">
                      ₦{item.price.toLocaleString("en-NG")}
                    </p>
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => setQty(item.id, item.quantity - 1)}
                        className="h-8 w-8 rounded-full bg-[var(--blue-soft)] font-bold text-[var(--blue)]"
                        aria-label="Decrease quantity"
                      >
                        −
                      </button>
                      <span className="w-6 text-center font-bold">
                        {item.quantity}
                      </span>
                      <button
                        onClick={() => setQty(item.id, item.quantity + 1)}
                        disabled={item.quantity >= item.stock}
                        className="h-8 w-8 rounded-full bg-[var(--blue-soft)] font-bold text-[var(--blue)] disabled:opacity-40"
                        aria-label="Increase quantity"
                      >
                        +
                      </button>
                    </div>
                    <button
                      onClick={() => remove(item.id)}
                      className="text-sm font-semibold text-red-600 underline"
                    >
                      Remove
                    </button>
                  </div>
                </div>
              </li>
            ))}
          </ul>

          <div className="soft-card mt-6 p-5">
            <div className="flex items-center justify-between text-lg font-extrabold">
              <span>Subtotal</span>
              <span>₦{subtotal.toLocaleString("en-NG")}</span>
            </div>
            <p className="mt-1 text-sm text-[var(--muted)]">
              Delivery fee is added at checkout, based on your state.
            </p>
            <Link href="/checkout" className="btn-blue mt-4 w-full !py-4 text-lg">
              Checkout
            </Link>
          </div>
        </>
      )}
    </main>
  );
}