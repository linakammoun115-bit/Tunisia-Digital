import { supabase } from "@/lib/supabase";

export type DurationKey =
  | "1 month"
  | "2 months"
  | "3 months"
  | "6 months"
  | "1 year";

export type DurationPrice = Record<DurationKey, string>;

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
  price_2_months: string | number | null;
  price_3_months: string | number | null;
  price_6_months: string | number | null;
  price_1_year: string | number | null;

  position: number | null;
  updated_at?: string | null;
};

/* =========================================================
   NORMALISATION
========================================================= */

function normalizeDuration(
  value: string | null | undefined
): DurationKey {
  switch (value?.trim().toLowerCase()) {
    case "2 months":
      return "2 months";

    case "3 months":
      return "3 months";

    case "6 months":
      return "6 months";

    case "1 year":
      return "1 year";

    case "1 month":
    default:
      return "1 month";
  }
}

function normalizeFeatures(
  value: unknown
): string[] {
  if (Array.isArray(value)) {
    return value
      .map((item) => String(item).trim())
      .filter(Boolean);
  }

  if (typeof value === "string") {
    const trimmed = value.trim();

    if (!trimmed) {
      return [];
    }

    try {
      const parsed = JSON.parse(trimmed);

      if (Array.isArray(parsed)) {
        return parsed
          .map((item) => String(item).trim())
          .filter(Boolean);
      }
    } catch {
      // Si ce n'est pas du JSON, on traite chaque ligne comme une feature.
    }

    return trimmed
      .split("\n")
      .map((item) => item.trim())
      .filter(Boolean);
  }

  return [];
}

function normalizePrice(
  value: string | number | null | undefined
): string {
  if (
    value === null ||
    value === undefined ||
    value === ""
  ) {
    return "0 DT";
  }

  const raw = String(value)
    .replace(/DT/gi, "")
    .replace(/\s/g, "")
    .replace(",", ".")
    .trim();

  if (!raw) {
    return "0 DT";
  }

  const number = Number(raw);

  if (!Number.isFinite(number)) {
    return "0 DT";
  }

  return `${number} DT`;
}

function priceToDatabase(
  value: string | number | null | undefined
): number {
  if (
    value === null ||
    value === undefined ||
    value === ""
  ) {
    return 0;
  }

  const raw = String(value)
    .replace(/DT/gi, "")
    .replace(/\s/g, "")
    .replace(",", ".")
    .trim();

  if (!raw) {
    return 0;
  }

  const number = Number(raw);

  if (!Number.isFinite(number) || number < 0) {
    return 0;
  }

  return number;
}

/* =========================================================
   SUPABASE ROW → PRODUCT
========================================================= */

function rowToSubscription(
  row: ProductRow
): Subscription {
  return {
    name: row.name || "",

    oldPrice: normalizePrice(
      row.old_price
    ),

    duration: normalizeDuration(
      row.duration
    ),

    category: row.category || "",

    description:
      row.description || "",

    features:
      normalizeFeatures(
        row.features
      ),

    active:
      row.active ?? true,

    pricesByDuration: {
      "1 month": normalizePrice(
        row.price_1_month
      ),

      "2 months": normalizePrice(
        row.price_2_months
      ),

      "3 months": normalizePrice(
        row.price_3_months
      ),

      "6 months": normalizePrice(
        row.price_6_months
      ),

      "1 year": normalizePrice(
        row.price_1_year
      ),
    },
  };
}

/* =========================================================
   PRODUCT → SUPABASE ROW
========================================================= */

function subscriptionToRow(
  product: Subscription,
  position = 0
) {
  const prices = product.pricesByDuration ?? {
    "1 month": "0 DT",
    "2 months": "0 DT",
    "3 months": "0 DT",
    "6 months": "0 DT",
    "1 year": "0 DT",
  };

  return {
    name: product.name || "",

    old_price:
      priceToDatabase(
        product.oldPrice
      ),

    duration:
      product.duration || "1 month",

    category:
      product.category || "",

    description:
      product.description || "",

    features:
      Array.isArray(product.features)
        ? product.features
        : [],

    active:
      product.active ?? true,

    price_1_month:
      priceToDatabase(
        prices["1 month"]
      ),

    price_2_months:
      priceToDatabase(
        prices["2 months"]
      ),

    price_3_months:
      priceToDatabase(
        prices["3 months"]
      ),

    price_6_months:
      priceToDatabase(
        prices["6 months"]
      ),

    price_1_year:
      priceToDatabase(
        prices["1 year"]
      ),

    position,
  };
}

/* =========================================================
   GET PRODUCTS
========================================================= */

export async function getProducts(): Promise<
  Record<string, Subscription>
> {
  const {
    data,
    error,
  } = await supabase
    .from("products")
    .select("*")
    .order("position", {
      ascending: true,
    });

  if (error) {
    console.error(
      "Erreur récupération produits:",
      error
    );

    throw error;
  }

  const products: Record<
    string,
    Subscription
  > = {};

  for (const row of (
    data || []
  ) as ProductRow[]) {
    if (!row?.id) {
      continue;
    }

    products[row.id] =
      rowToSubscription(row);
  }

  return products;
}

/* =========================================================
   SUBSCRIBE TO PRODUCTS
   Compatible avec Subscriptions.tsx
========================================================= */

export function subscribeToProducts(
  callback: (
    products: Record<string, Subscription>
  ) => void
): () => void {
  let active = true;

  const loadProducts = async () => {
    try {
      const products =
        await getProducts();

      if (active) {
        callback(products);
      }
    } catch (error) {
      console.error(
        "Erreur abonnement produits:",
        error
      );
    }
  };

  void loadProducts();

  return () => {
    active = false;
  };
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
  } = await supabase
    .from("products")
    .insert(row)
    .select("id")
    .single();

  if (error) {
    console.error(
      "Erreur création produit:",
      error
    );

    throw error;
  }

  if (!data?.id) {
    throw new Error(
      "Le produit a été créé mais aucun ID n'a été retourné."
    );
  }

  return data.id;
}

/* =========================================================
   UPDATE PRODUCT
========================================================= */

export async function updateProduct(
  id: string,
  product: Subscription
): Promise<void> {
  if (!id) {
    throw new Error(
      "ID du produit manquant."
    );
  }

  const row =
    subscriptionToRow(
      product
    );

  const {
    error,
  } = await supabase
    .from("products")
    .update(row)
    .eq("id", id);

  if (error) {
    console.error(
      "Erreur modification produit:",
      error
    );

    throw error;
  }
}

/* =========================================================
   DELETE PRODUCT
========================================================= */

export async function deleteProduct(
  id: string
): Promise<void> {
  if (!id) {
    throw new Error(
      "ID du produit manquant."
    );
  }

  const {
    error,
  } = await supabase
    .from("products")
    .delete()
    .eq("id", id);

  if (error) {
    console.error(
      "Erreur suppression produit:",
      error
    );

    throw error;
  }
}

/* =========================================================
   ACTIVE / INACTIVE
========================================================= */

export async function setProductActive(
  id: string,
  active: boolean
): Promise<void> {
  if (!id) {
    throw new Error(
      "ID du produit manquant."
    );
  }

  const {
    error,
  } = await supabase
    .from("products")
    .update({
      active,
    })
    .eq("id", id);

  if (error) {
    console.error(
      "Erreur changement statut produit:",
      error
    );

    throw error;
  }
}

/* =========================================================
   PENDING CART
========================================================= */

export type PendingCart = {
  slug: string;
  quantity: number;
  duration?: DurationKey;
};

export function savePendingCart(
  cart: PendingCart[]
): void {
  if (
    typeof window === "undefined"
  ) {
    return;
  }

  try {
    localStorage.setItem(
      "pendingCart",
      JSON.stringify(cart)
    );
  } catch (error) {
    console.error(
      "Erreur sauvegarde panier:",
      error
    );
  }
}

export function getPendingCart(): PendingCart[] {
  if (
    typeof window === "undefined"
  ) {
    return [];
  }

  try {
    const saved =
      localStorage.getItem(
        "pendingCart"
      );

    if (!saved) {
      return [];
    }

    const parsed =
      JSON.parse(saved);

    if (!Array.isArray(parsed)) {
      return [];
    }

    return parsed.filter(
      (item): item is PendingCart =>
        item &&
        typeof item.slug === "string" &&
        typeof item.quantity === "number"
    );
  } catch (error) {
    console.error(
      "Erreur lecture panier:",
      error
    );

    return [];
  }
}
