import { Zap, MapPin, ShieldCheck, CreditCard, Headphones, Award } from "lucide-react";

const features = [
  {
    icon: Zap,
    title: "Lightning Fast Delivery",
    desc: "Most subscriptions are activated within 5 minutes after payment.",
  },
  {
    icon: MapPin,
    title: "Local Tunisian Service",
    desc: "Built for Tunisia — local prices, local support, local payment options.",
  },
  {
    icon: ShieldCheck,
    title: "100% Trusted Platform",
    desc: "Thousands of satisfied users. Money-back guarantee on every order.",
  },
  {
    icon: CreditCard,
    title: "Easy Payment Methods",
    desc: "D17, bank transfer, e-Dinar, and international cards — your choice.",
  },
  {
    icon: Headphones,
    title: "Real Human Support",
    desc: "WhatsApp & email support 7 days a week from a real Tunisian team.",
  },
  {
    icon: Award,
    title: "Premium Quality Only",
    desc: "Every subscription is verified, monitored, and replaced if needed.",
  },
];

export function WhyUs() {
  return (
    <section className="py-24 relative">
      <div className="container mx-auto px-6">
        <div className="max-w-2xl mx-auto text-center mb-16">
          <h2 className="font-display text-4xl md:text-5xl font-bold mb-4">
            Why Choose <span className="gradient-text">Tunisia Subs</span>
          </h2>
          <p className="text-muted-foreground">
            We built a platform that locals can finally trust for premium digital services.
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((f) => (
            <div
              key={f.title}
              className="group rounded-2xl gradient-border p-7 hover-lift"
            >
              <div className="h-12 w-12 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center mb-4 group-hover:bg-primary/20 group-hover:glow-primary transition-smooth">
                <f.icon className="h-6 w-6 text-primary" />
              </div>
              <h3 className="font-display text-lg font-bold mb-2">{f.title}</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">{f.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
