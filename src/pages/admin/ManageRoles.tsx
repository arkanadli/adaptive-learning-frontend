import { useEffect, useState } from "react";
import { FileDown, Pencil, Plus, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";

import { DataGrid } from "@mui/x-data-grid";
import type { GridColDef } from "@mui/x-data-grid";

import {
  fetchRole,
  createRole,
  updateRole,
  deleteRole,
  type Role
} from "@/api/role";

import { exportToExcel } from "@/utils/ExportToExcel";
import DashboardLayout from "@/components/Layout/DashboardLayout";
import { toast } from "sonner";

export default function ManageRoles() {
  const [Role, setRole] = useState<Role[]>([]);
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState(false);
  const [editRole, setEditRole] = useState<Role | null>(null);
  const [formData, setFormData] = useState({ name: "" });

  const columns: GridColDef[] = [
    { field: 'id', headerName: 'ID', width: 70, headerAlign: 'center', align: 'center' },
    { field: 'name', headerName: 'Nama Roles', flex: 1, headerAlign: 'center', align: 'center' },
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

  const rows = Role.map((r) => {
    return {
        id: r.id,
        name: r.name,
        original: r,
    };
  });

  useEffect(() => {
    fetchRole().then(setRole).finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    if (!open) {
      setEditRole(null);
      setFormData({ name: "" });
    }
  }, [open]);

  const resetForm = () => {
    setFormData({ name: "" });
    setEditRole(null);
  };

  const handleSubmit = async () => {
    if (formData.name.trim() === ""){
      toast.error("Kolom nama harus diisi"); 
      return;
    };

    if (editRole) {
      const updated = await updateRole(editRole.id, formData);
      setRole((prev) => prev.map((k) => (k.id === updated.id ? updated : k)));
    } else {
      const created = await createRole(formData);
      setRole((prev) => [...prev, created]);
    }

    setOpen(false);
  };

  const handleDelete = async (id: number) => {
    if (confirm("Yakin ingin menghapus Role ini?")) {
      await deleteRole(id);
      setRole((prev) => prev.filter((k) => k.id !== id));
    }
  };

  const openEdit = (Role: Role) => {
    setEditRole(Role);
    setFormData({ name: Role.name });
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
          <h1 className="text-2xl font-bold">Kelola Role</h1>
            <div className="flex gap-2">
              <Button onClick={() => {
                const dataToExport = rows.map(({ original, ...row }) => row);
                exportToExcel(dataToExport, "roles");
              }}>
                <FileDown className="w-4 h-4" />
                Ekspor Excel
              </Button>
            <Dialog open={open} onOpenChange={(val) => { setOpen(val); if (!val) resetForm(); }}>
              <DialogTrigger asChild>
                <Button>
                  <Plus className="w-4 h-4" />
                  Tambah Role
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>{editRole ? "Edit Role" : "Tambah Role"}</DialogTitle>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                  <Label htmlFor="name">Nama Role</Label>
                  <Input
                    id="name"
                    placeholder="Masukkan nama Role"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  />
                </div>
                <DialogFooter>
                  <Button onClick={handleSubmit}>{editRole ? "Simpan" : "Tambah"}</Button>
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
