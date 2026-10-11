import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import RowControls from "@/components/admin/RowControls";
import StatusShareButton from "@/components/admin/StatusShareButton";

type Product = {
  id: string;
  name: string;
  slug: string;
  price: number;
  stock: number;
  published: boolean;
  condition: string;
  images: string[] | null;
  sold_at: string | null;
};

function ProductRow({ p }: { p: Product }) {
  const sold = p.stock <= 0;

  return (
    <li className="soft-card p-4">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="truncate font-bold">{p.name}</p>
          <p className="text-sm text-[var(--muted)]">
            ₦{p.price.toLocaleString("en-NG")}
            {sold &&
              p.sold_at &&
              ` · Sold ${new Date(p.sold_at).toLocaleDateString("en-NG", {
                dateStyle: "medium",
              })}`}
          </p>
        </div>
        <div className="flex shrink-0 gap-3 text-sm font-semibold">
          {p.published && (
            <Link href={`/products/${p.slug}`} target="_blank" className="underline">
              View
            </Link>
          )}
          <Link
            href={`/admin/products/${p.id}/edit`}
            className="text-[var(--blue)] underline"
          >
            Edit
          </Link>
        </div>
      </div>

      <div className="mt-3">
        <RowControls
          table="products"
          id={p.id}
          published={p.published}
          stock={p.stock}
        />
      </div>

      {!sold && p.published && (
        <div className="mt-2">
          <StatusShareButton
            product={{
              name: p.name,
              slug: p.slug,
              price: p.price,
              condition: p.condition,
              image: p.images?.[0] ?? null,
            }}
          />
        </div>
      )}
    </li>
  );
}

export default async function Admin() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const [{ data: products, error }, { data: posts, error: postsError }] =
    await Promise.all([
      supabase
        .from("products")
        .select("id, name, slug, price, stock, published, condition, images, sold_at")
        .order("created_at", { ascending: false }),
      supabase
        .from("posts")
        .select("id, title, slug, published")
        .order("created_at", { ascending: false }),
    ]);

  if (error || postsError) {
    return <p className="p-6">Error: {(error ?? postsError)?.message}</p>;
  }

  const all = (products ?? []) as Product[];
  const available = all.filter((p) => p.stock > 0);
  const soldList = all
    .filter((p) => p.stock <= 0)
    .sort((a, b) => (b.sold_at ?? "").localeCompare(a.sold_at ?? ""));

  return (
    <main className="mx-auto max-w-4xl space-y-12 px-4 py-8">
      <Link
        href="/admin/orders"
        className="soft-card flex items-center justify-between p-4 font-extrabold"
      >
        <span>📦 Orders</span>
        <span className="text-[var(--blue)]">View →</span>
      </Link>

      <section>
        <div className="mb-4 flex items-center justify-between">
          <h1 className="text-3xl font-extrabold tracking-tight">
            Products
            <span className="ml-2 text-base font-semibold text-[var(--muted)]">
              {available.length} available
            </span>
          </h1>
          <Link href="/admin/new" className="btn-blue">
            Add product
          </Link>
        </div>

        {available.length === 0 && (
          <p className="text-[var(--muted)]">Nothing available right now.</p>
        )}

        <ul className="space-y-3">
          {available.map((p) => (
            <ProductRow key={p.id} p={p} />
          ))}
        </ul>
      </section>

      <section>
        <details>
          <summary className="cursor-pointer text-2xl font-extrabold tracking-tight">
            Sold history
            <span className="ml-2 text-base font-semibold text-[var(--muted)]">
              {soldList.length}
            </span>
          </summary>
          <p className="mb-3 mt-2 text-sm text-[var(--muted)]">
            To put a phone back in the shop, press + to restock it.
          </p>
          {soldList.length === 0 && (
            <p className="text-[var(--muted)]">Nothing sold yet.</p>
          )}
          <ul className="space-y-3">
            {soldList.map((p) => (
              <ProductRow key={p.id} p={p} />
            ))}
          </ul>
        </details>
      </section>

      <section>
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-3xl font-extrabold tracking-tight">Blog posts</h2>
          <Link href="/admin/posts/new" className="btn-white">
            Write post
          </Link>
        </div>

        {posts?.length === 0 && (
          <p className="text-[var(--muted)]">No posts yet.</p>
        )}

        <ul className="space-y-3">
          {posts?.map((post) => (
            <li key={post.id} className="soft-card p-4">
              <div className="flex items-start justify-between gap-3">
                <p className="min-w-0 font-bold">{post.title}</p>
                <div className="flex shrink-0 gap-3 text-sm font-semibold">
                  {post.published && (
                    <Link
                      href={`/blog/${post.slug}`}
                      target="_blank"
                      className="underline"
                    >
                      View
                    </Link>
                  )}
                  <Link
                    href={`/admin/posts/${post.id}/edit`}
                    className="text-[var(--blue)] underline"
                  >
                    Edit
                  </Link>
                </div>
              </div>
              <div className="mt-3">
                <RowControls
                  table="posts"
                  id={post.id}
                  published={post.published}
                />
              </div>
            </li>
          ))}
        </ul>
      </section>
    </main>
  );
}