import API from './index';

export interface Subjek {
  id: number;
  name: string;
  code: string;
  singkatan: string;
  created_at: string;
  updated_at: string;
}

export async function fetchSubjek(): Promise<Subjek[]> {
  const response = await API.get("/subjects");
  return response.data;
}

export async function deleteSubjek(id: number) {
  return API.delete(`/subjects/${id}`);
}

export async function updateSubjek(id: number, data: Partial<Subjek>) {
  const response = await API.put(`/subjects/${id}`, data);
  return response.data;
}

export async function createSubjek(data: Omit<Subjek, "id" | "created_at" | "updated_at">) {
  const response = await API.post("/subjects", data);
  return response.data;
}

export async function fetchSubjekCount(): Promise<number> {
  const res = await API.get("/subjek/count");
  return res.data.count;
}