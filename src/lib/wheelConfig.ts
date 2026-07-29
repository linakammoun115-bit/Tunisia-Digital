export type WheelPrize = {
  id: string;
  name: string;
  label: string;
  percentage: number;
  productName?: string;
  color: string;
  active: boolean;
};

const WHEEL_PRIZES_KEY = "wheel-prizes";

export const defaultWheelPrizes: WheelPrize[] = [
  {
    id: "gemini-pro",
    name: "Gemini Pro",
    label: "Gemini Pro -25%",
    percentage: 25,
    productName: "Gemini Pro",
    color: "#7c3aed",
    active: true,
  },
  {
    id: "canva-pro",
    name: "Canva Pro",
    label: "Canva Pro -50%",
    percentage: 50,
    productName: "Canva Pro",
    color: "#16a34a",
    active: true,
  },
  {
    id: "spotify",
    name: "Spotify Premium",
    label: "Spotify -10%",
    percentage: 10,
    productName: "Spotify Premium",
    color: "#2563eb",
    active: true,
  },
  {
    id: "general",
    name: "Réduction Générale",
    label: "5% sur votre achat",
    percentage: 5,
    color: "#111827",
    active: true,
  },
];

export function getWheelPrizes(): WheelPrize[] {
  try {
    const stored = localStorage.getItem(WHEEL_PRIZES_KEY);

    if (!stored) {
      localStorage.setItem(
        WHEEL_PRIZES_KEY,
        JSON.stringify(defaultWheelPrizes)
      );

      return defaultWheelPrizes;
    }

    return JSON.parse(stored);
  } catch {
    return defaultWheelPrizes;
  }
}

export function getActiveWheelPrizes() {
  return getWheelPrizes().filter(
    (item) => item.active
  );
}

export function saveWheelPrizes(
  prizes: WheelPrize[]
) {
  localStorage.setItem(
    WHEEL_PRIZES_KEY,
    JSON.stringify(prizes)
  );

  window.dispatchEvent(
    new Event("wheel-config-updated")
  );
}

export function addWheelPrize(
  prize: Omit<WheelPrize, "id">
) {
  const prizes = getWheelPrizes();

  prizes.push({
    ...prize,
    id: crypto.randomUUID(),
  });

  saveWheelPrizes(prizes);
}

export function updateWheelPrize(
  id: string,
  updates: Partial<WheelPrize>
) {
  const updated = getWheelPrizes().map((item) =>
    item.id === id
      ? {
          ...item,
          ...updates,
        }
      : item
  );

  saveWheelPrizes(updated);
}

export function deleteWheelPrize(id: string) {
  saveWheelPrizes(
    getWheelPrizes().filter(
      (item) => item.id !== id
    )
  );
}
