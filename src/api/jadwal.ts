import API from './index';
import type { ScheduleItem } from '@/pages/admin/Dashboard';
import type { Kelas } from './kelas';
import type { Subjek } from './subjek';
import type { User } from './user';

export interface Jadwal {
  id: number;
  kelas_id: number | null;
  kelas: Kelas;
  subject_id: number | null;
  subject: Subjek;
  guru_id: number | null;
  guru: User;
  hari: string;
  jam_mulai: string;
  jam_selesai: string;
  created_at: string;
  updated_at: string;
}

export interface GuruSchedule {
  id: number,
  tanggal: string,
  hari: string,
  jam_mulai: string,
  jam_selesai: string,
  kelas: Kelas,
  subject: Subjek,
  guru: User,
  path: string,
  nextDate: string
}

export async function fetchJadwal(): Promise<Jadwal[]> {
  const response = await API.get("/jadwals");
  return response.data;
}

export async function deleteJadwal(id: number) {
  return API.delete(`/jadwals/${id}`);
}

export async function updateJadwal(id: number, data: Partial<Jadwal>) {
  const response = await API.put(`/jadwals/${id}`, data);
  return response.data;
}

export async function createJadwal(data: Omit<Jadwal, "id" | "created_at" | "updated_at" | "kelas" | "subject" | "guru">) {
  const response = await API.post("/jadwals", data);
  return response.data;
}

export async function fetchJadwalById(id: number): Promise<Jadwal> {
  const response = await API.get(`/jadwals/${id}`);
  return response.data;
}

export function formatTime(date: Date | null): string {
  if (!date) return "";
  return date.toTimeString().slice(0, 5);
}

export async function fetchSchedulesToday(): Promise<ScheduleItem[]> {
  const res = await API.get("/jadwal/today");
  return res.data;
}

export async function fetchGuruSchedule(id: number): Promise<GuruSchedule[]> {
  const res = await API.get(`/guru/kelas/${id}`);
  return res.data;
}

export async function fetchSiswaSchedule(id: number): Promise<GuruSchedule[]> {
  const res = await API.get(`/siswa/kelas/${id}`);
  return res.data;
}