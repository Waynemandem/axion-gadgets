import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import ReactMarkdown from "react-markdown";
import { createClient } from "@/lib/supabase/server";

type Props = { params: Promise<{ slug: string }> };

async function getPost(slug: string) {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("products")
    .select("*")
    .eq("slug", slug)
    .eq("published", true)
    .maybeSingle();
  if (error) console.error("getProduct failed:", slug, error.message);
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
    <main className="mx-auto max-w-3xl px-4 pb-8 pt-8">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(jsonLd).replace(/</g, "\\u003c"),
        }}
      />

      <Link href="/blog" className="btn-white !px-4 !py-2 text-sm">
        ← All guides
      </Link>

      <article className="mt-6">
        <p className="eyebrow">
          {new Date(post.created_at).toLocaleDateString("en-NG", {
            dateStyle: "long",
          })}
        </p>
        <h1 className="mt-2 text-3xl font-extrabold leading-tight tracking-tight md:text-5xl">
          {post.title}
        </h1>

        {post.cover_image && (
          <div className="soft-card relative mt-6 aspect-video overflow-hidden bg-[var(--blue-soft)]">
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

        <div className="soft-card mt-6 p-6 md:p-8">
          <div className="prose prose-lg max-w-none prose-headings:font-extrabold prose-a:text-[var(--blue)]">
            <ReactMarkdown>{post.content}</ReactMarkdown>
          </div>
        </div>
      </article>

      <div className="soft-card mt-8 p-6">
        <p className="eyebrow">Ready to buy?</p>
        <p className="mt-1 text-xl font-extrabold">
          Original devices, 7-day warranty, delivery across Nigeria.
        </p>
        <Link href="/products" className="btn-blue mt-4">
          Shop gadgets
        </Link>
      </div>
    </main>
  );
}