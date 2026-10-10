import type { Metadata } from "next";
import Link from "next/link";
import { DELIVERY_ZONES } from "@/lib/delivery";
import { POLICY } from "@/lib/policy";

export const metadata: Metadata = {
  title: "Terms, Refunds & Warranty",
  description:
    "How ordering, delivery, refunds and the 7-day warranty work at Axion Gadgets.",
  alternates: { canonical: "/terms" },
};

function Section({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section className="soft-card p-5">
      <h2 className="text-xl font-extrabold">{title}</h2>
      <div className="mt-2 space-y-2 text-[var(--muted)]">{children}</div>
    </section>
  );
}

const list = "list-disc space-y-1 pl-5";

export default function Terms() {
  const whatsapp = `https://wa.me/${process.env.NEXT_PUBLIC_WHATSAPP_NUMBER}`;

  return (
    <main className="mx-auto max-w-3xl space-y-4 px-4 pb-8 pt-10">
      <div>
        <p className="eyebrow">Axion Gadgets</p>
        <h1 className="mt-1 text-3xl font-extrabold tracking-tight md:text-5xl">
          Terms, Refunds & Warranty
        </h1>
        <p className="mt-2 text-sm text-[var(--muted)]">
          Last updated: October 2026
        </p>
      </div>

      <Section title="How ordering works">
        <p>
          You pay in full online through Paystack (card, bank transfer or
          USSD). We never see your card details.
        </p>
        <p>
          Many of our devices are sourced to order. After you pay, we confirm
          your exact device, prepare it, and message you on WhatsApp.
        </p>
      </Section>

      <Section title="Availability and refunds">
        <p>
          We confirm availability within {POLICY.sourcingHours} hours of your
          payment.
        </p>
        <p>
          If we can&apos;t supply your exact device, you can choose a similar
          one or a <strong>full refund</strong>, including any delivery fee you
          paid.
        </p>
        <p>
          Refunds go back to the original payment method. We start the refund
          within {POLICY.refundStartHours} hours of the request. Your bank may
          take up to {POLICY.bankRefundDays} business days to show it.
        </p>
      </Section>

      <Section title="Cancelling an order">
        <ul className={list}>
          <li>
            Cancel before we have bought your device for you: full refund.
          </li>
          <li>
            Once we have bought it for you, the order can&apos;t be cancelled,
            because we have already paid for it. We&apos;ll tell you when that
            happens.
          </li>
        </ul>
      </Section>

      <Section title="Pickup in Ikeja">
        <p>
          Pickup is free. We&apos;ll send you the exact meeting spot on
          WhatsApp once your device is confirmed. Bring your order reference.
        </p>
        <p>
          Please check your device before you leave: power it on, test the
          screen, camera, speakers and charging. Report any problem on the
          spot.
        </p>
      </Section>

      <Section title="Delivery">
        <p>We currently deliver to:</p>
        <ul className={list}>
          {DELIVERY_ZONES.map((z) => (
            <li key={z.state}>
              {z.label}: ₦{z.fee.toLocaleString("en-NG")}
            </li>
          ))}
        </ul>
        <p>
          The delivery fee is paid at checkout with your order. Outside these
          areas, choose pickup or{" "}
          <a href={whatsapp} className="font-bold text-[var(--blue)] underline">
            message us on WhatsApp
          </a>{" "}
          and we&apos;ll see what we can arrange.
        </p>
        <p>
          We confirm your delivery time on WhatsApp once your device is
          ready. Someone must be available to receive it. Please check the
          device on delivery.
        </p>
      </Section>

      <Section title={`${POLICY.warrantyDays}-day warranty`}>
        <p>
          If your device arrives faulty, or develops a fault within{" "}
          {POLICY.warrantyDays} days of pickup or delivery, we replace it with
          the same model, or refund you if we can&apos;t.
        </p>
        <p className="font-bold text-[var(--ink)]">Covered</p>
        <ul className={list}>
          <li>Device that is dead on arrival or will not power on</li>
          <li>Screen, touch or display faults not caused by impact</li>
          <li>Battery that will not charge, or drains abnormally fast</li>
          <li>Faulty charging port, speaker, microphone or camera</li>
          <li>Wi-Fi, Bluetooth or network faults not caused by software changes</li>
        </ul>
        <p className="font-bold text-[var(--ink)]">Not covered</p>
        <ul className={list}>
          <li>Cracked screens, dents or other physical damage</li>
          <li>Liquid damage</li>
          <li>Repairs or opening by anyone other than Axion Gadgets</li>
          <li>Locks or passwords set after delivery, such as iCloud or Google account locks</li>
          <li>Normal wear and tear</li>
        </ul>
        <p>
          To claim, message us on WhatsApp within {POLICY.warrantyDays} days
          with your order reference and a short video showing the fault. We may
          ask you to bring the device in for checking.
        </p>
      </Section>

      <Section title="Device condition">
        <p>
          Used devices are described as accurately as we can, including battery
          health where known. Photos show the actual condition. If something
          doesn&apos;t match its description, tell us straight away.
        </p>
      </Section>

      <Section title="Your information">
        <p>
          We collect your name, phone number, email and delivery address only
          to process and deliver your order and contact you about it. We
          don&apos;t sell your information. Payments are handled by Paystack.
        </p>
      </Section>

      <Section title="Contact">
        <p>
          Questions about an order? Message us on{" "}
          <a
            href={whatsapp}
            target="_blank"
            rel="noopener noreferrer"
            className="font-bold text-[var(--blue)] underline"
          >
            WhatsApp
          </a>{" "}
          with your order reference. Or go back to the{" "}
          <Link href="/products" className="font-bold text-[var(--blue)] underline">
            shop
          </Link>
          .
        </p>
      </Section>
    </main>
  );
}