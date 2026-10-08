import Link from "next/link";

export default function NotFound() {
  return (
    <main className="mx-auto max-w-xl px-4 py-16">
      <div className="soft-card p-8 text-center">
        <p className="text-5xl">🔍</p>
        <p className="eyebrow mt-3">Page not found</p>
        <h1 className="mt-1 text-3xl font-extrabold tracking-tight">
          We couldn&apos;t find that
        </h1>
        <p className="mt-3 text-[var(--muted)]">
          The product may be sold out or removed, or the link has changed.
          Browse what&apos;s available now.
        </p>
        <div className="mt-6 flex flex-wrap justify-center gap-3">
          <Link href="/products" className="btn-blue">
            Shop gadgets
          </Link>
          <Link href="/" className="btn-white">
            Home
          </Link>
        </div>
      </div>
    </main>
  );
}