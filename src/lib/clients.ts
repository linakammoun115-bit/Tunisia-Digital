
import { supabase } from "./supabase";

export type Client = {
  id: string;
  name: string;
  phone: string;
  active: boolean;
};

export async function getClients(): Promise<Client[]> {
  const { data, error } = await supabase
    .from("clients")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) throw error;

  return data ?? [];
}

export async function saveClient(client: {
  name: string;
  phone: string;
}): Promise<Client> {
  const { data, error } = await supabase
    .from("clients")
    .upsert(
      {
        name: client.name.trim(),
        phone: client.phone.trim(),
        active: true,
      },
      { onConflict: "phone" }
    )
    .select()
    .single();

  if (error) throw error;

  return data;
}

export async function saveClients(clients: Client[]) {
  const { error } = await supabase
    .from("clients")
    .upsert(clients, { onConflict: "phone" });

  if (error) throw error;
}
