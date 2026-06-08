import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowLeft, LogOut, ShoppingBag, User } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/account")({
  component: AccountPage,
});

function AccountPage() {
  const [customer, setCustomer] = useState(() => {
    return JSON.parse(localStorage.getItem("customer") || "null");
  });

  const [loginData, setLoginData] = useState({
    name: "",
    phone: "",
  });

  const orders = JSON.parse(localStorage.getItem("orders") || "[]");

  const login = () => {
    if (!loginData.name.trim() || !loginData.phone.trim()) {
      alert("Nom et téléphone obligatoires");
      return;
    }

    const newCustomer = {
      name: loginData.name,
      phone: loginData.phone,
    };

    localStorage.setItem("customer", JSON.stringify(newCustomer));
    setCustomer(newCustomer);
  };

  const logout = () => {
    localStorage.removeItem("customer");
    setCustomer(null);
  };

  if (!customer) {
    return (
      <main className="min-h-screen bg-background px-6 py-24 text-foreground">
        <div className="mx-auto max-w-md">
          <Link
            to="/"
            className="mb-8 inline-flex items-center gap-2 rounded-full border px-4 py-2 text-sm"
          >
            <ArrowLeft className="h-4 w-4" />
            Retour accueil
          </Link>

          <div className="rounded-2xl border bg-card p-6">
            <h1 className="mb-6 text-3xl font-bold">Connexion client</h1>

            <input
              className="mb-3 w-full rounded-md border px-4 py-3"
              placeholder="Nom complet"
              value={loginData.name}
              onChange={(e) =>
                setLoginData({ ...loginData, name: e.target.value })
              }
            />

            <input
              className="mb-5 w-full rounded-md border px-4 py-3"
              placeholder="Téléphone"
              value={loginData.phone}
              onChange={(e) =>
                setLoginData({ ...loginData, phone: e.target.value })
              }
            />

            <Button
              onClick={login}
              className="w-full border-0 gradient-primary text-primary-foreground"
            >
              Se connecter
            </Button>
          </div>
        </div>
      </main>
    );
  }

  const customerOrders = orders.filter(
    (order: any) => order.customer?.phone === customer.phone
  );

  return (
    <main className="min-h-screen bg-background px-6 py-24 text-foreground">
      <div className="mx-auto max-w-5xl">
        <Link
          to="/"
          className="mb-8 inline-flex items-center gap-2 rounded-full border px-4 py-2 text-sm"
        >
          <ArrowLeft className="h-4 w-4" />
          Retour accueil
        </Link>

        <div className="mb-8 flex items-center justify-between">
          <h1 className="text-4xl font-bold">Mon compte</h1>

          <Button
            onClick={logout}
            className="border-0 bg-destructive text-destructive-foreground"
          >
            <LogOut className="mr-2 h-4 w-4" />
            Déconnexion
          </Button>
        </div>

        <div className="mb-8 rounded-2xl border bg-card p-6">
          <div className="mb-4 flex items-center gap-3">
            <User className="h-6 w-6 text-primary" />
            <h2 className="text-2xl font-bold">Informations client</h2>
          </div>

          <p>
            <strong>Nom :</strong> {customer.name}
          </p>
          <p>
            <strong>Téléphone :</strong> {customer.phone}
          </p>
        </div>

        <div className="rounded-2xl border bg-card p-6">
          <div className="mb-4 flex items-center gap-3">
            <ShoppingBag className="h-6 w-6 text-primary" />
            <h2 className="text-2xl font-bold">Historique d'achat</h2>
          </div>

          {customerOrders.length === 0 ? (
            <p className="text-muted-foreground">Aucune commande trouvée.</p>
          ) : (
            <div className="space-y-4">
              {customerOrders.map((order: any) => (
                <div key={order.id} className="rounded-xl border p-4">
                  <p>
                    <strong>Date :</strong> {order.date}
                  </p>
                  <p>
                    <strong>Paiement :</strong> {order.payment}
                  </p>
                  <p>
                    <strong>Total :</strong> {order.total} DT
                  </p>

                  <div className="mt-3">
                    <strong>Articles :</strong>
                    {order.items.map((item: any) => (
                      <div
                        key={item.slug}
                        className="text-sm text-muted-foreground"
                      >
                        {item.name} x {item.quantity} ={" "}
                        {item.price * item.quantity} DT
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </main>
  );
}