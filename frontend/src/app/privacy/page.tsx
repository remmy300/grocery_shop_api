import type { Metadata } from "next";

export const metadata: Metadata = { title: "Privacy Policy — Corner Shop" };

export default function PrivacyPage() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-16 md:px-8">
      <h1 className="mb-2 text-4xl font-extrabold tracking-tight text-foreground">Privacy Policy</h1>
      <p className="mb-10 text-sm text-muted-foreground">Last updated: June 2026</p>

      <div className="prose prose-stone max-w-none space-y-8 text-sm leading-7 text-muted-foreground">

        <section>
          <h2 className="mb-3 text-xl font-bold text-foreground">1. Information We Collect</h2>
          <p>When you use Corner Shop we may collect the following:</p>
          <ul className="mt-3 list-disc space-y-1 pl-5">
            <li><strong className="text-foreground">Account information:</strong> name, email address, and password when you register.</li>
            <li><strong className="text-foreground">Order information:</strong> delivery address, phone number, and payment method.</li>
            <li><strong className="text-foreground">Usage data:</strong> pages visited, products viewed, and cart activity.</li>
            <li><strong className="text-foreground">Device data:</strong> IP address, browser type, and operating system.</li>
          </ul>
        </section>

        <section>
          <h2 className="mb-3 text-xl font-bold text-foreground">2. How We Use Your Information</h2>
          <ul className="list-disc space-y-1 pl-5">
            <li>To process and deliver your orders.</li>
            <li>To send order confirmations and delivery updates.</li>
            <li>To improve our website, product listings, and delivery routes.</li>
            <li>To send promotional emails if you have opted in (you may unsubscribe at any time).</li>
            <li>To detect fraud and ensure the security of your account.</li>
          </ul>
        </section>

        <section>
          <h2 className="mb-3 text-xl font-bold text-foreground">3. Sharing Your Information</h2>
          <p>
            We do not sell your personal data. We may share information with trusted third parties only where necessary:
          </p>
          <ul className="mt-3 list-disc space-y-1 pl-5">
            <li><strong className="text-foreground">Delivery partners</strong> who fulfil your orders (name and address only).</li>
            <li><strong className="text-foreground">Safaricom</strong> for M-Pesa payment processing (phone number only).</li>
            <li><strong className="text-foreground">Analytics providers</strong> for aggregated, anonymised usage statistics.</li>
          </ul>
        </section>

        <section>
          <h2 className="mb-3 text-xl font-bold text-foreground">4. Data Security</h2>
          <p>
            We use industry-standard encryption (HTTPS) to protect data in transit. Passwords are
            hashed and never stored in plain text. We do not store M-Pesa credentials or card details.
          </p>
        </section>

        <section>
          <h2 className="mb-3 text-xl font-bold text-foreground">5. Your Rights</h2>
          <p>You have the right to:</p>
          <ul className="mt-3 list-disc space-y-1 pl-5">
            <li>Access the personal data we hold about you.</li>
            <li>Request correction of inaccurate data.</li>
            <li>Request deletion of your account and associated data.</li>
            <li>Opt out of marketing communications at any time.</li>
          </ul>
          <p className="mt-3">To exercise any of these rights, contact us at <a href="mailto:privacy@cornershop.co.ke" className="text-primary underline">privacy@cornershop.co.ke</a>.</p>
        </section>

        <section>
          <h2 className="mb-3 text-xl font-bold text-foreground">6. Cookies</h2>
          <p>
            We use cookies to maintain your session, remember your cart, and analyse traffic.
            See our <a href="/cookies" className="text-primary underline">Cookie Policy</a> for full details.
          </p>
        </section>

        <section>
          <h2 className="mb-3 text-xl font-bold text-foreground">7. Changes to This Policy</h2>
          <p>
            We may update this policy periodically. We will notify you of significant changes by
            email or a notice on this page. Continued use of Corner Shop after changes constitutes
            acceptance of the revised policy.
          </p>
        </section>

        <section>
          <h2 className="mb-3 text-xl font-bold text-foreground">8. Contact</h2>
          <p>
            Questions about this policy? Email us at{" "}
            <a href="mailto:privacy@cornershop.co.ke" className="text-primary underline">privacy@cornershop.co.ke</a>{" "}
            or visit our <a href="/contact" className="text-primary underline">Contact page</a>.
          </p>
        </section>
      </div>
    </div>
  );
}
