import { useState } from "react";
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
import { createMateri } from "@/api/materi";
import { toast } from "sonner";

interface Props {
  jadwalId: number;
  onSukses: () => void;
  buttonClassName?: string;
  setIsBukaModal?: (open: boolean) => void;
}

export default function TambahMateriDialog({ jadwalId, onSukses, buttonClassName, setIsBukaModal }: Props) {
  const [open, setOpen] = useState(false);
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    difficulty_level: 1,
    file: null as File | null,
  });
  const [loading, setLoading] = useState(false);

  const resetForm = () => {
    setFormData({
      title: "",
      description: "",
      difficulty_level: 1,
      file: null,
    });
  };

  const handleSubmit = async () => {
    if (!formData.file) return alert("File harus diunggah.");

    setLoading(true);
    try {
      await createMateri({
        title: formData.title,
        description: formData.description,
        difficulty_level: formData.difficulty_level,
        jadwal_id: jadwalId,
        file: formData.file,
      });

      onSukses();
      setOpen(false);
      setIsBukaModal && setIsBukaModal(false);
      resetForm();
    } catch (error) {
      console.error(error);
      toast.error("Gagal menambahkan materi.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog
        open={open}
        onOpenChange={(val) => {
            setOpen(val);
            if (!val) {
                resetForm();
                setIsBukaModal && setIsBukaModal(false);
            } else {
                setIsBukaModal && setIsBukaModal(true);
            }
        }}
    >
      <DialogTrigger asChild>
        <button
            onClick={(e) => {
                e.stopPropagation();
                setOpen(true)
            }}
            className={buttonClassName || "bg-blue-600 text-white px-4 py-2 rounded text-sm hover:bg-blue-700 transition"}
        >
            Tambah Materi
        </button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Tambah Materi</DialogTitle>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid gap-2">
            <Label htmlFor="title">Judul</Label>
            <Input
              id="title"
              value={formData.title}
              onChange={(e) =>
                setFormData({ ...formData, title: e.target.value })
              }
              placeholder="Masukkan judul materi"
            />
          </div>

          <div className="grid gap-2">
            <Label htmlFor="description">Deskripsi</Label>
            <textarea
                id="description"
                className="border border-input rounded-md px-3 py-2 text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent min-h-[100px]"
                value={formData.description}
                onChange={(e) =>
                    setFormData({ ...formData, description: e.target.value })
                }
                placeholder="Masukkan deskripsi materi"
            />
          </div>

          <div className="grid gap-2">
            <Label htmlFor="difficulty_level">Tingkat Kesulitan</Label>
            <select
              id="difficulty_level"
              value={formData.difficulty_level}
              onChange={(e) =>                 
                setFormData({
                  ...formData,
                  difficulty_level: Number(e.target.value),
                })}
              className="w-full rounded-md border px-3 py-2 text-sm focus:outline-none focus:ring-2"
            >
              <option value={1}>Mudah</option>
              <option value={2}>Sedang</option>
              <option value={3}>Sulit</option>
            </select>
          </div>

          <div className="grid gap-2">
            <Label htmlFor="file">File Materi</Label>
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
          <Button onClick={handleSubmit} disabled={loading}>
            {loading ? "Mengirim..." : "Tambah"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
