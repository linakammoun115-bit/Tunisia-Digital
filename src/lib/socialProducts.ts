import { supabase } from "@/lib/supabase";

/* =========================================================
   TYPES
========================================================= */

export type SocialProductType =
  | "followers"
  | "likes"
  | "views";

export type SocialProduct = {
  name: string;
  type: SocialProductType;
  quantity: number;
  price: number;
  oldPrice: number;
  description: string;
  active: boolean;
  position: number;
};

/* =========================================================
   DATABASE ROW
========================================================= */

type SocialProductRow = {
  id: string;
  name: string | null;
  type: string | null;
  quantity: number | null;
  price: number | string | null;
  old_price: number | string | null;
  description: string | null;
  active: boolean | null;
  position: number | null;
  created_at?: string | null;
  updated_at?: string | null;
};

/* =========================================================
   HELPERS
========================================================= */

function normalizeType(
  type: unknown
): SocialProductType {
  if (
    type === "likes" ||
    type === "views"
  ) {
    return type;
  }

  return "followers";
}

function normalizeNumber(
  value:
    | string
    | number
    | null
    | undefined
): number {
  if (
    value === null ||
    value === undefined ||
    value === ""
  ) {
    return 0;
  }

  const cleaned =
    String(value)
      .replace(/DT/gi, "")
      .replace(",", ".")
      .trim();

  const number =
    Number(cleaned);

  return Number.isNaN(number)
    ? 0
    : number;
}

/* =========================================================
   DATABASE ROW → PRODUCT
========================================================= */

function rowToSocialProduct(
  row: SocialProductRow
): SocialProduct {
  return {
    name:
      row.name || "",

    type:
      normalizeType(
        row.type
      ),

    quantity:
      normalizeNumber(
        row.quantity
      ),

    price:
      normalizeNumber(
        row.price
      ),

    oldPrice:
      normalizeNumber(
        row.old_price
      ),

    description:
      row.description || "",

    active:
      row.active ?? true,

    position:
      row.position ?? 0,
  };
}

/* =========================================================
   PRODUCT → DATABASE ROW
========================================================= */

function socialProductToRow(
  product: SocialProduct,
  position = 0
) {
  return {
    name:
      product.name.trim(),

    type:
      product.type,

    quantity:
      Number(product.quantity) || 0,

    price:
      Number(product.price) || 0,

    old_price:
      Number(product.oldPrice) || 0,

    description:
      product.description?.trim() || "",

    active:
      product.active,

    position,

    updated_at:
      new Date().toISOString(),
  };
}

/* =========================================================
   GET ALL SOCIAL PRODUCTS
========================================================= */

export async function getSocialProducts(): Promise<
  Record<string, SocialProduct>
> {
  const {
    data,
    error,
  } =
    await supabase
      .from("social_products")
      .select("*")
      .order("position", {
        ascending: true,
      });

  if (error) {
    console.error(
      "Erreur chargement produits sociaux:",
      error
    );

    throw new Error(
      error.message ||
        "Impossible de charger les produits sociaux."
    );
  }

  const rows =
    (data ?? []) as SocialProductRow[];

  return Object.fromEntries(
    rows.map((row) => [
      row.id,
      rowToSocialProduct(row),
    ])
  );
}

/* =========================================================
   GET ACTIVE SOCIAL PRODUCTS
========================================================= */

export async function getActiveSocialProducts(): Promise<
  Record<string, SocialProduct>
> {
  const {
    data,
    error,
  } =
    await supabase
      .from("social_products")
      .select("*")
      .eq("active", true)
      .order("position", {
        ascending: true,
      });

  if (error) {
    console.error(
      "Erreur chargement produits sociaux actifs:",
      error
    );

    throw new Error(
      error.message ||
        "Impossible de charger les produits sociaux actifs."
    );
  }

  const rows =
    (data ?? []) as SocialProductRow[];

  return Object.fromEntries(
    rows.map((row) => [
      row.id,
      rowToSocialProduct(row),
    ])
  );
}

/* =========================================================
   GET PRODUCTS BY TYPE
========================================================= */

export async function getSocialProductsByType(
  type: SocialProductType
): Promise<
  Record<string, SocialProduct>
> {
  const {
    data,
    error,
  } =
    await supabase
      .from("social_products")
      .select("*")
      .eq("type", type)
      .eq("active", true)
      .order("position", {
        ascending: true,
      });

  if (error) {
    console.error(
      `Erreur chargement produits ${type}:`,
      error
    );

    throw new Error(
      error.message ||
        `Impossible de charger les produits ${type}.`
    );
  }

  const rows =
    (data ?? []) as SocialProductRow[];

  return Object.fromEntries(
    rows.map((row) => [
      row.id,
      rowToSocialProduct(row),
    ])
  );
}

/* =========================================================
   GET ONE PRODUCT
========================================================= */

export async function getSocialProduct(
  id: string
): Promise<SocialProduct | null> {
  const {
    data,
    error,
  } =
    await supabase
      .from("social_products")
      .select("*")
      .eq("id", id)
      .maybeSingle();

  if (error) {
    console.error(
      "Erreur chargement produit social:",
      error
    );

    throw new Error(
      error.message
    );
  }

  if (!data) {
    return null;
  }

  return rowToSocialProduct(
    data as SocialProductRow
  );
}

/* =========================================================
   CREATE PRODUCT
========================================================= */

export async function createSocialProduct(
  product: SocialProduct,
  position = 0
): Promise<string> {
  /*
   * Génération de l'ID côté application.
   * La table Supabase possède également
   * un DEFAULT gen_random_uuid().
   */
  const id =
    crypto.randomUUID();

  const row = {
    id,

    ...socialProductToRow(
      product,
      position
    ),
  };

  const {
    data,
    error,
  } =
    await supabase
      .from("social_products")
      .insert(row)
      .select("id")
      .single();

  if (error) {
    console.error(
      "Erreur création produit social:",
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

export async function updateSocialProduct(
  id: string,
  product: SocialProduct,
  position?: number
): Promise<void> {
  const row =
    socialProductToRow(
      product,
      position ?? product.position ?? 0
    );

  const {
    error,
  } =
    await supabase
      .from("social_products")
      .update(row)
      .eq("id", id);

  if (error) {
    console.error(
      "Erreur modification produit social:",
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

export async function deleteSocialProduct(
  id: string
): Promise<void> {
  const {
    error,
  } =
    await supabase
      .from("social_products")
      .delete()
      .eq("id", id);

  if (error) {
    console.error(
      "Erreur suppression produit social:",
      error
    );

    throw new Error(
      error.message
    );
  }
}

/* =========================================================
   ACTIVATE / DEACTIVATE
========================================================= */

export async function setSocialProductActive(
  id: string,
  active: boolean
): Promise<void> {
  const {
    error,
  } =
    await supabase
      .from("social_products")
      .update({
        active,

        updated_at:
          new Date().toISOString(),
      })
      .eq("id", id);

  if (error) {
    console.error(
      "Erreur changement statut produit social:",
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

export async function updateSocialProductPosition(
  id: string,
  position: number
): Promise<void> {
  const {
    error,
  } =
    await supabase
      .from("social_products")
      .update({
        position,

        updated_at:
          new Date().toISOString(),
      })
      .eq("id", id);

  if (error) {
    console.error(
      "Erreur changement position produit social:",
      error
    );

    throw new Error(
      error.message
    );
  }
}

/* =========================================================
   REALTIME
========================================================= */

export function subscribeToSocialProducts(
  onChange: () => void
) {
  const channel =
    supabase
      .channel(
        "social-products-realtime"
      )
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "social_products",
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
