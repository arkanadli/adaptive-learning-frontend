import { Route } from "react-router-dom";
import PrivateRoute from "../components/PrivateRoute";
import DashboardLayout from "../components/Layout/DashboardLayout";

import DashboardSiswa from '../pages/siswa/Dashboard';

import { Helmet } from "react-helmet-async";

const siswaRoutes = [
  { path: "/siswa", element: <DashboardSiswa />, title: "Dashboard" },
];

export function SiswaRoutes() {
  return (
    <>
      {siswaRoutes.map(({ path, element, title }) => (
        <Route
          key={path}
          path={path}
          element={
            <PrivateRoute allowedRoles={["siswa"]}>
              <Helmet>
                <title>{title} | Adaptive Learning</title>
              </Helmet>
              <DashboardLayout>{element}</DashboardLayout>
            </PrivateRoute>
          }
        />
      ))}
    </>
  );
}