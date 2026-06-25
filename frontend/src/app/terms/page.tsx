import type { Metadata } from "next";

export const metadata: Metadata = { title: "Terms & Conditions — Corner Shop" };

export default function TermsPage() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-16 md:px-8">
      <h1 className="mb-2 text-4xl font-extrabold tracking-tight text-foreground">Terms & Conditions</h1>
      <p className="mb-10 text-sm text-muted-foreground">Last updated: June 2026</p>

      <div className="space-y-8 text-sm leading-7 text-muted-foreground">

        <section>
          <h2 className="mb-3 text-xl font-bold text-foreground">1. Acceptance of Terms</h2>
          <p>
            By accessing or using Corner Shop ("the Service"), you agree to be bound by these Terms & Conditions.
            If you do not agree, please do not use our Service.
          </p>
        </section>

        <section>
          <h2 className="mb-3 text-xl font-bold text-foreground">2. Use of the Service</h2>
          <ul className="list-disc space-y-1 pl-5">
            <li>You must be at least 18 years old to create an account and place orders.</li>
            <li>You are responsible for maintaining the confidentiality of your account credentials.</li>
            <li>You agree not to use the Service for any unlawful or fraudulent purpose.</li>
            <li>We reserve the right to suspend or terminate accounts that violate these terms.</li>
          </ul>
        </section>

        <section>
          <h2 className="mb-3 text-xl font-bold text-foreground">3. Orders & Pricing</h2>
          <ul className="list-disc space-y-1 pl-5">
            <li>All prices are listed in Kenyan Shillings (KES) and are inclusive of applicable taxes.</li>
            <li>We reserve the right to change prices at any time without prior notice.</li>
            <li>An order is confirmed only after you receive an order confirmation notification.</li>
            <li>We reserve the right to cancel orders if stock is unavailable or pricing errors occur.</li>
          </ul>
        </section>

        <section>
          <h2 className="mb-3 text-xl font-bold text-foreground">4. Delivery</h2>
          <p>
            Delivery times are estimates and are not guaranteed. Corner Shop is not liable for delays
            caused by factors outside our control (traffic, weather, third-party logistics).
            See our <a href="/delivery" className="text-primary underline">Delivery Information</a> page for details.
          </p>
        </section>

        <section>
          <h2 className="mb-3 text-xl font-bold text-foreground">5. Returns & Refunds</h2>
          <p>
            Our returns policy is outlined on our <a href="/returns" className="text-primary underline">Returns & Refunds</a> page
            and forms part of these Terms. Perishable goods that have been correctly stored are not eligible for return.
          </p>
        </section>

        <section>
          <h2 className="mb-3 text-xl font-bold text-foreground">6. Limitation of Liability</h2>
          <p>
            Corner Shop's liability for any claim arising from use of the Service is limited to the value
            of the order in question. We are not liable for indirect, incidental, or consequential damages.
          </p>
        </section>

        <section>
          <h2 className="mb-3 text-xl font-bold text-foreground">7. Intellectual Property</h2>
          <p>
            All content on this website — including text, images, logos, and product descriptions — is
            the property of Corner Shop and may not be reproduced without written permission.
          </p>
        </section>

        <section>
          <h2 className="mb-3 text-xl font-bold text-foreground">8. Governing Law</h2>
          <p>
            These Terms are governed by the laws of the Republic of Kenya. Any disputes shall be
            subject to the exclusive jurisdiction of the courts of Nairobi, Kenya.
          </p>
        </section>

        <section>
          <h2 className="mb-3 text-xl font-bold text-foreground">9. Changes to Terms</h2>
          <p>
            We may revise these Terms at any time. Changes take effect upon posting to this page.
            Your continued use of the Service constitutes acceptance of the revised Terms.
          </p>
        </section>

        <section>
          <h2 className="mb-3 text-xl font-bold text-foreground">10. Contact</h2>
          <p>
            Questions about these Terms? Contact us at{" "}
            <a href="mailto:legal@cornershop.co.ke" className="text-primary underline">legal@cornershop.co.ke</a>.
          </p>
        </section>
      </div>
    </div>
  );
}
