import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import ProductCard from "@/components/ProductCard";
import SectionHeading from "@/components/SectionHeading";

const PAGE_SIZE = 24;

type SP = { q?: string; category?: string; page?: string };

function buildHref(p: { q?: string; category?: string; page?: number }) {
  const sp = new URLSearchParams();
  if (p.q) sp.set("q", p.q);
  if (p.category) sp.set("category", p.category);
  if (p.page && p.page > 1) sp.set("page", String(p.page));
  const qs = sp.toString();
  return qs ? `/products?${qs}` : "/products";
}

// 1 ... 4 5 6 ... 12
function pageList(current: number, total: number) {
  const pages = new Set([1, total, current - 1, current, current + 1]);
  const sorted = [...pages].filter((p) => p >= 1 && p <= total).sort((a, b) => a - b);
  const out: (number | "gap")[] = [];
  sorted.forEach((p, i) => {
    if (i > 0 && p - sorted[i - 1] > 1) out.push("gap");
    out.push(p);
  });
  return out;
}

export async function generateMetadata({
  searchParams,
}: {
  searchParams: Promise<SP>;
}): Promise<Metadata> {
  const { q, category, page } = await searchParams;
  const n = Math.max(1, parseInt(page ?? "1", 10) || 1);
  const base = category ? `${category} for sale in Nigeria` : "Phones, Laptops & Gadgets";

  return {
    title: n > 1 ? `${base} (Page ${n})` : base,
    description:
      "Browse original iPhones, Samsung phones, laptops and accessories in Nigeria, with a 7-day warranty.",
    alternates: { canonical: buildHref({ category, page: n }) },
    // Search result pages shouldn't be indexed by Google
    robots: q ? { index: false, follow: true } : undefined,
  };
}

export default async function Products({
  searchParams,
}: {
  searchParams: Promise<SP>;
}) {
  const sp = await searchParams;
  const term = sp.q?.replace(/[,()%]/g, " ").trim() || undefined;
  const category = sp.category?.trim() || undefined;
  const page = Math.max(1, parseInt(sp.page ?? "1", 10) || 1);

  const supabase = await createClient();

  const { data: catRows } = await supabase
    .from("products")
    .select("category")
    .eq("published", true);
  const categories = [
    ...new Set((catRows ?? []).map((r) => r.category).filter(Boolean)),
  ].sort() as string[];

  const from = (page - 1) * PAGE_SIZE;
  let query = supabase
    .from("products")
    .select("id, name, slug, price, condition, stock, images, created_at", {
      count: "exact",
    })
    .eq("published", true)
    .order("created_at", { ascending: false })
    .range(from, from + PAGE_SIZE - 1);

  if (category) query = query.eq("category", category);
  if (term) query = query.or(`name.ilike.%${term}%,brand.ilike.%${term}%`);

  const { data: products, count, error } = await query;

  // A page number past the end: send them back to the first page
  if (error && page > 1) redirect(buildHref({ q: term, category }));
  if (error) return <p className="p-6">Error: {error.message}</p>;

  const total = count ?? 0;
  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));
  if (page > totalPages) redirect(buildHref({ q: term, category, page: totalPages }));

  const pill = (active: boolean) =>
    `shrink-0 rounded-full px-4 py-2 text-sm font-bold ${
      active ? "bg-[var(--blue)] text-white" : "bg-white shadow-sm"
    }`;

  return (
    <main className="mx-auto max-w-6xl px-4 pb-8 pt-10">
      <SectionHeading
        eyebrow={term ? `Results for "${term}"` : category ?? "Shop"}
        title="All Products"
        pill={`${total} item${total === 1 ? "" : "s"}`}
      />

      {categories.length > 0 && (
        <div className="no-scrollbar -mx-4 mb-5 flex gap-2 overflow-x-auto px-4">
          <Link href={buildHref({ q: term })} className={pill(!category)}>
            All
          </Link>
          {categories.map((c) => (
            <Link
              key={c}
              href={buildHref({ q: term, category: c })}
              className={pill(category === c)}
            >
              {c}
            </Link>
          ))}
        </div>
      )}

      {term && (
        <p className="mb-4 text-sm">
          <Link href={buildHref({ category })} className="font-bold text-[var(--blue)] underline">
            Clear search
          </Link>
        </p>
      )}

      {products?.length === 0 ? (
        <div className="soft-card p-8 text-center">
          <p className="font-semibold">Nothing matches that.</p>
          <p className="mt-1 text-sm text-[var(--muted)]">
            Message us on WhatsApp and we will source it for you.
          </p>
          <Link href="/products" className="btn-blue mt-4">
            See all products
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-4">
          {products?.map((p) => (
            <ProductCard key={p.id} product={p} />
          ))}
        </div>
      )}

      {totalPages > 1 && (
        <nav
          aria-label="Pagination"
          className="mt-8 flex flex-wrap items-center justify-center gap-2"
        >
          {page > 1 && (
            <Link
              href={buildHref({ q: term, category, page: page - 1 })}
              className="btn-white !px-4 !py-2 text-sm"
            >
              ← Prev
            </Link>
          )}

          {pageList(page, totalPages).map((p, i) =>
            p === "gap" ? (
              <span key={`gap-${i}`} className="px-1 text-[var(--muted)]">
                …
              </span>
            ) : (
              <Link
                key={p}
                href={buildHref({ q: term, category, page: p })}
                aria-current={p === page ? "page" : undefined}
                className={`grid h-10 min-w-10 place-items-center rounded-full px-3 text-sm font-bold ${
                  p === page ? "bg-[var(--blue)] text-white" : "bg-white shadow-sm"
                }`}
              >
                {p}
              </Link>
            )
          )}

          {page < totalPages && (
            <Link
              href={buildHref({ q: term, category, page: page + 1 })}
              className="btn-white !px-4 !py-2 text-sm"
            >
              Next →
            </Link>
          )}
        </nav>
      )}
    </main>
  );
}