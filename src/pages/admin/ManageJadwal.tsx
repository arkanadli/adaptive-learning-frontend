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
import { TimePicker } from '@mui/x-date-pickers/TimePicker';

import { DataGrid } from "@mui/x-data-grid";
import type { GridColDef } from "@mui/x-data-grid";

import { Combobox } from "@headlessui/react";
import { ChevronsUpDownIcon, CheckIcon } from "lucide-react";

import { 
  fetchJadwal, 
  deleteJadwal, 
  updateJadwal, 
  createJadwal,
  formatTime,
  type Jadwal
} from "@/api/jadwal";

import { 
  fetchKelas,
  type Kelas
} from "@/api/kelas";

import { 
  fetchSubjek,
  type Subjek
} from "@/api/subjek";

import { 
  fetchGurus,
  type User
} from "@/api/user";

import { exportToExcel } from "@/utils/ExportToExcel";
import DashboardLayout from "@/components/Layout/DashboardLayout";
import { toast } from "sonner";

export default function ManageJadwals() {
  const [jadwal, setJadwals] = useState<Jadwal[]>([]);
  const [kelas, setKelas] = useState<Kelas[]>([]);
  const [subjek, setSubjek] = useState<Subjek[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState(false);
  const [editJadwal, setEditJadwal] = useState<Jadwal | null>(null);
  const [formData, setFormData] = useState({ 
    kelas_id: null as number | null,
    subject_id: null as number | null,
    guru_id: null as number | null,
    hari: "",
    jam_mulai: null as Date | null,
    jam_selesai: null as Date | null,
  });

  const columns: GridColDef[] = [
    { field: 'id', headerName: 'ID', width: 70, headerAlign: 'center', align: 'center' },
    { field: 'kelas', headerName: 'Kelas', flex: 0.5, headerAlign: 'center', align: 'center' },
    { field: 'code', headerName: 'Kode', flex: 0.5, headerAlign: 'center', align: 'center' },
    { field: 'subjek', headerName: 'Subjek', flex: 1.5, headerAlign: 'center', align: 'center' },
    { field: 'guru', headerName: 'Guru', flex: 1.5, headerAlign: 'center', align: 'center' },
    { field: 'hari', headerName: 'Hari', flex: 0.5, headerAlign: 'center', align: 'center' },
    { field: 'jam_mulai', headerName: 'Mulai', flex: 0.5, headerAlign: 'center', align: 'center' },
    { field: 'jam_selesai', headerName: 'Selesai', flex: 0.5, headerAlign: 'center', align: 'center' },
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

  const rows = jadwal.map((j) => {
    return {
        id: j.id,
        kelas: j.kelas.name,
        code: j.subject.code,
        subjek: j.subject.name,
        guru: j.guru.name,
        hari: j.hari,
        jam_mulai: j.jam_mulai.substring(0, 5),
        jam_selesai: j.jam_selesai.substring(0, 5),
        original: j,
    };
  });

  const hariList = ["Senin", "Selasa", "Rabu", "Kamis", "Jumat", "Sabtu", "Minggu"]

  useEffect(() => {
    fetchKelas().then(setKelas).catch(console.error);
    fetchSubjek().then(setSubjek).catch(console.error);
    fetchGurus().then(setUsers).catch(console.error);
    fetchJadwal().then(setJadwals).finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    if (!open) {
      setEditJadwal(null);
      setFormData({ 
        kelas_id: null as number | null,
        subject_id: null as number | null,
        guru_id: null as number | null,
        hari: "",
        jam_mulai: null as Date | null,
        jam_selesai: null as Date | null,
      });

      setSelectedKelas(null);
      setSelectedSubjek(null);
      setSelectedGuru(null);
      setQueryKelas("");
      setQuerySubjek("");
      setQueryGuru("");
    }
  }, [open]);

  const resetForm = () => {
    setFormData({ 
        kelas_id: null as number | null,
        subject_id: null as number | null,
        guru_id: null as number | null,
        hari: "",
        jam_mulai: null as Date | null,
        jam_selesai: null as Date | null,
    });
    setEditJadwal(null);
  };

  const handleDelete = async (id: number) => {
    if (confirm("Yakin ingin menghapus jadwal ini?")) {
      await deleteJadwal(id);
      setJadwals((prev) => prev.filter((jadwal) => jadwal.id !== id));
    }
  };

  const handleSubmit = async () => {
    if (
      formData.kelas_id == 0 || formData.subject_id == 0 || formData.guru_id == 0 
      || formData.hari.trim() === "" || !formData.jam_mulai || !formData.jam_selesai
    ){
      toast.error("Semua Kolom Harus Diisi!");
      return;
    };

    if (formData.jam_mulai >= formData.jam_selesai) {
      toast.error("Jam mulai harus lebih awal dari jam selesai.");
      return;
    }

    const payload = {
      ...formData,
      jam_mulai: formatTime(formData.jam_mulai),
      jam_selesai: formatTime(formData.jam_selesai),
    };

    if (editJadwal) {
      const updated = await updateJadwal(editJadwal.id, payload);
      setJadwals((prev) => prev.map((u) => (u.id === updated.id ? updated : u)));
      toast.success("Jadwal berhasil diperbarui");
    } else {
      const created = await createJadwal({...payload});
      setJadwals((prev) => [...prev, created]);
      toast.success("Jadwal berhasil ditambahkan");
    }

    setOpen(false); // Ini akan trigger resetForm via onOpenChange
  };

  const parseTimeString = (timeStr: string): Date => {
    const [hours, minutes] = timeStr.split(":").map(Number);
    const now = new Date();
    now.setHours(hours, minutes, 0, 0);
    return now;
  };

  const openEdit = (jadwal: Jadwal) => {
    setEditJadwal(jadwal);
    setFormData({
      kelas_id: jadwal.kelas_id,
      subject_id: jadwal.subject_id,
      guru_id: jadwal.guru_id,
      hari: jadwal.hari,
      jam_mulai: parseTimeString(jadwal.jam_mulai),
      jam_selesai: parseTimeString(jadwal.jam_selesai),
    });
    setSelectedGuru(jadwal.guru_id);
    setSelectedKelas(jadwal.kelas_id);
    setSelectedSubjek(jadwal.subject_id);
    setOpen(true);
  };

  const [selectedKelas, setSelectedKelas] = useState<number | null>(null);
  const [queryKelas, setQueryKelas] = useState("");

  const filteredKelas = kelas.filter((e) => {
    const label = `${e.name}`.toLowerCase();
    return label.includes(queryKelas.toLowerCase());
  });

  useEffect(() => {
    setFormData((prev) => ({
      ...prev,
      kelas_id: selectedKelas
    }));
  }, [selectedKelas]);

  const [selectedSubjek, setSelectedSubjek] = useState<number | null>(null);
  const [querySubjek, setQuerySubjek] = useState("");

  const filteredSubjek = subjek.filter((e) => {
    const label = `${e.name}`.toLowerCase();
    return label.includes(querySubjek.toLowerCase());
  });

  useEffect(() => {
    setFormData((prev) => ({
      ...prev,
      subject_id: selectedSubjek
    }));
  }, [selectedSubjek]);
  
  const [selectedGuru, setSelectedGuru] = useState<number | null>(null);
  const [queryGuru, setQueryGuru] = useState("");

  const filteredGuru = users.filter((e) => {
    const label = `${e.name}`.toLowerCase();
    return label.includes(queryGuru.toLowerCase());
  });

  useEffect(() => {
    setFormData((prev) => ({
      ...prev,
      guru_id: selectedGuru
    }));
  }, [selectedGuru]);

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
          <h1 className="text-2xl font-bold">Kelola Jadwal</h1>
            <div className="flex gap-2">
              <Button onClick={() => {
                const dataToExport = rows.map(({ original, ...row }) => row);
                exportToExcel(dataToExport, "jadwals");
              }}>
                <FileDown className="w-4 h-4" />
                Ekspor Excel
              </Button>
            <Dialog open={open} onOpenChange={(val) => { setOpen(val); if (!val) resetForm(); }}>
              <DialogTrigger asChild>
                <Button>
                  <Plus className="w-4 h-4" />
                  Tambah Jadwal
                </Button>
              </DialogTrigger>
              <DialogContent aria-labelledby="dialog-title" aria-describedby={undefined}>
                <DialogHeader>
                  <DialogTitle id="dialog-title">{editJadwal ? "Edit Jadwal" : "Tambah Jadwal"}</DialogTitle>
                </DialogHeader>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 py-4">
                  <div className="grid gap-2 md:col-span-2">
                    <Label htmlFor="subjek" className="text-sm font-medium text-gray-700">Kelas</Label>
                    <Combobox value={selectedKelas} onChange={setSelectedKelas}>
                        <div className="relative mt-1">
                            <div className="relative w-full cursor-default overflow-hidden rounded-lg bg-white text-left shadow-md focus:outline-none border py-2 pl-3 pr-10 sm:text-sm">
                            <Combobox.Input
                                className="w-full border-none py-1 pl-1 pr-10 text-sm leading-5 text-gray-900 focus:ring-0"
                                displayValue={(val: number) => {
                                const k = kelas.find((k) => k.id === val);
                                if (!k) return "";
                                return `${k.name}`;
                                }}
                                placeholder="Cari dan pilih kelas"
                                onChange={(e) => setQueryKelas(e.target.value)}
                            />
                            <Combobox.Button className="absolute inset-y-0 right-0 flex items-center pr-2">
                                <ChevronsUpDownIcon className="h-5 w-5 text-gray-400" aria-hidden="true" />
                            </Combobox.Button>
                            </div>
                            {filteredKelas.length > 0 && (
                            <Combobox.Options className="absolute z-10 mt-1 max-h-60 w-full overflow-auto rounded-md bg-white py-1 text-base shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none sm:text-sm">
                                {filteredKelas.map((e) => (
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
                                        {e.name}
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
                            {filteredKelas.length === 0 && queryKelas !== "" && (
                            <div className="absolute z-10 mt-1 w-full bg-white py-2 px-3 text-sm text-gray-500">
                                Tidak ada hasil untuk &quot;{queryKelas}&quot;
                            </div>
                            )}
                        </div>
                      </Combobox>
                  </div>

                  <div className="grid gap-2 md:col-span-2">
                    <Label htmlFor="subjek" className="text-sm font-medium text-gray-700">Subjek</Label>
                    <Combobox value={selectedSubjek} onChange={setSelectedSubjek}>
                        <div className="relative mt-1">
                            <div className="relative w-full cursor-default overflow-hidden rounded-lg bg-white text-left shadow-md focus:outline-none border py-2 pl-3 pr-10 sm:text-sm">
                            <Combobox.Input
                                className="w-full border-none py-1 pl-1 pr-10 text-sm leading-5 text-gray-900 focus:ring-0"
                                displayValue={(val: number) => {
                                const s = subjek.find((s) => s.id === val);
                                if (!s) return "";
                                return `${s.name}`;
                                }}
                                placeholder="Cari dan pilih subjek"
                                onChange={(e) => setQuerySubjek(e.target.value)}
                            />
                            <Combobox.Button className="absolute inset-y-0 right-0 flex items-center pr-2">
                                <ChevronsUpDownIcon className="h-5 w-5 text-gray-400" aria-hidden="true" />
                            </Combobox.Button>
                            </div>
                            {filteredSubjek.length > 0 && (
                            <Combobox.Options className="absolute z-10 mt-1 max-h-60 w-full overflow-auto rounded-md bg-white py-1 text-base shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none sm:text-sm">
                                {filteredSubjek.map((e) => (
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
                                        {e.name}
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
                            {filteredSubjek.length === 0 && querySubjek !== "" && (
                            <div className="absolute z-10 mt-1 w-full bg-white py-2 px-3 text-sm text-gray-500">
                                Tidak ada hasil untuk &quot;{querySubjek}&quot;
                            </div>
                            )}
                        </div>
                      </Combobox>
                  </div>

                  <div className="grid gap-2 md:col-span-2">
                    <Label htmlFor="user" className="text-sm font-medium text-gray-700">Guru</Label>
                    <Combobox value={selectedGuru} onChange={setSelectedGuru}>
                        <div className="relative mt-1">
                            <div className="relative w-full cursor-default overflow-hidden rounded-lg bg-white text-left shadow-md focus:outline-none border py-2 pl-3 pr-10 sm:text-sm">
                            <Combobox.Input
                                className="w-full border-none py-1 pl-1 pr-10 text-sm leading-5 text-gray-900 focus:ring-0"
                                displayValue={(val: number) => {
                                const u = users.find((u) => u.id === val);
                                if (!u) return "";
                                return `${u.name}`;
                                }}
                                placeholder="Cari dan pilih guru"
                                onChange={(e) => setQueryGuru(e.target.value)}
                            />
                            <Combobox.Button className="absolute inset-y-0 right-0 flex items-center pr-2">
                                <ChevronsUpDownIcon className="h-5 w-5 text-gray-400" aria-hidden="true" />
                            </Combobox.Button>
                            </div>
                            {filteredGuru.length > 0 && (
                            <Combobox.Options className="absolute z-10 mt-1 max-h-60 w-full overflow-auto rounded-md bg-white py-1 text-base shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none sm:text-sm">
                                {filteredGuru.map((e) => (
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
                                        {e.name}
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
                            {filteredGuru.length === 0 && queryGuru !== "" && (
                            <div className="absolute z-10 mt-1 w-full bg-white py-2 px-3 text-sm text-gray-500">
                                Tidak ada hasil untuk &quot;{queryGuru}&quot;
                            </div>
                            )}
                        </div>
                      </Combobox>
                  </div>

                  <div className="grid gap-2 md:col-span-2">
                    <Label htmlFor="hari" className="text-sm font-medium text-gray-700">Hari</Label>
                    <Select
                      value={formData.hari}
                      onValueChange={(val) => setFormData({ ...formData, hari: val })}
                    >
                      <SelectTrigger className="rounded-lg border px-3 py-2">
                        <SelectValue placeholder="Pilih Hari" />
                      </SelectTrigger>
                      <SelectContent>
                        {hariList.map((hari) => (
                          <SelectItem key={hari} value={hari}>
                            {hari}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="grid gap-2">
                    <Label htmlFor="jam_mulai" className="text-sm font-medium text-gray-700">Jam Mulai</Label>
                    <LocalizationProvider dateAdapter={AdapterDateFns}>
                      <TimePicker
                        value={formData.jam_mulai}
                        onChange={(val) => setFormData({ ...formData, jam_mulai: val })}
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

                  <div className="grid gap-2">
                    <Label htmlFor="jam_selesai" className="text-sm font-medium text-gray-700">Jam Selesai</Label>
                    <LocalizationProvider dateAdapter={AdapterDateFns}>
                      <TimePicker
                        value={formData.jam_selesai}
                        onChange={(val) => setFormData({ ...formData, jam_selesai: val })}
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
                  <Button onClick={handleSubmit}>{editJadwal ? "Simpan" : "Tambah"}</Button>
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
