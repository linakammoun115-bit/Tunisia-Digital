export type WheelReward = {
  id: string;
  label: string;
  percentage: number;
  productName?: string;
  used: boolean;
  createdAt: string;
};

export type CartItem = {
  id: string;
  name: string;
  price: number;
  quantity: number;
};

export type DiscountedCartItem = CartItem & {
  originalPrice: number;
  finalPrice: number;
  originalTotal: number;
  finalTotal: number;
  discountAmount: number;
  discountApplied: boolean;
};

/*
|--------------------------------------------------------------------------
| User / localStorage keys
|--------------------------------------------------------------------------
*/

function getCurrentUserId(): string {
  try {
    const savedCustomer = localStorage.getItem("customer");

    if (savedCustomer) {
      const customer = JSON.parse(savedCustomer);

      if (customer?.phone) {
        return String(customer.phone).replace(/\s+/g, "");
      }

      if (customer?.id) {
        return String(customer.id);
      }

      if (customer?.email) {
        return String(customer.email)
          .toLowerCase()
          .trim();
      }
    }
  } catch {
    // Ignore invalid customer data
  }

  return "guest";
}

function getRewardKey(): string {
  return `wheelReward_${getCurrentUserId()}`;
}

function getSpinMonthKey(): string {
  return `wheelLastSpinMonth_${getCurrentUserId()}`;
}

function dispatchRewardUpdate(): void {
  if (typeof window !== "undefined") {
    window.dispatchEvent(
      new Event("wheel-reward-updated")
    );
  }
}

/*
|--------------------------------------------------------------------------
| Date
|--------------------------------------------------------------------------
*/

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

/*
|--------------------------------------------------------------------------
| Reward CRUD
|--------------------------------------------------------------------------
*/

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

    const isValid =
      reward &&
      typeof reward === "object" &&
      typeof reward.id === "string" &&
      typeof reward.label === "string" &&
      typeof reward.percentage === "number" &&
      typeof reward.used === "boolean" &&
      typeof reward.createdAt === "string";

    if (!isValid) {
      localStorage.removeItem(getRewardKey());
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

  dispatchRewardUpdate();
}

export function setWheelReward(
  reward: Omit<
    WheelReward,
    "used" | "createdAt"
  >
): WheelReward {
  const safePercentage = Math.min(
    100,
    Math.max(0, Number(reward.percentage))
  );

  const completeReward: WheelReward = {
    ...reward,
    percentage: safePercentage,
    used: false,
    createdAt: new Date().toISOString(),
  };

  saveWheelReward(completeReward);

  return completeReward;
}

export function createWheelReward(
  reward: Omit<
    WheelReward,
    "used" | "createdAt"
  >
): WheelReward {
  return setWheelReward(reward);
}

/*
|--------------------------------------------------------------------------
| Product matching
|--------------------------------------------------------------------------
*/

function normalizeProductName(
  productName: string
): string {
  return productName
    .toLowerCase()
    .trim()
    .replace(/\s+/g, " ")
    .replace(/[^\p{L}\p{N}\s]/gu, "");
}

export function canUseRewardOnProduct(
  reward: WheelReward | null,
  productName: string
): boolean {
  if (!reward || reward.used) {
    return false;
  }

  /*
   * Ken reward ma fihach productName,
   * promo tetabba9 3la ay produit.
   */
  if (!reward.productName) {
    return true;
  }

  const rewardProduct = normalizeProductName(
    reward.productName
  );

  const currentProduct = normalizeProductName(
    productName
  );

  if (!rewardProduct || !currentProduct) {
    return false;
  }

  return (
    currentProduct === rewardProduct ||
    currentProduct.includes(rewardProduct) ||
    rewardProduct.includes(currentProduct)
  );
}

/*
|--------------------------------------------------------------------------
| Price calculations
|--------------------------------------------------------------------------
*/

export function calculateRewardPrice(
  originalPrice: number,
  percentage: number
): number {
  const price = Number(originalPrice);
  const discount = Number(percentage);

  if (!Number.isFinite(price)) {
    return 0;
  }

  if (!Number.isFinite(discount)) {
    return Number(price.toFixed(2));
  }

  const safePrice = Math.max(0, price);

  const safeDiscount = Math.min(
    100,
    Math.max(0, discount)
  );

  const finalPrice =
    safePrice -
    safePrice * (safeDiscount / 100);

  return Number(finalPrice.toFixed(2));
}

export function applyRewardToCart(
  cartItems: CartItem[],
  reward: WheelReward | null = getWheelReward()
): DiscountedCartItem[] {
  /*
   * Promo tetabba9 3la awel produit compatible bark.
   * Hakka même ken quantity > 1, promo tetabba9
   * 3la quantité kemla mta3 heka produit.
   */
  let rewardAlreadyApplied = false;

  return cartItems.map((item) => {
    const originalPrice = Math.max(
      0,
      Number(item.price) || 0
    );

    const quantity = Math.max(
      1,
      Math.floor(Number(item.quantity) || 1)
    );

    const rewardApplies =
      !rewardAlreadyApplied &&
      canUseRewardOnProduct(reward, item.name);

    if (rewardApplies) {
      rewardAlreadyApplied = true;
    }

    const finalPrice =
      rewardApplies && reward
        ? calculateRewardPrice(
            originalPrice,
            reward.percentage
          )
        : originalPrice;

    const originalTotal = Number(
      (originalPrice * quantity).toFixed(2)
    );

    const finalTotal = Number(
      (finalPrice * quantity).toFixed(2)
    );

    const discountAmount = Number(
      (originalTotal - finalTotal).toFixed(2)
    );

    return {
      ...item,
      price: originalPrice,
      quantity,
      originalPrice,
      finalPrice,
      originalTotal,
      finalTotal,
      discountAmount,
      discountApplied: rewardApplies,
    };
  });
}

export function calculateCartTotals(
  cartItems: DiscountedCartItem[]
): {
  subtotal: number;
  discountTotal: number;
  total: number;
} {
  const subtotal = cartItems.reduce(
    (sum, item) => sum + item.originalTotal,
    0
  );

  const discountTotal = cartItems.reduce(
    (sum, item) => sum + item.discountAmount,
    0
  );

  const total = cartItems.reduce(
    (sum, item) => sum + item.finalTotal,
    0
  );

  return {
    subtotal: Number(subtotal.toFixed(2)),
    discountTotal: Number(
      discountTotal.toFixed(2)
    ),
    total: Number(total.toFixed(2)),
  };
}

/*
|--------------------------------------------------------------------------
| Reward consumption
|--------------------------------------------------------------------------
*/

/*
 * Tetsamma ba3d confirmation réussie bark.
 * Temsa7 reward mel localStorage définitivement.
 */
export function consumeWheelReward(
  productName?: string
): boolean {
  const reward = getWheelReward();

  if (!reward || reward.used) {
    return false;
  }

  if (
    productName &&
    !canUseRewardOnProduct(reward, productName)
  ) {
    return false;
  }

  localStorage.removeItem(getRewardKey());

  dispatchRewardUpdate();

  return true;
}

/*
 * Tmarki reward used bla ma temsa7ha.
 * Optional, ken theb ta7fedh historique local.
 */
export function markWheelRewardAsUsed(
  productName?: string
): boolean {
  const reward = getWheelReward();

  if (!reward || reward.used) {
    return false;
  }

  if (
    productName &&
    !canUseRewardOnProduct(reward, productName)
  ) {
    return false;
  }

  const usedReward: WheelReward = {
    ...reward,
    used: true,
  };

  saveWheelReward(usedReward);

  return true;
}

export function removeUsedWheelReward(): void {
  const reward = getWheelReward();

  if (!reward || reward.used) {
    localStorage.removeItem(getRewardKey());
    dispatchRewardUpdate();
  }
}

export function removeWheelReward(): void {
  localStorage.removeItem(getRewardKey());
  dispatchRewardUpdate();
}

/*
|--------------------------------------------------------------------------
| Spin limitation
|--------------------------------------------------------------------------
*/

export function hasSpunThisMonth(): boolean {
  const lastSpinMonth =
    localStorage.getItem(getSpinMonthKey());

  return lastSpinMonth === getCurrentMonth();
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

  dispatchRewardUpdate();
}
