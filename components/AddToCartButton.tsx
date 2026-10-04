"use client";

import { useState } from "react";
import { useCart } from "@/lib/cart";

type Props = {
  product: {
    id: string;
    slug: string;
    name: string;
    price: number;
    image: string | null;
    stock: number;
  };
};

export default function AddToCartButton({ product }: Props) {
  const { items, add } = useCart();
  const [added, setAdded] = useState(false);

  const inCart = items.find((i) => i.id === product.id)?.quantity ?? 0;
  const soldOut = product.stock <= 0;
  const maxed = inCart >= product.stock;

  function handleClick() {
    add(product);
    setAdded(true);
    setTimeout(() => setAdded(false), 1500);
  }

  if (soldOut) {
    return (
      <button disabled className="btn-white mt-6 w-full opacity-60">
        Out of stock
      </button>
    );
  }

  return (
    <button
      onClick={handleClick}
      disabled={maxed}
      className="btn-blue mt-6 w-full !py-4 text-lg disabled:opacity-60"
    >
      {added
        ? "Added ✓"
        : maxed
        ? `Maximum in cart (${inCart})`
        : inCart > 0
        ? `Add another (${inCart} in cart)`
        : "Add to cart"}
    </button>
  );
}