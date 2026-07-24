```ts
export type WheelReward = {
  id: string;
  label: string;
  percentage: number;
  productKeyword: string | null;
  wonAt: string;
  spinMonth: string;
  used: boolean;
  usedAt?: string;
  usedOnProduct?: string;
};

const REWARD_KEY = "wheelReward";
const SPIN_MONTH_KEY = "wheelLastSpinMonth";

export function getCurrentMonthKey() {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, "0");

  return `${year}-${month}`;
}

export function hasSpunThisMonth() {
  return (
    localStorage.getItem(SPIN_MONTH_KEY) ===
    getCurrentMonthKey()
  );
}

export function markSpinForCurrentMonth() {
  localStorage.setItem(
    SPIN_MONTH_KEY,
    getCurrentMonthKey()
  );
}

export function createWheelReward(
  label: string
): WheelReward {
  const percentageMatch = label.match(/(\d+)%/);

  const percentage = percentageMatch
    ? Number(percentageMatch[1])
    : 0;

  const lowerLabel = label.toLowerCase();

  let productKeyword: string | null = null;

  if (lowerLabel.includes("gemini")) {
    productKeyword = "gemini";
  } else if (lowerLabel.includes("spotify")) {
    productKeyword = "spotify";
  } else if (lowerLabel.includes("canva")) {
    productKeyword = "canva";
  } else if (lowerLabel.includes("linkedin")) {
    productKeyword = "linkedin";
  } else if (lowerLabel.includes("2k followers")) {
    // Important : uniquement le pack 2K Followers
    productKeyword = "2k followers";
  }

  /*
    Si productKeyword reste null,
    il s'agit d'une réduction générale comme :
    "5% sur votre achat".
  */

  return {
    id: `${Date.now()}-${Math.random()
      .toString(36)
      .slice(2, 9)}`,
    label,
    percentage,
    productKeyword,
    wonAt: new Date().toISOString(),
    spinMonth: getCurrentMonthKey(),
    used: false,
  };
}

export function saveWheelReward(
  reward: WheelReward
) {
  localStorage.setItem(
    REWARD_KEY,
    JSON.stringify(reward)
  );

  window.dispatchEvent(
    new Event("wheel-reward-updated")
  );
}

export function getWheelReward():
  | WheelReward
  | null {
  const savedReward =
    localStorage.getItem(REWARD_KEY);

  if (!savedReward) return null;

  try {
    const parsed = JSON.parse(savedReward);

    if (
      typeof parsed !== "object" ||
      parsed === null
    ) {
      localStorage.removeItem(REWARD_KEY);
      return null;
    }

    return parsed as WheelReward;
  } catch {
    /*
      Compatibilité avec l'ancien format
      où wheelReward était enregistré comme texte.
    */
    const legacyReward =
      createWheelReward(savedReward);

    saveWheelReward(legacyReward);

    return legacyReward;
  }
}

function normalizeText(value: string) {
  return value
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/\s+/g, " ")
    .trim();
}

export function canUseRewardOnProduct(
  reward: WheelReward,
  productName: string
) {
  if (reward.used) {
    return false;
  }

  const normalizedLabel = normalizeText(
    reward.label
  );

  const normalizedProduct = normalizeText(
    productName
  );

  /*
    Réduction générale :
    "5% sur votre achat"

    Elle fonctionne sur n'importe quel produit.
  */
  if (!reward.productKeyword) {
    return normalizedLabel.includes(
      "5% sur votre achat"
    );
  }

  /*
    Produits classiques :
    Gemini, Spotify, Canva, LinkedIn.
  */
  if (
    reward.productKeyword === "gemini"
  ) {
    return normalizedProduct.includes(
      "gemini"
    );
  }

  if (
    reward.productKeyword === "spotify"
  ) {
    return normalizedProduct.includes(
      "spotify"
    );
  }

  if (
    reward.productKeyword === "canva"
  ) {
    return normalizedProduct.includes(
      "canva"
    );
  }

  if (
    reward.productKeyword === "linkedin"
  ) {
    return normalizedProduct.includes(
      "linkedin"
    );
  }

  /*
    Cas spécial :
    "2K Followers -10%"

    Dans Subscriptions.tsx, le produit est envoyé sous la forme :
    "2K Followers (Followers)"

    On enlève donc "(Followers)" puis on compare
    exactement avec "2k followers".
  */
  if (
    reward.productKeyword ===
    "2k followers"
  ) {
    const socialPackageName =
      normalizedProduct
        .replace("(followers)", "")
        .trim();

    return (
      socialPackageName ===
      "2k followers"
    );
  }

  return false;
}

export function calculateRewardPrice(
  originalPrice: number,
  percentage: number
) {
  if (
    !percentage ||
    percentage <= 0
  ) {
    return originalPrice;
  }

  const discountedPrice =
    originalPrice -
    originalPrice *
      (percentage / 100);

  return Number(
    discountedPrice.toFixed(2)
  );
}

export function consumeWheelReward(
  productName: string
) {
  const reward = getWheelReward();

  if (!reward) {
    return null;
  }

  if (
    !canUseRewardOnProduct(
      reward,
      productName
    )
  ) {
    return null;
  }

  const consumedReward: WheelReward = {
    ...reward,
    used: true,
    usedAt: new Date().toISOString(),
    usedOnProduct: productName,
  };

  saveWheelReward(consumedReward);

  return consumedReward;
}

export function removeUsedWheelReward() {
  const reward = getWheelReward();

  if (reward?.used) {
    localStorage.removeItem(REWARD_KEY);

    window.dispatchEvent(
      new Event("wheel-reward-updated")
    );
  }
}
```
