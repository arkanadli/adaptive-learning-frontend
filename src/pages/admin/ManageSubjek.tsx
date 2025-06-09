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
  fetchSubjek,
  createSubjek,
  updateSubjek,
  deleteSubjek,
  type Subjek
} from "@/api/subjek";

import { exportToExcel } from "@/utils/ExportToExcel";
import DashboardLayout from "@/components/Layout/DashboardLayout";
import { toast } from "sonner";

export default function ManageSubjek() {
  const [Subjek, setSubjek] = useState<Subjek[]>([]);
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState(false);
  const [editSubjek, setEditSubjek] = useState<Subjek | null>(null);
  const [formData, setFormData] = useState({ 
    name: "",
    code: "",
    singkatan: "",
  });

  const columns: GridColDef[] = [
    { field: 'id', headerName: 'ID', width: 70, headerAlign: 'center', align: 'center' },
    { field: 'name', headerName: 'Nama', flex: 2, headerAlign: 'center', align: 'center' },
    { field: 'code', headerName: 'Kode', flex: 1, headerAlign: 'center', align: 'center' },
    { field: 'singkatan', headerName: 'Singkatan', flex: 1, headerAlign: 'center', align: 'center' },
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

  const rows = Subjek.map((s) => {
    return {
        id: s.id,
        name: s.name,
        code: s.code,
        singkatan: s.singkatan,
        original: s,
    };
  });

  useEffect(() => {
    fetchSubjek().then(setSubjek).finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    if (!open) {
      setEditSubjek(null);
      setFormData({ 
        name: "",
        code: "",
        singkatan: "",
      });
    }
  }, [open]);

  const resetForm = () => {
    setFormData({ 
      name: "",
      code: "",
      singkatan: "",
     });
    setEditSubjek(null);
  };

  const handleSubmit = async () => {
    if (formData.name.trim() === "" || formData.code.trim() === "" || formData.singkatan.trim() === "") {
      toast.error("Semua kolom harus diisi"); 
      return;
    };

    if (editSubjek) {
      const updated = await updateSubjek(editSubjek.id, formData);
      setSubjek((prev) => prev.map((k) => (k.id === updated.id ? updated : k)));
    } else {
      const created = await createSubjek(formData);
      setSubjek((prev) => [...prev, created]);
    }

    setOpen(false);
  };

  const handleDelete = async (id: number) => {
    if (confirm("Yakin ingin menghapus Subjek ini?")) {
      await deleteSubjek(id);
      setSubjek((prev) => prev.filter((k) => k.id !== id));
    }
  };

  const openEdit = (Subjek: Subjek) => {
    setEditSubjek(Subjek);
    setFormData({ 
      name: Subjek.name,
      code: Subjek.code,
      singkatan: Subjek.singkatan,
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
          <h1 className="text-2xl font-bold">Kelola Subjek</h1>
            <div className="flex gap-2">
              <Button onClick={() => {
                const dataToExport = rows.map(({ original, ...row }) => row);
                exportToExcel(dataToExport, "subjeks");
              }}>
                <FileDown className="w-4 h-4" />
                Ekspor Excel
              </Button>
              <Dialog open={open} onOpenChange={(val) => { setOpen(val); if (!val) resetForm(); }}>
                <DialogTrigger asChild>
                  <Button>
                    <Plus className="w-4 h-4" />
                    Tambah Subjek
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>{editSubjek ? "Edit Subjek" : "Tambah Subjek"}</DialogTitle>
                  </DialogHeader>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 py-4">
                    {/* Kolom 1 */}
                    <div className="grid gap-2 md:col-span-2">
                      <Label htmlFor="name">Nama Subjek</Label>
                      <Input
                        id="name"
                        placeholder="Masukkan nama Subjek"
                        value={formData.name}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      />
                    </div>
                    <div className="grid gap-2">
                      <Label htmlFor="code">Kode</Label>
                      <Input
                        id="code"
                        placeholder="Masukkan kode Subjek"
                        value={formData.code}
                        onChange={(e) => setFormData({ ...formData, code: e.target.value })}
                      />
                    </div>
                    <div className="grid gap-2">
                      <Label htmlFor="singkatan">Singkatan</Label>
                      <Input
                        id="singkatan"
                        placeholder="Masukkan singkatan Subjek"
                        value={formData.singkatan}
                        onChange={(e) => setFormData({ ...formData, singkatan: e.target.value })}
                      />
                    </div>
                  </div>
                  <DialogFooter>
                    <Button onClick={handleSubmit}>{editSubjek ? "Simpan" : "Tambah"}</Button>
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
