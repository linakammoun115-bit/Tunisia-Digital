import { Zap, ShieldCheck, Headphones, CreditCard, Truck, Star } from "lucide-react";

const items = [
  { icon: Zap, label: "Instant Delivery" },
  { icon: ShieldCheck, label: "100% Secure" },
  { icon: Headphones, label: "24/7 Support" },
  { icon: CreditCard, label: "Local Payment" },
  { icon: Truck, label: "Free Activation" },
  { icon: Star, label: "12,000+ Happy Users" },
];

const repeatedItems = [...items, ...items];

export function MarqueeStrip() {
  return (
    <section className="relative overflow-hidden border-y border-border/50 bg-surface/30 backdrop-blur-xl">
      <div className="absolute inset-0 bg-grid opacity-20" />

      <div className="pointer-events-none absolute inset-y-0 left-0 z-10 w-20 bg-gradient-to-r from-background via-background/90 to-transparent md:w-32" />
      <div className="pointer-events-none absolute inset-y-0 right-0 z-10 w-20 bg-gradient-to-l from-background via-background/90 to-transparent md:w-32" />

      <div className="relative py-4 md:py-5">
        <div className="flex w-max animate-marquee items-center gap-4 md:gap-6 [animation-duration:28s] hover:[animation-play-state:paused]">
          {repeatedItems.map((item, index) => (
            <div
              key={`${item.label}-${index}`}
              className={`group relative flex min-w-fit items-center gap-3 rounded-2xl border px-4 py-3 md:px-5 transition-all duration-300 hover:-translate-y-1 hover:border-primary/40 hover:text-foreground ${
                item.label.includes("Happy Users")
                  ? "border-primary/20 bg-primary/10 shadow-lg shadow-primary/10"
                  : "border-white/10 bg-background/60"
              }`}
            >
              <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-primary/0 via-primary/5 to-accent/0 opacity-0 transition-opacity duration-300 group-hover:opacity-100" />

              <div className="relative flex h-9 w-9 items-center justify-center rounded-xl bg-primary/10 ring-1 ring-primary/15 transition-all duration-300 group-hover:bg-primary/20">
                <item.icon className="h-4 w-4 text-primary" />
              </div>

              <span className="relative whitespace-nowrap text-sm font-medium tracking-wide text-foreground/90">
                {item.label}
              </span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}