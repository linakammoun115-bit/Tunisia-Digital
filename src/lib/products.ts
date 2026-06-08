export type DurationKey = "1 month" | "6 months" | "1 year";

export type DurationPrice = Record<DurationKey, string>;

export type Subscription = {
  name: string;
  oldPrice: string;
  duration: DurationKey;
  category: string;
  description: string;
  features: string[];
  active: boolean;
  pricesByDuration: DurationPrice;
};

const makePrices = (
  oneMonth: string,
  sixMonths: string,
  oneYear: string
): DurationPrice => ({
  "1 month": oneMonth,
  "6 months": sixMonths,
  "1 year": oneYear,
});

export const defaultSubscriptions: Record<string, Subscription> = {
  "canva-pro": {
    name: "Canva Pro",
    oldPrice: "25 DT",
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
    pricesByDuration: makePrices("10 DT", "55 DT", "99 DT"),
  },

  "chatgpt-business": {
    name: "ChatGPT Business",
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
    pricesByDuration: makePrices("30 DT", "150 DT", "250 DT"),
  },

  "capcut-pro": {
    name: "CapCut Pro",
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
    pricesByDuration: makePrices("15 DT", "75 DT", "120 DT"),
  },

  "adobe-creative-cloud-pro": {
    name: "Adobe Creative Cloud Pro",
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
    pricesByDuration: makePrices("40 DT", "200 DT", "350 DT"),
  },

  "netflix-shared": {
    name: "Netflix Shared",
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
    pricesByDuration: makePrices("15 DT", "75 DT", "120 DT"),
  },

  "netflix-private": {
    name: "Netflix Private",
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
    pricesByDuration: makePrices("35 DT", "180 DT", "300 DT"),
  },

  "netflix-essential": {
    name: "Netflix Essential",
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
    pricesByDuration: makePrices("25 DT", "130 DT", "220 DT"),
  },

  "iptv-dream-4k": {
    name: "IPTV Dream 4K",
    oldPrice: "150 DT",
    duration: "1 year",
    category: "Streaming",
    description:
      "Enjoy IPTV Dream 4K for sports, movies, series and entertainment channels.",
    features: ["4K streaming", "1 year access", "Fast setup", "Support included"],
    active: true,
    pricesByDuration: makePrices("15 DT", "50 DT", "90 DT"),
  },

  "youtube-premium": {
    name: "YouTube Premium",
    oldPrice: "40 DT",
    duration: "1 month",
    category: "Streaming",
    description: "Watch YouTube without ads and enjoy premium features.",
    features: [
      "Ad-free YouTube",
      "Background play",
      "Fast activation",
      "Support included",
    ],
    active: true,
    pricesByDuration: makePrices("20 DT", "100 DT", "180 DT"),
  },

  "spotify-premium": {
    name: "Spotify Premium",
    oldPrice: "70 DT",
    duration: "1 year",
    category: "Streaming",
    description: "Enjoy unlimited music with Spotify Premium for one year.",
    features: [
      "1 year access",
      "Music premium",
      "Fast activation",
      "Support included",
    ],
    active: true,
    pricesByDuration: makePrices("10 DT", "25 DT", "40 DT"),
  },

  "linkedin-career": {
    name: "LinkedIn Career",
    oldPrice: "90 DT",
    duration: "1 month",
    category: "Productivity",
    description: "Boost your career with LinkedIn premium career tools.",
    features: [
      "Career insights",
      "Learning features",
      "Premium tools",
      "Support included",
    ],
    active: true,
    pricesByDuration: makePrices("20 DT", "50 DT", "90 DT"),
  },

  "linkedin-business": {
    name: "LinkedIn Business",
    oldPrice: "180 DT",
    duration: "1 month",
    category: "Productivity",
    description:
      "LinkedIn Business access for networking, prospecting and professional growth.",
    features: [
      "Business tools",
      "Premium insights",
      "Networking features",
      "Support included",
    ],
    active: true,
    pricesByDuration: makePrices("40 DT", "100 DT", "180 DT"),
  },

  "microsoft-office-professional-plus": {
    name: "Microsoft Office Professional Plus",
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
    pricesByDuration: makePrices("15 DT", "45 DT", "80 DT"),
  },

  "coursera-plus": {
    name: "Coursera Plus",
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
    pricesByDuration: makePrices("20 DT", "60 DT", "90 DT"),
  },
};

function normalizeProduct(product: any): Subscription {
  return {
    ...product,
    duration:
      product.duration === "6 months" ||
      product.duration === "1 year" ||
      product.duration === "1 month"
        ? product.duration
        : "1 month",
    pricesByDuration: {
      "1 month": product.pricesByDuration?.["1 month"] || product.price || "0 DT",
      "6 months": product.pricesByDuration?.["6 months"] || "0 DT",
      "1 year": product.pricesByDuration?.["1 year"] || "0 DT",
    },
  };
}

export function getProducts(): Record<string, Subscription> {
  const saved = localStorage.getItem("products");

  const source = saved
    ? JSON.parse(saved)
    : defaultSubscriptions;

  return Object.fromEntries(
    Object.entries(source).map(([slug, product]) => [
      slug,
      normalizeProduct(product),
    ])
  );
}

export function saveProducts(products: Record<string, Subscription>) {
  localStorage.setItem("products", JSON.stringify(products));
  window.dispatchEvent(new Event("products-updated"));
}

/* COMMANDES EN ATTENTE */

export type PendingOrder = {
  id: string;
  clientName: string;
  phone: string;
  status: "En attente";
  items: any[];
  total: number;
  createdAt: string;
};

export function getPendingOrders(): PendingOrder[] {
  const saved = localStorage.getItem("pendingOrders");
  return saved ? JSON.parse(saved) : [];
}

export function savePendingOrders(orders: PendingOrder[]) {
  localStorage.setItem("pendingOrders", JSON.stringify(orders));
}

export function savePendingCart(cart: any[]) {
  if (!cart || cart.length === 0) return;

  const total = cart.reduce(
    (sum: number, item: any) => sum + item.price * item.quantity,
    0
  );

  const pendingOrder: PendingOrder = {
    id: "pending-cart",
    clientName: "Client non confirmé",
    phone: "Non renseigné",
    status: "En attente",
    items: cart,
    total,
    createdAt: new Date().toLocaleString(),
  };

  savePendingOrders([pendingOrder]);
}