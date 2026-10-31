import { supabase } from "./supabase";

export type WheelPrize = {
  id: string;
  name: string;
  label: string;
  // Probabilité de tomber sur ce lot (en %), et non le taux de réduction.
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
