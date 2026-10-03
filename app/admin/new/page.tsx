"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";

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

export default function NewProduct() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [slug, setSlug] = useState("");
  const [slugEdited, setSlugEdited] = useState(false);
  const [brand, setBrand] = useState("");
  const [category, setCategory] = useState("Phones");
  const [price, setPrice] = useState("");
  const [condition, setCondition] = useState("new");
  const [stock, setStock] = useState("1");
  const [description, setDescription] = useState("");
  const [published, setPublished] = useState(false);
  const [files, setFiles] = useState<File[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  function handleName(value: string) {
    setName(value);
    if (!slugEdited) setSlug(slugify(value));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setError(null);

    const supabase = createClient();
    const imageUrls: string[] = [];

    for (const file of files) {
      const safeName = file.name.replace(/[^a-zA-Z0-9.]+/g, "-");
      const path = `${slug}/${Date.now()}-${safeName}`;
      const { error: uploadError } = await supabase.storage
        .from("product-images")
        .upload(path, file);

      if (uploadError) {
        setError(`Image upload failed: ${uploadError.message}`);
        setSaving(false);
        return;
      }

      const { data } = supabase.storage
        .from("product-images")
        .getPublicUrl(path);
      imageUrls.push(data.publicUrl);
    }

    const { error: insertError } = await supabase.from("products").insert({
      name,
      slug,
      brand,
      category,
      price: parseInt(price, 10),
      condition,
      stock: parseInt(stock, 10),
      description,
      images: imageUrls,
      published,
    });

    if (insertError) {
      setError(
        insertError.code === "23505"
          ? "That slug is already used by another product. Change it."
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
    <main className="mx-auto max-w-2xl p-6">
      <Link href="/admin" className="text-sm underline">
        ← Back to products
      </Link>
      <h1 className="text-2xl font-bold my-4">Add product</h1>

      <form onSubmit={handleSubmit} className="space-y-4">
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
          <input
            type="file"
            accept="image/*"
            multiple
            onChange={(e) => setFiles(Array.from(e.target.files ?? []))}
          />
          {files.length > 0 && (
            <p className="text-sm mt-1">{files.length} photo(s) selected</p>
          )}
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
          {saving ? "Saving..." : "Save product"}
        </button>
      </form>
    </main>
  );
}