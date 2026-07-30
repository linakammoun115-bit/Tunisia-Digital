export type WheelPrize = {
  id: string;
  name: string;
  label: string;
  percentage: number;
  productName?: string;
  color: string;
  active: boolean;
};

const WHEEL_PRIZES_KEY =
  "wheel-prizes-v3";

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

function isBrowser() {
  return typeof window !== "undefined";
}

function createId() {
  if (
    typeof crypto !== "undefined" &&
    typeof crypto.randomUUID === "function"
  ) {
    return crypto.randomUUID();
  }

  return (
    Date.now().toString() +
    "-" +
    Math.random()
      .toString(36)
      .slice(2)
  );
}

function normalizePrize(
  prize: Partial<WheelPrize>,
  index: number
): WheelPrize {
  const fallback =
    DEFAULT_WHEEL_PRIZES[index] ??
    DEFAULT_WHEEL_PRIZES[0];

  const percentage =
    Number(prize.percentage);

  return {
    id:
      typeof prize.id === "string" &&
      prize.id.trim()
        ? prize.id
        : createId(),

    name:
      typeof prize.name === "string" &&
      prize.name.trim()
        ? prize.name.trim()
        : fallback.name,

    label:
      typeof prize.label === "string" &&
      prize.label.trim()
        ? prize.label.trim()
        : fallback.label,

    percentage:
      Number.isFinite(percentage)
        ? Math.min(
            100,
            Math.max(0, percentage)
          )
        : fallback.percentage,

    productName:
      typeof prize.productName ===
      "string"
        ? prize.productName.trim()
        : fallback.productName,

    color:
      typeof prize.color === "string" &&
      prize.color.trim()
        ? prize.color
        : fallback.color,

    active:
      typeof prize.active === "boolean"
        ? prize.active
        : true,
  };
}

export function isWheelConfigurationValid(
  prizes: WheelPrize[]
) {
  const activePrizes =
    prizes.filter(
      (prize) => prize.active
    );

  const totalPercentage =
    activePrizes.reduce(
      (total, prize) =>
        total +
        Number(prize.percentage || 0),
      0
    );

  return (
    activePrizes.length ===
      WHEEL_SEGMENTS &&
    Math.abs(
      totalPercentage - 100
    ) < 0.001
  );
}

function cloneDefaultPrizes() {
  return DEFAULT_WHEEL_PRIZES.map(
    (prize) => ({
      ...prize,
    })
  );
}

export function saveWheelPrizes(
  prizes: WheelPrize[]
) {
  if (!isBrowser()) {
    return;
  }

  const normalizedPrizes =
    prizes.map(
      (prize, index) =>
        normalizePrize(
          prize,
          index
        )
    );

  localStorage.setItem(
    WHEEL_PRIZES_KEY,
    JSON.stringify(
      normalizedPrizes
    )
  );

  window.dispatchEvent(
    new Event(
      "wheel-config-updated"
    )
  );
}

export function getWheelPrizes():
  WheelPrize[] {
  if (!isBrowser()) {
    return cloneDefaultPrizes();
  }

  try {
    const stored =
      localStorage.getItem(
        WHEEL_PRIZES_KEY
      );

    if (!stored) {
      const defaults =
        cloneDefaultPrizes();

      saveWheelPrizes(defaults);

      return defaults;
    }

    const parsed =
      JSON.parse(stored);

    if (!Array.isArray(parsed)) {
      const defaults =
        cloneDefaultPrizes();

      saveWheelPrizes(defaults);

      return defaults;
    }

    const normalized =
      parsed.map(
        (
          prize,
          index
        ) =>
          normalizePrize(
            prize,
            index
          )
      );

    /*
      Si un ancien appareil contient
      4 récompenses ou un total différent
      de 100 %, on remplace automatiquement
      par la configuration correcte.
    */
    if (
      !isWheelConfigurationValid(
        normalized
      )
    ) {
      const defaults =
        cloneDefaultPrizes();

      saveWheelPrizes(defaults);

      return defaults;
    }

    return normalized;
  } catch {
    const defaults =
      cloneDefaultPrizes();

    saveWheelPrizes(defaults);

    return defaults;
  }
}

export function getActiveWheelPrizes() {
  return getWheelPrizes()
    .filter(
      (prize) =>
        prize.active
    )
    .slice(
      0,
      WHEEL_SEGMENTS
    );
}

export function getWheelPrizeById(
  id: string
) {
  return (
    getWheelPrizes().find(
      (prize) =>
        prize.id === id
    ) ?? null
  );
}

export function addWheelPrize(
  input: Omit<
    WheelPrize,
    "id"
  >
) {
  const prizes =
    getWheelPrizes();

  const newPrize: WheelPrize = {
    ...input,
    id: createId(),
    name: input.name.trim(),
    label: input.label.trim(),
    productName:
      input.productName?.trim() ||
      "",
    percentage: Math.min(
      100,
      Math.max(
        0,
        Number(
          input.percentage
        ) || 0
      )
    ),
    active:
      input.active !== false,
  };

  const updatedPrizes = [
    ...prizes,
    newPrize,
  ];

  saveWheelPrizes(
    updatedPrizes
  );

  return newPrize;
}

export function updateWheelPrize(
  id: string,
  updates: Partial<
    Omit<
      WheelPrize,
      "id"
    >
  >
) {
  const prizes =
    getWheelPrizes();

  const updatedPrizes =
    prizes.map(
      (
        prize,
        index
      ) => {
        if (
          prize.id !== id
        ) {
          return prize;
        }

        return normalizePrize(
          {
            ...prize,
            ...updates,
            id: prize.id,
          },
          index
        );
      }
    );

  saveWheelPrizes(
    updatedPrizes
  );

  return (
    updatedPrizes.find(
      (prize) =>
        prize.id === id
    ) ?? null
  );
}

export function deleteWheelPrize(
  id: string
) {
  const prizes =
    getWheelPrizes();

  const updatedPrizes =
    prizes.filter(
      (prize) =>
        prize.id !== id
    );

  saveWheelPrizes(
    updatedPrizes
  );

  return updatedPrizes;
}

export function replaceWheelPrizes(
  prizes: WheelPrize[]
) {
  saveWheelPrizes(prizes);

  return getWheelPrizes();
}

export function resetWheelPrizes() {
  const defaults =
    cloneDefaultPrizes();

  saveWheelPrizes(defaults);

  return defaults;
}

export function clearWheelPrizesStorage() {
  if (!isBrowser()) {
    return;
  }

  localStorage.removeItem(
    WHEEL_PRIZES_KEY
  );

  window.dispatchEvent(
    new Event(
      "wheel-config-updated"
    )
  );
}
