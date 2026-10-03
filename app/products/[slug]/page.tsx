import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

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
    <main className="mx-auto max-w-5xl p-6">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(jsonLd).replace(/</g, "\\u003c"),
        }}
      />

      <Link href="/products" className="text-sm underline">
        ← All products
      </Link>

      <div className="mt-4 grid gap-8 md:grid-cols-2">
        <div>
          {images[0] ? (
            <div className="relative aspect-square overflow-hidden rounded-xl border">
              <Image
                src={images[0]}
                alt={product.name}
                fill
                priority
                sizes="(max-width: 768px) 100vw, 50vw"
                className="object-cover"
              />
            </div>
          ) : (
            <div className="aspect-square rounded-xl border grid place-items-center text-6xl">
              📱
            </div>
          )}

          {images.length > 1 && (
            <div className="mt-3 grid grid-cols-4 gap-3">
              {images.slice(1, 5).map((src, i) => (
                <div
                  key={src}
                  className="relative aspect-square overflow-hidden rounded-lg border"
                >
                  <Image
                    src={src}
                    alt={`${product.name} photo ${i + 2}`}
                    fill
                    sizes="120px"
                    className="object-cover"
                  />
                </div>
              ))}
            </div>
          )}
        </div>

        <div>
          <p className="text-sm uppercase tracking-wide opacity-60">
            {product.brand} · {product.condition === "used" ? "Used" : "New"}
          </p>
          <h1 className="mt-1 text-3xl font-bold">{product.name}</h1>
          <p className="mt-3 text-3xl font-bold">
            ₦{product.price.toLocaleString("en-NG")}
          </p>
          <p className="mt-2 text-sm">
            {inStock ? `In stock (${product.stock} available)` : "Out of stock"}
          </p>

          <a
            href={whatsapp}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-6 block rounded-lg bg-green-600 p-4 text-center font-semibold text-white"
          >
            Order on WhatsApp
          </a>

          <ul className="mt-6 space-y-1 text-sm">
            <li>🚚 Delivery across Nigeria</li>
            <li>🛡️ 7-day warranty on every device</li>
            <li>💳 Pay by transfer, card or on delivery (Lagos)</li>
          </ul>

          {product.description && (
            <div className="mt-8">
              <h2 className="text-lg font-semibold">About this device</h2>
              <p className="mt-2 whitespace-pre-line opacity-80">
                {product.description}
              </p>
            </div>
          )}
        </div>
      </div>
    </main>
  );
}