import Image from "next/image";
import Link from "next/link";

type Props = {
  product: {
    id: string;
    name: string;
    slug: string;
    price: number;
    condition: string;
    stock: number;
    images: string[] | null;
  };
};

export default function ProductCard({ product: p }: Props) {
  return (
    <Link
      href={`/products/${p.slug}`}
      className="rounded-xl border p-3 transition hover:shadow-md"
    >
      <div className="relative aspect-square overflow-hidden rounded-lg bg-gray-100">
        {p.images?.[0] ? (
          <Image
            src={p.images[0]}
            alt={p.name}
            fill
            sizes="(max-width: 768px) 50vw, 25vw"
            className="object-cover"
          />
        ) : (
          <div className="grid h-full place-items-center text-5xl">📱</div>
        )}
      </div>
      <h3 className="mt-3 font-semibold leading-tight">{p.name}</h3>
      <p className="mt-1 font-bold">
        ₦{p.price.toLocaleString("en-NG")}
        {p.condition === "used" && (
          <span className="ml-2 rounded bg-amber-300 px-1.5 py-0.5 text-xs">
            Used
          </span>
        )}
      </p>
      {p.stock === 0 && <p className="mt-1 text-xs opacity-60">Out of stock</p>}
    </Link>
  );
}