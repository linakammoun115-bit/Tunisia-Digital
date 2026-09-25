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
  updateSocialProduct,
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

import {
  createFileRoute,
  useNavigate,
} from "@tanstack/react-router";

import {
  useEffect,
  useState,
} from "react";

export const Route = createFileRoute("/admin")({
  component: Admin,
});

function Admin() {
  const navigate = useNavigate();

  /* =========================================================
     AUTH
  ========================================================= */

  useEffect(() => {
    const auth =
      localStorage.getItem("adminAuth");

    if (auth !== "true") {
      navigate({
        to: "/admin-login",
      });
    }
  }, [navigate]);

  /* =========================================================
     NORMAL PRODUCTS
  ========================================================= */

  const [
    products,
    setProducts,
  ] = useState<
    Record<string, Subscription>
  >({});

  const [
    loading,
    setLoading,
  ] = useState(true);

  const [
    productName,
    setProductName,
  ] = useState("");

  const [
    productCategory,
    setProductCategory,
  ] = useState("Streaming");

  const [
    productDescription,
    setProductDescription,
  ] = useState("");

  const [
    productOldPrice,
    setProductOldPrice,
  ] = useState("");

  const [
    productDuration,
    setProductDuration,
  ] =
    useState<
      Subscription["duration"]
    >("1 month");

  const [
    productFeatures,
    setProductFeatures,
  ] = useState("");

  const [
    productPrice1,
    setProductPrice1,
  ] = useState("");

  const [
    productPrice2,
    setProductPrice2,
  ] = useState("");

  const [
    productPrice3,
    setProductPrice3,
  ] = useState("");

  const [
    productPrice6,
    setProductPrice6,
  ] = useState("");

  const [
    productPriceYear,
    setProductPriceYear,
  ] = useState("");

  /* =========================================================
     NORMAL PRODUCT EDIT
  ========================================================= */

  const [
    editingSlug,
    setEditingSlug,
  ] = useState<string | null>(null);

  const [
    editProduct,
    setEditProduct,
  ] =
    useState<Subscription | null>(
      null
    );

  /* =========================================================
     SOCIAL PRODUCTS
  ========================================================= */

  const [
    socialProducts,
    setSocialProducts,
  ] =
    useState<
      Record<string, SocialProduct>
    >({});

  const [
    socialLoading,
    setSocialLoading,
  ] = useState(true);

  const [
    socialType,
    setSocialType,
  ] =
    useState<SocialProductType>(
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
    socialDescription,
    setSocialDescription,
  ] = useState("");

  /* =========================================================
     SOCIAL PRODUCT EDIT
  ========================================================= */

  const [
    editingSocialId,
    setEditingSocialId,
  ] = useState<string | null>(null);

  const [
    editSocialProduct,
    setEditSocialProduct,
  ] =
    useState<SocialProduct | null>(
      null
    );

  /* =========================================================
     CLIENTS
  ========================================================= */

  const [
    clients,
    setClients,
  ] = useState<Client[]>([]);

  /* =========================================================
     PAYMENT METHODS
  ========================================================= */

  const [
    paymentMethods,
    setPaymentMethods,
  ] = useState<
    PaymentMethod[]
  >([]);

  /* =========================================================
     LOAD DATA
  ========================================================= */

  useEffect(() => {
    loadProducts();
    loadSocialProducts();
    loadClients();
    loadPaymentMethods();
  }, []);

  const loadProducts =
    async () => {
      try {
        setLoading(true);

        const data =
          await getProducts();

        setProducts(data);
      } catch (error) {
        console.error(
          "Erreur chargement produits:",
          error
        );
      } finally {
        setLoading(false);
      }
    };

  const loadSocialProducts =
    async () => {
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
      } finally {
        setSocialLoading(false);
      }
    };

  const loadClients =
    async () => {
      try {
        const data =
          await getClients();

        setClients(data);
      } catch (error) {
        console.error(
          "Erreur chargement clients:",
          error
        );
      }
    };

  const loadPaymentMethods =
    async () => {
      try {
        const data =
          await getPaymentMethods();

        setPaymentMethods(data);
      } catch (error) {
        console.error(
          "Erreur chargement moyens de paiement:",
          error
        );
      }
    };

  /* =========================================================
     NORMAL PRODUCT - ADD
  ========================================================= */

  const addProduct =
    async () => {
      if (!productName.trim()) {
        window.alert(
          "Écris le nom du produit."
        );
        return;
      }

      try {
        const pricesByDuration = {
          "1 month":
            productPrice1.trim(),

          "2 months":
            productPrice2.trim(),

          "3 months":
            productPrice3.trim(),

          "6 months":
            productPrice6.trim(),

          "1 year":
            productPriceYear.trim(),
        };

        const product: Subscription =
          {
            name:
              productName.trim(),

            oldPrice:
              productOldPrice.trim(),

            duration:
              productDuration,

            category:
              productCategory,

            description:
              productDescription.trim(),

            features:
              productFeatures
                .split("\n")
                .map((item) =>
                  item.trim()
                )
                .filter(Boolean),

            active: true,

            pricesByDuration,
          };

        const slug =
          await createProduct(
            product,
            Object.keys(products)
              .length
          );

        setProducts(
          (previous) => ({
            ...previous,

            [slug]:
              product,
          })
        );

        setProductName("");
        setProductOldPrice("");
        setProductDescription("");
        setProductFeatures("");
        setProductPrice1("");
        setProductPrice2("");
        setProductPrice3("");
        setProductPrice6("");
        setProductPriceYear("");

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
     NORMAL PRODUCT - DELETE
  ========================================================= */

  const deleteProduct =
    async (slug: string) => {
      if (
        !window.confirm(
          "Supprimer ce produit ?"
        )
      ) {
        return;
      }

      try {
        await deleteProductFromDb(
          slug
        );

        setProducts(
          (previous) => {
            const copy = {
              ...previous,
            };

            delete copy[slug];

            return copy;
          }
        );
      } catch (error) {
        console.error(
          "Erreur suppression produit:",
          error
        );

        window.alert(
          "Impossible de supprimer le produit."
        );
      }
    };

  /* =========================================================
     NORMAL PRODUCT - ACTIVE
  ========================================================= */

  const toggleProduct =
    async (
      slug: string,
      active: boolean
    ) => {
      try {
        await setProductActive(
          slug,
          active
        );

        setProducts(
          (previous) => ({
            ...previous,

            [slug]: {
              ...previous[slug],
              active,
            },
          })
        );
      } catch (error) {
        console.error(
          "Erreur changement état produit:",
          error
        );
      }
    };

  /* =========================================================
     NORMAL PRODUCT - EDIT
  ========================================================= */

  const openEdit =
    (slug: string) => {
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
          ...(product.features ||
            []),
        ],
      });
    };

  const closeEdit =
    () => {
      setEditingSlug(null);
      setEditProduct(null);
    };

  const saveEdit =
    async () => {
      if (
        !editingSlug ||
        !editProduct
      ) {
        return;
      }

      if (
        !editProduct.name.trim()
      ) {
        window.alert(
          "Le nom du produit est obligatoire."
        );
        return;
      }

      try {
        const updatedProduct: Subscription =
          {
            ...editProduct,

            name:
              editProduct.name.trim(),

            oldPrice:
              editProduct.oldPrice?.trim() ||
              "",

            description:
              editProduct.description?.trim() ||
              "",

            category:
              editProduct.category?.trim() ||
              "",

            features:
              (
                editProduct.features ||
                []
              )
                .map((item) =>
                  item.trim()
                )
                .filter(Boolean),

            pricesByDuration: {
              ...editProduct.pricesByDuration,
            },
          };

        await updateProduct(
          editingSlug,
          updatedProduct,
          updatedProduct.position
        );

        setProducts(
          (previous) => ({
            ...previous,

            [editingSlug]:
              updatedProduct,
          })
        );

        closeEdit();

        window.alert(
          "Produit modifié avec succès ✅"
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
     SOCIAL PRODUCT - ADD
  ========================================================= */

  const addSocialProduct =
    async () => {
      if (!socialName.trim()) {
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

      if (
        !Number.isFinite(
          quantity
        ) ||
        quantity <= 0
      ) {
        window.alert(
          "Entre une quantité valide."
        );
        return;
      }

      if (
        !Number.isFinite(price) ||
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

            description:
              socialDescription.trim(),

            active: true,

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
     SOCIAL PRODUCT - DELETE
  ========================================================= */

  const deleteSocial =
    async (id: string) => {
      if (
        !window.confirm(
          "Supprimer ce produit social ?"
        )
      ) {
        return;
      }

      try {
        await deleteSocialProduct(
          id
        );

        setSocialProducts(
          (previous) => {
            const copy = {
              ...previous,
            };

            delete copy[id];

            return copy;
          }
        );
      } catch (error) {
        console.error(
          "Erreur suppression produit social:",
          error
        );

        window.alert(
          "Impossible de supprimer le produit social."
        );
      }
    };

  /* =========================================================
     SOCIAL PRODUCT - ACTIVE
  ========================================================= */

  const toggleSocial =
    async (
      id: string,
      active: boolean
    ) => {
      try {
        await setSocialProductActive(
          id,
          active
        );

        setSocialProducts(
          (previous) => ({
            ...previous,

            [id]: {
              ...previous[id],
              active,
            },
          })
        );
      } catch (error) {
        console.error(
          "Erreur changement état produit social:",
          error
        );

        window.alert(
          "Impossible de modifier l'état du produit social."
        );
      }
    };

  /* =========================================================
     SOCIAL PRODUCT - EDIT
  ========================================================= */

  const openSocialEdit =
    (id: string) => {
      const product =
        socialProducts[id];

      if (!product) {
        return;
      }

      setEditingSocialId(id);

      setEditSocialProduct({
        ...product,
      });
    };

  const closeSocialEdit =
    () => {
      setEditingSocialId(null);
      setEditSocialProduct(null);
    };

  const saveSocialEdit =
    async () => {
      if (
        !editingSocialId ||
        !editSocialProduct
      ) {
        return;
      }

      const updatedProduct: SocialProduct =
        {
          ...editSocialProduct,

          name:
            editSocialProduct.name.trim(),

          quantity:
            Number(
              editSocialProduct.quantity
            ),

          price:
            Number(
              editSocialProduct.price
            ),

          description:
            editSocialProduct.description?.trim() ||
            "",

          active:
            editSocialProduct.active,

          position:
            editSocialProduct.position ??
            0,
        };

      if (!updatedProduct.name) {
        window.alert(
          "Le nom du produit est obligatoire."
        );
        return;
      }

      if (
        !Number.isFinite(
          updatedProduct.quantity
        ) ||
        updatedProduct.quantity <= 0
      ) {
        window.alert(
          "La quantité doit être supérieure à 0."
        );
        return;
      }

      if (
        !Number.isFinite(
          updatedProduct.price
        ) ||
        updatedProduct.price < 0
      ) {
        window.alert(
          "Le prix ne peut pas être négatif."
        );
        return;
      }

      try {
        await updateSocialProduct(
          editingSocialId,
          updatedProduct,
          updatedProduct.position
        );

        setSocialProducts(
          (previous) => ({
            ...previous,

            [editingSocialId]:
              updatedProduct,
          })
        );

        closeSocialEdit();

        window.alert(
          "Produit social modifié avec succès ✅"
        );
      } catch (error) {
        console.error(
          "Erreur modification produit social:",
          error
        );

        const message =
          error instanceof Error
            ? error.message
            : String(error);

        window.alert(
          `Impossible de modifier le produit social.\n\n${message}`
        );
      }
    };

  /* =========================================================
     LOGOUT
  ========================================================= */

  const logout =
    () => {
      localStorage.removeItem(
        "adminAuth"
      );

      navigate({
        to: "/admin-login",
      });
    };

  /* =========================================================
     RENDER
  ========================================================= */

  return (
    <main className="min-h-screen bg-background">

      {/* =====================================================
          HEADER
      ===================================================== */}

      <header className="sticky top-0 z-40 border-b bg-background/95 backdrop-blur">

        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">

          <div>
            <h1 className="text-2xl font-bold">
              Administration
            </h1>

            <p className="text-sm text-muted-foreground">
              Tunisia Digital Hub
            </p>
          </div>

          <button
            type="button"
            onClick={logout}
            className="rounded-md border px-4 py-2 text-sm font-medium transition hover:bg-muted"
          >
            Déconnexion
          </button>

        </div>

      </header>

      {/* =====================================================
          CONTENT
      ===================================================== */}

      <div className="mx-auto max-w-7xl space-y-10 px-6 py-10">

        {/* ===================================================
            PRODUCTS
        =================================================== */}

        <section className="space-y-6">

          <div>
            <h2 className="text-2xl font-bold">
              Produits
            </h2>

            <p className="text-sm text-muted-foreground">
              Gestion des abonnements classiques.
            </p>
          </div>

          {/* ADD PRODUCT */}

          <div className="rounded-2xl border bg-card p-6 shadow-sm">

            <h3 className="mb-5 text-xl font-semibold">
              Ajouter un produit
            </h3>

            <div className="grid gap-4 md:grid-cols-2">

              <input
                className="rounded-md border bg-background px-4 py-2"
                placeholder="Nom du produit"
                value={productName}
                onChange={(event) =>
                  setProductName(
                    event.target.value
                  )
                }
              />

              <input
                className="rounded-md border bg-background px-4 py-2"
                placeholder="Catégorie"
                value={
                  productCategory
                }
                onChange={(event) =>
                  setProductCategory(
                    event.target.value
                  )
                }
              />

              <input
                className="rounded-md border bg-background px-4 py-2"
                placeholder="Ancien prix"
                value={
                  productOldPrice
                }
                onChange={(event) =>
                  setProductOldPrice(
                    event.target.value
                  )
                }
              />

              <select
                className="rounded-md border bg-background px-4 py-2"
                value={
                  productDuration
                }
                onChange={(event) =>
                  setProductDuration(
                    event.target
                      .value as Subscription["duration"]
                  )
                }
              >
                <option value="1 month">
                  1 mois
                </option>

                <option value="2 months">
                  2 mois
                </option>

                <option value="3 months">
                  3 mois
                </option>

                <option value="6 months">
                  6 mois
                </option>

                <option value="1 year">
                  1 an
                </option>
              </select>

              <input
                type="number"
                step="0.01"
                className="rounded-md border bg-background px-4 py-2"
                placeholder="Prix 1 mois"
                value={
                  productPrice1
                }
                onChange={(event) =>
                  setProductPrice1(
                    event.target.value
                  )
                }
              />

              <input
                type="number"
                step="0.01"
                className="rounded-md border bg-background px-4 py-2"
                placeholder="Prix 2 mois"
                value={
                  productPrice2
                }
                onChange={(event) =>
                  setProductPrice2(
                    event.target.value
                  )
                }
              />

              <input
                type="number"
                step="0.01"
                className="rounded-md border bg-background px-4 py-2"
                placeholder="Prix 3 mois"
                value={
                  productPrice3
                }
                onChange={(event) =>
                  setProductPrice3(
                    event.target.value
                  )
                }
              />

              <input
                type="number"
                step="0.01"
                className="rounded-md border bg-background px-4 py-2"
                placeholder="Prix 6 mois"
                value={
                  productPrice6
                }
                onChange={(event) =>
                  setProductPrice6(
                    event.target.value
                  )
                }
              />

              <input
                type="number"
                step="0.01"
                className="rounded-md border bg-background px-4 py-2"
                placeholder="Prix 1 an"
                value={
                  productPriceYear
                }
                onChange={(event) =>
                  setProductPriceYear(
                    event.target.value
                  )
                }
              />

            </div>

            <textarea
              className="mt-4 min-h-28 w-full rounded-md border bg-background px-4 py-2"
              placeholder="Description"
              value={
                productDescription
              }
              onChange={(event) =>
                setProductDescription(
                  event.target.value
                )
              }
            />

            <textarea
              className="mt-4 min-h-28 w-full rounded-md border bg-background px-4 py-2"
              placeholder="Fonctionnalités — une par ligne"
              value={
                productFeatures
              }
              onChange={(event) =>
                setProductFeatures(
                  event.target.value
                )
              }
            />

            <button
              type="button"
              onClick={
                addProduct
              }
              className="mt-4 rounded-md bg-primary px-5 py-2 font-medium text-primary-foreground transition hover:opacity-90"
            >
              Ajouter le produit
            </button>

          </div>

          {/* PRODUCTS TABLE */}

          <div className="overflow-x-auto rounded-2xl border bg-card">

            <table className="w-full min-w-[900px] text-left">

              <thead className="border-b bg-muted/50">

                <tr>

                  <th className="p-4">
                    Nom
                  </th>

                  <th className="p-4">
                    Catégorie
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

                {loading ? (
                  <tr>
                    <td
                      colSpan={6}
                      className="p-8 text-center text-muted-foreground"
                    >
                      Chargement...
                    </td>
                  </tr>
                ) : Object.keys(
                    products
                  ).length === 0 ? (
                  <tr>
                    <td
                      colSpan={6}
                      className="p-8 text-center text-muted-foreground"
                    >
                      Aucun produit.
                    </td>
                  </tr>
                ) : (
                  Object.entries(
                    products
                  ).map(
                    ([
                      slug,
                      product,
                    ]) => (
                      <tr
                        key={slug}
                        className="border-b last:border-0"
                      >

                        <td className="p-4 font-medium">
                          {
                            product.name
                          }
                        </td>

                        <td className="p-4">
                          {
                            product.category
                          }
                        </td>

                        <td className="p-4">
                          {Object.entries(
                            product.pricesByDuration ||
                              {}
                          ).filter(
                            ([, value]) =>
                              Number(
                                value
                              ) > 0
                          )[0]?.[1] ||
                            "N/A"}{" "}
                          DT
                        </td>

                        <td className="p-4 text-muted-foreground line-through">
                          {
                            product.oldPrice
                          }{" "}
                          DT
                        </td>

                        <td className="p-4">

                          <button
                            type="button"
                            onClick={() =>
                              toggleProduct(
                                slug,
                                !product.active
                              )
                            }
                            className={`rounded-full px-3 py-1 text-xs font-medium ${
                              product.active
                                ? "bg-green-500/10 text-green-600"
                                : "bg-red-500/10 text-red-600"
                            }`}
                          >
                            {product.active
                              ? "Actif"
                              : "Masqué"}
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
                              className="rounded-md border px-3 py-1.5 text-sm transition hover:bg-muted"
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
                              className="rounded-md border border-red-500/30 px-3 py-1.5 text-sm text-red-600 transition hover:bg-red-500/10"
                            >
                              Supprimer
                            </button>

                          </div>

                        </td>

                      </tr>
                    )
                  )
                )}

              </tbody>

            </table>

          </div>

        </section>

        {/* ===================================================
            SOCIAL MEDIA
        =================================================== */}

        <section className="space-y-6">

          <div>
            <h2 className="text-2xl font-bold">
              Social Media
            </h2>

            <p className="text-sm text-muted-foreground">
              Gestion des services Followers,
              Likes et Views.
            </p>
          </div>

          {/* ADD SOCIAL PRODUCT */}

          <div className="rounded-2xl border bg-card p-6 shadow-sm">

            <h3 className="mb-5 text-xl font-semibold">
              Ajouter un produit Social Media
            </h3>

            <div className="grid gap-4 md:grid-cols-2">

              <input
                className="rounded-md border bg-background px-4 py-2"
                placeholder="Nom du produit"
                value={
                  socialName
                }
                onChange={(event) =>
                  setSocialName(
                    event.target.value
                  )
                }
              />

              <select
                className="rounded-md border bg-background px-4 py-2"
                value={
                  socialType
                }
                onChange={(event) =>
                  setSocialType(
                    event.target
                      .value as SocialProductType
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
                type="number"
                min="1"
                className="rounded-md border bg-background px-4 py-2"
                placeholder="Quantité"
                value={
                  socialQuantity
                }
                onChange={(event) =>
                  setSocialQuantity(
                    event.target.value
                  )
                }
              />

              <div className="flex items-center gap-2">

                <input
                  type="number"
                  min="0"
                  step="0.01"
                  className="w-full rounded-md border bg-background px-4 py-2"
                  placeholder="Prix"
                  value={
                    socialPrice
                  }
                  onChange={(event) =>
                    setSocialPrice(
                      event.target.value
                    )
                  }
                />

                <span className="font-bold">
                  DT
                </span>

              </div>

            </div>

            <textarea
              className="mt-4 min-h-28 w-full rounded-md border bg-background px-4 py-2"
              placeholder="Description du service social..."
              value={
                socialDescription
              }
              onChange={(event) =>
                setSocialDescription(
                  event.target.value
                )
              }
            />

            <button
              type="button"
              onClick={
                addSocialProduct
              }
              className="mt-4 rounded-md bg-primary px-5 py-2 font-medium text-primary-foreground transition hover:opacity-90"
            >
              Ajouter le produit social
            </button>

          </div>

          {/* SOCIAL PRODUCTS TABLE */}

          <div className="overflow-x-auto rounded-2xl border bg-card">

            <table className="w-full min-w-[900px] text-left">

              <thead className="border-b bg-muted/50">

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
                      colSpan={6}
                      className="p-8 text-center text-muted-foreground"
                    >
                      Chargement...
                    </td>
                  </tr>
                ) : Object.keys(
                    socialProducts
                  ).length === 0 ? (
                  <tr>
                    <td
                      colSpan={6}
                      className="p-8 text-center text-muted-foreground"
                    >
                      Aucun produit social.
                    </td>
                  </tr>
                ) : (
                  Object.entries(
                    socialProducts
                  ).map(
                    ([
                      id,
                      product,
                    ]) => (
                      <tr
                        key={id}
                        className="border-b last:border-0"
                      >

                        <td className="p-4 font-medium">
                          {
                            product.name
                          }
                        </td>

                        <td className="p-4 capitalize">
                          {
                            product.type
                          }
                        </td>

                        <td className="p-4">
                          {
                            product.quantity
                          }
                        </td>

                        <td className="p-4">
                          {
                            product.price
                          }{" "}
                          DT
                        </td>

                        <td className="p-4">

                          <button
                            type="button"
                            onClick={() =>
                              toggleSocial(
                                id,
                                !product.active
                              )
                            }
                            className={`rounded-full px-3 py-1 text-xs font-medium ${
                              product.active
                                ? "bg-green-500/10 text-green-600"
                                : "bg-red-500/10 text-red-600"
                            }`}
                          >
                            {product.active
                              ? "Actif"
                              : "Masqué"}
                          </button>

                        </td>

                        <td className="p-4">

                          <div className="flex gap-2">

                            <button
                              type="button"
                              onClick={() =>
                                openSocialEdit(
                                  id
                                )
                              }
                              className="rounded-md border px-3 py-1.5 text-sm transition hover:bg-muted"
                            >
                              Modifier
                            </button>

                            <button
                              type="button"
                              onClick={() =>
                                deleteSocial(
                                  id
                                )
                              }
                              className="rounded-md border border-red-500/30 px-3 py-1.5 text-sm text-red-600 transition hover:bg-red-500/10"
                            >
                              Supprimer
                            </button>

                          </div>

                        </td>

                      </tr>
                    )
                  )
                )}

              </tbody>

            </table>

          </div>

        </section>

        {/* ===================================================
            CLIENTS
        =================================================== */}

        <section className="space-y-4">

          <div>
            <h2 className="text-2xl font-bold">
              Clients
            </h2>

            <p className="text-sm text-muted-foreground">
              Clients enregistrés.
            </p>
          </div>

          <div className="overflow-x-auto rounded-2xl border bg-card">

            <table className="w-full text-left">

              <thead className="border-b bg-muted/50">

                <tr>

                  <th className="p-4">
                    Nom
                  </th>

                  <th className="p-4">
                    Email
                  </th>

                  <th className="p-4">
                    Téléphone
                  </th>

                </tr>

              </thead>

              <tbody>

                {clients.length ===
                0 ? (
                  <tr>
                    <td
                      colSpan={3}
                      className="p-8 text-center text-muted-foreground"
                    >
                      Aucun client.
                    </td>
                  </tr>
                ) : (
                  clients.map(
                    (
                      client,
                      index
                    ) => (
                      <tr
                        key={
                          client.id ??
                          index
                        }
                        className="border-b last:border-0"
                      >

                        <td className="p-4">
                          {
                            client.name
                          }
                        </td>

                        <td className="p-4">
                          {
                            client.email
                          }
                        </td>

                        <td className="p-4">
                          {
                            client.phone
                          }
                        </td>

                      </tr>
                    )
                  )
                )}

              </tbody>

            </table>

          </div>

        </section>

        {/* ===================================================
            PAYMENT METHODS
        =================================================== */}

        <section className="space-y-4">

          <div>
            <h2 className="text-2xl font-bold">
              Moyens de paiement
            </h2>

            <p className="text-sm text-muted-foreground">
              Gestion des moyens de paiement.
            </p>
          </div>

          <div className="overflow-x-auto rounded-2xl border bg-card">

            <table className="w-full text-left">

              <thead className="border-b bg-muted/50">

                <tr>

                  <th className="p-4">
                    Nom
                  </th>

                  <th className="p-4">
                    État
                  </th>

                </tr>

              </thead>

              <tbody>

                {paymentMethods.length ===
                0 ? (
                  <tr>
                    <td
                      colSpan={2}
                      className="p-8 text-center text-muted-foreground"
                    >
                      Aucun moyen de paiement.
                    </td>
                  </tr>
                ) : (
                  paymentMethods.map(
                    (
                      method,
                      index
                    ) => (
                      <tr
                        key={
                          method.id ??
                          index
                        }
                        className="border-b last:border-0"
                      >

                        <td className="p-4 font-medium">
                          {
                            method.name
                          }
                        </td>

                        <td className="p-4">

                          <span
                            className={`rounded-full px-3 py-1 text-xs font-medium ${
                              method.active
                                ? "bg-green-500/10 text-green-600"
                                : "bg-red-500/10 text-red-600"
                            }`}
                          >
                            {method.active
                              ? "Actif"
                              : "Inactif"}
                          </span>

                        </td>

                      </tr>
                    )
                  )
                )}

              </tbody>

            </table>

          </div>

        </section>

      </div>

      {/* =====================================================
          NORMAL PRODUCT EDIT MODAL
      ===================================================== */}

      {editingSlug &&
        editProduct && (

          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 px-4">

            <div className="max-h-[90vh] w-full max-w-3xl overflow-auto rounded-2xl bg-background p-6 shadow-xl">

              <h2 className="mb-2 text-2xl font-bold">
                Modifier le produit
              </h2>

              <p className="mb-6 text-sm text-muted-foreground">
                Modifie les informations du produit.
              </p>

              <div className="grid gap-4">

                <div>

                  <label className="mb-1 block text-sm font-medium">
                    Nom
                  </label>

                  <input
                    className="w-full rounded-md border bg-background px-4 py-2"
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
                  />

                </div>

                <div className="grid gap-4 md:grid-cols-2">

                  <div>

                    <label className="mb-1 block text-sm font-medium">
                      Catégorie
                    </label>

                    <input
                      className="w-full rounded-md border bg-background px-4 py-2"
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
                    />

                  </div>

                  <div>

                    <label className="mb-1 block text-sm font-medium">
                      Ancien prix
                    </label>

                    <input
                      className="w-full rounded-md border bg-background px-4 py-2"
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
                    />

                  </div>

                </div>

                <div>

                  <label className="mb-1 block text-sm font-medium">
                    Description
                  </label>

                  <textarea
                    className="min-h-28 w-full rounded-md border bg-background px-4 py-2"
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
                  />

                </div>

                <div>

                  <label className="mb-2 block text-sm font-medium">
                    Prix par durée
                  </label>

                  <div className="grid gap-3 md:grid-cols-2">

                    {(
                      [
                        [
                          "1 month",
                          "1 mois",
                        ],
                        [
                          "2 months",
                          "2 mois",
                        ],
                        [
                          "3 months",
                          "3 mois",
                        ],
                        [
                          "6 months",
                          "6 mois",
                        ],
                        [
                          "1 year",
                          "1 an",
                        ],
                      ] as const
                    ).map(
                      ([
                        key,
                        label,
                      ]) => (
                        <div
                          key={key}
                        >

                          <label className="mb-1 block text-xs text-muted-foreground">
                            {
                              label
                            }
                          </label>

                          <input
                            type="number"
                            step="0.01"
                            className="w-full rounded-md border bg-background px-4 py-2"
                            value={
                              editProduct
                                .pricesByDuration?.[
                                key
                              ] ?? ""
                            }
                            onChange={(
                              event
                            ) =>
                              setEditProduct({
                                ...editProduct,

                                pricesByDuration:
                                  {
                                    ...editProduct.pricesByDuration,

                                    [key]:
                                      event
                                        .target
                                        .value,
                                  },
                              })
                            }
                          />

                        </div>
                      )
                    )}

                  </div>

                </div>

                <div>

                  <label className="mb-1 block text-sm font-medium">
                    Fonctionnalités
                  </label>

                  <textarea
                    className="min-h-28 w-full rounded-md border bg-background px-4 py-2"
                    value={(
                      editProduct.features ||
                      []
                    ).join("\n")}
                    onChange={(event) =>
                      setEditProduct({
                        ...editProduct,

                        features:
                          event.target.value
                            .split("\n")
                            .map(
                              (item) =>
                                item.trim()
                            )
                            .filter(
                              Boolean
                            ),
                      })
                    }
                  />

                </div>

                <label className="flex cursor-pointer items-center gap-3 rounded-md border p-3">

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

                  <span>
                    Produit visible
                  </span>

                </label>

              </div>

              <div className="mt-6 flex justify-end gap-3">

                <button
                  type="button"
                  onClick={
                    closeEdit
                  }
                  className="rounded-md border px-4 py-2 transition hover:bg-muted"
                >
                  Annuler
                </button>

                <button
                  type="button"
                  onClick={
                    saveEdit
                  }
                  className="rounded-md bg-primary px-5 py-2 font-medium text-primary-foreground transition hover:opacity-90"
                >
                  Enregistrer
                </button>

              </div>

            </div>

          </div>
        )}

      {/* =====================================================
          SOCIAL PRODUCT EDIT MODAL
      ===================================================== */}

      {editingSocialId &&
        editSocialProduct && (

          <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/60 px-4">

            <div className="max-h-[90vh] w-full max-w-2xl overflow-auto rounded-2xl bg-background p-6 shadow-xl">

              <h2 className="mb-2 text-2xl font-bold">
                Modifier le produit social
              </h2>

              <p className="mb-6 text-sm text-muted-foreground">
                Modifie le nom, le type, la quantité,
                le prix et la description.
              </p>

              <div className="grid gap-4">

                {/* NAME */}

                <div>

                  <label className="mb-1 block text-sm font-medium">
                    Nom du produit
                  </label>

                  <input
                    className="w-full rounded-md border bg-background px-4 py-2"
                    value={
                      editSocialProduct.name
                    }
                    onChange={(event) =>
                      setEditSocialProduct({
                        ...editSocialProduct,

                        name:
                          event.target
                            .value,
                      })
                    }
                    placeholder="Ex: Instagram Followers"
                  />

                </div>

                {/* TYPE */}

                <div>

                  <label className="mb-1 block text-sm font-medium">
                    Type
                  </label>

                  <select
                    className="w-full rounded-md border bg-background px-4 py-2"
                    value={
                      editSocialProduct.type
                    }
                    onChange={(event) =>
                      setEditSocialProduct({
                        ...editSocialProduct,

                        type:
                          event.target
                            .value as SocialProductType,
                      })
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

                </div>

                {/* QUANTITY */}

                <div>

                  <label className="mb-1 block text-sm font-medium">
                    Quantité
                  </label>

                  <input
                    type="number"
                    min="1"
                    className="w-full rounded-md border bg-background px-4 py-2"
                    value={
                      editSocialProduct.quantity
                    }
                    onChange={(event) =>
                      setEditSocialProduct({
                        ...editSocialProduct,

                        quantity:
                          Number(
                            event.target
                              .value
                          ),
                      })
                    }
                    placeholder="1000"
                  />

                </div>

                {/* PRICE */}

                <div>

                  <label className="mb-1 block text-sm font-medium">
                    Prix
                  </label>

                  <div className="flex items-center gap-2">

                    <input
                      type="number"
                      min="0"
                      step="0.01"
                      className="w-full rounded-md border bg-background px-4 py-2"
                      value={
                        editSocialProduct.price
                      }
                      onChange={(event) =>
                        setEditSocialProduct({
                          ...editSocialProduct,

                          price:
                            Number(
                              event.target
                                .value
                            ),
                        })
                      }
                      placeholder="10"
                    />

                    <span className="font-bold">
                      DT
                    </span>

                  </div>

                </div>

                {/* DESCRIPTION */}

                <div>

                  <label className="mb-1 block text-sm font-medium">
                    Description
                  </label>

                  <textarea
                    className="min-h-28 w-full rounded-md border bg-background px-4 py-2"
                    value={
                      editSocialProduct.description
                    }
                    onChange={(event) =>
                      setEditSocialProduct({
                        ...editSocialProduct,

                        description:
                          event.target
                            .value,
                      })
                    }
                    placeholder="Description du service social..."
                  />

                </div>

                {/* ACTIVE */}

                <label className="flex cursor-pointer items-center gap-3 rounded-md border p-3">

                  <input
                    type="checkbox"
                    checked={
                      editSocialProduct.active
                    }
                    onChange={(event) =>
                      setEditSocialProduct({
                        ...editSocialProduct,

                        active:
                          event.target
                            .checked,
                      })
                    }
                  />

                  <span>
                    Produit visible
                  </span>

                </label>

              </div>

              {/* BUTTONS */}

              <div className="mt-6 flex justify-end gap-3">

                <button
                  type="button"
                  onClick={
                    closeSocialEdit
                  }
                  className="rounded-md border px-4 py-2 transition hover:bg-muted"
                >
                  Annuler
                </button>

                <button
                  type="button"
                  onClick={
                    saveSocialEdit
                  }
                  className="rounded-md bg-primary px-5 py-2 font-medium text-primary-foreground transition hover:opacity-90"
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
