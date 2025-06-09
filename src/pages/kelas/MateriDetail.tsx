import { useEffect, useState } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

import dayjs from "dayjs";

import { 
  updateMateri, 
  fetchMateriById, 
  deleteMateri,
  type Materi
} from "@/api/materi";

import { useAuth } from "@/context/AuthContext";
import { toast } from "sonner";


export const BASE_URL = "https://adaptive-learning-content-bdg.s3.ap-southeast-2.amazonaws.com/";

export default function DetailMateri() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { materi_id, jadwal_id } = useParams<{ materi_id: string; jadwal_id: string }>();
  const [materi, setMateri] = useState<Materi | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [editOpen, setEditOpen] = useState(false);
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    difficulty_level: 1,
    file: null as File | null,
  });

  const isGuru = user?.role?.name.toLowerCase() === "guru";

  useEffect(() => {
    if (!materi_id) return;
    setLoading(true);

    fetchMateriById(Number(materi_id))
      .then(setMateri)
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [materi_id]);

  const handleDeleteMateri = async () => {
    const confirmed = confirm("Apakah Anda yakin ingin menghapus materi ini?");
    if (!confirmed) return;

    try {
        await deleteMateri(Number(materi_id));
        toast.success("Materi berhasil dihapus");
        navigate(`/kelas/${jadwal_id}`);
    } catch (error) {
        console.error(error);
        toast.error("Gagal menghapus materi");
    }
    };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <p className="text-gray-500">Memuat detail materi...</p>
      </div>
    );
  }

  if (!materi) {
    return (
      <div className="p-6">
        <p className="text-red-500">Materi tidak ditemukan.</p>
        <Link to={`/kelas/${jadwal_id}`} className="text-blue-500 hover:underline mt-4 block">
          &larr; Kembali ke Kelas
        </Link>
      </div>
    );
  }

  const fullFileUrl = materi.file_path ? `${BASE_URL}${materi.file_path}` : null;
  const fileExtension = fullFileUrl?.split(".").pop()?.toLowerCase();
  const isPdf = fileExtension === "pdf";

  return (
    <div className="min-h-screen bg-gray-50 py-6 px-4 md:px-8 lg:px-16 xl:px-32">
      <div className="bg-white rounded-lg shadow p-6 space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-800 mb-2">{materi.title}</h1>
          <p className="text-gray-600 mb-1">
            <strong>Deskripsi:</strong>
          </p>
          <p className="text-gray-700">{materi.description}</p>
        </div>

        <div className="border-t pt-4 grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-gray-600">
          <p>
            <strong>Level Kesulitan:</strong> {materi.difficulty_level === 1 ? "Mudah" : materi.difficulty_level === 2 ? "Sedang" : materi.difficulty_level === 3 ? "Sulit" : "-"}
          </p>
          <p>
            <strong>Diunggah oleh:</strong> {materi.jadwal.guru.name || "Tidak diketahui"}
          </p>
          <p>
            <strong>Tanggal Upload:</strong>{" "}
            {dayjs(materi.created_at).format("DD MMMM YYYY HH:mm")}
          </p>
        </div>

        {fullFileUrl && (
        <div className="border-t pt-4">
            <p className="text-lg font-semibold mb-2 text-gray-800">Pratinjau Materi</p>

            {isPdf ? (
            <div className="w-full h-[600px] border rounded overflow-hidden">
                <iframe
                src={fullFileUrl}
                title="Preview Materi"
                className="w-full h-full"
                />
            </div>
            ) : (
            <div className="p-4 border rounded bg-gray-100 text-gray-700">
                File jenis <strong>.{fileExtension}</strong> tidak bisa dipratinjau langsung. Silakan unduh file untuk membukanya.
            </div>
            )}
        </div>
        )}

      <div className="pt-6 flex flex-col md:flex-row gap-4 justify-center">
        <a
            href={fullFileUrl!}
            target="_blank"
            rel="noopener noreferrer"
            className="flex-1 bg-blue-400 hover:bg-blue-600 text-white font-semibold px-4 py-2 rounded inline-flex justify-center items-center transition"
        >
            Download Materi
        </a>
      </div>

        <div className="pt-6 flex flex-col md:flex-row gap-4">
            {isGuru && (
                <>
                <div className="flex-1">
                    <Button
                    onClick={() => {
                        setEditOpen(true);
                        setFormData({
                        title: materi.title,
                        description: materi.description,
                        difficulty_level: materi.difficulty_level || 1,
                        file: null,
                        });
                    }}
                    className="w-full bg-zinc-700 hover:bg-zinc-800 text-white font-semibold px-4 py-2 rounded transition"
                    >
                    Edit Materi
                    </Button>
                </div>
                <div className="flex-1">
                    <Button
                    onClick={handleDeleteMateri}
                    className="w-full bg-red-700 hover:bg-red-800 text-white font-semibold px-4 py-2 rounded transition"
                    >
                    Delete Materi
                    </Button>
                </div>
                </>
            )}

            <div className="flex-[2]">
                <Button
                onClick={() => navigate(`/kelas/${jadwal_id}`)}
                className="w-full bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold px-4 py-2 rounded transition"
                >
                &larr; Kembali ke Halaman Kelas
                </Button>
            </div>
        </div>

      </div>
      <Dialog open={editOpen} onOpenChange={(val) => {
        setEditOpen(val);
        }}>
        <DialogContent>
            <DialogHeader>
            <DialogTitle>Edit Materi</DialogTitle>
            </DialogHeader>
            <div className="grid gap-4 py-4">
            <div className="grid gap-2">
                <Label htmlFor="title">Judul</Label>
                <Input
                id="title"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                />
            </div>

            <div className="grid gap-2">
                <Label htmlFor="description">Deskripsi</Label>
                <textarea
                id="description"
                className="w-full px-3 py-2 text-sm rounded-md border border-gray-300 shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                style={{ minHeight: "100px" }}
                value={formData.description}
                onChange={(e) =>
                    setFormData({ ...formData, description: e.target.value })
                }
                />
            </div>

            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700">Tingkat Kesulitan</label>
              <select
                  value={formData.difficulty_level}
                  onChange={(e) => setFormData({ ...formData, difficulty_level: Number(e.target.value) })}
                  className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                  <option value={1}>Mudah</option>
                  <option value={2}>Sedang</option>
                  <option value={3}>Sulit</option>
              </select>
            </div>

            <div className="grid gap-2">
                <Label htmlFor="file">Ganti File (opsional)</Label>
                <Input
                id="file"
                type="file"
                accept=".pdf,.doc,.docx,.ppt,.pptx"
                onChange={(e) =>
                    setFormData({
                    ...formData,
                    file: e.target.files?.[0] || null,
                    })
                }
                />
            </div>
            </div>
            <DialogFooter>
            <Button
                onClick={async () => {
                try {
                    await updateMateri(materi.id, {
                    title: formData.title,
                    description: formData.description,
                    difficulty_level: formData.difficulty_level,
                    file: formData.file,
                    });
                    toast.success("Materi berhasil diperbarui");
                    window.location.reload(); // atau fetch ulang
                } catch (err) {
                    console.error(err);
                    toast.error("Gagal mengupdate materi");
                }
                }}
            >
                Simpan Perubahan
            </Button>
            </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
