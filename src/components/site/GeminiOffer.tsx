
import { Link } from "@tanstack/react-router";
import {
  Check,
  Sparkles,
  Cloud,
  Video,
  BookOpen,
  ArrowRight,
  ShoppingCart,
} from "lucide-react";

import { savePendingCart } from "@/lib/products";

const GEMINI_OFFER = {
  slug: "gemini-ultimate-pack",
  name: "Gemini Ultimate Pack",
  price: 55,
  originalPrice: 55,
  duration: "1 year",
  quantity: 1,
  wheelReward: null,
};

function addGeminiOfferToCart() {
  let cart: any[] = [];

  try {
    const savedCart = localStorage.getItem("cart");
    const parsed = savedCart ? JSON.parse(savedCart) : [];
    cart = Array.isArray(parsed) ? parsed : [];
  } catch {
    cart = [];
  }

  const existingItem = cart.find(
    (item) => item.slug === GEMINI_OFFER.slug
  );

  const updatedCart = existingItem
    ? cart.map((item) =>
        item.slug === GEMINI_OFFER.slug
          ? { ...item, quantity: Number(item.quantity || 0) + 1 }
          : item
      )
    : [...cart, GEMINI_OFFER];

  localStorage.setItem("cart", JSON.stringify(updatedCart));

  savePendingCart(
    updatedCart.map((item) => ({
      slug: item.slug,
      quantity: item.quantity,
      duration: item.duration,
    }))
  );

  window.dispatchEvent(new Event("cart-updated"));
}

const features = [
  { icon: Sparkles, name: "Gemini Pro" },
  { icon: Cloud, name: "5 TB Storage" },
  { icon: Video, name: "Veo 3" },
  { icon: BookOpen, name: "NotebookLM" },
];

export function GeminiOffer() {
  return (
    <section className="px-4 py-10 md:py-14">
      <div className="relative mx-auto max-w-4xl overflow-hidden rounded-3xl border border-primary/30 bg-card shadow-xl transition-all duration-300 hover:shadow-2xl">
        
        {/* Background effects */}
        <div className="pointer-events-none absolute -right-20 -top-20 h-52 w-52 rounded-full bg-primary/20 blur-3xl" />
        <div className="pointer-events-none absolute -bottom-20 -left-20 h-52 w-52 rounded-full bg-accent/20 blur-3xl" />

        <div className="relative grid items-center gap-6 p-6 md:grid-cols-[1.3fr_0.7fr] md:p-9">

          {/* Offer information */}
          <div>
            <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-primary/30 bg-primary/10 px-3 py-1.5 text-xs font-bold text-primary">
              <Sparkles className="h-3.5 w-3.5" />
              OFFRE EXCLUSIVE · 1 AN
            </div>

            <h2 className="text-3xl font-black leading-tight md:text-4xl">
              GEMINI
              <span className="block bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
                ULTIMATE PACK
              </span>
            </h2>

            <p className="mt-3 max-w-md text-sm text-muted-foreground">
              Toute la puissance de Google AI dans un seul abonnement.
              Crée, travaille et stocke sans limites.
            </p>

            {/* Features */}
            <div className="mt-5 grid grid-cols-2 gap-3">
              {features.map((feature) => {
                const Icon = feature.icon;

                return (
                  <div
                    key={feature.name}
                    className="flex items-center gap-2 rounded-xl border border-border/60 bg-background/60 p-2.5"
                  >
                    <Icon className="h-4 w-4 shrink-0 text-primary" />
                    <span className="text-xs font-semibold">
                      {feature.name}
                    </span>
                    <Check className="ml-auto h-3.5 w-3.5 shrink-0 text-green-500" />
                  </div>
                );
              })}
            </div>
          </div>

          {/* Price and CTA */}
          <div className="flex flex-col items-center justify-center rounded-2xl border border-primary/20 bg-primary/5 p-5 text-center">
            <span className="text-xs font-bold uppercase tracking-widest text-muted-foreground">
              Prix spécial
            </span>

            <div className="my-2 flex items-baseline gap-1">
              <span className="text-5xl font-black text-primary">55</span>
              <span className="text-xl font-bold text-primary">DT</span>
            </div>

            <span className="mb-5 text-xs text-muted-foreground">
              Pour 12 mois complets
            </span>

            <Link
              to="/cart"
              onClick={addGeminiOfferToCart}
              className="group inline-flex w-full items-center justify-center gap-2 rounded-xl bg-primary px-4 py-3 text-sm font-bold text-primary-foreground shadow-lg transition-all duration-300 hover:-translate-y-1 hover:opacity-90"
            >
              <ShoppingCart className="h-4 w-4" />
              Profiter de l'offre
              <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
            </Link>

            <p className="mt-3 text-[10px] text-muted-foreground">
              <Check className="mr-1 inline h-3 w-3 text-green-500" />
              Offre disponible sur TunisiaSubs
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
