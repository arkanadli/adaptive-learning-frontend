import { createContext, useContext, useEffect, useState } from 'react';
import type { User } from '@/api/user';
import { type IconName } from '@/components/Layout/Sidebar';

interface AuthContextType {
  user: User | null;
  setUser: (user: User | null) => void;
  logout: () => void;
  loading: boolean;
  menuItems: MenuItem[] | null;
  setMenuItems: (items: MenuItem[] | null) => void;
}

interface MenuItem {
  label: string;
  path: string;
  iconName: IconName;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [menuItems, setMenuItems] = useState<MenuItem[] | null>(null);

  // Load user & menuItems dari localStorage saat mount
  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    const storedMenuItems = localStorage.getItem('menuItems');

    if (storedUser) {
      try {
        setUser(JSON.parse(storedUser));
      } catch (e) {
        console.error('Gagal parsing user dari localStorage', e);
      }
    } else {
      console.log('Tidak ditemukan user di localStorage');
    }

    if (storedMenuItems) {
      try {
        setMenuItems(JSON.parse(storedMenuItems));
      } catch (e) {
        console.error('Gagal parsing menuItems dari localStorage', e);
      }
    }

    setLoading(false);
  }, []);

  useEffect(() => {
    if (menuItems) {
      localStorage.setItem('menuItems', JSON.stringify(menuItems));
    } else {
      localStorage.removeItem('menuItems');
    }
  }, [menuItems]);

  const logout = () => {
    localStorage.clear();
    setUser(null);
    setMenuItems(null);
  };

  return (
    <AuthContext.Provider value={{ user, setUser, logout, loading, menuItems, setMenuItems }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
