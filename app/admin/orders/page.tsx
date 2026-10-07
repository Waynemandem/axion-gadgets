import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import OrderControls from "@/components/admin/OrderControls";

const GROUPS: Record<string, { label: string; statuses: string[] }> = {
  action: {
    label: "Needs action",
    statuses: ["paid", "sourcing", "ready_for_pickup", "out_for_delivery"],
  },
  done: { label: "Completed", statuses: ["completed"] },
  unpaid: { label: "Unpaid", statuses: ["pending", "failed"] },
  closed: { label: "Cancelled / refunded", statuses: ["cancelled", "refunded"] },
};

function whatsappLink(phone: string, reference: string) {
  let digits = phone.replace(/\D/g, "");
  if (digits.startsWith("0")) digits = `234${digits.slice(1)}`;
  const text = `Hello, this is Axion Gadgets about your order ${reference}.`;
  return `https://wa.me/${digits}?text=${encodeURIComponent(text)}`;
}

export default async function Orders({
  searchParams,
}: {
  searchParams: Promise<{ group?: string }>;
}) {
  const { group: g } = await searchParams;
  const group = g && GROUPS[g] ? g : "action";

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: orders, error } = await supabase
    .from("orders")
    .select("*, order_items(name, price, quantity)")
    .in("status", GROUPS[group].statuses)
    .order("created_at", { ascending: false })
    .limit(100);

  if (error) return <p className="p-6">Error: {error.message}</p>;

  return (
    <main className="mx-auto max-w-4xl px-4 py-8">
      <Link href="/admin" className="text-sm underline">
        ← Back to admin
      </Link>
      <h1 className="my-4 text-3xl font-extrabold tracking-tight">Orders</h1>

      <div className="no-scrollbar mb-5 flex gap-2 overflow-x-auto">
        {Object.entries(GROUPS).map(([key, value]) => (
          <Link
            key={key}
            href={`/admin/orders?group=${key}`}
            className={`shrink-0 rounded-full px-4 py-2 text-sm font-bold ${
              key === group
                ? "bg-[var(--blue)] text-white"
                : "bg-white shadow-sm"
            }`}
          >
            {value.label}
          </Link>
        ))}
      </div>

      {orders?.length === 0 && (
        <p className="text-[var(--muted)]">No orders here.</p>
      )}

      <ul className="space-y-4">
        {orders?.map((o) => (
          <li key={o.id} className="soft-card p-4">
            <div className="flex flex-wrap items-start justify-between gap-2">
              <div>
                <p className="font-extrabold">{o.reference}</p>
                <p className="text-xs text-[var(--muted)]">
                  {new Date(o.created_at).toLocaleString("en-NG", {
                    dateStyle: "medium",
                    timeStyle: "short",
                  })}
                </p>
              </div>
              <div className="text-right">
                <p className="text-lg font-extrabold text-[var(--blue)]">
                  ₦{o.total.toLocaleString("en-NG")}
                </p>
                <span className="pill-soft">
                  {o.fulfilment === "pickup" ? "Pickup, Ikeja" : "Delivery"}
                </span>
              </div>
            </div>

            <ul className="mt-3 space-y-1 text-sm">
              {o.order_items?.map(
                (
                  item: { name: string; price: number; quantity: number },
                  i: number
                ) => (
                  <li key={i} className="flex justify-between gap-3">
                    <span>
                      {item.quantity} × {item.name}
                    </span>
                    <span className="font-semibold">
                      ₦{(item.price * item.quantity).toLocaleString("en-NG")}
                    </span>
                  </li>
                )
              )}
              {o.delivery_fee > 0 && (
                <li className="flex justify-between text-[var(--muted)]">
                  <span>Delivery fee</span>
                  <span>₦{o.delivery_fee.toLocaleString("en-NG")}</span>
                </li>
              )}
            </ul>

            <div className="mt-3 rounded-2xl bg-[var(--blue-soft)] p-3 text-sm">
              <p className="font-bold">{o.customer_name}</p>
              <p>
                <a href={`tel:${o.phone}`} className="underline">
                  {o.phone}
                </a>
                {" · "}
                <a
                  href={whatsappLink(o.phone, o.reference)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="font-bold text-green-700 underline"
                >
                  WhatsApp
                </a>
              </p>
              <p className="text-[var(--muted)]">{o.email}</p>
              {o.fulfilment === "delivery" && (
                <p className="mt-1">
                  {o.address}, {o.city}, {o.state}
                </p>
              )}
              {o.notes && (
                <p className="mt-1 font-semibold text-red-600">{o.notes}</p>
              )}
            </div>

            <div className="mt-3">
              <OrderControls
                id={o.id}
                reference={o.reference}
                status={o.status}
              />
            </div>
          </li>
        ))}
      </ul>
    </main>
  );
}