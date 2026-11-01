
import { supabase } from "./supabase";

export type WheelPrize = {
  id: string;
  name: string;
  label: string;
  percentage: number;
  productName?: string;
  color: string;
  active: boolean;
};

type WheelPrizeRow = {
  id: string;
  name: string;
  label: string;
  percentage: number;
  product_name: string | null;
  color: string;
  active: boolean;
  position: number;
};

export const WHEEL_SEGMENTS = 8;

export const DEFAULT_WHEEL_PRIZES: WheelPrize[] = [
  {
    id: "discount-5",
    name: "Réduction 5 %",
    label: "5 % de réduction",
    percentage: 25,
    productName: "",
    color: "#7c3aed",
    active: true,
  },
  {
    id: "discount-1dt",
    name: "Réduction 1 DT",
    label: "1 DT de réduction",
    percentage: 20,
    productName: "",
    color: "#db2777",
    active: true,
  },
  {
    id: "discount-10",
    name: "Réduction 10 %",
    label: "10 % de réduction",
    percentage: 10,
    productName: "",
    color: "#2563eb",
    active: true,
  },
  {
    id: "discount-2dt",
    name: "Réduction 2 DT",
    label: "2 DT de réduction",
    percentage: 5,
    productName: "",
    color: "#0891b2",
    active: true,
  },
  {
    id: "surprise-gift",
    name: "Cadeau surprise",
    label: "Cadeau surprise 🎁",
    percentage: 5,
    productName: "",
    color: "#16a34a",
    active: true,
  },
  {
    id: "next-order-code",
    name: "Code promo prochain achat",
    label: "Code promo pour votre prochaine commande",
    percentage: 5,
    productName: "",
    color: "#ca8a04",
    active: true,
  },
  {
    id: "next-order-5",
    name: "5 % sur prochain achat",
    label: "5 % sur votre prochaine commande",
    percentage: 5,
    productName: "",
    color: "#ea580c",
    active: true,
  },
  {
    id: "try-again",
    name: "Pas de chance",
    label: "Pas de chance, réessayez demain !",
    percentage: 25,
    productName: "",
    color: "#64748b",
    active: true,
  },
];

function toWheelPrize(row: WheelPrizeRow): WheelPrize {
  return {
    id: row.id,
    name: row.name,
    label: row.label,
    percentage: Number(row.percentage),
    productName: row.product_name || "",
    color: row.color,
    active: row.active,
  };
}

function toDatabaseRow(
  prize: WheelPrize,
  position: number
): WheelPrizeRow {
  return {
    id: prize.id,
    name: prize.name,
    label: prize.label,
    percentage: Number(prize.percentage),
    product_name: prize.productName || null,
    color: prize.color,
    active: prize.active,
    position,
  };
}

export async function getWheelPrizes(): Promise<WheelPrize[]> {
  const { data, error } = await supabase
    .from("wheel_prizes")
    .select("*")
    .order("position", { ascending: true });

  if (error) {
    throw error;
  }

  if (!data || data.length === 0) {
    return DEFAULT_WHEEL_PRIZES;
  }

  return (data as WheelPrizeRow[]).map(toWheelPrize);
}

export async function getActiveWheelPrizes(): Promise<WheelPrize[]> {
  const prizes = await getWheelPrizes();
  return prizes.filter((prize) => prize.active).slice(0, WHEEL_SEGMENTS);
}

export async function saveWheelPrizes(
  prizes: WheelPrize[]
): Promise<void> {
  const rows = prizes.map((prize, index) =>
    toDatabaseRow(prize, index)
  );

  const { error } = await supabase
    .from("wheel_prizes")
    .upsert(rows, { onConflict: "id" });

  if (error) {
    throw error;
  }

  window.dispatchEvent(new Event("wheel-config-updated"));
}

export async function addWheelPrize(
  prize: Omit<WheelPrize, "id">
): Promise<WheelPrize> {
  const currentPrizes = await getWheelPrizes();

  const newPrize: WheelPrize = {
    ...prize,
    id: crypto.randomUUID(),
  };

  const row = toDatabaseRow(newPrize, currentPrizes.length);

  const { error } = await supabase
    .from("wheel_prizes")
    .insert(row);

  if (error) {
    throw error;
  }

  window.dispatchEvent(new Event("wheel-config-updated"));

  return newPrize;
}

export async function updateWheelPrize(
  id: string,
  updates: Partial<WheelPrize>
): Promise<void> {
  const databaseUpdates: Record<string, unknown> = {};

  if (updates.name !== undefined) {
    databaseUpdates.name = updates.name;
  }

  if (updates.label !== undefined) {
    databaseUpdates.label = updates.label;
  }

  if (updates.percentage !== undefined) {
    databaseUpdates.percentage = Number(updates.percentage);
  }

  if (updates.productName !== undefined) {
    databaseUpdates.product_name = updates.productName || null;
  }

  if (updates.color !== undefined) {
    databaseUpdates.color = updates.color;
  }

  if (updates.active !== undefined) {
    databaseUpdates.active = updates.active;
  }

  const { error } = await supabase
    .from("wheel_prizes")
    .update(databaseUpdates)
    .eq("id", id);

  if (error) {
    throw error;
  }

  window.dispatchEvent(new Event("wheel-config-updated"));
}

export async function deleteWheelPrize(id: string): Promise<void> {
  const { error } = await supabase
    .from("wheel_prizes")
    .delete()
    .eq("id", id);

  if (error) {
    throw error;
  }

  window.dispatchEvent(new Event("wheel-config-updated"));
}

export function subscribeToWheelPrizes(
  callback: () => void
): () => void {
  const channel = supabase
    .channel("wheel-prizes-changes")
    .on(
      "postgres_changes",
      {
        event: "*",
        schema: "public",
        table: "wheel_prizes",
      },
      () => callback()
    )
    .subscribe();

  return () => {
    void supabase.removeChannel(channel);
  };
}
