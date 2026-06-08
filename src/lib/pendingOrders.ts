export type PendingOrder = {
  id: string;
  clientName: string;
  phone: string;
  status: "En attente" | "Confirmée";
  items: any[];
  total: number;
  createdAt: string;
};

export function getPendingOrders(): PendingOrder[] {
  const saved = localStorage.getItem("pendingOrders");
  return saved ? JSON.parse(saved) : [];
}

export function savePendingOrders(orders: PendingOrder[]) {
  localStorage.setItem("pendingOrders", JSON.stringify(orders));
}

export function savePendingCart(cart: any[]) {
  if (!cart || cart.length === 0) return;

  const total = cart.reduce(
    (sum: number, item: any) => sum + item.price * item.quantity,
    0
  );

  const orders = getPendingOrders();

  const existingIndex = orders.findIndex(
    (order) => order.status === "En attente"
  );

  const pendingOrder: PendingOrder = {
    id: "pending-cart",
    clientName: "Client non confirmé",
    phone: "Non renseigné",
    status: "En attente",
    items: cart,
    total,
    createdAt: new Date().toLocaleString(),
  };

  if (existingIndex >= 0) {
    orders[existingIndex] = pendingOrder;
  } else {
    orders.push(pendingOrder);
  }

  savePendingOrders(orders);
}