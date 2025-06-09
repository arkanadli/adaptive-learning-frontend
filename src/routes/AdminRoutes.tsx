import { Route } from "react-router-dom";
import PrivateRoute from "@/components/PrivateRoute";
import DashboardLayout from "@/components/Layout/DashboardLayout";

import DashboardAdmin from '@/pages/admin/Dashboard';
import ManageUsers from '@/pages/admin/ManageUsers';
import ManageKelas from '@/pages/admin/ManageKelas';
import ManageSubjek from '@/pages/admin/ManageSubjek';
import ManageRoles from '@/pages/admin/ManageRoles';
import ManageJadwals from '@/pages/admin/ManageJadwal';
import ManageAbsensis from '@/pages/admin/ManageAbsensi';
import ManageEnrollments from "@/pages/admin/ManageEnrollment";

import { Helmet } from "react-helmet-async";

const adminRoutes = [
  { path: "/admin", element: <DashboardAdmin />, title: "Dashboard" },
  { path: "/admin/users", element: <ManageUsers />, title: "Manage User" },
  { path: "/admin/kelas", element: <ManageKelas />, title: "Manage Kelas" },
  { path: "/admin/subjek", element: <ManageSubjek />, title: "Manage Subjek" },
  { path: "/admin/roles", element: <ManageRoles />, title: "Manage Role" },
  { path: "/admin/jadwal", element: <ManageJadwals />, title: "Manage Jadwal" },
  { path: "/admin/absensi", element: <ManageAbsensis />, title: "Manage Absensi" },
  { path: "/admin/enrollment", element: <ManageEnrollments />, title: "Manage Enrollment" },
];

export function AdminRoutes() {
  return (
    <>
      {adminRoutes.map(({ path, element, title }) => (
        <Route
          key={path}
          path={path}
          element={
            <PrivateRoute allowedRoles={["admin"]}>
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