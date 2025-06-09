import { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { createQuiz, type CreateQuestion } from "@/api/quiz";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";

const optionKey = (index: number) => String.fromCharCode(65 + index); // A, B, C, ...

export default function TambahKuis() {
  const navigate = useNavigate();
  const { jadwal_id } = useParams<{ jadwal_id: string }>();

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [questions, setQuestions] = useState<CreateQuestion[]>([]);
  const [loading, setLoading] = useState(false);

    const handleQuestionChange = <K extends keyof CreateQuestion>(
    index: number,
    field: K,
    value: CreateQuestion[K]
    ) => {
        const updated = [...questions];
        updated[index][field] = value;
        setQuestions(updated);
    };

  const addQuestion = () => {
    setQuestions([
      ...questions,
      {
        question_text: "",
        options: {}, // using object now
        correct_answer: "",
        difficulty_level: 1,
      },
    ]);
  };

  const addOption = (questionIndex: number) => {
    const currentOptions = questions[questionIndex].options as Record<string, string>;
    const nextKey = optionKey(Object.keys(currentOptions).length);
    const newOptions = { ...currentOptions, [nextKey]: "" };
    handleQuestionChange(questionIndex, "options", newOptions);
  };

  const validateForm = (): boolean => {
    if (!title.trim() || !description.trim()) return false;

    for (const q of questions) {
      if (!q.question_text.trim()) return false;
      if (typeof q.options !== "object" || Object.keys(q.options).length < 2) return false;
      if (!q.correct_answer || !(q.correct_answer in q.options)) return false;
      if (![1, 2, 3].includes(q.difficulty_level)) return false;
    }

    return true;
  };

  const handleSubmit = async () => {
    if (!validateForm()) {
      toast.error("Mohon lengkapi semua data kuis dan pertanyaan.");
      return;
    }

    setLoading(true);
    try {
      await createQuiz({
        jadwal_id: Number(jadwal_id),
        title,
        description,
        questions,
      });
      toast.success("Kuis berhasil ditambahkan!");
      navigate(`/kelas/${jadwal_id}`);
    } catch (err) {
      console.error(err);
      toast.error("Gagal menyimpan kuis.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-6 px-4 md:px-8 lg:px-16 xl:px-32">
      <div className="max-w-4xl mx-auto p-6 bg-white rounded-lg shadow space-y-6">
        <h1 className="text-2xl font-bold">Tambah Kuis</h1>

        <div>
          <Label htmlFor="title" className="mb-1 font-medium text-sm">Judul</Label>
          <Input
            id="title"
            placeholder="Masukkan judul kuis"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
          />
        </div>

        <div>
          <Label htmlFor="description" className="mb-1 font-medium text-sm">Deskripsi</Label>
          <textarea
            id="description"
            placeholder="Masukkan deskripsi kuis"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="w-full px-3 py-2 text-sm rounded-md border border-gray-300 shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
            style={{ minHeight: "100px" }}
          />
        </div>

        {questions.map((q, index) => (
          <div key={index} className="border-t pt-6 space-y-4">
            <h2 className="font-semibold text-lg">Pertanyaan {index + 1}</h2>

            <div>
              <Label>Pertanyaan</Label>
              <Input
                value={q.question_text}
                onChange={(e) => handleQuestionChange(index, "question_text", e.target.value)}
                placeholder="Masukkan teks soal"
              />
            </div>

            <div>
              <Label>Opsi Jawaban</Label>
              <div className="space-y-2">
                {Object.entries(q.options).map(([key, val]) => (
                  <div key={key} className="flex gap-2 items-center">
                    <span className="font-medium w-6">{key}.</span>
                    <Input
                      className="flex-1"
                      value={val}
                      placeholder={`Opsi ${key}`}
                      onChange={(e) => {
                        const updated = { ...q.options, [key]: e.target.value };
                        handleQuestionChange(index, "options", updated);
                      }}
                    />
                    <Button
                      variant="destructive"
                      size="sm"
                      type="button"
                      onClick={() => {
                        const { [key]: _, ...rest } = q.options;
                        handleQuestionChange(index, "options", rest);

                        // Jika opsi yang dihapus adalah jawaban yang sekarang, reset jawaban benar
                        if (q.correct_answer === key) {
                          handleQuestionChange(index, "correct_answer", "");
                        }
                      }}
                    >
                      Hapus
                    </Button>
                  </div>
                ))}
                <Button type="button" variant="secondary" onClick={() => addOption(index)}>
                  Tambah Opsi
                </Button>
              </div>
            </div>

            <div>
              <Label>Jawaban Benar</Label>
              <select
                value={q.correct_answer}
                onChange={(e) => handleQuestionChange(index, "correct_answer", e.target.value)}
                className="w-full rounded-md border px-3 py-2 text-sm focus:outline-none focus:ring-2"
              >
                <option value="" disabled>Pilih jawaban</option>
                {Object.keys(q.options).map((key) => (
                  <option key={key} value={key}>{key}</option>
                ))}
              </select>
            </div>

            <div>
              <Label>Tingkat Kesulitan</Label>
              <select
                value={q.difficulty_level}
                onChange={(e) => handleQuestionChange(index, "difficulty_level", Number(e.target.value))}
                className="w-full rounded-md border px-3 py-2 text-sm focus:outline-none focus:ring-2"
              >
                <option value={1}>Mudah</option>
                <option value={2}>Sedang</option>
                <option value={3}>Sulit</option>
              </select>
            </div>
          </div>
        ))}

        <div className="flex flex-col sm:flex-row gap-4 justify-between pt-4">
          <Button variant="outline" onClick={addQuestion}>
            Tambah Pertanyaan
          </Button>

          <Button onClick={handleSubmit} disabled={loading}>
            {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Simpan Kuis
          </Button>
        </div>
      </div>
    </div>
  );
}
