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
  switch (value) {
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
    try {
      const parsed = JSON.parse(value);

      if (Array.isArray(parsed)) {
        return parsed
          .map((item) => String(item).trim())
          .filter(Boolean);
      }
    } catch {
      return value
        .split("\n")
        .map((item) => item.trim())
        .filter(Boolean);
    }
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
    .replace(",", ".")
    .trim();

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
    .replace(",", ".")
    .trim();

  const number = Number(raw);

  return Number.isFinite(number)
    ? number
    : 0;
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
  return {
    name: product.name,

    old_price:
      priceToDatabase(
        product.oldPrice
      ),

    duration:
      product.duration,

    category:
      product.category,

    description:
      product.description,

    features:
      product.features,

    active:
      product.active,

    price_1_month:
      priceToDatabase(
        product.pricesByDuration[
          "1 month"
        ]
      ),

    price_2_months:
      priceToDatabase(
        product.pricesByDuration[
          "2 months"
        ]
      ),

    price_3_months:
      priceToDatabase(
        product.pricesByDuration[
          "3 months"
        ]
      ),

    price_6_months:
      priceToDatabase(
        product.pricesByDuration[
          "6 months"
        ]
      ),

    price_1_year:
      priceToDatabase(
        product.pricesByDuration[
          "1 year"
        ]
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
    throw error;
  }

  const products: Record<
    string,
    Subscription
  > = {};

  for (const row of (
    data || []
  ) as ProductRow[]) {
    products[row.id] =
      rowToSubscription(row);
  }

  return products;
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
    throw error;
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
    .eq("id", id);

  if (error) {
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
  const {
    error,
  } = await supabase
    .from("products")
    .update({
      active,
    })
    .eq("id", id);

  if (error) {
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
  localStorage.setItem(
    "pendingCart",
    JSON.stringify(cart)
  );
}

export function getPendingCart(): PendingCart[] {
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

    return Array.isArray(parsed)
      ? parsed
      : [];
  } catch {
    return [];
  }
}
