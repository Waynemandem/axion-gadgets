import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import Link from "next/link";

export default async function Admin() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: products, error } = await supabase
    .from("products")
    .select("id, name, price, stock, published")
    .order("created_at", { ascending: false });

  if (error) return <p>Error: {error.message}</p>;

  return (
    <main className="mx-auto max-w-3xl p-6">
    <div className="flex items-center justify-between mb-4">
       <h1 className="text-2xl font-bold">Admin: Products</h1>
         <div className="flex gap-2">
      <Link
         href="/admin/new"
         className="rounded-lg bg-black text-white px-4 py-2 font-semibold"
       >
         Add product
      </Link>
      <Link
         href="/admin/posts/new"
         className="rounded-lg border px-4 py-2 font-semibold"
        >
         Write post
       </Link>
    </div>
    </div>
      <ul className="divide-y">
        {products?.map((p) => (
          <li key={p.id} className="py-3 flex justify-between">
            <span>
              {p.name} {!p.published && <em>(draft)</em>}
            </span>
            <span>
              ₦{p.price.toLocaleString("en-NG")} · stock {p.stock}
            </span>
          </li>
        ))}
      </ul>
    </main>
  );
}