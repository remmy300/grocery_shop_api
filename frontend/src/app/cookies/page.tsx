import type { Metadata } from "next";

export const metadata: Metadata = { title: "Cookie Policy — Corner Shop" };

const COOKIE_TYPES = [
  {
    name: "Essential Cookies",
    required: true,
    description: "Required for the website to function. They keep you logged in and maintain your shopping cart.",
    examples: ["Session token", "Cart ID", "CSRF token"],
  },
  {
    name: "Analytics Cookies",
    required: false,
    description: "Help us understand how visitors use our site so we can improve it. All data is anonymised.",
    examples: ["Pages visited", "Time on site", "Click patterns"],
  },
  {
    name: "Preference Cookies",
    required: false,
    description: "Remember your choices such as language preference and previously viewed products.",
    examples: ["Preferred currency", "Recently viewed items"],
  },
];

export default function CookiesPage() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-16 md:px-8">
      <h1 className="mb-2 text-4xl font-extrabold tracking-tight text-foreground">Cookie Policy</h1>
      <p className="mb-10 text-sm text-muted-foreground">Last updated: June 2026</p>

      <div className="space-y-8 text-sm leading-7 text-muted-foreground">

        <section>
          <h2 className="mb-3 text-xl font-bold text-foreground">What Are Cookies?</h2>
          <p>
            Cookies are small text files stored on your device when you visit a website. They help the
            site remember information about your visit, making your next visit easier and the site
            more useful to you.
          </p>
        </section>

        <section>
          <h2 className="mb-6 text-xl font-bold text-foreground">Cookies We Use</h2>
          <div className="space-y-4">
            {COOKIE_TYPES.map(({ name, required, description, examples }) => (
              <div key={name} className="rounded-2xl border border-border p-5">
                <div className="mb-2 flex items-center justify-between gap-2">
                  <h3 className="font-bold text-foreground">{name}</h3>
                  <span className={`rounded-full px-2.5 py-0.5 text-xs font-semibold ${required ? "bg-primary/10 text-primary" : "bg-muted text-muted-foreground"}`}>
                    {required ? "Required" : "Optional"}
                  </span>
                </div>
                <p className="mb-3">{description}</p>
                <div className="flex flex-wrap gap-2">
                  {examples.map((ex) => (
                    <span key={ex} className="rounded-full bg-muted px-3 py-1 text-xs font-medium text-foreground">
                      {ex}
                    </span>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </section>

        <section>
          <h2 className="mb-3 text-xl font-bold text-foreground">Managing Cookies</h2>
          <p>
            You can control and delete cookies through your browser settings. Note that disabling
            essential cookies will prevent you from logging in or using the shopping cart.
          </p>
          <ul className="mt-3 list-disc space-y-1 pl-5">
            <li><a href="https://support.google.com/chrome/answer/95647" className="text-primary underline" target="_blank" rel="noopener noreferrer">Chrome cookie settings</a></li>
            <li><a href="https://support.mozilla.org/en-US/kb/cookies-information-websites-store-on-your-computer" className="text-primary underline" target="_blank" rel="noopener noreferrer">Firefox cookie settings</a></li>
            <li><a href="https://support.apple.com/guide/safari/manage-cookies-sfri11471/mac" className="text-primary underline" target="_blank" rel="noopener noreferrer">Safari cookie settings</a></li>
          </ul>
        </section>

        <section>
          <h2 className="mb-3 text-xl font-bold text-foreground">Third-Party Cookies</h2>
          <p>
            We may use analytics services (e.g. anonymised traffic analysis tools) that set their own
            cookies. These are governed by the third party's own privacy policy and are optional.
          </p>
        </section>

        <section>
          <h2 className="mb-3 text-xl font-bold text-foreground">Contact</h2>
          <p>
            Questions about our use of cookies? Email{" "}
            <a href="mailto:privacy@cornershop.co.ke" className="text-primary underline">privacy@cornershop.co.ke</a>.
          </p>
        </section>
      </div>
    </div>
  );
}
