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

import { DataGrid } from "@mui/x-data-grid";
import type { GridColDef } from "@mui/x-data-grid";

import { Combobox } from "@headlessui/react";
import { ChevronsUpDownIcon, CheckIcon } from "lucide-react";

import {
  fetchJadwalUser,
  deleteJadwalUser,
  updateJadwalUser,
  createJadwalUser,
  type jadwalUser,
} from "@/api/jadwal_user";

import { 
  fetchJadwal, 
  type Jadwal 
} from "@/api/jadwal";

import { 
  fetchSiswas,
  type User
} from "@/api/user";

import { exportToExcel } from "@/utils/ExportToExcel";
import DashboardLayout from "@/components/Layout/DashboardLayout";
import { toast } from "sonner";

export default function ManageEnrollments() {
  const [enrollment, setEnrollments] = useState<jadwalUser[]>([]);
  const [jadwal, setJadwal] = useState<Jadwal[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);

  // Modal & form state
  const [open, setOpen] = useState(false);
  const [editEnrollment, setEditEnrollment] = useState<jadwalUser | null>(null);
  const [formData, setFormData] = useState({
    user_id: null as number | null,
    jadwal_id: null as number | null,
    difficulty_level: null as number | null,
  });

  // Combobox state
  const [selectedJadwal, setSelectedJadwal] = useState<number | null>(null);
  const [queryJadwal, setQueryJadwal] = useState("");

  const [selectedUser, setSelectedUser] = useState<number | null>(null);
  const [queryUser, setQueryUser] = useState("");

  const filteredJadwal = jadwal.filter((j) => {
    const label = `${j.kelas.name || "?"} | ${j.subject.name || "?"} | ${j.hari || "?"} | ${
      j.jam_mulai
    } - ${j.jam_selesai}`.toLowerCase();
    return label.includes(queryJadwal.toLowerCase());
  });

  const filteredUser = users.filter((u) => {
    const label = u.name.toLowerCase();
    return label.includes(queryUser.toLowerCase());
  });

  useEffect(() => {
    if (editEnrollment) {
      setSelectedJadwal(editEnrollment.jadwal_id);
      const jadwalData = jadwal.find((j) => j.id === editEnrollment.jadwal_id);
      if (jadwalData) {
        const label = `${jadwalData.kelas.name} | ${jadwalData.subject.name} | ${jadwalData.hari} | ${jadwalData.jam_mulai} - ${jadwalData.jam_selesai}`;
        setQueryJadwal(label);
      }
    }
  }, [editEnrollment, jadwal]);

  useEffect(() => {
    setFormData((prev) => ({
      ...prev,
      jadwal_id: selectedJadwal,
    }));
  }, [selectedJadwal]);

  useEffect(() => {
    setFormData((prev) => ({
      ...prev,
      user_id: selectedUser,
    }));
  }, [selectedUser]);

  useEffect(() => {
    if (!open) {
      setEditEnrollment(null);
      setFormData({ user_id: null, jadwal_id: null, difficulty_level: null });
      setSelectedJadwal(null);
      setQueryJadwal("");
      setSelectedUser(null);
      setQueryUser("");
    }
  }, [open]);

  useEffect(() => {
    fetchJadwal().then(setJadwal).catch(console.error);
    fetchSiswas().then(setUsers).catch(console.error);
    fetchJadwalUser()
      .then(setEnrollments)
      .finally(() => setLoading(false));
  }, []);

  const rows = enrollment.map((e) => {
    const j = e.jadwal;
    return {
      id: e.id,
      user: e.user.name,
      kelas: j.kelas.name,
      code: j.subject.code,
      subjek: j.subject.singkatan,
      guru: j.guru.name,
      hari: j.hari,
      jam_mulai: j.jam_mulai.substring(0, 5),
      jam_selesai: j.jam_selesai.substring(0, 5),
      original: e,
    };
  });

  const columns: GridColDef[] = [
    { field: "id", headerName: "ID", width: 70, headerAlign: "center", align: "center" },
    { field: "user", headerName: "Siswa", flex: 1.25, headerAlign: "center", align: "center" },
    { field: "kelas", headerName: "Kelas", flex: 0.5, headerAlign: "center", align: "center" },
    { field: "code", headerName: "Kode", flex: 0.5, headerAlign: "center", align: "center" },
    { field: "subjek", headerName: "Subjek", flex: 0.5, headerAlign: "center", align: "center" },
    { field: "guru", headerName: "Guru", flex: 1.25, headerAlign: "center", align: "center" },
    { field: "hari", headerName: "Hari", flex: 0.5, headerAlign: "center", align: "center" },
    {
      field: "jam_mulai",
      headerName: "Mulai",
      flex: 0.5,
      headerAlign: "center",
      align: "center",
    },
    {
      field: "jam_selesai",
      headerName: "Selesai",
      flex: 0.5,
      headerAlign: "center",
      align: "center",
    },
    {
      field: "actions",
      headerName: "Aksi",
      sortable: false,
      filterable: false,
      headerAlign: "center",
      align: "center",
      width: 120,
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

  const handleDelete = async (id: number) => {
    if (confirm("Yakin ingin menghapus enrollment ini?")) {
      await deleteJadwalUser(id);
      setEnrollments((prev) => prev.filter((en) => en.id !== id));
    }
  };

  const openEdit = (en: jadwalUser) => {
    setEditEnrollment(en);
    setFormData({
      user_id: en.user_id,
      jadwal_id: en.jadwal_id,
      difficulty_level: 1,
    });
    setSelectedJadwal(en.jadwal_id);
    setSelectedUser(en.user_id);
    setOpen(true);
  };

  const handleSubmit = async () => {
    if (!formData.jadwal_id || !formData.user_id) {
      console.log(formData);
      toast.error("Anda harus memilih dulu Jadwal & User!");
      return;
    }

    if (editEnrollment) {
      // Edit existing enrollment: langsung perbarui
      const updated = await updateJadwalUser(editEnrollment.id, formData);
      setEnrollments((prev) => prev.map((u) => (u.id === updated.id ? updated : u)));
      toast.success(`Kelas berhasil diperbarui`);
      setOpen(false);
      return;
    }

    // Jika menambahkan baru (tahap 2), langsung create satu‐satu
    const created = await createJadwalUser(formData);
    setEnrollments((prev) => [...prev, created]);
    toast.success(`Berhasil enrroll user`);

    // Clear hanya “user” biarkan jadwal tetap terpilih agar bisa add lagi
    setSelectedUser(null);
    setQueryUser("");
    setFormData((prev) => ({ ...prev, user_id: null }));
  };

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
        {/* Judul + Tombol Ekspor + Tombol Modal */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-4 space-y-4 md:space-y-0">
          <h1 className="text-2xl font-bold">Kelola Enrollment</h1>
          <div className="flex gap-2">
            <Button
              onClick={() => {
                const dataToExport = rows.map(({ original, ...row }) => row);
                exportToExcel(dataToExport, "enrollments");
              }}
            >
              <FileDown className="w-4 h-4" />
              Ekspor Excel
            </Button>
            <Dialog open={open} onOpenChange={(val) => setOpen(val)}>
              <DialogTrigger asChild>
                <Button>
                  <Plus className="w-4 h-4" />
                  Tambah Enrollment
                </Button>
              </DialogTrigger>
                {/* Bagian dalam <DialogContent> */}
                <DialogContent aria-labelledby="dialog-title">
                <DialogHeader>
                    <DialogTitle id="dialog-title">
                    {editEnrollment ? "Edit Enrollment" : "Tambah Enrollment"}
                    </DialogTitle>
                </DialogHeader>

                <div className="grid grid-cols-1 md:grid-cols-4 gap-4 py-4">
                    {/* -------- TAHAP 1: Pilih Jadwal seperti sebelumnya -------- */}
                    <div className="grid gap-2 md:col-span-4">
                    <Label htmlFor="jadwal" className="text-sm font-medium text-gray-700">
                        Jadwal
                    </Label>
                    <Combobox value={selectedJadwal} onChange={setSelectedJadwal}>
                        <div className="relative">
                        <div className="relative w-full cursor-default overflow-hidden rounded-lg bg-white text-left shadow-md border py-2 pl-3 pr-10 sm:text-sm">
                            <Combobox.Input
                            className="w-full border-none py-1 pl-1 pr-10 text-sm leading-5 text-gray-900 focus:ring-0"
                            displayValue={(val: number) => {
                                const j = jadwal.find((j) => j.id === val);
                                if (!j) return "";
                                return `${j.kelas.name || "?"} | ${j.subject.name || "?"} | ${
                                j.hari || "?"
                                } | ${j.jam_mulai.substring(0, 5)} - ${j.jam_selesai.substring(
                                0,
                                5
                                )}`;
                            }}
                            placeholder="Cari dan pilih Jadwal"
                            onChange={(e) => setQueryJadwal(e.target.value)}
                            />
                            <Combobox.Button className="absolute inset-y-0 right-0 flex items-center pr-2">
                            <ChevronsUpDownIcon
                                className="h-5 w-5 text-gray-400"
                                aria-hidden="true"
                            />
                            </Combobox.Button>
                        </div>
                        {filteredJadwal.length > 0 && (
                            <Combobox.Options className="absolute z-10 mt-1 max-h-60 w-full overflow-auto rounded-md bg-white py-1 text-base shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none sm:text-sm">
                            {filteredJadwal.map((e) => (
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
                                        {e.kelas.name || "?"} | {e.subject.name || "?"} |{" "}
                                        {e.hari || "?"} | {e.jam_mulai.substring(0, 5)} -{" "}
                                        {e.jam_selesai.substring(0, 5)}
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
                        {filteredJadwal.length === 0 && queryJadwal !== "" && (
                            <div className="absolute z-10 mt-1 w-full bg-white py-2 px-3 text-sm text-gray-500">
                            Tidak ada hasil untuk “{queryJadwal}”
                            </div>
                        )}
                        </div>
                    </Combobox>
                    </div>

                    {/* -------- TAHAP 2: Pilih User + Tombol Add User -------- */}
                    {selectedJadwal !== null && (
                    <>
                      {/* Combobox “Cari User” mengambil 3 kolom */}
                      <div className={ editEnrollment ? "grid gap-2 md:col-span-4" : "grid gap-2 md:col-span-3"}>
                        <Label htmlFor="user" className="text-sm font-medium text-gray-700">
                            Siswa
                        </Label>
                        <Combobox value={selectedUser} onChange={setSelectedUser} disabled={!!editEnrollment}>
                            <div className="relative">
                            <div className="relative w-full cursor-default overflow-hidden rounded-lg bg-white text-left shadow-md border py-2 pl-3 pr-10 sm:text-sm">
                                <Combobox.Input
                                className="w-full border-none py-1 pl-1 pr-10 text-sm leading-5 text-gray-900 focus:ring-0"
                                displayValue={(val: number) => {
                                    const u = users.find((u) => u.id === val);
                                    if (!u) return "";
                                    return u.name;
                                }}
                                placeholder="Cari dan pilih Siswa"
                                onChange={(e) => setQueryUser(e.target.value)}
                                />
                                <Combobox.Button className="absolute inset-y-0 right-0 flex items-center pr-2">
                                <ChevronsUpDownIcon
                                    className="h-5 w-5 text-gray-400"
                                    aria-hidden="true"
                                />
                                </Combobox.Button>
                            </div>
                            {filteredUser.length > 0 && (
                                <Combobox.Options className="absolute z-10 mt-1 max-h-60 w-full overflow-auto rounded-md bg-white py-1 text-base shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none sm:text-sm">
                                {filteredUser.map((e) => (
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
                            {filteredUser.length === 0 && queryUser !== "" && (
                                <div className="absolute z-10 mt-1 w-full bg-white py-2 px-3 text-sm text-gray-500">
                                Tidak ada hasil untuk “{queryUser}”
                                </div>
                            )}
                            </div>
                        </Combobox>
                      </div>

                      {/* Tombol “Add User” mengambil 1 kolom */}
                      {!editEnrollment && (
                        <div className="md:col-span-1 flex flex-col justify-end">
                          <Button
                            className="w-full h-3/5 text-sm "
                            onClick={handleSubmit}
                            disabled={!selectedUser}
                          >
                            Add User
                          </Button>
                        </div>
                      )}
                    </>
                    )}
                </div>

                <DialogFooter>
                    <Button 
                      variant={editEnrollment ? "default" : "secondary"} 
                      onClick={() => 
                        editEnrollment ? handleSubmit() :
                        setOpen(false)
                      }
                    >
                      {editEnrollment ? "Simpan" : "Selesai"}
                    </Button>
                </DialogFooter>
                </DialogContent>
            </Dialog>
          </div>
        </div>

        {/* Tabel utama */}
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
