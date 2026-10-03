import { createClient } from "@/lib/supabase/server";

export default async function Products() {
  const supabase = await createClient();
  const { data: products, error } = await supabase
    .from("products")
    .select("id, name, price");

  if (error) {
    return <p>Error: {error.message}</p>;
  }

  return (
    <div>
      <h1>Products</h1>
      <ul>
        {products?.map((p) => (
          <li key={p.id}>
            {p.name} — ₦{p.price.toLocaleString("en-NG")}
          </li>
        ))}
      </ul>
    </div>
  );
}