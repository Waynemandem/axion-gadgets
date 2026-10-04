import Link from "next/link";

export default function Footer() {
  const whatsapp = `https://wa.me/${process.env.NEXT_PUBLIC_WHATSAPP_NUMBER}`;

  return (
    <footer className="mx-auto mt-16 max-w-6xl px-4 pb-8">
      <div className="soft-card grid gap-8 p-6 text-sm md:grid-cols-3">
        <div>
          <p className="text-lg font-extrabold">Axion Gadgets</p>
          <p className="mt-2 text-[var(--muted)]">
            Original phones, laptops and accessories, delivered across Nigeria.
          </p>
          <a
            href={whatsapp}
            target="_blank"
            rel="noopener noreferrer"
            className="btn-blue mt-4 !py-2"
          >
            Chat on WhatsApp
          </a>
        </div>

        <div>
          <p className="eyebrow">Explore</p>
          <ul className="mt-3 space-y-2 font-semibold">
            <li>
              <Link href="/products">All gadgets</Link>
            </li>
            <li>
              <Link href="/blog">Buying guides</Link>
            </li>
          </ul>
        </div>

        <div>
          <p className="eyebrow">Our promise</p>
          <ul className="mt-3 space-y-2 text-[var(--muted)]">
            <li>🛡️ 7-day warranty on every device</li>
            <li>🚚 Delivery nationwide</li>
            <li>💳 Transfer, card or pay on delivery (Lagos)</li>
          </ul>
        </div>
      </div>

      <p className="mt-6 text-center text-xs text-[var(--muted)]">
        © {new Date().getFullYear()} Axion Gadgets · Lagos, Nigeria
      </p>
    </footer>
  );
}