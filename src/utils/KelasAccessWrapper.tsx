import { useParams, Navigate, useLocation } from "react-router-dom";
import { useEffect, useState } from "react";
import { fetchUsersBySchedule } from "@/api/user";
import { useAuth } from "@/context/AuthContext";
import DashboardLayout from "@/components/Layout/DashboardLayout";
import { fetchJadwalById, type Jadwal } from "@/api/jadwal";

export default function KelasAccessWrapper({ children }: { children: React.ReactNode }) {
  const { user } = useAuth();
  const { jadwal_id, user_id } = useParams();
  const location = useLocation();
  const [jadwal, setJadwal] = useState<Jadwal | null>(null);
  const [allowedUserIds, setAllowedUserIds] = useState<number[] | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!jadwal_id) return;
    fetchUsersBySchedule(Number(jadwal_id)).then((res) => {
      const userIds = res.map((item: any) => item.user.id);
      const guruIds = res
        .map((item: any) => item.jadwal.guru.id)
        .filter((id: any) => id !== undefined && id !== null);
      const allIds = Array.from(new Set([...userIds, ...guruIds]));
      setAllowedUserIds(allIds);
      setLoading(false);
    });

    fetchJadwalById(Number(jadwal_id)).then((res) => {
      setJadwal(res);
    });
  }, [jadwal_id]);

  if (!allowedUserIds || !jadwal || loading || !user) {
    return (
      <DashboardLayout>
        <div className="flex justify-center items-center h-screen">
          <p className="text-gray-500">Loading...</p>
        </div>
      </DashboardLayout>
    );
  }

  const role = user.role.name.toLowerCase();
  const isGuru = role === "guru";
  const isSiswa = role === "siswa";

  if (
    !allowedUserIds.includes(user.id) && allowedUserIds.length > 0 || 
    (isGuru && user.id !== jadwal.guru_id) || 
    (isSiswa && allowedUserIds.length === 0)
  ) {
    return <Navigate to="/unauthorized" replace />;
  }

  if (location.pathname.includes("/hasil/")) {
    if (isSiswa && Number(user_id) !== user.id) {
      return <Navigate to="/unauthorized" replace />;
    }
  }

  return <>{children}</>;
}
