import {
  createFileRoute,
  Link,
  useNavigate,
} from "@tanstack/react-router";

import {
  useEffect,
  useState,
} from "react";

import { supabase } from "@/lib/supabase";

import {
  Gift,
  ShoppingBag,
  Package,
  Plus,
  Trash2,
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
  getPacks,
  createPack,
  updatePack,
  deletePack,
  setPackActive,
  type Pack,
  type PackProduct,
} from "@/lib/packs";

export const Route = createFileRoute("/admin")({
  component: AdminPage,
});

/* =========================================================
   HELPERS PRIX
========================================================= */

const cleanPrice = (
  value?: string | number | null
): string => {
  const raw = String(value ?? "")
    .replace(/DT/gi, "")
    .replace(/\s/g, "")
    .replace(",", ".")
    .trim();

  if (!raw) {
    return "0 DT";
  }

  const number = Number(raw);

  if (!Number.isFinite(number) || number < 0) {
    return "0 DT";
  }

  return `${number} DT`;
};

const priceInputValue = (
  value?: string | number | null
): string => {
  return String(value ?? "")
    .replace(/DT/gi, "")
    .trim();
};

/* =========================================================
   TYPES FORM PACK
========================================================= */

type PackProductForm = {
  productId: string | null;
  name: string;
  price: string;
  duration: string;
  description: string;
};

type PackForm = {
  name: string;
  price: string;
  duration: string;
  description: string;
  image: string;
  active: boolean;
  products: PackProductForm[];
};

const createEmptyPackForm = (): PackForm => ({
  name: "",
  price: "",
  duration: "30 jours",
  description: "",
  image: "",
  active: true,
  products: [],
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
     MODIFICATION PRODUIT SOCIAL
  ========================================================= */

  const [
    editingSocialId,
    setEditingSocialId,
  ] = useState<string | null>(null);

  const [
    editSocialProduct,
    setEditSocialProduct,
  ] = useState<SocialProduct | null>(null);

  /* =========================================================
     PACKS
  ========================================================= */

  const [
    packs,
    setPacks,
  ] = useState<Record<string, Pack>>({});

  const [
    packsLoading,
    setPacksLoading,
  ] = useState(true);

  const [
    packsError,
    setPacksError,
  ] = useState("");

  const [
    packModalOpen,
    setPackModalOpen,
  ] = useState(false);

  const [
    editingPackId,
    setEditingPackId,
  ] = useState<string | null>(null);

  const [
    packForm,
    setPackForm,
  ] = useState<PackForm>(
    createEmptyPackForm()
  );

  const [
    packImageUploading,
    setPackImageUploading,
  ] = useState(false);

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

        const data = await getProducts();

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
     CHARGEMENT PACKS
  ========================================================= */

  useEffect(() => {
    let mounted = true;

    const loadPacks = async () => {
      try {
        setPacksLoading(true);
        setPacksError("");

        const data = await getPacks();

        if (mounted) {
          setPacks(data);
        }
      } catch (error) {
        console.error(
          "Erreur chargement packs:",
          error
        );

        if (mounted) {
          setPacksError(
            error instanceof Error
              ? error.message
              : "Impossible de charger les packs."
          );
        }
      } finally {
        if (mounted) {
          setPacksLoading(false);
        }
      }
    };

    void loadPacks();

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

          "2 months":
            "0 DT",

          "3 months":
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
          Object.keys(products).length
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

  const openEdit = (id: string) => {
    const product =
      products[id];

    if (!product) {
      return;
    }

    setEditingSlug(id);

    setEditProduct({
      ...product,

      pricesByDuration: {
        "1 month":
          product.pricesByDuration?.[
            "1 month"
          ] ?? "0 DT",

        "2 months":
          product.pricesByDuration?.[
            "2 months"
          ] ?? "0 DT",

        "3 months":
          product.pricesByDuration?.[
            "3 months"
          ] ?? "0 DT",

        "6 months":
          product.pricesByDuration?.[
            "6 months"
          ] ?? "0 DT",

        "1 year":
          product.pricesByDuration?.[
            "1 year"
          ] ?? "0 DT",
      },

      features:
        Array.isArray(
          product.features
        )
          ? [
              ...product.features,
            ]
          : [],
    });
  };

  const closeEdit = () => {
    setEditingSlug(null);
    setEditProduct(null);
  };

  /* =========================================================
     SAUVEGARDE PRODUIT
  ========================================================= */

  const saveEdit = async () => {
    if (
      !editingSlug ||
      !editProduct
    ) {
      return;
    }

    try {
      const cleanedPrices = {
        "1 month":
          cleanPrice(
            editProduct
              .pricesByDuration?.[
              "1 month"
            ]
          ),

        "2 months":
          cleanPrice(
            editProduct
              .pricesByDuration?.[
              "2 months"
            ]
          ),

        "3 months":
          cleanPrice(
            editProduct
              .pricesByDuration?.[
              "3 months"
            ]
          ),

        "6 months":
          cleanPrice(
            editProduct
              .pricesByDuration?.[
              "6 months"
            ]
          ),

        "1 year":
          cleanPrice(
            editProduct
              .pricesByDuration?.[
              "1 year"
            ]
          ),
      };

      const updatedProduct: Subscription = {
        ...editProduct,

        oldPrice:
          cleanPrice(
            editProduct.oldPrice
          ),

        pricesByDuration:
          cleanedPrices,

        features:
          Array.isArray(
            editProduct.features
          )
            ? [
                ...editProduct.features,
              ]
            : [],
      };

      await updateProduct(
        editingSlug,
        updatedProduct
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
     MODIFIER PRODUIT SOCIAL
  ========================================================= */

  const openSocialEdit = (
    id: string
  ) => {
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

  const closeSocialEdit = () => {
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

      const updatedProduct: SocialProduct = {
        ...editSocialProduct,

        name:
          editSocialProduct.name.trim(),

        type:
          editSocialProduct.type,

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
          editSocialProduct.position ?? 0,
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
     PACKS
  ========================================================= */

  const openNewPack = () => {
    setEditingPackId(null);
    setPackForm(
      createEmptyPackForm()
    );
    setPackModalOpen(true);
  };

  const openEditPack = (
    id: string
  ) => {
    const pack =
      packs[id];

    if (!pack) {
      return;
    }

    setEditingPackId(id);

    setPackForm({
      name:
        pack.name ?? "",

      price:
        priceInputValue(
          pack.price
        ),

      duration:
        pack.duration ?? "30 jours",

      description:
        pack.description ?? "",

      image:
        pack.image ?? "",

      active:
        pack.active !== false,

      products:
        (pack.products ?? []).map(
          (product) => ({
            productId:
              product.productId ??
              null,

            name:
              product.name ?? "",

            price:
              priceInputValue(
                product.price
              ),

            duration:
              product.duration ?? "",

            description:
              product.description ?? "",
          })
        ),
    });

    setPackModalOpen(true);
  };

  const closePackModal = () => {
    setPackModalOpen(false);
    setEditingPackId(null);
    setPackForm(
      createEmptyPackForm()
    );
    setPackImageUploading(false);
  };

  const handlePackImageChange = async (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = event.target.files?.[0];

    if (!file) {
      return;
    }

    if (!file.type.startsWith("image/")) {
      window.alert("Veuillez sélectionner une image valide.");
      event.target.value = "";
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      window.alert("L'image ne doit pas dépasser 5 MB.");
      event.target.value = "";
      return;
    }

    try {
      setPackImageUploading(true);

      const extension =
        file.name.split(".").pop()?.toLowerCase() || "jpg";

      const uniqueId =
        typeof crypto !== "undefined" && "randomUUID" in crypto
          ? crypto.randomUUID()
          : `${Date.now()}-${Math.random().toString(36).slice(2)}`;

      const filePath = `packs/${uniqueId}.${extension}`;

      const { error: uploadError } =
        await supabase.storage
          .from("pack-images")
          .upload(filePath, file, {
            cacheControl: "3600",
            upsert: false,
          });

      if (uploadError) {
        throw uploadError;
      }

      const { data } =
        supabase.storage
          .from("pack-images")
          .getPublicUrl(filePath);

      if (!data?.publicUrl) {
        throw new Error(
          "Impossible de récupérer l'URL publique de l'image."
        );
      }

      setPackForm((previous) => ({
        ...previous,
        image: data.publicUrl,
      }));
    } catch (error) {
      console.error(
        "Erreur upload image Pack:",
        error
      );

      const message =
        error instanceof Error
          ? error.message
          : String(error);

      window.alert(
        `Impossible d'envoyer l'image.\n\n${message}`
      );
    } finally {
      setPackImageUploading(false);
      event.target.value = "";
    }
  };

  const removePackImage = () => {
    setPackForm((previous) => ({
      ...previous,
      image: "",
    }));
  };

  const toggleExistingProductInPack = (
    productId: string
  ) => {
    const existingIndex =
      packForm.products.findIndex(
        (product) =>
          product.productId ===
          productId
      );

    if (existingIndex >= 0) {
      setPackForm(
        (previous) => ({
          ...previous,

          products:
            previous.products.filter(
              (_, index) =>
                index !== existingIndex
            ),
        })
      );

      return;
    }

    const product =
      products[productId];

    if (!product) {
      return;
    }

    const productPrice =
      product.pricesByDuration?.[
        "1 month"
      ] ?? "0 DT";

    setPackForm(
      (previous) => ({
        ...previous,

        products: [
          ...previous.products,

          {
            productId,

            name:
              product.name,

            price:
              priceInputValue(
                productPrice
              ),

            duration:
              product.duration ??
              "1 mois",

            description:
              product.description ??
              "",
          },
        ],
      })
    );
  };

  const addExclusiveProduct = () => {
    setPackForm(
      (previous) => ({
        ...previous,

        products: [
          ...previous.products,

          {
            productId:
              null,

            name:
              "",

            price:
              "",

            duration:
              "30 jours",

            description:
              "",
          },
        ],
      })
    );
  };

  const removePackProduct = (
    index: number
  ) => {
    setPackForm(
      (previous) => ({
        ...previous,

        products:
          previous.products.filter(
            (_, itemIndex) =>
              itemIndex !== index
          ),
      })
    );
  };

  const updatePackProductField = (
    index: number,
    field: keyof PackProductForm,
    value: string
  ) => {
    setPackForm(
      (previous) => ({
        ...previous,

        products:
          previous.products.map(
            (product, itemIndex) =>
              itemIndex === index
                ? {
                    ...product,

                    [field]:
                      value,
                  }
                : product
          ),
      })
    );
  };

  const savePack = async () => {
    const name =
      packForm.name.trim();

    if (!name) {
      window.alert(
        "Le nom du Pack est obligatoire."
      );
      return;
    }

    const priceNumber =
      Number(
        packForm.price
          .replace(",", ".")
          .trim()
      );

    if (
      !Number.isFinite(
        priceNumber
      ) ||
      priceNumber < 0
    ) {
      window.alert(
        "Entre un prix valide pour le Pack."
      );
      return;
    }

    if (
      !packForm.duration.trim()
    ) {
      window.alert(
        "La durée du Pack est obligatoire."
      );
      return;
    }

    if (
      packForm.products.length === 0
    ) {
      window.alert(
        "Ajoute au moins un produit au Pack."
      );
      return;
    }

    const invalidExclusive =
      packForm.products.some(
        (product) =>
          product.productId === null &&
          !product.name.trim()
      );

    if (invalidExclusive) {
      window.alert(
        "Tous les produits exclusifs doivent avoir un nom."
      );
      return;
    }

    try {
      const packProducts: PackProduct[] =
        packForm.products.map(
          (product, index) => ({
            productId:
              product.productId,

            name:
              product.name.trim(),

            price:
              cleanPrice(
                product.price
              ),

            duration:
              product.duration.trim(),

            description:
              product.description.trim(),

            position:
              index,
          })
        );

      const packData: Pack = {
        name,

        price:
          cleanPrice(
            packForm.price
          ),

        duration:
          packForm.duration.trim(),

        description:
          packForm.description.trim(),

        image:
          packForm.image.trim(),

        active:
          packForm.active,

        position:
          editingPackId
            ? packs[
                editingPackId
              ]?.position ?? 0
            : Object.keys(
                packs
              ).length,

        products:
          packProducts,
      };

      if (editingPackId) {
        await updatePack(
          editingPackId,
          packData
        );

        setPacks(
          (previous) => ({
            ...previous,

            [editingPackId]: {
              ...packData,

              id:
                editingPackId,
            },
          })
        );

        window.alert(
          "Pack modifié avec succès ✅"
        );
      } else {
        const id =
          await createPack(
            packData,
            packData.position
          );

        setPacks(
          (previous) => ({
            ...previous,

            [id]: {
              ...packData,

              id,
            },
          })
        );

        window.alert(
          "Pack créé avec succès ✅"
        );
      }

      closePackModal();
    } catch (error) {
      console.error(
        "Erreur sauvegarde Pack:",
        error
      );

      const message =
        error instanceof Error
          ? error.message
          : String(error);

      window.alert(
        `Impossible d'enregistrer le Pack.\n\n${message}`
      );
    }
  };

  const togglePackVisible =
    async (
      id: string
    ) => {
      const pack =
        packs[id];

      if (!pack) {
        return;
      }

      const nextActive =
        !pack.active;

      try {
        await setPackActive(
          id,
          nextActive
        );

        setPacks(
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
          "Erreur visibilité Pack:",
          error
        );

        const message =
          error instanceof Error
            ? error.message
            : String(error);

        window.alert(
          `Impossible de modifier la visibilité du Pack.\n\n${message}`
        );
      }
    };

  const removePack = async (
    id: string
  ) => {
    const pack =
      packs[id];

    if (!pack) {
      return;
    }

    const confirmed =
      window.confirm(
        `Supprimer le Pack "${pack.name}" ?`
      );

    if (!confirmed) {
      return;
    }

    try {
      await deletePack(id);

      setPacks(
        (previous) => {
          const updated = {
            ...previous,
          };

          delete updated[id];

          return updated;
        }
      );

      window.alert(
        "Pack supprimé avec succès."
      );
    } catch (error) {
      console.error(
        "Erreur suppression Pack:",
        error
      );

      const message =
        error instanceof Error
          ? error.message
          : String(error);

      window.alert(
        `Impossible de supprimer le Pack.\n\n${message}`
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
            PACKS
        ===================================================== */}

        <section className="mb-8 rounded-2xl border bg-card p-6">

          <div className="mb-6 flex flex-col justify-between gap-4 sm:flex-row sm:items-center">

            <div>

              <div className="flex items-center gap-2">

                <Package className="h-6 w-6 text-primary" />

                <h2 className="text-2xl font-bold">
                  Gestion des Packs
                </h2>

              </div>

              <p className="mt-1 text-sm text-muted-foreground">
                Créez des packs avec plusieurs produits existants ou exclusifs.
              </p>

            </div>

            <button
              type="button"
              onClick={openNewPack}
              className="inline-flex items-center justify-center gap-2 rounded-md bg-primary px-5 py-2 text-primary-foreground transition hover:opacity-90"
            >
              <Plus className="h-4 w-4" />
              Ajouter un pack
            </button>

          </div>

          {packsLoading && (

            <div className="rounded-2xl border p-6 text-center text-muted-foreground">
              Chargement des Packs...
            </div>

          )}

          {packsError && (

            <div className="rounded-2xl border border-destructive/40 bg-destructive/10 p-6 text-center text-destructive">
              {packsError}
            </div>

          )}

          {!packsLoading &&
            !packsError && (

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
                        Durée
                      </th>

                      <th className="p-4">
                        Produits
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

                    {Object.keys(
                      packs
                    ).length === 0 ? (

                      <tr>

                        <td
                          colSpan={6}
                          className="p-8 text-center text-muted-foreground"
                        >
                          Aucun Pack créé pour le moment.
                        </td>

                      </tr>

                    ) : (

                      Object.entries(
                        packs
                      ).map(
                        ([id, pack]) => (

                          <tr
                            key={id}
                            className="border-t"
                          >

                            <td className="p-4">

                              <div className="flex items-center gap-3">

                                {pack.image ? (

                                  <img
                                    src={pack.image}
                                    alt={pack.name}
                                    className="h-12 w-12 rounded-lg object-cover"
                                  />

                                ) : (

                                  <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10">
                                    <Package className="h-5 w-5 text-primary" />
                                  </div>

                                )}

                                <div>

                                  <div className="font-bold">
                                    {pack.name}
                                  </div>

                                  {pack.description && (

                                    <div className="max-w-xs truncate text-xs text-muted-foreground">
                                      {pack.description}
                                    </div>

                                  )}

                                </div>

                              </div>

                            </td>

                            <td className="p-4 font-bold text-primary">
                              {cleanPrice(
                                pack.price
                              )}
                            </td>

                            <td className="p-4">
                              {pack.duration}
                            </td>

                            <td className="p-4">

                              <span className="rounded-full bg-primary/10 px-3 py-1 text-xs font-bold">
                                {pack.products?.length ?? 0} produit(s)
                              </span>

                            </td>

                            <td className="p-4">

                              <button
                                type="button"
                                onClick={() =>
                                  togglePackVisible(
                                    id
                                  )
                                }
                                className={
                                  pack.active
                                    ? "rounded-full bg-green-600 px-3 py-1 text-xs font-bold text-white"
                                    : "rounded-full bg-gray-500 px-3 py-1 text-xs font-bold text-white"
                                }
                              >
                                {pack.active
                                  ? "Visible"
                                  : "Invisible"}
                              </button>

                            </td>

                            <td className="p-4">

                              <div className="flex gap-2">

                                <button
                                  type="button"
                                  onClick={() =>
                                    openEditPack(
                                      id
                                    )
                                  }
                                  className="rounded-md bg-primary px-3 py-2 text-xs text-primary-foreground"
                                >
                                  Modifier
                                </button>

                                <button
                                  type="button"
                                  onClick={() =>
                                    removePack(
                                      id
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
                      )

                    )}

                  </tbody>

                </table>

              </div>

            )}

        </section>

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

                          <div className="flex gap-2">

                            <button
                              type="button"
                              onClick={() =>
                                openSocialEdit(
                                  id
                                )
                              }
                              className="rounded-md bg-primary px-3 py-2 text-xs text-primary-foreground"
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
                              className="rounded-md bg-destructive px-3 py-2 text-xs text-destructive-foreground"
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
                        Prix 1 mois
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
          MODAL PACK
      ===================================================== */}

      {packModalOpen && (

        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 px-4">

          <div className="max-h-[92vh] w-full max-w-4xl overflow-auto rounded-2xl bg-background p-6 shadow-xl">

            <div className="mb-6">

              <h2 className="text-2xl font-bold">
                {editingPackId
                  ? "Modifier le Pack"
                  : "Ajouter un Pack"}
              </h2>

              <p className="mt-1 text-sm text-muted-foreground">
                Créez un ensemble de produits avec un prix unique.
              </p>

            </div>

            <div className="grid gap-5">

              {/* NOM */}

              <div>

                <label className="mb-1 block text-sm font-medium">
                  Nom du Pack
                </label>

                <input
                  className="w-full rounded-md border bg-background px-4 py-2"
                  placeholder="Ex. Pack Gaming"
                  value={packForm.name}
                  onChange={(event) =>
                    setPackForm(
                      (previous) => ({
                        ...previous,
                        name:
                          event.target.value,
                      })
                    )
                  }
                />

              </div>

              {/* PRIX + DURÉE */}

              <div className="grid gap-4 md:grid-cols-2">

                <div>

                  <label className="mb-1 block text-sm font-medium">
                    Prix du Pack
                  </label>

                  <div className="flex items-center gap-2">

                    <input
                      type="number"
                      min="0"
                      step="0.01"
                      className="w-full rounded-md border bg-background px-4 py-2"
                      placeholder="39"
                      value={packForm.price}
                      onChange={(event) =>
                        setPackForm(
                          (previous) => ({
                            ...previous,
                            price:
                              event.target.value,
                          })
                        )
                      }
                    />

                    <span className="font-bold">
                      DT
                    </span>

                  </div>

                </div>

                <div>

                  <label className="mb-1 block text-sm font-medium">
                    Durée
                  </label>

                  <input
                    className="w-full rounded-md border bg-background px-4 py-2"
                    placeholder="30 jours"
                    value={packForm.duration}
                    onChange={(event) =>
                      setPackForm(
                        (previous) => ({
                          ...previous,
                          duration:
                            event.target.value,
                        })
                      )
                    }
                  />

                </div>

              </div>

              {/* DESCRIPTION */}

              <div>

                <label className="mb-1 block text-sm font-medium">
                  Description
                </label>

                <textarea
                  className="min-h-24 w-full rounded-md border bg-background px-4 py-2"
                  placeholder="Description du Pack"
                  value={packForm.description}
                  onChange={(event) =>
                    setPackForm(
                      (previous) => ({
                        ...previous,
                        description:
                          event.target.value,
                      })
                    )
                  }
                />

              </div>

              {/* IMAGE DU PACK */}

              <div>

                <label className="mb-1 block text-sm font-medium">
                  Image du Pack
                </label>

                <div className="rounded-xl border border-dashed p-4">

                  {packForm.image ? (
                    <div className="space-y-4">

                      <div className="overflow-hidden rounded-xl border bg-muted">
                        <img
                          src={packForm.image}
                          alt={packForm.name || "Image du Pack"}
                          className="h-48 w-full object-cover"
                        />
                      </div>

                      <div className="flex flex-wrap gap-3">

                        <label className="inline-flex cursor-pointer items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition hover:opacity-90">
                          {packImageUploading
                            ? "Upload en cours..."
                            : "Changer l'image"}

                          <input
                            type="file"
                            accept="image/*"
                            className="hidden"
                            disabled={packImageUploading}
                            onChange={handlePackImageChange}
                          />
                        </label>

                        <button
                          type="button"
                          onClick={removePackImage}
                          disabled={packImageUploading}
                          className="inline-flex items-center gap-2 rounded-md border border-destructive px-4 py-2 text-sm font-medium text-destructive transition hover:bg-destructive hover:text-destructive-foreground disabled:cursor-not-allowed disabled:opacity-50"
                        >
                          <Trash2 className="h-4 w-4" />
                          Supprimer l'image
                        </button>

                      </div>

                    </div>
                  ) : (
                    <label className="flex cursor-pointer flex-col items-center justify-center rounded-xl px-6 py-10 text-center transition hover:bg-muted/50">

                      <Package className="mb-3 h-10 w-10 text-muted-foreground" />

                      <span className="font-medium">
                        {packImageUploading
                          ? "Upload de l'image..."
                          : "Choisir une image"}
                      </span>

                      <span className="mt-1 text-xs text-muted-foreground">
                        PNG, JPG, WEBP — maximum 5 MB
                      </span>

                      <input
                        type="file"
                        accept="image/*"
                        className="hidden"
                        disabled={packImageUploading}
                        onChange={handlePackImageChange}
                      />

                    </label>
                  )}

                </div>

                <p className="mt-2 text-xs text-muted-foreground">
                  L'image sera envoyée automatiquement dans Supabase Storage.
                </p>

              </div>

              {/* PRODUITS EXISTANTS */}

              <div className="rounded-2xl border p-5">

                <div className="mb-4">

                  <h3 className="text-lg font-bold">
                    Produits existants
                  </h3>

                  <p className="text-sm text-muted-foreground">
                    Sélectionne les produits déjà présents dans ton catalogue.
                  </p>

                </div>

                {productsLoading ? (

                  <div className="rounded-md border p-4 text-center text-sm text-muted-foreground">
                    Chargement des produits...
                  </div>

                ) : Object.keys(
                    products
                  ).length === 0 ? (

                  <div className="rounded-md border p-4 text-center text-sm text-muted-foreground">
                    Aucun produit disponible.
                  </div>

                ) : (

                  <div className="grid gap-3 md:grid-cols-2">

                    {Object.entries(
                      products
                    ).map(
                      ([id, product]) => {

                        const checked =
                          packForm.products.some(
                            (item) =>
                              item.productId ===
                              id
                          );

                        return (

                          <label
                            key={id}
                            className={`flex cursor-pointer items-center gap-3 rounded-xl border p-4 transition ${
                              checked
                                ? "border-primary bg-primary/10"
                                : "hover:bg-muted"
                            }`}
                          >

                            <input
                              type="checkbox"
                              checked={
                                checked
                              }
                              onChange={() =>
                                toggleExistingProductInPack(
                                  id
                                )
                              }
                            />

                            <div className="min-w-0 flex-1">

                              <div className="font-semibold">
                                {product.name}
                              </div>

                              <div className="text-xs text-muted-foreground">
                                {product.pricesByDuration?.[
                                  "1 month"
                                ] ??
                                  "0 DT"}{" "}
                                •{" "}
                                {product.duration}
                              </div>

                            </div>

                          </label>

                        );
                      }
                    )}

                  </div>

                )}

              </div>

              {/* PRODUITS SÉLECTIONNÉS */}

              {packForm.products.filter(
                (product) =>
                  product.productId !== null
              ).length > 0 && (

                <div className="rounded-2xl border p-5">

                  <h3 className="mb-4 text-lg font-bold">
                    Produits sélectionnés
                  </h3>

                  <div className="space-y-2">

                    {packForm.products
                      .map(
                        (
                          product,
                          index
                        ) =>
                          product.productId !==
                          null ? (

                            <div
                              key={`${product.productId}-${index}`}
                              className="flex items-center justify-between rounded-xl bg-muted/40 p-3"
                            >

                              <div>

                                <div className="font-medium">
                                  {product.name}
                                </div>

                                <div className="text-xs text-muted-foreground">
                                  {cleanPrice(
                                    product.price
                                  )}{" "}
                                  •{" "}
                                  {product.duration}
                                </div>

                              </div>

                              <button
                                type="button"
                                onClick={() =>
                                  removePackProduct(
                                    index
                                  )
                                }
                                className="rounded-md p-2 text-destructive transition hover:bg-destructive/10"
                              >
                                <Trash2 className="h-4 w-4" />
                              </button>

                            </div>

                          ) : null
                      )}

                  </div>

                </div>

              )}

              {/* PRODUITS EXCLUSIFS */}

              <div className="rounded-2xl border p-5">

                <div className="mb-4 flex flex-col justify-between gap-3 sm:flex-row sm:items-center">

                  <div>

                    <h3 className="text-lg font-bold">
                      Produits exclusifs au Pack
                    </h3>

                    <p className="text-sm text-muted-foreground">
                      Ces produits peuvent exister uniquement dans ce Pack.
                    </p>

                  </div>

                  <button
                    type="button"
                    onClick={
                      addExclusiveProduct
                    }
                    className="inline-flex items-center justify-center gap-2 rounded-md border border-primary px-4 py-2 text-primary transition hover:bg-primary hover:text-primary-foreground"
                  >
                    <Plus className="h-4 w-4" />
                    Ajouter un produit
                  </button>

                </div>

                {packForm.products.filter(
                  (product) =>
                    product.productId === null
                ).length === 0 ? (

                  <div className="rounded-xl border border-dashed p-5 text-center text-sm text-muted-foreground">
                    Aucun produit exclusif.
                  </div>

                ) : (

                  <div className="space-y-5">

                    {packForm.products.map(
                      (
                        product,
                        index
                      ) => {

                        if (
                          product.productId !==
                          null
                        ) {
                          return null;
                        }

                        return (

                          <div
                            key={`exclusive-${index}`}
                            className="rounded-xl border bg-muted/20 p-4"
                          >

                            <div className="mb-4 flex items-center justify-between">

                              <h4 className="font-semibold">
                                Produit exclusif
                              </h4>

                              <button
                                type="button"
                                onClick={() =>
                                  removePackProduct(
                                    index
                                  )
                                }
                                className="rounded-md p-2 text-destructive transition hover:bg-destructive/10"
                              >
                                <Trash2 className="h-4 w-4" />
                              </button>

                            </div>

                            <div className="grid gap-3 md:grid-cols-2">

                              <input
                                className="rounded-md border bg-background px-4 py-2"
                                placeholder="Nom du produit"
                                value={
                                  product.name
                                }
                                onChange={(
                                  event
                                ) =>
                                  updatePackProductField(
                                    index,
                                    "name",
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
                                    product.price
                                  }
                                  onChange={(
                                    event
                                  ) =>
                                    updatePackProductField(
                                      index,
                                      "price",
                                      event.target.value
                                    )
                                  }
                                />

                                <span className="font-bold">
                                  DT
                                </span>

                              </div>

                              <input
                                className="rounded-md border bg-background px-4 py-2"
                                placeholder="Durée"
                                value={
                                  product.duration
                                }
                                onChange={(
                                  event
                                ) =>
                                  updatePackProductField(
                                    index,
                                    "duration",
                                    event.target.value
                                  )
                                }
                              />

                              <input
                                className="rounded-md border bg-background px-4 py-2"
                                placeholder="Description"
                                value={
                                  product.description
                                }
                                onChange={(
                                  event
                                ) =>
                                  updatePackProductField(
                                    index,
                                    "description",
                                    event.target.value
                                  )
                                }
                              />

                            </div>

                          </div>

                        );
                      }
                    )}

                  </div>

                )}

              </div>

              {/* VISIBILITÉ */}

              <label className="flex cursor-pointer items-center gap-3 rounded-md border p-4">

                <input
                  type="checkbox"
                  checked={
                    packForm.active
                  }
                  onChange={(event) =>
                    setPackForm(
                      (previous) => ({
                        ...previous,
                        active:
                          event.target.checked,
                      })
                    )
                  }
                />

                <div>

                  <div className="font-medium">
                    Pack visible
                  </div>

                  <div className="text-xs text-muted-foreground">
                    Le Pack sera affiché sur la page publique lorsqu'il est visible.
                  </div>

                </div>

              </label>

            </div>

            {/* BOUTONS */}

            <div className="mt-6 flex flex-col-reverse justify-end gap-3 sm:flex-row">

              <button
                type="button"
                onClick={
                  closePackModal
                }
                className="rounded-md border px-5 py-2 transition hover:bg-muted"
              >
                Annuler
              </button>

              <button
                type="button"
                onClick={
                  savePack
                }
                className="rounded-md bg-primary px-5 py-2 font-medium text-primary-foreground transition hover:opacity-90"
              >
                {editingPackId
                  ? "Enregistrer les modifications"
                  : "Créer le Pack"}
              </button>

            </div>

          </div>

        </div>

      )}

      {/* =====================================================
          MODAL MODIFICATION PRODUIT SOCIAL
      ===================================================== */}

      {editingSocialId &&
        editSocialProduct && (

          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 px-4">

            <div className="max-h-[90vh] w-full max-w-2xl overflow-auto rounded-2xl bg-background p-6 shadow-xl">

              <h2 className="mb-2 text-2xl font-bold">
                Modifier le produit social
              </h2>

              <p className="mb-6 text-sm text-muted-foreground">
                Modifie les informations du produit social.
              </p>

              <div className="grid gap-4">

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
                          event.target.value,
                      })
                    }
                  />

                </div>

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
                            event.target.value
                          ),
                      })
                    }
                  />

                </div>

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
                              event.target.value
                            ),
                        })
                      }
                    />

                    <span className="font-bold">
                      DT
                    </span>

                  </div>

                </div>

                <div>

                  <label className="mb-1 block text-sm font-medium">
                    Ancien prix
                  </label>

                  <div className="flex items-center gap-2">

                    <input
                      type="number"
                      min="0"
                      step="0.01"
                      className="w-full rounded-md border bg-background px-4 py-2"
                      value={
                        editSocialProduct.oldPrice
                      }
                      onChange={(event) =>
                        setEditSocialProduct({
                          ...editSocialProduct,

                          oldPrice:
                            Number(
                              event.target.value
                            ),
                        })
                      }
                    />

                    <span className="font-bold">
                      DT
                    </span>

                  </div>

                </div>

                <div>

                  <label className="mb-1 block text-sm font-medium">
                    Description
                  </label>

                  <textarea
                    className="min-h-24 w-full rounded-md border bg-background px-4 py-2"
                    value={
                      editSocialProduct.description
                    }
                    onChange={(event) =>
                      setEditSocialProduct({
                        ...editSocialProduct,

                        description:
                          event.target.value,
                      })
                    }
                  />

                </div>

                <label className="flex cursor-pointer items-center gap-2 rounded-md border p-3">

                  <input
                    type="checkbox"
                    checked={
                      editSocialProduct.active
                    }
                    onChange={(event) =>
                      setEditSocialProduct({
                        ...editSocialProduct,

                        active:
                          event.target.checked,
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

      {/* =====================================================
          MODAL MODIFICATION PRODUIT
      ===================================================== */}

      {editingSlug &&
        editProduct && (

          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 px-4">

            <div className="max-h-[90vh] w-full max-w-2xl overflow-auto rounded-2xl bg-background p-6 shadow-xl">

              <h2 className="mb-2 text-2xl font-bold">
                Modifier le produit
              </h2>

              <p className="mb-6 text-sm text-muted-foreground">
                Modifie les informations et les prix de chaque durée.
              </p>

              <div className="grid gap-4">

                <div>

                  <label className="mb-1 block text-sm font-medium">
                    Nom du produit
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

                <div>

                  <label className="mb-1 block text-sm font-medium">
                    Ancien prix
                  </label>

                  <div className="flex items-center gap-2">

                    <input
                      type="number"
                      min="0"
                      step="0.01"
                      className="w-full rounded-md border bg-background px-4 py-2"
                      value={priceInputValue(
                        editProduct.oldPrice
                      )}
                      onChange={(event) =>
                        setEditProduct({
                          ...editProduct,

                          oldPrice:
                            event.target
                              .value,
                        })
                      }
                    />

                    <span className="font-bold">
                      DT
                    </span>

                  </div>

                </div>

                {[
                  [
                    "1 month",
                    "Prix 1 mois",
                  ],
                  [
                    "2 months",
                    "Prix 2 mois",
                  ],
                  [
                    "3 months",
                    "Prix 3 mois",
                  ],
                  [
                    "6 months",
                    "Prix 6 mois",
                  ],
                  [
                    "1 year",
                    "Prix 1 an",
                  ],
                ].map(
                  ([duration, label]) => (

                    <div
                      key={duration}
                    >

                      <label className="mb-1 block text-sm font-medium">
                        {label}
                      </label>

                      <div className="flex items-center gap-2">

                        <input
                          type="number"
                          min="0"
                          step="0.01"
                          className="w-full rounded-md border bg-background px-4 py-2"
                          value={priceInputValue(
                            editProduct
                              .pricesByDuration?.[
                              duration as keyof typeof editProduct.pricesByDuration
                            ]
                          )}
                          onChange={(event) =>
                            setEditProduct({
                              ...editProduct,

                              pricesByDuration:
                                {
                                  ...editProduct.pricesByDuration,

                                  [duration]:
                                    event.target
                                      .value,
                                },
                            })
                          }
                        />

                        <span className="font-bold">
                          DT
                        </span>

                      </div>

                    </div>

                  )
                )}

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
                    Description
                  </label>

                  <textarea
                    className="min-h-24 w-full rounded-md border bg-background px-4 py-2"
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

                  <label className="mb-1 block text-sm font-medium">
                    Fonctionnalités
                  </label>

                  <textarea
                    className="min-h-32 w-full rounded-md border bg-background px-4 py-2"
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
                  />

                </div>

                <label className="flex cursor-pointer items-center gap-2 rounded-md border p-3">

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
                  onClick={closeEdit}
                  className="rounded-md border px-4 py-2 transition hover:bg-muted"
                >
                  Annuler
                </button>

                <button
                  type="button"
                  onClick={saveEdit}
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
