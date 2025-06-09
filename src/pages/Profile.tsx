import { useEffect, useState } from "react";

import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

import { Eye, EyeOff } from "lucide-react";
import { updatePassword, updateUser } from "@/api/user";
import { useAuth } from "@/context/AuthContext";

import { BASE_URL } from "./kelas/MateriDetail";
import { toast } from "sonner";

export default function Profile() {
  const { user } = useAuth();

  if(!user) return null;

  // State untuk data profil (nama & email)
  const [profile, setProfile] = useState({ 
    name: "", 
    email: "",
    role_id: 0,
    gender: "",
    tanggal_lahir: "",
    address: "",
    profile_name: "",
    profile_path: "",
    profile: null as File | null
  });
  // State untuk mengontrol visibilitas tiap password field
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  // State untuk data password
  const [passwordData, setPasswordData] = useState({
    current_password: "",
    password: "",
    password_confirmation: "",
  });

  // Loading state untuk disable button saat request
  const [loadingProfile, setLoadingProfile] = useState(false);
  const [loadingPassword, setLoadingPassword] = useState(false);

  useEffect(() => {
    async function fetchProfile() {
      try {
        if(!user) return;
        setProfile({ 
          name: user.name, 
          email: user.email,
          role_id: user.role_id,
          gender: user.gender || "",
          tanggal_lahir: user.tanggal_lahir || "",
          address: user.address || "",
          profile_name: user.profile_name || "",
          profile_path: user.profile_path || "",
          profile: user.profile
        });
      } catch (err) {
        toast.error("Gagal memuat profil");
      }
    }
    fetchProfile();
  }, [user]);

  const handleProfileUpdate = async () => {
    setLoadingProfile(true);
    try {
      // await updateProfile({ name: profile.name });
      if(!user) return;

      const updated = await updateUser(user.id, { ...profile });

      const storedUser = localStorage.getItem("user");
      if (storedUser) {
        localStorage.setItem("user", JSON.stringify(updated));
      }

      toast.success("Profil berhasil diperbarui.");
      window.location.reload();
    } catch (err) {
      toast.error("Gagal memperbarui profil.");
    } finally {
      setLoadingProfile(false);
    }
  };

  const handlePasswordChange = async () => {
    if (passwordData.password !== passwordData.password_confirmation) {
      return toast.error("Konfirmasi password tidak cocok.");
    }

    setLoadingPassword(true);
    try {
      await updatePassword(passwordData);
      toast.success("Password berhasil diganti.");
      setPasswordData({
        current_password: "",
        password: "",
        password_confirmation: "",
      });
    } catch (err: any) {
      toast.error("Gagal mengganti password. Pastikan password saat ini benar.");
    } finally {
      setLoadingPassword(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto p-6 space-y-8">
      <input
        type="text"
        name="fake_username"
        autoComplete="username"
        className="absolute w-0 h-0 p-0 m-0 border-0"
        style={{ top: "-9999px", left: "-9999px" }}
      />
      <input
        type="password"
        name="fake_password"
        autoComplete="new-password"
        className="absolute w-0 h-0 p-0 m-0 border-0"
        style={{ top: "-9999px", left: "-9999px" }}
      />

      {/* Card Profil */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <h2 className="text-2xl font-semibold mb-6">Profil Saya</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-start">
          {/* Foto Profil + Preview */}
          <div className="flex flex-col items-center space-y-4 md:col-span-1">
            <div className="w-32 h-32 rounded-full overflow-hidden border border-gray-300">
              {profile.profile ? (
                <img
                  src={URL.createObjectURL(profile.profile)}
                  alt="Preview Foto Profil"
                  className="object-cover w-full h-full"
                />
              ) : profile.profile_path ? (
                <img
                  src={BASE_URL + profile.profile_path}
                  alt="Foto Profil"
                  className="object-cover w-full h-full"
                />
              ) : (
                <div className="w-full h-full bg-gray-100 flex items-center justify-center text-gray-400">
                  Tidak Ada Foto
                </div>
              )}
            </div>
            <Input
              id="profile"
              type="file"
              accept="image/*"
              onChange={(e) => {
                const file = e.target.files?.[0] || null;
                setProfile({ ...profile, profile: file });
              }}
              className="w-full"
            />
          </div>

          {/* Form Fields */}
          <div className="space-y-4 md:col-span-2">
            {/* Nama Lengkap */}
            <div className="flex flex-col">
              <label htmlFor="name" className="mb-1 text-sm font-medium text-gray-700">
                Nama Lengkap
              </label>
              <Input
                id="name"
                placeholder="Masukkan nama lengkap"
                value={profile.name}
                onChange={(e) => setProfile({ ...profile, name: e.target.value })}
                className="border-gray-300"
                autoComplete="off"
              />
            </div>

            {/* Email */}
            <div className="flex flex-col">
              <label htmlFor="email" className="mb-1 text-sm font-medium text-gray-700">
                Email
              </label>
              <Input
                id="email"
                placeholder="Email"
                value={profile.email}
                disabled
                className="border-gray-300 bg-gray-50 cursor-not-allowed"
                autoComplete="off"
              />
            </div>

            {/* Jenis Kelamin */}
            <div className="flex flex-col">
              <span className="mb-1 text-sm font-medium text-gray-700">Jenis Kelamin</span>
              <div className="flex gap-4">
                <label className="inline-flex items-center">
                  <input
                    type="radio"
                    name="gender"
                    value="L"
                    checked={profile.gender === "L"}
                    onChange={(e) => setProfile({ ...profile, gender: e.target.value })}
                    className="form-radio text-blue-600"
                  />
                  <span className="ml-2 text-gray-700">Laki-laki</span>
                </label>
                <label className="inline-flex items-center">
                  <input
                    type="radio"
                    name="gender"
                    value="P"
                    checked={profile.gender === "P"}
                    onChange={(e) => setProfile({ ...profile, gender: e.target.value })}
                    className="form-radio text-pink-600"
                  />
                  <span className="ml-2 text-gray-700">Perempuan</span>
                </label>
              </div>
            </div>

            {/* Tanggal Lahir */}
            <div className="flex flex-col">
              <label htmlFor="tanggal_lahir" className="mb-1 text-sm font-medium text-gray-700">Tanggal Lahir</label>
              <Input
                id="tanggal_lahir"
                type="date"
                value={profile.tanggal_lahir}
                onChange={(e) => setProfile({ ...profile, tanggal_lahir: e.target.value })}
                className="border-gray-300 pr-3"
              />
            </div>

            {/* Alamat */}
            <div className="flex flex-col">
              <label htmlFor="address" className="mb-1 text-sm font-medium text-gray-700">Alamat</label>
              <textarea
                id="address"
                placeholder="Masukkan alamat lengkap"
                value={profile.address}
                onChange={(e) => setProfile({ ...profile, address: e.target.value })}
                className="border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 min-h-[100px]"
              />
            </div>

            <Button
              onClick={handleProfileUpdate}
              disabled={loadingProfile}
              className={`mt-4 w-full md:w-auto ${loadingProfile ? "opacity-50 cursor-not-allowed" : ""}`}
            >
              {loadingProfile ? "Menyimpan..." : "Simpan Perubahan"}
            </Button>
          </div>
        </div>
      </div>


      {/* Pembatas */}
      <hr className="border-gray-200" />

      {/* Card Ganti Password */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <h2 className="text-2xl font-semibold mb-4">Ganti Password</h2>
        <div className="space-y-4">
          {/* Current Password */}
          <div className="flex flex-col">
            <label
              htmlFor="current_password"
              className="mb-1 text-sm font-medium text-gray-700"
            >
              Password Saat Ini
            </label>

            <div className="relative">
              <Input
                id="current_password"
                type={showCurrentPassword ? "text" : "password"}
                placeholder="Masukkan password saat ini"
                value={passwordData.current_password}
                onChange={(e) =>
                    setPasswordData({ ...passwordData, current_password: e.target.value })
                }
                className="pr-10 border-gray-300"
                autoComplete="new-password"
              />
              <button
                type="button"
                onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                className="absolute inset-y-0 right-3 flex items-center text-gray-500 hover:text-gray-700"
              >
                {showCurrentPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </div>

          {/* New Password */}
          <div className="flex flex-col">
            <label
              htmlFor="new_password"
              className="mb-1 text-sm font-medium text-gray-700"
            >
              Password Baru
            </label>

            <div className="relative">
              <Input
                id="new_password"
                type={showNewPassword ? "text" : "password"}
                placeholder="Masukkan password baru"
                value={passwordData.password}
                onChange={(e) =>
                    setPasswordData({ ...passwordData, password: e.target.value })
                }
                className="pr-10 border-gray-300"
                autoComplete="new-password"
              />
              <button
                type="button"
                onClick={() => setShowNewPassword(!showNewPassword)}
                className="absolute inset-y-0 right-3 flex items-center text-gray-500 hover:text-gray-700"
              >
                {showNewPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </div>

          {/* Confirm New Password */}
          <div className="flex flex-col">
            <label
              htmlFor="confirm_password"
              className="mb-1 text-sm font-medium text-gray-700"
            >
              Konfirmasi Password Baru
            </label>

            <div className="relative">
              <Input
                id="confirm_password"
                type={showConfirmPassword ? "text" : "password"}
                placeholder="Ulangi password baru"
                value={passwordData.password_confirmation}
                onChange={(e) =>
                    setPasswordData({ ...passwordData, password_confirmation: e.target.value })
                }
                className="pr-10 border-gray-300"
                autoComplete="new-password"
              />
              <button
                type="button"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                className="absolute inset-y-0 right-3 flex items-center text-gray-500 hover:text-gray-700"
              >
                {showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </div>

          <Button
            variant="outline"
            onClick={handlePasswordChange}
            disabled={loadingPassword}
            className={`mt-2 w-full ${loadingPassword ? "opacity-50 cursor-not-allowed" : ""}`}
          >
            {loadingPassword ? "Memproses..." : "Ganti Password"}
          </Button>
        </div>
      </div>
    </div>
  );
}
