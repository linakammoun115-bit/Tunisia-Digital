import { useEffect, useMemo, useState } from "react";
import { getProducts } from "@/lib/products";
import {
  ArrowRight,
  Brain,
  Film,
  Palette,
  Music,
  Flame,
  MonitorPlay,
  GraduationCap,
  FileText,
  Briefcase,
} from "lucide-react";
import { Button } from "../ui/button";
import { Link } from "@tanstack/react-router";

type Plan = {
  name: string;
  slug: string;
  category: string;
  icon: React.ElementType;
  price: number;
  oldPrice: number;
  duration: string;
  badge?: "Popular" | "Best Deal" | "Limited";
  accent: string;
};

type SocialService = {
  name: string;
  price: number;
  desc: string;
};



const followersServices: SocialService[] = [
  {
    name: "1K Followers",
    price: 10,
    desc: "Ideal for starting and giving your profile more credibility.",
  },
  {
    name: "2K Followers",
    price: 15,
    desc: "A stronger boost for personal pages and small businesses.",
  },
  {
    name: "10K Followers",
    price: 70,
    desc: "Perfect for influencers, creators and growing brands.",
  },
  {
    name: "20K Followers",
    price: 120,
    desc: "High-impact growth package for serious social presence.",
  },
  {
    name: "100K Followers",
    price: 500,
    desc: "Maximum visibility package for big pages and campaigns.",
  },
];

const viewsServices: SocialService[] = [
  {
    name: "100K Views",
    price: 40,
    desc: "Boost your video reach and increase visibility quickly.",
  },
  {
    name: "1 Million Views",
    price: 120,
    desc: "Massive exposure package for viral content and campaigns.",
  },
];

const likesServices: SocialService[] = [
  {
    name: "1K Likes",
    price: 20,
    desc: "Improve post engagement and make your content look active.",
  },
  {
    name: "10K Likes",
    price: 100,
    desc: "Great for campaigns, launches and high-performing posts.",
  },
  {
    name: "100K Likes",
    price: 300,
    desc: "Premium engagement package for large-scale visibility.",
  },
];
const baseCategories = [
  "All",
  "AI Tools",
  "Creative",
  "Streaming",
  "Productivity",
  "Education",
];
function addSocialToCart(service: SocialService, type: string) {
  const cart = JSON.parse(localStorage.getItem("cart") || "[]");

  const slug = `social-${type}-${service.name}`
    .toLowerCase()
    .replace(/\s+/g, "-");

  const existingItem = cart.find((item: any) => item.slug === slug);

  const updatedCart = existingItem
    ? cart.map((item: any) =>
        item.slug === slug
          ? { ...item, quantity: item.quantity + 1 }
          : item
      )
    : [
        ...cart,
        {
          slug,
          name: `${service.name} (${type})`,
          price: service.price,
          duration: "Social Boost",
          quantity: 1,
        },
      ];

  localStorage.setItem("cart", JSON.stringify(updatedCart));
  window.dispatchEvent(new Event("cart-updated"));

  alert("Added to cart ✅");
}

function SocialSection({
  title,
  services,
}: {
  title: string;
  services: SocialService[];
}) {
  return (
    <div className="mt-16">
      <h3 className="mb-6 font-display text-3xl font-bold">
        {title} <span className="gradient-text">Packages</span>
      </h3>
      

      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {services.map((service) => (
          <article
            key={service.name}
            className="group relative overflow-hidden rounded-3xl p-6 gradient-border hover-lift"
          >
            <div className="pointer-events-none absolute -right-10 -top-10 h-32 w-32 rounded-full bg-primary/10 blur-2xl transition group-hover:bg-accent/20" />

            <div className="relative z-10">
              <span className="mb-4 inline-flex rounded-full border border-primary/30 bg-primary/10 px-3 py-1 text-xs font-bold text-primary">
                {title}
              </span>

              <h4 className="text-xl font-bold">{service.name}</h4>
              <p className="mt-3 min-h-[48px] text-sm leading-relaxed text-muted-foreground">
  {service.desc}
</p>


              <div className="mt-4 text-3xl font-bold gradient-text">
                {service.price} DT
              </div>

              <button
                type="button"
                className="mt-6 w-full rounded-xl py-2 gradient-primary text-white"
                onClick={() => addSocialToCart(service, title)}
              >
                Add to Cart
              </button>
            </div>
          </article>
        ))}
      </div>
    </div>
  );
}

export function Subscriptions() {
  const [category, setCategory] = useState("All");
  const [sortBy, setSortBy] = useState("recommended");
  const [adminProducts, setAdminProducts] = useState<Record<string, any>>(
  getProducts()
);
const [wheelReward, setWheelReward] = useState(
  localStorage.getItem("wheelReward") || ""
);

  const categories = [
    ...new Set([
      ...baseCategories,
      ...Object.values(adminProducts).map((product) => product.category),
    ]),
  ];

 useEffect(() => {
  const handleCategorySelected = () => {
    const selected = localStorage.getItem("selectedCategory");

    if (selected) {
      setCategory(selected);
      setSortBy("recommended");
    }
  };

  handleCategorySelected();

  window.addEventListener("category-selected", handleCategorySelected);

  return () => {
    window.removeEventListener("category-selected", handleCategorySelected);
  };
}, []);
useEffect(() => {
  const refreshProducts = () => {
    setAdminProducts(getProducts());
  };

  refreshProducts();

  window.addEventListener("products-updated", refreshProducts);

  return () => {
    window.removeEventListener("products-updated", refreshProducts);
  };
}, []);
useEffect(() => {
  const handleReward = () => {
    setWheelReward(localStorage.getItem("wheelReward") || "");
  };

  window.addEventListener("wheel-reward-updated", handleReward);

  return () => {
    window.removeEventListener("wheel-reward-updated", handleReward);
  };
}, []);

const getRewardDiscount = (planName: string) => {
  const reward = wheelReward.toLowerCase();
  const name = planName.toLowerCase();

  if (reward.includes("gemini") && name.includes("gemini")) return 25;
  if (reward.includes("spotify") && name.includes("spotify")) return 10;
  if (reward.includes("canva") && name.includes("canva")) return 50;
  if (reward.includes("linkedin") && name.includes("linkedin")) return 15;
  if (reward.includes("2k followers") && name.includes("followers")) return 10;
  if (reward.includes("5%")) return 5;

  return 0;
};

const applyDiscount = (price: number, discount: number) => {
  return Math.round(price - price * (discount / 100));
};

const filteredPlans = useMemo(() => {
  const result = Object.entries(adminProducts)
    .filter(([_, product]) => product.active)
    .map(([slug, product]) => {
      const priceText = product.pricesByDuration?.["1 month"] || "0 DT";

      const originalPrice = Number(String(priceText).replace("DT", "").trim());

      const oldPrice = Number(
        String(product.oldPrice).replace("DT", "").trim()
      );

      const rewardDiscount = getRewardDiscount(product.name);

      return {
        name: product.name,
        slug,
        category: product.category,
        icon: Film,
        price: applyDiscount(originalPrice, rewardDiscount),
        oldPrice,
        duration: "1 month",
        badge: undefined,
        accent: "from-primary to-accent",
        rewardDiscount,
      };
    })
    .filter((plan) => category === "All" || plan.category === category);

  return [...result].sort((a, b) => {
    if (sortBy === "price-low") return a.price - b.price;
    if (sortBy === "price-high") return b.price - a.price;

    if (sortBy === "discount") {
      const dA = 1 - a.price / a.oldPrice;
      const dB = 1 - b.price / b.oldPrice;
      return dB - dA;
    }

    if (sortBy === "name") return a.name.localeCompare(b.name);

    return 0;
  });
}, [adminProducts, category, sortBy, wheelReward]);

const hasActiveFilters = category !== "All" || sortBy !== "recommended";

const resetFilters = () => {
  localStorage.removeItem("selectedCategory");
  setCategory("All");
  setSortBy("recommended");
};

return (
  <section id="subscriptions" className="relative overflow-hidden py-24">
    <div className="container relative z-10 mx-auto px-6">
      <div className="mx-auto mb-12 max-w-2xl text-center">
        <div className="mb-4 inline-flex items-center gap-2 rounded-full px-3 py-1 text-xs font-medium text-primary glass">
          <Flame className="h-3.5 w-3.5" /> HOT OFFERS
        </div>

        <h2 className="mb-4 font-display text-4xl font-bold md:text-5xl">
          Featured <span className="gradient-text">Subscriptions</span>
        </h2>

        <p className="text-muted-foreground">
          Hand-picked premium services at the best local prices.
        </p>
      </div>

      <div className="mx-auto mb-10 max-w-6xl rounded-3xl p-4 glass">
        <div className="mb-4 flex flex-wrap gap-2">
          {categories.map((item) => (
            <button
              key={item}
              type="button"
              onClick={() => {
                localStorage.removeItem("selectedCategory");
                setCategory(item);
              }}
              className={`rounded-full px-4 py-2 text-sm transition-smooth ${
                category === item
                  ? "gradient-primary text-white"
                  : "border border-border text-muted-foreground hover:text-foreground"
              }`}
            >
              {item}
            </button>
          ))}
        </div>

        <div className="flex flex-wrap gap-2">
          {[
            ["recommended", "Recommended"],
            ["price-low", "Low price"],
            ["price-high", "High price"],
            ["discount", "Best discount"],
            ["name", "A-Z"],
          ].map(([value, label]) => (
            <button
              key={value}
              type="button"
              onClick={() => setSortBy(value)}
              className={`rounded-full px-3 py-1 text-xs transition-smooth ${
                sortBy === value
                  ? "gradient-primary text-white"
                  : "border border-border text-muted-foreground hover:text-foreground"
              }`}
            >
              {label}
            </button>
          ))}
        </div>

        {hasActiveFilters ? (
          <button
            type="button"
            onClick={resetFilters}
            className="mt-4 text-sm text-primary hover:text-foreground"
          >
            Reset filters
          </button>
        ) : null}
      </div>

      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {filteredPlans.map((p: any) => {
          const Icon = p.icon;

          return (
            <article
              key={p.slug}
              className="group relative overflow-hidden rounded-2xl p-6 gradient-border hover-lift"
            >
              <div className="pointer-events-none absolute inset-0 opacity-0 transition-smooth group-hover:opacity-100">
                <div className="absolute -right-10 -top-10 h-32 w-32 rounded-full bg-primary/10 blur-2xl" />
                <div className="absolute -bottom-10 -left-10 h-32 w-32 rounded-full bg-accent/10 blur-2xl" />
              </div>

              <div className="relative z-10">
                <div className="mb-5 flex items-start justify-between">
                  <div
                    className={`flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br ${p.accent} shadow-lg`}
                  >
                    <Icon className="h-6 w-6 text-primary-foreground" />
                  </div>

                  {p.rewardDiscount > 0 && (
                    <span className="rounded-full border border-success/30 bg-success/10 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-success">
                      🎁 -{p.rewardDiscount}%
                    </span>
                  )}
                </div>

                <p className="mb-1 text-xs uppercase tracking-wider text-muted-foreground">
                  {p.category}
                </p>

                <h3 className="mb-3 min-h-[48px] font-display text-lg font-bold">
                  {p.name}
                </h3>

                {p.rewardDiscount > 0 && (
                  <div className="mb-3 rounded-xl border border-success/30 bg-success/10 px-3 py-2 text-xs font-bold text-success">
                    🎁 Réduction roue appliquée : -{p.rewardDiscount}%
                  </div>
                )}

                <div className="mb-1 flex items-baseline gap-2">
                  <div className="flex flex-col">
  <span className="text-xs font-medium text-muted-foreground">
   <strong> À partir de</strong> 
  </span>

  <div className="mb-1 flex items-end gap-1">
  <span className="text-3xl font-bold gradient-text">
    {p.price}
  </span>

  <span className="mb-1 text-xl font-bold gradient-text">
    DT
  </span>
</div>
</div>
                </div>

                <Link to="/subscription/$slug" params={{ slug: p.slug }}>
                  <Button className="w-full border-0 gradient-primary text-primary-foreground">
                    Voir détails <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </Link>
              </div>
            </article>
          );
        })}
      </div>

      <div className="mt-24">
        <div className="mx-auto mb-12 max-w-2xl text-center">
          <div className="mb-4 inline-flex items-center gap-2 rounded-full px-3 py-1 text-xs font-medium text-primary glass">
            SOCIAL BOOST
          </div>

          <h2 className="mb-4 font-display text-4xl font-bold md:text-5xl">
            Boost Your <span className="gradient-text">Social Media</span>
          </h2>

          <p className="text-muted-foreground">
            Choose followers, views or likes packages separately.
          </p>
        </div>

        <SocialSection title="Followers" services={followersServices} />
        <SocialSection title="Views" services={viewsServices} />
        <SocialSection title="Likes" services={likesServices} />
      </div>
    </div>
  </section>
);
}