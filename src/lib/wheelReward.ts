export type WheelReward = {
  id: string;
  label: string;
  percentage: number;
  productName?: string;
  used: boolean;

  // Date de création de la récompense.
  createdAt: string;

  // La promotion expire une heure après sa création.
  expiresAt: number;

  // Date d'utilisation de la récompense.
  usedAt?: string;
};

export type CreateWheelRewardInput = {
  id: string;
  label: string;
  percentage: number;
  productName?: string;
};

const WHEEL_REWARD_KEY =
  "wheel-reward";

const WHEEL_SPIN_MONTH_KEY =
  "wheel-spin-month";

const REWARD_DURATION_MS =
  60 * 60 * 1000;

function isBrowser() {
  return typeof window !==
    "undefined";
}

export function getCurrentMonthKey() {
  const now = new Date();

  const year =
    now.getFullYear();

  const month = String(
    now.getMonth() + 1
  ).padStart(2, "0");

  return year + "-" + month;
}

export function saveWheelReward(
  reward: WheelReward
) {
  if (!isBrowser()) {
    return;
  }

  localStorage.setItem(
    WHEEL_REWARD_KEY,
    JSON.stringify(reward)
  );

  window.dispatchEvent(
    new Event(
      "wheel-reward-updated"
    )
  );
}

export function removeWheelReward() {
  if (!isBrowser()) {
    return;
  }

  localStorage.removeItem(
    WHEEL_REWARD_KEY
  );

  window.dispatchEvent(
    new Event(
      "wheel-reward-updated"
    )
  );
}

export function getWheelReward():
  | WheelReward
  | null {
  if (!isBrowser()) {
    return null;
  }

  try {
    const storedReward =
      localStorage.getItem(
        WHEEL_REWARD_KEY
      );

    if (!storedReward) {
      return null;
    }

    const parsed = JSON.parse(
      storedReward
    ) as Partial<WheelReward>;

    if (
      !parsed ||
      typeof parsed !==
        "object" ||
      typeof parsed.id !==
        "string" ||
      typeof parsed.label !==
        "string" ||
      typeof parsed.percentage !==
        "number"
    ) {
      removeWheelReward();
      return null;
    }

    /*
      Compatibilité avec les anciennes
      récompenses enregistrées avant
      l'ajout de expiresAt.
    */
    let expiresAt =
      Number(parsed.expiresAt);

    if (
      !Number.isFinite(expiresAt)
    ) {
      const createdAtTime =
        typeof parsed.createdAt ===
        "string"
          ? new Date(
              parsed.createdAt
            ).getTime()
          : Date.now();

      expiresAt =
        createdAtTime +
        REWARD_DURATION_MS;
    }

    const normalizedReward: WheelReward =
      {
        id: parsed.id,
        label: parsed.label,
        percentage:
          parsed.percentage,
        productName:
          typeof parsed.productName ===
          "string"
            ? parsed.productName
            : undefined,
        used:
          parsed.used === true,
        createdAt:
          typeof parsed.createdAt ===
          "string"
            ? parsed.createdAt
            : new Date().toISOString(),
        expiresAt,
        usedAt:
          typeof parsed.usedAt ===
          "string"
            ? parsed.usedAt
            : undefined,
      };

    /*
      Si la récompense n'est pas encore
      utilisée mais que l'heure est passée,
      elle est supprimée automatiquement.
    */
    if (
      !normalizedReward.used &&
      Date.now() >=
        normalizedReward.expiresAt
    ) {
      removeWheelReward();
      return null;
    }

    return normalizedReward;
  } catch {
    removeWheelReward();
    return null;
  }
}

export function createWheelReward(
  input: CreateWheelRewardInput
): WheelReward {
  const percentage = Math.min(
    100,
    Math.max(
      0,
      Number(input.percentage) ||
        0
    )
  );

  const now = Date.now();

  const reward: WheelReward = {
    id: input.id,
    label: input.label,
    percentage,
    productName:
      input.productName?.trim() ||
      undefined,
    used: false,
    createdAt:
      new Date(now).toISOString(),
    expiresAt:
      now + REWARD_DURATION_MS,
  };

  saveWheelReward(reward);

  return reward;
}

export function isWheelRewardExpired(
  reward: WheelReward
) {
  return (
    Date.now() >=
    reward.expiresAt
  );
}

export function hasSpunThisMonth() {
  if (!isBrowser()) {
    return false;
  }

  const storedMonth =
    localStorage.getItem(
      WHEEL_SPIN_MONTH_KEY
    );

  return (
    storedMonth ===
    getCurrentMonthKey()
  );
}

export function markSpinForCurrentMonth() {
  if (!isBrowser()) {
    return;
  }

  localStorage.setItem(
    WHEEL_SPIN_MONTH_KEY,
    getCurrentMonthKey()
  );

  window.dispatchEvent(
    new Event(
      "wheel-spin-updated"
    )
  );
}

function normalizeProductName(
  value: string
) {
  return value
    .trim()
    .toLowerCase()
    .replace(/\s+/g, " ");
}

export function canUseRewardOnProduct(
  reward: WheelReward | null,
  productName: string
) {
  if (
    !reward ||
    reward.used ||
    isWheelRewardExpired(reward)
  ) {
    return false;
  }

  if (
    reward.percentage <= 0 ||
    reward.percentage > 100
  ) {
    return false;
  }

  /*
    Si aucun produit n'est précisé,
    la récompense est valable sur
    tous les produits.
  */
  if (!reward.productName) {
    return true;
  }

  const rewardProduct =
    normalizeProductName(
      reward.productName
    );

  const selectedProduct =
    normalizeProductName(
      productName
    );

  return (
    rewardProduct ===
      selectedProduct ||
    selectedProduct.includes(
      rewardProduct
    ) ||
    rewardProduct.includes(
      selectedProduct
    )
  );
}

export function calculateRewardPrice(
  originalPrice: number,
  percentage: number
) {
  if (
    !Number.isFinite(
      originalPrice
    ) ||
    originalPrice < 0
  ) {
    return 0;
  }

  const safePercentage =
    Math.min(
      100,
      Math.max(
        0,
        Number(percentage) || 0
      )
    );

  const discountedPrice =
    originalPrice *
    (1 - safePercentage / 100);

  return Number(
    discountedPrice.toFixed(2)
  );
}

export function consumeWheelReward(
  productName?: string
) {
  const reward =
    getWheelReward();

  if (
    !reward ||
    reward.used ||
    isWheelRewardExpired(reward)
  ) {
    return false;
  }

  if (
    productName &&
    !canUseRewardOnProduct(
      reward,
      productName
    )
  ) {
    return false;
  }

  const consumedReward: WheelReward =
    {
      ...reward,
      used: true,
      usedAt:
        new Date().toISOString(),
    };

  saveWheelReward(
    consumedReward
  );

  return true;
}

/*
  Alias utile si une autre page importe
  encore useWheelReward.
*/
export function useWheelReward() {
  const reward =
    getWheelReward();

  if (
    !reward ||
    reward.used ||
    isWheelRewardExpired(reward)
  ) {
    return null;
  }

  const consumedReward: WheelReward =
    {
      ...reward,
      used: true,
      usedAt:
        new Date().toISOString(),
    };

  saveWheelReward(
    consumedReward
  );

  return consumedReward;
}

/*
  Fonctions utiles pour les tests
  depuis l'administration.
*/

export function resetMonthlyWheelSpin() {
  if (!isBrowser()) {
    return;
  }

  localStorage.removeItem(
    WHEEL_SPIN_MONTH_KEY
  );

  window.dispatchEvent(
    new Event(
      "wheel-spin-updated"
    )
  );
}

export function resetWheelRewardSystem() {
  if (!isBrowser()) {
    return;
  }

  localStorage.removeItem(
    WHEEL_REWARD_KEY
  );

  localStorage.removeItem(
    WHEEL_SPIN_MONTH_KEY
  );

  window.dispatchEvent(
    new Event(
      "wheel-reward-updated"
    )
  );

  window.dispatchEvent(
    new Event(
      "wheel-spin-updated"
    )
  );
}
