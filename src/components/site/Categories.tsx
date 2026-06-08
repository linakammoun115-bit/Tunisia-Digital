import {
  Brain,
  Film,
  Palette,
  Briefcase,
  GraduationCap,
  ArrowUpRight,
  type LucideIcon,
} from "lucide-react";

type Category = {
  icon: LucideIcon;
  title: string;
  desc: string;
  count: string;
  accent: string;
};

const categories: Category[] = [
  {
    icon: Brain,
    title: "AI Tools",
    desc: "ChatGPT Business and premium AI tools for work, study and productivity.",
    count: "1 service",
    accent: "from-primary to-primary-glow",
  },
  {
    icon: Film,
    title: "Streaming",
    desc: "Netflix, IPTV, YouTube Premium and Spotify at local Tunisian prices.",
    count: "6 services",
    accent: "from-accent to-accent-glow",
  },
  {
    icon: Palette,
    title: "Creative",
    desc: "Canva Pro, CapCut Pro and Adobe Creative Cloud for creators.",
    count: "3 services",
    accent: "from-primary to-accent",
  },
  {
    icon: Briefcase,
    title: "Productivity",
    desc: "LinkedIn Premium and Microsoft Office tools for work and business.",
    count: "3 services",
    accent: "from-accent to-primary",
  },
  {
    icon: GraduationCap,
    title: "Education",
    desc: "Coursera Plus access for learning, certificates and career growth.",
    count: "1 service",
    accent: "from-primary-glow to-accent",
  },
];

function CategoryCard({ category }: { category: Category }) {
  const Icon = category.icon;

  const handleClick = () => {
    localStorage.setItem("selectedCategory", category.title);
    window.dispatchEvent(new Event("category-selected"));

    setTimeout(() => {
      document.getElementById("subscriptions")?.scrollIntoView({
        behavior: "smooth",
      });
    }, 100);
  };

  return (
    <button
      type="button"
      onClick={handleClick}
      aria-label={`Browse ${category.title}`}
      className="group relative block w-full overflow-hidden rounded-3xl border border-white/10 bg-background/60 p-7 text-left backdrop-blur-sm transition-all duration-300 hover:-translate-y-1 hover:border-primary/30 hover:shadow-2xl hover:shadow-primary/10 focus:outline-none focus:ring-2 focus:ring-primary/50"
    >
      <div
        className={`pointer-events-none absolute -right-10 -top-10 h-36 w-36 rounded-full bg-gradient-to-br ${category.accent} opacity-20 blur-3xl transition-opacity duration-300 group-hover:opacity-40`}
      />

      <div className="relative z-10">
        <div
          className={`mb-5 flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br ${category.accent} shadow-lg transition-transform duration-300 group-hover:scale-110`}
        >
          <Icon className="h-7 w-7 text-white" />
        </div>

        <div className="mb-3 flex items-start justify-between gap-3">
          <h3 className="font-display text-xl font-bold tracking-tight">
            {category.title}
          </h3>

          <ArrowUpRight className="h-5 w-5 shrink-0 text-muted-foreground transition-all duration-300 group-hover:translate-x-1 group-hover:-translate-y-1 group-hover:text-primary" />
        </div>

        <p className="mb-5 min-h-[66px] text-sm leading-relaxed text-muted-foreground">
          {category.desc}
        </p>

        <div className="flex items-center justify-between">
          <span className="inline-flex rounded-full border border-primary/20 bg-primary/10 px-3 py-1 text-xs font-semibold text-primary">
            {category.count}
          </span>

          <span className="text-xs text-muted-foreground transition group-hover:text-primary">
            Browse
          </span>
        </div>
      </div>
    </button>
  );
}

export function Categories() {
  return (
    <section
      id="categories"
      className="relative overflow-hidden bg-surface/30 py-24"
      aria-labelledby="categories-heading"
    >
      <div className="pointer-events-none absolute left-0 top-10 h-72 w-72 rounded-full bg-primary/10 blur-3xl" />
      <div className="pointer-events-none absolute bottom-10 right-0 h-72 w-72 rounded-full bg-accent/10 blur-3xl" />

      <div className="container relative z-10 mx-auto px-6">
        <div className="mx-auto mb-14 max-w-2xl text-center">
          <div className="mb-4 inline-flex rounded-full px-3 py-1 text-xs font-medium text-primary glass">
            Browse faster
          </div>

          <h2
            id="categories-heading"
            className="mb-4 font-display text-4xl font-bold md:text-5xl"
          >
            Browse by <span className="gradient-text">Category</span>
          </h2>

          <p className="text-base leading-relaxed text-muted-foreground">
            Find the right subscription quickly, from streaming and AI tools to
            learning and productivity.
          </p>
        </div>

        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-5">
          {categories.map((category) => (
            <CategoryCard key={category.title} category={category} />
          ))}
        </div>
      </div>
    </section>
  );
}