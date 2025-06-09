import { useEffect, useState } from "react";
import {
  Users2 as UsersIcon,
  BookOpen as ClassesIcon,
  ClipboardCheck as AttendanceIcon,
  Layers as SubjectsIcon,
  Calendar as ScheduleIcon,
  KeyRound as RoleIcon,
  UserPlusIcon as EnrollmentsIcon
} from "lucide-react";

// Import fungsi‐fungsi API yang dibutuhkan (pastikan file‐file ini ada)
import { fetchUsersCount, fetchRoleDistribution } from "@/api/user";
import { fetchKelasCount, fetchUpcomingSchedule } from "@/api/kelas";
import { fetchSubjekCount } from "@/api/subjek";
import { fetchAttendanceSummary } from "@/api/absensi";

// Tipe data untuk Upcoming Schedule
export interface ScheduleItem {
  id: number;
  hari: string;     
  jam_mulai: string;   
  jam_selesai: string; 
  kelas: string;
  subject: string;
  guru: string;
}

// Tipe data Role Distribution (list)
export interface RoleDistributionItem {
  role: string;   
  jumlah: number; 
}

export default function AdminDashboard() {
  // ==== State untuk KPI Cards ====
  const [userCount, setUserCount] = useState<number>(0);
  const [kelasCount, setKelasCount] = useState<number>(0);
  const [subjekCount, setSubjekCount] = useState<number>(0);
  const [attendanceSummary, setAttendanceSummary] = useState<{
    hadir: number;
    total: number;
  }>({ hadir: 0, total: 0 });

  // ==== State Role Distribution (list) ====
  const [roleDistribution, setRoleDistribution] = useState<RoleDistributionItem[]>([]);

  // ==== State Upcoming Schedule ====
  const [upcomingSchedule, setUpcomingSchedule] = useState<ScheduleItem[]>([]);

  const [isLoadingKPI, setIsLoadingKPI] = useState<boolean>(true);
  const [isLoadingRoleDist, setIsLoadingRoleDist] = useState<boolean>(true);
  const [isLoadingUpcomingSch, setIsLoadingUpcomingSch] = useState<boolean>(true);

  // ==== Fetch semua data saat komponen mount ====
  useEffect(() => {
    async function loadAllData() {
      try {
        setIsLoadingKPI(true);
        setIsLoadingRoleDist(true);
        setIsLoadingUpcomingSch(true);
        // 1. KPI Cards
        const [
          uCntResponse,
          kCntResponse,
          sCntResponse,
          attSummaryResponse,
        ] = await Promise.all([
          fetchUsersCount(),
          fetchKelasCount(),
          fetchSubjekCount(),
          fetchAttendanceSummary(),
        ]);
        setUserCount(uCntResponse.totalUsers);
        setKelasCount(kCntResponse);
        setSubjekCount(sCntResponse);
        setAttendanceSummary({
          hadir: attSummaryResponse.hadir,
          total: attSummaryResponse.total,
        });
        setIsLoadingKPI(false);

        // 2. Role Distribution (list)
        const rolesDistResponse = await fetchRoleDistribution();
        if (Array.isArray(rolesDistResponse)) {
          setRoleDistribution(rolesDistResponse);
        } else {
          console.error("Expected array for role distribution, got:", rolesDistResponse);
          setRoleDistribution([]);
        }
        setIsLoadingRoleDist(false);

        // 3. Upcoming Schedule (limit 5)
        const sch = await fetchUpcomingSchedule(5);
        if (Array.isArray(sch)) {
          setUpcomingSchedule(sch);
        } else {
          console.error("Expected array for upcoming schedule, got:", sch);
          setUpcomingSchedule([]);
        }
        setIsLoadingUpcomingSch(false);
      } catch (err) {
        console.error("Gagal load data dashboard:", err);
      }
    }

    loadAllData();
  }, []);

  // Hitung persentase absensi hari ini (atau tampilkan “-” jika total=0)
  const attendancePercent =
    attendanceSummary.total > 0
      ? Math.round((attendanceSummary.hadir / attendanceSummary.total) * 100)
      : null;

  return (
    <div className="bg-gray-50 min-h-screen">
      {/* Container Utama Responsif */}
      <div className="px-4 md:px-8 lg:px-16 xl:px-0 xl:max-w-7xl xl:mx-auto py-6">
        {/* ==== 1. KPI CARDS ==== */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 mb-6">
            {isLoadingKPI ? (
              Array.from({ length: 4 }).map((_, idx) => (
                <div key={idx} className="bg-white rounded-lg shadow-md p-4 animate-pulse">
                  <div className="h-6 bg-gray-200 rounded mb-2 w-1/2"></div>
                  <div className="h-10 bg-gray-300 rounded w-full my-4"></div>
                  <div className="h-4 bg-gray-200 rounded w-2/3"></div>
                </div>
              ))
            ) : (
              <>
                {/* Users Card */}
                <div className="bg-white rounded-lg shadow-md flex flex-col">
                  <div className="px-4 py-3 border-b border-gray-200 flex items-center gap-2">
                    <UsersIcon className="w-6 h-6 text-blue-400" />
                    <h3 className="text-lg font-medium">Users</h3>
                  </div>
                  <div className="p-4 flex-1 flex items-center justify-center">
                    <span className="text-3xl font-bold">{userCount}</span>
                  </div>
                  <div className="px-4 py-2 border-t border-gray-100 text-sm text-gray-600">
                    Jumlah total user
                  </div>
                </div>

                {/* Kelas Card */}
                <div className="bg-white rounded-lg shadow-md flex flex-col">
                  <div className="px-4 py-3 border-b border-gray-200 flex items-center gap-2">
                    <ClassesIcon className="w-6 h-6 text-indigo-600" />
                    <h3 className="text-lg font-medium">Kelas</h3>
                  </div>
                  <div className="p-4 flex-1 flex items-center justify-center">
                    <span className="text-3xl font-bold">{kelasCount}</span>
                  </div>
                  <div className="px-4 py-2 border-t border-gray-100 text-sm text-gray-600">
                    Jumlah total kelas aktif
                  </div>
                </div>

                {/* Absensi Card */}
                <div className="bg-white rounded-lg shadow-md flex flex-col">
                  <div className="px-4 py-3 border-b border-gray-200 flex items-center gap-2">
                    <AttendanceIcon className="w-6 h-6 text-green-600" />
                    <h3 className="text-lg font-medium">Absensi Hari Ini</h3>
                  </div>
                  <div className="p-4 flex-1 flex items-center justify-center">
                    {attendancePercent !== null ? (
                      <span className="text-3xl font-bold">
                        {attendancePercent}%
                      </span>
                    ) : (
                      <span className="text-3xl font-bold">-</span>
                    )}
                  </div>
                  <div className="px-4 py-2 border-t border-gray-100 text-sm text-gray-600">
                    {attendanceSummary.hadir} / {attendanceSummary.total} hadir
                  </div>
                </div>

                {/* Subjek Card */}
                <div className="bg-white rounded-lg shadow-md flex flex-col">
                  <div className="px-4 py-3 border-b border-gray-200 flex items-center gap-2">
                    <SubjectsIcon className="w-6 h-6 text-yellow-600" />
                    <h3 className="text-lg font-medium">Subjek</h3>
                  </div>
                  <div className="p-4 flex-1 flex items-center justify-center">
                    <span className="text-3xl font-bold">{subjekCount}</span>
                  </div>
                  <div className="px-4 py-2 border-t border-gray-100 text-sm text-gray-600">
                    Jumlah total subjek
                  </div>
                </div>
              </>
            )}
        </div>

        {/* ==== 2. ROLE DISTRIBUTION (LIST) ==== */}
        <div className="bg-white rounded-lg shadow-md mb-6 overflow-hidden">
          <div className="px-4 py-3 border-b border-gray-200">
            <h3 className="text-lg font-medium">Distribusi Role Pengguna</h3>
            <p className="text-sm text-gray-600">
              Proporsi Admin, Guru, dan Siswa
            </p>
          </div>
          <div className="p-4">
            {isLoadingRoleDist ? (
              <p className="text-center text-gray-400 animate-pulse">Memuat distribusi role...</p>
            ) : roleDistribution.length > 0 ? (
              <ul className="space-y-2">
                {roleDistribution.map((item) => (
                  <li
                    key={item.role}
                    className="flex justify-between items-center"
                  >
                    <span className="capitalize">{item.role.toLowerCase()}</span>
                    <span className="font-semibold">{item.jumlah}</span>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-center text-gray-500 py-4">
                Data distribusi role belum tersedia.
              </p>
            )}
          </div>
        </div>

        {/* ==== 3. QUICK ACTIONS & UPCOMING SCHEDULE ==== */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
          {/* 3a. Quick Actions */}
          <div className="bg-white rounded-lg shadow-md p-4">
            <div className="mb-3">
              <h3 className="text-lg font-medium">Aksi Cepat</h3>
              <p className="text-sm text-gray-600">
                Shortcut menuju halaman pengelolaan
              </p>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              <button
                className="flex flex-col items-center justify-center p-4 space-y-2 border border-gray-200 rounded-lg hover:bg-gray-100"
                onClick={() => (window.location.href = "/admin/users")}
              >
                <UsersIcon className="w-8 h-8 text-blue-400" />
                <span className="text-sm font-medium">Manage Users</span>
              </button>
              <button
                className="flex flex-col items-center justify-center p-4 space-y-2 border border-gray-200 rounded-lg hover:bg-gray-100"
                onClick={() => (window.location.href = "/admin/kelas")}
              >
                <ClassesIcon className="w-8 h-8 text-indigo-600" />
                <span className="text-sm font-medium">Manage Kelas</span>
              </button>
              <button
                className="flex flex-col items-center justify-center p-4 space-y-2 border border-gray-200 rounded-lg hover:bg-gray-100"
                onClick={() => (window.location.href = "/admin/absensi")}
              >
                <AttendanceIcon className="w-8 h-8 text-green-600" />
                <span className="text-sm font-medium">Manage Absensi</span>
              </button>
              <button
                className="flex flex-col items-center justify-center p-4 space-y-2 border border-gray-200 rounded-lg hover:bg-gray-100"
                onClick={() => (window.location.href = "/admin/role")}
              >
                <RoleIcon className="w-8 h-8 text-purple-600" />
                <span className="text-sm font-medium">Manage Role</span>
              </button>
              <button
                className="flex flex-col items-center justify-center p-4 space-y-2 border border-gray-200 rounded-lg hover:bg-gray-100"
                onClick={() => (window.location.href = "/admin/jadwal")}
              >
                <ScheduleIcon className="w-8 h-8 text-yellow-600" />
                <span className="text-sm font-medium">Manage Jadwal</span>
              </button>
              <button
                className="flex flex-col items-center justify-center p-4 space-y-2 border border-gray-200 rounded-lg hover:bg-gray-100"
                onClick={() => (window.location.href = "/admin/subjek")}
              >
                <SubjectsIcon className="w-8 h-8 text-yellow-800" />
                <span className="text-sm font-medium">Manage Subjek</span>
              </button>
              <button
                className="flex flex-col items-center justify-center p-4 space-y-2 border border-gray-200 rounded-lg hover:bg-gray-100"
                onClick={() => (window.location.href = "/admin/enrollment")}
              >
                <EnrollmentsIcon className="w-8 h-8 text-teal-600" />
                <span className="text-sm font-medium">Manage Enrollments</span>
              </button>
            </div>
          </div>

          {/* 3b. Upcoming Schedule */}
          <div className="bg-white rounded-lg shadow-md p-4">
            <div className="mb-4">
              <h3 className="text-lg font-semibold">Upcoming Schedule</h3>
              <p className="text-sm text-gray-600">5 Jadwal Terdekat</p>
            </div>
            {isLoadingUpcomingSch ? (
              <div className="space-y-4 animate-pulse">
                {Array.from({ length: 3 }).map((_, i) => (
                  <div key={i} className="space-y-2">
                    <div className="h-4 bg-gray-200 rounded w-1/4" />
                    <div className="h-4 bg-gray-200 rounded w-2/3" />
                    <div className="h-3 bg-gray-200 rounded w-1/2" />
                    <div className="h-3 bg-gray-100 rounded w-1/3" />
                  </div>
                ))}
              </div>
            ) : (
              <div className="divide-y divide-gray-200">
                {upcomingSchedule.map((item) => (
                  <div key={item.id} className="py-3">
                    <div className="text-sm font-medium text-blue-400">{item.hari}</div>
                    <div className="text-sm text-gray-800">
                      <span className="font-semibold">{item.kelas}</span> &middot; {item.subject}
                    </div>
                    <div className="text-sm text-gray-600">
                      {item.jam_mulai} - {item.jam_selesai}
                    </div>
                    <div className="text-sm text-gray-500">Guru: {item.guru}</div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
