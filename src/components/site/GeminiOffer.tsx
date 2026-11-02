
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

  let updatedCart;

  if (existingItem) {
    updatedCart = cart.map((item) =>
      item.slug === GEMINI_OFFER.slug
        ? {
            ...item,
            quantity: Number(item.quantity || 0) + 1,
          }
        : item
    );
  } else {
    updatedCart = [...cart, GEMINI_OFFER];
  }

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

export function GeminiOffer() {
  return (
    <section className="relative overflow-hidden px-6 py-20">
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-br from-primary/10 via-transparent to-accent/10" />

      <div className="relative mx-auto max-w-6xl overflow-hidden rounded-[2rem] border border-primary/30 bg-card shadow-2xl">
        <div className="absolute -right-20 -top-20 h-72 w-72 rounded-full bg-primary/20 blur-3xl" />

        <div className="relative grid items-center gap-10 p-8 md:grid-cols-2 md:p-14">
          <div>
            <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-primary/30 bg-primary/10 px-4 py-2 text-xs font-bold uppercase tracking-wider text-primary">
              <Sparkles className="h-4 w-4" />
              Offre spéciale · 1 an
            </div>

            <h2 className="mb-5 text-4xl font-black leading-tight md:text-6xl">
              GEMINI
              <span className="block bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
                ULTIMATE PACK
              </span>
            </h2>

            <p className="mb-7 max-w-lg text-muted-foreground">
              Tous tes outils Google AI préférés réunis dans
              un seul pack pour booster ta créativité et ta
              productivité.
            </p>

            <div className="mb-8 grid gap-4 sm:grid-cols-2">
              {[
                { icon: Sparkles, name: "Gemini Pro" },
                { icon: Cloud, name: "5 TB de stockage" },
                { icon: Video, name: "Veo 3" },
                { icon: BookOpen, name: "NotebookLM" },
              ].map((feature) => {
                const Icon = feature.icon;

                return (
                  <div
                    key={feature.name}
                    className="flex items-center gap-3"
                  >
                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/15 text-primary">
                      <Icon className="h-5 w-5" />
                    </div>

                    <span className="text-sm font-semibold">
                      {feature.name}
                    </span>

                    <Check className="ml-auto h-4 w-4 text-success" />
                  </div>
                );
              })}
            </div>

            <div className="flex flex-wrap items-center gap-4">
              <div>
                <p className="text-sm text-muted-foreground">
                  Prix spécial
                </p>

                <p className="text-5xl font-black text-primary">
                  55 DT
                </p>

                <p className="text-xs text-muted-foreground">
                  Pour 12 mois
                </p>
              </div>

              <Link
                to="/cart"
                onClick={addGeminiOfferToCart}
                className="inline-flex items-center gap-2 rounded-xl bg-primary px-6 py-4 font-bold text-primary-foreground shadow-lg transition hover:scale-105 hover:opacity-90"
              >
                <ShoppingCart className="h-5 w-5" />
                Profiter de l'offre
                <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
          </div>

          <div className="relative flex min-h-[300px] items-center justify-center">
            <div className="absolute h-64 w-64 rounded-full bg-primary/20 blur-3xl" />

            <div className="relative flex h-64 w-64 items-center justify-center rounded-[3rem] border border-primary/30 bg-gradient-to-br from-primary/20 to-accent/20 shadow-2xl md:h-80 md:w-80">
              <div className="text-center">
                <Sparkles className="mx-auto mb-5 h-24 w-24 text-primary" />

                <p className="text-3xl font-black">
                  GEMINI
                </p>

                <p className="mt-2 text-sm font-semibold tracking-[0.3em] text-primary">
                  ULTIMATE
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
