import API from './index';
import type { jadwalUser } from './jadwal_user';

export type StatusAbsensi = "hadir" | "sakit" | "izin" | "alpa";

export interface Absensi {
  id: number;
  jadwal_user_id: number | null;
  jadwal_user: jadwalUser;
  tanggal: string;
  status: StatusAbsensi;
  created_at: string;
  updated_at: string;
}

export async function fetchAbsensi(): Promise<Absensi[]> {
  const response = await API.get("/absensis");
  return response.data;
}

export async function deleteAbsensi(id: number) {
  return API.delete(`/absensis/${id}`);
}

export async function updateAbsensi(id: number, data: Partial<Absensi>) {
  const response = await API.put(`/absensis/${id}`, data);
  return response.data;
}

export async function createAbsensi(data: Omit<Absensi, "id" | "created_at" | "updated_at" | "jadwal_user">) {
  const response = await API.post("/absensis", data);
  return response.data;
}

// Mengembalikan summary: { hadir: number, total: number }
export async function fetchAttendanceSummary(): Promise<{ hadir: number; total: number }> {
  const res = await API.get("/absensi/summary-today");
  return res.data;
}

export async function fetchAbsensiBySchedule(jadwal_id: number, user_id?: number): Promise<Absensi[]> {
  const res = await API.get(`/absensis/jadwal/${jadwal_id}`, {
    params: user_id ? { user_id } : {},
  });
  return res.data;
}