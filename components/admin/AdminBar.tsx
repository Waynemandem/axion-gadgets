"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import StatusShareButton from "@/components/admin/StatusShareButton";

const BUCKET = "product-images";

function storagePath(url: string) {
  const marker = `/${BUCKET}/`;
  const i = url.indexOf(marker);
  return i === -1 ? null : decodeURIComponent(url.slice(i + marker.length));
}

type Props = {
  product: {
    id: string;
    name: string;
    slug: string;
    price: number;
    stock: number;
    published: boolean;
    condition: string;
    images: string[];
  };
};

export default function AdminBar({ product }: Props) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [busy, setBusy] = useState(false);
  const [price, setPrice] = useState(String(product.price));
  const [msg, setMsg] = useState<string | null>(null);

  const sold = product.stock <= 0;

  async function update(values: Record<string, unknown>, done = "Saved") {
    setBusy(true);
    setMsg(null);
    const supabase = createClient();
    const { error } = await supabase
      .from("products")
      .update(values)
      .eq("id", product.id);
    setMsg(error ? error.message : done);
    setBusy(false);
    router.refresh();
  }

  async function savePrice() {
    const n = parseInt(price, 10);
    if (!Number.isInteger(n) || n < 0) {
      setMsg("Enter a valid price");
      return;
    }
    await update({ price: n }, "Price updated");
  }

  async function remove() {
    if (!confirm(`Delete "${product.name}" permanently? This cannot be undone.`))
      return;

    setBusy(true);
    setMsg(null);
    const supabase = createClient();
    const { error } = await supabase
      .from("products")
      .delete()
      .eq("id", product.id);

    if (error) {
      setMsg(error.message);
      setBusy(false);
      return;
    }

    const paths = product.images
      .map(storagePath)
      .filter((p): p is string => !!p);
    if (paths.length) await supabase.storage.from(BUCKET).remove(paths);

    router.push("/products");
    router.refresh();
  }

  function shareChat() {
    const url = `${window.location.origin}/products/${product.slug}`;
    const text = `${product.name} for ₦${product.price.toLocaleString(
      "en-NG"
    )} at Axion Gadgets\n${url}`;
    window.open(`https://wa.me/?text=${encodeURIComponent(text)}`, "_blank");
  }

  const b =
    "rounded-full bg-white/10 px-3 py-1.5 text-xs font-semibold disabled:opacity-40";

  return (
    <div className="fixed inset-x-0 bottom-0 z-30 px-3 pb-[max(0.75rem,env(safe-area-inset-bottom))]">
      <div className="mx-auto max-w-xl rounded-3xl bg-slate-900 text-white shadow-2xl">
        <button
          type="button"
          onClick={() => setOpen(!open)}
          className="flex w-full items-center justify-between px-5 py-3 text-sm font-bold"
        >
          <span>
            Admin · {sold ? "Sold" : `Stock ${product.stock}`}
            {!product.published && " · Draft"}
          </span>
          <span>{open ? "▾" : "▴"}</span>
        </button>

        {open && (
          <div className="space-y-3 border-t border-white/10 px-5 pb-4 pt-3">
            <div className="flex gap-2">
              <input
                type="number"
                min="0"
                value={price}
                onChange={(e) => setPrice(e.target.value)}
                aria-label="Price in naira"
                className="min-w-0 flex-1 rounded-full bg-white px-4 py-2 text-sm text-slate-900"
              />
              <button
                type="button"
                onClick={savePrice}
                disabled={busy}
                className="rounded-full bg-[var(--blue)] px-4 py-2 text-sm font-bold disabled:opacity-40"
              >
                Save price
              </button>
            </div>

            <div className="flex flex-wrap gap-2">
              <button
                type="button"
                className={b}
                disabled={busy}
                onClick={() => update({ stock: sold ? 1 : 0 })}
              >
                {sold ? "Back in stock" : "Mark sold"}
              </button>
              <button
                type="button"
                className={b}
                disabled={busy}
                onClick={() => update({ published: !product.published })}
              >
                {product.published ? "Unpublish" : "Publish"}
              </button>
              <Link href={`/admin/products/${product.id}/edit`} className={b}>
                Edit details
              </Link>
              <Link href="/admin/new" className={b}>
                + Add product
              </Link>
              <Link href="/admin" className={b}>
                Dashboard
              </Link>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <StatusShareButton
                product={{
                  name: product.name,
                  slug: product.slug,
                  price: product.price,
                  condition: product.condition,
                  image: product.images[0] ?? null,
                }}
              />
              <button type="button" className={b} onClick={shareChat}>
                Share in WhatsApp chat
              </button>
            </div>

            <div className="flex items-center justify-between">
              <span className="text-xs opacity-80">{msg}</span>
              <button
                type="button"
                onClick={remove}
                disabled={busy}
                className="text-xs font-semibold text-red-300 underline disabled:opacity-40"
              >
                Delete product
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}