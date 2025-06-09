import { useEffect, useState } from 'react';
import { fetchJadwal, type Jadwal } from '@/api/jadwal';
import { fetchUsersBySchedule } from '@/api/user';
import { useAuth } from '@/context/AuthContext';
import { useNavigate } from 'react-router-dom';

export default function DashboardGuru() {
  const navigate = useNavigate();

  const { user } = useAuth();
  const [classes, setClasses] = useState<Jadwal[]>([]);
  const [studentCounts, setStudentCounts] = useState<Record<number, number>>({});
  
  useEffect(() => {
    if (!user) return;
    fetchJadwal().then(data => {
      const mine = data.filter(j => j.guru.id === user.id);
      setClasses(mine);
      mine.forEach(j => {
        fetchUsersBySchedule(j.id).then(arr => {
          setStudentCounts(prev => ({ ...prev, [j.id]: arr.length }));
        });
      });
    });
  }, [user]);

  return (
    <div className="p-8">
      <h1 className="text-3xl font-bold mb-6">Dashboard Guru</h1>
      <div className="grid gap-6 grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
        {classes.map((cls) => (
          <div key={cls.id} className="bg-white rounded-lg shadow p-6 hover:shadow-lg transition">
            <h2 className="text-xl font-semibold mb-2">{cls.subject.name} - {cls.kelas.name}</h2>
            <p className="text-sm">Hari: {cls.hari}</p>
            <p className="text-sm">Jam: {cls.jam_mulai.slice(0,5)} - {cls.jam_selesai.slice(0,5)}</p>
            <p className="text-sm">Peserta: {studentCounts[cls.id] ?? '...'}</p>
            <div className="mt-4 flex space-x-2">
              <button
                className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
                onClick={() => navigate(`/kelas/${cls.id}`)}
              >
                Buka Kelas
              </button>
              <button
                className="px-4 py-2 border border-blue-600 text-blue-600 rounded hover:bg-blue-50"
                onClick={() => navigate(`/kelas/${cls.id}/peserta`)}
              >
                Peserta
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}