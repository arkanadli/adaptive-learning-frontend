import API from './index';

export interface Role {
  id: number;
  name: string;
  created_at: string;
  updated_at: string;
}

export async function fetchRole(): Promise<Role[]> {
  const response = await API.get("/roles");
  return response.data;
}

export async function deleteRole(id: number) {
  return API.delete(`/roles/${id}`);
}

export async function updateRole(id: number, data: Partial<Role>) {
  const response = await API.put(`/roles/${id}`, data);
  return response.data;
}

export async function createRole(data: Omit<Role, "id" | "created_at" | "updated_at">) {
  const response = await API.post("/roles", data);
  return response.data;
}