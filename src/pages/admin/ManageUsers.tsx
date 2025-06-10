import { useEffect, useState } from "react";
import { Pencil, Trash2, FileDown, Plus } from "lucide-react";
import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";

import { DataGrid } from "@mui/x-data-grid";
import type { GridColDef } from "@mui/x-data-grid";

import { 
  fetchUsers, 
  deleteUser, 
  updateUser, 
  createUser,
  type User
} from "@/api/user";

import {
  fetchRole, 
  type Role
} from "@/api/role";
import { exportToExcel } from "@/utils/ExportToExcel";
import DashboardLayout from "@/components/Layout/DashboardLayout";
import { toast } from "sonner";

export default function ManageUsers() {
  const [users, setUsers] = useState<User[]>([]);
  const [roles, setRoles] = useState<Role[]>([]);
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState(false);
  const [editUser, setEditUser] = useState<User | null>(null);
  const [submitLoading, setSubmitLoading] = useState(false);

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

  const columns: GridColDef[] = [
    { field: 'no', headerName: 'No.', width: 70, headerAlign: 'center', align: 'center' },
    { field: 'id', headerName: 'ID', width: 70, headerAlign: 'center', align: 'center' },
    { field: 'name', headerName: 'Name', flex: 1, headerAlign: 'center', align: 'center' },
    { field: 'email', headerName: 'Email', flex: 1, headerAlign: 'center', align: 'center' },
    { field: 'role', headerName: 'Role', flex: 1, headerAlign: 'center', align: 'center' },
    { field: 'gender', headerName: 'Gender', flex: 0.6, headerAlign: 'center', align: 'center' },
    { field: 'tanggal_lahir', headerName: 'Tanggal Lahir', flex: 0.8, headerAlign: 'center', align: 'center' },
    { field: 'tahun_masuk', headerName: 'Tahun Masuk', flex: 0.6, headerAlign: 'center', align: 'center' },
    { field: 'address', headerName: 'Alamat', flex: 1.2, headerAlign: 'center', align: 'center' },
    {
        field: 'actions',
        headerName: 'Aksi',
        sortable: false,
        filterable: false,
        headerAlign: 'center', 
        align: 'center',
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

  const rows = users.map((u,index) => {
    return {
        
        no: index +1,
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
    fetchRole().then(setRoles).catch(console.error);
    fetchUsers().then(setUsers).finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    if (!open) {
      setEditUser(null);
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
    setEditUser(null);
  };

  const handleDelete = async (id: number) => {
    if (confirm("Yakin ingin menghapus user ini?")) {
      await deleteUser(id);
      setUsers((prev) => prev.filter((user) => user.id !== id));
    }
  };

  const handleSubmit = async () => {
    if (
      formData.name.trim() === "" || formData.email.trim() === ""
      || formData.role_id.trim() === ""
    ){
      toast.error("Semua Kolom Harus Diisi!");
      return;
    };

    setSubmitLoading(true);

    try{
      if (editUser) {
        const updated = await updateUser(editUser.id, { ...formData, role_id: Number(formData.role_id) });
        setUsers((prev) => prev.map((u) => (u.id === updated.id ? updated : u)));
        toast.success("Berhasil memperbarui pengguna.");
      } else {
        const created = await createUser({ ...formData, role_id: Number(formData.role_id)});
        setUsers((prev) => [...prev, created]);
        toast.success("Berhasil menambahkan pengguna.");
      }
      setOpen(false);
    } catch (err: any) {
      toast.error("Terjadi kesalahan saat menyimpan.");
      console.error(err);
    } finally {
      setSubmitLoading(false);
    }
  };

  const openEdit = (user: User) => {
    setEditUser(user);
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
          <h1 className="text-2xl font-bold">Kelola Pengguna</h1>
          <div className="flex gap-2">
            <Button onClick={() => {
              const dataToExport = rows.map(({ original, ...row }) => row);
              exportToExcel(dataToExport, "users");
            }}>
              <FileDown className="w-4 h-4" />
              Ekspor Excel
            </Button>
            <Dialog open={open} onOpenChange={(val) => { setOpen(val); if (!val) resetForm(); }}>
              <DialogTrigger asChild>
                <Button>
                  <Plus className="w-4 h-4" />
                  Tambah User
                </Button>
              </DialogTrigger>
              <DialogContent aria-labelledby="dialog-title">
                <DialogHeader>
                  <DialogTitle id="dialog-title">{editUser ? "Edit Pengguna" : "Tambah Pengguna"}</DialogTitle>
                </DialogHeader>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 py-4">
                  {/* Kolom 1 */}
                  <div className="grid gap-2 md:col-span-2">
                    <Label htmlFor="name" className="text-sm font-medium text-gray-700">Nama</Label>
                    <Input
                      id="name"
                      placeholder="Masukkan nama"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      className="rounded-lg px-3 py-2"
                    />
                  </div>

                  {/* Kolom 2 */}
                  <div className="grid gap-2 md:col-span-2">
                    <Label htmlFor="email" className="text-sm font-medium text-gray-700">Email</Label>
                    <Input
                      id="email"
                      type="email"
                      placeholder="Masukkan email"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      className="rounded-lg px-3 py-2"
                    />
                  </div>

                  {/* Kolom Role (full width) */}
                  <div className="grid gap-2 md:col-span-2">
                    <Label htmlFor="role" className="text-sm font-medium text-gray-700">Role</Label>
                    <Select
                      value={formData.role_id}
                      onValueChange={(val) => setFormData({ ...formData, role_id: val })}
                    >
                      <SelectTrigger id="role" className="rounded-lg px-3 py-2">
                        <SelectValue placeholder="Pilih Role" />
                      </SelectTrigger>
                      <SelectContent>
                        {roles.map((role) => (
                          <SelectItem key={role.id} value={String(role.id)}>
                            {role.name.toLowerCase()}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Upload Foto Profil */}
                  <div className="grid gap-2">
                    <Label htmlFor="profile">Foto Profil</Label>
                    <Input
                      id="profile"
                      type="file"
                      accept="image/*"
                      onChange={(e) =>
                        setFormData({ ...formData, profile: e.target.files?.[0] || null })
                      }
                    />
                  </div>

                  {/* Gender */}
                  <div className="grid gap-2">
                    <Label htmlFor="gender">Gender</Label>
                    <div className="flex gap-4">
                      <label className="inline-flex items-center">
                        <input
                          type="radio"
                          name="gender"
                          value="L"
                          checked={formData.gender === "L"}
                          onChange={(e) => setFormData({ ...formData, gender: e.target.value })}
                          className="form-radio text-blue-600"
                        />
                        <span className="ml-2 text-gray-700">Laki-laki</span>
                      </label>
                      <label className="inline-flex items-center">
                        <input
                          type="radio"
                          name="gender"
                          value="P"
                          checked={formData.gender === "P"}
                          onChange={(e) => setFormData({ ...formData, gender: e.target.value })}
                          className="form-radio text-pink-600"
                        />
                        <span className="ml-2 text-gray-700">Perempuan</span>
                      </label>
                    </div>
                  </div>

                  {/* Tanggal Lahir */}
                  <div className="grid gap-2">
                    <Label htmlFor="tanggal_lahir">Tanggal Lahir</Label>
                    <Input
                      id="tanggal_lahir"
                      type="date"
                      value={formData.tanggal_lahir}
                      onChange={(e) => setFormData({ ...formData, tanggal_lahir: e.target.value })}
                    />
                  </div>

                  {/* Tahun Masuk */}
                  <div className="grid gap-2">
                    <Label htmlFor="tahun_masuk">Tahun Masuk</Label>
                    <Input
                      id="tahun_masuk"
                      type="number"
                      placeholder="Contoh: 2024"
                      value={formData.tahun_masuk}
                      onChange={(e) => setFormData({ ...formData, tahun_masuk: e.target.value })}
                    />
                  </div>

                  {/* Alamat */}
                  <div className="grid gap-2 md:col-span-2">
                    <Label htmlFor="address">Alamat</Label>
                    <textarea
                      id="address"
                      placeholder="Masukkan alamat lengkap"
                      value={formData.address}
                      onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                      className="w-full px-3 py-2 text-sm rounded-md border border-gray-300 shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                      style={{ minHeight: "100px" }}
                    />
                  </div>
                </div>
                <DialogFooter>
                  <Button onClick={handleSubmit} disabled={submitLoading}>
                    {submitLoading ? "Menyimpan..." : editUser ? "Simpan" : "Tambah"}
                  </Button>
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
