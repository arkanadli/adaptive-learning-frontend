import { useEffect, useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { fetchUsersByIdAll, type User } from '@/api/user';
import type { jadwalUser } from '@/api/jadwal_user';
import { fetchQuizBySchedule, type Quiz } from '@/api/quiz';

import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  CartesianGrid,
  LabelList
} from 'recharts';

export default function DashboardSiswa() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [schedule, setSchedule] = useState<jadwalUser[] | null>(null);
  const [userData, setUserData] = useState<User>();
  
  // state baru:
  const [quizCount, setQuizCount] = useState<Record<number, number>>({});
  const [soalTotal, setSoalTotal] = useState<Record<number, number>>({});

  // fetch user & jadwal_user
  useEffect(() => {
    if (!user) return;
    fetchUsersByIdAll(user.id).then(data => {
      setUserData(data);
      setSchedule(data.jadwal_user);
    });
  }, [user]);

  // fetch quiz & questions count whenever schedule berubah
  useEffect(() => {
    if (!schedule) return;
    // untuk tiap jadwal: fetchQuizBySchedule → count quizzes & total questions
    Promise.all(
      schedule.map(async sch => {
        const quizzes = await fetchQuizBySchedule(sch.jadwal.id);
        const qCount = quizzes.length;
        // total soal = jumlah soal per quiz
        const sTotal = quizzes.reduce((sum, q: Quiz) => sum + (q.questions?.length || 0), 0);
        return [sch.jadwal.id, qCount, sTotal] as [number, number, number];
      })
    ).then(entries => {
      const qc: Record<number,number> = {};
      const st: Record<number,number> = {};
      for (const [jadwalId, qCount, sTotal] of entries) {
        qc[jadwalId] = qCount;
        st[jadwalId] = sTotal;
      }
      setQuizCount(qc);
      setSoalTotal(st);
    });
  }, [schedule]);

  if (!user || !userData || !schedule) return <p className="p-8">Memuat…</p>;

  const barData = schedule.map(sch => {
    const answers = userData.answers.filter(ans => ans.question?.quiz?.jadwal_id === sch.jadwal.id);
    const quizDoneCount = Object.keys(
      answers.reduce((acc, ans) => {
        acc[ans.question.quiz.id] = true;
        return acc;
      }, {} as Record<number, boolean>)
    ).length;

    const totalQuizzes = quizCount[sch.jadwal.id] || 0;
    const quizPct = totalQuizzes ? Math.round((quizDoneCount / totalQuizzes) * 100) : 0;

    return {
      name: `${sch.jadwal.subject.code} (${sch.jadwal.kelas.name})`,
      progress: quizPct,
    };
  });

  return (
    <div className="p-8">
      <h1 className="text-3xl font-bold mb-6">Dashboard Siswa</h1>

      <div className="mb-8 bg-white p-6 rounded-lg shadow">
        <h3 className="text-lg font-semibold mb-4">Progress Quiz per Kelas</h3>
        <ResponsiveContainer width="100%" height={Math.max(150, barData.length * 60)}>
          <BarChart
            data={barData}
            layout="vertical"
            margin={{ top: 5, right: 30, left: 0, bottom: 5 }}
          >
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis type="number" domain={[0, 100]} unit="%" />
            <YAxis dataKey="name" type="category" width={150} />
            <Tooltip formatter={(val) => `${val}%`} />
            <Legend />
            <Bar dataKey="progress" name="Quiz Selesai" fill="#3b82f6">
              <LabelList dataKey="progress" position="right" formatter={(val: number) => `${val}%`} />
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>

      <div className="grid gap-6 grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
        {schedule.map(sch => {
          // hitung jawaban & persentase
          const answers = userData.answers.filter(ans => ans.question?.quiz?.jadwal_id === sch.jadwal.id);
          const quizDoneCount = Object.keys(
            answers.reduce((acc, ans) => {
              acc[ans.question.quiz.id] = true;
              return acc;
            }, {} as Record<number, boolean>)
          ).length;
          const soalDoneCount = new Set(
            answers.map(ans => ans.question.id)
          ).size;

          const totalQuizzes = quizCount[sch.jadwal.id] || 0;
          const totalSoal    = soalTotal[sch.jadwal.id] || 0;

          // persentase, guard div by zero
          const quizPct = totalQuizzes ? Math.round((quizDoneCount/totalQuizzes)*100) : 0;
          const soalPct = totalSoal    ? Math.round((soalDoneCount/totalSoal)*100)    : 0;

          // level label
          const level = sch.difficulty_level;
          const levelLabel =
            level === 1 ? 'Mudah' :
            level === 2 ? 'Sedang' :
            level === 3 ? 'Sulit' : '-';

          return (
            <div
              key={sch.id}
              className="bg-white rounded-lg shadow hover:shadow-lg transition transform hover:-translate-y-1 p-6 flex flex-col"
            >
              {/* Header */}
              <div className="flex justify-between items-center border-b pb-3 mb-4">
                <h2 className="text-xl font-semibold">
                  {sch.jadwal.subject.code} {sch.jadwal.subject.singkatan} ({sch.jadwal.kelas.name})
                </h2>
                <span className="px-2 py-1 bg-blue-100 text-blue-800 text-sm rounded">
                  {levelLabel}
                </span>
              </div>

              {/* Jadwal */}
              <div className="text-sm text-gray-600 mb-4 space-y-1">
                <p><strong>Hari:</strong> {sch.jadwal.hari}</p>
                <p><strong>Jam:</strong> {sch.jadwal.jam_mulai.slice(0,5)}–{sch.jadwal.jam_selesai.slice(0,5)}</p>
              </div>

              {/* Quiz Progress */}
              <div className="mb-3">
                <p className="text-sm font-medium mb-1">
                  Quiz: {quizDoneCount}/{totalQuizzes}
                </p>
                <progress className="w-full h-2" value={quizPct} max={100} />
                <p className="text-xs text-gray-500 mt-1">{quizPct}%</p>
              </div>

              {/* Soal Progress */}
              <div className="mb-4">
                <p className="text-sm font-medium mb-1">
                  Soal: {soalDoneCount}/{totalSoal}
                </p>
                <progress className="w-full h-2" value={soalPct} max={100} />
                <p className="text-xs text-gray-500 mt-1">{soalPct}%</p>
              </div>

              {/* Button */}
              <div className="mt-auto pt-4 border-t flex justify-end">
                <button
                  className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
                  onClick={() => navigate(`/kelas/${sch.jadwal.id}`)}
                >
                  Buka Kelas
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
