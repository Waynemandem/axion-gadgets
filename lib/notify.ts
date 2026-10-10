import { createAdminClient } from "@/lib/supabase/admin";

const esc = (s: string) =>
  s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");

function intlPhone(phone: string) {
  let d = phone.replace(/\D/g, "");
  if (d.startsWith("0")) d = `234${d.slice(1)}`;
  return d;
}

async function sendTelegram(text: string) {
  const token = process.env.TELEGRAM_BOT_TOKEN;
  const chatId = process.env.TELEGRAM_CHAT_ID;
  if (!token || !chatId) return;

  try {
    await fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        chat_id: chatId,
        text,
        parse_mode: "HTML",
        disable_web_page_preview: true,
      }),
    });
  } catch (e) {
    console.error("Telegram alert failed:", e);
  }
}

export async function notifyOrder(orderId: string, kind: "started" | "paid") {
  try {
    const supabase = createAdminClient();
    const { data: o } = await supabase
      .from("orders")
      .select("*, order_items(name, price, quantity)")
      .eq("id", orderId)
      .maybeSingle();
    if (!o) return;

    const site = (process.env.NEXT_PUBLIC_SITE_URL ?? "").replace(/\/+$/, "");
    const items = (o.order_items ?? [])
      .map(
        (i: { name: string; price: number; quantity: number }) =>
          `• ${i.quantity} × ${esc(i.name)} (₦${(i.price * i.quantity).toLocaleString("en-NG")})`
      )
      .join("\n");

    const lines = [
      kind === "paid"
        ? `✅ <b>PAID: new order</b>`
        : `🛒 <b>Checkout started (not paid yet)</b>`,
      `<b>${esc(o.reference)}</b>`,
      `Total: <b>₦${o.total.toLocaleString("en-NG")}</b> · ${
        o.fulfilment === "pickup" ? "Pickup in Ikeja" : "Delivery"
      }`,
      "",
      items,
      "",
      `Customer: ${esc(o.customer_name)}`,
      `Phone: ${esc(o.phone)}`,
      `WhatsApp: https://wa.me/${intlPhone(o.phone)}`,
    ];

    if (o.fulfilment === "delivery") {
      lines.push(`Address: ${esc(`${o.address}, ${o.city}, ${o.state}`)}`);
    }
    if (site) lines.push("", `Orders: ${site}/admin/orders`);

    await sendTelegram(lines.join("\n"));
  } catch (e) {
    console.error("notifyOrder failed:", e);
  }
}