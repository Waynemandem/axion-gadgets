import Link from "next/link";

export default function Footer() {
  return (
    <footer className="mt-16 border-t">
      <div className="mx-auto grid max-w-6xl gap-8 px-6 py-10 text-sm md:grid-cols-3">
        <div>
          <p className="text-lg font-extrabold">Axion Gadgets</p>
          <p className="mt-2 opacity-70">
            Original phones, laptops and accessories, delivered across Nigeria.
          </p>
        </div>
        <div>
          <p className="font-semibold">Shop</p>
          <ul className="mt-2 space-y-1 opacity-80">
            <li><Link href="/products">All gadgets</Link></li>
            <li><Link href="/blog">Buying guides</Link></li>
          </ul>
        </div>
        <div>
          <p className="font-semibold">Our promise</p>
          <ul className="mt-2 space-y-1 opacity-80">
            <li>7-day warranty on every device</li>
            <li>Delivery nationwide</li>
            <li>Pay by transfer, card or on delivery (Lagos)</li>
          </ul>
        </div>
      </div>
      <p className="border-t py-4 text-center text-xs opacity-60">
        © {new Date().getFullYear()} Axion Gadgets · Lagos, Nigeria
      </p>
    </footer>
  );
}