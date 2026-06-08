import { Star, Quote } from "lucide-react";

const reviews = [
  {
    name: "Yassine B.",
    role: "Freelance Designer · Tunis",
    text: "I got my Creative subscription in less than 5 minutes. Way cheaper than the official price and zero issues. Best Tunisian service I've used.",
    rating: 5,
  },
  {
    name: "Sarra M.",
    role: "Student · Sousse",
    text: "As a student I couldn't afford the AI tools at full price. TunisiaSubs made it possible. Support replied to me on WhatsApp instantly.",
    rating: 5,
  },
  {
    name: "Mohamed K.",
    role: "Developer · Sfax",
    text: "Used them 4 times now for streaming + dev tools. Always smooth, always fast. Finally a real local solution that works.",
    rating: 5,
  },
  {
    name: "Ines T.",
    role: "Content Creator · Tunis",
    text: "Honestly the cleanest checkout I've seen on a TN platform. The Pro plan paid for itself in one month.",
    rating: 5,
  },
];

const stats = [
  { value: "12,400+", label: "Active users" },
  { value: "98%", label: "Satisfaction" },
  { value: "< 5 min", label: "Avg delivery" },
  { value: "4.9/5", label: "Avg rating" },
];

export function Testimonials() {
  return (
    <section className="py-24 relative bg-surface/30">
      <div className="container mx-auto px-6">
        <div className="max-w-2xl mx-auto text-center mb-12">
          <h2 className="font-display text-4xl md:text-5xl font-bold mb-4">
            Loved by <span className="gradient-text">Tunisians</span>
          </h2>
          <p className="text-muted-foreground">
            Real reviews from real users across the country.
          </p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 max-w-4xl mx-auto mb-14">
          {stats.map((s) => (
            <div key={s.label} className="text-center rounded-2xl glass p-5">
              <div className="font-display text-2xl md:text-3xl font-bold gradient-text mb-1">
                {s.value}
              </div>
              <div className="text-xs text-muted-foreground uppercase tracking-wider">
                {s.label}
              </div>
            </div>
          ))}
        </div>

        <div className="grid md:grid-cols-2 gap-6 max-w-5xl mx-auto">
          {reviews.map((r) => (
            <div
              key={r.name}
              className="rounded-2xl gradient-border p-7 hover-lift relative overflow-hidden"
            >
              <Quote className="absolute top-4 right-4 h-12 w-12 text-primary/10" />
              <div className="flex gap-1 mb-3">
                {Array.from({ length: r.rating }).map((_, i) => (
                  <Star key={i} className="h-4 w-4 text-warning fill-warning" />
                ))}
              </div>
              <p className="text-sm leading-relaxed text-foreground/90 mb-5">
                "{r.text}"
              </p>
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-full gradient-primary flex items-center justify-center text-primary-foreground font-bold">
                  {r.name.charAt(0)}
                </div>
                <div>
                  <div className="text-sm font-semibold">{r.name}</div>
                  <div className="text-xs text-muted-foreground">{r.role}</div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
