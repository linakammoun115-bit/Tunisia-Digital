
import {
  getWheelPrizeReward,
  type WheelRewardType,
} from "./wheelConfig";

export type WheelReward = {
  id: string;
  label: string;

  // Type et valeur réelle de la récompense.
  type: WheelRewardType;
  value: number;

  // Compatibilité : pourcentage réel de réduction.
  // Ce n'est jamais la probabilité de gagner.
  percentage: number;

  productName?: string;
  used: boolean;
  createdAt: string;
  expiresAt: number;
  usedAt?: string;
};

export type CreateWheelRewardInput = {
  id: string;
  label: string;
  productName?: string;

  // Paramètres facultatifs pour les anciens appels.
  percentage?: number;
  type?: WheelRewardType;
  value?: number;
};

const WHEEL_REWARD_KEY = "wheel-reward";
const WHEEL_SPIN_DAY_KEY = "wheel-spin-day";

const REWARD_DURATION_MS = 60 * 60 * 1000;

const KNOWN_PRIZE_IDS = new Set([
  "discount-5",
  "discount-1dt",
  "discount-10",
  "discount-2dt",
  "surprise-gift",
  "next-order-code",
  "next-order-5",
  "discount-20",
  "try-again",
]);

function isBrowser() {
  return typeof window !== "undefined";
}

function isRewardType(value: unknown): value is WheelRewardType {
  return (
    value === "percent" ||
    value === "fixed" ||
    value === "gift" ||
    value === "promo_code" ||
    value === "next_order_percent" ||
    value === "none"
  );
}

function normalizeValue(value: unknown, fallback = 0): number {
  const number = Number(value);

  if (!Number.isFinite(number)) {
    return fallback;
  }

  return Math.max(0, number);
}

/**
 * Retourne la date actuelle au format YYYY-MM-DD.
 * Une participation est autorisée par jour civil.
 */
export function getCurrentDayKey() {
  const now = new Date();

  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, "0");
  const day = String(now.getDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
}

/**
 * Sauvegarder une récompense.
 */
export function saveWheelReward(reward: WheelReward) {
  if (!isBrowser()) return;

  localStorage.setItem(
    WHEEL_REWARD_KEY,
    JSON.stringify(reward)
  );

  window.dispatchEvent(
    new Event("wheel-reward-updated")
  );
}

/**
 * Supprimer la récompense.
 */
export function removeWheelReward() {
  if (!isBrowser()) return;

  localStorage.removeItem(WHEEL_REWARD_KEY);

  window.dispatchEvent(
    new Event("wheel-reward-updated")
  );
}

/**
 * Récupérer la récompense sauvegardée.
 * Les anciennes récompenses sont converties automatiquement
 * à partir de leur ID pour corriger les anciennes valeurs.
 */
export function getWheelReward(): WheelReward | null {
  if (!isBrowser()) return null;

  try {
    const storedReward = localStorage.getItem(
      WHEEL_REWARD_KEY
    );

    if (!storedReward) return null;

    const parsed = JSON.parse(
      storedReward
    ) as Partial<WheelReward>;

    if (
      !parsed ||
      typeof parsed !== "object" ||
      typeof parsed.id !== "string" ||
      typeof parsed.label !== "string"
    ) {
      removeWheelReward();
      return null;
    }

    const now = Date.now();

    let expiresAt = Number(parsed.expiresAt);

    if (!Number.isFinite(expiresAt)) {
      const createdAtTime =
        typeof parsed.createdAt === "string"
          ? new Date(parsed.createdAt).getTime()
          : now;

      expiresAt =
        (Number.isFinite(createdAtTime)
          ? createdAtTime
          : now) + REWARD_DURATION_MS;
    }

    const createdAt =
      typeof parsed.createdAt === "string" &&
      Number.isFinite(new Date(parsed.createdAt).getTime())
        ? parsed.createdAt
        : new Date(now).toISOString();

    // Corriger les récompenses déjà enregistrées.
    // On utilise l'ID, jamais la probabilité de la roue.
   const knownPrize = getWheelPrizeReward({
  id: parsed.id,
  label: parsed.label,
});

    const rewardType: WheelRewardType =
      knownPrize?.type ??
      (isRewardType(parsed.type) ? parsed.type : "percent");

    const legacyValue = normalizeValue(parsed.percentage);

    const value = knownPrize
      ? knownPrize.value
      : normalizeValue(parsed.value, legacyValue);

    const actualPercentage =
      rewardType === "percent" ||
      rewardType === "next_order_percent"
        ? value
        : 0;

    const normalizedReward: WheelReward = {
      id: parsed.id,
      label: parsed.label,
      type: rewardType,
      value,
      percentage: actualPercentage,
      productName:
        typeof parsed.productName === "string"
          ? parsed.productName
          : undefined,
      used: parsed.used === true,
      createdAt,
      expiresAt,
      usedAt:
        typeof parsed.usedAt === "string"
          ? parsed.usedAt
          : undefined,
    };

    // Supprimer automatiquement une récompense expirée.
    if (
      !normalizedReward.used &&
      now >= normalizedReward.expiresAt
    ) {
      removeWheelReward();
      return null;
    }

    // Mettre à jour le stockage avec le nouveau format.
    if (
      parsed.type !== normalizedReward.type ||
      parsed.value !== normalizedReward.value ||
      parsed.percentage !== normalizedReward.percentage
    ) {
      saveWheelReward(normalizedReward);
    }

    return normalizedReward;
  } catch {
    removeWheelReward();
    return null;
  }
}

/**
 * Créer une nouvelle récompense.
 */
export function createWheelReward(
  input: CreateWheelRewardInput
): WheelReward {
  // Les IDs connus déterminent toujours la vraie récompense.
  // La probabilité percentage n'est jamais utilisée comme remise.
  const knownPrize = getWheelPrizeReward({
  id: input.id,
  label: input.label,
});

  const rewardType: WheelRewardType =
    knownPrize?.type ??
    input.type ??
    "percent";

  const value = knownPrize
    ? knownPrize.value
    : normalizeValue(
        input.value,
        normalizeValue(input.percentage)
      );

  const percentage =
    rewardType === "percent" ||
    rewardType === "next_order_percent"
      ? value
      : 0;

  const now = Date.now();

  const reward: WheelReward = {
    id: input.id,
    label: input.label,
    type: rewardType,
    value,
    percentage,
    productName:
      input.productName?.trim() || undefined,
    used: false,
    createdAt: new Date(now).toISOString(),
    expiresAt: now + REWARD_DURATION_MS,
  };

  saveWheelReward(reward);

  return reward;
}

/**
 * Vérifier si une récompense est expirée.
 */
export function isWheelRewardExpired(
  reward: WheelReward
) {
  return Date.now() >= reward.expiresAt;
}

/**
 * Vérifier si le visiteur a déjà joué aujourd'hui.
 */
export function hasSpunToday() {
  if (!isBrowser()) return false;

  const storedDay = localStorage.getItem(
    WHEEL_SPIN_DAY_KEY
  );

  return storedDay === getCurrentDayKey();
}

/**
 * Enregistrer la participation du jour.
 */
export function markSpinForToday() {
  if (!isBrowser()) return;

  localStorage.setItem(
    WHEEL_SPIN_DAY_KEY,
    getCurrentDayKey()
  );

  window.dispatchEvent(
    new Event("wheel-spin-updated")
  );
}

/**
 * Calculer le temps restant avant le prochain jour.
 */
export function getTimeUntilNextSpin(): number {
  if (!isBrowser()) return 0;

  const now = new Date();

  const nextDay = new Date(
    now.getFullYear(),
    now.getMonth(),
    now.getDate() + 1,
    0,
    0,
    0,
    0
  );

  return Math.max(
    0,
    nextDay.getTime() - now.getTime()
  );
}

/**
 * Normaliser le nom d'un produit.
 */
function normalizeProductName(value: string) {
  return value
    .trim()
    .toLowerCase()
    .replace(/\s+/g, " ");
}

/**
 * Vérifier si la récompense est applicable au produit.
 * Seules les réductions immédiates sont applicables au panier.
 */
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
    reward.type !== "percent" &&
    reward.type !== "fixed"
  ) {
    return false;
  }

  if (reward.value <= 0) {
    return false;
  }

  if (
    reward.type === "percent" &&
    reward.value > 100
  ) {
    return false;
  }

  // Récompense valable sur tous les produits.
  if (!reward.productName) {
    return true;
  }

  const rewardProduct = normalizeProductName(
    reward.productName
  );

  const selectedProduct = normalizeProductName(
    productName
  );

  return (
    rewardProduct === selectedProduct ||
    selectedProduct.includes(rewardProduct) ||
    rewardProduct.includes(selectedProduct)
  );
}

/**
 * Calculer le prix après réduction en pourcentage.
 * Fonction conservée pour compatibilité avec les anciens imports.
 */
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
    Math.max(0, Number(percentage) || 0)
  );

  const discountedPrice =
    originalPrice * (1 - safePercentage / 100);

  return Number(discountedPrice.toFixed(2));
}

/**
 * Calculer le prix avec le vrai type de récompense.
 * 5 % et 10 % : remise en pourcentage.
 * 1 DT et 2 DT : remise fixe.
 */
export function calculateWheelRewardPrice(
  originalPrice: number,
  reward: WheelReward | null
) {
  if (
    !Number.isFinite(originalPrice) ||
    originalPrice < 0
  ) {
    return 0;
  }

  if (!reward) {
    return Number(originalPrice.toFixed(2));
  }

  if (
    reward.type === "percent" &&
    reward.value > 0 &&
    reward.value <= 100
  ) {
    return calculateRewardPrice(
      originalPrice,
      reward.value
    );
  }

  if (
    reward.type === "fixed" &&
    reward.value > 0
  ) {
    const discountedPrice = Math.max(
      0,
      originalPrice - reward.value
    );

    return Number(discountedPrice.toFixed(2));
  }

  // Cadeau, code promo et réduction du prochain achat
  // ne diminuent pas le prix du panier actuel.
  return Number(originalPrice.toFixed(2));
}

/**
 * Utiliser une récompense.
 * À appeler uniquement après validation de la commande.
 */
export function consumeWheelReward(
  productName?: string
) {
  const reward = getWheelReward();

  if (
    !reward ||
    reward.used ||
    isWheelRewardExpired(reward)
  ) {
    return false;
  }

  if (
    reward.type !== "percent" &&
    reward.type !== "fixed"
  ) {
    return false;
  }

  if (
    productName &&
    !canUseRewardOnProduct(reward, productName)
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

/**
 * Ancien alias conservé pour compatibilité.
 * Cette fonction consomme la récompense.
 */
export function useWheelReward() {
  const reward = getWheelReward();

  if (
    !reward ||
    reward.used ||
    isWheelRewardExpired(reward)
  ) {
    return null;
  }

  const consumedReward: WheelReward = {
    ...reward,
    used: true,
    usedAt: new Date().toISOString(),
  };

  saveWheelReward(consumedReward);

  return consumedReward;
}

/**
 * Réinitialiser la participation quotidienne.
 */
export function resetDailyWheelSpin() {
  if (!isBrowser()) return;

  localStorage.removeItem(
    WHEEL_SPIN_DAY_KEY
  );

  window.dispatchEvent(
    new Event("wheel-spin-updated")
  );
}

/**
 * Compatibilité avec les anciens imports mensuels.
 */
export function getCurrentMonthKey() {
  return getCurrentDayKey();
}

export function hasSpunThisMonth() {
  return hasSpunToday();
}

export function markSpinForCurrentMonth() {
  markSpinForToday();
}

export function resetMonthlyWheelSpin() {
  resetDailyWheelSpin();
}

/**
 * Réinitialiser tout le système.
 */
export function resetWheelRewardSystem() {
  if (!isBrowser()) return;

  localStorage.removeItem(WHEEL_REWARD_KEY);
  localStorage.removeItem(WHEEL_SPIN_DAY_KEY);

  window.dispatchEvent(
    new Event("wheel-reward-updated")
  );

  window.dispatchEvent(
    new Event("wheel-spin-updated")
  );
}
