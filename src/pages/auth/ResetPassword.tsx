import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { Eye, EyeOff } from 'lucide-react';
import { resetPassword } from '@/api/auth';

const ResetPassword = () => {
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token') || '';
  const email = searchParams.get('email') || '';

  const [password, setPassword] = useState('');
  const [passwordConfirmation, setPasswordConfirmation] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showPasswordConfirmation, setShowPasswordConfirmation] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    if (!token || !email) {
      setError('Link reset password tidak valid atau sudah kadaluarsa.');
    }
  }, [token, email]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setMessage('');
    setLoading(true);

    try {
      const res = await resetPassword({
        token,
        email,
        password,
        password_confirmation: passwordConfirmation
      });
      setMessage(res.message || 'Password berhasil direset. Silakan login kembali.');
      navigate('/login');
    } catch (err: any) {
      const msg = err.response?.data?.message ?? 'Terjadi kesalahan saat mereset password.';
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-blue-50 px-4">
      <div className="w-full max-w-md bg-white p-8 rounded-xl shadow-lg">
        <h2 className="text-2xl font-bold text-center text-blue-500 mb-4">Reset Password</h2>

        {message && <div className="bg-green-100 text-green-700 px-4 py-2 rounded mb-4">{message}</div>}
        {error && <div className="bg-red-100 text-red-700 px-4 py-2 rounded mb-4">{error}</div>}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="relative">
            <label className="block text-sm font-medium mb-1 text-gray-700">Password Baru</label>
            <input
              type={showPassword ? 'text' : 'password'}
              className="w-full px-3 py-2 pr-10 border rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              minLength={8}
            />
            <button
              type="button"
              className="absolute top-9 right-3 text-gray-500 hover:text-gray-700"
              onClick={() => setShowPassword((prev) => !prev)}
              tabIndex={-1}
            >
              {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
            </button>
          </div>

          <div className="relative">
            <label className="block text-sm font-medium mb-1 text-gray-700">Konfirmasi Password</label>
            <input
              type={showPasswordConfirmation ? 'text' : 'password'}
              className="w-full px-3 py-2 pr-10 border rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
              value={passwordConfirmation}
              onChange={(e) => setPasswordConfirmation(e.target.value)}
              required
              minLength={8}
            />
            <button
              type="button"
              className="absolute top-9 right-3 text-gray-500 hover:text-gray-700"
              onClick={() => setShowPasswordConfirmation((prev) => !prev)}
              tabIndex={-1}
            >
              {showPasswordConfirmation ? <EyeOff size={18} /> : <Eye size={18} />}
            </button>
          </div>

          <button
            type="submit"
            disabled={loading || !token || !email}
            className={`w-full bg-blue-400 text-white p-2 rounded-lg font-semibold transition duration-200 ${
              loading ? 'opacity-50 cursor-not-allowed' : 'hover:bg-blue-500'
            }`}
          >
            {loading ? 'Memproses...' : 'Reset Password'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default ResetPassword;
