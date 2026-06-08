import { Sparkles } from "lucide-react";

const platformLinks = [
  { label: "Subscriptions", href: "#subscriptions" },
  { label: "Categories", href: "#categories" },
  { label: "Pricing", href: "#pricing" },
  { label: "How it Works", href: "#how" },
];

const legalLinks = [
  { label: "Terms of Service", href: "#" },
  { label: "Privacy Policy", href: "#" },
  { label: "Refund Policy", href: "#" },
  { label: "Contact", href: "#contact" },
];

export function Footer() {
  const year = new Date().getFullYear();

  return (
    <footer className="relative border-t border-border/50 bg-surface/40 pb-8 pt-16 backdrop-blur">
      <div className="absolute inset-0 -z-10 bg-[radial-gradient(circle_at_top,rgba(120,119,198,0.10),transparent_45%)]" />

      <div className="container mx-auto px-6">
        <div className="mb-12 grid gap-10 md:grid-cols-4">
          <div className="md:col-span-2">
            <a
              href="#"
              className="mb-4 inline-flex items-center gap-3 transition-opacity hover:opacity-90"
              aria-label="TunisiaSubs home"
            >
              <div className="flex h-10 w-10 items-center justify-center rounded-xl gradient-primary shadow-lg">
                <Sparkles className="h-5 w-5 text-primary-foreground" />
              </div>

              <span className="font-display text-lg font-bold tracking-tight">
                Tunisia<span className="gradient-text">Subs</span>
              </span>
            </a>

            <p className="max-w-md text-sm leading-relaxed text-muted-foreground">
              The trusted Tunisian marketplace for premium digital subscriptions.
              AI tools, streaming, creative, and productivity services — all in one place.
            </p>
          </div>

          <div>
            <h4 className="mb-4 font-display text-sm font-semibold uppercase tracking-[0.2em] text-foreground/80">
              Platform
            </h4>

            <ul className="space-y-3">
              {platformLinks.map((link) => (
                <li key={link.label}>
                  <a
                    href={link.href}
                    className="text-sm text-muted-foreground transition-colors duration-300 hover:text-foreground"
                  >
                    {link.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h4 className="mb-4 font-display text-sm font-semibold uppercase tracking-[0.2em] text-foreground/80">
              Legal
            </h4>

            <ul className="space-y-3">
              {legalLinks.map((link) => (
                <li key={link.label}>
                  <a
                    href={link.href}
                    className="text-sm text-muted-foreground transition-colors duration-300 hover:text-foreground"
                  >
                    {link.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="flex flex-col gap-5 border-t border-border/50 pt-8 md:flex-row md:items-start md:justify-between">
          <p className="text-xs text-muted-foreground">
            © {year} TunisiaSubs. All rights reserved.
          </p>

          <p className="max-w-2xl text-xs leading-relaxed text-muted-foreground md:text-right">
            <span className="font-semibold text-foreground/80">Disclaimer:</span>{" "}
            TunisiaSubs is an independent reseller marketplace and is not affiliated with,
            endorsed by, or sponsored by any of the brands or services represented on this
            website. All trademarks, logos, and brand names are the property of their
            respective owners.
          </p>
        </div>
      </div>
    </footer>
  );
}