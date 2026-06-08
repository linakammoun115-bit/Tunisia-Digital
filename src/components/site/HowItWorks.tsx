import { Search, ShoppingBag, CreditCard, Rocket } from "lucide-react";

const steps = [
  {
    icon: Search,
    title: "Browse Plans",
    desc: "Pick your favorite subscription from our curated catalog.",
  },
  {
    icon: ShoppingBag,
    title: "Add to Cart",
    desc: "Choose duration (monthly / yearly) and confirm your selection.",
  },
  {
    icon: CreditCard,
    title: "Pay Securely",
    desc: "Pay via D17, card or bank transfer — all 100% secure.",
  },
  {
    icon: Rocket,
    title: "Enjoy Instantly",
    desc: "Receive activation details via WhatsApp / email in minutes.",
  },
];

export function HowItWorks() {
  return (
    <section
      id="how"
      className="relative py-24 md:py-32 bg-gradient-to-b from-background via-surface/20 to-background overflow-hidden"
    >
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-20 left-10 h-40 w-40 rounded-full bg-primary/10 blur-3xl" />
        <div className="absolute bottom-10 right-10 h-52 w-52 rounded-full bg-primary/5 blur-3xl" />
      </div>

      <div className="container relative mx-auto px-6">
        <div className="max-w-2xl mx-auto text-center mb-16">
          <span className="inline-block px-4 py-1.5 rounded-full border border-primary/20 bg-primary/10 text-primary text-sm font-medium mb-4">
            Simple Process
          </span>

          <h2 className="font-display text-4xl md:text-5xl lg:text-6xl font-bold mb-5 leading-tight">
            How It <span className="gradient-text">Works</span>
          </h2>

          <p className="text-muted-foreground text-base md:text-lg leading-relaxed">
            Getting started is quick and easy. Follow these 4 simple steps and
            enjoy your subscription in minutes.
          </p>
        </div>

        <div className="relative grid gap-6 md:grid-cols-2 xl:grid-cols-4">
          <div className="hidden xl:block absolute top-16 left-[10%] right-[10%] h-px bg-gradient-to-r from-transparent via-primary/30 to-transparent" />

          {steps.map((s, i) => (
            <div
              key={s.title}
              className="group relative rounded-3xl border border-white/10 bg-background/70 backdrop-blur-sm p-8 text-center shadow-lg hover:shadow-2xl hover:-translate-y-2 transition-all duration-300"
            >
              <div className="absolute inset-0 rounded-3xl bg-gradient-to-b from-primary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

              <div className="relative inline-flex mb-6">
                <div className="absolute inset-0 rounded-2xl bg-primary/20 blur-xl opacity-70 group-hover:opacity-100 transition-opacity duration-300" />
                <div className="relative h-20 w-20 rounded-2xl gradient-primary flex items-center justify-center shadow-elegant">
                  <s.icon className="h-9 w-9 text-primary-foreground" />
                </div>
                <span className="absolute -top-2 -right-2 h-8 w-8 rounded-full bg-background border-2 border-primary text-sm font-bold flex items-center justify-center text-primary shadow">
                  {i + 1}
                </span>
              </div>

              <h3 className="font-display text-xl font-bold mb-3">
                {s.title}
              </h3>

              <p className="text-sm md:text-base text-muted-foreground leading-relaxed">
                {s.desc}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}