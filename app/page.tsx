import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import ProductCard from "@/components/ProductCard";
import SectionHeading from "@/components/SectionHeading";

export const metadata: Metadata = { alternates: { canonical: "/" } };

const fields = "id, name, slug, price, condition, stock, images, created_at";

export default async function Home() {
  const supabase = await createClient();

  const [trending, all, blog] = await Promise.all([
    supabase
      .from("products")
      .select(fields)
      .eq("published", true)
      .gt("stock", 0)
      .order("created_at", { ascending: false })
      .limit(6),
    supabase
      .from("products")
      .select(fields, { count: "exact" })
      .eq("published", true)
      .order("created_at", { ascending: false })
      .limit(50),
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
    <main className="mx-auto max-w-6xl px-4 pb-8">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(jsonLd).replace(/</g, "\\u003c"),
        }}
      />

      {trending.data && trending.data.length > 0 && (
        <section className="pt-8">
          <SectionHeading eyebrow="Live picks" title="Trending Now" pill="Hot" hot />
          <div className="no-scrollbar -mx-4 flex snap-x snap-mandatory gap-4 overflow-x-auto px-4 pb-6">
            {trending.data.map((p) => (
              <ProductCard
                key={p.id}
                product={p}
                className="w-[78%] shrink-0 snap-start sm:w-[300px]"
              />
            ))}
          </div>
        </section>
      )}

      <section className="pt-6">
        <SectionHeading
          eyebrow="Shop"
          title="All Products"
          pill={`${all.count ?? 0} items`}
        />
        {all.data && all.data.length > 0 ? (
          <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-4">
            {all.data.map((p) => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>
        ) : (
          <p className="text-[var(--muted)]">New stock is coming soon.</p>
        )}
        <div className="mt-6 text-center">
          <Link href="/products" className="btn-white">
            View all products
          </Link>
        </div>
      </section>

      <section className="pt-16">
        <p className="eyebrow">Lagos · Delivered nationwide</p>
        <h1 className="mt-2 max-w-3xl text-3xl font-extrabold leading-[1.1] tracking-tight md:text-5xl">
          Original gadgets, delivered across Nigeria.
        </h1>
        <p className="mt-4 max-w-xl text-lg text-[var(--muted)]">
          iPhones, Samsung, laptops and more. Tested, with a 7-day warranty and
          a real receipt.
        </p>
        <div className="mt-6 flex flex-wrap gap-2">
          {[
            "🚚 Nationwide delivery",
            "🛡️ 7-day warranty",
            "💳 Pay securely online",
          ].map((t) => (
            <span
              key={t}
              className="pill-soft !bg-white !text-[var(--ink)] shadow-sm"
            >
              {t}
            </span>
          ))}
        </div>
        <div className="mt-6 flex flex-wrap gap-3">
          <Link href="/products" className="btn-blue">
            Shop gadgets
          </Link>
          <Link href="/blog" className="btn-white">
            Buying guides
          </Link>
        </div>
      </section>

      {blog.data && blog.data.length > 0 && (
        <section className="pt-14">
          <SectionHeading eyebrow="Read" title="Buying Guides" />
          <div className="grid gap-4 md:grid-cols-3">
            {blog.data.map((post) => (
              <Link
                key={post.id}
                href={`/blog/${post.slug}`}
                className="soft-card block overflow-hidden transition hover:-translate-y-0.5"
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
                  <h3 className="font-bold leading-snug">{post.title}</h3>
                  <p className="mt-2 line-clamp-2 text-sm text-[var(--muted)]">
                    {post.excerpt}
                  </p>
                </div>
              </Link>
            ))}
          </div>
        </section>
      )}
    </main>
  );
}