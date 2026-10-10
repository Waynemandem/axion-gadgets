import Link from "next/link";

export default function Footer() {
  const whatsapp = `https://wa.me/${process.env.NEXT_PUBLIC_WHATSAPP_NUMBER}`;

  return (
    <footer className="mx-auto mt-10 max-w-6xl px-4 pb-6">
      <div className="soft-card flex flex-wrap items-center justify-between gap-x-6 gap-y-3 px-5 py-4 text-sm">
        <div>
          <p className="font-extrabold">Axion Gadgets</p>
          <p className="text-xs text-[var(--muted)]">
            🛡️ 7-day warranty · 💳 Pay securely online · 🚚 Delivery or pickup in Ikeja
          </p>
        </div>

        <nav className="flex items-center gap-4 font-semibold">
          <Link href="/products">Shop</Link>
          <Link href="/blog">Blog</Link>
          <a
            href={whatsapp}
            target="_blank"
            rel="noopener noreferrer"
            className="btn-blue !px-4 !py-1.5 text-sm"
          >
            WhatsApp
          </a>
        </nav>
   
       <Link href="/terms">Terms</Link>

      </div>

      <p className="mt-3 text-center text-xs text-[var(--muted)]">
        © {new Date().getFullYear()} Axion Gadgets · Lagos, Nigeria
      </p>
    </footer>
  );
}