import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";

export const metadata: Metadata = {
  title: "Blog: Buying Guides & Phone Prices in Nigeria",
  description:
    "Buying guides, price updates and tips for phones and laptops in Nigeria, from the Axion Gadgets team.",
  alternates: { canonical: "/blog" },
};

export default async function Blog() {
  const supabase = await createClient();
  const { data: posts, error } = await supabase
    .from("posts")
    .select("id, title, slug, excerpt, cover_image, created_at")
    .eq("published", true)
    .order("created_at", { ascending: false });

  if (error) return <p>Error: {error.message}</p>;

  return (
    <main className="mx-auto max-w-4xl p-6">
      <h1 className="mb-6 text-3xl font-bold">Blog</h1>

      {posts?.length === 0 && <p>No posts yet.</p>}

      <div className="grid gap-6 md:grid-cols-2">
        {posts?.map((post) => (
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
                  sizes="(max-width: 768px) 100vw, 50vw"
                  className="object-cover"
                />
              </div>
            )}
            <div className="p-4">
              <p className="text-xs opacity-60">
                {new Date(post.created_at).toLocaleDateString("en-NG", {
                  dateStyle: "long",
                })}
              </p>
              <h2 className="mt-1 text-lg font-semibold leading-tight">
                {post.title}
              </h2>
              <p className="mt-2 text-sm opacity-80">{post.excerpt}</p>
            </div>
          </Link>
        ))}
      </div>
    </main>
  );
}