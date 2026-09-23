import {
  createFileRoute,
  Link,
  useNavigate,
} from "@tanstack/react-router";

import {
  useEffect,
  useState,
} from "react";

import {
  Gift,
  ShoppingBag,
} from "lucide-react";

import {
  getProducts,
  createProduct,
  updateProduct,
  deleteProduct as deleteProductFromDb,
  setProductActive,
  type Subscription,
} from "@/lib/products";

import {
  getSocialProducts,
  createSocialProduct,
  deleteSocialProduct,
  setSocialProductActive,
  type SocialProduct,
  type SocialProductType,
} from "@/lib/socialProducts";

import {
  getClients,
  saveClients,
  type Client,
} from "@/lib/clients";

import {
  getPaymentMethods,
  savePaymentMethods,
  type PaymentMethod,
} from "@/lib/paymentMethods";

export const Route = createFileRoute("/admin")({
  component: AdminPage,
});

function AdminPage() {
  const navigate = useNavigate();

  /* =========================================================
     PRODUITS
  ========================================================= */

  const [products, setProducts] = useState<
    Record<string, Subscription>
  >({});

  const [productsLoading, setProductsLoading] =
    useState(true);

  const [productsError, setProductsError] =
    useState("");

  const [newName, setNewName] =
    useState("");

  const [
    editingSlug,
    setEditingSlug,
  ] = useState<string | null>(null);

  const [
    editProduct,
    setEditProduct,
  ] = useState<Subscription | null>(null);

  /* =========================================================
     PRODUITS SOCIAUX
  ========================================================= */

  const [
    socialProducts,
    setSocialProducts,
  ] = useState<
    Record<string, SocialProduct>
  >({});

  const [
    socialLoading,
    setSocialLoading,
  ] = useState(true);

  const [
    socialType,
    setSocialType,
  ] = useState<SocialProductType>(
    "followers"
  );

  const [
    socialName,
    setSocialName,
  ] = useState("");

  const [
    socialQuantity,
    setSocialQuantity,
  ] = useState("");

  const [
    socialPrice,
    setSocialPrice,
  ] = useState("");

  const [
    socialOldPrice,
    setSocialOldPrice,
  ] = useState("");

  const [
    socialDescription,
    setSocialDescription,
  ] = useState("");

  /* =========================================================
     CLIENTS
  ========================================================= */

  const [
    clients,
    setClients,
  ] = useState<Client[]>(getClients);

  const [
    newClient,
    setNewClient,
  ] = useState({
    name: "",
    phone: "",
    note: "",
  });

  const [
    productFilter,
    setProductFilter,
  ] = useState("");

  const [
    durationFilter,
    setDurationFilter,
  ] = useState("");

  /* =========================================================
     PAIEMENTS
  ========================================================= */

  const [
    paymentMethods,
    setPaymentMethods,
  ] = useState<PaymentMethod[]>(
    getPaymentMethods
  );

  const [
    newPaymentName,
    setNewPaymentName,
  ] = useState("");

  const [
    newPaymentDetails,
    setNewPaymentDetails,
  ] = useState("");

  /* =========================================================
     VÉRIFICATION ADMIN
  ========================================================= */

  useEffect(() => {
    const isAdmin =
      localStorage.getItem("adminAuth") === "true";

    if (!isAdmin) {
      navigate({
        to: "/admin-login",
      });
    }
  }, [navigate]);

  /* =========================================================
     CHARGEMENT PRODUITS
  ========================================================= */

  useEffect(() => {
    let mounted = true;

    const loadProducts = async () => {
      try {
        setProductsLoading(true);
        setProductsError("");

        const data =
          await getProducts();

        if (mounted) {
          setProducts(data);
        }
      } catch (error) {
        console.error(
          "Erreur chargement produits Supabase:",
          error
        );

        if (mounted) {
          setProductsError(
            error instanceof Error
              ? error.message
              : "Impossible de charger les produits."
          );
        }
      } finally {
        if (mounted) {
          setProductsLoading(false);
        }
      }
    };

    void loadProducts();

    return () => {
      mounted = false;
    };
  }, []);

  /* =========================================================
     CHARGEMENT PRODUITS SOCIAUX
  ========================================================= */

  useEffect(() => {
    let mounted = true;

    const loadSocialProducts =
      async () => {
        try {
          setSocialLoading(true);

          const data =
            await getSocialProducts();

          if (mounted) {
            setSocialProducts(data);
          }
        } catch (error) {
          console.error(
            "Erreur chargement produits sociaux:",
            error
          );

          if (mounted) {
            window.alert(
              error instanceof Error
                ? error.message
                : "Impossible de charger les produits sociaux."
            );
          }
        } finally {
          if (mounted) {
            setSocialLoading(false);
          }
        }
      };

    void loadSocialProducts();

    return () => {
      mounted = false;
    };
  }, []);

  /* =========================================================
     AJOUT PRODUIT
  ========================================================= */

  const addProduct = async () => {
    const name =
      newName.trim();

    if (!name) {
      window.alert(
        "Écris le nom du produit."
      );
      return;
    }

    try {
      const product: Subscription = {
        name,

        oldPrice:
          "0 DT",

        duration:
          "1 month",

        category:
          "New",

        description:
          "",

        features:
          [],

        active:
          true,

        pricesByDuration: {
          "1 month":
            "0 DT",

          "6 months":
            "0 DT",

          "1 year":
            "0 DT",
        },
      };

      const id =
        await createProduct(
          product,
          Object.keys(
            products
          ).length
        );

      setProducts(
        (previous) => ({
          ...previous,

          [id]:
            product,
        })
      );

      setNewName("");

      window.alert(
        "Produit ajouté avec succès ✅"
      );
    } catch (error) {
      console.error(
        "Erreur ajout produit:",
        error
      );

      const message =
        error instanceof Error
          ? error.message
          : String(error);

      window.alert(
        `Impossible d'ajouter le produit.\n\n${message}`
      );
    }
  };

  /* =========================================================
     VISIBILITÉ PRODUIT
  ========================================================= */

  const toggleVisible = async (
    id: string
  ) => {
    const product =
      products[id];

    if (!product) {
      return;
    }

    const nextActive =
      !product.active;

    try {
      await setProductActive(
        id,
        nextActive
      );

      setProducts(
        (previous) => ({
          ...previous,

          [id]: {
            ...previous[id],
            active:
              nextActive,
          },
        })
      );
    } catch (error) {
      console.error(
        "Erreur changement visibilité produit:",
        error
      );

      const message =
        error instanceof Error
          ? error.message
          : String(error);

      window.alert(
        `Impossible de modifier la visibilité.\n\n${message}`
      );
    }
  };

  /* =========================================================
     MODIFIER PRODUIT
  ========================================================= */

  const openEdit = (
    id: string
  ) => {
    const product =
      products[id];

    if (!product) {
      return;
    }

    setEditingSlug(id);

    setEditProduct({
      ...product,

      pricesByDuration: {
        ...product.pricesByDuration,
      },

      features: [
        ...product.features,
      ],
    });
  };

  const closeEdit = () => {
    setEditingSlug(null);
    setEditProduct(null);
  };

  const saveEdit = async () => {
    if (
      !editingSlug ||
      !editProduct
    ) {
      return;
    }

    try {
      await updateProduct(
        editingSlug,
        editProduct
      );

      setProducts(
        (previous) => ({
          ...previous,

          [editingSlug]:
            editProduct,
        })
      );

      closeEdit();

      window.alert(
        "Produit modifié avec succès."
      );
    } catch (error) {
      console.error(
        "Erreur modification produit:",
        error
      );

      const message =
        error instanceof Error
          ? error.message
          : String(error);

      window.alert(
        `Impossible de modifier le produit.\n\n${message}`
      );
    }
  };

  /* =========================================================
     SUPPRIMER PRODUIT
  ========================================================= */

  const deleteProduct = async (
    id: string
  ) => {
    const confirmed =
      window.confirm(
        "Voulez-vous supprimer ce produit ?"
      );

    if (!confirmed) {
      return;
    }

    try {
      await deleteProductFromDb(
        id
      );

      setProducts(
        (previous) => {
          const updated = {
            ...previous,
          };

          delete updated[id];

          return updated;
        }
      );

      window.alert(
        "Produit supprimé avec succès."
      );
    } catch (error) {
      console.error(
        "Erreur suppression produit:",
        error
      );

      const message =
        error instanceof Error
          ? error.message
          : String(error);

      window.alert(
        `Impossible de supprimer le produit.\n\n${message}`
      );
    }
  };

  /* =========================================================
     AJOUT PRODUIT SOCIAL
  ========================================================= */

  const addSocialProduct =
    async () => {
      if (
        !socialName.trim()
      ) {
        window.alert(
          "Écris le nom du produit."
        );
        return;
      }

      const quantity =
        Number(
          socialQuantity
        );

      const price =
        Number(
          socialPrice.replace(
            ",",
            "."
          )
        );

      const oldPrice =
        Number(
          socialOldPrice.replace(
            ",",
            "."
          )
        );

      if (
        !quantity ||
        quantity <= 0
      ) {
        window.alert(
          "Entre une quantité valide."
        );
        return;
      }

      if (
        Number.isNaN(price) ||
        price < 0
      ) {
        window.alert(
          "Entre un prix valide."
        );
        return;
      }

      try {
        const product: SocialProduct =
          {
            name:
              socialName.trim(),

            type:
              socialType,

            quantity,

            price,

            oldPrice:
              Number.isNaN(
                oldPrice
              )
                ? 0
                : oldPrice,

            description:
              socialDescription.trim(),

            active:
              true,

            position:
              Object.keys(
                socialProducts
              ).length,
          };

        const id =
          await createSocialProduct(
            product,
            product.position
          );

        setSocialProducts(
          (previous) => ({
            ...previous,

            [id]:
              product,
          })
        );

        setSocialName("");
        setSocialQuantity("");
        setSocialPrice("");
        setSocialOldPrice("");
        setSocialDescription("");

        window.alert(
          "Produit social ajouté avec succès ✅"
        );
      } catch (error) {
        console.error(
          "Erreur ajout produit social:",
          error
        );

        const message =
          error instanceof Error
            ? error.message
            : String(error);

        window.alert(
          `Impossible d'ajouter le produit social.\n\n${message}`
        );
      }
    };

  /* =========================================================
     VISIBILITÉ PRODUIT SOCIAL
  ========================================================= */

  const toggleSocialProduct =
    async (
      id: string
    ) => {
      const product =
        socialProducts[id];

      if (!product) {
        return;
      }

      const newActive =
        !product.active;

      try {
        await setSocialProductActive(
          id,
          newActive
        );

        setSocialProducts(
          (previous) => ({
            ...previous,

            [id]: {
              ...previous[id],

              active:
                newActive,
            },
          })
        );
      } catch (error) {
        console.error(
          "Erreur changement état produit social:",
          error
        );

        const message =
          error instanceof Error
            ? error.message
            : String(error);

        window.alert(
          `Impossible de modifier l'état du produit.\n\n${message}`
        );
      }
    };

  /* =========================================================
     SUPPRIMER PRODUIT SOCIAL
  ========================================================= */

  const deleteSocial =
    async (
      id: string
    ) => {
      const product =
        socialProducts[id];

      if (!product) {
        return;
      }

      const confirmed =
        window.confirm(
          `Supprimer "${product.name}" ?`
        );

      if (!confirmed) {
        return;
      }

      try {
        await deleteSocialProduct(
          id
        );

        setSocialProducts(
          (previous) => {
            const updated = {
              ...previous,
            };

            delete updated[id];

            return updated;
          }
        );

        window.alert(
          "Produit social supprimé."
        );
      } catch (error) {
        console.error(
          "Erreur suppression produit social:",
          error
        );

        const message =
          error instanceof Error
            ? error.message
            : String(error);

        window.alert(
          `Impossible de supprimer le produit social.\n\n${message}`
        );
      }
    };

  /* =========================================================
     PAIEMENTS
  ========================================================= */

  const updatePaymentMethods =
    (
      updated: PaymentMethod[]
    ) => {
      setPaymentMethods(
        updated
      );

      savePaymentMethods(
        updated
      );
    };

  const addPaymentMethod =
    () => {
      if (
        !newPaymentName.trim() ||
        !newPaymentDetails.trim()
      ) {
        window.alert(
          "Remplis le nom et les détails."
        );

        return;
      }

      const newMethod:
        PaymentMethod =
        {
          id:
            Date.now().toString(),

          name:
            newPaymentName.trim(),

          details:
            newPaymentDetails.trim(),

          active:
            true,
        };

      updatePaymentMethods([
        ...paymentMethods,
        newMethod,
      ]);

      setNewPaymentName("");
      setNewPaymentDetails("");
    };

  const updatePaymentMethod =
    (
      id: string,
      field: keyof PaymentMethod,
      value:
        | string
        | boolean
    ) => {
      const updated =
        paymentMethods.map(
          (method) =>
            method.id === id
              ? {
                  ...method,

                  [field]:
                    value,
                }
              : method
        );

      updatePaymentMethods(
        updated
      );
    };

  const deletePaymentMethod =
    (
      id: string
    ) => {
      const confirmed =
        window.confirm(
          "Supprimer cette méthode de paiement ?"
        );

      if (!confirmed) {
        return;
      }

      updatePaymentMethods(
        paymentMethods.filter(
          (method) =>
            method.id !== id
        )
      );
    };

  /* =========================================================
     CLIENTS
  ========================================================= */

  const updateClients =
    (
      updated: Client[]
    ) => {
      setClients(updated);
      saveClients(updated);
    };

  const addClient =
    () => {
      if (
        !newClient.name.trim() ||
        !newClient.phone.trim()
      ) {
        window.alert(
          "Nom et téléphone obligatoires."
        );

        return;
      }

      const client: Client =
        {
          id:
            Date.now().toString(),

          name:
            newClient.name.trim(),

          phone:
            newClient.phone.trim(),

          note:
            newClient.note.trim(),

          active:
            true,
        };

      updateClients([
        ...clients,
        client,
      ]);

      setNewClient({
        name: "",
        phone: "",
        note: "",
      });
    };

  const updateClient =
    (
      id: string,
      field: keyof Client,
      value:
        | string
        | boolean
    ) => {
      updateClients(
        clients.map(
          (client) =>
            client.id === id
              ? {
                  ...client,

                  [field]:
                    value,
                }
              : client
        )
      );
    };

  const deleteClient =
    (
      id: string
    ) => {
      const confirmed =
        window.confirm(
          "Supprimer ce client ?"
        );

      if (!confirmed) {
        return;
      }

      updateClients(
        clients.filter(
          (client) =>
            client.id !== id
        )
      );
    };

  /* =========================================================
     COMMANDES
  ========================================================= */

  const getOrders =
    (): any[] => {
      try {
        const saved =
          localStorage.getItem(
            "orders"
          );

        if (!saved) {
          return [];
        }

        const parsed =
          JSON.parse(saved);

        return Array.isArray(
          parsed
        )
          ? parsed
          : [];
      } catch {
        return [];
      }
    };

  const orders =
    getOrders();

  const getClientOrders =
    (
      phone: string
    ) => {
      return orders.filter(
        (order: any) =>
          order.customer?.phone ===
          phone
      );
    };

  const clientMatchesFilters =
    (
      client: Client
    ) => {
      const clientOrders =
        getClientOrders(
          client.phone
        );

      return clientOrders.some(
        (order: any) =>
          order.items?.some(
            (item: any) => {
              const productMatch =
                !productFilter ||
                item.name
                  ?.toLowerCase()
                  .includes(
                    productFilter.toLowerCase()
                  );

              const durationMatch =
                !durationFilter ||
                item.duration ===
                  durationFilter;

              return (
                productMatch &&
                durationMatch
              );
            }
          )
      );
    };

  /* =========================================================
     STATISTIQUES
  ========================================================= */

  const totalProducts =
    Object.keys(
      products
    ).length;

  const visibleProducts =
    Object.values(
      products
    ).filter(
      (product) =>
        product.active
    ).length;

  const hiddenProducts =
    totalProducts -
    visibleProducts;

  const getCart =
    (): any[] => {
      try {
        const saved =
          localStorage.getItem(
            "cart"
          );

        if (!saved) {
          return [];
        }

        const parsed =
          JSON.parse(saved);

        return Array.isArray(
          parsed
        )
          ? parsed
          : [];
      } catch {
        return [];
      }
    };

  const cart =
    getCart();

  const totalCartItems =
    cart.reduce(
      (
        sum: number,
        item: any
      ) =>
        sum +
        Number(
          item.quantity || 0
        ),
      0
    );

  const totalCartValue =
    cart.reduce(
      (
        sum: number,
        item: any
      ) => {
        const rawPrice =
          String(
            item.price ?? 0
          )
            .replace(
              /DT/gi,
              ""
            )
            .replace(
              ",",
              "."
            )
            .trim();

        const price =
          Number(
            rawPrice
          ) || 0;

        const quantity =
          Number(
            item.quantity || 0
          ) || 0;

        return (
          sum +
          price *
            quantity
        );
      },
      0
    );

  /* =========================================================
     RENDER
  ========================================================= */

  return (
    <main className="min-h-screen bg-background px-4 py-10 text-foreground sm:px-6">
      <div className="mx-auto max-w-7xl">

        {/* HEADER */}

        <div className="mb-8">
          <h1 className="text-4xl font-bold">
            Dashboard Admin
          </h1>

          <p className="mt-2 text-muted-foreground">
            Gérez les produits,
            clients, paiements
            et produits sociaux.
          </p>
        </div>

        {/* NAVIGATION */}

        <div className="mb-8 flex flex-wrap gap-3">

          <Link
            to="/"
            hash="subscriptions"
            className="inline-flex items-center gap-2 rounded-md bg-primary px-5 py-2 text-primary-foreground transition hover:opacity-90"
          >
            <ShoppingBag className="h-4 w-4" />
            Aller aux produits
          </Link>

          <Link
            to="/admin/wheel"
            className="inline-flex items-center gap-2 rounded-md border border-primary px-5 py-2 text-primary transition hover:bg-primary hover:text-primary-foreground"
          >
            <Gift className="h-4 w-4" />
            Gestion de la roue
          </Link>

        </div>

        {/* STATISTIQUES */}

        <div className="mb-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-5">

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
              {totalCartValue.toFixed(2)} DT
            </h2>
          </div>

        </div>

        {/* =====================================================
            PRODUITS SOCIAUX
        ===================================================== */}

        <section className="mb-8 rounded-2xl border bg-card p-6">

          <h2 className="mb-6 text-2xl font-bold">
            Gestion Followers / Likes / Views
          </h2>

          <div className="mb-6 grid gap-3 md:grid-cols-2 lg:grid-cols-3">

            <select
              className="rounded-md border bg-background px-4 py-2"
              value={socialType}
              onChange={(event) =>
                setSocialType(
                  event.target.value as SocialProductType
                )
              }
            >
              <option value="followers">
                Followers
              </option>

              <option value="likes">
                Likes
              </option>

              <option value="views">
                Views
              </option>
            </select>

            <input
              className="rounded-md border bg-background px-4 py-2"
              placeholder="Nom du produit"
              value={socialName}
              onChange={(event) =>
                setSocialName(
                  event.target.value
                )
              }
            />

            <input
              type="number"
              className="rounded-md border bg-background px-4 py-2"
              placeholder="Quantité"
              value={socialQuantity}
              onChange={(event) =>
                setSocialQuantity(
                  event.target.value
                )
              }
            />

            <input
              type="number"
              step="0.01"
              className="rounded-md border bg-background px-4 py-2"
              placeholder="Prix"
              value={socialPrice}
              onChange={(event) =>
                setSocialPrice(
                  event.target.value
                )
              }
            />

            <input
              type="number"
              step="0.01"
              className="rounded-md border bg-background px-4 py-2"
              placeholder="Ancien prix"
              value={socialOldPrice}
              onChange={(event) =>
                setSocialOldPrice(
                  event.target.value
                )
              }
            />

            <input
              className="rounded-md border bg-background px-4 py-2"
              placeholder="Description"
              value={socialDescription}
              onChange={(event) =>
                setSocialDescription(
                  event.target.value
                )
              }
            />

          </div>

          <button
            type="button"
            onClick={addSocialProduct}
            className="mb-8 rounded-md bg-primary px-5 py-2 text-primary-foreground"
          >
            Ajouter produit social
          </button>

          <div className="overflow-x-auto rounded-2xl border">

            <table className="min-w-[1000px] w-full text-left text-sm">

              <thead className="bg-muted">

                <tr>

                  <th className="p-4">
                    Nom
                  </th>

                  <th className="p-4">
                    Type
                  </th>

                  <th className="p-4">
                    Quantité
                  </th>

                  <th className="p-4">
                    Prix
                  </th>

                  <th className="p-4">
                    Ancien prix
                  </th>

                  <th className="p-4">
                    État
                  </th>

                  <th className="p-4">
                    Actions
                  </th>

                </tr>

              </thead>

              <tbody>

                {socialLoading ? (

                  <tr>

                    <td
                      colSpan={7}
                      className="p-6 text-center"
                    >
                      Chargement...
                    </td>

                  </tr>

                ) : Object.keys(
                    socialProducts
                  ).length === 0 ? (

                  <tr>

                    <td
                      colSpan={7}
                      className="p-6 text-center text-muted-foreground"
                    >
                      Aucun produit social.
                    </td>

                  </tr>

                ) : (

                  Object.entries(
                    socialProducts
                  ).map(
                    ([id, product]) => (

                      <tr
                        key={id}
                        className="border-t"
                      >

                        <td className="p-4 font-medium">
                          {product.name}
                        </td>

                        <td className="p-4">

                          <span className="rounded-full bg-primary/10 px-3 py-1 text-xs font-bold">
                            {product.type}
                          </span>

                        </td>

                        <td className="p-4">
                          {Number(
                            product.quantity
                          ).toLocaleString()}
                        </td>

                        <td className="p-4 font-bold text-primary">
                          {product.price} DT
                        </td>

                        <td className="p-4 text-muted-foreground line-through">
                          {product.oldPrice} DT
                        </td>

                        <td className="p-4">

                          <button
                            type="button"
                            onClick={() =>
                              toggleSocialProduct(
                                id
                              )
                            }
                            className={
                              product.active
                                ? "rounded-full bg-green-600 px-3 py-1 text-xs font-bold text-white"
                                : "rounded-full bg-gray-500 px-3 py-1 text-xs font-bold text-white"
                            }
                          >
                            {product.active
                              ? "Visible"
                              : "Invisible"}
                          </button>

                        </td>

                        <td className="p-4">

                          <button
                            type="button"
                            onClick={() =>
                              deleteSocial(
                                id
                              )
                            }
                            className="rounded-md bg-destructive px-3 py-2 text-xs text-destructive-foreground"
                          >
                            Supprimer
                          </button>

                        </td>

                      </tr>

                    )
                  )

                )}

              </tbody>

            </table>

          </div>

        </section>

        {/* =====================================================
            PRODUITS NORMAUX
        ===================================================== */}

        <section className="mb-8 rounded-2xl border bg-card p-6">

          <h2 className="mb-4 text-2xl font-bold">
            Gestion des produits
          </h2>

          <div className="mb-6 flex flex-col gap-3 sm:flex-row">

            <input
              className="w-full rounded-md border bg-background px-4 py-2"
              placeholder="Nom du nouveau produit"
              value={newName}
              onChange={(event) =>
                setNewName(
                  event.target.value
                )
              }
            />

            <button
              type="button"
              onClick={addProduct}
              className="rounded-md bg-primary px-5 py-2 text-primary-foreground"
            >
              Ajouter
            </button>

          </div>

          {productsLoading && (

            <div className="rounded-2xl border p-6 text-center text-muted-foreground">
              Chargement des produits depuis Supabase...
            </div>

          )}

          {productsError && (

            <div className="rounded-2xl border border-destructive/40 bg-destructive/10 p-6 text-center text-destructive">
              {productsError}
            </div>

          )}

          {!productsLoading &&
            !productsError && (

              <div className="overflow-x-auto rounded-2xl border">

                <table className="min-w-[900px] w-full text-left text-sm">

                  <thead className="bg-muted">

                    <tr>

                      <th className="p-4">
                        Nom
                      </th>

                      <th className="p-4">
                        Prix
                      </th>

                      <th className="p-4">
                        Ancien prix
                      </th>

                      <th className="p-4">
                        Catégorie
                      </th>

                      <th className="p-4">
                        État
                      </th>

                      <th className="p-4">
                        Actions
                      </th>

                    </tr>

                  </thead>

                  <tbody>

                    {Object.entries(
                      products
                    ).map(
                      ([slug, product]) => (

                        <tr
                          key={slug}
                          className="border-t"
                        >

                          <td className="p-4 font-medium">
                            {product.name}
                          </td>

                          <td className="p-4 font-bold text-primary">
                            {
                              product
                                .pricesByDuration?.[
                                "1 month"
                              ] || "0 DT"
                            }
                          </td>

                          <td className="p-4 text-muted-foreground line-through">
                            {product.oldPrice}
                          </td>

                          <td className="p-4">
                            {product.category}
                          </td>

                          <td className="p-4">

                            <button
                              type="button"
                              onClick={() =>
                                toggleVisible(
                                  slug
                                )
                              }
                              className={
                                product.active
                                  ? "rounded-full bg-green-600 px-3 py-1 text-xs font-bold text-white"
                                  : "rounded-full bg-gray-500 px-3 py-1 text-xs font-bold text-white"
                              }
                            >
                              {product.active
                                ? "Visible"
                                : "Invisible"}
                            </button>

                          </td>

                          <td className="p-4">

                            <div className="flex gap-2">

                              <button
                                type="button"
                                onClick={() =>
                                  openEdit(
                                    slug
                                  )
                                }
                                className="rounded-md bg-primary px-3 py-2 text-xs text-primary-foreground"
                              >
                                Modifier
                              </button>

                              <button
                                type="button"
                                onClick={() =>
                                  deleteProduct(
                                    slug
                                  )
                                }
                                className="rounded-md bg-destructive px-3 py-2 text-xs text-destructive-foreground"
                              >
                                Supprimer
                              </button>

                            </div>

                          </td>

                        </tr>

                      )
                    )}

                  </tbody>

                </table>

              </div>

            )}

        </section>

        {/* =====================================================
            CLIENTS
        ===================================================== */}

        <section className="mb-8 rounded-2xl border bg-card p-6">

          <h2 className="mb-4 text-2xl font-bold">
            Gestion des clients
          </h2>

          <div className="mb-4 grid gap-3 md:grid-cols-3">

            <input
              className="rounded-md border bg-background px-4 py-2"
              placeholder="Nom"
              value={newClient.name}
              onChange={(event) =>
                setNewClient({
                  ...newClient,
                  name:
                    event.target.value,
                })
              }
            />

            <input
              className="rounded-md border bg-background px-4 py-2"
              placeholder="Téléphone"
              value={newClient.phone}
              onChange={(event) =>
                setNewClient({
                  ...newClient,
                  phone:
                    event.target.value,
                })
              }
            />

            <button
              type="button"
              onClick={addClient}
              className="rounded-md bg-primary px-5 py-2 text-primary-foreground"
            >
              Ajouter client
            </button>

          </div>

          <textarea
            className="mb-6 w-full rounded-md border bg-background px-4 py-2"
            placeholder="Note client"
            value={newClient.note}
            onChange={(event) =>
              setNewClient({
                ...newClient,
                note:
                  event.target.value,
              })
            }
          />

          <div className="mb-4 flex flex-col gap-3 sm:flex-row">

            <input
              className="rounded-md border bg-background px-4 py-2"
              placeholder="Produit, ex. ChatGPT"
              value={productFilter}
              onChange={(event) =>
                setProductFilter(
                  event.target.value
                )
              }
            />

            <select
              className="rounded-md border bg-background px-4 py-2"
              value={durationFilter}
              onChange={(event) =>
                setDurationFilter(
                  event.target.value
                )
              }
            >

              <option value="">
                Toutes les durées
              </option>

              <option value="1 month">
                1 mois
              </option>

              <option value="6 months">
                6 mois
              </option>

              <option value="1 year">
                1 an
              </option>

            </select>

          </div>

          <div className="overflow-x-auto rounded-2xl border">

            <table className="min-w-[900px] w-full text-left text-sm">

              <thead className="bg-muted">

                <tr>

                  <th className="p-4">
                    Nom
                  </th>

                  <th className="p-4">
                    Téléphone
                  </th>

                  <th className="p-4">
                    Commandes
                  </th>

                  <th className="p-4">
                    État
                  </th>

                  <th className="p-4">
                    Action
                  </th>

                </tr>

              </thead>

              <tbody>

                {clients
                  .filter(
                    (client) =>
                      !productFilter &&
                      !durationFilter
                        ? true
                        : clientMatchesFilters(
                            client
                          )
                  )
                  .map(
                    (client) => (

                      <tr
                        key={client.id}
                        className="border-t"
                      >

                        <td className="p-4">

                          <input
                            className="w-full rounded-md border bg-background px-3 py-2"
                            value={
                              client.name
                            }
                            onChange={(
                              event
                            ) =>
                              updateClient(
                                client.id,
                                "name",
                                event.target
                                  .value
                              )
                            }
                          />

                        </td>

                        <td className="p-4">

                          <input
                            className="w-full rounded-md border bg-background px-3 py-2"
                            value={
                              client.phone
                            }
                            onChange={(
                              event
                            ) =>
                              updateClient(
                                client.id,
                                "phone",
                                event.target
                                  .value
                              )
                            }
                          />

                        </td>

                        <td className="p-4">

                          {getClientOrders(
                            client.phone
                          ).length === 0 ? (

                            <span className="text-muted-foreground">
                              Aucune commande
                            </span>

                          ) : (

                            <div className="max-h-40 space-y-2 overflow-auto">

                              {getClientOrders(
                                client.phone
                              ).map(
                                (
                                  order: any
                                ) => (

                                  <div
                                    key={
                                      order.id
                                    }
                                    className="rounded-md border bg-muted/30 p-2 text-xs"
                                  >

                                    <div className="font-bold text-primary">
                                      {
                                        order.total
                                      }{" "}
                                      DT
                                    </div>

                                    {order.items?.map(
                                      (
                                        item: any,
                                        itemIndex: number
                                      ) => (

                                        <div
                                          key={`${item.slug}-${itemIndex}`}
                                        >
                                          {
                                            item.name
                                          }{" "}
                                          ×{" "}
                                          {
                                            item.quantity
                                          }
                                        </div>

                                      )
                                    )}

                                  </div>

                                )
                              )}

                            </div>

                          )}

                        </td>

                        <td className="p-4">

                          <button
                            type="button"
                            onClick={() =>
                              updateClient(
                                client.id,
                                "active",
                                !client.active
                              )
                            }
                            className={
                              client.active
                                ? "rounded-full bg-green-600 px-3 py-1 text-xs font-bold text-white"
                                : "rounded-full bg-gray-500 px-3 py-1 text-xs font-bold text-white"
                            }
                          >
                            {client.active
                              ? "Actif"
                              : "Inactif"}
                          </button>

                        </td>

                        <td className="p-4">

                          <button
                            type="button"
                            onClick={() =>
                              deleteClient(
                                client.id
                              )
                            }
                            className="rounded-md bg-destructive px-3 py-2 text-xs text-destructive-foreground"
                          >
                            Supprimer
                          </button>

                        </td>

                      </tr>

                    )
                  )}

              </tbody>

            </table>

          </div>

        </section>

        {/* =====================================================
            PAIEMENTS
        ===================================================== */}

        <section className="mb-8 rounded-2xl border bg-card p-6">

          <h2 className="mb-4 text-2xl font-bold">
            Méthodes de paiement
          </h2>

          <div className="mb-6 grid gap-3 md:grid-cols-3">

            <input
              className="rounded-md border bg-background px-4 py-2"
              placeholder="Nom, ex. D17"
              value={newPaymentName}
              onChange={(event) =>
                setNewPaymentName(
                  event.target.value
                )
              }
            />

            <input
              className="rounded-md border bg-background px-4 py-2"
              placeholder="Numéro, RIB ou adresse"
              value={newPaymentDetails}
              onChange={(event) =>
                setNewPaymentDetails(
                  event.target.value
                )
              }
            />

            <button
              type="button"
              onClick={
                addPaymentMethod
              }
              className="rounded-md bg-primary px-5 py-2 text-primary-foreground"
            >
              Ajouter méthode
            </button>

          </div>

          <div className="overflow-x-auto rounded-2xl border">

            <table className="min-w-[700px] w-full text-left text-sm">

              <thead className="bg-muted">

                <tr>

                  <th className="p-4">
                    Nom
                  </th>

                  <th className="p-4">
                    Détails
                  </th>

                  <th className="p-4">
                    État
                  </th>

                  <th className="p-4">
                    Action
                  </th>

                </tr>

              </thead>

              <tbody>

                {paymentMethods.map(
                  (method) => (

                    <tr
                      key={
                        method.id
                      }
                      className="border-t"
                    >

                      <td className="p-4">

                        <input
                          className="w-full rounded-md border bg-background px-3 py-2"
                          value={
                            method.name
                          }
                          onChange={(
                            event
                          ) =>
                            updatePaymentMethod(
                              method.id,
                              "name",
                              event.target
                                .value
                            )
                          }
                        />

                      </td>

                      <td className="p-4">

                        <input
                          className="w-full rounded-md border bg-background px-3 py-2"
                          value={
                            method.details
                          }
                          onChange={(
                            event
                          ) =>
                            updatePaymentMethod(
                              method.id,
                              "details",
                              event.target
                                .value
                            )
                          }
                        />

                      </td>

                      <td className="p-4">

                        <button
                          type="button"
                          onClick={() =>
                            updatePaymentMethod(
                              method.id,
                              "active",
                              !method.active
                            )
                          }
                          className={
                            method.active
                              ? "rounded-full bg-green-600 px-3 py-1 text-xs font-bold text-white"
                              : "rounded-full bg-gray-500 px-3 py-1 text-xs font-bold text-white"
                          }
                        >
                          {method.active
                            ? "Active"
                            : "Inactive"}
                        </button>

                      </td>

                      <td className="p-4">

                        <button
                          type="button"
                          onClick={() =>
                            deletePaymentMethod(
                              method.id
                            )
                          }
                          className="rounded-md bg-destructive px-3 py-2 text-xs text-destructive-foreground"
                        >
                          Supprimer
                        </button>

                      </td>

                    </tr>

                  )
                )}

              </tbody>

            </table>

          </div>

        </section>

      </div>

      {/* =====================================================
          MODAL MODIFICATION PRODUIT
      ===================================================== */}

      {editingSlug &&
        editProduct && (

          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 px-4">

            <div className="max-h-[90vh] w-full max-w-2xl overflow-auto rounded-2xl bg-background p-6 shadow-xl">

              <h2 className="mb-5 text-2xl font-bold">
                Modifier le produit
              </h2>

              <div className="grid gap-3">

                <input
                  className="rounded-md border bg-background px-4 py-2"
                  value={
                    editProduct.name
                  }
                  onChange={(event) =>
                    setEditProduct({
                      ...editProduct,

                      name:
                        event.target
                          .value,
                    })
                  }
                  placeholder="Nom"
                />

                <input
                  className="rounded-md border bg-background px-4 py-2"
                  value={
                    editProduct.oldPrice
                  }
                  onChange={(event) =>
                    setEditProduct({
                      ...editProduct,

                      oldPrice:
                        event.target
                          .value,
                    })
                  }
                  placeholder="Ancien prix"
                />

                <input
                  className="rounded-md border bg-background px-4 py-2"
                  value={
                    editProduct
                      .pricesByDuration?.[
                      "1 month"
                    ] || ""
                  }
                  onChange={(event) =>
                    setEditProduct({
                      ...editProduct,

                      pricesByDuration:
                        {
                          ...editProduct.pricesByDuration,

                          "1 month":
                            event.target
                              .value,
                        },
                    })
                  }
                  placeholder="Prix 1 mois"
                />

                <input
                  className="rounded-md border bg-background px-4 py-2"
                  value={
                    editProduct
                      .pricesByDuration?.[
                      "6 months"
                    ] || ""
                  }
                  onChange={(event) =>
                    setEditProduct({
                      ...editProduct,

                      pricesByDuration:
                        {
                          ...editProduct.pricesByDuration,

                          "6 months":
                            event.target
                              .value,
                        },
                    })
                  }
                  placeholder="Prix 6 mois"
                />

                <input
                  className="rounded-md border bg-background px-4 py-2"
                  value={
                    editProduct
                      .pricesByDuration?.[
                      "1 year"
                    ] || ""
                  }
                  onChange={(event) =>
                    setEditProduct({
                      ...editProduct,

                      pricesByDuration:
                        {
                          ...editProduct.pricesByDuration,

                          "1 year":
                            event.target
                              .value,
                        },
                    })
                  }
                  placeholder="Prix 1 an"
                />

                <input
                  className="rounded-md border bg-background px-4 py-2"
                  value={
                    editProduct.category
                  }
                  onChange={(event) =>
                    setEditProduct({
                      ...editProduct,

                      category:
                        event.target
                          .value,
                    })
                  }
                  placeholder="Catégorie"
                />

                <textarea
                  className="rounded-md border bg-background px-4 py-2"
                  value={
                    editProduct.description
                  }
                  onChange={(event) =>
                    setEditProduct({
                      ...editProduct,

                      description:
                        event.target
                          .value,
                    })
                  }
                  placeholder="Description"
                />

                <textarea
                  className="min-h-32 rounded-md border bg-background px-4 py-2"
                  value={
                    editProduct.features.join(
                      "\n"
                    )
                  }
                  onChange={(event) =>
                    setEditProduct({
                      ...editProduct,

                      features:
                        event.target.value
                          .split("\n")
                          .filter(
                            (feature) =>
                              feature.trim()
                          ),
                    })
                  }
                  placeholder="Une fonctionnalité par ligne"
                />

                <label className="flex items-center gap-2">

                  <input
                    type="checkbox"
                    checked={
                      editProduct.active
                    }
                    onChange={(event) =>
                      setEditProduct({
                        ...editProduct,

                        active:
                          event.target
                            .checked,
                      })
                    }
                  />

                  Produit visible

                </label>

              </div>

              <div className="mt-6 flex justify-end gap-3">

                <button
                  type="button"
                  onClick={closeEdit}
                  className="rounded-md border px-4 py-2"
                >
                  Annuler
                </button>

                <button
                  type="button"
                  onClick={saveEdit}
                  className="rounded-md bg-primary px-4 py-2 text-primary-foreground"
                >
                  Enregistrer
                </button>

              </div>

            </div>

          </div>

        )}

    </main>
  );
}
