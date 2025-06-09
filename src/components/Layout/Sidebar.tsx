import { motion } from 'framer-motion';
import { Link, useLocation } from 'react-router-dom';
import { 
  Users2 as UsersIcon,
  BookOpen as ClassesIcon,
  ClipboardCheck as AttendanceIcon,
  Layers as SubjectsIcon,
  Calendar as ScheduleIcon,
  KeyRound as RoleIcon,
  UserPlus as EnrollmentIcon,
  CalendarIcon,
  X, Home
} from 'lucide-react';
import { cn } from '@/lib/utils';

import { useAuth } from '@/context/AuthContext';
import { useState, useEffect } from 'react';
import { type GuruSchedule } from '@/api/jadwal';

const iconMap = {
  Home,
  UsersIcon,
  ClassesIcon,
  CalendarIcon,
  AttendanceIcon,
  SubjectsIcon,
  ScheduleIcon,
  RoleIcon,
  EnrollmentIcon
};

export type IconName = keyof typeof iconMap;

type RoleType = 'admin' | 'guru' | 'siswa' | null;

function parseRole(roleStr?: string): RoleType {
  if (!roleStr) return null;
  const roleLower = roleStr.toLowerCase();
  if (roleLower === 'admin' || roleLower === 'guru' || roleLower === 'siswa') {
    return roleLower;
  }
  return null;
}

export function generateGuruMenu(schedule: GuruSchedule[] | null) {
  const base = [{ label: 'Dashboard', path: '/guru', iconName: "Home" as IconName}];
  if (!schedule) return base;

  const dynamicMenu = schedule.map((item) => ({
    label: `${item.subject.code} ${item.kelas.name} | ${item.subject.singkatan}`,
    path: item.path,
    iconName: "CalendarIcon" as IconName,
  }));

  return [...base, ...dynamicMenu];
}

export function generateSiswaMenu(schedule: GuruSchedule[] | null) {
  const base = [{ label: 'Dashboard', path: '/siswa', iconName: "Home" as IconName }];
  if (!schedule) return base;

  const dynamicMenu = schedule.map((item) => ({
    label: `${item.subject.code} ${item.kelas.name} | ${item.subject.singkatan}`,
    path: item.path,
    iconName: "CalendarIcon" as IconName,
  }));

  return [...base, ...dynamicMenu];
}

export function generateAdminMenu() {
  return [
    { label: 'Dashboard', path: '/admin', iconName: "Home" as IconName },
    { label: 'User', path: '/admin/users', iconName: "UsersIcon" as IconName },
    { label: 'Kelas', path: '/admin/kelas', iconName: "ClassesIcon" as IconName },
    { label: 'Jadwal', path: '/admin/jadwal', iconName: "ScheduleIcon" as IconName },
    { label: 'Subjek', path: '/admin/subjek', iconName: "SubjectsIcon" as IconName },
    { label: 'Role', path: '/admin/roles', iconName: "RoleIcon" as IconName },
    { label: 'Absensi', path: '/admin/absensi', iconName: "AttendanceIcon" as IconName },
    { label: 'Enrollment', path: '/admin/enrollment', iconName: "EnrollmentIcon" as IconName },
  ];
}

export default function Sidebar({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) {
  const location = useLocation();
  const { user, loading, menuItems } = useAuth();
  const [cachedUser, setCachedUser] = useState(user);
  const [cachedMenuItems, setCachedMenuItems] = useState(menuItems);

  useEffect(() => {
    if (!user) return;

    setCachedUser(user);

  }, [user]);

  useEffect(() => {
    if (!menuItems) return;

    setCachedMenuItems(menuItems);

  }, [menuItems]);

  if (loading && !cachedUser && !cachedMenuItems) {
    return <div>Loading sidebar...</div>;
  }

  const currentUser = cachedUser ?? user;

  const currentMenuItems = cachedMenuItems ?? menuItems;

  if (!currentUser) return null;
  if (!currentMenuItems) return null;

  const role: RoleType = parseRole(currentUser.role?.name);

  const sidebarContent = (
    <div className="flex flex-col h-full">
      <div className="p-4 text-xl font-bold border-b text-blue-400 flex justify-between items-center gap-2">
        <div className="flex items-center gap-2">
          <img src="/adaptive_icon.ico" alt="Logo" className="w-6 h-6" />
          <span>EduPlatform</span>
        </div>
        <button className="lg:hidden" onClick={onClose}>
          <X size={24} />
        </button>
      </div>
      <nav className="flex-1 overflow-y-auto mt-2">
        {currentMenuItems.map((item) => {
          const Icon = iconMap[item.iconName];
          if (!Icon) return null;
          const isActive = location.pathname === item.path;
          return (
            <Link
              key={item.path}
              to={item.path}
              className={cn(
                'flex items-center gap-3 px-6 py-3 text-sm font-medium transition-colors',
                isActive
                  ? 'bg-blue-100 text-blue-500 font-semibold'
                  : 'text-gray-700 hover:bg-gray-100'
              )}
            >
              <Icon size={18} />
              {item.label}
            </Link>
          );
        })}
      </nav>
      <div className="p-4 text-xs text-gray-400 text-center border-t">
        Logged in as <strong className="capitalize">{role}</strong>
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop sidebar */}
      <aside className="hidden lg:flex lg:flex-col lg:w-64 lg:fixed lg:top-0 lg:left-0 lg:h-full lg:shadow-md lg:bg-white z-30">
        {sidebarContent}
      </aside>

      {/* Mobile overlay */}
      {isOpen && (
        <div
          onClick={onClose}
          className="fixed inset-0 bg-black bg-opacity-30 z-40 lg:hidden"
        />
      )}

      {/* Mobile sidebar with animation */}
      <motion.aside
        initial={{ x: -300 }}
        animate={{ x: isOpen ? 0 : -300 }}
        transition={{ type: 'spring', stiffness: 300, damping: 30 }}
        className="fixed top-0 left-0 z-50 w-64 h-full bg-white shadow-lg flex flex-col lg:hidden"
      >
        {sidebarContent}
      </motion.aside>
    </>
  );
}
