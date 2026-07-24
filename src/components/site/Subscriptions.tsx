import { useEffect, useMemo, useState } from "react";
import { getProducts } from "@/lib/products";
import { ArrowRight, Film, Flame, Gift, Sparkles } from "lucide-react";
import { Button } from "../ui/button";
import { Link } from "@tanstack/react-router";

import {
  calculateRewardPrice,
  canUseRewardOnProduct,
  consumeWheelReward,
  getWheelReward,
  WheelReward,
} from "@/lib/wheelReward";

type Plan = {
  name: string;
  slug: string;
  category: string;
  icon: React.ElementType;
  price: number;
  originalPrice: number;
  oldPrice: number;
  duration: string;
  accent: string;
  rewardDiscount: number;
};

type SocialService = {
  name: string;
  price: number;
  desc: string;
};

const followersServices: SocialService[] = [
  { name: "1K Followers", price: 10, desc: "Ideal for starting and giving your profile more credibility." },
  { name: "2K Followers", price: 15, desc: "A stronger boost for personal pages and small businesses." },
  { name: "10K Followers", price: 70, desc: "Perfect for influencers, creators and growing brands." },
  { name: "20K Followers", price: 120, desc: "High-impact growth package for serious social presence." },
  { name: "100K Followers", price: 500, desc: "Maximum visibility package for big pages and campaigns." },
];

const viewsServices: SocialService[] = [
  { name: "100K Views", price: 40, desc: "Boost your video reach and increase visibility quickly." },
  { name: "1 Million Views", price: 120, desc: "Massive exposure package for viral content and campaigns." },
];

const likesServices: SocialService[] = [
  { name: "1K Likes", price: 20, desc: "Improve post engagement and make your content look active." },
  { name: "10K Likes", price: 100, desc: "Great for campaigns, launches and high-performing posts." },
  { name: "100K Likes", price: 300, desc: "Premium engagement package for large-scale visibility." },
];

const baseCategories = [
  "All",
  "AI Tools",
  "Creative",
  "Streaming",
  "Productivity",
  "Education",
];

function parsePrice(value: unknown) {
  const normalized = String(value ?? "0")
    .replace(",", ".")
    .replace(/[^\d.]/g, "");
  const parsed = Number(normalized);
  return Number.isFinite(parsed) ? parsed : 0;
}

function formatPrice(price: number) {
  return Number.isInteger(price) ? String(price) : price.toFixed(2);
}

function addSocialToCart(
  service: SocialService,
  type: string,
  reward: WheelReward | null,
  onRewardUsed: () => void
) {
  const cart = JSON.parse(localStorage.getItem("cart") || "[]");
  const productName = `${service.name} (${type})`;

  const rewardCanBeUsed =
    reward !== null &&
    !reward.used &&
    canUseRewardOnProduct(reward, productName);

  const finalPrice = rewardCanBeUsed
    ? calculateRewardPrice(service.price, reward.percentage)
    : service.price;

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
          name: productName,
          price: finalPrice,
          originalPrice: service.price,
          duration: "Social Boost",
          quantity: 1,
          wheelReward: rewardCanBeUsed
            ? {
                id: reward.id,
                label: reward.label,
                percentage: reward.percentage,
              }
            : null,
        },
      ];

  localStorage.setItem("cart", JSON.stringify(updatedCart));

  if (rewardCanBeUsed) {
    consumeWheelReward(productName);
    onRewardUsed();
  }

  window.dispatchEvent(new Event("cart-updated"));

  alert(
    rewardCanBeUsed
      ? `Produit ajouté avec l'offre : ${reward.label}`
      : "Added to cart ✅"
  );
}

function SocialSection({
  title,
  services,
  wheelReward,
  onRewardUsed,
}: {
  title: string;
  services: SocialService[];
  wheelReward: WheelReward | null;
  onRewardUsed: () => void;
}) {
  return (
    <div className="mt-16">
      <h3 className="mb-6 font-display text-3xl font-bold">
        {title} <span className="gradient-text">Packages</span>
      </h3>

      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {services.map((service) => {
          const productName = `${service.name} (${title})`;
          const rewardCanBeUsed =
            wheelReward !== null &&
            !wheelReward.used &&
            canUseRewardOnProduct(wheelReward, productName);

          const displayedPrice = rewardCanBeUsed
            ? calculateRewardPrice(service.price, wheelReward.percentage)
            : service.price;

          return (
            <article
              key={service.name}
              className="group relative overflow-hidden rounded-3xl p-6 gradient-border hover-lift"
            >
              <div className="pointer-events-none absolute -right-10 -top-10 h-32 w-32 rounded-full bg-primary/10 blur-2xl transition group-hover:bg-accent/20" />

              <div className="relative z-10">
                <div className="mb-4 flex items-start justify-between gap-3">
                  <span className="inline-flex rounded-full border border-primary/30 bg-primary/10 px-3 py-1 text-xs font-bold text-primary">
                    {title}
                  </span>

                  {rewardCanBeUsed && (
                    <span className="rounded-full border border-success/30 bg-success/10 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-success">
                      🎁 -{wheelReward.percentage}%
                    </span>
                  )}
                </div>

                <h4 className="text-xl font-bold">{service.name}</h4>
                <p className="mt-3 min-h-[48px] text-sm leading-relaxed text-muted-foreground">
                  {service.desc}
                </p>

                {rewardCanBeUsed && (
                  <div className="mt-4 rounded-xl border border-success/30 bg-success/10 px-3 py-2 text-xs font-bold text-success">
                    🎁 Offre roue disponible
                  </div>
                )}

                <div className="mt-4 flex items-end gap-2">
                  <div className="text-3xl font-bold gradient-text">
                    {formatPrice(displayedPrice)} DT
                  </div>

                  {rewardCanBeUsed && (
                    <span className="mb-1 text-sm text-muted-foreground line-through">
                      {formatPrice(service.price)} DT
                    </span>
                  )}
                </div>

                <button
                  type="button"
                  className="mt-6 w-full rounded-xl py-2 gradient-primary text-white"
                  onClick={() =>
                    addSocialToCart(service, title, wheelReward, onRewardUsed)
                  }
                >
                  Add to Cart
                </button>
              </div>
            </article>
          );
        })}
      </div>
    </div>
  );
}

export function Subscriptions() {
  const [category, setCategory] = useState("All");
  const [sortBy, setSortBy] = useState("recommended");
  const [adminProducts, setAdminProducts] = useState<Record<string, any>>(() => getProducts());
  const [wheelReward, setWheelReward] = useState<WheelReward | null>(() => {
    const reward = getWheelReward();
    return reward && !reward.used ? reward : null;
  });

  const refreshReward = () => {
    const reward = getWheelReward();
    setWheelReward(reward && !reward.used ? reward : null);
  };

  const categories = useMemo(
    () => [
      ...new Set([
        ...baseCategories,
        ...Object.values(adminProducts)
          .map((product) => product.category)
          .filter(Boolean),
      ]),
    ],
    [adminProducts]
  );

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
    return () => window.removeEventListener("category-selected", handleCategorySelected);
  }, []);

  useEffect(() => {
    const refreshProducts = () => setAdminProducts(getProducts());
    refreshProducts();
    window.addEventListener("products-updated", refreshProducts);
    return () => window.removeEventListener("products-updated", refreshProducts);
  }, []);

  useEffect(() => {
    refreshReward();
    window.addEventListener("wheel-reward-updated", refreshReward);
    window.addEventListener("storage", refreshReward);

    return () => {
      window.removeEventListener("wheel-reward-updated", refreshReward);
      window.removeEventListener("storage", refreshReward);
    };
  }, []);

  const filteredPlans = useMemo<Plan[]>(() => {
    const result = Object.entries(adminProducts)
      .filter(([_, product]) => product.active)
      .map(([slug, product]) => {
        const originalPrice = parsePrice(product.pricesByDuration?.["1 month"]);
        const oldPrice = parsePrice(product.oldPrice);
        const rewardCanBeUsed =
          wheelReward !== null &&
          !wheelReward.used &&
          canUseRewardOnProduct(wheelReward, product.name);

        const rewardDiscount = rewardCanBeUsed ? wheelReward.percentage : 0;

        return {
          name: product.name,
          slug,
          category: product.category,
          icon: Film,
          price: rewardCanBeUsed
            ? calculateRewardPrice(originalPrice, rewardDiscount)
            : originalPrice,
          originalPrice,
          oldPrice,
          duration: "1 month",
          accent: "from-primary to-accent",
          rewardDiscount,
        };
      })
      .filter((plan) => category === "All" || plan.category === category);

    return [...result].sort((a, b) => {
      if (sortBy === "price-low") return a.price - b.price;
      if (sortBy === "price-high") return b.price - a.price;

      if (sortBy === "discount") {
        const discountA = a.oldPrice > 0 ? 1 - a.price / a.oldPrice : 0;
        const discountB = b.oldPrice > 0 ? 1 - b.price / b.oldPrice : 0;
        return discountB - discountA;
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

        {wheelReward && (
          <div className="mx-auto mb-10 max-w-4xl overflow-hidden rounded-3xl border border-primary/30 bg-primary/10 p-6 shadow-lg">
            <div className="flex flex-col items-center gap-4 text-center md:flex-row md:text-left">
              <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl gradient-primary">
                <Gift className="h-7 w-7 text-white" />
              </div>

              <div className="flex-1">
                <div className="mb-1 flex flex-wrap items-center justify-center gap-2 md:justify-start">
                  <Sparkles className="h-4 w-4 text-primary" />
                  <span className="text-xs font-bold uppercase tracking-wider text-primary">
                    Ton cadeau du mois
                  </span>
                </div>

                <h3 className="text-2xl font-bold gradient-text">{wheelReward.label}</h3>
                <p className="mt-1 text-sm text-muted-foreground">
                  L'offre sera appliquée une seule fois au premier produit compatible ajouté au panier.
                </p>
              </div>
            </div>
          </div>
        )}

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

          {hasActiveFilters && (
            <button
              type="button"
              onClick={resetFilters}
              className="mt-4 text-sm text-primary hover:text-foreground"
            >
              Reset filters
            </button>
          )}
        </div>

        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {filteredPlans.map((plan) => {
            const Icon = plan.icon;

            return (
              <article
                key={plan.slug}
                className="group relative overflow-hidden rounded-2xl p-6 gradient-border hover-lift"
              >
                <div className="pointer-events-none absolute inset-0 opacity-0 transition-smooth group-hover:opacity-100">
                  <div className="absolute -right-10 -top-10 h-32 w-32 rounded-full bg-primary/10 blur-2xl" />
                  <div className="absolute -bottom-10 -left-10 h-32 w-32 rounded-full bg-accent/10 blur-2xl" />
                </div>

                <div className="relative z-10">
                  <div className="mb-5 flex items-start justify-between gap-3">
                    <div className={`flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br ${plan.accent} shadow-lg`}>
                      <Icon className="h-6 w-6 text-primary-foreground" />
                    </div>

                    {plan.rewardDiscount > 0 && (
                      <span className="rounded-full border border-success/30 bg-success/10 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-success">
                        🎁 -{plan.rewardDiscount}%
                      </span>
                    )}
                  </div>

                  <p className="mb-1 text-xs uppercase tracking-wider text-muted-foreground">
                    {plan.category}
                  </p>

                  <h3 className="mb-3 min-h-[48px] font-display text-lg font-bold">
                    {plan.name}
                  </h3>

                  {plan.rewardDiscount > 0 && (
                    <div className="mb-3 rounded-xl border border-success/30 bg-success/10 px-3 py-2 text-xs font-bold text-success">
                      🎁 Offre roue disponible
                    </div>
                  )}

                  <div className="mb-5">
                    <span className="text-xs font-medium text-muted-foreground">
                      <strong>À partir de</strong>
                    </span>

                    <div className="mt-1 flex items-end gap-2">
                      <div className="flex items-end gap-1">
                        <span className="text-3xl font-bold gradient-text">
                          {formatPrice(plan.price)}
                        </span>
                        <span className="mb-1 text-xl font-bold gradient-text">DT</span>
                      </div>

                      {plan.rewardDiscount > 0 && (
                        <span className="mb-1 text-sm text-muted-foreground line-through">
                          {formatPrice(plan.originalPrice)} DT
                        </span>
                      )}
                    </div>
                  </div>

                  <Button asChild className="w-full border-0 gradient-primary text-primary-foreground">
                    <Link to="/subscription/$slug" params={{ slug: plan.slug }}>
                      Voir détails <ArrowRight className="ml-2 h-4 w-4" />
                    </Link>
                  </Button>
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

          <SocialSection
            title="Followers"
            services={followersServices}
            wheelReward={wheelReward}
            onRewardUsed={refreshReward}
          />
          <SocialSection
            title="Views"
            services={viewsServices}
            wheelReward={wheelReward}
            onRewardUsed={refreshReward}
          />
          <SocialSection
            title="Likes"
            services={likesServices}
            wheelReward={wheelReward}
            onRewardUsed={refreshReward}
          />
        </div>
      </div>
    </section>
  );
}
