import { getProducts, saveProducts, Subscription } from "@/lib/products";
import { getClients, saveClients, Client } from "@/lib/clients";
import { useEffect, useState } from "react";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import {
  getPaymentMethods,
  savePaymentMethods,
  PaymentMethod,
} from "@/lib/paymentMethods";

export const Route = createFileRoute("/admin")({
  component: AdminPage,
});

function slugify(text: string) {
  return text.toLowerCase().trim().replaceAll(" ", "-");
}

function AdminPage() {
  const navigate = useNavigate();

  const [products, setProducts] =
    useState<Record<string, Subscription>>(getProducts);

  const [paymentMethods, setPaymentMethods] =
    useState<PaymentMethod[]>(getPaymentMethods);

  const [clients, setClients] =
    useState<Client[]>(getClients);

  const [newClient, setNewClient] = useState({
    name: "",
    phone: "",
    note: "",
  });

  const [newPaymentName, setNewPaymentName] = useState("");
  const [newPaymentDetails, setNewPaymentDetails] = useState("");

  const [newName, setNewName] = useState("");
  const [editingSlug, setEditingSlug] = useState<string | null>(null);
  const [editProduct, setEditProduct] = useState<Subscription | null>(null);

  useEffect(() => {
    const isAdmin = localStorage.getItem("adminAuth") === "true";

    if (!isAdmin) {
      navigate({ to: "/admin-login" });
    }
  }, [navigate]);

  const updateAllProducts = (updated: Record<string, Subscription>) => {
    setProducts(updated);
    saveProducts(updated);
  };

  const addProduct = () => {
    if (!newName) return alert("Écris le nom du produit");

    const slug = slugify(newName);

    if (products[slug]) return alert("Ce produit existe déjà");
const updated: Record<string, Subscription> = {
  ...products,
  [slug]: {
    name: newName,
    oldPrice: "0 DT",
    duration: "1 month",
    category: "New",
    description: "",
    features: [],
    active: true,
    pricesByDuration: {
      "1 month": "0 DT",
      "6 months": "0 DT",
      "1 year": "0 DT",
    },
  },
};

    updateAllProducts(updated);
    setNewName("");
  };

  const toggleVisible = (slug: string) => {
    const updated = {
      ...products,
      [slug]: {
        ...products[slug],
        active: !products[slug].active,
      },
    };

    updateAllProducts(updated);
  };

  const openEdit = (slug: string) => {
    setEditingSlug(slug);
    setEditProduct({ ...products[slug] });
  };

  const closeEdit = () => {
    setEditingSlug(null);
    setEditProduct(null);
  };

  const saveEdit = () => {
    if (!editingSlug || !editProduct) return;

    const updated = {
      ...products,
      [editingSlug]: editProduct,
    };

    updateAllProducts(updated);
    closeEdit();
  };

  const deleteProduct = (slug: string) => {
    const confirmDelete = confirm("Voulez-vous supprimer ce produit ?");
    if (!confirmDelete) return;

    const updated = { ...products };
    delete updated[slug];

    updateAllProducts(updated);
  };
  const totalProducts = Object.keys(products).length;

const visibleProducts = Object.values(products).filter(
  (product) => product.active
).length;

const hiddenProducts = totalProducts - visibleProducts;

const cart = JSON.parse(localStorage.getItem("cart") || "[]");

const totalCartItems = cart.reduce(
  (sum: number, item: any) => sum + item.quantity,
  0
);

const totalCartValue = cart.reduce(
  (sum: number, item: any) => sum + item.price * item.quantity,
  0
);
const updatePaymentMethods = (updated: PaymentMethod[]) => {
  setPaymentMethods(updated);
  savePaymentMethods(updated);
};

const addPaymentMethod = () => {
  if (!newPaymentName || !newPaymentDetails) {
    alert("Remplis le nom et les détails");
    return;
  }

  const newMethod: PaymentMethod = {
    id: Date.now().toString(),
    name: newPaymentName,
    details: newPaymentDetails,
    active: true,
  };

  updatePaymentMethods([...paymentMethods, newMethod]);
  setNewPaymentName("");
  setNewPaymentDetails("");
};

const updatePaymentMethod = (
  id: string,
  field: keyof PaymentMethod,
  value: string | boolean
) => {
  const updated = paymentMethods.map((method) =>
    method.id === id ? { ...method, [field]: value } : method
  );

  updatePaymentMethods(updated);
};

const deletePaymentMethod = (id: string) => {
  const updated = paymentMethods.filter((method) => method.id !== id);
  updatePaymentMethods(updated);
};
const updateClients = (updated: Client[]) => {
  setClients(updated);
  saveClients(updated);
};

const addClient = () => {
  if (!newClient.name || !newClient.phone) {
    alert("Nom et téléphone obligatoires");
    return;
  }

  updateClients([
    ...clients,
    {
      id: Date.now().toString(),
      ...newClient,
      active: true,
    },
  ]);

  setNewClient({
    name: "",
   
    phone: "",
    
    note: "",
  });
};

const updateClient = (
  id: string,
  field: keyof Client,
  value: string | boolean
) => {
  updateClients(
    clients.map((client) =>
      client.id === id ? { ...client, [field]: value } : client
    )
  );
};

const deleteClient = (id: string) => {
  if (!confirm("Supprimer ce client ?")) return;
  updateClients(clients.filter((client) => client.id !== id));
};
const orders = JSON.parse(localStorage.getItem("orders") || "[]");

const getClientOrders = (phone: string) => {
  return orders.filter(
    (order: any) => order.customer?.phone === phone
  );
};
const [productFilter, setProductFilter] = useState("");
const [durationFilter, setDurationFilter] = useState("");
const clientMatchesFilters = (client: Client) => {
  const orders = getClientOrders(client.phone);

  return orders.some((order: any) =>
    order.items?.some((item: any) => {
      const productMatch =
        !productFilter ||
        item.name
          .toLowerCase()
          .includes(productFilter.toLowerCase());

      const durationMatch =
        !durationFilter ||
        item.duration === durationFilter;

      return productMatch && durationMatch;
    })
  );
};
  return (
    <main className="min-h-screen bg-background px-6 py-10 text-foreground">
      <div className="mx-auto max-w-7xl">
        <h1 className="mb-8 text-4xl font-bold">Dashboard Admin</h1>
        {/* FLOATING ADMIN CARD */}
<div className="relative mb-10 overflow-hidden rounded-3xl border bg-card p-6 shadow-xl">
        <a href="/#subscriptions">
  <button className="mb-6 rounded-md bg-primary px-5 py-2 text-primary-foreground">
    Aller aux produits
  </button>
</a>
<div className="mb-8 grid gap-4 md:grid-cols-5">
  <div className="rounded-2xl border bg-card p-5">
    <p className="text-sm text-muted-foreground">
      Total produits
    </p>
    <h2 className="text-3xl font-bold">
      {totalProducts}
    </h2>
  </div>

  <div className="rounded-2xl border bg-card p-5">
    <p className="text-sm text-muted-foreground">
      Produits visibles
    </p>
    <h2 className="text-3xl font-bold text-green-500">
      {visibleProducts}
    </h2>
  </div>

  <div className="rounded-2xl border bg-card p-5">
    <p className="text-sm text-muted-foreground">
      Produits invisibles
    </p>
    <h2 className="text-3xl font-bold text-red-500">
      {hiddenProducts}
    </h2>
  </div>

  <div className="rounded-2xl border bg-card p-5">
    <p className="text-sm text-muted-foreground">
      Articles panier
    </p>
    <h2 className="text-3xl font-bold">
      {totalCartItems}
    </h2>
  </div>

  <div className="rounded-2xl border bg-card p-5">
    <p className="text-sm text-muted-foreground">
      Valeur panier
    </p>
    <h2 className="text-3xl font-bold">
      {totalCartValue} DT
    </h2>
  </div>
</div>
<div className="mb-8 rounded-2xl border bg-card p-6">
  <h2 className="mb-4 text-2xl font-bold">Gestion des clients</h2>

  <div className="mb-6 grid gap-3 md:grid-cols-5">
    <input
      className="rounded-md border px-4 py-2"
      placeholder="Nom"
      value={newClient.name}
      onChange={(e) =>
        setNewClient({ ...newClient, name: e.target.value })
      }
    />

    
    <input
      className="rounded-md border px-4 py-2"
      placeholder="Téléphone"
      value={newClient.phone}
      onChange={(e) =>
        setNewClient({ ...newClient, phone: e.target.value })
      }
    />


    <button
      onClick={addClient}
      className="rounded-md bg-primary px-5 py-2 text-primary-foreground"
    >
      Ajouter client
    </button>
  </div>

  <textarea
    className="mb-6 w-full rounded-md border px-4 py-2"
    placeholder="Note client"
    value={newClient.note}
    onChange={(e) =>
      setNewClient({ ...newClient, note: e.target.value })
    }
  />

  <div className="overflow-hidden rounded-2xl border">
    <div className="mb-4 flex gap-3">
  <input
    className="rounded-md border px-4 py-2"
    placeholder="Produit (ex: ChatGPT)"
    value={productFilter}
    onChange={(e) => setProductFilter(e.target.value)}
  />

  <select
    className="rounded-md border px-4 py-2"
    value={durationFilter}
    onChange={(e) => setDurationFilter(e.target.value)}
  >
    <option className="text-black" value="">Toutes les durées</option>
      <option className="text-black" value="1 month">1 Month</option>

  <option className="text-black" value="6 months">6 Months</option>

  <option className="text-black" value="1 year">1 Year</option>
  </select>
</div>
    <table className="w-full text-left text-sm">
      <thead className="bg-muted">
        <tr>
          <th className="p-4">Nom</th>
          <th className="p-4">Téléphone</th>
          <th className="p-4">Commandes</th>
          <th className="p-4">État</th>
          <th className="p-4">Action</th>
        </tr>
      </thead>

      <tbody>
  {clients
  .filter(
    (client) =>
      !productFilter && !durationFilter
        ? true
        : clientMatchesFilters(client)
  )
  .map((client) => (
    <tr key={client.id} className="border-t">
      <td className="p-4">
        <input
          className="w-full rounded-md border px-3 py-2"
          value={client.name}
          onChange={(e) =>
            updateClient(client.id, "name", e.target.value)
          }
        />
      </td>

      <td className="p-4">
        <input
          className="w-full rounded-md border px-3 py-2"
          value={client.phone}
          onChange={(e) =>
            updateClient(client.id, "phone", e.target.value)
          }
        />
      </td>

      {/* COMMANDES DU CLIENT */}
      <td className="p-4">
        {getClientOrders(client.phone).length === 0 ? (
          <span className="text-muted-foreground">
            Aucune commande
          </span>
        ) : (
          <div className="max-h-40 space-y-2 overflow-auto">
            {getClientOrders(client.phone).map((order: any) => (
              <div
                key={order.id}
                className="rounded-md border bg-muted/30 p-2 text-xs"
              >
                <div className="font-bold text-primary">
                  {order.total} DT
                </div>

                {order.items?.map((item: any) => (
                  <div key={item.slug}>
                    {item.name} × {item.quantity}
                  </div>
                ))}
              </div>
            ))}
          </div>
        )}
      </td>

      <td className="p-4">
        <button
          onClick={() =>
            updateClient(client.id, "active", !client.active)
          }
          className={
            client.active
              ? "rounded-full bg-green-600 px-3 py-1 text-xs font-bold text-white"
              : "rounded-full bg-gray-500 px-3 py-1 text-xs font-bold text-white"
          }
        >
          {client.active ? "Actif" : "Inactif"}
        </button>
      </td>

      <td className="p-4">
        <button
          onClick={() => deleteClient(client.id)}
          className="rounded-md bg-destructive px-3 py-2 text-xs text-destructive-foreground"
        >
          Supprimer
        </button>
      </td>
    </tr>
  ))}
</tbody>
    </table>
  </div>
</div>
<div className="mb-8 rounded-2xl border bg-card p-6">
  <h2 className="mb-4 text-2xl font-bold">Méthodes de paiement</h2>

  <div className="mb-6 grid gap-3 md:grid-cols-3">
    <input
      className="rounded-md border px-4 py-2"
      placeholder="Nom méthode ex: D17"
      value={newPaymentName}
      onChange={(e) => setNewPaymentName(e.target.value)}
    />

    <input
      className="rounded-md border px-4 py-2"
      placeholder="Détails ex: numéro / RIB / adresse"
      value={newPaymentDetails}
      onChange={(e) => setNewPaymentDetails(e.target.value)}
    />

    <button
      onClick={addPaymentMethod}
      className="rounded-md bg-primary px-5 py-2 text-primary-foreground"
    >
      Ajouter méthode
    </button>
  </div>

  <div className="overflow-hidden rounded-2xl border">
    <table className="w-full text-left text-sm">
      <thead className="bg-muted">
        <tr>
          <th className="p-4">Nom</th>
          <th className="p-4">Détails</th>
          <th className="p-4">État</th>
          <th className="p-4">Action</th>
        </tr>
      </thead>

      <tbody>
        {paymentMethods.map((method) => (
          <tr key={method.id} className="border-t">
            <td className="p-4">
              <input
                className="w-full rounded-md border px-3 py-2"
                value={method.name}
                onChange={(e) =>
                  updatePaymentMethod(method.id, "name", e.target.value)
                }
              />
            </td>

            <td className="p-4">
              <input
                className="w-full rounded-md border px-3 py-2"
                value={method.details}
                onChange={(e) =>
                  updatePaymentMethod(method.id, "details", e.target.value)
                }
              />
            </td>

            <td className="p-4">
              <button
                onClick={() =>
                  updatePaymentMethod(method.id, "active", !method.active)
                }
                className={
                  method.active
                    ? "rounded-full bg-green-600 px-3 py-1 text-xs font-bold text-white"
                    : "rounded-full bg-gray-500 px-3 py-1 text-xs font-bold text-white"
                }
              >
                {method.active ? "Active" : "Inactive"}
              </button>
            </td>

            <td className="p-4">
              <button
                onClick={() => deletePaymentMethod(method.id)}
                className="rounded-md bg-destructive px-3 py-2 text-xs text-destructive-foreground"
              >
                Supprimer
              </button>
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  </div>
</div>

        <div className="mb-8 rounded-2xl border bg-card p-6">
          <h2 className="mb-4 text-2xl font-bold">Ajouter produit</h2>

          <div className="flex gap-3">
            <input
              className="w-full rounded-md border px-4 py-2"
              placeholder="Nom du nouveau produit"
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
            />

            <button
              onClick={addProduct}
              className="rounded-md bg-primary px-5 py-2 text-primary-foreground"
            >
              Ajouter
            </button>
          </div>
        </div>

        <div className="overflow-hidden rounded-2xl border bg-card">
          <table className="w-full text-left text-sm">
            <thead className="bg-muted">
              <tr>
                <th className="p-4">Nom</th>
                <th className="p-4">Prix</th>
                <th className="p-4">Ancien prix</th>
                <th className="p-4">Catégorie</th>
                <th className="p-4">État</th>
                <th className="p-4">Actions</th>
              </tr>
            </thead>

            <tbody>
              {Object.entries(products).map(([slug, product]) => (
                <tr key={slug} className="border-t">
                  <td className="p-4 font-medium">{product.name}</td>
                  <td className="p-4 font-bold text-primary">
  {product.pricesByDuration?.["1 month"]}
</td>
                  <td className="p-4 text-muted-foreground line-through">
                    {product.oldPrice}
                  </td>
                  <td className="p-4">{product.category}</td>

                  <td className="p-4">
                    <button
                      onClick={() => toggleVisible(slug)}
                      className={
                        product.active
                          ? "rounded-full bg-green-600 px-3 py-1 text-xs font-bold text-white"
                          : "rounded-full bg-gray-500 px-3 py-1 text-xs font-bold text-white"
                      }
                    >
                      {product.active ? "Visible" : "Invisible"}
                    </button>
                  </td>

                  <td className="p-4">
                    <div className="flex gap-2">
                      <button
                        onClick={() => openEdit(slug)}
                        className="rounded-md bg-primary px-3 py-2 text-xs text-primary-foreground"
                      >
                        Modifier
                      </button>

                      <button
                        onClick={() => deleteProduct(slug)}
                        className="rounded-md bg-destructive px-3 py-2 text-xs text-destructive-foreground"
                      >
                        Supprimer
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {editingSlug && editProduct && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 px-4">
            <div className="max-h-[90vh] w-full max-w-2xl overflow-auto rounded-2xl bg-background p-6 shadow-xl">
              <h2 className="mb-5 text-2xl font-bold">
                Modifier le produit
              </h2>

              <div className="grid gap-3">
                <input
                  className="rounded-md border px-4 py-2"
                  value={editProduct.name}
                  onChange={(e) =>
                    setEditProduct({
                      ...editProduct,
                      name: e.target.value,
                    })
                  }
                  placeholder="Nom"
                />
                <input
                  className="rounded-md border px-4 py-2"
                  value={editProduct.oldPrice}
                  onChange={(e) =>
                    setEditProduct({
                      ...editProduct,
                      oldPrice: e.target.value,
                    })
                  }
                  placeholder="Ancien prix"
                />

                <input
  className="rounded-md border px-4 py-2"
  value={editProduct.pricesByDuration?.["1 month"] || ""}
  onChange={(e) =>
    setEditProduct({
      ...editProduct,
      pricesByDuration: {
        ...editProduct.pricesByDuration,
        "1 month": e.target.value,
      },
    })
  }
  placeholder="Prix 1 mois"
/>

<input
  className="rounded-md border px-4 py-2"
  value={editProduct.pricesByDuration?.["6 months"] || ""}
  onChange={(e) =>
    setEditProduct({
      ...editProduct,
      pricesByDuration: {
        ...editProduct.pricesByDuration,
        "6 months": e.target.value,
      },
    })
  }
  placeholder="Prix 6 mois"
/>

<input
  className="rounded-md border px-4 py-2"
  value={editProduct.pricesByDuration?.["1 year"] || ""}
  onChange={(e) =>
    setEditProduct({
      ...editProduct,
      pricesByDuration: {
        ...editProduct.pricesByDuration,
        "1 year": e.target.value,
      },
    })
  }
  placeholder="Prix 1 an"
/>
                <input
                  className="rounded-md border px-4 py-2"
                  value={editProduct.category}
                  onChange={(e) =>
                    setEditProduct({
                      ...editProduct,
                      category: e.target.value,
                    })
                  }
                  placeholder="Catégorie"
                />

                <textarea
                  className="rounded-md border px-4 py-2"
                  value={editProduct.description}
                  onChange={(e) =>
                    setEditProduct({
                      ...editProduct,
                      description: e.target.value,
                    })
                  }
                  placeholder="Description"
                />

                <textarea
                  className="rounded-md border px-4 py-2"
                  value={editProduct.features.join("\n")}
                  onChange={(e) =>
                    setEditProduct({
                      ...editProduct,
                      features: e.target.value.split("\n"),
                    })
                  }
                  placeholder="Features, une ligne par feature"
                />

                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={editProduct.active}
                    onChange={(e) =>
                      setEditProduct({
                        ...editProduct,
                        active: e.target.checked,
                      })
                    }
                  />
                  Produit visible
                </label>
              </div>

              <div className="mt-6 flex justify-end gap-3">
                <button
                  onClick={closeEdit}
                  className="rounded-md border px-4 py-2"
                >
                  Annuler
                </button>

                <button
                  onClick={saveEdit}
                  className="rounded-md bg-primary px-4 py-2 text-primary-foreground"
                >
                  Enregistrer
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
         </div>
    </main>
  );
}
