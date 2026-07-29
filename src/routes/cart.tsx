import { createFileRoute, Link } from "@tanstack/react-router";
import { savePendingCart } from "@/lib/products";
import { getClients, saveClients } from "@/lib/clients";
import {
  consumeWheelReward,
} from "@/lib/wheelReward";
import {
  ArrowLeft,
  CheckCircle2,
  CreditCard,
  Gift,
  Landmark,
  Minus,
  Plus,
  ShoppingCart,
  Smartphone,
  Trash2,
  Wallet,
} from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { Button } from "@/components/ui/button";

type WheelRewardInfo = {
  id: string;
  label: string;
  percentage: number;
};

type CartItem = {
  slug: string;
  name: string;

  // Prix réellement payé pour la première unité.
  price: number;

  // Prix normal avant la réduction.
  originalPrice?: number;

  duration: string;
  quantity: number;

  // Présent seulement si une récompense a été appliquée.
  wheelReward?: WheelRewardInfo | null;
};

type PaymentMethod = {
  id: string;
  name: string;
  desc: string;
  icon: React.ElementType;
  badge: string;
};

const WHATSAPP_NUMBER = "21629734222";

const paymentMethods: PaymentMethod[] = [
  {
    id: "card",
    name: "Carte bancaire",
    desc: "Visa / Mastercard",
    icon: CreditCard,
    badge: "💳",
  },
  {
    id: "d17",
    name: "D17",
    desc: "Paiement local",
    icon: Smartphone,
    badge: "D17",
  },
  {
    id: "flouci",
    name: "Flouci",
    desc: "Wallet mobile",
    icon: Wallet,
    badge: "F",
  },
  {
    id: "bank",
    name: "Virement bancaire",
    desc: "Banque",
    icon: Landmark,
    badge: "🏦",
  },
];

export const Route = createFileRoute("/cart")({
  component: CartPage,
});

function getStoredCart(): CartItem[] {
  try {
    const parsed = JSON.parse(localStorage.getItem("cart") || "[]");

    if (!Array.isArray(parsed)) {
      return [];
    }

    return parsed.map((item) => {
      const storedPrice = Number(item.price) || 0;
      const originalPrice =
        item.originalPrice !== undefined
          ? Number(item.originalPrice) || storedPrice
          : storedPrice;

      const rewardPercentage =
        Number(item.wheelReward?.percentage) || 0;

      /*
        Sécurité importante :
        si la page produit a enregistré le prix normal par erreur,
        le panier recalcule lui-même le prix réduit.
      */
      const discountedPrice =
        item.wheelReward && rewardPercentage > 0
          ? Number(
              (
                originalPrice -
                originalPrice * (rewardPercentage / 100)
              ).toFixed(2)
            )
          : storedPrice;

      return {
        ...item,
        price: discountedPrice,
        originalPrice,
        quantity: Math.max(1, Number(item.quantity) || 1),
      };
    });
  } catch {
    return [];
  }
}

function formatPrice(price: number) {
  return Number.isInteger(price) ? String(price) : price.toFixed(2);
}

/*
  La récompense de la roue est utilisable une seule fois.

  Si l'article a une réduction :
  - première unité = prix réduit
  - unités suivantes = prix normal
*/
function getItemTotal(item: CartItem) {
  const quantity = Math.max(1, item.quantity);
  const normalPrice = item.originalPrice ?? item.price;

  if (item.wheelReward && item.originalPrice !== undefined) {
    return item.price + normalPrice * (quantity - 1);
  }

  return item.price * quantity;
}

function CartPage() {
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [paymentMethod, setPaymentMethod] = useState(paymentMethods[0].id);

  const [customer, setCustomer] = useState({
    name: "",
    phone: "",
  });

  useEffect(() => {
    setCartItems(getStoredCart());

    const savedCustomer = localStorage.getItem("customer");

    if (savedCustomer) {
      try {
        const parsedCustomer = JSON.parse(savedCustomer);

        setCustomer({
          name: String(parsedCustomer?.name ?? ""),
          phone: String(parsedCustomer?.phone ?? ""),
        });
      } catch {
        localStorage.removeItem("customer");
      }
    }
  }, []);

  useEffect(() => {
    localStorage.setItem("customer", JSON.stringify(customer));
  }, [customer]);

  const saveCart = (items: CartItem[]) => {
    setCartItems(items);
    localStorage.setItem("cart", JSON.stringify(items));
    savePendingCart(items);
    window.dispatchEvent(new Event("cart-updated"));
  };

  const increaseQuantity = (slug: string) => {
    saveCart(
      cartItems.map((item) =>
        item.slug === slug
          ? {
              ...item,
              quantity: item.quantity + 1,
            }
          : item
      )
    );
  };

  const decreaseQuantity = (slug: string) => {
    saveCart(
      cartItems
        .map((item) =>
          item.slug === slug
            ? {
                ...item,
                quantity: item.quantity - 1,
              }
            : item
        )
        .filter((item) => item.quantity > 0)
    );
  };

  const deleteItem = (slug: string) => {
    saveCart(cartItems.filter((item) => item.slug !== slug));
  };

  const clearCart = () => {
    saveCart([]);
  };

  const total = useMemo(
    () =>
      cartItems.reduce(
        (sum, item) => sum + getItemTotal(item),
        0
      ),
    [cartItems]
  );

  const totalItems = useMemo(
    () =>
      cartItems.reduce(
        (sum, item) => sum + item.quantity,
        0
      ),
    [cartItems]
  );

  const selectedPayment = paymentMethods.find(
    (method) => method.id === paymentMethod
  );

  const checkout = () => {
    const customerName = customer.name.trim();
    const customerPhone = customer.phone.trim();

    if (!customerName) {
      alert("Le nom complet est obligatoire");
      return;
    }

    if (!customerPhone) {
      alert("Le numéro de téléphone est obligatoire");
      return;
    }

    if (cartItems.length === 0) {
      alert("Votre panier est vide");
      return;
    }

    const clients = getClients();

    const normalizedPhone = customerPhone.replace(/\s+/g, "");

    const existingClient = clients.find(
      (client) =>
        String(client.phone).replace(/\s+/g, "") === normalizedPhone
    );

    if (!existingClient) {
      saveClients([
        ...clients,
        {
          id: Date.now().toString(),
          name: customerName,
          phone: customerPhone,
          active: true,
        },
      ]);
    }

    const order = cartItems
      .map((item, index) => {
        const itemTotal = getItemTotal(item);

        const rewardText = item.wheelReward
          ? `\n   🎁 ${item.wheelReward.label} appliquée sur la première unité`
          : "";

        return `${index + 1}. ${item.name} x${item.quantity} = ${formatPrice(
          itemTotal
        )} DT${rewardText}`;
      })
      .join("\n");

    let orders: unknown[] = [];

    try {
      const storedOrders = JSON.parse(
        localStorage.getItem("orders") || "[]"
      );

      orders = Array.isArray(storedOrders)
        ? storedOrders
        : [];
    } catch {
      orders = [];
    }

    orders.push({
      id: Date.now(),
      customer: {
        name: customerName,
        phone: customerPhone,
      },
      items: cartItems,
      payment: selectedPayment?.name ?? "Non sélectionné",
      total,
      date: new Date().toLocaleString(),
    });

    localStorage.setItem("orders", JSON.stringify(orders));

    /*
      La commande est maintenant enregistrée avec succès.

      La récompense est consommée seulement si elle a réellement été
      appliquée à un produit du panier. On passe directement le nom stocké
      dans le panier afin d'éviter un échec de correspondance lié à la durée.
    */
    const rewardedItem = cartItems.find(
      (item) =>
        item.wheelReward &&
        item.wheelReward.percentage > 0 &&
        item.originalPrice !== undefined &&
        item.price < item.originalPrice
    );

    if (rewardedItem) {
      consumeWheelReward(rewardedItem.name);
    }

    // Vider le panier uniquement après l'enregistrement de la commande.
    saveCart([]);

    const text = encodeURIComponent(
      `Bonjour, je veux passer une commande ✅\n\nClient: ${customerName}\nTéléphone: ${customerPhone}\n\n${order}\n\nMode de paiement: ${
        selectedPayment?.name ?? "Non sélectionné"
      }\nTotal: ${formatPrice(total)} DT`
    );

    window.open(
      `https://wa.me/${WHATSAPP_NUMBER}?text=${text}`,
      "_blank"
    );
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

        <div className="mb-10 flex flex-col justify-between gap-4 md:flex-row md:items-end">
          <div>
            <h1 className="font-display text-4xl font-bold md:text-6xl">
              Your <span className="gradient-text">Cart</span>
            </h1>

            <p className="mt-3 text-muted-foreground">
              You have {totalItems} item
              {totalItems !== 1 ? "s" : ""} in your cart.
            </p>
          </div>

          {cartItems.length > 0 && (
            <button
              type="button"
              onClick={clearCart}
              className="text-sm text-muted-foreground transition hover:text-destructive"
            >
              Clear cart
            </button>
          )}
        </div>

        {cartItems.length === 0 ? (
          <div className="gradient-border rounded-3xl p-10 text-center">
            <div className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-2xl bg-primary/15">
              <ShoppingCart className="h-8 w-8 text-primary" />
            </div>

            <h2 className="mb-2 text-2xl font-bold">
              Panier vide
            </h2>

            <p className="mx-auto mb-6 max-w-md text-muted-foreground">
              Ajoute un abonnement au panier pour continuer.
            </p>

            <Link to="/">
              <Button className="border-0 gradient-primary text-primary-foreground">
                Voir les abonnements
              </Button>
            </Link>
          </div>
        ) : (
          <div className="grid gap-6 lg:grid-cols-[1fr_390px]">
            <div className="space-y-4">
              {cartItems.map((item) => {
                const itemTotal = getItemTotal(item);
                const normalPrice =
                  item.originalPrice ?? item.price;

                return (
                  <div
                    key={item.slug}
                    className="gradient-border rounded-3xl p-6 transition-smooth hover:-translate-y-1"
                  >
                    <div className="flex flex-col gap-5 md:flex-row md:items-center md:justify-between">
                      <div className="flex-1">
                        <p className="mb-1 text-xs uppercase tracking-wider text-primary">
                          {item.duration}
                        </p>

                        <h2 className="text-xl font-bold">
                          {item.name}
                        </h2>

                        <div className="mt-2 flex flex-wrap items-center gap-2">
                          <span className="text-sm font-bold text-foreground">
                            Prix : {formatPrice(item.price)} DT
                          </span>

                          {item.wheelReward &&
                            normalPrice > item.price && (
                              <span className="text-sm text-muted-foreground line-through">
                                {formatPrice(normalPrice)} DT
                              </span>
                            )}
                        </div>

                        {item.wheelReward && (
                          <div className="mt-3 inline-flex items-center gap-2 rounded-xl border border-success/30 bg-success/10 px-3 py-2 text-xs font-bold text-success">
                            <Gift className="h-4 w-4" />
                            {item.wheelReward.label} appliquée
                          </div>
                        )}

                        {item.wheelReward &&
                          item.quantity > 1 && (
                            <p className="mt-2 text-xs text-muted-foreground">
                              La réduction est appliquée uniquement à la
                              première unité. Les autres unités sont au prix
                              normal.
                            </p>
                          )}
                      </div>

                      <div className="flex flex-wrap items-center gap-4">
                        <div className="flex items-center gap-2 rounded-xl border border-border bg-background/30 p-1">
                          <button
                            type="button"
                            aria-label="Réduire la quantité"
                            onClick={() =>
                              decreaseQuantity(item.slug)
                            }
                            className="flex h-8 w-8 items-center justify-center rounded-lg transition hover:bg-surface"
                          >
                            <Minus className="h-4 w-4" />
                          </button>

                          <span className="min-w-8 text-center text-sm font-bold">
                            {item.quantity}
                          </span>

                          <button
                            type="button"
                            aria-label="Augmenter la quantité"
                            onClick={() =>
                              increaseQuantity(item.slug)
                            }
                            className="flex h-8 w-8 items-center justify-center rounded-lg transition hover:bg-surface"
                          >
                            <Plus className="h-4 w-4" />
                          </button>
                        </div>

                        <span className="gradient-text min-w-[110px] text-right text-2xl font-bold">
                          {formatPrice(itemTotal)} DT
                        </span>

                        <button
                          type="button"
                          aria-label="Supprimer le produit"
                          onClick={() =>
                            deleteItem(item.slug)
                          }
                          className="rounded-xl border border-border p-2 text-muted-foreground transition hover:border-destructive/40 hover:text-destructive"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            <aside className="glass h-fit rounded-3xl p-6 shadow-card lg:sticky lg:top-24">
              <h2 className="mb-5 text-xl font-bold">
                Order Summary
              </h2>

              <div className="space-y-3 border-b border-border pb-5 text-sm">
                <div className="flex justify-between text-muted-foreground">
                  <span>Total items</span>
                  <span>{totalItems}</span>
                </div>

                <div className="flex justify-between text-muted-foreground">
                  <span>Activation</span>
                  <span className="text-success">Free</span>
                </div>
              </div>

              <div className="my-6 flex items-end justify-between">
                <span className="font-bold">Total</span>

                <span className="gradient-text text-4xl font-bold">
                  {formatPrice(total)} DT
                </span>
              </div>

              <div className="mb-6 border-t border-border/60 pt-5">
                <h3 className="mb-3 text-sm font-bold">
                  Infos client
                </h3>

                <div className="space-y-3">
                  <input
                    required
                    placeholder="Nom complet"
                    value={customer.name}
                    onChange={(event) =>
                      setCustomer({
                        ...customer,
                        name: event.target.value,
                      })
                    }
                    className="w-full rounded-xl border border-border bg-background/40 px-4 py-3 text-sm outline-none focus:border-primary disabled:opacity-60"
                  />

                  <input
                    required
                    type="tel"
                    placeholder="Téléphone"
                    value={customer.phone}
                    onChange={(event) =>
                      setCustomer({
                        ...customer,
                        phone: event.target.value,
                      })
                    }
                    className="w-full rounded-xl border border-border bg-background/40 px-4 py-3 text-sm outline-none focus:border-primary disabled:opacity-60"
                  />
                </div>
              </div>

              <div className="mb-6 border-t border-border/60 pt-5">
                <h3 className="mb-3 text-sm font-bold">
                  Paiement
                </h3>

                <div className="grid gap-3">
                  {paymentMethods.map((method) => {
                    const Icon = method.icon;
                    const active =
                      paymentMethod === method.id;

                    return (
                      <button
                        key={method.id}
                        type="button"
                        onClick={() =>
                          setPaymentMethod(method.id)
                        }
                        className={`flex items-center gap-3 rounded-2xl border p-3 text-left transition-smooth ${
                          active
                            ? "border-primary/50 bg-primary/10"
                            : "border-border bg-background/30 hover:border-primary/30"
                        }`}
                      >
                        <div className="flex h-11 w-14 items-center justify-center rounded-xl bg-white text-xs font-black text-black shadow-sm">
                          {method.badge}
                        </div>

                        <div className="flex flex-1 items-center gap-3">
                          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary/15">
                            <Icon className="h-4 w-4 text-primary" />
                          </div>

                          <div>
                            <p className="text-sm font-semibold">
                              {method.name}
                            </p>

                            <p className="text-xs text-muted-foreground">
                              {method.desc}
                            </p>
                          </div>
                        </div>

                        {active && (
                          <CheckCircle2 className="h-5 w-5 text-success" />
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>

              <Button
                onClick={checkout}
                disabled={
                  !customer.name.trim() ||
                  !customer.phone.trim()
                }
                className="h-12 w-full border-0 gradient-primary text-primary-foreground hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50"
              >
                Confirmez & Commandez via WhatsApp
              </Button>
            </aside>
          </div>
        )}
      </div>
    </main>
  );
}
