"use client";

import Link from "next/link";
import { Leaf, Mail, MapPin, Phone } from "lucide-react";
import NewsletterForm from "@/components/NewsletterForm";

const currentYear = new Date().getFullYear();

const FOOTER_LINKS = [
  {
    heading: "Shop",
    links: [
      { label: "All Products", href: "/products" },
      { label: "Fresh Produce", href: "/products?category=Produce" },
      { label: "Dairy", href: "/products?category=Dairy" },
      { label: "Bakery & Deli", href: "/products?category=Bakery+%26+Deli" },
      { label: "Organic Meat", href: "/products?category=Organic+Meat" },
    ],
  },
  {
    heading: "Customer Service",
    links: [
      { label: "Track My Order", href: "/order-success" },
      { label: "FAQs", href: "/faqs" },
      { label: "Delivery Information", href: "/delivery" },
      { label: "Returns & Refunds", href: "/returns" },
      { label: "Contact Us", href: "/contact" },
    ],
  },
  {
    heading: "Company",
    links: [
      { label: "About Us", href: "/about" },
      { label: "Careers", href: "/contact" },
      { label: "Privacy Policy", href: "/privacy" },
      { label: "Terms & Conditions", href: "/terms" },
    ],
  },
];

const SOCIAL = [
  {
    label: "Facebook",
    href: "#",
    svg: (
      <svg viewBox="0 0 24 24" fill="currentColor" className="h-4 w-4">
        <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z" />
      </svg>
    ),
  },
  {
    label: "Instagram",
    href: "#",
    svg: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-4 w-4">
        <rect width="20" height="20" x="2" y="2" rx="5" ry="5" />
        <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
        <line x1="17.5" x2="17.51" y1="6.5" y2="6.5" />
      </svg>
    ),
  },
  {
    label: "X / Twitter",
    href: "#",
    svg: (
      <svg viewBox="0 0 24 24" fill="currentColor" className="h-4 w-4">
        <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
      </svg>
    ),
  },
];

export default function Footer() {
  return (
    <footer className="mt-12 bg-stone-900 text-stone-300">

      {/* Main grid */}
      <div className="mx-auto max-w-7xl px-6 py-16 md:px-8">
        <div className="grid gap-12 md:grid-cols-2 lg:grid-cols-5">

          {/* Brand + contact — takes 2 columns */}
          <div className="space-y-6 lg:col-span-2">
            <Link href="/" className="flex items-center gap-2 text-2xl font-extrabold text-white">
              <Leaf className="h-6 w-6 text-primary" />
              Corner Shop
            </Link>
            <p className="max-w-xs text-sm leading-relaxed text-stone-400">
              Your neighbourhood grocery store online. Fresh produce, quality
              products, and fast delivery — straight to your door.
            </p>

            {/* Contact info */}
            <ul className="space-y-3 text-sm">
              <li className="flex items-center gap-2">
                <MapPin className="h-4 w-4 shrink-0 text-primary" />
                <span>Nairobi, Kenya</span>
              </li>
              <li className="flex items-center gap-2">
                <Phone className="h-4 w-4 shrink-0 text-primary" />
                <a href="tel:+254700000000" className="hover:text-white transition-colors">
                  +254 700 000 000
                </a>
              </li>
              <li className="flex items-center gap-2">
                <Mail className="h-4 w-4 shrink-0 text-primary" />
                <a href="mailto:support@cornershop.co.ke" className="hover:text-white transition-colors">
                  support@cornershop.co.ke
                </a>
              </li>
            </ul>

            {/* Social icons */}
            <div className="flex gap-3">
              {SOCIAL.map(({ svg, label, href }) => (
                <a
                  key={label}
                  href={href}
                  aria-label={label}
                  className="flex h-9 w-9 items-center justify-center rounded-full bg-stone-800 text-stone-400 transition hover:bg-primary hover:text-white"
                >
                  {svg}
                </a>
              ))}
            </div>
          </div>

          {/* Link columns */}
          {FOOTER_LINKS.map(({ heading, links }) => (
            <div key={heading} className="space-y-5">
              <h4 className="text-xs font-bold uppercase tracking-widest text-white">
                {heading}
              </h4>
              <ul className="space-y-3 text-sm">
                {links.map(({ label, href }) => (
                  <li key={label}>
                    <Link
                      href={href}
                      className="text-stone-400 transition-colors hover:text-white"
                    >
                      {label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Newsletter */}
        <div className="mt-12 rounded-2xl bg-stone-800 px-6 py-8 md:flex md:items-center md:justify-between md:gap-8">
          <div className="mb-4 md:mb-0">
            <p className="font-semibold text-white">Get deals in your inbox</p>
            <p className="mt-1 text-sm text-stone-400">
              Weekly offers, new arrivals and seasonal picks.
            </p>
          </div>
          <NewsletterForm variant="dark" placeholder="Email address" buttonLabel="Subscribe" />
        </div>
      </div>

      {/* Bottom bar */}
      <div className="border-t border-stone-800 px-6 py-5 md:px-8">
        <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-3 text-xs text-stone-500 sm:flex-row">
          <span>© {currentYear} Corner Shop. All rights reserved.</span>
          <div className="flex gap-4">
            <Link href="/privacy" className="hover:text-stone-300 transition-colors">Privacy Policy</Link>
            <Link href="/terms" className="hover:text-stone-300 transition-colors">Terms of Service</Link>
            <Link href="/cookies" className="hover:text-stone-300 transition-colors">Cookie Policy</Link>
          </div>
        </div>
      </div>

    </footer>
  );
}
