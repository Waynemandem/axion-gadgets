"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useCart } from "@/lib/cart";

export default function Header() {
  const router = useRouter();
  const [searchOpen, setSearchOpen] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [q, setQ] = useState("");
  const { count } = useCart();
  const whatsapp = `https://wa.me/${process.env.NEXT_PUBLIC_WHATSAPP_NUMBER}`;

  function submit(e: React.FormEvent) {
    e.preventDefault();
    setSearchOpen(false);
    router.push(
      q.trim() ? `/products?q=${encodeURIComponent(q.trim())}` : "/products"
    );
  }

  const iconBtn =
    "grid h-10 w-10 place-items-center rounded-full bg-[var(--blue-soft)] text-[var(--blue)]";

  return (
    <header className="sticky top-3 z-20 mx-auto max-w-6xl px-4 pt-3">
      <div className="flex items-center justify-between rounded-3xl bg-white/90 px-5 py-3 shadow-[0_10px_30px_rgba(22,60,120,0.08)] backdrop-blur">
        <Link href="/" className="text-lg font-extrabold tracking-tight">
          Axion Gadgets
        </Link>

        <div className="flex gap-2">
          <Link href="/cart" aria-label="Cart" className={`${iconBtn} relative`}>
             <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
             <path d="M6 6h15l-1.5 9h-12z" />
             <path d="M6 6 5 3H2" />
             <circle cx="9" cy="20" r="1.2" />
             <circle x="18" cy="20" r="1.2" />
             </svg>
               {count > 0 && (
                 <span className="absolute -right-1 -top-1 grid h-5 min-w-5 place-items-center rounded-full bg-[var(--orange)] px-1 text-[0.65rem] font-extrabold text-white">
                   {count}
                 </span> 
               )}
          </Link>
          <button
            aria-label="Search"
            className={iconBtn}
            onClick={() => {
              setSearchOpen(!searchOpen);
              setMenuOpen(false);
            }}
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round">
              <circle cx="11" cy="11" r="7" />
              <path d="m20 20-3.5-3.5" />
            </svg>
          </button>
          <button
            aria-label="Menu"
            className={iconBtn}
            onClick={() => {
              setMenuOpen(!menuOpen);
              setSearchOpen(false);
            }}
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round">
              <path d="M4 7h16M4 12h16M4 17h16" />
            </svg>
          </button>
        </div>
      </div>

      {searchOpen && (
        <form
          onSubmit={submit}
          className="mt-2 flex gap-2 rounded-3xl bg-white p-2 shadow-[0_10px_30px_rgba(22,60,120,0.1)]"
        >
          <input
            autoFocus
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Search iPhone, MacBook, Samsung..."
            className="min-w-0 flex-1 rounded-full bg-transparent px-4 py-2 outline-none"
          />
          <button className="btn-blue">Search</button>
        </form>
      )}

      {menuOpen && (
        <nav className="mt-2 grid gap-1 rounded-3xl bg-white p-3 font-semibold shadow-[0_10px_30px_rgba(22,60,120,0.1)]">
          {[
            ["/", "Home"],
            ["/products", "Shop"],
            ["/blog", "Blog"],
          ].map(([href, label]) => (
            <Link
              key={href}
              href={href}
              onClick={() => setMenuOpen(false)}
              className="rounded-2xl px-4 py-3 hover:bg-[var(--blue-soft)]"
            >
              {label}
            </Link>
          ))}
          <a
            href={whatsapp}
            target="_blank"
            rel="noopener noreferrer"
            className="btn-blue mt-1"
          >
            Chat on WhatsApp
          </a>
        </nav>
      )}
    </header>
  );
}