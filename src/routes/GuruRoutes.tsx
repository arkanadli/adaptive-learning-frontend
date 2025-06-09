import { Route } from "react-router-dom";
import PrivateRoute from "../components/PrivateRoute";
import DashboardLayout from "../components/Layout/DashboardLayout";

import DashboardGuru from '../pages/guru/Dashboard';

import { Helmet } from "react-helmet-async";

const guruRoutes = [
  { path: "/guru", element: <DashboardGuru />, title: "Dashboard" },
];

export function GuruRoutes() {
  return (
    <>
      {guruRoutes.map(({ path, element, title }) => (
        <Route
          key={path}
          path={path}
          element={
            <PrivateRoute allowedRoles={["guru"]}>
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