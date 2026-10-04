"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { createClient } from "@/lib/supabase/client";
import { compressImage } from "@/lib/compressImage";

export type PostRow = {
  id: string;
  title: string;
  slug: string;
  excerpt: string | null;
  content: string;
  cover_image: string | null;
  published: boolean;
};

const BUCKET = "product-images";

function slugify(text: string) {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

function storagePath(url: string) {
  const marker = `/${BUCKET}/`;
  const i = url.indexOf(marker);
  return i === -1 ? null : decodeURIComponent(url.slice(i + marker.length));
}

export default function PostForm({ post }: { post?: PostRow }) {
  const router = useRouter();
  const isEdit = !!post;

  const [title, setTitle] = useState(post?.title ?? "");
  const [slug, setSlug] = useState(post?.slug ?? "");
  const [slugEdited, setSlugEdited] = useState(isEdit);
  const [excerpt, setExcerpt] = useState(post?.excerpt ?? "");
  const [content, setContent] = useState(post?.content ?? "");
  const [published, setPublished] = useState(post?.published ?? false);
  const [cover, setCover] = useState<string | null>(post?.cover_image ?? null);
  const [oldCover, setOldCover] = useState<string | null>(null);
  const [file, setFile] = useState<File | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  function handleTitle(value: string) {
    setTitle(value);
    if (!slugEdited) setSlug(slugify(value));
  }

  function removeCover() {
    if (cover) setOldCover(cover);
    setCover(null);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setError(null);

    const supabase = createClient();
    let coverUrl = cover;
    let toDelete = oldCover;

    if (file) {
  const compressed = await compressImage(file);
  const safeName = compressed.name.replace(/[^a-zA-Z0-9.]+/g, "-");
  const path = `blog/${slug}/${Date.now()}-${safeName}`;
  const { error: uploadError } = await supabase.storage
    .from(BUCKET)
    .upload(path, compressed);

      if (uploadError) {
        setError(`Cover upload failed: ${uploadError.message}`);
        setSaving(false);
        return;
      }
      coverUrl = supabase.storage.from(BUCKET).getPublicUrl(path).data.publicUrl;
      if (cover) toDelete = cover;
    }

    const values = {
      title,
      slug,
      excerpt,
      content,
      cover_image: coverUrl,
      published,
      updated_at: new Date().toISOString(),
    };

    const { error: saveError } = isEdit
      ? await supabase.from("posts").update(values).eq("id", post!.id)
      : await supabase.from("posts").insert(values);

    if (saveError) {
      setError(
        saveError.code === "23505"
          ? "That slug is already used by another post. Change it."
          : saveError.message
      );
      setSaving(false);
      return;
    }

    const oldPath = toDelete ? storagePath(toDelete) : null;
    if (oldPath) await supabase.storage.from(BUCKET).remove([oldPath]);

    router.push("/admin");
    router.refresh();
  }

  async function handleDelete() {
    if (!post) return;
    if (!confirm(`Delete "${post.title}" permanently? This cannot be undone.`))
      return;

    setSaving(true);
    setError(null);
    const supabase = createClient();

    const { error: deleteError } = await supabase
      .from("posts")
      .delete()
      .eq("id", post.id);

    if (deleteError) {
      setError(deleteError.message);
      setSaving(false);
      return;
    }

    const path = post.cover_image ? storagePath(post.cover_image) : null;
    if (path) await supabase.storage.from(BUCKET).remove([path]);

    router.push("/admin");
    router.refresh();
  }

  const input = "w-full rounded-xl border border-slate-200 bg-white p-3";
  const label = "mb-1 block text-sm font-semibold";

  return (
    <main className="mx-auto max-w-3xl px-4 py-8">
      <Link href="/admin" className="text-sm underline">
        ← Back to admin
      </Link>
      <h1 className="my-4 text-3xl font-extrabold tracking-tight">
        {isEdit ? "Edit post" : "Write post"}
      </h1>

      <form onSubmit={handleSubmit} className="soft-card space-y-4 p-5">
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
          {isEdit && (
            <p className="mt-1 text-xs text-amber-600">
              Changing this changes the post&apos;s web address. Old links and
              Google results will stop working.
            </p>
          )}
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
          <p className="mt-1 text-xs opacity-60">{excerpt.length}/160</p>
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
          {cover && (
            <div className="mb-3 max-w-xs">
              <div className="relative aspect-video overflow-hidden rounded-xl bg-slate-100">
                <Image
                  src={cover}
                  alt="Cover"
                  fill
                  sizes="320px"
                  className="object-cover"
                />
              </div>
              <button
                type="button"
                onClick={removeCover}
                className="mt-1 text-xs text-red-600 underline"
              >
                Remove cover
              </button>
            </div>
          )}
          <input
            type="file"
            accept="image/*"
            onChange={(e) => setFile(e.target.files?.[0] ?? null)}
          />
          {file && cover && (
            <p className="mt-1 text-xs opacity-70">
              The new image will replace the current cover.
            </p>
          )}
        </div>

        <label className="flex items-center gap-2 font-medium">
          <input
            type="checkbox"
            checked={published}
            onChange={(e) => setPublished(e.target.checked)}
          />
          Published (untick to keep as a draft)
        </label>

        {error && <p className="text-sm text-red-600">{error}</p>}

        <div className="flex items-center justify-between pt-2">
          <button disabled={saving} className="btn-blue disabled:opacity-50">
            {saving ? "Saving..." : isEdit ? "Save changes" : "Save post"}
          </button>
          {isEdit && (
            <button
              type="button"
              onClick={handleDelete}
              disabled={saving}
              className="text-sm font-semibold text-red-600 underline disabled:opacity-50"
            >
              Delete post
            </button>
          )}
        </div>
      </form>
    </main>
  );
}