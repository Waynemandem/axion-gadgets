"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";

function slugify(text: string) {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

export default function NewPost() {
  const router = useRouter();
  const [title, setTitle] = useState("");
  const [slug, setSlug] = useState("");
  const [slugEdited, setSlugEdited] = useState(false);
  const [excerpt, setExcerpt] = useState("");
  const [content, setContent] = useState("");
  const [published, setPublished] = useState(false);
  const [cover, setCover] = useState<File | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  function handleTitle(value: string) {
    setTitle(value);
    if (!slugEdited) setSlug(slugify(value));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setError(null);

    const supabase = createClient();
    let coverUrl: string | null = null;

    if (cover) {
      const safeName = cover.name.replace(/[^a-zA-Z0-9.]+/g, "-");
      const path = `blog/${slug}/${Date.now()}-${safeName}`;
      const { error: uploadError } = await supabase.storage
        .from("product-images")
        .upload(path, cover);

      if (uploadError) {
        setError(`Cover upload failed: ${uploadError.message}`);
        setSaving(false);
        return;
      }
      coverUrl = supabase.storage.from("product-images").getPublicUrl(path)
        .data.publicUrl;
    }

    const { error: insertError } = await supabase.from("posts").insert({
      title,
      slug,
      excerpt,
      content,
      cover_image: coverUrl,
      published,
      updated_at: new Date().toISOString(),
    });

    if (insertError) {
      setError(
        insertError.code === "23505"
          ? "That slug is already used by another post. Change it."
          : insertError.message
      );
      setSaving(false);
      return;
    }

    router.push("/admin");
    router.refresh();
  }

  const input = "w-full rounded-lg border p-3";
  const label = "block text-sm font-medium mb-1";

  return (
    <main className="mx-auto max-w-3xl p-6">
      <Link href="/admin" className="text-sm underline">
        ← Back to admin
      </Link>
      <h1 className="text-2xl font-bold my-4">Write post</h1>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className={label}>Title</label>
          <input
            className={input}
            value={title}
            onChange={(e) => handleTitle(e.target.value)}
            placeholder="iPhone 15 Pro Price in Nigeria (2026)"
            required
          />
        </div>

        <div>
          <label className={label}>Slug (the page URL)</label>
          <input
            className={input}
            value={slug}
            onChange={(e) => {
              setSlug(slugify(e.target.value));
              setSlugEdited(true);
            }}
            required
          />
        </div>

        <div>
          <label className={label}>
            Excerpt (shows on Google, aim for under 155 characters)
          </label>
          <textarea
            className={input}
            rows={2}
            value={excerpt}
            onChange={(e) => setExcerpt(e.target.value)}
            maxLength={160}
            required
          />
          <p className="text-xs opacity-60 mt-1">{excerpt.length}/160</p>
        </div>

        <div>
          <label className={label}>
            Content (Markdown: ## Heading, **bold**, - list, [link](url))
          </label>
          <textarea
            className={`${input} font-mono text-sm`}
            rows={18}
            value={content}
            onChange={(e) => setContent(e.target.value)}
            required
          />
        </div>

        <div>
          <label className={label}>Cover image</label>
          <input
            type="file"
            accept="image/*"
            onChange={(e) => setCover(e.target.files?.[0] ?? null)}
          />
        </div>

        <label className="flex items-center gap-2">
          <input
            type="checkbox"
            checked={published}
            onChange={(e) => setPublished(e.target.checked)}
          />
          Publish now (leave unticked to save as draft)
        </label>

        {error && <p className="text-sm text-red-600">{error}</p>}

        <button
          disabled={saving}
          className="rounded-lg bg-black text-white px-5 py-3 font-semibold disabled:opacity-50"
        >
          {saving ? "Saving..." : "Save post"}
        </button>
      </form>
    </main>
  );
}