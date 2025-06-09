import API from './index';
import type { Jadwal } from './jadwal';
import type { User } from './user';

export interface jadwalUser {
    id: number;
    user_id: number | null;
    user: User;
    jadwal_id: number | null;
    jadwal: Jadwal;
    difficulty_level: number | null;
    created_at: string;
    updated_at: string;
}

export async function fetchJadwalUser(): Promise<jadwalUser[]> {
    const response = await API.get("/enrollment");
    return response.data;
}

export async function deleteJadwalUser(id: number) {
  return API.delete(`/enrollment/${id}`);
}

export async function updateJadwalUser(id: number, data: Partial<jadwalUser>) {
  const response = await API.put(`/enrollment/${id}`, data);
  return response.data;
}

export async function createJadwalUser(data: Omit<jadwalUser, "id" | "created_at" | "updated_at" | "user" | "jadwal">) {
  const response = await API.post("/enrollment", data);
  return response.data;
}

export async function fetchIdByJadwalUser(data: { user_id: number; jadwal_id: number }) {
  const response = await API.get(`/enrollment/get-id`, {
    params: {
      user_id: data.user_id,
      jadwal_id: data.jadwal_id,

    },
  });
  return response.data;
}