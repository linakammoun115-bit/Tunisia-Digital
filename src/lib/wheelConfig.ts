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

const WHEEL_SEGMENTS = 8;

export const DEFAULT_WHEEL_PRIZES: WheelPrize[] = [
  {
    id: "gemini-pro",
    name: "Gemini Pro",
    label: "25 % de réduction",
    percentage: 25,
    productName: "Gemini Pro",
    color: "#7c3aed",
    active: true,
  },
  {
    id: "canva-pro",
    name: "Canva Pro",
    label: "20 % de réduction",
    percentage: 20,
    productName: "Canva Pro",
    color: "#db2777",
    active: true,
  },
  {
    id: "spotify-premium",
    name: "Spotify Premium",
    label: "15 % de réduction",
    percentage: 15,
    productName: "Spotify Premium",
    color: "#2563eb",
    active: true,
  },
  {
    id: "youtube-premium",
    name: "YouTube Premium",
    label: "10 % de réduction",
    percentage: 10,
    productName: "YouTube Premium",
    color: "#0891b2",
    active: true,
  },
  {
    id: "chatgpt-plus",
    name: "ChatGPT Plus",
    label: "10 % de réduction",
    percentage: 10,
    productName: "ChatGPT Plus",
    color: "#16a34a",
    active: true,
  },
  {
    id: "adobe-creative-cloud",
    name: "Adobe Creative Cloud",
    label: "8 % de réduction",
    percentage: 8,
    productName: "Adobe Creative Cloud",
    color: "#ca8a04",
    active: true,
  },
  {
    id: "google-one",
    name: "Google One",
    label: "7 % de réduction",
    percentage: 7,
    productName: "Google One",
    color: "#ea580c",
    active: true,
  },
  {
    id: "offre-generale",
    name: "Offre générale",
    label: "5 % de réduction",
    percentage: 5,
    productName: "",
    color: "#dc2626",
    active: true,
  },
];

function createId() {
  if (
    typeof crypto !== "undefined" &&
    typeof crypto.randomUUID === "function"
  ) {
    return crypto.randomUUID();
  }

return Date.now().toString() + "-" + Math.random().toString(36).slice(2);
}

function cloneDefaultPrizes(): WheelPrize[] {
  return DEFAULT_WHEEL_PRIZES.map((prize) => ({
    ...prize,
  }));
}

function normalizePrize(
  prize: Partial<WheelPrize>,
  index: number
): WheelPrize {
  const fallback =
    DEFAULT_WHEEL_PRIZES[index] ?? DEFAULT_WHEEL_PRIZES[0];

  const percentage = Number(prize.percentage);

  return {
    id:
      typeof prize.id === "string" && prize.id.trim()
        ? prize.id.trim()
        : createId(),

    name:
      typeof prize.name === "string" && prize.name.trim()
        ? prize.name.trim()
        : fallback.name,

    label:
      typeof prize.label === "string" && prize.label.trim()
        ? prize.label.trim()
        : fallback.label,

    percentage: Number.isFinite(percentage)
      ? Math.min(100, Math.max(0, percentage))
      : fallback.percentage,

    productName:
      typeof prize.productName === "string"
        ? prize.productName.trim()
        : fallback.productName,

    color:
      typeof prize.color === "string" && prize.color.trim()
        ? prize.color.trim()
        : fallback.color,

    active:
      typeof prize.active === "boolean"
        ? prize.active
        : true,
  };
}

function rowToPrize(row: WheelPrizeRow): WheelPrize {
  return {
    id: row.id,
    name: row.name,
    label: row.label,
    percentage: Number(row.percentage),
    productName: row.product_name ?? "",
    color: row.color,
    active: row.active,
  };
}

function prizeToRow(
  prize: WheelPrize,
  position: number
): WheelPrizeRow {
  return {
    id: prize.id,
    name: prize.name,
    label: prize.label,
    percentage: prize.percentage,
    product_name: prize.productName || null,
    color: prize.color,
    active: prize.active,
    position,
  };
}

function dispatchWheelUpdate() {
  if (typeof window === "undefined") {
    return;
  }

  window.dispatchEvent(
    new Event("wheel-config-updated")
  );
}

export function isWheelConfigurationValid(
  prizes: WheelPrize[]
) {
  const activePrizes = prizes.filter(
    (prize) => prize.active
  );

  const totalPercentage = activePrizes.reduce(
    (total, prize) =>
      total + Number(prize.percentage || 0),
    0
  );

  return (
    activePrizes.length === WHEEL_SEGMENTS &&
    Math.abs(totalPercentage - 100) < 0.001
  );
}

export async function getWheelPrizes(): Promise<WheelPrize[]> {

  const { data, error } = await supabase
    .from("wheel_prizes")
    .select(
      "id, name, label, percentage, product_name, color, active, position"
    )
    .order("position", {
      ascending: true,
    });

  if (error) {
    console.error(
      "Erreur lecture wheel_prizes:",
      error
    );

    throw new Error(
      "Impossible de charger les récompenses."
    );
  }

  if (!data || data.length === 0) {
    const defaults = cloneDefaultPrizes();

    await saveWheelPrizes(defaults);

    return defaults;
  }

  return (data as WheelPrizeRow[]).map(rowToPrize);
}

export async function getActiveWheelPrizes(): Promise<
  WheelPrize[]
{

  const prizes = await getWheelPrizes();

  return prizes
    .filter((prize) => prize.active)
    .slice(0, WHEEL_SEGMENTS);
}

export async function getWheelPrizeById(
  id: string
): Promise<WheelPrize | null> {
  const { data, error } = await supabase
    .from("wheel_prizes")
    .select(
      "id, name, label, percentage, product_name, color, active, position"
    )
    .eq("id", id)
    .maybeSingle();

  if (error) {
    console.error(
      "Erreur lecture récompense:",
      error
    );

    throw new Error(
      "Impossible de charger la récompense."
    );
  }

  return data
    ? rowToPrize(data as WheelPrizeRow)
    : null;
}

export async function saveWheelPrizes(
  prizes: WheelPrize[]
): Promise<WheelPrize[]> {
  const normalizedPrizes = prizes.map(
    (prize, index) =>
      normalizePrize(prize, index)
  );

  const rows = normalizedPrizes.map(
    (prize, position) =>
      prizeToRow(prize, position)
  );

  const { error: upsertError } = await supabase
    .from("wheel_prizes")
    .upsert(rows, {
      onConflict: "id",
    });

  if (upsertError) {
    console.error(
      "Erreur sauvegarde wheel_prizes:",
      upsertError
    );

    throw new Error(
      "Impossible de sauvegarder les récompenses."
    );
  }

  const currentIds = normalizedPrizes.map(
    (prize) => prize.id
  );

  const { data: existingRows, error: selectError } =
    await supabase
      .from("wheel_prizes")
      .select("id");

  if (selectError) {
    console.error(
      "Erreur vérification wheel_prizes:",
      selectError
    );

    throw new Error(
      "Les récompenses ont été enregistrées, mais la vérification a échoué."
    );
  }

  const removedIds = (existingRows ?? [])
    .map((row) => String(row.id))
    .filter((id) => !currentIds.includes(id));

  if (removedIds.length > 0) {
    const { error: deleteError } = await supabase
      .from("wheel_prizes")
      .delete()
      .in("id", removedIds);

    if (deleteError) {
      console.error(
        "Erreur suppression anciennes récompenses:",
        deleteError
      );

      throw new Error(
        "Impossible de supprimer les anciennes récompenses."
      );
    }
  }

  dispatchWheelUpdate();

  return normalizedPrizes;
}

export async function addWheelPrize(
  input: Omit<WheelPrize, "id">
): Promise<WheelPrize> {
  const prizes = await getWheelPrizes();

  const newPrize = normalizePrize(
    {
      ...input,
      id: createId(),
    },
    prizes.length
  );

  await saveWheelPrizes([
    ...prizes,
    newPrize,
  ]);

  return newPrize;
}

export async function updateWheelPrize(
  id: string,
  updates: Partial<Omit<WheelPrize, "id">>
): Promise<WheelPrize | null> {
  const prizes = await getWheelPrizes();

  let updatedPrize: WheelPrize | null = null;

  const updatedPrizes = prizes.map(
    (prize, index) => {
      if (prize.id !== id) {
        return prize;
      }

      updatedPrize = normalizePrize(
        {
          ...prize,
          ...updates,
          id: prize.id,
        },
        index
      );

      return updatedPrize;
    }
  );

  if (!updatedPrize) {
    return null;
  }

  await saveWheelPrizes(updatedPrizes);

  return updatedPrize;
}

export async function deleteWheelPrize(
  id: string
): Promise<WheelPrize[]> {
  const prizes = await getWheelPrizes();

  const updatedPrizes = prizes.filter(
    (prize) => prize.id !== id
  );

  await saveWheelPrizes(updatedPrizes);

  return updatedPrizes;
}

export async function replaceWheelPrizes(
  prizes: WheelPrize[]
): Promise<WheelPrize[]> {
  return saveWheelPrizes(prizes);
}

export async function resetWheelPrizes(): Promise<
  WheelPrize[]
{

  const defaults = cloneDefaultPrizes();

  await saveWheelPrizes(defaults);

  return defaults;
}

export function subscribeToWheelPrizes(
  callback: () => void
) {
  const channel = supabase
    .channel("wheel-prizes-changes")
    .on(
      "postgres_changes",
      {
        event: "*",
        schema: "public",
        table: "wheel_prizes",
      },
      () => {
        callback();
        dispatchWheelUpdate();
      }
    )
    .subscribe((status, error) => {
      if (error) {
        console.error(
          "Erreur abonnement wheel_prizes:",
          error
        );
      }

      if (status === "CHANNEL_ERROR") {
        console.error(
          "Le canal Realtime wheel_prizes a échoué."
        );
      }
    });

  return () => {
    void supabase.removeChannel(channel);
  };
}
