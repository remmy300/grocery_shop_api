import type { Metadata } from "next";
import { Clock, MapPin, Package, Truck } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

export const metadata: Metadata = { title: "Delivery Information — Corner Shop" };

const ZONES = [
  { zone: "Nairobi CBD & Westlands", time: "1–2 hours", fee: "KES 150" },
  { zone: "Kilimani, Lavington & Kileleshwa", time: "2–3 hours", fee: "KES 150" },
  { zone: "Kasarani, Ruaka & Ruiru", time: "3–4 hours", fee: "KES 200" },
  { zone: "Ngong, Karen & Rongai", time: "3–5 hours", fee: "KES 250" },
  { zone: "Thika & Kiambu Town", time: "4–6 hours", fee: "KES 300" },
];

export default function DeliveryPage() {
  return (
    <div className="mx-auto max-w-4xl px-4 py-16 md:px-8">
      <div className="mb-12">
        <h1 className="text-4xl font-extrabold tracking-tight text-foreground">
          Delivery Information
        </h1>
        <p className="mt-3 text-muted-foreground">
          Everything you need to know about how and when we deliver.
        </p>
      </div>

      {/* Key facts */}
      <div className="mb-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {[
          { icon: Truck, title: "Free Delivery", body: "On all orders over KES 1,000" },
          { icon: Clock, title: "Same-Day", body: "Order before 2 PM for same-day delivery" },
          { icon: MapPin, title: "Nairobi & surrounds", body: "Covering major areas across the city" },
          { icon: Package, title: "Fresh Guarantee", body: "Cold chain maintained from farm to door" },
        ].map(({ icon: Icon, title, body }) => (
          <Card key={title} className="rounded-2xl">
            <CardContent className="p-5">
              <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 text-primary">
                <Icon className="h-5 w-5" />
              </div>
              <p className="font-semibold text-foreground">{title}</p>
              <p className="mt-1 text-sm text-muted-foreground">{body}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Delivery zones */}
      <section className="mb-12">
        <h2 className="mb-6 text-2xl font-bold tracking-tight text-foreground">Delivery Zones & Fees</h2>
        <div className="overflow-hidden rounded-2xl border border-border">
          <table className="w-full text-sm">
            <thead className="bg-muted/50 text-xs font-bold uppercase tracking-wider text-muted-foreground">
              <tr>
                <th className="px-6 py-3 text-left">Area</th>
                <th className="px-6 py-3 text-left">Estimated Time</th>
                <th className="px-6 py-3 text-left">Delivery Fee</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {ZONES.map(({ zone, time, fee }) => (
                <tr key={zone} className="hover:bg-muted/30 transition-colors">
                  <td className="px-6 py-4 font-medium text-foreground">{zone}</td>
                  <td className="px-6 py-4 text-muted-foreground">{time}</td>
                  <td className="px-6 py-4 font-semibold text-primary">{fee}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <p className="mt-3 text-xs text-muted-foreground">
          * Fees waived on orders above KES 1,000. Times are estimates and may vary during peak hours.
        </p>
      </section>

      {/* How it works */}
      <section>
        <h2 className="mb-6 text-2xl font-bold tracking-tight text-foreground">How Delivery Works</h2>
        <ol className="space-y-4">
          {[
            { step: "1", title: "Place your order", body: "Add items to cart and complete checkout. Choose Home Delivery at checkout." },
            { step: "2", title: "We pick & pack", body: "Our team picks your items fresh and packs them carefully for transit." },
            { step: "3", title: "Out for delivery", body: "A rider picks up your order. You'll receive a notification when they're on the way." },
            { step: "4", title: "Delivered to you", body: "Your groceries arrive at your door. Enjoy!" },
          ].map(({ step, title, body }) => (
            <li key={step} className="flex gap-4">
              <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary text-sm font-bold text-white">
                {step}
              </div>
              <div>
                <p className="font-semibold text-foreground">{title}</p>
                <p className="mt-0.5 text-sm text-muted-foreground">{body}</p>
              </div>
            </li>
          ))}
        </ol>
      </section>
    </div>
  );
}
