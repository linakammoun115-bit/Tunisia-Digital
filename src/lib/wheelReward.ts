export type WheelReward = {
  id: string;
  label: string;
  percentage: number;
  productName?: string;
  used: boolean;
  createdAt: string;
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

function isBrowser() {
  return typeof window !== "undefined";
}

export function getCurrentMonthKey() {
  const now = new Date();

  const year = now.getFullYear();

  const month = String(
    now.getMonth() + 1
  ).padStart(2, "0");

  return `${year}-${month}`;
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
    ) as WheelReward;

    if (
      !parsed ||
      typeof parsed !== "object" ||
      typeof parsed.id !== "string" ||
      typeof parsed.label !== "string" ||
      typeof parsed.percentage !==
        "number"
    ) {
      return null;
    }

    return parsed;
  } catch {
    return null;
  }
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
    new Event("wheel-reward-updated")
  );
}

export function createWheelReward(
  input: CreateWheelRewardInput
): WheelReward {
  const percentage = Math.min(
    100,
    Math.max(0, input.percentage)
  );

  const reward: WheelReward = {
    id: input.id,
    label: input.label,
    percentage,
    productName:
      input.productName?.trim() ||
      undefined,
    used: false,
    createdAt:
      new Date().toISOString(),
  };

  saveWheelReward(reward);

  return reward;
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
    new Event("wheel-spin-updated")
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
  if (!reward || reward.used) {
    return false;
  }

  if (
    reward.percentage <= 0 ||
    reward.percentage > 100
  ) {
    return false;
  }

  /*
    Pas de productName =
    réduction valable sur tous les produits.
  */
  if (!reward.productName) {
    return true;
  }

  const rewardProduct =
    normalizeProductName(
      reward.productName
    );

  const selectedProduct =
    normalizeProductName(productName);

  return (
    rewardProduct === selectedProduct ||
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
    !Number.isFinite(originalPrice) ||
    originalPrice < 0
  ) {
    return 0;
  }

  const safePercentage = Math.min(
    100,
    Math.max(0, percentage)
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
  const reward = getWheelReward();

  if (!reward || reward.used) {
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

  const consumedReward: WheelReward = {
    ...reward,
    used: true,
    usedAt: new Date().toISOString(),
  };

  saveWheelReward(consumedReward);

  return true;
}

export function removeWheelReward() {
  if (!isBrowser()) {
    return;
  }

  localStorage.removeItem(
    WHEEL_REWARD_KEY
  );

  window.dispatchEvent(
    new Event("wheel-reward-updated")
  );
}

/*
  Fonctions utiles pour tester depuis
  l'administration sur le même navigateur.
*/

export function resetMonthlyWheelSpin() {
  if (!isBrowser()) {
    return;
  }

  localStorage.removeItem(
    WHEEL_SPIN_MONTH_KEY
  );

  window.dispatchEvent(
    new Event("wheel-spin-updated")
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
    new Event("wheel-reward-updated")
  );

  window.dispatchEvent(
    new Event("wheel-spin-updated")
  );
}
