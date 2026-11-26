
import type { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  const base =
    process.env.NEXT_PUBLIC_SITE_URL ||
    "https://axiongadgets.vercel.app";

  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: ["/admin/", "/login/", "/cart/", "/checkout/"],
    },
    sitemap: `${base}/sitemap.xml`,
    host: base,
  };
}
