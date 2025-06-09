import React, { useState } from 'react';
import InputField from '@/components/InputField';
import { login } from '@/api/auth';
import { Eye, EyeOff } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { fetchGuruSchedule, fetchSiswaSchedule } from '@/api/jadwal';
import { generateAdminMenu, generateGuruMenu, generateSiswaMenu } from '@/components/Layout/Sidebar';

const Login = () => {
  const navigate = useNavigate();
  const { setUser, setMenuItems } = useAuth();
  const [form, setForm] = useState({ email: '', password: '', remember: false });
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target;
    setForm({ ...form, [name]: type === 'checkbox' ? checked : value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const res = await login(form, setUser);
      const user = res.user;
      setUser(user);

      const role = user.role.name.toLowerCase();
      if (role === 'guru') {
        const schedule = await fetchGuruSchedule(user.id);
        setMenuItems(generateGuruMenu(schedule));
        navigate('/guru');
      } else if (role === 'siswa') {
        const schedule = await fetchSiswaSchedule(user.id);
        setMenuItems(generateSiswaMenu(schedule));
        navigate('/siswa');
      } else {
        setMenuItems(generateAdminMenu());
        navigate('/admin');
      }
    } catch (err: any) {
      const message = err.response?.data?.message ||
                      err.response?.data?.errors?.email?.[0] ||
                      'Email atau password salah.';
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-blue-50 px-4">
      <div className="w-full max-w-md bg-white p-8 rounded-xl shadow-lg">
        <h2 className="text-3xl font-bold text-center text-blue-500 mb-6">Login</h2>

        {error && <div className="bg-red-100 text-red-700 px-4 py-2 rounded mb-4">{error}</div>}

        <form onSubmit={handleSubmit} className="space-y-4">
          <InputField
            label="Email"
            type="email"
            name="email"
            value={form.email}
            placeholder="example@gmail.com"
            onChange={handleChange}
            required
          />

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

          <div className="flex items-center justify-between">
            <label className="flex items-center text-sm text-gray-700">
              <input
                type="checkbox"
                name="remember"
                checked={form.remember}
                onChange={handleChange}
                className="mr-2"
              />
              Remember me
            </label>
            <Link to="/forgot-password" className="text-sm text-blue-400 hover:underline">
              Lupa password?
            </Link>
          </div>

          <button
            type="submit"
            disabled={loading}
            className={`w-full bg-blue-400 text-white p-2 rounded-lg font-semibold transition duration-200 ${
              loading ? 'opacity-50 cursor-not-allowed' : 'hover:bg-blue-500'
            }`}
          >
            {loading ? 'Memproses...' : 'Login'}
          </button>
        </form>

        <p className="text-center text-sm mt-6 text-gray-600">
          Belum punya akun?{' '}
          <Link to="/register" className="text-blue-400 hover:underline">
            Daftar di sini
          </Link>
        </p>
      </div>
    </div>
  );
};

export default Login;
