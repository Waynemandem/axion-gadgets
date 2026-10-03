import type { Metadata } from "next";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import ProductCard from "@/components/ProductCard";
import SectionHeading from "@/components/SectionHeading";

export const metadata: Metadata = {
  title: "Phones, Laptops & Gadgets",
  description:
    "Browse original iPhones, Samsung phones, laptops and accessories in Nigeria, with a 7-day warranty.",
  alternates: { canonical: "/products" },
};

export default async function Products({
  searchParams,
}: {
  searchParams: Promise<{ q?: string }>;
}) {
  const { q } = await searchParams;
  const term = q?.replace(/[,()%]/g, " ").trim();

  const supabase = await createClient();
  let query = supabase
    .from("products")
    .select("id, name, slug, price, condition, stock, images, created_at", {
      count: "exact",
    })
    .eq("published", true)
    .order("created_at", { ascending: false });

  if (term) query = query.or(`name.ilike.%${term}%,brand.ilike.%${term}%`);

  const { data: products, count, error } = await query;
  if (error) return <p className="p-6">Error: {error.message}</p>;

  return (
    <main className="mx-auto max-w-6xl px-4 pb-8 pt-10">
      <SectionHeading
        eyebrow={term ? `Results for "${term}"` : "Shop"}
        title="All Products"
        pill={`${count ?? 0} items`}
      />

      {products?.length === 0 ? (
        <div className="soft-card p-8 text-center">
          <p className="font-semibold">Nothing matches that search.</p>
          <p className="mt-1 text-sm text-[var(--muted)]">
            Message us on WhatsApp and we will source it for you.
          </p>
          <Link href="/products" className="btn-blue mt-4">
            Clear search
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-4">
          {products?.map((p) => (
            <ProductCard key={p.id} product={p} />
          ))}
        </div>
      )}
    </main>
  );
}