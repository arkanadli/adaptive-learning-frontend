import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";

import { Button } from "@/components/ui/button";

import { CheckCircle, XCircle } from "lucide-react";

import {
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Tooltip,
  Legend,
} from 'recharts';

import DashboardLayout from "@/components/Layout/DashboardLayout";
import { useAuth } from "@/context/AuthContext";

import { getByQuiz } from "@/api/user_answer";
import type { UserAnswer } from "@/api/user_answer";


export default function StudentQuizResult() {
  const { quiz_id, jadwal_id, user_id } = useParams<{ quiz_id: string; jadwal_id: string, user_id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();

  const [answers, setAnswers] = useState<UserAnswer[]>([]);
  const [loading, setLoading] = useState(true);

  const [selectedAttempt, setSelectedAttempt] = useState<number | null>(null);

  useEffect(() => {
    if (!user || !quiz_id) return;
    setLoading(true);
    if (user.role.name.toLowerCase() === "siswa"){
      getByQuiz(Number(quiz_id), user.id)
      .then(setAnswers)
      .finally(() => setLoading(false));
    } else {
      getByQuiz(Number(quiz_id), Number(user_id))
      .then(setAnswers)
      .finally(() => setLoading(false));
    }

  }, [user, quiz_id]);

  if (loading) return <DashboardLayout><p className="p-6">Memuat hasil...</p></DashboardLayout>;

  const attempts = Array.from(new Set(answers.map((a) => a.attempt_number))).sort((a, b) => b - a);
  const currentAttempt = selectedAttempt ?? Math.max(...attempts);
  const currentAnswers = answers.filter((a) => a.attempt_number === currentAttempt);

  const total = currentAnswers.length;
  const correct = currentAnswers.filter(a => a.is_correct).length;
  const score = total ? Math.round((correct / total) * 100) : 0;

  const incorrect = total - correct;
  const pieData = [
    { name: 'Benar', value: correct },
    { name: 'Salah', value: incorrect },
  ];
  const COLORS = ['#4ade80', '#f87171'];

  const role = user?.role?.name.toLowerCase();

  const handleBack = () => {
    if (role === "guru") {
      navigate(`/kelas/${jadwal_id}/quiz/${quiz_id}`);
    } else {
      navigate(`/kelas/${jadwal_id}`);
    }
  };

  const handleRetake = () => {
    navigate(`/kelas/${jadwal_id}/quiz/${quiz_id}`);
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4 md:px-8 lg:px-16 xl:px-32">
      <div className="max-w-4xl mx-auto p-8 bg-white rounded-xl shadow space-y-6">
        <h1 className="text-3xl font-bold text-gray-800">Hasil Kuis</h1>
        {attempts.length > 1 && (
            <div className="flex items-center gap-2">
                <label className="text-sm text-gray-600">Lihat Attempt:</label>
                <select
                value={currentAttempt}
                onChange={(e) => setSelectedAttempt(Number(e.target.value))}
                className="border px-2 py-1 rounded text-sm"
                >
                {attempts.map((a) => (
                    <option key={a} value={a}>
                    Attempt #{a}
                    </option>
                ))}
                </select>
            </div>
        )}
        <p className="text-gray-600 text-lg">
            Skor Akhir:{" "}
            <span className="font-bold text-blue-700">{score}%</span>{" "}
            ({correct}/{total} benar)
        </p>

        <div className="mb-6 h-64">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={pieData}
                dataKey="value"
                nameKey="name"
                cx="50%"
                cy="50%"
                innerRadius={50}
                outerRadius={80}
                label
              >
                {pieData.map((_, idx) => (
                  <Cell key={idx} fill={COLORS[idx % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip />
              <Legend verticalAlign="bottom" height={36} />
            </PieChart>
          </ResponsiveContainer>
        </div>

        <div className="space-y-6">
            {currentAnswers.map((a, i) => {
                const isCorrect = a.is_correct;
                const selectedKey = a.selected_answer;

                return (
                <div key={a.id} className="border rounded-lg p-4 shadow-sm bg-gray-50">
                    <div className="flex items-start justify-between">
                    <p className="text-lg font-semibold text-gray-800">
                        {i + 1}. {a.question.question_text}
                    </p>
                    <div className="flex items-center gap-1 text-sm font-medium">
                        {isCorrect ? (
                        <span className="text-green-600 flex items-center gap-1">
                            <CheckCircle size={18} /> Benar
                        </span>
                        ) : (
                        <span className="text-red-600 flex items-center gap-1">
                            <XCircle size={18} /> Salah
                        </span>
                        )}
                    </div>
                    </div>

                    <div className="mt-3 space-y-2">
                    {Object.entries(a.question.options).map(([key, value]) => {
                        const isSelected = key === selectedKey;
                        return (
                        <div
                            key={key}
                            className={`border rounded px-4 py-2 text-sm ${
                            isSelected
                                ? isCorrect
                                ? "bg-green-50 border-green-400 text-green-800"
                                : "bg-red-50 border-red-400 text-red-800"
                                : "bg-white border-gray-300 text-gray-700"
                            }`}
                        >
                            <span className="font-medium mr-1">{key}.</span> {value}
                        </div>
                        );
                    })}
                    </div>
                </div>
                );
            })}
        </div>

        <div className="flex gap-4 pt-8">
          <Button variant="outline" onClick={handleBack}>
            Kembali
          </Button>
          {role === "siswa" && (
            <Button onClick={handleRetake}>
              Ulangi Kuis
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
