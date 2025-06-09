import { useEffect, useRef, useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";

import { Button } from "@/components/ui/button";

import { fetchJadwalById, type Jadwal } from "@/api/jadwal";
import { fetchMateriBySchedule, type Materi } from "@/api/materi";
import { fetchQuizBySchedule, type Quiz } from "@/api/quiz";
import { fetchAbsensiBySchedule, type Absensi } from "@/api/absensi";
import { getByQuiz } from "@/api/user_answer";
import TambahMateriDialog from "./TambahMateriDialog";
import { fetchIdByJadwalUser } from "@/api/jadwal_user";
import type { Question } from "@/api/question";

export function detectQuizType(questions: Question[]): "entry" | number {
  const levels = [...new Set(questions.map(q => q.difficulty_level))];
  return levels.length === 1 ? levels[0] : "entry";
}

type QuizWithType = Quiz & { quizType: "entry" | number };

export default function KelasDetail() {
  
  const navigate = useNavigate();

  const { user: currentUser } = useAuth();
  const { jadwal_id } = useParams<{ jadwal_id: string }>();
  const dropdownRef = useRef<HTMLDivElement | null>(null);

  const [jadwal, setJadwal] = useState<Jadwal | null>(null);
  const [materi, setMateri] = useState<Materi[]>([]);
  const [absensi, setAbsensi] = useState<Absensi[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  const [isOpen, setIsOpen] = useState(false);
  const [isBukaModal, setIsBukaModal] = useState(false);

  const [answeredQuizIds, setAnsweredQuizIds] = useState<Set<number>>(new Set());
  const [studentLevel, setStudentLevel] = useState<number | null>(null);
  const [quizWithType, setQuizWithType] = useState<QuizWithType[]>([]);

  const isGuru = currentUser?.role?.name.toLowerCase() === "guru";
  const isSiswa = currentUser?.role?.name.toLowerCase() === "siswa";

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        if (!isBukaModal) {
          setIsOpen(false);
        }
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isBukaModal]);

  useEffect(() => {
    if (!jadwal_id || !currentUser) return;

    const id = Number(jadwal_id);
    const isStudent = isSiswa;

    const fetchAllData = async () => {
      try {
        setLoading(true);

        const [
          jadwalData,
          materiData,
          quizData,
          absensiData,
          enrollmentData
        ] = await Promise.all([
          fetchJadwalById(id),
          fetchMateriBySchedule(id),
          fetchQuizBySchedule(id),
          fetchAbsensiBySchedule(id),
          fetchIdByJadwalUser({ user_id: currentUser.id, jadwal_id: Number(jadwal_id) }),
        ]);

        setJadwal(jadwalData);
        setMateri(materiData);
        setAbsensi(absensiData);
        setStudentLevel(enrollmentData[0]?.difficulty_level);

        const annotated: QuizWithType[] = quizData.map((q: any) => ({
          ...q,
          quizType: detectQuizType(q.questions)
        }));
        setQuizWithType(annotated);

        if (isStudent) {

          const answeredQuizIds = new Set<number>();

          await Promise.all(
            quizData.map(async (qz) => {
              const answers = await getByQuiz(qz.id, currentUser.id);
              if (answers.length > 0) {
                answeredQuizIds.add(qz.id);
              }
            })
          );

          setAnsweredQuizIds(answeredQuizIds);
        }

      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchAllData();
  }, [jadwal_id, currentUser, isSiswa]);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <p className="text-gray-500">Memuat data kelas...</p>
      </div>
    );
  }
  
  return (
    <div className="min-h-screen bg-gray-50 py-6 px-4 md:px-8 lg:px-16 xl:px-32">
      {/* ===== HEADER KELAS ===== */}
      <div className="bg-white rounded-lg shadow p-6 mb-6">
        <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-4">
          <div>
            <h2 className="text-2xl font-semibold text-gray-800">
              {jadwal?.subject.code} {jadwal?.subject.name} {jadwal?.kelas.name}
            </h2>
            <p className="mt-1 text-gray-600">
              Guru: {jadwal?.guru.name} &middot; {jadwal?.hari},{" "}
              {jadwal?.jam_mulai.substring(0, 5)} -{" "}
              {jadwal?.jam_selesai.substring(0, 5)}
            </p>
          </div>

          {isGuru && (
            <div className="relative">
              <div className="inline-block" ref={dropdownRef}>
                <Button
                  onClick={() => {
                    if (isOpen) {
                      setIsOpen(false);
                      setIsBukaModal(false);
                    } else {
                      setIsOpen(true);
                    }
                  }}
                >
                  Aksi Kelas
                  <svg
                    className={`w-4 h-4 transition-transform ${isOpen ? "rotate-180" : ""}`}
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    viewBox="0 0 24 24"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                  </svg>
                </Button>

                {isOpen && (
                  <ul className="absolute z-10 bg-white border border-gray-200 shadow-lg rounded mt-2 w-48">
                    <li>
                      <TambahMateriDialog
                        jadwalId={Number(jadwal_id)}
                        onSukses={() => {
                          fetchMateriBySchedule(Number(jadwal_id)).then(setMateri);
                        }}
                        buttonClassName="w-full text-left px-4 py-2 hover:bg-gray-100 text-sm text-gray-700"
                        setIsBukaModal={setIsBukaModal}
                      />
                    </li>
                    <li>
                      <button
                        onClick={() => navigate(`/kelas/${jadwal_id}/quiz/add`)}
                        className="w-full text-left px-4 py-2 hover:bg-gray-100 text-sm text-gray-700"
                      >
                        Tambah Quiz
                      </button>
                    </li>
                    <li>
                      <button
                        onClick={() => navigate(`/kelas/${jadwal_id}/presensi`)}
                        className="w-full text-left px-4 py-2 hover:bg-gray-100 text-sm text-gray-700"
                      >
                        Lihat Presensi
                      </button>
                    </li>
                    <li>
                      <button
                        onClick={() => navigate(`/kelas/${jadwal_id}/peserta`)}
                        className="w-full text-left px-4 py-2 hover:bg-gray-100 text-sm text-gray-700"
                      >
                        Daftar Peserta
                      </button>
                    </li>
                  </ul>
                )}
              </div>
            </div>
          )}

          {isSiswa && (
            <div className="relative">
              <div className="inline-block" ref={dropdownRef}>
                <Button
                  onClick={() => {
                    if (isOpen) {
                      setIsOpen(false);
                      setIsBukaModal(false);
                    } else {
                      setIsOpen(true);
                    }
                  }}
                >
                  Aksi Kelas
                  <svg
                    className={`w-4 h-4 transition-transform ${isOpen ? "rotate-180" : ""}`}
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    viewBox="0 0 24 24"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                  </svg>
                </Button>

                {isOpen && (
                  <ul className="absolute z-10 bg-white border border-gray-200 shadow-lg rounded mt-2 w-48">
                    <li>
                      <button
                        onClick={() => navigate(`/kelas/${jadwal_id}/presensi`)}
                        className="w-full text-left px-4 py-2 hover:bg-gray-100 text-sm text-gray-700"
                      >
                        Lihat Presensi
                      </button>
                    </li>
                    <li>
                      <button
                        onClick={() => navigate(`/kelas/${jadwal_id}/peserta`)}
                        className="w-full text-left px-4 py-2 hover:bg-gray-100 text-sm text-gray-700"
                      >
                        Daftar Peserta
                      </button>
                    </li>
                  </ul>
                )}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* ===== UTAMA: BAGIAN UNTUK GURU ATAU SISWA ===== */}

      {/* --- BAGIAN MATERI --- */}
      <div className="bg-white rounded-lg shadow p-6 mb-6">
        <h3 className="text-xl font-semibold text-gray-700 mb-4">Materi</h3>
        {studentLevel === null ? (
          <p className="text-gray-500 text-sm">Kerjakan kuis entry terlebih dahulu.</p>
        ) : materi.length > 0 ? (
          <ul className="space-y-3">
            {materi
              .filter((m) => {
                if (!isSiswa) return true;
                if (studentLevel === null) return true;
                return m.difficulty_level <= studentLevel + 1;
              })
              .map((m) => (
              <li
                key={m.id}
                className="border border-gray-200 rounded hover:shadow-md transition"
              >
                <Link
                  to={`/kelas/${jadwal_id}/materi/${m.id}`}
                  className="flex justify-between items-center px-4 py-3"
                >
                  <div>
                    <p className="font-medium text-gray-800">{m.title}</p>
                    <p className="text-sm text-gray-500 mt-1">
                      {m.description.substring(0, 60)}
                      {m.description.length > 60 && "..."}
                    </p>
                  </div>
                  <span className="text-blue-500 text-sm">Selengkapnya &rarr;</span>
                </Link>
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-gray-500 text-sm">Belum ada materi.</p>
        )}
      </div>

      {/* --- BAGIAN QUIZ --- */}
      <div className="bg-white rounded-lg shadow p-6 mb-6">
        <h3 className="text-xl font-semibold text-gray-700 mb-4">Quiz</h3>
        {quizWithType.length > 0 ? (
          <ul className="space-y-3">
            {quizWithType
              .filter((qz) => {
                if (isGuru) return true;
                if (studentLevel === null) return qz.quizType === "entry";
                return (
                  studentLevel !== null &&
                  typeof qz.quizType === "number" &&
                  qz.quizType <= studentLevel + 1
                );
              })
              .map((qz) => (
              <li
                key={qz.id}
                className="border border-gray-200 rounded hover:shadow-md transition"
              >
                <Link
                  to={
                    answeredQuizIds.has(qz.id)
                      ? `/kelas/${jadwal_id}/quiz/${qz.id}/hasil/${currentUser!.id}`
                      : `/kelas/${jadwal_id}/quiz/${qz.id}`
                  }
                  className="flex justify-between items-center px-4 py-3"
                >
                  <div>
                    <p className="font-medium text-gray-800">{qz.title}</p>
                    <p className="text-sm text-gray-500 mt-1">
                      {qz.description.substring(0, 60)}
                      {qz.description.length > 60 && "..."}
                    </p>
                  </div>
                  <span className="text-blue-500 text-sm">
                    {answeredQuizIds.has(qz.id) ? "Lihat Hasil →" : isGuru ? "Selengkapnya →" : "Ikuti Quiz →"}
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-gray-500 text-sm">Belum ada quiz.</p>
        )}
      </div>

      {/* --- BAGIAN HISTORI ABSEN UNTUK SISWA --- */}
      {isSiswa && (
        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <h3 className="text-xl font-semibold text-gray-700 mb-4">
            Histori Absen Saya
          </h3>
          {absensi.filter((a) => a.jadwal_user.user_id === currentUser?.id)
            .length > 0 ? (
            <ul className="space-y-2">
              {absensi
                .filter((a) => a.jadwal_user.user_id === currentUser?.id)
                .map((a) => (
                  <li key={a.id} className="text-sm text-gray-700">
                    {a.tanggal.substring(0, 10)}{" "}
                    <span className="text-gray-400 text-xs">
                      {a.tanggal.substring(11, 16)}
                    </span>{" "}
                    – <span className="capitalize">{a.status}</span>
                  </li>
                ))}
            </ul>
          ) : (
            <p className="text-gray-500 text-sm">Belum ada histori absen.</p>
          )}
        </div>
      )}
    </div>
  );
}
