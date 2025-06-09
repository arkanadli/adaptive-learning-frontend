import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";

import { ArrowRight } from "lucide-react";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";

import { DataGrid } from "@mui/x-data-grid";
import type { GridColDef } from "@mui/x-data-grid";

import { 
  fetchUsersBySchedule, 
  type User
} from "@/api/user";

import {
  fetchRole,
  type Role
} from "@/api/role";

import { BASE_URL } from "./MateriDetail";
import type { jadwalUser } from "@/api/jadwal_user";
import { useAuth } from "@/context/AuthContext";

export default function PesertaDetail() {

  const navigate = useNavigate();

  const { jadwal_id } = useParams<{ jadwal_id: string }>();
  const { user } = useAuth();
  const [users, setUsers] = useState<jadwalUser[] | null>(null);
  const [roles, setRoles] = useState<Role[]>([]);
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState(false);
  const [detailUser, setDetailUser] = useState<User | null>(null);

  const role = user?.role.name.toLowerCase();

  const [formData, setFormData] = useState({ 
    name: "", 
    email: "", 
    role_id: "1", 
    password: "12345678", 
    password_confirmation: "12345678",
    profile: null as File | null,
    gender: "",
    tanggal_lahir: "",
    tahun_masuk: "",
    address: "",
  });

  useEffect(() => {
    fetchRole().then(setRoles).catch(console.error);
    fetchUsersBySchedule(Number(jadwal_id)).then(setUsers).finally(() => setLoading(false));
  }, []);

    const baseColumns: GridColDef[] = [
        { field: 'no', headerName: 'No.', width: 70, headerAlign: 'center', align: 'center' },
        { field: 'name', headerName: 'Nama', flex: 2, headerAlign: 'center', align: 'center' },
        { field: 'role', headerName: 'Role', flex: 0.8, headerAlign: 'center', align: 'center' },
        { field: 'tahun_masuk', headerName: 'Tahun Masuk', flex: 0.8, headerAlign: 'center', align: 'center' },
    ];

    if (role === "guru") {
        baseColumns.splice(1, 0,
            { field: 'id', headerName: 'ID', width: 80, headerAlign: 'center', align: 'center' },
            { field: 'email', headerName: 'Email', flex: 1.5, headerAlign: 'center', align: 'center' }
        );
        baseColumns.push({
            field: 'actions',
            headerName: 'Aksi',
            sortable: false,
            filterable: false,
            headerAlign: 'center',
            align: 'center',
            width: 150,
            renderCell: (params) => (
            <Button
                variant="default"
                size="sm"
                onClick={() => openDetail(params.row.original)}
                className="text-xs"
            >
                <ArrowRight className="w-4 h-4 mr-1" />
                Lihat Detail
            </Button>
            ),
        });
    }

  const rows = users?.map((j, index) => {
    const u = j.user;
    return {
        no: index + 1,
        id: u.id,
        name: u.name,
        email: u.email,
        role: u.role.name.toLowerCase() || "-",
        gender: u.gender === "L" ? "Pria" : u.gender === "P" ? "Wanita" : "-",
        tanggal_lahir: u.tanggal_lahir || "-",
        tahun_masuk: u.tahun_masuk || "-",
        address: u.address || "-",
        original: u,
    };
  });

  useEffect(() => {
    if (!open) {
      setDetailUser(null);
      setFormData({ 
        name: "", 
        email: "", 
        role_id: "1", 
        password: "12345678", 
        password_confirmation: "12345678",
        profile: null as File | null,
        gender: "",
        tanggal_lahir: "",
        tahun_masuk: "",
        address: "",
      });
    }
  }, [open]);

  const resetForm = () => {
    setFormData({ 
      name: "", 
      email: "", 
      role_id: "1", 
      password: "12345678", 
      password_confirmation: "12345678",
      profile: null as File | null,
      gender: "",
      tanggal_lahir: "",
      tahun_masuk: "",
      address: "",
    });
    setDetailUser(null);
  };

  const openDetail = (user: User) => {
    setDetailUser(user);
    setFormData({ 
      name: user.name, 
      email: user.email, 
      role_id: String(user.role_id), 
      password: "12345678", 
      password_confirmation: "12345678" ,
      profile: null as File | null,
      gender: user.gender || "-",
      tanggal_lahir: user.tanggal_lahir || "-",
      tahun_masuk: user.tahun_masuk || "-",
      address: user.address || "-",
    });
    setOpen(true);
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
            <h1 className="text-2xl font-bold">Peserta Kelas</h1>
          </div>
          <div className="flex gap-2">
            <Button
                variant="outline"
                onClick={() => navigate(`/kelas/${jadwal_id}`)}
            >
                ← Kembali
            </Button>
            <Dialog open={open} onOpenChange={(val) => { setOpen(val); if (!val) resetForm(); }}>
                <DialogContent aria-labelledby="dialog-title" className="max-w-2xl">
                <DialogHeader>
                    <DialogTitle id="dialog-title" className="text-lg font-semibold">Detail Pengguna</DialogTitle>
                </DialogHeader>

                <div className="flex flex-col md:flex-row gap-6 py-4">
                    {/* Foto Profil */}
                    <div className="w-full md:w-1/3 flex justify-center items-start">
                    {detailUser?.profile_path ? (
                        <img
                        src={BASE_URL + detailUser.profile_path}
                        alt={`Foto ${detailUser.name}`}
                        className="rounded-xl object-cover w-32 h-32 shadow-md border border-gray-200"
                        />
                    ) : (
                        <div className="w-32 h-32 flex items-center justify-center bg-gray-100 text-gray-500 rounded-xl shadow text-sm border border-gray-200">
                        Tidak Ada Foto
                        </div>
                    )}
                    </div>

                    {/* Informasi Pengguna */}
                    <div className="flex-1 grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm text-gray-800">
                    <div>
                        <Label className="text-gray-500">Nama</Label>
                        <p className="font-medium">{formData.name || "-"}</p>
                    </div>
                    <div>
                        <Label className="text-gray-500">Email</Label>
                        <p className="font-medium">{formData.email || "-"}</p>
                    </div>
                    <div>
                        <Label className="text-gray-500">Role</Label>
                        <p className="capitalize">{roles.find((r) => String(r.id) === formData.role_id)?.name || "-"}</p>
                    </div>
                    <div>
                        <Label className="text-gray-500">Gender</Label>
                        <p>
                        {formData.gender === "L" ? "Laki-laki" : formData.gender === "P" ? "Perempuan" : "-"}
                        </p>
                    </div>
                    <div>
                        <Label className="text-gray-500">Tanggal Lahir</Label>
                        <p>{formData.tanggal_lahir || "-"}</p>
                    </div>
                    <div>
                        <Label className="text-gray-500">Tahun Masuk</Label>
                        <p>{formData.tahun_masuk || "-"}</p>
                    </div>
                    <div className="sm:col-span-2">
                        <Label className="text-gray-500">Alamat</Label>
                        <p>{formData.address || "-"}</p>
                    </div>
                    </div>
                </div>
                </DialogContent>
            </Dialog>
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
