import { supabase } from "@/lib/supabase";

/* =========================================================
   TYPES
========================================================= */

export type DurationKey =
  | "1 month"
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
};

type ProductRow = {
  id: string;
  name: string | null;
  old_price: string | number | null;
  duration: string | null;
  category: string | null;
  description: string | null;
  features: unknown;
  active: boolean | null;
  price_1_month: string | number | null;
  price_6_months: string | number | null;
  price_1_year: string | number | null;
  position: number | null;
  updated_at?: string | null;
};

/* =========================================================
   HELPERS
========================================================= */

function normalizeDuration(
  duration: unknown
): DurationKey {
  if (duration === "6 months") {
    return "6 months";
  }

  if (duration === "1 year") {
    return "1 year";
  }

  return "1 month";
}

function normalizeFeatures(
  features: unknown
): string[] {
  if (!Array.isArray(features)) {
    return [];
  }

  return features.filter(
    (feature): feature is string =>
      typeof feature === "string"
  );
}

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

  if (
    value
      .toUpperCase()
      .includes("DT")
  ) {
    return value;
  }

  return `${value} DT`;
}

/* =========================================================
   SUPABASE ROW -> WEBSITE PRODUCT
========================================================= */

function rowToSubscription(
  row: ProductRow
): Subscription {
  return {
    name:
      row.name || "",

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
        normalizePrice(
          row.price_1_month
        ),

      "6 months":
        normalizePrice(
          row.price_6_months
        ),

      "1 year":
        normalizePrice(
          row.price_1_year
        ),
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
  return {
    name:
      product.name.trim(),

    old_price:
      normalizePrice(
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
      normalizePrice(
        product
          .pricesByDuration?.[
          "1 month"
        ]
      ),

    price_6_months:
      normalizePrice(
        product
          .pricesByDuration?.[
          "6 months"
        ]
      ),

    price_1_year:
      normalizePrice(
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
  } =
    await supabase
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
  } =
    await supabase
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
  } =
    await supabase
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
  const row =
    subscriptionToRow(
      product,
      position
    );

  const {
    data,
    error,
  } =
    await supabase
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
    Si on ne reçoit pas de position,
    on garde la position actuelle.
  */

  if (
    finalPosition ===
    undefined
  ) {
    const {
      data,
      error,
    } =
      await supabase
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
  } =
    await supabase
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
  } =
    await supabase
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
  } =
    await supabase
      .from("products")
      .update({
        active,

        updated_at:
          new Date()
            .toISOString(),
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
  } =
    await supabase
      .from("products")
      .update({
        position,

        updated_at:
          new Date()
            .toISOString(),
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
   utilisé par admin.tsx
========================================================= */

export async function saveProducts(
  products: Record<
    string,
    Subscription
  >
): Promise<void> {
  /*
    1. On récupère tous les produits
    existants dans Supabase.
  */

  const {
    data: currentRows,
    error:
      currentRowsError,
  } =
    await supabase
      .from("products")
      .select(
        "id"
      );

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
    IDs Supabase toujours présents
    dans l'état Admin.
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
    2. Suppression des produits
    supprimés depuis l'Admin.
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
    } =
      await supabase
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
    3. UPDATE des produits existants.
    4. INSERT des nouveaux produits.
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
      entries[
        index
      ];

    const row =
      subscriptionToRow(
        product,
        index
      );

    /*
      Produit déjà dans Supabase
    */

    if (
      existingIds.has(
        id
      )
    ) {
      const {
        error:
          updateError,
      } =
        await supabase
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
          `Erreur update ${product.name}:`,
          updateError
        );

        throw new Error(
          updateError.message
        );
      }

      continue;
    }

    /*
      Nouveau produit.

      Le id utilisé dans admin.tsx
      peut être un slug temporaire.

      On ne l'envoie donc PAS à Supabase.
      Supabase génère son UUID.
    */

    const {
      error:
        insertError,
    } =
      await supabase
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
        `Erreur insertion ${product.name}:`,
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
    void supabase
      .removeChannel(
        channel
      );
  };
}

/* =========================================================
   PENDING ORDERS

   Cette partie reste localStorage
   pour l'instant car elle n'utilise
   pas la table products.
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

export function savePendingCart(
  cart: any[]
): void {
  if (
    !Array.isArray(
      cart
    ) ||
    cart.length === 0
  ) {
    return;
  }

  const total =
    cart.reduce(
      (
        sum:
          number,
        item:
          any
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
        `pending-${Date.now()}`,

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
        new Date()
          .toISOString(),
    };

  const existingOrders =
    getPendingOrders();

  savePendingOrders([
    ...existingOrders,
    pendingOrder,
  ]);
}
