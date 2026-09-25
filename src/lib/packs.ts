import { supabase } from "@/lib/supabase";

/* =========================================================
   TYPES
========================================================= */

export type PackProduct = {
  id?: string;

  /**
   * ID du produit existant dans la table products.
   *
   * null = produit exclusif au Pack
   */
  productId: string | null;

  name: string;

  price: number;

  duration: string;

  description: string;

  position: number;
};

export type Pack = {
  id: string;

  name: string;

  price: number;

  duration: string;

  description: string;

  image: string;

  active: boolean;

  position: number;

  products: PackProduct[];

  createdAt?: string;

  updatedAt?: string;
};


/* =========================================================
   DATABASE TYPES
========================================================= */

type PackRow = {
  id: string;

  name: string | null;

  price: number | string | null;

  duration: string | null;

  description: string | null;

  image: string | null;

  active: boolean | null;

  position: number | null;

  created_at?: string | null;

  updated_at?: string | null;
};

type PackProductRow = {
  id: string;

  pack_id: string;

  product_id: string | null;

  name: string | null;

  price: number | string | null;

  duration: string | null;

  description: string | null;

  position: number | null;

  created_at?: string | null;
};


/* =========================================================
   HELPERS
========================================================= */

function normalizeNumber(
  value: unknown
): number {
  const parsed = Number(
    String(value ?? "0")
      .replace(",", ".")
      .replace(/[^\d.-]/g, "")
  );

  return Number.isFinite(parsed)
    ? parsed
    : 0;
}


function normalizeText(
  value: unknown
): string {
  return String(value ?? "").trim();
}


function normalizeBoolean(
  value: unknown
): boolean {
  return value !== false;
}


function normalizePosition(
  value: unknown
): number {
  const parsed = Number(value);

  return Number.isFinite(parsed)
    ? parsed
    : 0;
}


/* =========================================================
   CONVERT DATABASE → PACK
========================================================= */

function rowToPack(
  row: PackRow,
  products: PackProductRow[]
): Pack {
  return {
    id: row.id,

    name: normalizeText(
      row.name
    ),

    price: normalizeNumber(
      row.price
    ),

    duration:
      normalizeText(
        row.duration
      ) || "30 jours",

    description:
      normalizeText(
        row.description
      ),

    image:
      normalizeText(
        row.image
      ),

    active:
      normalizeBoolean(
        row.active
      ),

    position:
      normalizePosition(
        row.position
      ),

    products:
      products
        .sort(
          (a, b) =>
            normalizePosition(
              a.position
            ) -
            normalizePosition(
              b.position
            )
        )
        .map(
          (product) => ({
            id: product.id,

            productId:
              product.product_id,

            name:
              normalizeText(
                product.name
              ),

            price:
              normalizeNumber(
                product.price
              ),

            duration:
              normalizeText(
                product.duration
              ),

            description:
              normalizeText(
                product.description
              ),

            position:
              normalizePosition(
                product.position
              ),
          })
        ),

    createdAt:
      row.created_at ??
      undefined,

    updatedAt:
      row.updated_at ??
      undefined,
  };
}


/* =========================================================
   GET PACKS
========================================================= */

export async function getPacks(): Promise<
  Record<string, Pack>
> {
  const {
    data: packRows,
    error: packsError,
  } = await supabase
    .from("packs")
    .select("*")
    .order("position", {
      ascending: true,
    })
    .order("created_at", {
      ascending: true,
    });

  if (packsError) {
    console.error(
      "Erreur chargement Packs :",
      packsError
    );

    throw new Error(
      packsError.message
    );
  }

  if (!packRows) {
    return {};
  }

  const {
    data: productRows,
    error:
      productsError,
  } = await supabase
    .from("pack_products")
    .select("*")
    .order("position", {
      ascending: true,
    });

  if (productsError) {
    console.error(
      "Erreur chargement produits Packs :",
      productsError
    );

    throw new Error(
      productsError.message
    );
  }

  const allProducts =
    (productRows ??
      []) as PackProductRow[];

  const result: Record<
    string,
    Pack
  > = {};

  for (const row of packRows as PackRow[]) {
    const packProducts =
      allProducts.filter(
        (product) =>
          product.pack_id ===
          row.id
      );

    result[row.id] =
      rowToPack(
        row,
        packProducts
      );
  }

  return result;
}


/* =========================================================
   GET ACTIVE PACKS
========================================================= */

export async function getActivePacks(): Promise<
  Record<string, Pack>
> {
  const packs =
    await getPacks();

  const activePacks: Record<
    string,
    Pack
  > = {};

  Object.entries(
    packs
  ).forEach(
    ([id, pack]) => {
      if (pack.active) {
        activePacks[id] =
          pack;
      }
    }
  );

  return activePacks;
}


/* =========================================================
   CREATE PACK
========================================================= */

export async function createPack(
  pack: Omit<
    Pack,
    | "id"
    | "products"
    | "createdAt"
    | "updatedAt"
  > & {
    products?: PackProduct[];
  }
): Promise<Pack> {
  const {
    data,
    error,
  } = await supabase
    .from("packs")
    .insert({
      name: pack.name,

      price:
        normalizeNumber(
          pack.price
        ),

      duration:
        pack.duration ||
        "30 jours",

      description:
        pack.description ||
        "",

      image:
        pack.image ||
        "",

      active:
        pack.active !== false,

      position:
        normalizePosition(
          pack.position
        ),
    })
    .select("*")
    .single();

  if (error || !data) {
    console.error(
      "Erreur création Pack :",
      error
    );

    throw new Error(
      error?.message ??
        "Impossible de créer le Pack."
    );
  }

  const packRow =
    data as PackRow;

  const products =
    pack.products ?? [];

  if (
    products.length > 0
  ) {
    const productRows =
      products.map(
        (
          product,
          index
        ) => ({
          pack_id:
            packRow.id,

          product_id:
            product.productId,

          name:
            product.name,

          price:
            normalizeNumber(
              product.price
            ),

          duration:
            product.duration ||
            "",

          description:
            product.description ||
            "",

          position:
            product.position ??
            index,
        })
      );

    const {
      error:
        productsError,
    } = await supabase
      .from("pack_products")
      .insert(
        productRows
      );

    if (productsError) {
      console.error(
        "Erreur création produits du Pack :",
        productsError
      );

      /*
       * On supprime le Pack si ses
       * produits n'ont pas pu être créés.
       */
      await supabase
        .from("packs")
        .delete()
        .eq(
          "id",
          packRow.id
        );

      throw new Error(
        productsError.message
      );
    }
  }

  const allPacks =
    await getPacks();

  return (
    allPacks[
      packRow.id
    ] ?? {
      ...pack,
      id: packRow.id,
      products,
    }
  );
}


/* =========================================================
   UPDATE PACK
========================================================= */

export async function updatePack(
  id: string,
  pack: Partial<
    Omit<
      Pack,
      | "id"
      | "products"
      | "createdAt"
      | "updatedAt"
    >
  > & {
    products?: PackProduct[];
  }
): Promise<Pack> {
  const updateData: Record<
    string,
    unknown
  > = {};

  if (
    pack.name !==
    undefined
  ) {
    updateData.name =
      pack.name;
  }

  if (
    pack.price !==
    undefined
  ) {
    updateData.price =
      normalizeNumber(
        pack.price
      );
  }

  if (
    pack.duration !==
    undefined
  ) {
    updateData.duration =
      pack.duration;
  }

  if (
    pack.description !==
    undefined
  ) {
    updateData.description =
      pack.description;
  }

  if (
    pack.image !==
    undefined
  ) {
    updateData.image =
      pack.image;
  }

  if (
    pack.active !==
    undefined
  ) {
    updateData.active =
      pack.active;
  }

  if (
    pack.position !==
    undefined
  ) {
    updateData.position =
      normalizePosition(
        pack.position
      );
  }

  updateData.updated_at =
    new Date().toISOString();

  const {
    error,
  } = await supabase
    .from("packs")
    .update(
      updateData
    )
    .eq(
      "id",
      id
    );

  if (error) {
    console.error(
      "Erreur modification Pack :",
      error
    );

    throw new Error(
      error.message
    );
  }

  /*
   * Si products est fourni,
   * on remplace complètement
   * les produits du Pack.
   */
  if (
    pack.products !==
    undefined
  ) {
    const {
      error:
        deleteError,
    } = await supabase
      .from("pack_products")
      .delete()
      .eq(
        "pack_id",
        id
      );

    if (deleteError) {
      console.error(
        "Erreur suppression anciens produits du Pack :",
        deleteError
      );

      throw new Error(
        deleteError.message
      );
    }

    if (
      pack.products.length >
      0
    ) {
      const productRows =
        pack.products.map(
          (
            product,
            index
          ) => ({
            pack_id:
              id,

            product_id:
              product.productId,

            name:
              product.name,

            price:
              normalizeNumber(
                product.price
              ),

            duration:
              product.duration ||
              "",

            description:
              product.description ||
              "",

            position:
              product.position ??
              index,
          })
        );

      const {
        error:
          insertError,
      } = await supabase
        .from("pack_products")
        .insert(
          productRows
        );

      if (insertError) {
        console.error(
          "Erreur ajout produits du Pack :",
          insertError
        );

        throw new Error(
          insertError.message
        );
      }
    }
  }

  const allPacks =
    await getPacks();

  const updatedPack =
    allPacks[id];

  if (!updatedPack) {
    throw new Error(
      "Pack introuvable après modification."
    );
  }

  return updatedPack;
}


/* =========================================================
   DELETE PACK
========================================================= */

export async function deletePack(
  id: string
): Promise<void> {
  const {
    error,
  } = await supabase
    .from("packs")
    .delete()
    .eq(
      "id",
      id
    );

  if (error) {
    console.error(
      "Erreur suppression Pack :",
      error
    );

    throw new Error(
      error.message
    );
  }
}


/* =========================================================
   SET PACK ACTIVE
========================================================= */

export async function setPackActive(
  id: string,
  active: boolean
): Promise<void> {
  const {
    error,
  } = await supabase
    .from("packs")
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
      "Erreur changement visibilité Pack :",
      error
    );

    throw new Error(
      error.message
    );
  }
}
