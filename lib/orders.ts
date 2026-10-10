import { createAdminClient } from "@/lib/supabase/admin";
import { notifyOrder } from "@/lib/notify";

export type OrderSummary = {
  reference: string;
  total: number;
  fulfilment: "pickup" | "delivery";
  status: string;
};

export type VerifyResult =
  | { state: "paid"; order: OrderSummary }
  | { state: "pending"; order: OrderSummary }
  | { state: "failed"; order: OrderSummary }
  | { state: "closed"; order: OrderSummary }
  | { state: "not_found" };

const PAID_STATUSES = [
  "paid",
  "sourcing",
  "ready_for_pickup",
  "out_for_delivery",
  "completed",
];

export async function verifyOrder(reference: string): Promise<VerifyResult> {
  const supabase = createAdminClient();

  const { data: order } = await supabase
    .from("orders")
    .select("id, reference, total, fulfilment, status")
    .eq("reference", reference)
    .maybeSingle();

  if (!order) return { state: "not_found" };

  const summary: OrderSummary = {
    reference: order.reference,
    total: order.total,
    fulfilment: order.fulfilment,
    status: order.status,
  };

  // Already handled before: never process the same payment twice
  if (order.status !== "pending") {
    if (PAID_STATUSES.includes(order.status)) return { state: "paid", order: summary };
    if (order.status === "failed") return { state: "failed", order: summary };
    return { state: "closed", order: summary };
  }

  const res = await fetch(
    `https://api.paystack.co/transaction/verify/${encodeURIComponent(reference)}`,
    {
      headers: { Authorization: `Bearer ${process.env.PAYSTACK_SECRET_KEY}` },
      cache: "no-store",
    }
  );
  const json = await res.json().catch(() => null);

  if (!res.ok || !json?.status) return { state: "pending", order: summary };

  const tx = json.data;

  if (tx.status === "success") {
    // The amount paid must match the order exactly
    if (tx.amount !== order.total * 100 || tx.currency !== "NGN") {
      await supabase
        .from("orders")
        .update({
          notes: `Amount mismatch: paid ${tx.amount / 100} ${tx.currency}, expected ${order.total} NGN`,
        })
        .eq("id", order.id);
      return { state: "pending", order: summary };
    }

    // Only one caller can move the order from pending to paid
    const { data: claimed } = await supabase
      .from("orders")
      .update({ status: "paid", paid_at: new Date().toISOString() })
      .eq("id", order.id)
      .eq("status", "pending")
      .select("id");

    if (claimed && claimed.length > 0) {
      const { data: items } = await supabase
        .from("order_items")
        .select("product_id, quantity")
        .eq("order_id", order.id);

      for (const item of items ?? []) {
        if (item.product_id) {
          await supabase.rpc("decrement_stock", {
            p_id: item.product_id,
            p_qty: item.quantity,
          });
        }
      }
      await notifyOrder(order.id, "paid");
    }

    return { state: "paid", order: { ...summary, status: "paid" } };
  }

  if (tx.status === "failed") {
    await supabase
      .from("orders")
      .update({ status: "failed" })
      .eq("id", order.id)
      .eq("status", "pending");
    return { state: "failed", order: { ...summary, status: "failed" } };
  }

  return { state: "pending", order: summary };
}