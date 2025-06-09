import type { ScheduleItem } from '@/pages/admin/Dashboard';
import API from './index';

export interface Kelas {
  id: number;
  name: string;
  created_at: string;
  updated_at: string;
}

export async function fetchKelas(): Promise<Kelas[]> {
  const response = await API.get("/kelas");
  return response.data;
}

export async function deleteKelas(id: number) {
  return API.delete(`/kelas/${id}`);
}

export async function updateKelas(id: number, data: Partial<Kelas>) {
  const response = await API.put(`/kelas/${id}`, data);
  return response.data;
}

export async function createKelas(data: Omit<Kelas, "id" | "created_at" | "updated_at">) {
  const response = await API.post("/kelas", data);
  return response.data;
}

export async function fetchKelasCount(): Promise<number> {
  const res = await API.get("/kelas/count");
  return res.data.count;
}

export async function fetchUpcomingSchedule(limit: number): Promise<ScheduleItem[]> {
  const res = await API.get(`/jadwal/upcoming?limit=${limit}`);
  return res.data;
}