import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronDown, LogOut, User } from 'lucide-react';
import { logout } from '@/api/auth';
import { useAuth } from '@/context/AuthContext';
import { BASE_URL } from '@/pages/kelas/MateriDetail';

export default function Topbar({ onToggleSidebar }: { onToggleSidebar?: () => void }) {
  const [openDropdown, setOpenDropdown] = useState(false);
  const navigate = useNavigate();
  const { user } = useAuth();
  const role = user?.role.name.toLowerCase();
  const name = user?.name;

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  return (
    <header className="h-16 bg-white border-b shadow-sm flex items-center justify-between px-4 lg:px-6 fixed top-0 left-0 right-0 z-20">
      {/* Mobile Hamburger */}
      <button
        onClick={onToggleSidebar}
        className="lg:hidden text-gray-700 focus:outline-none"
      >
        <svg className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
        </svg>
      </button>

      <div className="text-lg font-semibold ml-2">Dashboard</div>

      <div className="relative">
        <button
          onClick={() => setOpenDropdown(!openDropdown)}
          className="flex items-center gap-3 text-sm bg-gray-100 px-3 py-1.5 rounded-full hover:bg-gray-200 transition duration-200"
        >
          {user?.profile_path ? (
            <img
              src={BASE_URL + user.profile_path}
              alt="Foto Profil"
              className="w-8 h-8 rounded-full object-cover"
            />
          ) : (
            <div className="w-8 h-8 rounded-full bg-gray-300 flex items-center justify-center text-white font-bold text-sm">
              {name?.charAt(0).toUpperCase()}
            </div>
          )}
          <span className="font-medium hidden sm:block">{name}</span>
          <ChevronDown size={16} />
        </button>

        {openDropdown && (
          <div className="absolute right-0 mt-2 w-56 bg-white border border-gray-200 rounded-xl shadow-xl z-50 text-sm overflow-hidden animate-fade-in">
            <div className="px-4 py-3 bg-gray-50 border-b">
              <div className="font-semibold text-gray-800 capitalize">{name}</div>
              <div className="text-xs text-gray-500">{role}</div>
            </div>
            <button
              onClick={() => navigate('/profile')}
              className="w-full text-left px-4 py-2 hover:bg-gray-100 flex items-center gap-2 transition duration-150"
            >
              <User size={16} />
              Profil
            </button>
            <button
              onClick={handleLogout}
              className="w-full text-left px-4 py-2 hover:bg-gray-100 text-red-500 flex items-center gap-2 transition duration-150"
            >
              <LogOut size={16} />
              Logout
            </button>
          </div>
        )}
      </div>
    </header>
  );
}
