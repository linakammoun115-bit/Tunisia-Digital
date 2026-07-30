import { supabase } from "@/lib/supabase";

export type DurationKey =
  | "1 month"
  | "6 months"
  | "1 year";

export type DurationPrice = Record<
  DurationKey,
  string
;


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
  name: string;
  old_price: string;
  duration: string;
  category: string;
  description: string;
  features: unknown;
  active: boolean;
  price_1_month: string;
  price_6_months: string;
  price_1_year: string;
  position: number;
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
  if (!Array.isArray(features)) {
    return [];
  }

  return features.filter(
    (feature): feature is string =>
      typeof feature === "string"
  );
}

function rowToSubscription(
  row: ProductRow
): Subscription {
  return {
    name: row.name,
    oldPrice: row.old_price || "0 DT",
    duration: normalizeDuration(
      row.duration
    ),
    category: row.category || "",
    description:
      row.description || "",
    features: normalizeFeatures(
      row.features
    ),
    active: row.active,

    pricesByDuration: {
      "1 month":
        row.price_1_month || "0 DT",
      "6 months":
        row.price_6_months || "0 DT",
      "1 year":
        row.price_1_year || "0 DT",
    },
  };
}

function subscriptionToRow(
  slug: string,
  product: Subscription,
  position = 0
) {
  return {
    id: slug,
    name: product.name,
    old_price:
      product.oldPrice || "0 DT",
    duration: product.duration,
    category: product.category || "",
    description:
      product.description || "",
    features: product.features || [],
    active: product.active,
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

export async function getProducts(): Promise<
  Record<string, Subscription>
{

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

export async function createProduct(
  slug: string,
  product: Subscription,
  position = 0
): Promise<void> {
  const { error } = await supabase
    .from("products")
    .insert(
      subscriptionToRow(
        slug,
        product,
        position
      )
    );

  if (error) {
    console.error(
      "Erreur ajout produit:",
      error
    );

    throw new Error(error.message);
  }
}

export async function updateProduct(
  slug: string,
  product: Subscription
): Promise<void> {
  const row = subscriptionToRow(
    slug,
    product
  );

  const { id, ...changes } = row;

  const { error } = await supabase
    .from("products")
    .update(changes)
    .eq("id", slug);

  if (error) {
    console.error(
      "Erreur modification produit:",
      error
    );

    throw new Error(error.message);
  }
}

export async function deleteProduct(
  slug: string
): Promise<void> {
  const { error } = await supabase
    .from("products")
    .delete()
    .eq("id", slug);

  if (error) {
    console.error(
      "Erreur suppression produit:",
      error
    );

    throw new Error(error.message);
  }
}

export function subscribeToProducts(
  onChange: () => void
) {
  const channel = supabase
    .channel("products-changes")
    .on(
      "postgres_changes",
      {
        event: "*",
        schema: "public",
        table: "products",
      },
      () => onChange()
    )
    .subscribe();

  return () => {
    void supabase.removeChannel(
      channel
    );
  };
}

/* COMMANDES EN ATTENTE */

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
  const saved =
    localStorage.getItem(
      "pendingOrders"
    );

  return saved
    ? JSON.parse(saved)
    : [];
}

export function savePendingOrders(
  orders: PendingOrder[]
) {
  localStorage.setItem(
    "pendingOrders",
    JSON.stringify(orders)
  );
}

export function savePendingCart(
  cart: any[]
) {
  if (!cart || cart.length === 0) {
    return;
  }

  const total = cart.reduce(
    (
      sum: number,
      item: any
    ) =>
      sum +
      item.price * item.quantity,
    0
  );

  const pendingOrder: PendingOrder =
    {
      id: "pending-cart",
      clientName:
        "Client non confirmé",
      phone: "Non renseigné",
      status: "En attente",
      items: cart,
      total,
      createdAt:
        new Date().toLocaleString(),
    };

  savePendingOrders([
    pendingOrder,
  ]);
}
