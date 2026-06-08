export type PaymentMethod = {
  id: string;
  name: string;
  details: string;
  active: boolean;
};

export const defaultPaymentMethods: PaymentMethod[] = [
  {
    id: "d17",
    name: "D17",
    details: "Numéro D17 : 00 000 000",
    active: true,
  },
  {
    id: "bank",
    name: "Virement bancaire",
    details: "RIB : TN00 0000 0000 0000 0000 0000",
    active: true,
  },
  {
  id: "flouci",
  name: "Flouci",
  details: "Numéro Flouci : 00 000 000",
  active: true,
},
  {
    id: "crypto",
    name: "Crypto USDT",
    details: "Adresse USDT TRC20 : XXXXX",
    active: false,
  },
];

export function getPaymentMethods() {
  const saved = localStorage.getItem("paymentMethods");
  return saved ? JSON.parse(saved) : defaultPaymentMethods;
}

export function savePaymentMethods(methods: PaymentMethod[]) {
  localStorage.setItem("paymentMethods", JSON.stringify(methods));
}