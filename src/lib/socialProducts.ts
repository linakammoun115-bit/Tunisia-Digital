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
  quantity: number | string | null;
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
  if (type === "likes") {
    return "likes";
  }

  if (type === "views") {
    return "views";
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

  const cleaned = String(value)
    .replace(/DT/gi, "")
    .replace(",", ".")
    .trim();

  const parsed = Number(cleaned);

  if (!Number.isFinite(parsed)) {
    return 0;
  }

  return parsed;
}

function normalizePosition(
  value:
    | number
    | string
    | null
    | undefined
): number {
  const parsed = Number(value);

  if (!Number.isFinite(parsed)) {
    return 0;
  }

  return parsed;
}

/* =========================================================
   DATABASE ROW → PRODUCT
========================================================= */

function rowToSocialProduct(
  row: SocialProductRow
): SocialProduct {
  return {
    name: row.name?.trim() || "",

    type: normalizeType(
      row.type
    ),

    quantity: normalizeNumber(
      row.quantity
    ),

    price: normalizeNumber(
      row.price
    ),

    oldPrice: normalizeNumber(
      row.old_price
    ),

    description:
      row.description?.trim() || "",

    active:
      row.active ?? true,

    position:
      normalizePosition(
        row.position
      ),
  };
}

/* =========================================================
   PRODUCT → DATABASE ROW
========================================================= */

function socialProductToRow(
  product: SocialProduct,
  position?: number
) {
  return {
    name:
      String(product.name || "").trim(),

    type:
      normalizeType(
        product.type
      ),

    quantity:
      normalizeNumber(
        product.quantity
      ),

    price:
      normalizeNumber(
        product.price
      ),

    old_price:
      normalizeNumber(
        product.oldPrice
      ),

    description:
      String(
        product.description || ""
      ).trim(),

    active:
      product.active ?? true,

    position:
      normalizePosition(
        position ??
          product.position
      ),

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
  if (!id) {
    return null;
  }

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
      error.message ||
        "Impossible de charger le produit social."
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
  const cleanProduct: SocialProduct = {
    ...product,

    name:
      String(product.name || "").trim(),

    type:
      normalizeType(
        product.type
      ),

    quantity:
      normalizeNumber(
        product.quantity
      ),

    price:
      normalizeNumber(
        product.price
      ),

    oldPrice:
      normalizeNumber(
        product.oldPrice
      ),

    description:
      String(
        product.description || ""
      ).trim(),

    active:
      product.active ?? true,

    position:
      normalizePosition(
        position
      ),
  };

  if (!cleanProduct.name) {
    throw new Error(
      "Le nom du produit est obligatoire."
    );
  }

  if (cleanProduct.quantity <= 0) {
    throw new Error(
      "La quantité doit être supérieure à 0."
    );
  }

  if (cleanProduct.price < 0) {
    throw new Error(
      "Le prix ne peut pas être négatif."
    );
  }

  const row = {
    ...socialProductToRow(
      cleanProduct,
      position
    ),
  };

  /*
   * On laisse Supabase générer l'ID
   * avec le DEFAULT gen_random_uuid().
   */
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
      error.message ||
        "Impossible de créer le produit social."
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
  if (!id) {
    throw new Error(
      "ID du produit social manquant."
    );
  }

  const cleanProduct: SocialProduct = {
    ...product,

    name:
      String(product.name || "").trim(),

    type:
      normalizeType(
        product.type
      ),

    quantity:
      normalizeNumber(
        product.quantity
      ),

    price:
      normalizeNumber(
        product.price
      ),

    oldPrice:
      normalizeNumber(
        product.oldPrice
      ),

    description:
      String(
        product.description || ""
      ).trim(),

    active:
      product.active ?? true,

    position:
      normalizePosition(
        position ??
          product.position
      ),
  };

  if (!cleanProduct.name) {
    throw new Error(
      "Le nom du produit est obligatoire."
    );
  }

  if (cleanProduct.quantity <= 0) {
    throw new Error(
      "La quantité doit être supérieure à 0."
    );
  }

  if (cleanProduct.price < 0) {
    throw new Error(
      "Le prix ne peut pas être négatif."
    );
  }

  const row =
    socialProductToRow(
      cleanProduct,
      position ??
        cleanProduct.position
    );

  const {
    data,
    error,
  } =
    await supabase
      .from("social_products")
      .update(row)
      .eq("id", id)
      .select("id")
      .maybeSingle();

  if (error) {
    console.error(
      "Erreur modification produit social:",
      error
    );

    throw new Error(
      error.message ||
        "Impossible de modifier le produit social."
    );
  }

  /*
   * Si aucune ligne n'a été trouvée,
   * l'ID envoyé n'existe probablement plus.
   */
  if (!data) {
    throw new Error(
      "Le produit social n'existe plus ou n'a pas pu être modifié."
    );
  }
}

/* =========================================================
   DELETE PRODUCT
========================================================= */

export async function deleteSocialProduct(
  id: string
): Promise<void> {
  if (!id) {
    throw new Error(
      "ID du produit social manquant."
    );
  }

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
      error.message ||
        "Impossible de supprimer le produit social."
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
  if (!id) {
    throw new Error(
      "ID du produit social manquant."
    );
  }

  const {
    error,
  } =
    await supabase
      .from("social_products")
      .update({
        active: Boolean(active),

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
      error.message ||
        "Impossible de modifier le statut du produit social."
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
  if (!id) {
    throw new Error(
      "ID du produit social manquant."
    );
  }

  const cleanPosition =
    normalizePosition(
      position
    );

  const {
    error,
  } =
    await supabase
      .from("social_products")
      .update({
        position:
          cleanPosition,

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
      error.message ||
        "Impossible de modifier la position du produit social."
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
