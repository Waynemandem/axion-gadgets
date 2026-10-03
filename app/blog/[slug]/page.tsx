import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import ReactMarkdown from "react-markdown";
import { createClient } from "@/lib/supabase/server";

type Props = { params: Promise<{ slug: string }> };

async function getPost(slug: string) {
  const supabase = await createClient();
  const { data } = await supabase
    .from("posts")
    .select("*")
    .eq("slug", slug)
    .eq("published", true)
    .maybeSingle();
  return data;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const post = await getPost(slug);
  if (!post) return { title: "Post not found" };

  return {
    title: post.title,
    description: post.excerpt,
    alternates: { canonical: `/blog/${post.slug}` },
    openGraph: {
      type: "article",
      title: post.title,
      description: post.excerpt,
      publishedTime: post.created_at,
      modifiedTime: post.updated_at ?? post.created_at,
      images: post.cover_image ? [post.cover_image] : [],
    },
  };
}

export default async function BlogPost({ params }: Props) {
  const { slug } = await params;
  const post = await getPost(slug);
  if (!post) notFound();

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: post.title,
    description: post.excerpt,
    image: post.cover_image ? [post.cover_image] : undefined,
    datePublished: post.created_at,
    dateModified: post.updated_at ?? post.created_at,
    author: { "@type": "Organization", name: "Axion Gadgets" },
    publisher: { "@type": "Organization", name: "Axion Gadgets" },
  };

  return (
    <main className="mx-auto max-w-3xl p-6">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(jsonLd).replace(/</g, "\\u003c"),
        }}
      />

      <Link href="/blog" className="text-sm underline">
        ← All posts
      </Link>

      <article className="mt-4">
        <p className="text-sm opacity-60">
          {new Date(post.created_at).toLocaleDateString("en-NG", {
            dateStyle: "long",
          })}
        </p>
        <h1 className="mt-1 text-4xl font-bold leading-tight">{post.title}</h1>

        {post.cover_image && (
          <div className="relative mt-6 aspect-video overflow-hidden rounded-xl">
            <Image
              src={post.cover_image}
              alt={post.title}
              fill
              priority
              sizes="(max-width: 768px) 100vw, 768px"
              className="object-cover"
            />
          </div>
        )}

        <div className="prose prose-lg mt-8 max-w-none">
          <ReactMarkdown>{post.content}</ReactMarkdown>
        </div>
      </article>

      <div className="mt-12 rounded-xl border p-5">
        <p className="font-semibold">Looking to buy?</p>
        <p className="mt-1 text-sm opacity-80">
          Original devices, 7-day warranty, delivery across Nigeria.
        </p>
        <Link
          href="/products"
          className="mt-3 inline-block rounded-lg bg-black px-4 py-2 font-semibold text-white"
        >
          Shop gadgets
        </Link>
      </div>
    </main>
  );
}