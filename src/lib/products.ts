import { supabase } from "@/lib/supabase";

/* =========================================================
   TYPES
========================================================= */

export type DurationKey =
  | "1 month"
  | "2 months"
  | "3 months"
  | "6 months"
  | "1 year";

export type DurationPrice = Record<
  DurationKey,
  string
>;

export type Subscription = {
  name: string;
  oldPrice: string;
  duration: DurationKey;
  category: string;
  description: string;
  features: string[];
  active: boolean;
  pricesByDuration: DurationPrice;

  /*
   * Prix principal / ancien système.
   * Gardé pour compatibilité avec les anciens produits.
   */
  price?: string;
};

type ProductRow = {
  id: string;

  name: string | null;

  /*
   * Ancien champ éventuellement présent
   * dans la table products.
   */
  price?: string | number | null;

  old_price: string | number | null;

  duration: string | null;

  category: string | null;

  description: string | null;

  features: unknown;

  active: boolean | null;

  /*
   * Nouveaux prix par durée.
   */
  price_1_month?: string | number | null;

  price_2_months?: string | number | null;

  price_3_months?: string | number | null;

  price_6_months?: string | number | null;

  price_1_year?: string | number | null;

  position: number | null;

  updated_at?: string | null;
};

/* =========================================================
   HELPERS
========================================================= */

function normalizeDuration(
  duration: unknown
): DurationKey {
  if (duration === "2 months") {
    return "2 months";
  }

  if (duration === "3 months") {
    return "3 months";
  }

  if (duration === "6 months") {
    return "6 months";
  }

  if (duration === "1 year") {
    return "1 year";
  }

  return "1 month";
}

/* =========================================================
   FEATURES
========================================================= */

function normalizeFeatures(
  features: unknown
): string[] {
  if (!Array.isArray(features)) {
    return [];
  }

  return features.filter(
    (
      feature
    ): feature is string =>
      typeof feature === "string"
  );
}

/* =========================================================
   PRICE NORMALIZATION
========================================================= */

function normalizePrice(
  price:
    | string
    | number
    | null
    | undefined
): string {
  if (
    price === null ||
    price === undefined ||
    price === ""
  ) {
    return "0 DT";
  }

  const value = String(price).trim();

  if (!value) {
    return "0 DT";
  }

  /*
   * Si le prix contient déjà DT,
   * on le conserve.
   */
  if (
    value
      .toUpperCase()
      .includes("DT")
  ) {
    return value;
  }

  return value + " DT";
}

/* =========================================================
   PRICE TO NUMBER
========================================================= */

function priceToNumber(
  price:
    | string
    | number
    | null
    | undefined
): number {
  if (
    price === null ||
    price === undefined ||
    price === ""
  ) {
    return 0;
  }

  const cleaned = String(price)
    .replace(/DT/gi, "")
    .replace(/\s/g, "")
    .replace(",", ".")
    .replace(/[^\d.-]/g, "");

  const value = Number(cleaned);

  return Number.isFinite(value)
    ? value
    : 0;
}

/* =========================================================
   PRICE TO DATABASE
========================================================= */

function priceToDatabase(
  price:
    | string
    | number
    | null
    | undefined
): number {
  return priceToNumber(
    price
  );
}

/* =========================================================
   GET PRICE WITH FALLBACK
========================================================= */

/*
 * Cette fonction est importante.
 *
 * Si le nouveau champ est vide ou à 0,
 * on peut utiliser l'ancien prix.
 */
function getPriceWithFallback(
  newPrice:
    | string
    | number
    | null
    | undefined,
  fallbackPrice:
    | string
    | number
    | null
    | undefined
): string {
  const newPriceNumber =
    priceToNumber(
      newPrice
    );

  if (
    newPriceNumber > 0
  ) {
    return normalizePrice(
      newPrice
    );
  }

  const fallbackNumber =
    priceToNumber(
      fallbackPrice
    );

  if (
    fallbackNumber > 0
  ) {
    return normalizePrice(
      fallbackPrice
    );
  }

  return "0 DT";
}

/* =========================================================
   SUPABASE ROW -> WEBSITE PRODUCT
========================================================= */

function rowToSubscription(
  row: ProductRow
): Subscription {
  /*
   * Ancien prix principal.
   *
   * Certains anciens produits comme Gemini
   * peuvent encore utiliser "price".
   */
  const legacyPrice =
    row.price;

  /*
   * Prix 1 mois :
   *
   * priorité :
   * 1. price_1_month
   * 2. ancien champ price
   */
  const price1Month =
    getPriceWithFallback(
      row.price_1_month,
      legacyPrice
    );

  /*
   * Les autres durées utilisent uniquement
   * leur propre colonne.
   */
  const price2Months =
    normalizePrice(
      row.price_2_months
    );

  const price3Months =
    normalizePrice(
      row.price_3_months
    );

  const price6Months =
    normalizePrice(
      row.price_6_months
    );

  const price1Year =
    normalizePrice(
      row.price_1_year
    );

  return {
    name:
      row.name || "",

    /*
     * Compatibilité avec l'ancien système.
     */
    price:
      price1Month,

    oldPrice:
      normalizePrice(
        row.old_price
      ),

    duration:
      normalizeDuration(
        row.duration
      ),

    category:
      row.category || "",

    description:
      row.description || "",

    features:
      normalizeFeatures(
        row.features
      ),

    active:
      row.active ?? true,

    pricesByDuration: {
      "1 month":
        price1Month,

      "2 months":
        price2Months,

      "3 months":
        price3Months,

      "6 months":
        price6Months,

      "1 year":
        price1Year,
    },
  };
}

/* =========================================================
   WEBSITE PRODUCT -> SUPABASE ROW
========================================================= */

function subscriptionToRow(
  product: Subscription,
  position = 0
) {
  /*
   * Prix 1 mois.
   *
   * Si pricesByDuration n'existe pas,
   * on utilise product.price.
   */
  const price1Month =
    product
      .pricesByDuration?.[
      "1 month"
    ] ??
    product.price ??
    "0 DT";

  return {
    name:
      product.name.trim(),

    old_price:
      priceToDatabase(
        product.oldPrice
      ),

    duration:
      product.duration,

    category:
      product.category.trim(),

    description:
      product.description.trim(),

    features:
      Array.isArray(
        product.features
      )
        ? product.features
        : [],

    active:
      product.active,

    price_1_month:
      priceToDatabase(
        price1Month
      ),

    price_2_months:
      priceToDatabase(
        product
          .pricesByDuration?.[
          "2 months"
        ]
      ),

    price_3_months:
      priceToDatabase(
        product
          .pricesByDuration?.[
          "3 months"
        ]
      ),

    price_6_months:
      priceToDatabase(
        product
          .pricesByDuration?.[
          "6 months"
        ]
      ),

    price_1_year:
      priceToDatabase(
        product
          .pricesByDuration?.[
          "1 year"
        ]
      ),

    position,

    updated_at:
      new Date().toISOString(),
  };
}

/* =========================================================
   GET ALL PRODUCTS
========================================================= */

export async function getProducts(): Promise<
  Record<
    string,
    Subscription
  >
> {
  const {
    data,
    error,
  } = await supabase
    .from("products")
    .select("*")
    .order(
      "position",
      {
        ascending: true,
      }
    );

  if (error) {
    console.error(
      "Erreur Supabase getProducts:",
      error
    );

    throw new Error(
      error.message
    );
  }

  const rows =
    (data ??
      []) as ProductRow[];

  const products: Record<
    string,
    Subscription
  > = {};

  for (
    const row of rows
  ) {
    products[row.id] =
      rowToSubscription(
        row
      );
  }

  return products;
}

/* =========================================================
   GET ACTIVE PRODUCTS
========================================================= */

export async function getActiveProducts(): Promise<
  Record<
    string,
    Subscription
  >
> {
  const {
    data,
    error,
  } = await supabase
    .from("products")
    .select("*")
    .eq(
      "active",
      true
    )
    .order(
      "position",
      {
        ascending: true,
      }
    );

  if (error) {
    console.error(
      "Erreur Supabase getActiveProducts:",
      error
    );

    throw new Error(
      error.message
    );
  }

  const rows =
    (data ??
      []) as ProductRow[];

  const products: Record<
    string,
    Subscription
  > = {};

  for (
    const row of rows
  ) {
    products[row.id] =
      rowToSubscription(
        row
      );
  }

  return products;
}

/* =========================================================
   GET ONE PRODUCT
========================================================= */

export async function getProduct(
  id: string
): Promise<
  Subscription | null
> {
  const {
    data,
    error,
  } = await supabase
    .from("products")
    .select("*")
    .eq(
      "id",
      id
    )
    .maybeSingle();

  if (error) {
    console.error(
      "Erreur Supabase getProduct:",
      error
    );

    throw new Error(
      error.message
    );
  }

  if (!data) {
    return null;
  }

  return rowToSubscription(
    data as ProductRow
  );
}

/* =========================================================
   CREATE PRODUCT
========================================================= */

export async function createProduct(
  product: Subscription,
  position = 0
): Promise<string> {
  const id =
    crypto.randomUUID();

  const row = {
    id,

    ...subscriptionToRow(
      product,
      position
    ),
  };

  const {
    data,
    error,
  } = await supabase
    .from("products")
    .insert(row)
    .select("id")
    .single();

  if (error) {
    console.error(
      "Erreur Supabase createProduct:",
      error
    );

    throw new Error(
      error.message
    );
  }

  return String(
    data.id
  );
}

/* =========================================================
   UPDATE PRODUCT
========================================================= */

export async function updateProduct(
  id: string,
  product: Subscription,
  position?: number
): Promise<void> {
  let finalPosition =
    position;

  /*
   * Si aucune position n'est fournie,
   * on conserve celle existante.
   */
  if (
    finalPosition ===
    undefined
  ) {
    const {
      data,
      error,
    } = await supabase
      .from("products")
      .select(
        "position"
      )
      .eq(
        "id",
        id
      )
      .maybeSingle();

    if (error) {
      console.error(
        "Erreur récupération position:",
        error
      );
    }

    finalPosition =
      data?.position ??
      0;
  }

  const row =
    subscriptionToRow(
      product,
      finalPosition
    );

  const {
    error,
  } = await supabase
    .from("products")
    .update(row)
    .eq(
      "id",
      id
    );

  if (error) {
    console.error(
      "Erreur Supabase updateProduct:",
      error
    );

    throw new Error(
      error.message
    );
  }
}

/* =========================================================
   DELETE PRODUCT
========================================================= */

export async function deleteProduct(
  id: string
): Promise<void> {
  const {
    error,
  } = await supabase
    .from("products")
    .delete()
    .eq(
      "id",
      id
    );

  if (error) {
    console.error(
      "Erreur Supabase deleteProduct:",
      error
    );

    throw new Error(
      error.message
    );
  }
}

/* =========================================================
   ACTIVE / INACTIVE
========================================================= */

export async function setProductActive(
  id: string,
  active: boolean
): Promise<void> {
  const {
    error,
  } = await supabase
    .from("products")
    .update({
      active,

      updated_at:
        new Date().toISOString(),
    })
    .eq(
      "id",
      id
    );

  if (error) {
    console.error(
      "Erreur Supabase setProductActive:",
      error
    );

    throw new Error(
      error.message
    );
  }
}

/* =========================================================
   UPDATE POSITION
========================================================= */

export async function updateProductPosition(
  id: string,
  position: number
): Promise<void> {
  const {
    error,
  } = await supabase
    .from("products")
    .update({
      position,

      updated_at:
        new Date().toISOString(),
    })
    .eq(
      "id",
      id
    );

  if (error) {
    console.error(
      "Erreur Supabase updateProductPosition:",
      error
    );

    throw new Error(
      error.message
    );
  }
}

/* =========================================================
   SAVE ALL PRODUCTS
========================================================= */

export async function saveProducts(
  products: Record<
    string,
    Subscription
  >
): Promise<void> {
  /*
   * Récupérer les produits existants.
   */
  const {
    data: currentRows,
    error:
      currentRowsError,
  } = await supabase
    .from("products")
    .select("id");

  if (
    currentRowsError
  ) {
    console.error(
      "Erreur récupération produits avant sauvegarde:",
      currentRowsError
    );

    throw new Error(
      currentRowsError.message
    );
  }

  const existingIds =
    new Set<string>(
      (
        currentRows ??
        []
      ).map(
        (row) =>
          String(
            row.id
          )
      )
    );

  const entries =
    Object.entries(
      products
    );

  /*
   * IDs présents dans l'Admin.
   */
  const idsStillPresent =
    new Set<string>();

  for (
    const [
      id,
    ] of entries
  ) {
    if (
      existingIds.has(
        id
      )
    ) {
      idsStillPresent.add(
        id
      );
    }
  }

  /*
   * Suppression des produits
   * qui ne sont plus présents.
   */
  const idsToDelete =
    Array.from(
      existingIds
    ).filter(
      (id) =>
        !idsStillPresent.has(
          id
        )
    );

  if (
    idsToDelete.length >
    0
  ) {
    const {
      error:
        deleteError,
    } = await supabase
      .from("products")
      .delete()
      .in(
        "id",
        idsToDelete
      );

    if (
      deleteError
    ) {
      console.error(
        "Erreur suppression produits Supabase:",
        deleteError
      );

      throw new Error(
        deleteError.message
      );
    }
  }

  /*
   * UPDATE / INSERT
   */
  for (
    let index = 0;
    index <
    entries.length;
    index++
  ) {
    const [
      id,
      product,
    ] =
      entries[index];

    const row =
      subscriptionToRow(
        product,
        index
      );

    /*
     * Produit existant.
     */
    if (
      existingIds.has(
        id
      )
    ) {
      const {
        error:
          updateError,
      } = await supabase
        .from(
          "products"
        )
        .update(
          row
        )
        .eq(
          "id",
          id
        );

      if (
        updateError
      ) {
        console.error(
          "Erreur update " +
            product.name +
            ":",
          updateError
        );

        throw new Error(
          updateError.message
        );
      }

      continue;
    }

    /*
     * Nouveau produit.
     *
     * On laisse Supabase générer son ID.
     */
    const {
      error:
        insertError,
    } = await supabase
      .from(
        "products"
      )
      .insert(
        row
      );

    if (
      insertError
    ) {
      console.error(
        "Erreur insertion " +
          product.name +
          ":",
        insertError
      );

      throw new Error(
        insertError.message
      );
    }
  }
}

/* =========================================================
   REALTIME
========================================================= */

export function subscribeToProducts(
  onChange: () => void
) {
  const channel =
    supabase
      .channel(
        "products-realtime"
      )
      .on(
        "postgres_changes",
        {
          event: "*",

          schema:
            "public",

          table:
            "products",
        },
        () => {
          onChange();
        }
      )
      .subscribe();

  return () => {
    void supabase.removeChannel(
      channel
    );
  };
}

/* =========================================================
   PENDING ORDERS
========================================================= */

export type PendingOrder = {
  id: string;

  clientName: string;

  phone: string;

  status: "En attente";

  items: any[];

  total: number;

  createdAt: string;
};

/* =========================================================
   GET PENDING ORDERS
========================================================= */

export function getPendingOrders(): PendingOrder[] {
  try {
    const saved =
      localStorage.getItem(
        "pendingOrders"
      );

    if (!saved) {
      return [];
    }

    const parsed =
      JSON.parse(
        saved
      );

    if (
      !Array.isArray(
        parsed
      )
    ) {
      return [];
    }

    return parsed;
  } catch (
    error
  ) {
    console.error(
      "Erreur lecture commandes:",
      error
    );

    return [];
  }
}

/* =========================================================
   SAVE PENDING ORDERS
========================================================= */

export function savePendingOrders(
  orders: PendingOrder[]
): void {
  localStorage.setItem(
    "pendingOrders",
    JSON.stringify(
      orders
    )
  );
}

/* =========================================================
   SAVE PENDING CART
========================================================= */

export function savePendingCart(
  cart: any[]
): void {
  if (
    !Array.isArray(
      cart
    ) ||
    cart.length ===
      0
  ) {
    return;
  }

  const total =
    cart.reduce(
      (
        sum: number,
        item: any
      ) => {
        const rawPrice =
          String(
            item.price ??
              0
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
            item.quantity ??
              1
          ) || 1;

        return (
          sum +
          price *
            quantity
        );
      },
      0
    );

  const pendingOrder: PendingOrder =
    {
      id:
        "pending-" +
        Date.now(),

      clientName:
        "Client non confirmé",

      phone:
        "Non renseigné",

      status:
        "En attente",

      items:
        cart,

      total,

      createdAt:
        new Date().toISOString(),
    };

  const existingOrders =
    getPendingOrders();

  savePendingOrders([
    ...existingOrders,
    pendingOrder,
  ]);
}
