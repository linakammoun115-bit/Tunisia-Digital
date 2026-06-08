import { createFileRoute, Link } from "@tanstack/react-router";
import { savePendingCart } from "@/lib/products";
import { getClients, saveClients } from "@/lib/clients";
import {
  ArrowLeft,
  CheckCircle2,
  CreditCard,
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

type CartItem = {
  slug: string;
  name: string;
  price: number;
  duration: string;
  quantity: number;
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
  { id: "card", name: "Carte bancaire", desc: "Visa / Mastercard", icon: CreditCard, badge: "💳" },
  { id: "d17", name: "D17", desc: "Paiement local", icon: Smartphone, badge: "D17" },
  { id: "flouci", name: "Flouci", desc: "Wallet mobile", icon: Wallet, badge: "F" },
  { id: "bank", name: "Virement bancaire", desc: "Banque", icon: Landmark, badge: "🏦" },
];

export const Route = createFileRoute("/cart")({
  component: CartPage,
});

function getStoredCart(): CartItem[] {
  try {
    return JSON.parse(localStorage.getItem("cart") || "[]");
  } catch {
    return [];
  }
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
      setCustomer(JSON.parse(savedCustomer));
    }
  }, []);

  const saveCart = (items: CartItem[]) => {
  setCartItems(items);
  localStorage.setItem("cart", JSON.stringify(items));
  savePendingCart(items);
  window.dispatchEvent(new Event("cart-updated"));
};

  const increaseQuantity = (slug: string) => {
    saveCart(
      cartItems.map((item) =>
        item.slug === slug ? { ...item, quantity: item.quantity + 1 } : item
      )
    );
  };

  const decreaseQuantity = (slug: string) => {
    saveCart(
      cartItems
        .map((item) =>
          item.slug === slug ? { ...item, quantity: item.quantity - 1 } : item
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
    () => cartItems.reduce((sum, item) => sum + item.price * item.quantity, 0),
    [cartItems]
  );

  const totalItems = useMemo(
    () => cartItems.reduce((sum, item) => sum + item.quantity, 0),
    [cartItems]
  );

  const selectedPayment = paymentMethods.find((m) => m.id === paymentMethod);

  
  const sendPaymentMessageToClient = (methodName: string) => {
  if (!customer.name || !customer.phone) {
    alert("Veuillez entrer le nom et le téléphone du client avant de choisir le paiement.");
    return;
  }

  const order = cartItems
    .map(
      (item, index) =>
        `${index + 1}. ${item.name} x${item.quantity} = ${
          item.price * item.quantity
        } DT`
    )
    .join("\n");

  const phone = customer.phone.startsWith("216")
    ? customer.phone
    : `216${customer.phone.replace(/\s+/g, "")}`;

  const message = encodeURIComponent(
    `Bonjour ${customer.name} 👋\n\nBienvenue chez TunisiaSubs ❤️\n\nVotre commande:\n${order}\n\nMode de paiement choisi: ${methodName}\nTotal: ${total} DT\n\nNous allons vous contacter pour finaliser votre activation. Merci pour votre confiance ✅`
  );

  window.open(`https://wa.me/${phone}?text=${message}`, "_blank");
};

  const checkout = () => {
  
if (!customer.name.trim()) {
  alert("Le nom complet est obligatoire");
  return;
}

if (!customer.phone.trim()) {
  alert("Le numéro de téléphone est obligatoire");
  return;
}
const clients = getClients();

const existingClient = clients.find(
  (client) => client.phone === customer.phone
);

if (!existingClient) {
  saveClients([
    ...clients,
    {
      id: Date.now().toString(),
      name: customer.name,
      phone: customer.phone,
      active: true,
    },
  ]);
}
  if (cartItems.length === 0) return;

  const order = cartItems
    .map(
      (item, index) =>
        `${index + 1}. ${item.name} x${item.quantity} = ${
          item.price * item.quantity
        } DT`
    )
    .join("\n");
    const orders = JSON.parse(localStorage.getItem("orders") || "[]");

orders.push({
  id: Date.now(),
  customer,
  items: cartItems,
  payment: selectedPayment?.name,
  total,
  date: new Date().toLocaleString(),
});

localStorage.setItem("orders", JSON.stringify(orders));

  const text = encodeURIComponent(
  `Bonjour, je veux passé(e) une commande ✅\n\nClient: ${customer.name}\nTéléphone: ${customer.phone}\n\n${order}\n\nMode de paiement: ${selectedPayment?.name}\nTotal: ${total} DT`
);

window.open(`https://wa.me/${WHATSAPP_NUMBER}?text=${text}`, "_blank");
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
              You have {totalItems} item{totalItems !== 1 ? "s" : ""} in your cart.
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

            <h2 className="mb-2 text-2xl font-bold">Panier vide</h2>

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
              {cartItems.map((item) => (
                <div
                  key={item.slug}
                  className="gradient-border rounded-3xl p-6 transition-smooth hover:-translate-y-1"
                >
                  <div className="flex flex-col gap-5 md:flex-row md:items-center md:justify-between">
                    <div>
                      <p className="mb-1 text-xs uppercase tracking-wider text-primary">
                        {item.duration}
                      </p>
                      <h2 className="text-xl font-bold">{item.name}</h2>
                      <p className="mt-1 text-sm text-muted-foreground">
                        Prix unitaire : {item.price} DT
                      </p>
                    </div>

                    <div className="flex flex-wrap items-center gap-4">
                      <div className="flex items-center gap-2 rounded-xl border border-border bg-background/30 p-1">
                        <button
                          type="button"
                          onClick={() => decreaseQuantity(item.slug)}
                          className="flex h-8 w-8 items-center justify-center rounded-lg transition hover:bg-surface"
                        >
                          <Minus className="h-4 w-4" />
                        </button>

                        <span className="min-w-8 text-center text-sm font-bold">
                          {item.quantity}
                        </span>

                        <button
                          type="button"
                          onClick={() => increaseQuantity(item.slug)}
                          className="flex h-8 w-8 items-center justify-center rounded-lg transition hover:bg-surface"
                        >
                          <Plus className="h-4 w-4" />
                        </button>
                      </div>

                      <span className="gradient-text min-w-[90px] text-right text-2xl font-bold">
                        {item.price * item.quantity} DT
                      </span>

                      <button
                        type="button"
                        onClick={() => deleteItem(item.slug)}
                        className="rounded-xl border border-border p-2 text-muted-foreground transition hover:border-destructive/40 hover:text-destructive"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <aside className="glass h-fit rounded-3xl p-6 shadow-card lg:sticky lg:top-24">
              <h2 className="mb-5 text-xl font-bold">Order Summary</h2>

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
                <span className="gradient-text text-4xl font-bold">{total} DT</span>
              </div>

              <div className="mb-6 border-t border-border/60 pt-5">
                <h3 className="mb-3 text-sm font-bold">Infos client</h3>

                <div className="space-y-3">
                  <input
                  required
                    placeholder="Nom complet"
                    value={customer.name}
                    onChange={(e) =>
                      setCustomer({ ...customer, name: e.target.value })
                    }
                    className="w-full rounded-xl border border-border bg-background/40 px-4 py-3 text-sm outline-none focus:border-primary disabled:opacity-60"
                  />
                  <input
                  required
                    type="tel"
                    placeholder="Téléphone"
                    value={customer.phone}
                    onChange={(e) =>
                      setCustomer({ ...customer, phone: e.target.value })
                    }
                    className="w-full rounded-xl border border-border bg-background/40 px-4 py-3 text-sm outline-none focus:border-primary disabled:opacity-60"
                  />



                  
                </div>
              </div>

                          <div className="mb-6 border-t border-border/60 pt-5">
  <h3 className="mb-3 text-sm font-bold">Paiement</h3>

  <div className="grid gap-3">
    {paymentMethods.map((method) => {
      const Icon = method.icon;
      const active = paymentMethod === method.id;

      return (
        <button
          key={method.id}
          type="button"
          onClick={() => {
            setPaymentMethod(method.id);
          }}
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
              <p className="text-sm font-semibold">{method.name}</p>
              <p className="text-xs text-muted-foreground">{method.desc}</p>
            </div>
          </div>

          {active && <CheckCircle2 className="h-5 w-5 text-success" />}
        </button>
      );
    })}
  </div>
</div>

              <Button
  onClick={checkout}
  disabled={!customer.name.trim() || !customer.phone.trim()}
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
