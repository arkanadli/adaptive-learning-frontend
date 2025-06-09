import { Route } from "react-router-dom";
import PrivateRoute from "../components/PrivateRoute";
import DashboardLayout from "../components/Layout/DashboardLayout";

import { Helmet } from "react-helmet-async";
import KelasDetail from "@/pages/kelas/KelasDetail";
import DetailMateri from "@/pages/kelas/MateriDetail";
import KelasAccessWrapper from "@/utils/KelasAccessWrapper";
import TambahKuis from "@/pages/kelas/TambahQuiz";
import QuizDetail from "@/pages/kelas/QuizDetail";
import StudentQuizResult from "@/pages/kelas/StudentQuizResult";
import PesertaDetail from "@/pages/kelas/PesertaDetail";
import PresensiDetail from "@/pages/kelas/PresensiDetail";

const guruRoutes = [
  { path: "/kelas/:jadwal_id", element: <KelasDetail />, title: "Kelas" },
  { path: "/kelas/:jadwal_id/materi/:materi_id", element: <DetailMateri />, title: "Materi" },
  { path: "/kelas/:jadwal_id/quiz/add", element: <TambahKuis />, title: "Tambah Quiz" },
  { path: "/kelas/:jadwal_id/quiz/:quiz_id", element: <QuizDetail />, title: "Quiz" },
  { path: "kelas/:jadwal_id/quiz/:quiz_id/hasil/:user_id", element: <StudentQuizResult />, title: "Hasil Quiz" },
  { path: "/kelas/:jadwal_id/peserta", element: <PesertaDetail />, title: "Peserta Kelas" },
  { path: "/kelas/:jadwal_id/presensi", element: <PresensiDetail />, title: "Presensi" },
];

export function KelasRoutes() {
  return (
    <>
      {guruRoutes.map(({ path, element, title }) => (
        <Route
          key={path}
          path={path}
          element={
            <PrivateRoute allowedRoles={["guru", 'siswa']}>
              <KelasAccessWrapper>
                <Helmet>
                    <title>{title} | Adaptive Learning</title>
                </Helmet>
                <DashboardLayout>{element}</DashboardLayout>
              </KelasAccessWrapper>
            </PrivateRoute>
          }
        />
      ))}
    </>
  );
}