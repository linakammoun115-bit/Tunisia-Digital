import { supabase } from "@/lib/supabase";

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

function normalizeDuration(
  duration: unknown
): DurationKey {
  if (
    duration === "6 months" ||
    duration === "1 year"
  ) {
    return duration;
  }

  return "1 month";
}

function normalizeFeatures(
  features: unknown
): string[] {
  if (Array.isArray(features)) {
    return features.filter(
      (feature): feature is string =>
        typeof feature === "string"
    );
  }

  return [];
}

function normalizePrice(
  price: string | number | null | undefined
): string {
  if (
    price === null ||
    price === undefined ||
    price === ""
  ) {
    return "0 DT";
  }

  const value = String(price);
  if (value.includes("DT")){
  return value}
    return '${value} DT';
}

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

    features: normalizeFeatures(
      row.features
    ),

    active:
      row.active ?? true,

    pricesByDuration: {
      "1 month": normalizePrice(
        row.price_1_month
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

function subscriptionToRow(
  product: Subscription,
  position = 0
) {
  return {
    name: product.name,

    old_price:
      product.oldPrice || "0 DT",

    duration:
      product.duration,

    category:
      product.category || "",

    description:
      product.description || "",

    features:
      product.features || [],

    active:
      product.active,

    price_1_month:
      product.pricesByDuration[
        "1 month"
      ] || "0 DT",

    price_6_months:
      product.pricesByDuration[
        "6 months"
      ] || "0 DT",

    price_1_year:
      product.pricesByDuration[
        "1 year"
      ] || "0 DT",

    position,

    updated_at:
      new Date().toISOString(),
  };
}

/* =========================
   GET PRODUCTS
========================= */

export async function getProducts(): Promise<
  Record<string, Subscription>
>{

  const { data, error } =
    await supabase
      .from("products")
      .select("*")
      .order("position", {
        ascending: true,
      });

  if (error) {
    console.error(
      "Erreur chargement produits:",
      error
    );

    throw new Error(
      error.message ||
        "Impossible de charger les produits."
    );
  }

  const rows =
    (data ?? []) as ProductRow[];

  return Object.fromEntries(
    rows.map((row) => [
      row.id,
      rowToSubscription(row),
    ])
  );
}

/* =========================
   GET ACTIVE PRODUCTS
========================= */

export async function getActiveProducts(): Promise<
  Record<string, Subscription>
{

  const { data, error } =
    await supabase
      .from("products")
      .select("*")
      .eq("active", true)
      .order("position", {
        ascending: true,
      });

  if (error) {
    console.error(
      "Erreur chargement produits actifs:",
      error
    );

    throw new Error(
      error.message ||
        "Impossible de charger les produits actifs."
    );
  }

  const rows =
    (data ?? []) as ProductRow[];

  return Object.fromEntries(
    rows.map((row) => [
      row.id,
      rowToSubscription(row),
    ])
  );
}

/* =========================
   GET ONE PRODUCT
========================= */

export async function getProduct(
  id: string
): Promise<Subscription | null> {
  const { data, error } =
    await supabase
      .from("products")
      .select("*")
      .eq("id", id)
      .maybeSingle();

  if (error) {
    console.error(
      "Erreur chargement produit:",
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

/* =========================
   CREATE PRODUCT
========================= */

export async function createProduct(
  product: Subscription,
  position = 0
): Promise<string> {
  const row =
    subscriptionToRow(
      product,
      position
    );

  const { data, error } =
    await supabase
      .from("products")
      .insert(row)
      .select("id")
      .single();

  if (error) {
    console.error(
      "Erreur ajout produit:",
      error
    );

    throw new Error(
      error.message
    );
  }

  return data.id;
}

/* =========================
   UPDATE PRODUCT
========================= */

export async function updateProduct(
  id: string,
  product: Subscription,
  position?: number
): Promise<void> {
  const row =
    subscriptionToRow(
      product,
      position ?? 0
    );

  const { error } =
    await supabase
      .from("products")
      .update(row)
      .eq("id", id);

  if (error) {
    console.error(
      "Erreur modification produit:",
      error
    );

    throw new Error(
      error.message
    );
  }
}

/* =========================
   DELETE PRODUCT
========================= */

export async function deleteProduct(
  id: string
): Promise<void> {
  const { error } =
    await supabase
      .from("products")
      .delete()
      .eq("id", id);

  if (error) {
    console.error(
      "Erreur suppression produit:",
      error
    );

    throw new Error(
      error.message
    );
  }
}

/* =========================
   ACTIVATE / DEACTIVATE
========================= */

export async function setProductActive(
  id: string,
  active: boolean
): Promise<void> {
  const { error } =
    await supabase
      .from("products")
      .update({
        active,
        updated_at:
          new Date().toISOString(),
      })
      .eq("id", id);

  if (error) {
    console.error(
      "Erreur changement statut produit:",
      error
    );

    throw new Error(
      error.message
    );
  }
}

/* =========================
   UPDATE PRODUCT POSITION
========================= */

export async function updateProductPosition(
  id: string,
  position: number
): Promise<void> {
  const { error } =
    await supabase
      .from("products")
      .update({
        position,
        updated_at:
          new Date().toISOString(),
      })
      .eq("id", id);

  if (error) {
    console.error(
      "Erreur changement position:",
      error
    );

    throw new Error(
      error.message
    );
  }
}

/* =========================
   REALTIME PRODUCTS
========================= */

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
          schema: "public",
          table: "products",
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

/* =========================
   PENDING ORDERS
========================= */

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

    return JSON.parse(
      saved
    ) as PendingOrder[];
  } catch (error) {
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
    JSON.stringify(orders)
  );
}

export function savePendingCart(
  cart: any[]
): void {
  if (
    !cart ||
    cart.length === 0
  ) {
    return;
  }

  const total =
    cart.reduce(
      (
        sum: number,
        item: any
      ) =>
        sum +
        Number(item.price || 0) *
          Number(
            item.quantity || 1
          ),
      0
    );

  const pendingOrder: PendingOrder = {
    id: "pending-cart",

    clientName:
      "Client non confirmé",

    phone:
      "Non renseigné",

    status:
      "En attente",

    items: cart,

    total,

    createdAt:
      new Date().toLocaleString(),
  };

  savePendingOrders([
    pendingOrder,
  ]);
}
