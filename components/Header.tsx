import Link from "next/link";

const links = [
  { href: "/products", label: "Shop" },
  { href: "/blog", label: "Blog" },
];

export default function Header() {
  const whatsapp = `https://wa.me/${process.env.NEXT_PUBLIC_WHATSAPP_NUMBER}`;

  return (
    <header className="sticky top-0 z-10 border-b bg-white/90 backdrop-blur">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-6">
        <Link href="/" className="text-xl font-extrabold tracking-tight">
          Axion Gadgets
        </Link>

        <nav className="flex items-center gap-5 text-sm font-medium">
          {links.map((l) => (
            <Link key={l.href} href={l.href} className="hover:underline">
              {l.label}
            </Link>
          ))}
          <a
            href={whatsapp}
            target="_blank"
            rel="noopener noreferrer"
            className="rounded-lg bg-green-600 px-4 py-2 font-semibold text-white"
          >
            WhatsApp
          </a>
        </nav>
      </div>
    </header>
  );
}