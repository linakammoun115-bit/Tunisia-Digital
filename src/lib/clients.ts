export type Client = {
  id: string;
  name: string;
  phone: string;
  active: boolean;
};

export function getClients(): Client[] {
  const saved = localStorage.getItem("clients");
  return saved ? JSON.parse(saved) : [];
}

export function saveClients(clients: Client[]) {
  localStorage.setItem("clients", JSON.stringify(clients));
}