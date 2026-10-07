import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import RowControls from "@/components/admin/RowControls";

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
        .select("id, name, slug, price, stock, published")
        .order("created_at", { ascending: false }),
      supabase
        .from("posts")
        .select("id, title, slug, published")
        .order("created_at", { ascending: false }),
    ]);

  if (error || postsError) {
    return <p className="p-6">Error: {(error ?? postsError)?.message}</p>;
  }

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
          <h1 className="text-3xl font-extrabold tracking-tight">Products</h1>
          <Link href="/admin/new" className="btn-blue">
            Add product
          </Link>
        </div>

        {products?.length === 0 && (
          <p className="text-[var(--muted)]">No products yet.</p>
        )}

        <ul className="space-y-3">
          {products?.map((p) => (
            <li key={p.id} className="soft-card p-4">
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <p className="truncate font-bold">{p.name}</p>
                  <p className="text-sm text-[var(--muted)]">
                    ₦{p.price.toLocaleString("en-NG")}
                  </p>
                </div>
                <div className="flex shrink-0 gap-3 text-sm font-semibold">
                  {p.published && (
                    <Link
                      href={`/products/${p.slug}`}
                      target="_blank"
                      className="underline"
                    >
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
            </li>
          ))}
        </ul>
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