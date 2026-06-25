import type { Metadata } from "next";
import { ChevronDown } from "lucide-react";

export const metadata: Metadata = { title: "FAQs — Corner Shop" };

const FAQS = [
  {
    section: "Orders & Delivery",
    items: [
      {
        q: "How do I place an order?",
        a: "Browse our products, add items to your cart, then proceed to checkout. You can pay via M-Pesa or Cash on Delivery.",
      },
      {
        q: "What areas do you deliver to?",
        a: "We currently deliver within Nairobi and its surroundings. Enter your address at checkout to confirm coverage.",
      },
      {
        q: "How long does delivery take?",
        a: "Standard delivery takes 2–4 hours within Nairobi. Same-day delivery is available for orders placed before 2 PM.",
      },
      {
        q: "Is there a minimum order amount?",
        a: "There is no minimum order. Delivery is free for orders above KES 1,000.",
      },
      {
        q: "How do I track my order?",
        a: "Once your order is confirmed you will receive an update from our team. You can also view your order status on your account page.",
      },
    ],
  },
  {
    section: "Payments",
    items: [
      {
        q: "What payment methods do you accept?",
        a: "We accept M-Pesa (STK Push) and Cash on Delivery.",
      },
      {
        q: "Is my payment secure?",
        a: "Yes. M-Pesa payments are processed securely via Safaricom's Daraja API. We never store your payment credentials.",
      },
      {
        q: "What happens if my M-Pesa payment fails?",
        a: "If the STK push times out or is declined, your order will not be placed. Please retry or choose Cash on Delivery instead.",
      },
    ],
  },
  {
    section: "Products",
    items: [
      {
        q: "Are your products fresh?",
        a: "Yes. We source directly from local farms and suppliers. Products are restocked daily to ensure freshness.",
      },
      {
        q: "What does the unit label mean (e.g. per kg, per liter)?",
        a: "The unit label tells you exactly what quantity the listed price applies to, so you always know what you're paying for.",
      },
      {
        q: "A product I want is out of stock. What should I do?",
        a: "Subscribe to our newsletter and we'll notify you when popular items are restocked. You can also contact us directly.",
      },
    ],
  },
  {
    section: "Returns & Refunds",
    items: [
      {
        q: "Can I return a product?",
        a: "If an item arrives damaged, spoiled, or incorrect, contact us within 24 hours of delivery and we will arrange a replacement or refund.",
      },
      {
        q: "How long do refunds take?",
        a: "M-Pesa refunds are processed within 1–3 business days. Cash refunds are handled at the time of the replacement delivery.",
      },
    ],
  },
];

export default function FAQsPage() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-16 md:px-8">
      <div className="mb-12 text-center">
        <h1 className="text-4xl font-extrabold tracking-tight text-foreground">
          Frequently Asked Questions
        </h1>
        <p className="mt-3 text-muted-foreground">
          Can't find an answer?{" "}
          <a href="/contact" className="text-primary underline underline-offset-4">
            Contact us
          </a>
          .
        </p>
      </div>

      <div className="space-y-12">
        {FAQS.map(({ section, items }) => (
          <div key={section}>
            <h2 className="mb-4 text-xs font-bold uppercase tracking-widest text-primary">
              {section}
            </h2>
            <div className="divide-y divide-border rounded-2xl border border-border">
              {items.map(({ q, a }) => (
                <details key={q} className="group px-6 py-4">
                  <summary className="flex cursor-pointer items-center justify-between gap-4 font-semibold text-foreground marker:content-none">
                    {q}
                    <ChevronDown className="h-4 w-4 shrink-0 text-muted-foreground transition-transform group-open:rotate-180" />
                  </summary>
                  <p className="mt-3 text-sm leading-7 text-muted-foreground">{a}</p>
                </details>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
