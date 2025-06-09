import API from './index';
import type { Quiz } from './quiz';

export interface Question {
  id: number;
  quiz_id: number;
  quiz: Quiz;
  question_text: string;
  options: Record<string, string>;
  correct_answer: string;
  difficulty_level: number;
  created_at: string;
  updated_at: string;
}

export async function fetchQuestion(): Promise<Question[]> {
  const response = await API.get("/questions");
  return response.data;
}

export async function deleteQuestion(id: number) {
  return API.delete(`/questions/${id}`);
}

export async function fetchQuestionById(id: number): Promise<Question> {
  const response = await API.get(`/questions/${id}`);
  return response.data;
}

export async function updateQuestion(id: number, data: Partial<Question>) {
  const response = await API.put(`/questions/${id}`, data);
  return response.data;
}

export async function createQuestion(data: Omit<Question, "id" | "created_at" | "updated_at" | "quiz" | "quiz_id">) {
  const response = await API.post("/questions", data);
  return response.data;
}

export async function fetchQuestionBySchedule(id: number): Promise<Question[]> {
  const res = await API.get(`/questions/jadwal/${id}`);
  return res.data;
}