import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import SectionHeading from "@/components/SectionHeading";

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

  if (error) return <p className="p-6">Error: {error.message}</p>;

  return (
    <main className="mx-auto max-w-6xl px-4 pb-8 pt-10">
      <SectionHeading
        eyebrow="Read"
        title="Buying Guides"
        pill={`${posts?.length ?? 0} posts`}
      />

      {posts?.length === 0 && (
        <p className="text-[var(--muted)]">No posts yet.</p>
      )}

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {posts?.map((post) => (
          <Link
            key={post.id}
            href={`/blog/${post.slug}`}
            className="soft-card block overflow-hidden transition hover:-translate-y-0.5"
          >
            {post.cover_image && (
              <div className="relative aspect-video bg-[var(--blue-soft)]">
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
              <p className="eyebrow">
                {new Date(post.created_at).toLocaleDateString("en-NG", {
                  dateStyle: "medium",
                })}
              </p>
              <h2 className="mt-1 text-lg font-bold leading-snug">
                {post.title}
              </h2>
              <p className="mt-2 line-clamp-3 text-sm text-[var(--muted)]">
                {post.excerpt}
              </p>
            </div>
          </Link>
        ))}
      </div>
    </main>
  );
}