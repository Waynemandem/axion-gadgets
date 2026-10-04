"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { createClient } from "@/lib/supabase/client";
import { compressImage } from  "@/lib/compressImage";

export type ProductRow = {
  id: string;
  name: string;
  slug: string;
  brand: string;
  category: string;
  price: number;
  condition: string;
  stock: number;
  description: string | null;
  images: string[] | null;
  published: boolean;
};

const BUCKET = "product-images";
const CATEGORIES = [
  "Phones",
  "Laptops",
  "Tablets",
  "Audio",
  "Wearables",
  "Power",
  "Gaming",
  "Accessories",
];

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

export default function ProductForm({ product }: { product?: ProductRow }) {
  const router = useRouter();
  const isEdit = !!product;

  const [name, setName] = useState(product?.name ?? "");
  const [slug, setSlug] = useState(product?.slug ?? "");
  const [slugEdited, setSlugEdited] = useState(isEdit);
  const [brand, setBrand] = useState(product?.brand ?? "");
  const [category, setCategory] = useState(product?.category ?? "Phones");
  const [price, setPrice] = useState(product ? String(product.price) : "");
  const [condition, setCondition] = useState(product?.condition ?? "new");
  const [stock, setStock] = useState(product ? String(product.stock) : "1");
  const [description, setDescription] = useState(product?.description ?? "");
  const [published, setPublished] = useState(product?.published ?? false);
  const [existing, setExisting] = useState<string[]>(product?.images ?? []);
  const [removed, setRemoved] = useState<string[]>([]);
  const [files, setFiles] = useState<File[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  function handleName(value: string) {
    setName(value);
    if (!slugEdited) setSlug(slugify(value));
  }

  function removeExisting(url: string) {
    setExisting(existing.filter((u) => u !== url));
    setRemoved([...removed, url]);
  }

  function makeMain(url: string) {
    setExisting([url, ...existing.filter((u) => u !== url)]);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setError(null);

    const supabase = createClient();
    const newUrls: string[] = [];

    for (const original of files) {
      const file = await compressImage(original);
      const safeName = file.name.replace(/[^a-zA-Z0-9.]+/g, "-");
      const path = `${slug}/${Date.now()}-${safeName}`;
      const { error: uploadError } = await supabase.storage
        .from(BUCKET)
        .upload(path, file);

      if (uploadError) {
        setError(`Image upload failed: ${uploadError.message}`);
        setSaving(false);
        return;
      }
      newUrls.push(supabase.storage.from(BUCKET).getPublicUrl(path).data.publicUrl);
    }

    const values = {
      name,
      slug,
      brand,
      category,
      price: parseInt(price, 10),
      condition,
      stock: parseInt(stock, 10),
      description,
      images: [...existing, ...newUrls],
      published,
    };

    const { error: saveError } = isEdit
      ? await supabase.from("products").update(values).eq("id", product!.id)
      : await supabase.from("products").insert(values);

    if (saveError) {
      setError(
        saveError.code === "23505"
          ? "That slug is already used by another product. Change it."
          : saveError.message
      );
      setSaving(false);
      return;
    }

    const paths = removed.map(storagePath).filter((p): p is string => !!p);
    if (paths.length) await supabase.storage.from(BUCKET).remove(paths);

    router.push("/admin");
    router.refresh();
  }

  async function handleDelete() {
    if (!product) return;
    if (!confirm(`Delete "${product.name}" permanently? This cannot be undone.`))
      return;

    setSaving(true);
    setError(null);
    const supabase = createClient();

    const { error: deleteError } = await supabase
      .from("products")
      .delete()
      .eq("id", product.id);

    if (deleteError) {
      setError(deleteError.message);
      setSaving(false);
      return;
    }

    const paths = (product.images ?? [])
      .map(storagePath)
      .filter((p): p is string => !!p);
    if (paths.length) await supabase.storage.from(BUCKET).remove(paths);

    router.push("/admin");
    router.refresh();
  }

  const input = "w-full rounded-xl border border-slate-200 bg-white p-3";
  const label = "mb-1 block text-sm font-semibold";

  return (
    <main className="mx-auto max-w-2xl px-4 py-8">
      <Link href="/admin" className="text-sm underline">
        ← Back to admin
      </Link>
      <h1 className="my-4 text-3xl font-extrabold tracking-tight">
        {isEdit ? "Edit product" : "Add product"}
      </h1>

      <form onSubmit={handleSubmit} className="soft-card space-y-4 p-5">
        <div>
          <label className={label}>Name</label>
          <input
            className={input}
            value={name}
            onChange={(e) => handleName(e.target.value)}
            placeholder="iPhone 15 Pro 256GB"
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
              Changing this changes the product&apos;s web address. Old links
              and Google results will stop working.
            </p>
          )}
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className={label}>Brand</label>
            <input
              className={input}
              value={brand}
              onChange={(e) => setBrand(e.target.value)}
              placeholder="Apple"
              required
            />
          </div>
          <div>
            <label className={label}>Category</label>
            <select
              className={input}
              value={category}
              onChange={(e) => setCategory(e.target.value)}
            >
              {CATEGORIES.map((c) => (
                <option key={c}>{c}</option>
              ))}
            </select>
          </div>
        </div>

        <div className="grid grid-cols-3 gap-4">
          <div>
            <label className={label}>Price (₦)</label>
            <input
              className={input}
              type="number"
              min="0"
              value={price}
              onChange={(e) => setPrice(e.target.value)}
              required
            />
          </div>
          <div>
            <label className={label}>Condition</label>
            <select
              className={input}
              value={condition}
              onChange={(e) => setCondition(e.target.value)}
            >
              <option value="new">New</option>
              <option value="used">Used</option>
            </select>
          </div>
          <div>
            <label className={label}>Stock</label>
            <input
              className={input}
              type="number"
              min="0"
              value={stock}
              onChange={(e) => setStock(e.target.value)}
              required
            />
          </div>
        </div>

        <div>
          <label className={label}>Description</label>
          <textarea
            className={input}
            rows={5}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Storage, colour, battery health, what's in the box..."
          />
        </div>

        <div>
          <label className={label}>Photos</label>

          {existing.length > 0 && (
            <div className="mb-3 grid grid-cols-3 gap-3">
              {existing.map((url, i) => (
                <div key={url} className="rounded-xl border p-2">
                  <div className="relative aspect-square overflow-hidden rounded-lg bg-slate-100">
                    <Image
                      src={url}
                      alt={`Photo ${i + 1}`}
                      fill
                      sizes="150px"
                      className="object-cover"
                    />
                    {i === 0 && (
                      <span className="absolute left-1 top-1 rounded-full bg-[var(--orange)] px-2 py-0.5 text-[10px] font-bold text-white">
                        MAIN
                      </span>
                    )}
                  </div>
                  <div className="mt-2 flex justify-between text-xs">
                    {i !== 0 ? (
                      <button
                        type="button"
                        onClick={() => makeMain(url)}
                        className="underline"
                      >
                        Make main
                      </button>
                    ) : (
                      <span />
                    )}
                    <button
                      type="button"
                      onClick={() => removeExisting(url)}
                      className="text-red-600 underline"
                    >
                      Remove
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}

          <input
            type="file"
            accept="image/*"
            multiple
            onChange={(e) => setFiles(Array.from(e.target.files ?? []))}
          />
          {files.length > 0 && (
            <p className="mt-1 text-sm">{files.length} new photo(s) selected</p>
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
            {saving ? "Saving..." : isEdit ? "Save changes" : "Save product"}
          </button>
          {isEdit && (
            <button
              type="button"
              onClick={handleDelete}
              disabled={saving}
              className="text-sm font-semibold text-red-600 underline disabled:opacity-50"
            >
              Delete product
            </button>
          )}
        </div>
      </form>
    </main>
  );
}