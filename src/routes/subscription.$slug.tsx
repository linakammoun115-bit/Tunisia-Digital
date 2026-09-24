```tsx
import {
  createFileRoute,
  Link,
  useNavigate,
} from "@tanstack/react-router";
import { savePendingCart, getProducts } from "@/lib/products";
import { useEffect, useState } from "react";
import {
  ArrowLeft,
  Check,
  Clock,
  Gift,
  ShieldCheck,
  ShoppingCart,
  Sparkles,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  calculateRewardPrice,
  canUseRewardOnProduct,
  getWheelReward,
} from "@/lib/wheelReward";

/* =========================================================
   TYPES
========================================================= */

type DurationKey =
  | "1 month"
  | "2 months"
  | "3 months"
  | "6 months"
  | "1 year";

type Subscription = {
  name: string;
  price: string;
  oldPrice: string;
  duration: string;
  category: string;
  description: string;
  features: string[];
  active: boolean;

  pricesByDuration?: Partial<
    Record<DurationKey, string>
  >;
};

type CartItem = {
  slug: string;
  name: string;
  price: number;
  originalPrice: number;
  duration: string;
  quantity: number;

  wheelReward?: {
    id: string;
    label: string;
    percentage: number;
  } | null;
};

/* =========================================================
   ANCIENS PRODUITS / FALLBACK
========================================================= */

export const subscriptions = {
  "canva-pro": {
    name: "Canva Pro",
    price: "10 DT",
    oldPrice: "20 DT",
    duration: "1 year",
    category: "Creative",
    description:
      "Create professional designs, posts, logos and presentations with Canva Pro.",
    features: [
      "1 year access",
      "Premium templates",
      "Fast activation",
      "WhatsApp support",
    ],
    active: true,
  },

  "chatgpt-business": {
    name: "ChatGPT Business",
    price: "30 DT",
    oldPrice: "60 DT",
    duration: "1 month",
    category: "AI Tools",
    description:
      "Premium AI assistant access for work, study, productivity and business tasks.",
    features: [
      "AI premium access",
      "Instant activation",
      "Secure local payment",
      "Support included",
    ],
    active: true,
  },

  "capcut-pro": {
    name: "CapCut Pro",
    price: "15 DT",
    oldPrice: "30 DT",
    duration: "1 month",
    category: "Creative",
    description:
      "Edit videos with premium CapCut tools, effects, templates and export options.",
    features: [
      "Premium editing tools",
      "Fast activation",
      "Perfect for creators",
      "Support included",
    ],
    active: true,
  },

  "adobe-creative-cloud-pro": {
    name: "Adobe Creative Cloud Pro",
    price: "40 DT",
    oldPrice: "80 DT",
    duration: "1 month",
    category: "Creative",
    description:
      "Professional creative tools for design, editing, photography and content creation.",
    features: [
      "Creative apps access",
      "Fast delivery",
      "Secure payment",
      "WhatsApp support",
    ],
    active: true,
  },

  "netflix-shared": {
    name: "Netflix Shared",
    price: "15 DT",
    oldPrice: "30 DT",
    duration: "1 month",
    category: "Streaming",
    description:
      "Affordable Netflix shared access with quick activation and local support.",
    features: [
      "Shared profile access",
      "Fast delivery",
      "1 month duration",
      "Support included",
    ],
    active: true,
  },

  "netflix-private": {
    name: "Netflix Private",
    price: "35 DT",
    oldPrice: "70 DT",
    duration: "1 month",
    category: "Streaming",
    description:
      "Private Netflix access for a smoother and more personal streaming experience.",
    features: [
      "Private access",
      "Instant activation",
      "Secure payment",
      "Support included",
    ],
    active: true,
  },

  "netflix-essential": {
    name: "Netflix Essential",
    price: "25 DT",
    oldPrice: "50 DT",
    duration: "1 month",
    category: "Streaming",
    description:
      "Essential Netflix access with reliable activation and friendly support.",
    features: [
      "Essential access",
      "Fast activation",
      "1 month duration",
      "WhatsApp support",
    ],
    active: true,
  },

  "iptv-dream-4k": {
    name: "IPTV Dream 4K",
    price: "90 DT",
    oldPrice: "150 DT",
    duration: "1 year",
    category: "Streaming",
    description:
      "Enjoy IPTV Dream 4K for sports, movies, series and entertainment channels.",
    features: [
      "4K streaming",
      "1 year access",
      "Fast setup",
      "Support included",
    ],
    active: true,
  },

  "youtube-premium": {
    name: "YouTube Premium",
    price: "20 DT",
    oldPrice: "40 DT",
    duration: "1 month",
    category: "Streaming",
    description:
      "Watch YouTube without ads and enjoy premium features.",
    features: [
      "Ad-free YouTube",
      "Background play",
      "Fast activation",
      "Support included",
    ],
    active: true,
  },

  "spotify-premium": {
    name: "Spotify Premium",
    price: "40 DT",
    oldPrice: "70 DT",
    duration: "1 year",
    category: "Streaming",
    description:
      "Enjoy unlimited music with Spotify Premium for one year.",
    features: [
      "1 year access",
      "Music premium",
      "Fast activation",
      "Support included",
    ],
    active: true,
  },

  "linkedin-career": {
    name: "LinkedIn Career",
    price: "50 DT",
    oldPrice: "90 DT",
    duration: "3 months",
    category: "Productivity",
    description:
      "Boost your career with LinkedIn premium career tools.",
    features: [
      "3 months access",
      "Career insights",
      "Learning features",
      "Support included",
    ],
    active: true,
  },

  "linkedin-business": {
    name: "LinkedIn Business",
    price: "100 DT",
    oldPrice: "180 DT",
    duration: "3 months",
    category: "Productivity",
    description:
      "LinkedIn Business access for networking, prospecting and professional growth.",
    features: [
      "3 months access",
      "Business tools",
      "Premium insights",
      "Support included",
    ],
    active: true,
  },

  "microsoft-office-professional-plus": {
    name: "Microsoft Office Professional Plus",
    price: "80 DT",
    oldPrice: "140 DT",
    duration: "1 year",
    category: "Productivity",
    description:
      "Professional Microsoft Office tools for documents, spreadsheets and presentations.",
    features: [
      "Office apps access",
      "1 year duration",
      "Fast activation",
      "Support included",
    ],
    active: true,
  },

  "coursera-plus": {
    name: "Coursera Plus",
    price: "90 DT",
    oldPrice: "160 DT",
    duration: "1 year",
    category: "Education",
    description:
      "Learn new skills with Coursera Plus and access premium learning content.",
    features: [
      "1 year access",
      "Premium courses",
      "Learning certificates",
      "Support included",
    ],
    active: true,
  },
} satisfies Record<string, Subscription>;

/* =========================================================
   ROUTE
========================================================= */

export const Route = createFileRoute("/subscription/$slug")({
  component: SubscriptionDetails,
});

/* =========================================================
   HELPERS
========================================================= */

function priceToNumber(
  price: string | number | undefined | null
) {
  const normalized = String(price ?? "0")
    .replace(",", ".")
    .replace(/[^\d.]/g, "");

  const parsed = Number(normalized);

  return Number.isFinite(parsed) ? parsed : 0;
}

function formatPrice(price: number) {
  return Number.isInteger(price)
    ? String(price)
    : price.toFixed(2);
}

function getCart(): CartItem[] {
  try {
    const storedCart = localStorage.getItem("cart");

    if (!storedCart) {
      return [];
    }

    const parsed = JSON.parse(storedCart);

    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function saveCart(cart: CartItem[]) {
  localStorage.setItem(
    "cart",
    JSON.stringify(cart)
  );

  savePendingCart(cart);

  window.dispatchEvent(
    new Event("cart-updated")
  );
}

/* =========================================================
   DURATION OPTIONS
========================================================= */

const durationOptions: {
  key: DurationKey;
  label: string;
}[] = [
  {
    key: "1 month",
    label: "1 mois",
  },
  {
    key: "2 months",
    label: "2 mois",
  },
  {
    key: "3 months",
    label: "3 mois",
  },
  {
    key: "6 months",
    label: "6 mois",
  },
  {
    key: "1 year",
    label: "1 an",
  },
];

/* =========================================================
   PAGE
========================================================= */

function SubscriptionDetails() {
  const { slug } = Route.useParams();
  const navigate = useNavigate();

  const [products, setProducts] = useState<
    Record<string, Subscription>
  >({});

  const [productsLoading, setProductsLoading] =
    useState(true);

  const [productsError, setProductsError] =
    useState<string | null>(null);

  const [selectedDuration, setSelectedDuration] =
    useState<DurationKey>("1 month");

  /* =========================================================
     LOAD PRODUCTS
  ========================================================= */

  useEffect(() => {
    let cancelled = false;

    const loadProducts = async () => {
      try {
        setProductsLoading(true);
        setProductsError(null);

        const loadedProducts = await getProducts();

        if (cancelled) {
          return;
        }

        setProducts(
          loadedProducts as Record<
            string,
            Subscription
          >
        );
      } catch (error) {
        if (cancelled) {
          return;
        }

        console.error(
          "Erreur chargement produits:",
          error
        );

        setProductsError(
          error instanceof Error
            ? error.message
            : String(error)
        );
      } finally {
        if (!cancelled) {
          setProductsLoading(false);
        }
      }
    };

    void loadProducts();

    return () => {
      cancelled = true;
    };
  }, []);

  /* =========================================================
     PRODUCT
  ========================================================= */

  const subscription =
    products[slug];

  /* =========================================================
     PRICES
     
     On calcule les prix même si le produit n'est pas encore
     chargé. Cela permet de garder tous les hooks avant
     les return conditionnels.
  ========================================================= */

  const pricesByDuration: Record<
    DurationKey,
    string
  > = {
    "1 month":
      subscription?.pricesByDuration?.[
        "1 month"
      ] ?? subscription?.price ?? "0 DT",

    "2 months":
      subscription?.pricesByDuration?.[
        "2 months"
      ] ?? "0 DT",

    "3 months":
      subscription?.pricesByDuration?.[
        "3 months"
      ] ?? "0 DT",

    "6 months":
      subscription?.pricesByDuration?.[
        "6 months"
      ] ?? "0 DT",

    "1 year":
      subscription?.pricesByDuration?.[
        "1 year"
      ] ?? "0 DT",
  };

  /* =========================================================
     AVAILABLE DURATIONS
     
     0 DT = indisponible
  ========================================================= */

  const availableDurations =
    durationOptions.filter(
      ({ key }) =>
        priceToNumber(
          pricesByDuration[key]
        ) > 0
    );

  /* =========================================================
     FIND CHEAPEST AVAILABLE DURATION
     
     On cherche toujours le plus petit prix > 0.
  ========================================================= */

  const cheapestDuration =
    availableDurations.length > 0
      ? availableDurations.reduce(
          (cheapest, current) => {
            const cheapestPrice =
              priceToNumber(
                pricesByDuration[
                  cheapest.key
                ]
              );

            const currentPrice =
              priceToNumber(
                pricesByDuration[
                  current.key
                ]
              );

            return currentPrice <
              cheapestPrice
              ? current
              : cheapest;
          }
        )
      : null;

  /* =========================================================
     PRICE SIGNATURE
     
     Permet de détecter un changement de prix après le
     chargement du produit.
  ========================================================= */

 const priceSignature =
  durationOptions
    .map(
      ({ key }) =>
        key + ":" + pricesByDuration[key]
    )
    .join("|");

  /* =========================================================
     SELECT CHEAPEST DURATION AUTOMATICALLY
     
     IMPORTANT :
     Ce hook est AVANT tous les return.
     
     Il sélectionne le prix minimum au chargement.
     Ensuite l'utilisateur peut choisir une autre durée
     sans que la sélection soit écrasée.
  ========================================================= */

 useEffect(() => {
  if (!cheapestDuration) {
    return;
  }

  const selectedIsAvailable =
    availableDurations.some(
      ({ key }) => key === selectedDuration
    );

  if (!selectedIsAvailable) {
    setSelectedDuration(
      cheapestDuration.key
    );
  }
}, [
  priceSignature,
  cheapestDuration?.key,
  selectedDuration,
]);
    }
  }, [
    priceSignature,
    cheapestDuration?.key,
    selectedDuration,
  ]);

  /* =========================================================
     LOADING
  ========================================================= */

  if (productsLoading) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-background px-6 text-foreground">
        <div className="gradient-border rounded-3xl p-8 text-center">
          <div className="mx-auto mb-4 h-10 w-10 animate-spin rounded-full border-4 border-primary/20 border-t-primary" />

          <h1 className="text-xl font-bold">
            Chargement du produit...
          </h1>

          <p className="mt-2 text-sm text-muted-foreground">
            Veuillez patienter.
          </p>
        </div>
      </main>
    );
  }

  /* =========================================================
     ERROR
  ========================================================= */

  if (productsError) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-background px-6 text-foreground">
        <div className="gradient-border max-w-md rounded-3xl p-8 text-center">
          <h1 className="mb-3 text-3xl font-bold">
            Erreur de chargement
          </h1>

          <p className="mb-6 text-sm text-muted-foreground">
            Impossible de charger les produits.
          </p>

          <p className="mb-6 rounded-xl bg-destructive/10 p-3 text-xs text-destructive">
            {productsError}
          </p>

          <Link to="/">
            <Button className="border-0 gradient-primary text-primary-foreground">
              Retour à l'accueil
            </Button>
          </Link>
        </div>
      </main>
    );
  }

  /* =========================================================
     PRODUCT NOT FOUND
  ========================================================= */

  if (!subscription) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-background px-6 text-foreground">
        <div className="gradient-border max-w-md rounded-3xl p-8 text-center">
          <h1 className="mb-3 text-3xl font-bold">
            Produit introuvable
          </h1>

          <p className="mb-3 text-sm text-muted-foreground">
            Ce produit n'existe pas ou a été supprimé.
          </p>

          <p className="mb-6 rounded-xl bg-muted p-3 text-xs text-muted-foreground break-all">
            ID demandé : {slug}
          </p>

          <Link to="/">
            <Button className="border-0 gradient-primary text-primary-foreground">
              Retour à l'accueil
            </Button>
          </Link>
        </div>
      </main>
    );
  }

  /* =========================================================
     PRODUCT DISABLED
  ========================================================= */

  if (!subscription.active) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-background px-6 text-foreground">
        <div className="gradient-border max-w-md rounded-3xl p-8 text-center">
          <h1 className="mb-3 text-3xl font-bold">
            Produit indisponible
          </h1>

          <p className="mb-6 text-sm text-muted-foreground">
            Ce produit est actuellement invisible.
          </p>

          <Link to="/">
            <Button>
              Retour à l'accueil
            </Button>
          </Link>
        </div>
      </main>
    );
  }

  /* =========================================================
     NO AVAILABLE DURATION
  ========================================================= */

  if (
    availableDurations.length === 0
  ) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-background px-6 text-foreground">
        <div className="gradient-border max-w-md rounded-3xl p-8 text-center">
          <h1 className="mb-3 text-3xl font-bold">
            Produit indisponible
          </h1>

          <p className="mb-6 text-sm text-muted-foreground">
            Ce produit ne possède actuellement
            aucune durée disponible.
          </p>

          <Link to="/">
            <Button className="border-0 gradient-primary text-primary-foreground">
              Retour à l'accueil
            </Button>
          </Link>
        </div>
      </main>
    );
  }

  /* =========================================================
     SELECTED PRICE
  ========================================================= */

  const selectedPriceText =
    pricesByDuration[
      selectedDuration
    ] ?? "0 DT";

  const originalPrice =
    priceToNumber(
      selectedPriceText
    );

  /* =========================================================
     WHEEL REWARD
  ========================================================= */

  const reward =
    getWheelReward();

  const rewardCanBeUsed =
    reward !== null &&
    !reward.used &&
    canUseRewardOnProduct(
      reward,
      subscription.name
    );

  const displayedPrice =
    rewardCanBeUsed && reward
      ? calculateRewardPrice(
          originalPrice,
          reward.percentage
        )
      : originalPrice;

  /* =========================================================
     ADD TO CART
  ========================================================= */

  const addToCart = () => {
    /*
     * Sécurité :
     * impossible d'ajouter une durée à 0 DT.
     */

    if (
      priceToNumber(
        pricesByDuration[
          selectedDuration
        ]
      ) <= 0
    ) {
      window.alert(
        "Cette durée n'est pas disponible."
      );

      return;
    }

    const currentReward =
      getWheelReward();

    const canApplyReward =
      currentReward !== null &&
      !currentReward.used &&
      canUseRewardOnProduct(
        currentReward,
        subscription.name
      );

    const finalPrice =
      canApplyReward &&
      currentReward
        ? calculateRewardPrice(
            originalPrice,
            currentReward.percentage
          )
        : originalPrice;

    const cart =
      getCart();

    /*
     * Chaque durée possède son propre article
     * dans le panier.
     */

    const cartSlug =
      `${slug}-${selectedDuration.replaceAll(
        " ",
        "-"
      )}`;

    const existingItem =
      cart.find(
        (item) =>
          item.slug === cartSlug
      );

    const updatedCart: CartItem[] =
      existingItem
        ? cart.map((item) => {
            if (
              item.slug !==
              cartSlug
            ) {
              return item;
            }

            if (
              canApplyReward &&
              currentReward &&
              !item.wheelReward
            ) {
              return {
                ...item,
                price:
                  finalPrice,
                originalPrice,
                wheelReward: {
                  id:
                    currentReward.id,
                  label:
                    currentReward.label,
                  percentage:
                    currentReward.percentage,
                },
              };
            }

            return {
              ...item,
              quantity:
                item.quantity + 1,
            };
          })
        : [
            ...cart,
            {
              slug:
                cartSlug,

              name:
                subscription.name,

              price:
                finalPrice,

              originalPrice,

              duration:
                selectedDuration,

              quantity: 1,

              wheelReward:
                canApplyReward &&
                currentReward
                  ? {
                      id:
                        currentReward.id,
                      label:
                        currentReward.label,
                      percentage:
                        currentReward.percentage,
                    }
                  : null,
            },
          ];

    saveCart(
      updatedCart
    );

    navigate({
      to: "/cart",
    });
  };

  /* =========================================================
     UI
  ========================================================= */

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
            {/* LEFT */}

            <div>
              <div className="mb-5 flex flex-wrap items-center gap-3">
                <span className="inline-flex items-center gap-2 rounded-full bg-primary/10 px-4 py-1.5 text-sm font-medium text-primary">
                  <Sparkles className="h-4 w-4" />

                  {subscription.category}
                </span>

                {rewardCanBeUsed &&
                  reward && (
                    <span className="inline-flex items-center gap-2 rounded-full border border-success/30 bg-success/10 px-4 py-1.5 text-sm font-bold text-success">
                      <Gift className="h-4 w-4" />

                      -{reward.percentage}%
                      roue
                    </span>
                  )}
              </div>

              <h1 className="mb-5 font-display text-4xl font-bold leading-tight md:text-6xl">
                {subscription.name}
              </h1>

              <p className="mb-8 max-w-2xl text-base leading-relaxed text-muted-foreground md:text-lg">
                {subscription.description}
              </p>

              {/* INFO */}

              <div className="mb-8 grid gap-4 sm:grid-cols-2">
                <div className="glass rounded-2xl p-4">
                  <div className="mb-2 flex items-center gap-2 text-sm font-semibold">
                    <Clock className="h-4 w-4 text-primary" />

                    Duration
                  </div>

                  <p className="text-sm text-muted-foreground">
                    {
                      durationOptions.find(
                        (item) =>
                          item.key ===
                          selectedDuration
                      )?.label
                    }
                  </p>
                </div>

                <div className="glass rounded-2xl p-4">
                  <div className="mb-2 flex items-center gap-2 text-sm font-semibold">
                    <ShieldCheck className="h-4 w-4 text-primary" />

                    Guarantee
                  </div>

                  <p className="text-sm text-muted-foreground">
                    Secure activation and
                    support included.
                  </p>
                </div>
              </div>

              {/* FEATURES */}

              <ul className="grid gap-4 sm:grid-cols-2">
                {subscription.features.map(
                  (feature: string) => (
                    <li
                      key={feature}
                      className="flex items-start gap-3 text-sm"
                    >
                      <span className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-primary/20">
                        <Check className="h-3.5 w-3.5 text-primary" />
                      </span>

                      <span className="leading-relaxed text-muted-foreground">
                        {feature}
                      </span>
                    </li>
                  )
                )}
              </ul>
            </div>

            {/* RIGHT */}

            <aside className="glass h-fit rounded-3xl p-6 shadow-card">
              <p className="mb-2 text-sm text-muted-foreground">
                À partir de
              </p>

              {/* PRICE */}

              <div className="mb-2 flex items-end gap-3">
                <span className="gradient-text text-5xl font-bold md:text-6xl">
                  {formatPrice(
                    displayedPrice
                  )}{" "}
                  DT
                </span>

                {rewardCanBeUsed && (
                  <span className="mb-2 text-lg text-muted-foreground line-through">
                    {formatPrice(
                      originalPrice
                    )}{" "}
                    DT
                  </span>
                )}
              </div>

              {/* REWARD */}

              {rewardCanBeUsed &&
                reward && (
                  <div className="mb-5 rounded-xl border border-success/30 bg-success/10 px-3 py-2 text-sm font-bold text-success">
                    🎁{" "}
                    {reward.label}{" "}
                    sera appliquée
                    dans le panier
                  </div>
                )}

              {/* DURATIONS */}

              <div className="mb-6">
                <p className="mb-3 text-sm font-semibold">
                  Choisir la durée
                </p>

                <div className="grid gap-3">
                  {availableDurations.map(
                    ({
                      key,
                      label,
                    }) => {
                      const durationPrice =
                        priceToNumber(
                          pricesByDuration[
                            key
                          ]
                        );

                      return (
                        <button
                          key={key}
                          type="button"
                          onClick={() =>
                            setSelectedDuration(
                              key
                            )
                          }
                          className={`rounded-xl border p-3 text-left transition ${
                            selectedDuration ===
                            key
                              ? "border-primary bg-primary/10 text-primary"
                              : "border-border bg-background/30"
                          }`}
                        >
                          <div className="flex items-center justify-between gap-3">
                            <span>
                              {label}
                            </span>

                            <strong>
                              {formatPrice(
                                durationPrice
                              )}{" "}
                              DT
                            </strong>
                          </div>
                        </button>
                      );
                    }
                  )}
                </div>
              </div>

              {/* ADD CART */}

              <Button
                onClick={addToCart}
                className="h-12 w-full border-0 gradient-primary text-primary-foreground hover:opacity-90 glow-primary"
              >
                <ShoppingCart className="mr-2 h-4 w-4" />

                Ajouter au panier
              </Button>

              {/* FOOTER INFO */}

              <div className="mt-5 space-y-3 border-t border-border/60 pt-5 text-sm text-muted-foreground">
                <p>
                  ✓ Activation rapide
                  après confirmation
                  du paiement
                </p>

                <p>
                  ✓ Support WhatsApp
                  disponible
                </p>

                <p>
                  ✓ Paiement local
                  sécurisé
                </p>
              </div>
            </aside>
          </div>
        </div>
      </div>
    </main>
  );
}
```
