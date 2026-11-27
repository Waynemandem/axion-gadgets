
import type { MetadataRoute } from "next";
import { createClient } from "@/lib/supabase/server";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const base =
    process.env.NEXT_PUBLIC_SITE_URL ||
    "https://axiongadgets.vercel.app";

  const supabase = await createClient();

  const [{ data: products }, { data: posts }] = await Promise.all([
    supabase
      .from("products")
      .select("slug, created_at")
      .eq("published", true),

    supabase
      .from("posts")
      .select("slug, created_at, updated_at")
      .eq("published", true),
  ]);

  const staticPages: MetadataRoute.Sitemap = [
    {
      url: base,
      lastModified: new Date(),
      changeFrequency: "daily",
      priority: 1,
    },
    {
      url: `${base}/products`,
      changeFrequency: "daily",
      priority: 0.9,
    },
    {
      url: `${base}/blog`,
      changeFrequency: "weekly",
      priority: 0.7,
    },
  ];

  const productPages: MetadataRoute.Sitemap = (products ?? []).map(
    (product) => ({
      url: `${base}/products/${product.slug}`,
      lastModified: product.created_at
        ? new Date(product.created_at)
        : undefined,
      changeFrequency: "weekly",
      priority: 0.8,
    })
  );

  const blogPages: MetadataRoute.Sitemap = (posts ?? []).map((post) => ({
    url: `${base}/blog/${post.slug}`,
    lastModified: post.updated_at
      ? new Date(post.updated_at)
      : post.created_at
        ? new Date(post.created_at)
        : undefined,
    changeFrequency: "monthly",
    priority: 0.6,
  }));

  return [...staticPages, ...productPages, ...blogPages];
}