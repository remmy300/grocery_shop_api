import type { Metadata } from "next";
import Link from "next/link";
import { AlertTriangle, CheckCircle, RefreshCw, XCircle } from "lucide-react";

export const metadata: Metadata = { title: "Returns & Refunds — Corner Shop" };

export default function ReturnsPage() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-16 md:px-8">
      <div className="mb-12">
        <h1 className="text-4xl font-extrabold tracking-tight text-foreground">
          Returns & Refunds
        </h1>
        <p className="mt-3 text-muted-foreground">
          Your satisfaction is our priority. If something is not right, we will make it right.
        </p>
      </div>

      {/* Policy overview */}
      <div className="mb-10 grid gap-4 sm:grid-cols-3">
        {[
          { icon: CheckCircle, color: "text-green-600 bg-green-50", title: "Eligible for return", body: "Damaged, spoiled, or incorrect items" },
          { icon: XCircle, color: "text-red-500 bg-red-50", title: "Not eligible", body: "Perishables opened or used correctly" },
          { icon: RefreshCw, color: "text-blue-600 bg-blue-50", title: "Refund timeline", body: "1–3 business days for M-Pesa refunds" },
        ].map(({ icon: Icon, color, title, body }) => (
          <div key={title} className="rounded-2xl border border-border p-5">
            <div className={`mb-3 inline-flex rounded-xl p-2 ${color}`}>
              <Icon className="h-5 w-5" />
            </div>
            <p className="font-semibold text-foreground">{title}</p>
            <p className="mt-1 text-sm text-muted-foreground">{body}</p>
          </div>
        ))}
      </div>

      <div className="space-y-8 text-sm leading-7 text-foreground">
        <section>
          <h2 className="mb-3 text-xl font-bold">Our Return Policy</h2>
          <p className="text-muted-foreground">
            We accept return requests for items that arrive damaged, spoiled, or different from what was ordered.
            Requests must be raised within <strong>24 hours</strong> of delivery. After this window, we are unable
            to process a return for perishable goods.
          </p>
        </section>

        <section>
          <h2 className="mb-3 text-xl font-bold">How to Request a Return</h2>
          <ol className="space-y-3 text-muted-foreground">
            <li className="flex gap-3"><span className="font-bold text-primary">1.</span> Contact us via the <Link href="/contact" className="text-primary underline">Contact Us</Link> page or call <a href="tel:+254700000000" className="text-primary underline">+254 700 000 000</a> within 24 hours of delivery.</li>
            <li className="flex gap-3"><span className="font-bold text-primary">2.</span> Provide your order number, the affected item(s), and a brief description or photo of the issue.</li>
            <li className="flex gap-3"><span className="font-bold text-primary">3.</span> Our team will review your request and respond within 2 hours during business hours (8 AM – 8 PM).</li>
            <li className="flex gap-3"><span className="font-bold text-primary">4.</span> If approved, we will arrange a replacement delivery or process a refund to your original payment method.</li>
          </ol>
        </section>

        <section>
          <h2 className="mb-3 text-xl font-bold">Refunds</h2>
          <ul className="space-y-2 text-muted-foreground">
            <li><strong className="text-foreground">M-Pesa payments:</strong> Refunded within 1–3 business days to your registered Safaricom number.</li>
            <li><strong className="text-foreground">Cash on Delivery:</strong> Cash refunds or credit are arranged at the time of the replacement delivery.</li>
          </ul>
        </section>

        <div className="flex items-start gap-3 rounded-2xl border border-amber-200 bg-amber-50 p-5">
          <AlertTriangle className="mt-0.5 h-5 w-5 shrink-0 text-amber-600" />
          <p className="text-sm text-amber-800">
            <strong>Important:</strong> We are unable to accept returns on perishable items (fresh produce, dairy, meat)
            that have been stored incorrectly or kept beyond their use-by date after delivery.
          </p>
        </div>
      </div>
    </div>
  );
}
