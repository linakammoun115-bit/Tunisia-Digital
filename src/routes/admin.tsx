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
  Users,
  CreditCard,
  Eye,
  Heart,
  UserPlus,
  Trash2,
  Pencil,
  Plus,
  RefreshCw,
} from "lucide-react";

import {
  getProducts,
  createProduct,
  updateProduct,
  deleteProduct,
  setProductActive,
  type Subscription,
} from "@/lib/products";

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

import {
  getSocialProducts,
  createSocialProduct,
  updateSocialProduct,
  deleteSocialProduct,
  setSocialProductActive,
  type SocialProduct,
} from "@/lib/socialProducts";


export const Route = createFileRoute("/admin")({
  component: AdminPage,
});


function slugify(text: string) {
  return text
    .toLowerCase()
    .trim()
    .replace(/\s+/g, "-")
    .replace(/[^a-z0-9-]/g, "");
}


function AdminPage() {
  const navigate = useNavigate();

  /* =========================================================
     PRODUCTS
  ========================================================= */

  const [products, setProducts] = useState<
    Record<string, Subscription>
  >({});

  const [productsLoading, setProductsLoading] =
    useState(true);

  const [editingSlug, setEditingSlug] =
    useState<string | null>(null);

  const [editProduct, setEditProduct] =
    useState<Subscription | null>(null);

  const [newName, setNewName] =
    useState("");

  /* =========================================================
     SOCIAL PRODUCTS
  ========================================================= */

  const [socialProducts, setSocialProducts] =
    useState<SocialProduct[]>([]);

  const [socialLoading, setSocialLoading] =
    useState(true);

  const [editingSocialProduct, setEditingSocialProduct] =
    useState<SocialProduct | null>(null);

  const [newSocialProduct, setNewSocialProduct] =
    useState({
      name: "",
      type: "followers",
      quantity: 1000,
      price: 0,
      oldPrice: 0,
      description: "",
    });

  /* =========================================================
     CLIENTS
  ========================================================= */

  const [clients, setClients] =
    useState<Client[]>(getClients);

  const [newClient, setNewClient] =
    useState({
      name: "",
      phone: "",
      note: "",
    });

  /* =========================================================
     PAYMENT METHODS
  ========================================================= */

  const [paymentMethods, setPaymentMethods] =
    useState<PaymentMethod[]>(
      getPaymentMethods
    );

  const [newPaymentName, setNewPaymentName] =
    useState("");

  const [newPaymentDetails, setNewPaymentDetails] =
    useState("");

  /* =========================================================
     FILTERS
  ========================================================= */

  const [productFilter, setProductFilter] =
    useState("");

  const [durationFilter, setDurationFilter] =
    useState("");

  /* =========================================================
     ADMIN AUTH
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
     LOAD PRODUCTS FROM SUPABASE
  ========================================================= */

  const loadProducts = async () => {
    try {
      setProductsLoading(true);

      const data = await getProducts();

      setProducts(data);
    } catch (error) {
      console.error(
        "Erreur chargement produits:",
        error
      );

      window.alert(
        `Impossible de charger les produits.\n\n${
          error instanceof Error
            ? error.message
            : "Erreur inconnue"
        }`
      );
    } finally {
      setProductsLoading(false);
    }
  };


  /* =========================================================
     LOAD SOCIAL PRODUCTS
  ========================================================= */

  const loadSocialProducts = async () => {
    try {
      setSocialLoading(true);

      const data =
        await getSocialProducts();

      setSocialProducts(data);
    } catch (error) {
      console.error(
        "Erreur chargement produits sociaux:",
        error
      );

      window.alert(
        `Impossible de charger Followers / Views / Likes.\n\n${
          error instanceof Error
            ? error.message
            : "Erreur inconnue"
        }`
      );
    } finally {
      setSocialLoading(false);
    }
  };


  /* =========================================================
     INITIAL LOAD
  ========================================================= */

  useEffect(() => {
    void loadProducts();
    void loadSocialProducts();
  }, []);


  /* =========================================================
     CREATE NORMAL PRODUCT
  ========================================================= */

  const addProduct = async () => {
    if (!newName.trim()) {
      window.alert(
        "Écris le nom du produit."
      );

      return;
    }

    const slug = slugify(newName);

    const existingProduct =
      Object.values(products).find(
        (product) =>
          slugify(product.name) === slug
      );

    if (existingProduct) {
      window.alert(
        "Ce produit existe déjà."
      );

      return;
    }

    try {
      const product: Subscription = {
        name: newName.trim(),

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
      };

      await createProduct(
        product,
        Object.keys(products).length
      );

      await loadProducts();

      setNewName("");

      window.alert(
        "Produit ajouté avec succès."
      );
    } catch (error) {
      console.error(
        "Erreur ajout produit:",
        error
      );

      window.alert(
        `Impossible d'ajouter le produit.\n\n${
          error instanceof Error
            ? error.message
            : "Erreur inconnue"
        }`
      );
    }
  };


  /* =========================================================
     TOGGLE NORMAL PRODUCT
  ========================================================= */

  const toggleVisible = async (
    slug: string
  ) => {
    const product = products[slug];

    if (!product) {
      return;
    }

    try {
      await setProductActive(
        slug,
        !product.active
      );

      setProducts((current) => ({
        ...current,

        [slug]: {
          ...current[slug],

          active:
            !current[slug].active,
        },
      }));
    } catch (error) {
      console.error(
        "Erreur changement visibilité:",
        error
      );

      window.alert(
        `Impossible de modifier la visibilité.\n\n${
          error instanceof Error
            ? error.message
            : "Erreur inconnue"
        }`
      );
    }
  };


  /* =========================================================
     OPEN NORMAL PRODUCT EDIT
  ========================================================= */

  const openEdit = (
    slug: string
  ) => {
    const product =
      products[slug];

    if (!product) {
      return;
    }

    setEditingSlug(slug);

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


  /* =========================================================
     CLOSE NORMAL PRODUCT EDIT
  ========================================================= */

  const closeEdit = () => {
    setEditingSlug(null);

    setEditProduct(null);
  };


  /* =========================================================
     SAVE NORMAL PRODUCT
  ========================================================= */

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

      setProducts((current) => ({
        ...current,

        [editingSlug]:
          editProduct,
      }));

      closeEdit();

      window.alert(
        "Produit modifié avec succès."
      );
    } catch (error) {
      console.error(
        "Erreur modification produit:",
        error
      );

      window.alert(
        `Impossible de modifier le produit.\n\n${
          error instanceof Error
            ? error.message
            : "Erreur inconnue"
        }`
      );
    }
  };


  /* =========================================================
     DELETE NORMAL PRODUCT
  ========================================================= */

  const removeProduct = async (
    slug: string
  ) => {
    const product =
      products[slug];

    if (!product) {
      return;
    }

    const confirmed =
      window.confirm(
        `Voulez-vous supprimer "${product.name}" ?`
      );

    if (!confirmed) {
      return;
    }

    try {
      await deleteProduct(slug);

      setProducts((current) => {
        const updated = {
          ...current,
        };

        delete updated[slug];

        return updated;
      });

      if (editingSlug === slug) {
        closeEdit();
      }

      window.alert(
        "Produit supprimé."
      );
    } catch (error) {
      console.error(
        "Erreur suppression produit:",
        error
      );

      window.alert(
        `Impossible de supprimer le produit.\n\n${
          error instanceof Error
            ? error.message
            : "Erreur inconnue"
        }`
      );
    }
  };


  /* =========================================================
     ADD SOCIAL PRODUCT
  ========================================================= */

  const addSocialProduct = async () => {
    if (
      !newSocialProduct.name.trim()
    ) {
      window.alert(
        "Écris le nom du produit."
      );

      return;
    }

    if (
      Number(
        newSocialProduct.quantity
      ) <= 0
    ) {
      window.alert(
        "La quantité doit être supérieure à 0."
      );

      return;
    }

    if (
      Number(
        newSocialProduct.price
      ) < 0
    ) {
      window.alert(
        "Le prix ne peut pas être négatif."
      );

      return;
    }

    try {
      const created =
        await createSocialProduct({
          name:
            newSocialProduct.name.trim(),

          type:
            newSocialProduct.type,

          quantity:
            Number(
              newSocialProduct.quantity
            ),

          price:
            Number(
              newSocialProduct.price
            ),

          oldPrice:
            Number(
              newSocialProduct.oldPrice
            ),

          description:
            newSocialProduct.description.trim(),

          active: true,

          position:
            socialProducts.length,
        });

      setSocialProducts(
        (current) => [
          ...current,
          created,
        ]
      );

      setNewSocialProduct({
        name: "",
        type: "followers",
        quantity: 1000,
        price: 0,
        oldPrice: 0,
        description: "",
      });

      window.alert(
        "Produit social ajouté avec succès."
      );
    } catch (error) {
      console.error(
        "Erreur ajout produit social:",
        error
      );

      window.alert(
        `Impossible d'ajouter le produit.\n\n${
          error instanceof Error
            ? error.message
            : "Erreur inconnue"
        }`
      );
    }
  };


  /* =========================================================
     UPDATE SOCIAL PRODUCT
  ========================================================= */

  const updateSocialProductAdmin =
    async (
      product: SocialProduct
    ) => {
      try {
        await updateSocialProduct(
          product.id,
          product
        );

        setSocialProducts(
          (current) =>
            current.map(
              (item) =>
                item.id ===
                product.id
                  ? product
                  : item
            )
        );

        setEditingSocialProduct(
          null
        );

        window.alert(
          "Produit social modifié avec succès."
        );
      } catch (error) {
        console.error(
          "Erreur modification produit social:",
          error
        );

        window.alert(
          `Impossible de modifier le produit.\n\n${
            error instanceof Error
              ? error.message
              : "Erreur inconnue"
          }`
        );
      }
    };


  /* =========================================================
     TOGGLE SOCIAL PRODUCT
  ========================================================= */

  const toggleSocialProduct =
    async (
      product: SocialProduct
    ) => {
      const newActive =
        !product.active;

      try {
        await setSocialProductActive(
          product.id,
          newActive
        );

        setSocialProducts(
          (current) =>
            current.map(
              (item) =>
                item.id ===
                product.id
                  ? {
                      ...item,
                      active:
                        newActive,
                    }
                  : item
            )
        );
      } catch (error) {
        console.error(
          "Erreur changement état social:",
          error
        );

        window.alert(
          `Impossible de modifier l'état du produit.\n\n${
            error instanceof Error
              ? error.message
              : "Erreur inconnue"
          }`
        );
      }
    };


  /* =========================================================
     DELETE SOCIAL PRODUCT
  ========================================================= */

  const removeSocialProduct =
    async (
      product: SocialProduct
    ) => {
      const confirmed =
        window.confirm(
          `Supprimer "${product.name}" ?`
        );

      if (!confirmed) {
        return;
      }

      try {
        await deleteSocialProduct(
          product.id
        );

        setSocialProducts(
          (current) =>
            current.filter(
              (item) =>
                item.id !==
                product.id
            )
        );

        if (
          editingSocialProduct?.id ===
          product.id
        ) {
          setEditingSocialProduct(
            null
          );
        }

        window.alert(
          "Produit supprimé."
        );
      } catch (error) {
        console.error(
          "Erreur suppression social:",
          error
        );

        window.alert(
          `Impossible de supprimer le produit.\n\n${
            error instanceof Error
              ? error.message
              : "Erreur inconnue"
          }`
        );
      }
    };


  /* =========================================================
     CLIENTS
  ========================================================= */

  const updateClients = (
    updated: Client[]
  ) => {
    setClients(updated);

    saveClients(updated);
  };


  const addClient = () => {
    if (
      !newClient.name.trim() ||
      !newClient.phone.trim()
    ) {
      window.alert(
        "Nom et téléphone obligatoires."
      );

      return;
    }

    updateClients([
      ...clients,

      {
        id:
          Date.now().toString(),

        name:
          newClient.name.trim(),

        phone:
          newClient.phone.trim(),

        note:
          newClient.note.trim(),

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


  const deleteClient = (
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
     PAYMENT METHODS
  ========================================================= */

  const updatePaymentMethods = (
    updated: PaymentMethod[]
  ) => {
    setPaymentMethods(
      updated
    );

    savePaymentMethods(
      updated
    );
  };


  const addPaymentMethod = () => {
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
      PaymentMethod = {
      id:
        Date.now().toString(),

      name:
        newPaymentName.trim(),

      details:
        newPaymentDetails.trim(),

      active: true,
    };

    updatePaymentMethods([
      ...paymentMethods,
      newMethod,
    ]);

    setNewPaymentName("");

    setNewPaymentDetails("");
  };


  const updatePaymentMethod = (
    id: string,
    field: keyof PaymentMethod,
    value: string | boolean
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


  const deletePaymentMethod = (
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
     ORDERS
  ========================================================= */

  const orders = JSON.parse(
    localStorage.getItem(
      "orders"
    ) || "[]"
  );


  const getClientOrders = (
    phone: string
  ) => {
    return orders.filter(
      (order: any) =>
        order.customer?.phone ===
        phone
    );
  };


  const clientMatchesFilters = (
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
     DASHBOARD STATS
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

  const socialTotal =
    socialProducts.length;

  const followersCount =
    socialProducts.filter(
      (product) =>
        product.type ===
        "followers"
    ).length;

  const viewsCount =
    socialProducts.filter(
      (product) =>
        product.type ===
        "views"
    ).length;

  const likesCount =
    socialProducts.filter(
      (product) =>
        product.type ===
        "likes"
    ).length;


  const cart = JSON.parse(
    localStorage.getItem(
      "cart"
    ) || "[]"
  );


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
      ) =>
        sum +
        Number(
          item.price || 0
        ) *
          Number(
            item.quantity || 0
          ),
      0
    );


  /* =========================================================
     RENDER
  ========================================================= */

  return (
    <main className="min-h-screen bg-background px-4 py-10 text-foreground sm:px-6">

      <div className="mx-auto max-w-7xl">

        {/* =================================================
            HEADER
        ================================================= */}

        <div className="mb-8">

          <h1 className="text-4xl font-bold">
            Dashboard Admin
          </h1>

          <p className="mt-2 text-muted-foreground">
            Gérez les produits,
            Followers, Views,
            Likes, clients et
            paiements.
          </p>

        </div>


        {/* =================================================
            NAVIGATION
        ================================================= */}

        <div className="mb-10 flex flex-wrap gap-3">

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


        {/* =================================================
            STATS
        ================================================= */}

        <div className="mb-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">

          <div className="rounded-2xl border bg-card p-5">

            <p className="text-sm text-muted-foreground">
              Produits classiques
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
              Produits sociaux
            </p>

            <h2 className="text-3xl font-bold">
              {socialTotal}
            </h2>

          </div>


          <div className="rounded-2xl border bg-card p-5">

            <p className="text-sm text-muted-foreground">
              Valeur panier
            </p>

            <h2 className="text-3xl font-bold">
              {totalCartValue.toFixed(
                2
              )}{" "}
              DT
            </h2>

          </div>

        </div>


        {/* =================================================
            SOCIAL QUICK STATS
        ================================================= */}

        <section className="mb-8 grid gap-4 md:grid-cols-3">

          <div className="rounded-2xl border bg-card p-5">

            <div className="mb-3 flex items-center gap-3">

              <UserPlus className="h-5 w-5" />

              <h3 className="font-bold">
                Followers
              </h3>

            </div>

            <p className="text-3xl font-bold">
              {followersCount}
            </p>

          </div>


          <div className="rounded-2xl border bg-card p-5">

            <div className="mb-3 flex items-center gap-3">

              <Eye className="h-5 w-5" />

              <h3 className="font-bold">
                Views
              </h3>

            </div>

            <p className="text-3xl font-bold">
              {viewsCount}
            </p>

          </div>


          <div className="rounded-2xl border bg-card p-5">

            <div className="mb-3 flex items-center gap-3">

              <Heart className="h-5 w-5" />

              <h3 className="font-bold">
                Likes
              </h3>

            </div>

            <p className="text-3xl font-bold">
              {likesCount}
            </p>

          </div>

        </section>


        {/* =================================================
            SOCIAL PRODUCTS
        ================================================= */}

        <section className="mb-8 rounded-2xl border bg-card p-6">

          <div className="mb-6 flex flex-wrap items-center justify-between gap-3">

            <div>

              <h2 className="text-2xl font-bold">
                Gestion Followers /
                Views / Likes
              </h2>

              <p className="mt-1 text-sm text-muted-foreground">
                Produits sociaux
                enregistrés dans
                Supabase.
              </p>

            </div>


            <button
              type="button"
              onClick={() =>
                void loadSocialProducts()
              }
              className="inline-flex items-center gap-2 rounded-md border px-4 py-2"
            >

              <RefreshCw className="h-4 w-4" />

              Actualiser

            </button>

          </div>


          {/* ADD SOCIAL PRODUCT */}

          <div className="mb-8 rounded-2xl border bg-background p-5">

            <h3 className="mb-4 text-lg font-bold">
              Ajouter un produit
              social
            </h3>


            <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">

              <input
                className="rounded-md border bg-background px-4 py-2"
                placeholder="Nom du produit"
                value={
                  newSocialProduct.name
                }
                onChange={(event) =>
                  setNewSocialProduct(
                    {
                      ...newSocialProduct,
                      name:
                        event.target
                          .value,
                    }
                  )
                }
              />


              <select
                className="rounded-md border bg-background px-4 py-2"
                value={
                  newSocialProduct.type
                }
                onChange={(event) =>
                  setNewSocialProduct(
                    {
                      ...newSocialProduct,
                      type:
                        event.target
                          .value,
                    }
                  )
                }
              >

                <option value="followers">
                  Followers
                </option>

                <option value="views">
                  Views
                </option>

                <option value="likes">
                  Likes
                </option>

              </select>


              <input
                type="number"
                min="1"
                className="rounded-md border bg-background px-4 py-2"
                placeholder="Quantité"
                value={
                  newSocialProduct.quantity
                }
                onChange={(event) =>
                  setNewSocialProduct(
                    {
                      ...newSocialProduct,
                      quantity:
                        Number(
                          event.target
                            .value
                        ),
                    }
                  )
                }
              />


              <input
                type="number"
                min="0"
                step="0.01"
                className="rounded-md border bg-background px-4 py-2"
                placeholder="Prix"
                value={
                  newSocialProduct.price
                }
                onChange={(event) =>
                  setNewSocialProduct(
                    {
                      ...newSocialProduct,
                      price:
                        Number(
                          event.target
                            .value
                        ),
                    }
                  )
                }
              />


              <input
                type="number"
                min="0"
                step="0.01"
                className="rounded-md border bg-background px-4 py-2"
                placeholder="Ancien prix"
                value={
                  newSocialProduct.oldPrice
                }
                onChange={(event) =>
                  setNewSocialProduct(
                    {
                      ...newSocialProduct,
                      oldPrice:
                        Number(
                          event.target
                            .value
                        ),
                    }
                  )
                }
              />


              <input
                className="rounded-md border bg-background px-4 py-2"
                placeholder="Description"
                value={
                  newSocialProduct.description
                }
                onChange={(event) =>
                  setNewSocialProduct(
                    {
                      ...newSocialProduct,
                      description:
                        event.target
                          .value,
                    }
                  )
                }
              />

            </div>


            <button
              type="button"
              onClick={() =>
                void addSocialProduct()
              }
              className="mt-4 inline-flex items-center gap-2 rounded-md bg-primary px-5 py-2 text-primary-foreground"
            >

              <Plus className="h-4 w-4" />

              Ajouter produit

            </button>

          </div>


          {/* SOCIAL PRODUCTS TABLE */}

          {socialLoading ? (

            <div className="rounded-xl border p-8 text-center text-muted-foreground">

              Chargement des produits
              sociaux...

            </div>

          ) : socialProducts.length ===
            0 ? (

            <div className="rounded-xl border p-8 text-center text-muted-foreground">

              Aucun produit
              Followers / Views /
              Likes.

            </div>

          ) : (

            <div className="overflow-x-auto rounded-2xl border">

              <table className="min-w-[1100px] w-full text-left text-sm">

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

                  {socialProducts.map(
                    (product) => (

                      <tr
                        key={
                          product.id
                        }
                        className="border-t"
                      >

                        <td className="p-4 font-medium">
                          {
                            product.name
                          }
                        </td>


                        <td className="p-4">

                          <span className="rounded-full bg-primary/10 px-3 py-1 text-xs font-bold text-primary">

                            {
                              product.type ===
                              "followers"
                                ? "Followers"
                                : product.type ===
                                  "views"
                                  ? "Views"
                                  : "Likes"
                            }

                          </span>

                        </td>


                        <td className="p-4 font-bold">

                          {Number(
                            product.quantity
                          ).toLocaleString()}

                        </td>


                        <td className="p-4 font-bold text-primary">

                          {Number(
                            product.price
                          ).toFixed(
                            2
                          )}{" "}
                          DT

                        </td>


                        <td className="p-4 text-muted-foreground line-through">

                          {Number(
                            product.oldPrice
                          ).toFixed(
                            2
                          )}{" "}
                          DT

                        </td>


                        <td className="p-4">

                          <button
                            type="button"
                            onClick={() =>
                              void toggleSocialProduct(
                                product
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
                                setEditingSocialProduct(
                                  {
                                    ...product,
                                  }
                                )
                              }
                              className="inline-flex items-center gap-1 rounded-md bg-primary px-3 py-2 text-xs text-primary-foreground"
                            >

                              <Pencil className="h-3 w-3" />

                              Modifier

                            </button>


                            <button
                              type="button"
                              onClick={() =>
                                void removeSocialProduct(
                                  product
                                )
                              }
                              className="inline-flex items-center gap-1 rounded-md bg-destructive px-3 py-2 text-xs text-destructive-foreground"
                            >

                              <Trash2 className="h-3 w-3" />

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


        {/* =================================================
            NORMAL PRODUCTS
        ================================================= */}

        <section className="mb-8 rounded-2xl border bg-card p-6">

          <div className="mb-6 flex flex-wrap items-center justify-between gap-3">

            <div>

              <h2 className="text-2xl font-bold">
                Gestion des produits
              </h2>

              <p className="mt-1 text-sm text-muted-foreground">
                Produits de la table
                Supabase
                <code className="ml-1">
                  products
                </code>
              </p>

            </div>


            <button
              type="button"
              onClick={() =>
                void loadProducts()
              }
              className="inline-flex items-center gap-2 rounded-md border px-4 py-2"
            >

              <RefreshCw className="h-4 w-4" />

              Actualiser

            </button>

          </div>


          {/* ADD NORMAL PRODUCT */}

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
              onClick={() =>
                void addProduct()
              }
              className="inline-flex items-center justify-center gap-2 rounded-md bg-primary px-5 py-2 text-primary-foreground"
            >

              <Plus className="h-4 w-4" />

              Ajouter

            </button>

          </div>


          {productsLoading ? (

            <div className="rounded-xl border p-8 text-center text-muted-foreground">

              Chargement des
              produits...

            </div>

          ) : (

            <div className="overflow-x-auto rounded-2xl border">

              <table className="min-w-[1000px] w-full text-left text-sm">

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
                    ([
                      slug,
                      product,
                    ]) => (

                      <tr
                        key={slug}
                        className="border-t"
                      >

                        <td className="p-4 font-medium">
                          {
                            product.name
                          }
                        </td>


                        <td className="p-4 font-bold text-primary">

                          {
                            product
                              .pricesByDuration?.[
                              "1 month"
                            ] ||
                            "0 DT"
                          }

                        </td>


                        <td className="p-4 text-muted-foreground line-through">

                          {
                            product.oldPrice
                          }

                        </td>


                        <td className="p-4">

                          {
                            product.category
                          }

                        </td>


                        <td className="p-4">

                          <button
                            type="button"
                            onClick={() =>
                              void toggleVisible(
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
                              className="inline-flex items-center gap-1 rounded-md bg-primary px-3 py-2 text-xs text-primary-foreground"
                            >

                              <Pencil className="h-3 w-3" />

                              Modifier

                            </button>


                            <button
                              type="button"
                              onClick={() =>
                                void removeProduct(
                                  slug
                                )
                              }
                              className="inline-flex items-center gap-1 rounded-md bg-destructive px-3 py-2 text-xs text-destructive-foreground"
                            >

                              <Trash2 className="h-3 w-3" />

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


        {/* =================================================
            CLIENTS
        ================================================= */}

        <section className="mb-8 rounded-2xl border bg-card p-6">

          <div className="mb-6 flex items-center gap-3">

            <Users className="h-6 w-6" />

            <h2 className="text-2xl font-bold">
              Gestion des clients
            </h2>

          </div>


          <div className="mb-4 grid gap-3 md:grid-cols-3">

            <input
              className="rounded-md border bg-background px-4 py-2"
              placeholder="Nom"
              value={
                newClient.name
              }
              onChange={(event) =>
                setNewClient({
                  ...newClient,
                  name:
                    event.target
                      .value,
                })
              }
            />


            <input
              className="rounded-md border bg-background px-4 py-2"
              placeholder="Téléphone"
              value={
                newClient.phone
              }
              onChange={(event) =>
                setNewClient({
                  ...newClient,
                  phone:
                    event.target
                      .value,
                })
              }
            />


            <button
              type="button"
              onClick={addClient}
              className="inline-flex items-center justify-center gap-2 rounded-md bg-primary px-5 py-2 text-primary-foreground"
            >

              <Plus className="h-4 w-4" />

              Ajouter client

            </button>

          </div>


          <textarea
            className="mb-6 w-full rounded-md border bg-background px-4 py-2"
            placeholder="Note client"
            value={
              newClient.note
            }
            onChange={(event) =>
              setNewClient({
                ...newClient,
                note:
                  event.target
                    .value,
              })
            }
          />


          <div className="mb-4 flex flex-col gap-3 sm:flex-row">

            <input
              className="rounded-md border bg-background px-4 py-2"
              placeholder="Filtrer par produit"
              value={
                productFilter
              }
              onChange={(event) =>
                setProductFilter(
                  event.target.value
                )
              }
            />


            <select
              className="rounded-md border bg-background px-4 py-2"
              value={
                durationFilter
              }
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

            <table className="min-w-[950px] w-full text-left text-sm">

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
                        key={
                          client.id
                        }
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
                                event
                                  .target
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
                                event
                                  .target
                                  .value
                              )
                            }
                          />

                        </td>


                        <td className="p-4">

                          {getClientOrders(
                            client.phone
                          ).length ===
                          0 ? (

                            <span className="text-muted-foreground">
                              Aucune
                              commande
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
                                        index: number
                                      ) => (

                                        <div
                                          key={`${item.slug}-${index}`}
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
                            className="inline-flex items-center gap-1 rounded-md bg-destructive px-3 py-2 text-xs text-destructive-foreground"
                          >

                            <Trash2 className="h-3 w-3" />

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


        {/* =================================================
            PAYMENT METHODS
        ================================================= */}

        <section className="mb-8 rounded-2xl border bg-card p-6">

          <div className="mb-6 flex items-center gap-3">

            <CreditCard className="h-6 w-6" />

            <h2 className="text-2xl font-bold">
              Méthodes de paiement
            </h2>

          </div>


          <div className="mb-6 grid gap-3 md:grid-cols-3">

            <input
              className="rounded-md border bg-background px-4 py-2"
              placeholder="Nom, ex. D17"
              value={
                newPaymentName
              }
              onChange={(event) =>
                setNewPaymentName(
                  event.target.value
                )
              }
            />


            <input
              className="rounded-md border bg-background px-4 py-2"
              placeholder="Numéro, RIB ou adresse"
              value={
                newPaymentDetails
              }
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
              className="inline-flex items-center justify-center gap-2 rounded-md bg-primary px-5 py-2 text-primary-foreground"
            >

              <Plus className="h-4 w-4" />

              Ajouter méthode

            </button>

          </div>


          <div className="overflow-x-auto rounded-2xl border">

            <table className="min-w-[750px] w-full text-left text-sm">

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
                              event
                                .target
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
                              event
                                .target
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
                          className="inline-flex items-center gap-1 rounded-md bg-destructive px-3 py-2 text-xs text-destructive-foreground"
                        >

                          <Trash2 className="h-3 w-3" />

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


      {/* =================================================
          EDIT NORMAL PRODUCT MODAL
      ================================================= */}

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
                            event
                              .target
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
                            event
                              .target
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
                            event
                              .target
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
                          .split(
                            "\n"
                          )
                          .filter(
                            (
                              feature
                            ) =>
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
                  onClick={
                    closeEdit
                  }
                  className="rounded-md border px-4 py-2"
                >
                  Annuler
                </button>


                <button
                  type="button"
                  onClick={() =>
                    void saveEdit()
                  }
                  className="rounded-md bg-primary px-4 py-2 text-primary-foreground"
                >
                  Enregistrer
                </button>

              </div>

            </div>

          </div>

        )}


      {/* =================================================
          EDIT SOCIAL PRODUCT MODAL
      ================================================= */}

      {editingSocialProduct && (

        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 px-4">

          <div className="max-h-[90vh] w-full max-w-2xl overflow-auto rounded-2xl bg-background p-6 shadow-xl">

            <h2 className="mb-5 text-2xl font-bold">
              Modifier le produit
              social
            </h2>


            <div className="grid gap-4">

              <input
                className="rounded-md border bg-background px-4 py-2"
                placeholder="Nom"
                value={
                  editingSocialProduct.name
                }
                onChange={(event) =>
                  setEditingSocialProduct(
                    {
                      ...editingSocialProduct,
                      name:
                        event.target
                          .value,
                    }
                  )
                }
              />


              <select
                className="rounded-md border bg-background px-4 py-2"
                value={
                  editingSocialProduct.type
                }
                onChange={(event) =>
                  setEditingSocialProduct(
                    {
                      ...editingSocialProduct,
                      type:
                        event.target
                          .value,
                    }
                  )
                }
              >

                <option value="followers">
                  Followers
                </option>

                <option value="views">
                  Views
                </option>

                <option value="likes">
                  Likes
                </option>

              </select>


              <input
                type="number"
                min="1"
                className="rounded-md border bg-background px-4 py-2"
                placeholder="Quantité"
                value={
                  editingSocialProduct.quantity
                }
                onChange={(event) =>
                  setEditingSocialProduct(
                    {
                      ...editingSocialProduct,
                      quantity:
                        Number(
                          event.target
                            .value
                        ),
                    }
                  )
                }
              />


              <input
                type="number"
                min="0"
                step="0.01"
                className="rounded-md border bg-background px-4 py-2"
                placeholder="Prix"
                value={
                  editingSocialProduct.price
                }
                onChange={(event) =>
                  setEditingSocialProduct(
                    {
                      ...editingSocialProduct,
                      price:
                        Number(
                          event.target
                            .value
                        ),
                    }
                  )
                }
              />


              <input
                type="number"
                min="0"
                step="0.01"
                className="rounded-md border bg-background px-4 py-2"
                placeholder="Ancien prix"
                value={
                  editingSocialProduct.oldPrice
                }
                onChange={(event) =>
                  setEditingSocialProduct(
                    {
                      ...editingSocialProduct,
                      oldPrice:
                        Number(
                          event.target
                            .value
                        ),
                    }
                  )
                }
              />


              <textarea
                className="min-h-28 rounded-md border bg-background px-4 py-2"
                placeholder="Description"
                value={
                  editingSocialProduct.description
                }
                onChange={(event) =>
                  setEditingSocialProduct(
                    {
                      ...editingSocialProduct,
                      description:
                        event.target
                          .value,
                    }
                  )
                }
              />


              <label className="flex items-center gap-2">

                <input
                  type="checkbox"
                  checked={
                    editingSocialProduct.active
                  }
                  onChange={(event) =>
                    setEditingSocialProduct(
                      {
                        ...editingSocialProduct,
                        active:
                          event.target
                            .checked,
                      }
                    )
                  }
                />

                Produit visible

              </label>

            </div>


            <div className="mt-6 flex justify-end gap-3">

              <button
                type="button"
                onClick={() =>
                  setEditingSocialProduct(
                    null
                  )
                }
                className="rounded-md border px-4 py-2"
              >
                Annuler
              </button>


              <button
                type="button"
                onClick={() =>
                  void updateSocialProductAdmin(
                    editingSocialProduct
                  )
                }
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
