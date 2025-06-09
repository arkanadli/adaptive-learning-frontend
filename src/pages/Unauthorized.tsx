import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { ShieldAlert } from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { useEffect, useState } from "react";
import { fetchRole, type Role } from "@/api/role";

export default function Unauthorized() {
  const { user } = useAuth();
  const roleId = user?.role_id;
  const [role, setRole] = useState<string | null>(null);

  useEffect(() => {
    if (!roleId) return;

    fetchRole().then((roles) => {
      const roleData = roles.find((r: Role) => r.id === roleId);
      if (roleData) {
        setRole(roleData.name.toLowerCase());
      }
    });
  }, [roleId]);

  let redirectTo = "/login";
  if (role === "siswa") redirectTo = "/siswa";
  else if (role === "guru") redirectTo = "/guru";
  else if (role === "admin") redirectTo = "/admin";

  if(!role) return (
    <motion.div
      className="min-h-screen flex flex-col items-center justify-center text-center bg-yellow-50"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
    >
      <ShieldAlert className="w-20 h-20 text-yellow-600 mb-4" />
      <h1 className="text-5xl font-bold text-yellow-700 mb-2">403</h1>
      <p className="text-lg text-yellow-800 mb-6">Kamu tidak memiliki izin untuk mengakses halaman ini.</p>
      <p className="px-6 py-2 text-lg bg-yellow-600 text-white rounded-xl transition">Loading...</p>
    </motion.div>
  );

  return (
    <motion.div
      className="min-h-screen flex flex-col items-center justify-center text-center bg-yellow-50"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
    >
      <ShieldAlert className="w-20 h-20 text-yellow-600 mb-4" />
      <h1 className="text-5xl font-bold text-yellow-700 mb-2">403</h1>
      <p className="text-lg text-yellow-800 mb-6">Kamu tidak memiliki izin untuk mengakses halaman ini.</p>
      <Link
        to={redirectTo}
        className="px-6 py-2 bg-yellow-600 hover:bg-yellow-700 text-white rounded-xl transition"
      >
        Kembali ke Beranda
      </Link>
    </motion.div>
  );
}
