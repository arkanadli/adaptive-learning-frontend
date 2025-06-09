import API from './index';
import type { Jadwal } from './jadwal';

export interface Materi {
  id: number;
  jadwal_id: number;
  jadwal: Jadwal;
  title: string;
  description: string;
  difficulty_level: number;
  file: File | null;
  file_name: string | null;
  file_path: string | null;
  created_at: string;
  updated_at: string;
}

export async function fetchMateri(): Promise<Materi[]> {
  const response = await API.get("/materis");
  return response.data;
}

export async function deleteMateri(id: number) {
  return API.delete(`/materis/${id}`);
}

export async function updateMateri(id: number, data: {
  title: string;
  description: string;
  difficulty_level: number;
  file?: File | null;
}) {
  const formData = new FormData();
  formData.append("title", data.title);
  formData.append("description", data.description);
  formData.append("difficulty_level", String(data.difficulty_level));
  formData.append("_method", "PUT");
  if (data.file) {
    formData.append("file", data.file);
  }

  const response = await API.post(`/materis/${id}`, formData, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
    withCredentials: true,
  });

  return response.data;
}

export async function createMateri(data: {
  title: string;
  description: string;
  difficulty_level: number;
  jadwal_id: number;
  file: File;
}) {
  const formData = new FormData();
  formData.append("title", data.title);
  formData.append("description", data.description);
  formData.append("difficulty_level", String(data.difficulty_level));
  formData.append("jadwal_id", String(data.jadwal_id));
  formData.append("file", data.file);

  const response = await API.post("/materis", formData, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });

  return response.data;
}

export async function fetchMateriById(id: number): Promise<Materi> {
  const response = await API.get(`/materis/${id}`);
  return response.data;
}

export async function fetchMateriBySchedule(id: number): Promise<Materi[]> {
  const res = await API.get(`/materis/jadwal/${id}`);
  return res.data;
}