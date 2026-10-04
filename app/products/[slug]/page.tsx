import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import ProductGallery from "@/components/ProductGallery";

type Props = { params: Promise<{ slug: string }> };

async function getProduct(slug: string) {
  const supabase = await createClient();
  const { data } = await supabase
    .from("products")
    .select("*")
    .eq("slug", slug)
    .eq("published", true)
    .maybeSingle();
  return data;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const product = await getProduct(slug);
  if (!product) return { title: "Product not found" };

  const price = `₦${product.price.toLocaleString("en-NG")}`;
  const description = (
    product.description ||
    `${product.name} available at Axion Gadgets in Nigeria.`
  ).slice(0, 155);

  return {
    title: `${product.name} Price in Nigeria (${price})`,
    description,
    alternates: { canonical: `/products/${product.slug}` },
    openGraph: {
      title: product.name,
      description,
      images: product.images?.[0] ? [product.images[0]] : [],
    },
  };
}

export default async function ProductPage({ params }: Props) {
  const { slug } = await params;
  const product = await getProduct(slug);
  if (!product) notFound();

  const inStock = product.stock > 0;
  const images: string[] = product.images ?? [];
  const whatsapp = `https://wa.me/${
    process.env.NEXT_PUBLIC_WHATSAPP_NUMBER
  }?text=${encodeURIComponent(
    `Hello Axion Gadgets, I'm interested in the ${product.name} (₦${product.price.toLocaleString(
      "en-NG"
    )}). Is it available?`
  )}`;

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Product",
    name: product.name,
    image: images,
    description: product.description,
    brand: { "@type": "Brand", name: product.brand },
    itemCondition:
      product.condition === "used"
        ? "https://schema.org/UsedCondition"
        : "https://schema.org/NewCondition",
    offers: {
      "@type": "Offer",
      priceCurrency: "NGN",
      price: product.price,
      availability: inStock
        ? "https://schema.org/InStock"
        : "https://schema.org/OutOfStock",
    },
  };

  return (
    <main className="mx-auto max-w-6xl px-4 pb-8 pt-8">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(jsonLd).replace(/</g, "\\u003c"),
        }}
      />

      <Link href="/products" className="btn-white !px-4 !py-2 text-sm">
        ← All products
      </Link>

      <div className="mt-6 grid gap-8 md:grid-cols-2">
        <ProductGallery images={images} name={product.name} />

        <div>
          <p className="eyebrow">
            {product.brand} · {product.condition === "used" ? "Used" : "New"}
          </p>
          <h1 className="mt-2 text-3xl font-extrabold leading-tight tracking-tight md:text-4xl">
            {product.name}
          </h1>

          <p className="mt-4 text-4xl font-extrabold text-[var(--blue)]">
            ₦{product.price.toLocaleString("en-NG")}
          </p>

          <div className="mt-3">
            {inStock ? (
              <span className="rounded-full bg-green-50 px-3 py-1 text-sm font-bold text-green-700">
                In stock · {product.stock} available
              </span>
            ) : (
              <span className="pill-soft">Out of stock</span>
            )}
          </div>

          <a
            href={whatsapp}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-6 flex items-center justify-center rounded-full bg-[#1FA855] p-4 text-lg font-bold text-white shadow-[0_8px_20px_rgba(31,168,85,0.35)]"
          >
            Order on WhatsApp
          </a>

          <div className="mt-5 flex flex-wrap gap-2">
            {[
              "🚚 Delivery across Nigeria",
              "🛡️ 7-day warranty",
              "💳 Transfer, card or on delivery (Lagos)",
            ].map((t) => (
              <span
                key={t}
                className="pill-soft !bg-white !text-[var(--ink)] shadow-sm"
              >
                {t}
              </span>
            ))}
          </div>

          {product.description && (
            <div className="soft-card mt-6 p-5">
              <h2 className="text-lg font-extrabold">About this device</h2>
              <p className="mt-2 whitespace-pre-line text-[var(--muted)]">
                {product.description}
              </p>
            </div>
          )}

          <details className="soft-card mt-4 p-5">
            <summary className="cursor-pointer font-extrabold">
              7-day warranty details
            </summary>
            <div className="mt-3 grid gap-4 text-sm text-[var(--muted)] sm:grid-cols-2">
              <div>
                <p className="font-bold text-[var(--ink)]">Covered</p>
                <ul className="mt-1 list-disc space-y-1 pl-5">
                  <li>Dead on arrival, or will not power on</li>
                  <li>Screen or touch faults not from impact</li>
                  <li>Battery that will not charge</li>
                  <li>Faulty charging port, speaker, mic or camera</li>
                </ul>
              </div>
              <div>
                <p className="font-bold text-[var(--ink)]">Not covered</p>
                <ul className="mt-1 list-disc space-y-1 pl-5">
                  <li>Cracked screens or physical damage</li>
                  <li>Liquid damage</li>
                  <li>Repairs by anyone else</li>
                  <li>iCloud or Google locks set after delivery</li>
                </ul>
              </div>
            </div>
          </details>
        </div>
      </div>
    </main>
  );
}