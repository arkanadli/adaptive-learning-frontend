import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";

import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

import { Loader2 } from "lucide-react";

import { fetchQuizById, updateQuiz } from "@/api/quiz";
import { createBatchUserAnswer, getByQuiz, type UserAnswer } from "@/api/user_answer";

import { useAuth } from "@/context/AuthContext";
import DashboardLayout from "@/components/Layout/DashboardLayout";

import {
  fetchIdByJadwalUser,
  updateJadwalUser,
  type jadwalUser
} from "@/api/jadwal_user";
import { detectQuizType } from "./KelasDetail";

function determineEntryLevel(scorePct: number): number {
  if (scorePct >= 80) return 3;
  if (scorePct >= 60) return 2;
  return 1;
}
function determineNextLevel(current: number, scorePct: number): number {
  if (scorePct >= 80) return Math.min(current + 1, 3);
  if (scorePct < 50)  return Math.max(current - 1, 1);
  return current;
}

export default function QuizDetail() {
  const navigate = useNavigate();

  const { quiz_id, jadwal_id } = useParams<{ quiz_id: string, jadwal_id: string }>();
  const { user, loading } = useAuth();

  const [quiz, setQuiz] = useState<any>(null);
  const [answers, setAnswers] = useState<Record<number, string>>({});
  const [isLoading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [saving, setSaving] = useState(false);

  const [allAnswers, setAllAnswers] = useState<UserAnswer[]>([]);

  if (loading) return(
    <DashboardLayout>
      <div className="flex justify-center items-center h-screen">
        <p className="text-gray-500">Memuat data...</p>
      </div>
    </DashboardLayout>
  );

  if (!user) return( 
    <DashboardLayout>
      <div className="flex justify-center items-center h-screen">
        <p className="text-gray-500">Memuat user...</p>
      </div>
    </DashboardLayout>
  );

  const role = user.role.name.toLowerCase();
  const isGuru = role === "guru";

  useEffect(() => {
    if (!quiz_id) return;
    setLoading(true);
    fetchQuizById(Number(quiz_id))
      .then((data) => setQuiz(data))
      .catch(() => toast.error("Gagal memuat kuis"))
      .finally(() => setLoading(false));

    if (isGuru) {
      getByQuiz(Number(quiz_id))
        .then((data) =>
          setAllAnswers(data)
        )
        .catch(() => toast.error("Gagal memuat jawaban siswa"));
    }
  }, [quiz_id, role]);

  const handleAnswerChange = (questionId: number, selected: string) => {
    setAnswers({ ...answers, [questionId]: selected });
  };

  const handleSubmitAnswers = async () => {
    if (!quiz) return;
    const unanswered = quiz.questions.some((q: any) => !answers[q.id]);
    if (unanswered) {
      toast.error("Harap jawab semua pertanyaan terlebih dahulu.");
      return;
    }

    setSubmitting(true);
    
    try {
      const existing = await getByQuiz(Number(quiz_id));
      const userAttempts = existing.filter((a) => a.user.id === user.id);
      const maxAttempt = userAttempts.length > 0 ? Math.max(...userAttempts.map(a => a.attempt_number ?? 1)) : 0;
      const nextAttempt = maxAttempt + 1;

      const payload: UserAnswer[] = quiz.questions.map((q: any) => ({
        user_id: user.id,
        question_id: q.id,
        selected_answer: answers[q.id],
        is_correct: answers[q.id] === q.correct_answer,
        attempt_number: nextAttempt,
      }));

      await createBatchUserAnswer(payload);
      toast.success("Jawaban berhasil disimpan!");
      const total = quiz.questions.length;
      const correct = payload.filter((p) => p.is_correct).length;
      const scorePct = (correct / total) * 100;

      const quizType = detectQuizType(quiz.questions);
      const newLevel =
        quizType === "entry"
          ? determineEntryLevel(scorePct)
          : determineNextLevel(quizType as number, scorePct);

      const [enr]: jadwalUser[] = await fetchIdByJadwalUser({
        user_id: user.id,
        jadwal_id: Number(jadwal_id),
      });
      await updateJadwalUser(enr.id, { user_id: user.id, jadwal_id: Number(jadwal_id), difficulty_level: newLevel });

      toast.success(`Level kamu kini: ${newLevel}`);
      navigate(`/kelas/${jadwal_id}/quiz/${quiz_id}/hasil/${user.id}`);
      
    } catch (err) {
      console.error(err);
      toast.error("Gagal menyimpan jawaban");
    } finally {
      setSubmitting(false);
    }


  };

  const handleEditChange = (qIndex: number, field: string, value: any) => {
    const updated = { ...quiz };
    if (["title", "description"].includes(field)) {
      updated[field] = value;
    } else {
      updated.questions[qIndex][field] = value;
    }
    setQuiz(updated);
  };

  const handleOptionChange = (qIndex: number, key: string, value: string) => {
    const updated = { ...quiz };
    updated.questions[qIndex].options = { ...updated.questions[qIndex].options, [key]: value };
    setQuiz(updated);
  };

  const handleSaveEdit = async () => {
    setSaving(true);
    try {
      await updateQuiz(Number(quiz_id), quiz);
      toast.success("Kuis berhasil diperbarui");
    } catch (err) {
      toast.error("Gagal memperbarui kuis");
    } finally {
      setSaving(false);
    }
  };

  if (isLoading) {
    return <p className="p-6">Memuat...</p>;
  }

  if (!quiz) return( 
    <DashboardLayout>
        <p>Kuis tidak ditemukan</p>
    </DashboardLayout>);

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4 md:px-8 lg:px-16 xl:px-32">
      <div className="max-w-4xl mx-auto p-8 bg-white rounded-xl shadow space-y-6">
          {isGuru ? (
          <>
              <h1 className="text-3xl font-bold text-gray-800">Edit Kuis</h1>

              {/* Judul */}
              <div className="space-y-2">
              <label htmlFor="title" className="block text-sm font-medium text-gray-700">
                  Judul
              </label>
              <Input
                  id="title"
                  value={quiz.title}
                  onChange={(e) => handleEditChange(0, "title", e.target.value)}
                  className="w-full"
              />
              </div>

              {/* Deskripsi */}
              <div className="space-y-2">
              <label htmlFor="description" className="block text-sm font-medium text-gray-700">
                  Deskripsi
              </label>
              <textarea
                  id="description"
                  value={quiz.description}
                  onChange={(e) => handleEditChange(0, "description", e.target.value)}
                  className="w-full px-3 py-2 text-sm rounded-md border border-gray-300 shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                  rows={4}
              />
              </div>
          </>
          ) : (
          <>
              <h1 className="text-3xl font-bold text-gray-800">{quiz.title}</h1>
              <p className="text-gray-600">{quiz.description}</p>
          </>
          )}

          {quiz.questions.map((q: any, index: number) => (
          <div key={q.id} className="border-t pt-6 space-y-4">
              <h2 className="font-semibold text-lg text-gray-700">
              {index + 1}. {q.question_text}
              </h2>

              {Object.entries(q.options).map(([key, val]) => (
                <div key={key} className="flex items-center gap-2">
                  {isGuru ? (
                    <>
                      <span className="text-sm font-medium w-6">{key}.</span>
                      <Input
                        value={val as string}
                        onChange={(e) => handleOptionChange(index, key, e.target.value)}
                        className="flex-1"
                      />
                      <Button
                        variant="destructive"
                        size="sm"
                        type="button"
                        onClick={() => {
                          const updated = { ...quiz };
                          delete updated.questions[index].options[key];

                          // Reset jawaban benar jika dihapus
                          if (updated.questions[index].correct_answer === key) {
                            updated.questions[index].correct_answer = "";
                          }

                          setQuiz(updated);
                        }}
                      >
                        Hapus
                      </Button>
                    </>
                  ) : (
                    <label className="flex items-center gap-2">
                      <input
                        type="radio"
                        name={`question-${q.id}`}
                        value={key}
                        checked={answers[q.id] === key}
                        onChange={() => handleAnswerChange(q.id, key)}
                      />
                      <span className="text-sm">{key}. {val as string}</span>
                    </label>
                  )}
                </div>
              ))}

              {isGuru && (
                <Button
                  type="button"
                  variant="secondary"
                  size="sm"
                  onClick={() => {
                    const updated = { ...quiz };
                    const currentOptions = updated.questions[index].options || {};
                    const nextKey = String.fromCharCode(65 + Object.keys(currentOptions).length); // A, B, C...
                    updated.questions[index].options = { ...currentOptions, [nextKey]: "" };
                    setQuiz(updated);
                  }}
                >
                  Tambah Opsi
                </Button>
              )}

              {isGuru && (
              <div className="space-y-4">
                  {/* Jawaban Benar */}
                  <div className="space-y-2">
                  <label className="block text-sm font-medium text-gray-700">Jawaban Benar</label>
                  <select
                      value={q.correct_answer}
                      onChange={(e) => handleEditChange(index, "correct_answer", e.target.value)}
                      className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                      <option value="" disabled>Pilih jawaban</option>
                      {Object.keys(q.options).map((opt) => (
                      <option key={opt} value={opt}>
                          {opt}
                      </option>
                      ))}
                  </select>
                  </div>

                  {/* Tingkat Kesulitan */}
                  <div className="space-y-2">
                  <label className="block text-sm font-medium text-gray-700">Tingkat Kesulitan</label>
                  <select
                      value={q.difficulty_level}
                      onChange={(e) => handleEditChange(index, "difficulty_level", Number(e.target.value))}
                      className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                      <option value={1}>Mudah</option>
                      <option value={2}>Sedang</option>
                      <option value={3}>Sulit</option>
                  </select>
                  </div>
              </div>
              )}
          </div>
          ))}

          {isGuru ? (
            <div className="flex justify-between mt-6">
              <Button onClick={handleSaveEdit} disabled={saving}>
                {saving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Simpan Perubahan
              </Button>

              <Button
                onClick={() => navigate(`/kelas/${jadwal_id}`)}
                variant="outline"
              >
                ← Kembali
              </Button>
            </div>
          ) : (
            <div className="mt-6 flex justify-end">
              <Button onClick={handleSubmitAnswers} disabled={submitting}>
                {submitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Kirim Jawaban
              </Button>
            </div>
          )}
      </div>

      {isGuru && (
        <div className="max-w-4xl mx-auto p-8 bg-white rounded-xl shadow space-y-6 mt-10">
          <h3 className="text-xl font-semibold text-gray-700 mb-4">Hasil Siswa</h3>
          {allAnswers.length > 0 ? (
            <ul className="space-y-3">
              {Object.values(
                allAnswers.reduce((acc, ua) => {
                  const userId = ua.user.id;

                  if (!acc[userId]) {
                    acc[userId] = {};
                  }

                  if (!acc[userId][ua.attempt_number]) {
                    acc[userId][ua.attempt_number] = [];
                  }

                  acc[userId][ua.attempt_number].push(ua);
                  return acc;
                }, {} as Record<number, Record<number, UserAnswer[]>>)
              ).map((userAttemptsMap) => {

                const latestAttemptNumber = Math.max(...Object.keys(userAttemptsMap).map(Number));
                const latestAnswers = userAttemptsMap[latestAttemptNumber];
                const user = latestAnswers[0].user;
                const correct = latestAnswers.filter((a) => a.is_correct).length;
                const total = latestAnswers.length;

                return (
                  <li
                    key={user.id}
                    className="border border-gray-200 rounded hover:shadow-md transition"
                  >
                    <div className="flex justify-between items-center px-4 py-3">
                      <div>
                        <p className="font-medium text-gray-800">{user.name}</p>
                        <p className="text-sm text-gray-500 mt-1">
                          Skor: {correct} dari {total} jawaban (Attempt #{latestAttemptNumber})
                        </p>
                      </div>
                      <span className="text-blue-500 text-sm">
                        <a href={`/kelas/${jadwal_id}/quiz/${quiz_id}/hasil/${user.id}`}>
                          Lihat Detail →
                        </a>
                      </span>
                    </div>
                  </li>
                );
              })}
            </ul>
          ) : (
            <p className="text-gray-500 text-sm">Belum ada siswa yang mengerjakan.</p>
          )}
        </div>
      )}
    </div>
  );
}
