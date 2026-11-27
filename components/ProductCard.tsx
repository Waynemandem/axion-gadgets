import Image from "next/image";
import Link from "next/link";

type Product = {
  id: string;
  name: string;
  slug: string;
  price: number;
  condition: string;
  stock: number;
  images: string[] | null;
  created_at: string;
};

const DAY = 24 * 60 * 60 * 1000;

function badgeFor(p: Product) {
  if (p.stock <= 0) return "SOLD";
  if (p.condition === "used") return "USED";
  if (Date.now() - new Date(p.created_at).getTime() < 14 * DAY) return "NEW";
  return null;
}

export default function ProductCard({
  product: p,
  className = "",
  priority = false,
}: {
  product: Product;
  className?: string;
  priority?: boolean;
}) {
    const badge = badgeFor(p);

  return (
    <Link
      href={`/products/${p.slug}`}
      className={`soft-card block overflow-hidden transition active:scale-[0.98] hover:-translate-y-0.5 ${className}`}
    >
      <div className="relative aspect-square bg-[var(--blue-soft)]">
        {p.images?.[0] ? (
          <Image
          src={p.images[0]}
          alt={`${p.name} - ${p.condition === "used" ? "used" : "new"} gadget at Axion Gadgets`}
          fill
          priority={priority}
          loading={priority ? "eager" : "lazy"}
          sizes="(max-width: 640px) 46vw, (max-width: 1024px) 30vw, 280px"
          className={`object-cover ${
            p.stock <= 0 ? "grayscale opacity-70" : ""
          }`}
         />        ) : (
          <div className="grid h-full place-items-center text-6xl">📱</div>
        )}
        {badge && (
          <span
            className={`absolute left-3 top-3 rounded-full px-3 py-1 text-[0.7rem] font-extrabold tracking-wide text-white ${
              badge === "SOLD" ? "bg-slate-500" : "bg-[var(--orange)]"
            }`}
          >
            {badge}
          </span>
        )}
      </div>

      <div className="p-4">
        <h3 className="line-clamp-2 min-h-[2.6rem] font-bold leading-snug">
          {p.name}
        </h3>
        <p className="mt-2 text-lg font-extrabold text-[var(--blue)]">
          ₦{p.price.toLocaleString("en-NG")}
        </p>
      </div>
    </Link>
  );
}