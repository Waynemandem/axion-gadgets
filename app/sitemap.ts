import type { MetadataRoute } from "next";
import { createClient } from "@/lib/supabase/server";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const base = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";
  const supabase = await createClient();

  const [{ data: products }, { data: posts }] = await Promise.all([
    supabase.from("products").select("slug, created_at").eq("published", true),
    supabase
      .from("posts")
      .select("slug, created_at, updated_at")
      .eq("published", true),
  ]);

  return [
    { url: base, lastModified: new Date() },
    { url: `${base}/products`, lastModified: new Date() },
    { url: `${base}/blog`, lastModified: new Date() },
    ...(products ?? []).map((p) => ({
      url: `${base}/products/${p.slug}`,
      lastModified: new Date(p.created_at),
    })),
    ...(posts ?? []).map((p) => ({
      url: `${base}/blog/${p.slug}`,
      lastModified: new Date(p.updated_at ?? p.created_at),
    })),
  ];
}