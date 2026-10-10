import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { deliveryFee } from "@/lib/delivery";
import { notifyOrder } from "@/lib/notify";

type Body = {
  items?: { id: number | string; quantity: number }[];
  fulfilment?: "pickup" | "delivery";
  name?: string;
  phone?: string;
  email?: string;
  address?: string;
  city?: string;
  state?: string;
};

const fail = (error: string, status = 400) =>
  NextResponse.json({ error }, { status });

export async function POST(req: Request) {
  let body: Body;
  try {
    body = await req.json();
  } catch {
    return fail("Invalid request.");
  }

  const name = body.name?.trim() ?? "";
  const phone = body.phone?.trim() ?? "";
  const email = body.email?.trim() ?? "";
  const fulfilment = body.fulfilment;
  const address = body.address?.trim() ?? "";
  const city = body.city?.trim() ?? "";
  const state = body.state?.trim() ?? "";

  if (name.length < 2) return fail("Please enter your full name.");
  if (phone.replace(/\D/g, "").length < 10)
    return fail("Please enter a valid phone number.");
  if (!/^\S+@\S+\.\S+$/.test(email)) return fail("Please enter a valid email.");
  if (fulfilment !== "pickup" && fulfilment !== "delivery")
    return fail("Choose pickup or delivery.");
  if (fulfilment === "delivery" && (!address || !city || !state))
    return fail("Please fill in your full delivery address.");

  const items = body.items;
  if (!Array.isArray(items) || items.length === 0 || items.length > 20)
    return fail("Your cart is empty.");

  const qtyById = new Map<number, number>();
  for (const it of items) {
    const id = Number(it.id);
    const qty = Number(it.quantity);
    if (!Number.isInteger(id) || !Number.isInteger(qty) || qty < 1 || qty > 10)
      return fail("Invalid cart.");
    qtyById.set(id, (qtyById.get(id) ?? 0) + qty);
  }

  const supabase = createAdminClient();

  // Real prices and availability come from the database, never the browser
  const { data: products, error: productsError } = await supabase
    .from("products")
    .select("id, name, price, stock")
    .in("id", [...qtyById.keys()])
    .eq("published", true);

  if (productsError) return fail("Could not load your cart. Try again.", 500);

  let subtotal = 0;
  const lines: { product_id: number; name: string; price: number; quantity: number }[] = [];

  for (const [id, qty] of qtyById) {
    const p = products?.find((x) => Number(x.id) === id);
    if (!p) return fail("An item in your cart is no longer available.", 409);
    if (p.stock < qty)
      return fail(`Sorry, only ${p.stock} of "${p.name}" available.`, 409);
    subtotal += p.price * qty;
    lines.push({ product_id: id, name: p.name, price: p.price, quantity: qty });
  }

  let fee = 0;
if (fulfilment === "delivery") {
  const zoneFee = deliveryFee(state);
  if (zoneFee === null) {
    return fail(
      "Sorry, we don't deliver to that area yet. Choose pickup or message us on WhatsApp."
    );
  }
  fee = zoneFee;
}
  const total = subtotal + fee;
  const reference = `AXG-${Date.now().toString(36).toUpperCase()}-${crypto
    .randomUUID()
    .slice(0, 6)
    .toUpperCase()}`;

  const { data: order, error: orderError } = await supabase
    .from("orders")
    .insert({
      reference,
      fulfilment,
      customer_name: name,
      phone,
      email,
      address: fulfilment === "delivery" ? address : null,
      city: fulfilment === "delivery" ? city : null,
      state: fulfilment === "delivery" ? state : null,
      subtotal,
      delivery_fee: fee,
      total,
      status: "pending",
    })
    .select("id")
    .single();

  if (orderError || !order) return fail("Could not create your order.", 500);

  const { error: itemsError } = await supabase
    .from("order_items")
    .insert(lines.map((l) => ({ ...l, order_id: order.id })));

  if (itemsError) {
    await supabase.from("orders").delete().eq("id", order.id);
    return fail("Could not create your order.", 500);
  }

  const site = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";
  const res = await fetch("https://api.paystack.co/transaction/initialize", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${process.env.PAYSTACK_SECRET_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      email,
      amount: total * 100, // Paystack uses kobo
      currency: "NGN",
      reference,
      callback_url: `${site}/checkout/verify`,
      metadata: { order_reference: reference, customer_name: name },
    }),
  });

  const json = await res.json().catch(() => null);

  if (!res.ok || !json?.status) {
    await supabase.from("orders").update({ status: "failed" }).eq("id", order.id);
    return fail("Could not start the payment. Please try again.", 502);
  }

  await notifyOrder(order.id, "started");
  return NextResponse.json({ url: json.data.authorization_url });
}