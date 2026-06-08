import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { savePendingCart } from "@/lib/products";
import { useState, useEffect } from "react";
import { getProducts } from "@/lib/products";
import {
  ArrowLeft,
  Check,
  Clock,
  ShieldCheck,
  ShoppingCart,
  Sparkles,
} from "lucide-react";
import { Button } from "@/components/ui/button";

type Subscription = {
  name: string;
  price: string;
  oldPrice: string;
  duration: string;
  category: string;
  description: string;
  features: string[];
  active: boolean;
   pricesByDuration?: {
    "1 month": string;
    "6 months": string;
    "1 year": string;
  };
};

type CartItem = {
  slug: string;
  name: string;
  price: number;
  duration: string;
  quantity: number;
};

export const subscriptions= {
  "canva-pro": {
    name: "Canva Pro",
    price: "10 DT",
    oldPrice: "20 DT",
    duration: "1 year",
    category: "Creative",
    description: "Create professional designs, posts, logos and presentations with Canva Pro.",
    features: ["1 year access", "Premium templates", "Fast activation", "WhatsApp support"],
    active: true,
  },
  "chatgpt-business": {
    name: "ChatGPT Business",
    price: "30 DT",
    oldPrice: "60 DT",
    duration: "1 month",
    category: "AI Tools",
    description: "Premium AI assistant access for work, study, productivity and business tasks.",
    features: ["AI premium access", "Instant activation", "Secure local payment", "Support included"],
    active: true,
  },
  "capcut-pro": {
    name: "CapCut Pro",
    price: "15 DT",
    oldPrice: "30 DT",
    duration: "1 month",
    category: "Creative",
    description: "Edit videos with premium CapCut tools, effects, templates and export options.",
    features: ["Premium editing tools", "Fast activation", "Perfect for creators", "Support included"],
    active: true,
  },
  "adobe-creative-cloud-pro": {
    name: "Adobe Creative Cloud Pro",
    price: "40 DT",
    oldPrice: "80 DT",
    duration: "1 month",
    category: "Creative",
    description: "Professional creative tools for design, editing, photography and content creation.",
    features: ["Creative apps access", "Fast delivery", "Secure payment", "WhatsApp support"],
    active: true,
  },
  "netflix-shared": {
    name: "Netflix Shared",
    price: "15 DT",
    oldPrice: "30 DT",
    duration: "1 month",
    category: "Streaming",
    description: "Affordable Netflix shared access with quick activation and local support.",
    features: ["Shared profile access", "Fast delivery", "1 month duration", "Support included"],
    active: true,
  },
  "netflix-private": {
    name: "Netflix Private",
    price: "35 DT",
    oldPrice: "70 DT",
    duration: "1 month",
    category: "Streaming",
    description: "Private Netflix access for a smoother and more personal streaming experience.",
    features: ["Private access", "Instant activation", "Secure payment", "Support included"],
    active: true,
  },
  "netflix-essential": {
    name: "Netflix Essential",
    price: "25 DT",
    oldPrice: "50 DT",
    duration: "1 month",
    category: "Streaming",
    description: "Essential Netflix access with reliable activation and friendly support.",
    features: ["Essential access", "Fast activation", "1 month duration", "WhatsApp support"],
    active: true,
  },
  "iptv-dream-4k": {
    name: "IPTV Dream 4K",
    price: "90 DT",
    oldPrice: "150 DT",
    duration: "1 year",
    category: "Streaming",
    description: "Enjoy IPTV Dream 4K for sports, movies, series and entertainment channels.",
    features: ["4K streaming", "1 year access", "Fast setup", "Support included"],
    active: true,
  },
  "youtube-premium": {
    name: "YouTube Premium",
    price: "20 DT",
    oldPrice: "40 DT",
    duration: "1 month",
    category: "Streaming",
    description: "Watch YouTube without ads and enjoy premium features.",
    features: ["Ad-free YouTube", "Background play", "Fast activation", "Support included"],
    active: true,
  },
  "spotify-premium": {
    name: "Spotify Premium",
    price: "40 DT",
    oldPrice: "70 DT",
    duration: "1 year",
    category: "Streaming",
    description: "Enjoy unlimited music with Spotify Premium for one year.",
    features: ["1 year access", "Music premium", "Fast activation", "Support included"],
    active: true,
  },
  "linkedin-career": {
    name: "LinkedIn Career",
    price: "50 DT",
    oldPrice: "90 DT",
    duration: "3 months",
    category: "Productivity",
    description: "Boost your career with LinkedIn premium career tools.",
    features: ["3 months access", "Career insights", "Learning features", "Support included"],
    active: true,
  },
  "linkedin-business": {
    name: "LinkedIn Business",
    price: "100 DT",
    oldPrice: "180 DT",
    duration: "3 months",
    category: "Productivity",
    description: "LinkedIn Business access for networking, prospecting and professional growth.",
    features: ["3 months access", "Business tools", "Premium insights", "Support included"],
    active: true,
  },
  "microsoft-office-professional-plus": {
    name: "Microsoft Office Professional Plus",
    price: "80 DT",
    oldPrice: "140 DT",
    duration: "1 year",
    category: "Productivity",
    description: "Professional Microsoft Office tools for documents, spreadsheets and presentations.",
    features: ["Office apps access", "1 year duration", "Fast activation", "Support included"],
    active: true,
  },
  "coursera-plus": {
    name: "Coursera Plus",
    price: "90 DT",
    oldPrice: "160 DT",
    duration: "1 year",
    category: "Education",
    description: "Learn new skills with Coursera Plus and access premium learning content.",
    features: ["1 year access", "Premium courses", "Learning certificates", "Support included"],
    active: true,
  },
} satisfies Record<string, Subscription>;

export const Route = createFileRoute("/subscription/$slug")({
  component: SubscriptionDetails,
});

function priceToNumber(price: string) {
  return Number(price.replace("DT", "").trim());
}

function getDiscount(price: string, oldPrice: string) {
  const current = priceToNumber(price);
  const old = priceToNumber(oldPrice);
  return Math.round((1 - current / old) * 100);
}

function getCart() {
  try {
    const storedCart = localStorage.getItem("cart");
    return storedCart ? (JSON.parse(storedCart) as CartItem[]) : [];
  } catch {
    return [];
  }
}

function saveCart(cart: CartItem[]) {
  localStorage.setItem("cart", JSON.stringify(cart));
  savePendingCart(cart);
  window.dispatchEvent(new Event("cart-updated"));
}
function SubscriptionDetails() {
  const { slug } = Route.useParams();
  const navigate = useNavigate();

  const products = getProducts();
const subscription = products[slug];

  const [selectedDuration, setSelectedDuration] = useState<
    "1 month" | "6 months" | "1 year"
  >("1 month");

  if (!subscription) {
    return (

      <main className="flex min-h-screen items-center justify-center bg-background px-6 text-foreground">
        <div className="gradient-border max-w-md rounded-3xl p-8 text-center">
          <h1 className="mb-3 text-3xl font-bold">Subscription not found</h1>
          <p className="mb-6 text-sm text-muted-foreground">
            This offer does not exist or may have been removed.
          </p>
          <Link to="/">
            <Button className="border-0 gradient-primary text-primary-foreground">
              Back home
            </Button>
          </Link>
        </div>
      </main>
    );
    const pricesByDuration = subscription.pricesByDuration;

const selectedPrice =
  pricesByDuration[selectedDuration];

const selectedOldPrice =
  subscription.oldPrice;

const discount =
  getDiscount(selectedPrice, selectedOldPrice);

  }

  if (!subscription.active) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-background px-6 text-foreground">
        <div className="gradient-border max-w-md rounded-3xl p-8 text-center">
          <h1 className="mb-3 text-3xl font-bold">Produit indisponible</h1>
          <p className="mb-6 text-sm text-muted-foreground">
            Ce produit est actuellement invisible.
          </p>
          <Link to="/">
            <Button>Back home</Button>
          </Link>
        </div>
      </main>
    );
  }

  
  const pricesByDuration =
  (subscription as any)?.pricesByDuration || {};

const selectedPrice =
  pricesByDuration[selectedDuration] ||
  pricesByDuration["1 month"] ||
  "0 DT";

console.log(
  "selectedDuration =",
  selectedDuration
);

console.log(
  "selectedPrice =",
  selectedPrice
);
  const addToCart = () => {
    const cart = getCart();

    const cartSlug = `${slug}-${selectedDuration.replaceAll(" ", "-")}`;

    const existingItem = cart.find((item) => item.slug === cartSlug);

    const updatedCart = existingItem
      ? cart.map((item) =>
          item.slug === cartSlug
            ? { ...item, quantity: item.quantity + 1 }
            : item
        )
      : [
          ...cart,
          {
            slug: cartSlug,
            name: `${subscription.name} - ${selectedDuration}`,
            price: priceToNumber(selectedPrice),
            duration: selectedDuration,
            quantity: 1,
          },
        ];

    saveCart(updatedCart);
    navigate({ to: "/cart" });
  };

  return (
    <main className="min-h-screen overflow-hidden bg-background px-6 py-24 text-foreground">
      <div className="pointer-events-none fixed inset-0 bg-grid opacity-20" />
      <div className="pointer-events-none fixed left-10 top-24 h-72 w-72 rounded-full bg-primary/10 blur-3xl" />
      <div className="pointer-events-none fixed bottom-10 right-10 h-72 w-72 rounded-full bg-accent/10 blur-3xl" />

      <div className="relative mx-auto max-w-6xl">
        <Link
          to="/"
          className="mb-8 inline-flex items-center gap-2 rounded-full border border-border/70 px-4 py-2 text-sm text-muted-foreground transition-smooth hover:border-primary/40 hover:text-primary"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to home
        </Link>

        <div className="gradient-border relative overflow-hidden rounded-3xl p-6 md:p-10">
          <div className="pointer-events-none absolute inset-0 bg-gradient-to-br from-white/5 via-transparent to-primary/5" />

          <div className="relative z-10 grid gap-10 lg:grid-cols-[1.25fr_0.75fr]">
            <div>
              <div className="mb-5 flex flex-wrap items-center gap-3">
                <span className="inline-flex items-center gap-2 rounded-full bg-primary/10 px-4 py-1.5 text-sm font-medium text-primary">
                  <Sparkles className="h-4 w-4" />
                  {subscription.category}
                </span>

                
              </div>

              <h1 className="mb-5 font-display text-4xl font-bold leading-tight md:text-6xl">
                {subscription.name}
              </h1>

              <p className="mb-8 max-w-2xl text-base leading-relaxed text-muted-foreground md:text-lg">
                {subscription.description}
              </p>

              <div className="mb-8 grid gap-4 sm:grid-cols-2">
                <div className="glass rounded-2xl p-4">
                  <div className="mb-2 flex items-center gap-2 text-sm font-semibold">
                    <Clock className="h-4 w-4 text-primary" />
                    Duration
                  </div>
                  <p className="text-sm text-muted-foreground">
                    {selectedDuration}
                  </p>
                </div>

                <div className="glass rounded-2xl p-4">
                  <div className="mb-2 flex items-center gap-2 text-sm font-semibold">
                    <ShieldCheck className="h-4 w-4 text-primary" />
                    Guarantee
                  </div>
                  <p className="text-sm text-muted-foreground">
                    Secure activation and support included.
                  </p>
                </div>
              </div>

              <ul className="grid gap-4 sm:grid-cols-2">
                {subscription.features.map((feature) => (
                  <li key={feature} className="flex items-start gap-3 text-sm">
                    <span className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-primary/20">
                      <Check className="h-3.5 w-3.5 text-primary" />
                    </span>
                    <span className="leading-relaxed text-muted-foreground">
                      {feature}
                    </span>
                  </li>
                ))}
              </ul>
            </div>

            <aside className="glass h-fit rounded-3xl p-6 shadow-card">
              <p className="mb-2 text-sm text-muted-foreground">
                Starting from
              </p>

              <div className="mb-2 flex items-end gap-3">
                <span className="gradient-text text-5xl font-bold md:text-6xl">
                  {selectedPrice}
                </span>
              </div>

              <div className="mb-6">
                <p className="mb-3 text-sm font-semibold">Choisir la durée</p>

                <div className="grid gap-3">
                  {(["1 month", "6 months", "1 year"] as const).map(
                    (duration) => (
                      <button
                        key={duration}
                        type="button"
                        onClick={() => setSelectedDuration(duration)}
                        className={`rounded-xl border p-3 text-left transition ${
                          selectedDuration === duration
                            ? "border-primary bg-primary/10 text-primary"
                            : "border-border bg-background/30"
                        }`}
                      >
                        <div className="flex justify-between">
                          <span>{duration}</span>
                          <strong>
                            {pricesByDuration?.[duration] ?? "0 DT"}
                          </strong>
                        </div>
                      </button>
                    )
                  )}
                </div>
              </div>

              <Button
                onClick={addToCart}
                className="h-12 w-full border-0 gradient-primary text-primary-foreground hover:opacity-90 glow-primary"
              >
                <ShoppingCart className="mr-2 h-4 w-4" />
                Ajouter au panier
              </Button>

              <div className="mt-5 space-y-3 border-t border-border/60 pt-5 text-sm text-muted-foreground">
                <p>✓ Activation rapide après confirmation du paiement</p>
                <p>✓ Support WhatsApp disponible</p>
                <p>✓ Paiement local sécurisé</p>
              </div>
            </aside>
          </div>
        </div>
      </div>
    </main>
  );
};