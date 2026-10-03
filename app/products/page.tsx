import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";

export const metadata: Metadata = {
  title: "Phones, Laptops & Gadgets",
  description:
    "Browse original iPhones, Samsung phones, laptops and accessories in Nigeria, with a 7-day warranty.",
};

export default async function Products() {
  const supabase = await createClient();
  const { data: products, error } = await supabase
    .from("products")
    .select("id, name, slug, price, condition, stock, images")
    .eq("published", true)
    .order("created_at", { ascending: false });

  if (error) return <p>Error: {error.message}</p>;

  return (
    <main className="mx-auto max-w-6xl p-6">
      <h1 className="mb-6 text-3xl font-bold">All gadgets</h1>

      {products?.length === 0 && <p>No products yet.</p>}

      <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-4">
        {products?.map((p) => (
          <Link
            key={p.id}
            href={`/products/${p.slug}`}
            className="rounded-xl border p-3 transition hover:shadow-md"
          >
            <div className="relative aspect-square overflow-hidden rounded-lg bg-gray-100">
              {p.images?.[0] ? (
                <Image
                  src={p.images[0]}
                  alt={p.name}
                  fill
                  sizes="(max-width: 768px) 50vw, 25vw"
                  className="object-cover"
                />
              ) : (
                <div className="grid h-full place-items-center text-5xl">
                  📱
                </div>
              )}
            </div>
            <h2 className="mt-3 font-semibold leading-tight">{p.name}</h2>
            <p className="mt-1 font-bold">
              ₦{p.price.toLocaleString("en-NG")}
              {p.condition === "used" && (
                <span className="ml-2 rounded bg-amber-300 px-1.5 py-0.5 text-xs">
                  Used
                </span>
              )}
            </p>
            {p.stock === 0 && (
              <p className="mt-1 text-xs opacity-60">Out of stock</p>
            )}
          </Link>
        ))}
      </div>
    </main>
  );
}