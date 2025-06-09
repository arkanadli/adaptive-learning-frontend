import type { ScheduleItem } from '@/pages/admin/Dashboard';
import API from './index';
import type { User } from './user';
import type { Question } from './question';

export interface UserAnswer {
  id: number;
  user_id: number;
  user: User;
  question_id: number;
  question: Question
  selected_answer: string;
  is_correct: boolean;
  attempt_number: number;
  created_at: string;
  updated_at: string;
}

export async function fetchUserAnswer(): Promise<UserAnswer[]> {
  const response = await API.get("/user-answers");
  return response.data;
}

export async function deleteUserAnswer(id: number) {
  return API.delete(`/user-answers/${id}`);
}

export async function updateUserAnswer(id: number, data: Partial<UserAnswer>) {
  const response = await API.put(`/user-answers/${id}`, data);
  return response.data;
}

export async function createUserAnswer(data: Omit<UserAnswer, "id" | "created_at" | "updated_at">) {
  const response = await API.post("/user-answers", data);
  return response.data;
}

export async function createBatchUserAnswer(data: Omit<UserAnswer[], "id" | "created_at" | "updated_at">) {
  const response = await API.post("/user-answers/batch", data);
  return response.data;
}

export async function fetchUserAnswerCount(): Promise<number> {
  const res = await API.get("/user-answers/count");
  return res.data.count;
}

export async function fetchUpcomingSchedule(limit: number): Promise<ScheduleItem[]> {
  const res = await API.get(`/jadwal/upcoming?limit=${limit}`);
  return res.data;
}

export interface QuizResultSummary {
  user_id: number;
  name: string;
  score: number;
}

export async function fetchUserAnswersByQuiz(user_id: number, quiz_id: number): Promise<UserAnswer[]> {
  const res = await API.get('/user-answers', { params: { user_id, quiz_id }});
  return res.data;
}

export async function fetchQuizResultsSummary(quiz_id: number): Promise<QuizResultSummary[]> {
  const res = await API.get('/user-answers/summary', { params: { quiz_id }});
  return res.data;
}

export async function getByQuiz(quiz_id: number, user_id?: number): Promise<UserAnswer[]> {
  const res = await API.get(`/quizzes/${quiz_id}/answers`, {
    params: user_id ? { user_id } : {},
  });
  return res.data;
}