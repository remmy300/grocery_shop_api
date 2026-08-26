"use client";

import { FormEvent, useState } from "react";
import { Mail, MapPin, MessageSquare, Phone } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { apiRequest } from "@/lib/api";

const CONTACT_INFO = [
  { icon: Phone, label: "Phone", value: "+254 700 000 000", href: "tel:+254700000000" },
  { icon: Mail, label: "Email", value: "support@cornershop.co.ke", href: "mailto:support@cornershop.co.ke" },
  { icon: MapPin, label: "Location", value: "Nairobi, Kenya", href: "#" },
  { icon: MessageSquare, label: "WhatsApp", value: "+254 700 000 000", href: "https://wa.me/254700000000" },
];

export default function ContactPage() {
  const [form, setForm] = useState({ name: "", email: "", subject: "", message: "" });
  const [sending, setSending] = useState(false);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!form.name.trim() || !form.email.trim() || !form.message.trim()) {
      toast.error("Please fill in all required fields.");
      return;
    }
    setSending(true);
    try {
      await apiRequest("/api/contact", {
        method: "POST",
        json: {
          name: form.name.trim(),
          email: form.email.trim(),
          subject: form.subject.trim() || undefined,
          message: form.message.trim(),
        },
      });
      toast.success("Message sent! We'll get back to you within 24 hours.");
      setForm({ name: "", email: "", subject: "", message: "" });
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Failed to send message",
      );
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="mx-auto max-w-5xl px-4 py-16 md:px-8">
      <div className="mb-12">
        <h1 className="text-4xl font-extrabold tracking-tight text-foreground">Contact Us</h1>
        <p className="mt-3 text-muted-foreground">
          Have a question or need help? We're available 7 days a week, 8 AM – 8 PM.
        </p>
      </div>

      <div className="grid gap-12 lg:grid-cols-2">
        {/* Contact info */}
        <div className="space-y-8">
          <div className="grid gap-4 sm:grid-cols-2">
            {CONTACT_INFO.map(({ icon: Icon, label, value, href }) => (
              <a
                key={label}
                href={href}
                className="flex items-start gap-3 rounded-2xl border border-border p-5 transition hover:border-primary/40 hover:bg-primary/5"
              >
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
                  <Icon className="h-5 w-5" />
                </div>
                <div>
                  <p className="text-xs font-bold uppercase tracking-widest text-muted-foreground">{label}</p>
                  <p className="mt-1 text-sm font-semibold text-foreground">{value}</p>
                </div>
              </a>
            ))}
          </div>

          <div className="rounded-2xl bg-primary/5 p-6">
            <h3 className="font-bold text-foreground">Business Hours</h3>
            <ul className="mt-3 space-y-2 text-sm text-muted-foreground">
              <li className="flex justify-between"><span>Monday – Friday</span><span className="font-medium text-foreground">8:00 AM – 8:00 PM</span></li>
              <li className="flex justify-between"><span>Saturday</span><span className="font-medium text-foreground">8:00 AM – 6:00 PM</span></li>
              <li className="flex justify-between"><span>Sunday</span><span className="font-medium text-foreground">10:00 AM – 4:00 PM</span></li>
            </ul>
          </div>
        </div>

        {/* Contact form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="mb-1.5 block text-sm font-medium text-foreground">Name *</label>
              <Input
                value={form.name}
                onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
                placeholder="Your full name"
              />
            </div>
            <div>
              <label className="mb-1.5 block text-sm font-medium text-foreground">Email *</label>
              <Input
                type="email"
                value={form.email}
                onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))}
                placeholder="your@email.com"
              />
            </div>
          </div>
          <div>
            <label className="mb-1.5 block text-sm font-medium text-foreground">Subject</label>
            <Input
              value={form.subject}
              onChange={(e) => setForm((f) => ({ ...f, subject: e.target.value }))}
              placeholder="e.g. Issue with my order"
            />
          </div>
          <div>
            <label className="mb-1.5 block text-sm font-medium text-foreground">Message *</label>
            <textarea
              value={form.message}
              onChange={(e) => setForm((f) => ({ ...f, message: e.target.value }))}
              placeholder="Describe your issue or question..."
              rows={5}
              className="flex w-full rounded-md border border-input bg-background px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
            />
          </div>
          <Button type="submit" disabled={sending} className="w-full rounded-full">
            {sending ? "Sending…" : "Send Message"}
          </Button>
        </form>
      </div>
    </div>
  );
}
