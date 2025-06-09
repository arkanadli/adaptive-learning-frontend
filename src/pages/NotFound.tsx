import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { XCircle } from "lucide-react";
import { useAuth } from "../context/AuthContext";

export default function NotFound() {
  const { user } = useAuth();
  const role = user?.role.name.toLowerCase();

  let redirectTo = "/login";
  if (role === "siswa") redirectTo = "/siswa";
  else if (role === "guru") redirectTo = "/guru";
  else if (role === "admin") redirectTo = "/admin";

  if(!role) return (
    <motion.div
      className="min-h-screen flex flex-col items-center justify-center text-center bg-red-50"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
    >
      <XCircle className="w-20 h-20 text-red-600 mb-4" />
      <h1 className="text-6xl font-bold text-red-700 mb-2">404</h1>
      <p className="text-xl text-red-800 mb-6">Halaman yang kamu cari tidak ditemukan.</p>
      <p className="px-6 py-2 bg-red-600 hover:bg-red-700 text-white rounded-xl transition">Loading...</p>
    </motion.div>
  );

  return (
    <motion.div
      className="min-h-screen flex flex-col items-center justify-center text-center bg-red-50"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
    >
      <XCircle className="w-20 h-20 text-red-600 mb-4" />
      <h1 className="text-6xl font-bold text-red-700 mb-2">404</h1>
      <p className="text-xl text-red-800 mb-6">Halaman yang kamu cari tidak ditemukan.</p>
      <Link
        to={redirectTo}
        className="px-6 py-2 bg-red-600 hover:bg-red-700 text-white rounded-xl transition"
      >
        Kembali ke Beranda
      </Link>
    </motion.div>
  );
}
