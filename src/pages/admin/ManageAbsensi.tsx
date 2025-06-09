import { useEffect, useState } from "react";
import { FileDown, Pencil, Plus, Trash2 } from "lucide-react";
import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";

import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { DateTimePicker } from '@mui/x-date-pickers/DateTimePicker';

import dayjs from 'dayjs';

import { DataGrid } from '@mui/x-data-grid';
import type { GridColDef } from '@mui/x-data-grid';

import { Combobox } from "@headlessui/react";
import { ChevronsUpDownIcon, CheckIcon } from "lucide-react";

import { 
  fetchAbsensi, 
  deleteAbsensi, 
  updateAbsensi, 
  createAbsensi,
  type Absensi,
  type StatusAbsensi
} from "@/api/absensi";

import { exportToExcel } from "@/utils/ExportToExcel";
import { fetchJadwalUser, type jadwalUser } from "@/api/jadwal_user";
import DashboardLayout from "@/components/Layout/DashboardLayout";
import { toast } from "sonner";

export default function ManageAbsensis() {
  const [absensi, setAbsensis] = useState<Absensi[]>([]);
  const [enrollment, setEnrollment] = useState<jadwalUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState(false);
  const [editAbsensi, setEditAbsensi] = useState<Absensi | null>(null);
  const [formData, setFormData] = useState({ 
    jadwal_user_id: null as number | null,
    tanggal: null as Date | null,
    status: "" as StatusAbsensi,
  });

  const columns: GridColDef[] = [
    { field: 'id', headerName: 'ID', width: 50, headerAlign: 'center', align: 'center' },
    { field: 'user', headerName: 'Siswa', flex: 1.1, headerAlign: 'center', align: 'center' },
    { field: 'kelas', headerName: 'Kelas', flex: 0.4, headerAlign: 'center', align: 'center' },
    { field: 'code', headerName: 'Kode', flex: 0.5, headerAlign: 'center', align: 'center' },
    { field: 'subjek', headerName: 'Subjek', flex: 0.5, headerAlign: 'center', align: 'center' },
    { field: 'guru', headerName: 'Guru', flex: 1.1, headerAlign: 'center', align: 'center' },
    { field: 'hari', headerName: 'Hari', flex: 0.5, headerAlign: 'center', align: 'center' },
    { field: 'jam_mulai', headerName: 'Mulai', flex: 0.5, headerAlign: 'center', align: 'center' },
    { field: 'jam_selesai', headerName: 'Selesai', flex: 0.5, headerAlign: 'center', align: 'center' },
    { field: 'tanggal', headerName: 'Tanggal', flex: 1, headerAlign: 'center', align: 'center' },
    { field: 'status', headerName: 'Status', flex: 0.5, headerAlign: 'center', align: 'center' },
    {
        field: 'actions',
        headerName: 'Aksi',
        sortable: false,
        filterable: false,
        headerAlign: 'center', 
        align: 'center',
        width: 120, // disarankan diberi width tetap
        renderCell: (params) => (
          <div className="flex items-center justify-center gap-2 h-full">
            <Button
              variant="outline"
              size="icon"
              onClick={() => openEdit(params.row.original)}
            >
              <Pencil className="w-4 h-4" />
              <span className="sr-only">Edit</span>
            </Button>
            <Button
              variant="destructive"
              size="icon"
              onClick={() => handleDelete(params.row.original.id)}
            >
              <Trash2 className="w-4 h-4" />
              <span className="sr-only">Hapus</span>
            </Button>
          </div>
        ),
    },
  ];

  const rows = absensi.map((a) => {
    const jadwalUser = a.jadwal_user;
    const jadwal = jadwalUser.jadwal;
    const user = jadwalUser.user;
    return {
        id: a.id,
        user: user.name,
        kelas: jadwal.kelas.name,
        code: jadwal.subject.code,
        subjek: jadwal.subject.singkatan,
        guru: jadwal.guru.name,
        hari: jadwal.hari,
        jam_mulai: jadwal.jam_mulai.substring(0,5),
        jam_selesai: jadwal.jam_selesai.substring(0,5),
        tanggal: a.tanggal,
        status: a.status,
        original: a,
    };
  });

  useEffect(() => {
    fetchJadwalUser().then(setEnrollment).finally(() => setLoading(false));
    fetchAbsensi().then(setAbsensis).finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    if (!open) {
      setEditAbsensi(null);
      setFormData({ 
        jadwal_user_id: null as number | null,
        tanggal: null as Date | null,
        status: "" as StatusAbsensi,
      });
      setSelectedJU(null);
      setQuery("");
    }
  }, [open]);

  const resetForm = () => {
    setFormData({ 
      jadwal_user_id: null as number | null,
      tanggal: null as Date | null,
      status: "" as StatusAbsensi,
    });
    setSelectedJU(null);
    setEditAbsensi(null);
  };

  const handleDelete = async (id: number) => {
    if (confirm("Yakin ingin menghapus absensi ini?")) {
      await deleteAbsensi(id);
      setAbsensis((prev) => prev.filter((absensi) => absensi.id !== id));
    }
  };

  const handleSubmit = async () => {
    if (
      formData.jadwal_user_id === 0
      || !formData.tanggal || formData.status.trim() == ""
    ){
      toast.error("Semua Kolom Harus Diisi!");
      return;
    };

    const payload = {
      ...formData,
      tanggal: dayjs(formData.tanggal).format('YYYY-MM-DD HH:mm:ss'),
    };

    if (editAbsensi) {
      const updated = await updateAbsensi(editAbsensi.id, payload);
      setAbsensis((prev) => prev.map((u) => (u.id === updated.id ? updated : u)));
    } else {
      const created = await createAbsensi({...payload});
      setAbsensis((prev) => [...prev, created]);
    }

    setOpen(false);
  };

  function parseDate(dateStr: string): Date | null {
    if (!dateStr) return null;
    const parsed = dayjs(dateStr, 'YYYY-MM-DD HH:mm:ss', true); // true = strict parsing
    return parsed.isValid() ? parsed.toDate() : null;
  }

  const openEdit = (absensi: Absensi) => {
    setEditAbsensi(absensi);
    setFormData({
      jadwal_user_id: absensi.jadwal_user_id,
      tanggal: parseDate(absensi.tanggal),
      status: absensi.status,
    });
    setSelectedJU(absensi.jadwal_user_id);
    setOpen(true);
  };

  const [selectedJU, setSelectedJU] = useState<number | null>(null);
  const [query, setQuery] = useState("");

  const filteredEnrollment = enrollment.filter((e) => {
    const label = `${e.user.name} ${e.jadwal.subject.code} ${e.jadwal.kelas.name} ${e.jadwal.subject.singkatan} ${e.jadwal.hari} ${e.jadwal.jam_mulai.substring(0, 5)} ${e.jadwal.jam_selesai.substring(0, 5)}`.toLowerCase();
    return label.includes(query.toLowerCase());
  });

  useEffect(() => {
    setFormData((prev) => ({
      ...prev,
      jadwal_user_id: selectedJU
    }));
  }, [selectedJU]);

  if (loading) return(
    <DashboardLayout>
      <div className="flex justify-center items-center h-screen">
        <p className="text-gray-500">Loading...</p>
      </div>
    </DashboardLayout>
  );

  return (
    <div className="p-4 min-h-screen bg-gray-50">
      <div className="px-4 md:px-8 lg:px-16 xl:px-0 xl:max-w-7xl xl:mx-auto py-4">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-4 space-y-4 md:space-y-0">
          <h1 className="text-2xl font-bold">Kelola Absensi</h1>
          <div className="flex gap-2">
            <Button onClick={() => {
              const dataToExport = rows.map(({ original, ...row }) => row);
              exportToExcel(dataToExport, "absensis");
            }}>
              <FileDown className="w-4 h-4" />
              Ekspor Excel
            </Button>
            <Dialog open={open} onOpenChange={(val) => { setOpen(val); if (!val) resetForm(); }}>
              <DialogTrigger asChild>
                  <Button>
                      <Plus className="w-4 h-4" />
                      Tambah Absensi
                  </Button>
              </DialogTrigger>
              <DialogContent aria-labelledby="dialog-title">
                <DialogHeader>
                  <DialogTitle id="dialog-title">{editAbsensi ? "Edit Absensi" : "Tambah Absensi"}</DialogTitle>
                </DialogHeader>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 py-4">
                  {!editAbsensi && (
                    <div className="grid gap-2 md:col-span-2">
                      <Label htmlFor="user" className="text-sm font-medium text-gray-700">User</Label>
                      <Combobox value={selectedJU} onChange={setSelectedJU}>
                        <div className="relative mt-1">
                          <div className="relative w-full cursor-default overflow-hidden rounded-lg bg-white text-left shadow-md focus:outline-none border py-2 pl-3 pr-10 sm:text-sm">
                            <Combobox.Input
                              className="w-full border-none py-1 pl-1 pr-10 text-sm leading-5 text-gray-900 focus:ring-0"
                              displayValue={(val: number) => {
                                const ju = enrollment.find((e) => e.id === val);
                                if (!ju) return "";
                                return `${ju.user.name} | ${ju.jadwal.subject.code} ${ju.jadwal.kelas.name} (${ju.jadwal.subject.singkatan}) | ${ju.jadwal.hari} ${
                                  ju.jadwal.jam_mulai.substring(0, 5)
                                } - ${ju.jadwal.jam_selesai.substring(0, 5)}`;
                              }}
                              placeholder="Cari dan pilih User – Jadwal"
                              onChange={(e) => setQuery(e.target.value)}
                            />
                            <Combobox.Button className="absolute inset-y-0 right-0 flex items-center pr-2">
                              <ChevronsUpDownIcon className="h-5 w-5 text-gray-400" aria-hidden="true" />
                            </Combobox.Button>
                          </div>
                          {filteredEnrollment.length > 0 && (
                            <Combobox.Options className="absolute z-10 mt-1 max-h-60 w-full overflow-auto rounded-md bg-white py-1 text-base shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none sm:text-sm">
                              {filteredEnrollment.map((e) => (
                                <Combobox.Option
                                  key={e.id}
                                  value={e.id}
                                  className={({ active }) =>
                                    `relative cursor-default select-none py-2 pl-3 pr-9 ${
                                      active ? "bg-blue-400 text-white" : "text-gray-900"
                                    }`
                                  }
                                >
                                  {({ selected, active }) => (
                                    <>
                                      <span
                                        className={`block truncate ${
                                          selected ? "font-semibold" : "font-normal"
                                        }`}
                                      >
                                        {e.user.name} | {e.jadwal.subject.code} {e.jadwal.kelas.name} ({e.jadwal.subject.singkatan}) |{" "}
                                        {e.jadwal.hari} {e.jadwal.jam_mulai.substring(0, 5)} – {e.jadwal.jam_selesai.substring(0, 5)}
                                      </span>
                                      {selected && (
                                        <span
                                          className={`absolute inset-y-0 right-0 flex items-center pr-4 ${
                                            active ? "text-white" : "text-blue-400"
                                          }`}
                                        >
                                          <CheckIcon className="h-5 w-5" aria-hidden="true" />
                                        </span>
                                      )}
                                    </>
                                  )}
                                </Combobox.Option>
                              ))}
                            </Combobox.Options>
                          )}
                          {filteredEnrollment.length === 0 && query !== "" && (
                            <div className="absolute z-10 mt-1 w-full bg-white py-2 px-3 text-sm text-gray-500">
                              Tidak ada hasil untuk &quot;{query}&quot;
                            </div>
                          )}
                        </div>
                      </Combobox>
                  </div>
                  )}

                  <div className="grid gap-2 md:col-span-2">
                    <Label className="text-sm font-semibold text-gray-700">Status Absen</Label>
                    <Select
                      value={formData.status}
                      onValueChange={(val: StatusAbsensi) => setFormData({ ...formData, status: val })}
                    >
                      <SelectTrigger className="rounded-lg border px-3 py-2">
                        <SelectValue placeholder="Pilih Status Absen" />
                      </SelectTrigger>
                      <SelectContent>
                        {['hadir', 'sakit', 'izin', 'alpa'].map((status) => (
                          <SelectItem key={status} value={status}>
                          {status}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="grid gap-2 md:col-span-2">
                    <Label className="text-sm font-semibold text-gray-700">Tanggal</Label>
                    <LocalizationProvider dateAdapter={AdapterDateFns}>
                      <DateTimePicker
                        value={formData.tanggal}
                        onChange={(val) => setFormData({ ...formData, tanggal: val })}
                        slotProps={{
                          popper: {
                            modifiers: [
                              {
                                name: 'offset',
                                options: {
                                  offset: [0, 10],
                                },
                              },
                            ],
                            placement: 'bottom-start',
                            disablePortal: true,
                          },
                        }}
                      />
                    </LocalizationProvider>
                  </div>
                </div>
                <DialogFooter>
                  <Button onClick={handleSubmit}>{editAbsensi ? "Simpan" : "Tambah"}</Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>
        </div>

        <div className="overflow-x-auto rounded shadow bg-white">
          <div className="min-w-full">
            <DataGrid
              rows={rows}
              columns={columns}
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
