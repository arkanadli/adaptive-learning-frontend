import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import InputField from '@/components/InputField';
import { register } from '@/api/auth';
import { Eye, EyeOff } from 'lucide-react';

const Register = () => {
  const [form, setForm] = useState({
    name: '',
    email: '',
    password: '',
    password_confirmation: '',
    role_id: 1,
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showPasswordConfirm, setShowPasswordConfirm] = useState(false);
  const navigate = useNavigate();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setForm({ ...form, [name]: value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (form.password !== form.password_confirmation) {
      setError('Password dan konfirmasi password tidak cocok.');
      return;
    }

    setLoading(true);
    try {
      await register(form);
      navigate('/login');
    } catch (err: any) {
      const errors = err.response?.data?.errors as { [key: string]: string[] };
      const message =
        errors && typeof errors === 'object'
          ? Object.values(errors)[0][0]
          : err.response?.data?.message || 'Pendaftaran gagal.';
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-blue-50 px-4">
      <div className="w-full max-w-md bg-white p-8 rounded-xl shadow-lg">
        <h2 className="text-3xl font-bold text-center text-blue-500 mb-6">Daftar Akun</h2>

        {error && <div className="bg-red-100 text-red-700 px-4 py-2 rounded mb-4">{error}</div>}

        <form onSubmit={handleSubmit} className="space-y-4">
          <InputField
            label="Nama Lengkap"
            type="text"
            name="name"
            placeholder="John Doe"
            value={form.name}
            onChange={handleChange}
            required
          />
          <InputField
            label="Email"
            type="email"
            name="email"
            placeholder="example@gmail.com"
            value={form.email}
            onChange={handleChange}
            required
          />

          {/* Password */}
          <div>
            <label className="block text-sm font-medium mb-1 text-gray-700">Password</label>
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                name="password"
                value={form.password}
                onChange={handleChange}
                className="w-full px-3 py-2 border rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
                required
              />
              <button
                type="button"
                className="absolute right-3 top-2.5 text-gray-500 hover:text-gray-700"
                onClick={() => setShowPassword(!showPassword)}
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </div>

          {/* Konfirmasi Password */}
          <div>
            <label className="block text-sm font-medium mb-1 text-gray-700">Konfirmasi Password</label>
            <div className="relative">
              <input
                type={showPasswordConfirm ? 'text' : 'password'}
                name="password_confirmation"
                value={form.password_confirmation}
                onChange={handleChange}
                className="w-full px-3 py-2 border rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
                required
              />
              <button
                type="button"
                className="absolute right-3 top-2.5 text-gray-500 hover:text-gray-700"
                onClick={() => setShowPasswordConfirm(!showPasswordConfirm)}
              >
                {showPasswordConfirm ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className={`w-full bg-blue-400 text-white p-2 rounded-lg font-semibold transition duration-200 ${
              loading ? 'opacity-50 cursor-not-allowed' : 'hover:bg-blue-500'
            }`}
          >
            {loading ? 'Mendaftarkan...' : 'Daftar'}
          </button>
        </form>

        <p className="text-center text-sm mt-6 text-gray-600">
          Sudah punya akun?{' '}
          <Link to="/login" className="text-blue-400 hover:underline">
            Login di sini
          </Link>
        </p>
      </div>
    </div>
  );
};

export default Register;
