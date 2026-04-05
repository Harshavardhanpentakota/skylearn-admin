import { Link, useLocation } from 'react-router-dom';
import {
  LayoutDashboard, Users, BookOpen, Activity, ShieldAlert, LogOut, GraduationCap,
} from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { adminApi } from '@/api/admin';
import { useAuth } from '@/context/AuthContext';
import clsx from 'clsx';

const navItems = [
  { to: '/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
  { to: '/users',     icon: Users,           label: 'Users' },
  { to: '/courses',   icon: BookOpen,        label: 'Courses' },
  { to: '/activity',  icon: Activity,        label: 'Login Activity' },
  { to: '/suspicious', icon: ShieldAlert,    label: 'Suspicious Activity', alert: true },
];

export default function Sidebar() {
  const location = useLocation();
  const { user, logout } = useAuth();

  const { data: suspicious = [] } = useQuery({
    queryKey: ['suspicious'],
    queryFn: adminApi.getSuspiciousActivity,
    staleTime: 60_000,
  });

  return (
    <aside className="flex h-full w-64 flex-col bg-slate-900">
      {/* Logo */}
      <div className="flex items-center gap-2.5 px-5 py-5 border-b border-slate-800">
        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-indigo-600">
          <GraduationCap className="h-4 w-4 text-white" />
        </div>
        <span className="font-semibold text-white tracking-tight">SkyLearn Admin</span>
      </div>

      {/* Nav */}
      <nav className="flex-1 overflow-y-auto px-3 py-4 space-y-0.5">
        {navItems.map(({ to, icon: Icon, label, alert }) => {
          const active = location.pathname === to ||
            (to !== '/dashboard' && location.pathname.startsWith(to));
          return (
            <Link
              key={to}
              to={to}
              className={clsx(
                'flex items-center justify-between rounded-lg px-3 py-2.5 text-sm font-medium transition-colors',
                active
                  ? 'bg-indigo-600 text-white'
                  : 'text-slate-400 hover:bg-slate-800 hover:text-white'
              )}
            >
              <span className="flex items-center gap-3">
                <Icon className="h-4 w-4 shrink-0" />
                {label}
              </span>
              {alert && suspicious.length > 0 && (
                <span className="flex h-5 min-w-5 items-center justify-center rounded-full bg-red-500 px-1 text-xs text-white font-bold">
                  {suspicious.length}
                </span>
              )}
            </Link>
          );
        })}
      </nav>

      {/* Footer */}
      <div className="border-t border-slate-800 p-3">
        <div className="mb-2 px-3 py-2">
          <p className="text-sm font-medium text-white truncate">{user?.name}</p>
          <p className="text-xs text-slate-400 truncate">{user?.email}</p>
        </div>
        <button
          onClick={logout}
          className="flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium text-slate-400 hover:bg-slate-800 hover:text-white transition-colors"
        >
          <LogOut className="h-4 w-4" />
          Sign out
        </button>
      </div>
    </aside>
  );
}
