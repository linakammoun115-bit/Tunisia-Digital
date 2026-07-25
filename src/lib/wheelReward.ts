```ts
export type WheelReward = {
  id: string;
  label: string;
  percentage: number;
  productName?: string;
  used: boolean;
  createdAt: string;
};

function getCurrentUserId(): string {
  try {
    const savedCustomer = localStorage.getItem("customer");

    if (savedCustomer) {
      const customer = JSON.parse(savedCustomer);

      if (customer?.phone) {
        return String(customer.phone).replace(/\s+/g, "");
      }
    }
  } catch {
    // Ignore les données invalides
  }

  return "guest";
}

function getRewardKey(): string {
  return `wheelReward_${getCurrentUserId()}`;
}

function getSpinMonthKey(): string {
  return `wheelLastSpinMonth_${getCurrentUserId()}`;
}

export function getCurrentMonth(): string {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(
    now.getMonth() + 1
  ).padStart(2, "0");

  return `${year}-${month}`;
}

export function getCurrentMonthKey(): string {
  return getCurrentMonth();
}

export function getWheelReward(): WheelReward | null {
  try {
    const savedReward = localStorage.getItem(
      getRewardKey()
    );

    if (!savedReward) {
      return null;
    }

    const reward = JSON.parse(
      savedReward
    ) as WheelReward;

    if (
      !reward ||
      typeof reward !== "object" ||
      typeof reward.id !== "string" ||
      typeof reward.label !== "string" ||
      typeof reward.percentage !== "number"
    ) {
      return null;
    }

    return reward;
  } catch {
    return null;
  }
}

export function saveWheelReward(
  reward: WheelReward
): void {
  localStorage.setItem(
    getRewardKey(),
    JSON.stringify(reward)
  );

  window.dispatchEvent(
    new Event("wheel-reward-updated")
  );
}

export function setWheelReward(
  reward: Omit<
    WheelReward,
    "used" | "createdAt"
  >
): WheelReward {
  const completeReward: WheelReward = {
    ...reward,
    used: false,
    createdAt: new Date().toISOString(),
  };

  saveWheelReward(completeReward);

  return completeReward;
}

/*
  Cette fonction est utilisée par wheel.tsx.
  Elle crée et sauvegarde une nouvelle récompense.
*/
export function createWheelReward(
  reward: Omit<
    WheelReward,
    "used" | "createdAt"
  >
): WheelReward {
  return setWheelReward(reward);
}

export function canUseRewardOnProduct(
  reward: WheelReward | null,
  productName: string
): boolean {
  if (!reward || reward.used) {
    return false;
  }

  if (!reward.productName) {
    return true;
  }

  const rewardProduct = reward.productName
    .toLowerCase()
    .trim();

  const currentProduct = productName
    .toLowerCase()
    .trim();

  return (
    currentProduct.includes(rewardProduct) ||
    rewardProduct.includes(currentProduct)
  );
}

export function calculateRewardPrice(
  originalPrice: number,
  percentage: number
): number {
  const price = Number(originalPrice);
  const discount = Number(percentage);

  if (
    !Number.isFinite(price) ||
    !Number.isFinite(discount)
  ) {
    return price;
  }

  const safeDiscount = Math.min(
    100,
    Math.max(0, discount)
  );

  const finalPrice =
    price - price * (safeDiscount / 100);

  return Number(finalPrice.toFixed(2));
}

export function consumeWheelReward(
  productName?: string
): void {
  const reward = getWheelReward();

  if (!reward || reward.used) {
    return;
  }

  if (
    productName &&
    !canUseRewardOnProduct(
      reward,
      productName
    )
  ) {
    return;
  }

  const usedReward: WheelReward = {
    ...reward,
    used: true,
  };

  localStorage.setItem(
    getRewardKey(),
    JSON.stringify(usedReward)
  );

  window.dispatchEvent(
    new Event("wheel-reward-updated")
  );
}

export function removeUsedWheelReward(): void {
  const reward = getWheelReward();

  if (!reward || reward.used) {
    localStorage.removeItem(
      getRewardKey()
    );

    window.dispatchEvent(
      new Event("wheel-reward-updated")
    );
  }
}

export function removeWheelReward(): void {
  localStorage.removeItem(getRewardKey());

  window.dispatchEvent(
    new Event("wheel-reward-updated")
  );
}

export function hasSpunThisMonth(): boolean {
  const lastSpinMonth =
    localStorage.getItem(
      getSpinMonthKey()
    );

  return (
    lastSpinMonth === getCurrentMonth()
  );
}

export function markSpinForCurrentMonth(): void {
  localStorage.setItem(
    getSpinMonthKey(),
    getCurrentMonth()
  );
}

export function resetWheelForTesting(): void {
  localStorage.removeItem(getRewardKey());
  localStorage.removeItem(
    getSpinMonthKey()
  );

  window.dispatchEvent(
    new Event("wheel-reward-updated")
  );
}
```
