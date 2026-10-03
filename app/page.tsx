import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import ProductCard from "@/components/ProductCard";

export const metadata: Metadata = {
  alternates: { canonical: "/" },
};

export default async function Home() {
  const supabase = await createClient();

  const [{ data: products }, { data: posts }] = await Promise.all([
    supabase
      .from("products")
      .select("id, name, slug, price, condition, stock, images")
      .eq("published", true)
      .order("created_at", { ascending: false })
      .limit(8),
    supabase
      .from("posts")
      .select("id, title, slug, excerpt, cover_image")
      .eq("published", true)
      .order("created_at", { ascending: false })
      .limit(3),
  ]);

  const site = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Store",
    name: "Axion Gadgets",
    url: site,
    description: "Phones, laptops and accessories in Nigeria",
    areaServed: "NG",
    address: {
      "@type": "PostalAddress",
      addressLocality: "Lagos",
      addressCountry: "NG",
    },
  };

  return (
    <main>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(jsonLd).replace(/</g, "\\u003c"),
        }}
      />

      <section className="mx-auto max-w-6xl px-6 py-16 md:py-24">
        <h1 className="max-w-3xl text-4xl font-extrabold leading-tight tracking-tight md:text-6xl">
          Original gadgets, delivered across Nigeria.
        </h1>
        <p className="mt-5 max-w-xl text-lg opacity-70">
          iPhones, Samsung, laptops and more. Every device is tested and comes
          with a 7-day warranty and a real receipt.
        </p>
        <div className="mt-8 flex gap-3">
          <Link
            href="/products"
            className="rounded-lg bg-black px-6 py-3 font-semibold text-white"
          >
            Shop gadgets
          </Link>
          <Link
            href="/blog"
            className="rounded-lg border px-6 py-3 font-semibold"
          >
            Buying guides
          </Link>
        </div>
      </section>

      <section className="mx-auto grid max-w-6xl gap-4 px-6 md:grid-cols-3">
        {[
          ["🚚", "Nationwide delivery", "Same-day in Lagos, 2–4 days elsewhere"],
          ["🛡️", "7-day warranty", "On every device we sell"],
          ["💳", "Flexible payment", "Transfer, card, or pay on delivery in Lagos"],
        ].map(([icon, title, text]) => (
          <div key={title} className="flex gap-3 rounded-xl border p-4">
            <span className="text-2xl">{icon}</span>
            <div>
              <p className="font-semibold">{title}</p>
              <p className="text-sm opacity-70">{text}</p>
            </div>
          </div>
        ))}
      </section>

      <section className="mx-auto max-w-6xl px-6 pt-16">
        <div className="mb-5 flex items-end justify-between">
          <h2 className="text-2xl font-bold">Latest arrivals</h2>
          <Link href="/products" className="text-sm underline">
            View all
          </Link>
        </div>
        {products && products.length > 0 ? (
          <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-4">
            {products.map((p) => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>
        ) : (
          <p className="opacity-70">New stock is coming soon.</p>
        )}
      </section>

      {posts && posts.length > 0 && (
        <section className="mx-auto max-w-6xl px-6 pt-16">
          <div className="mb-5 flex items-end justify-between">
            <h2 className="text-2xl font-bold">From the blog</h2>
            <Link href="/blog" className="text-sm underline">
              All posts
            </Link>
          </div>
          <div className="grid gap-5 md:grid-cols-3">
            {posts.map((post) => (
              <Link
                key={post.id}
                href={`/blog/${post.slug}`}
                className="overflow-hidden rounded-xl border transition hover:shadow-md"
              >
                {post.cover_image && (
                  <div className="relative aspect-video">
                    <Image
                      src={post.cover_image}
                      alt={post.title}
                      fill
                      sizes="(max-width: 768px) 100vw, 33vw"
                      className="object-cover"
                    />
                  </div>
                )}
                <div className="p-4">
                  <h3 className="font-semibold leading-tight">{post.title}</h3>
                  <p className="mt-2 text-sm opacity-70">{post.excerpt}</p>
                </div>
              </Link>
            ))}
          </div>
        </section>
      )}
    </main>
  );
}