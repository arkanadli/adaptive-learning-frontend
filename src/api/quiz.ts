import API from './index';
import type { Jadwal } from './jadwal';

export interface Quiz {
  id: number;
  jadwal_id: number;
  jadwal: Jadwal;
  title: string;
  description: string;
  questions: CreateQuestion[];
  created_at: string;
  updated_at: string;
}

export type CreateQuestion = {
  question_text: string;
  options: Record<string, string>;
  correct_answer: string;
  difficulty_level: number;
};

export async function fetchQuiz(): Promise<Quiz[]> {
  const response = await API.get("/quizzes");
  return response.data;
}

export async function deleteQuiz(id: number) {
  return API.delete(`/quizzes/${id}`);
}

export async function fetchQuizById(id: number): Promise<Quiz> {
  const response = await API.get(`/quizzes/${id}`);
  return response.data;
}

export async function updateQuiz(id: number, data: Partial<Quiz>) {
  const response = await API.put(`/quizzes/${id}`, data);
  return response.data;
}

export async function createQuiz(data: Omit<Quiz, "id" | "created_at" | "updated_at" | "jadwal">) {
  const response = await API.post("/quizzes", data);
  return response.data;
}

export async function fetchQuizBySchedule(id: number): Promise<Quiz[]> {
  const res = await API.get(`/quizzes/jadwal/${id}`);
  return res.data;
}