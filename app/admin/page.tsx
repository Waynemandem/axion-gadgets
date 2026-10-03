import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

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
      <h1 className="text-2xl font-bold mb-4">Admin: Products</h1>
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