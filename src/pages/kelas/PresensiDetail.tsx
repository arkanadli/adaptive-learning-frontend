import { useEffect, useMemo, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";

import { ArrowRight } from "lucide-react";

import { Button } from "@/components/ui/button";
import { toast } from "sonner";

import { DataGrid } from "@mui/x-data-grid";
import type { GridColDef } from "@mui/x-data-grid";
import { RadioGroup, FormControlLabel, Radio } from '@mui/material';

import dayjs from "dayjs";
import isBetween from "dayjs/plugin/isBetween";
dayjs.extend(isBetween);

import { 
  createAbsensi,
  fetchAbsensiBySchedule, 
  updateAbsensi, 
  type Absensi,
  type StatusAbsensi
} from "@/api/absensi";

import { fetchJadwalById, type Jadwal } from "@/api/jadwal"

import { useAuth } from "@/context/AuthContext";

const statusOptions = [
  { value: 'hadir', label: 'P' },
  { value: 'izin', label: 'E' },
  { value: 'sakit', label: 'S' },
  { value: 'alpa', label: 'A' },
];

export default function PresensiDetail() {

  const navigate = useNavigate();

  const { jadwal_id } = useParams<{ jadwal_id: string }>();
  const { user } = useAuth();
  const [absensis, setAbsensis] = useState<Absensi[] | null>(null);
  const [jadwal, setJadwal] = useState<Jadwal | null>(null);
  const [loading, setLoading] = useState(true);

  const role = user?.role.name.toLowerCase();
  const isGuru = role === "guru";
  const isSiswa = role === "siswa";

  const [formData, setFormData] = useState({ 
    jadwal_user_id: 0,
    tanggal: "", 
    status: "" as StatusAbsensi
  });

  useEffect(() => {
    fetchJadwalById(Number(jadwal_id)).then(setJadwal).catch((err) => console.error(err));
    if(isSiswa){
        fetchAbsensiBySchedule(Number(jadwal_id), user?.id).then(setAbsensis).finally(() => setLoading(false));
    } else {
        fetchAbsensiBySchedule(Number(jadwal_id)).then(setAbsensis).finally(() => setLoading(false));
    }
  }, []);

    const baseColumns: GridColDef[] = [
        { field: 'no', headerName: 'No.', width: 70, headerAlign: 'center', align: 'center' },
        { field: 'name', headerName: 'Nama', flex: 2, headerAlign: 'center', align: 'center' },
        { 
            field: 'status', 
            headerName: 'Status',  
            headerAlign: 'center', 
            align: 'center',
            width: 240,

            renderCell: (params: any) => {
                const row = params.row;

                const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
                    const newStatus = event.target.value;

                    if (isGuru && !row.isPlaceholder) {
                    try {
                        updateAbsensi(row.id, {
                        jadwal_user_id: row.jadwal_user_id,
                        tanggal: row.waktu,
                        status: newStatus as StatusAbsensi,
                        });

                        setAbsensis(prev =>
                        prev?.map(a =>
                            a.id === row.id ? { ...a, status: newStatus as StatusAbsensi } : a
                        ) ?? null
                        );

                        console.log(`Guru mengubah status siswa ${row.name} menjadi ${newStatus}`);
                        toast.success(`Status ${row.name} pada ${row.waktu} berhasil diperbarui`);
                    } catch (err) {
                        console.error("Gagal mengupdate status:", err);
                        toast.error("Gagal mengupdate status.");
                    }
                    } else if (row.isPlaceholder) {
                    setFormData(prev => ({
                        ...prev,
                        status: newStatus as StatusAbsensi,
                    }));
                    }
                };

                const selectedValue = row.isPlaceholder ? formData.status : row.status;

                return (
                    <RadioGroup
                    row
                    value={selectedValue}
                    onChange={handleChange}
                    name={`status-${row.user_id}`}
                    >
                    {statusOptions.map(opt => (
                        <FormControlLabel
                        key={opt.value}
                        value={opt.value}
                        control={
                            <Radio
                            size="small"
                            disabled={!isGuru && !row.isPlaceholder}
                            />
                        }
                        label={opt.label}
                        />
                    ))}
                    </RadioGroup>
                );
            },
        },
        { field: 'waktu', headerName: 'Waktu Presensi', flex: 1, headerAlign: 'center', align: 'center' },
    ];

    if (isGuru) {
        baseColumns.splice(1, 0,
            { field: 'user_id', headerName: 'ID', width: 80, headerAlign: 'center', align: 'center' },
            { field: 'email', headerName: 'Email', flex: 1.5, headerAlign: 'center', align: 'center' }
        );
    }

    const rows = useMemo(() => {
        if (!absensis || !jadwal) return [];

        const dataRows = absensis.map((a, index) => {
            const u = a.jadwal_user.user;
            return {
                no: index + 1,
                user_id: u.id,
                name: u.name,
                email: u.email,
                status: a.status,
                waktu: dayjs(a.tanggal).format('YYYY-MM-DD HH:mm:ss'),
                id: a.id,
                jadwal_user_id: a.jadwal_user_id,
                isPlaceholder: false,
                bisaPresensi: false,
                original: a,
            };
        });

        const now = dayjs();
        const jadwalDay = jadwal.hari.toLowerCase();

        const dayMap: Record<string, number> = {
            "senin": 1,
            "selasa": 2,
            "rabu": 3,
            "kamis": 4,
            "jumat": 5,
            "sabtu": 6,
            "minggu": 0,
        };

        const targetDay = dayMap[jadwalDay];

        if (isSiswa && targetDay !== undefined) {
            let nextDate = now.day(targetDay);
            if (nextDate.isBefore(now, "day")) nextDate = nextDate.add(1, "week");

            const sudahAda = absensis.some(a => dayjs(a.tanggal).isSame(nextDate, "day"));
            const sudahPresensiMingguIni = absensis.some(a => dayjs(a.tanggal).isSame(now, "week"));

            const mulai = dayjs(`${nextDate.format("YYYY-MM-DD")} ${jadwal.jam_mulai}`);
            const selesai = dayjs(`${nextDate.format("YYYY-MM-DD")} ${jadwal.jam_selesai}`);
            const sekarangBisaPresensi = now.isAfter(mulai) && now.isBefore(selesai);

            if (!sudahAda && !sudahPresensiMingguIni) {
                dataRows.push({
                    no: dataRows.length + 1,
                    user_id: user!.id,
                    name: user!.name,
                    email: user!.email,
                    status: "" as StatusAbsensi,
                    waktu: `${nextDate.format("YYYY-MM-DD")} ${jadwal.jam_mulai}`,
                    isPlaceholder: true,
                    bisaPresensi: sekarangBisaPresensi,
                    jadwal_user_id: dataRows[dataRows.length - 1].jadwal_user_id,
                    id: 0,
                    original: dataRows[dataRows.length - 1].original,
                });
            }
        }

        return dataRows;
    }, [absensis, jadwal]);

    if (isSiswa) {
        baseColumns.push({
            field: 'actions',
            headerName: 'Aksi',
            sortable: false,
            filterable: false,
            headerAlign: 'center',
            align: 'center',
            width: 200,
            renderCell: (params: any) => {
                const row = params.row;

                if (!row.isPlaceholder) return null;

                return (
                    <Button
                        variant="default"
                        size="sm"
                        disabled={!row.bisaPresensi}
                        onClick={() => {
                            console.log("Row:", row);

                            const payload = {
                                jadwal_user_id: row.jadwal_user_id,
                                tanggal: dayjs().format("YYYY-MM-DD HH:mm:ss"),
                                status: formData.status,
                            };

                            if (
                                payload.jadwal_user_id === 0 ||
                                !payload.tanggal ||
                                !payload.status
                            ) {
                                toast.error("Semua kolom harus diisi sebelum presensi.");
                                return;
                            }

                            handleSubmit(payload);
                        }}
                        className="text-xs"
                    >
                    <ArrowRight className="w-4 h-4 mr-1" />
                        {row.bisaPresensi ? "Submit Presensi" : "Belum Waktunya"}
                    </Button>
                );
            },
        });
    }

  const handleSubmit = async (data: typeof formData) => {
    if (
      data.jadwal_user_id === 0
      || !data.tanggal || data.status.trim() == ""
    ){
      toast.error("Semua Kolom Harus Diisi!");
      return;
    };

    const created = await createAbsensi(data);
    setAbsensis((prev) => (prev ? [...prev, created] : [created]));
  };

  if (loading) return(
    <div className="flex justify-center items-center h-screen">
        <p className="text-gray-500">Loading...</p>
    </div>
  );

  return (
    <div className="p-4 min-h-screen bg-gray-50">
      <div className="px-4 md:px-8 lg:px-16 xl:px-0 xl:max-w-7xl xl:mx-auto py-4">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-4 space-y-4 md:space-y-0">
          <div className="flex items-center gap-4">
            <h1 className="text-2xl font-bold">Presensi</h1>
          </div>
          <div className="flex gap-2">
            <Button
                variant="outline"
                onClick={() => navigate(`/kelas/${jadwal_id}`)}
            >
                ← Kembali
            </Button>
          </div>
        </div>

        <div className="overflow-x-auto rounded shadow bg-white">
          <div className="min-w-full">
            <DataGrid
                rows={rows}
                columns={baseColumns}
                initialState={{
                    pagination: {
                    paginationModel: {
                        pageSize: 10,
                        page: 0,
                    },
                    },
                }}
                pageSizeOptions={[10, 25, 50]}
                disableRowSelectionOnClick
            />
          </div>
        </div>
      </div>
    </div>
  );
}
