import type { FC, ReactNode } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useAuthStore } from '../stores/auth.store';
import {
  LayoutDashboard,
  Calendar,
  Users,
  BookOpen,
  Ruler,
  Settings,
  LogOut,
  ChevronRight,
} from 'lucide-react';

interface DashboardLayoutProps {
  children: ReactNode;
}

interface NavItem {
  to: string;
  label: string;
  icon: ReactNode;
}

const PSYCHOLOGIST_NAV: NavItem[] = [
  { to: '/dashboard', label: 'Dashboard', icon: <LayoutDashboard size={20} /> },
  { to: '/agenda', label: 'Agenda', icon: <Calendar size={20} /> },
  { to: '/patients', label: 'Pacientes', icon: <Users size={20} /> },
  { to: '/bitacora', label: 'Bitácora', icon: <BookOpen size={20} /> },
];

const NUTRITIONIST_NAV: NavItem[] = [
  { to: '/dashboard', label: 'Dashboard', icon: <LayoutDashboard size={20} /> },
  { to: '/agenda', label: 'Agenda', icon: <Calendar size={20} /> },
  { to: '/patients', label: 'Pacientes', icon: <Users size={20} /> },
  { to: '/measurements', label: 'Mediciones', icon: <Ruler size={20} /> },
];

/**
 * Professional Dashboard Layout with fixed sidebar.
 * Active state: purple accent bar on the left.
 */
export const DashboardLayout: FC<DashboardLayoutProps> = ({ children }) => {
  const navigate = useNavigate();
  const { user, logout } = useAuthStore();

  const clinicianType = user?.profile?.type;
  const navItems = clinicianType === 'NUTRITIONIST' ? NUTRITIONIST_NAV : PSYCHOLOGIST_NAV;

  const handleLogout = () => {
    logout();
    navigate('/login', { replace: true });
  };

  const userName = user?.email?.split('@')[0] || 'Doctor';
  const initials = userName.slice(0, 2).toUpperCase();

  return (
    <div className="min-h-screen bg-bg flex">
      {/* Fixed Sidebar */}
      <aside className="w-64 bg-white border-r border-gray-200 flex flex-col fixed h-full z-10">
        {/* Logo */}
        <div className="h-16 flex items-center gap-3 px-5 border-b border-gray-100">
          <div className="w-9 h-9 bg-gradient-to-br from-kio to-kanji rounded-xl flex items-center justify-center shadow-sm">
            <span className="text-white font-bold text-sm">K</span>
          </div>
          <div>
            <span className="font-bold text-kanji text-lg">Kio</span>
            <span className="text-gray-400 text-lg ml-0.5">Health</span>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 py-4 px-3 overflow-y-auto">
          <p className="text-[11px] font-semibold text-gray-400 uppercase tracking-wider px-3 mb-2">
            Menú
          </p>
          <ul className="space-y-0.5">
            {navItems.map((item) => (
              <li key={item.to}>
                <NavLink
                  to={item.to}
                  className={({ isActive }) =>
                    `group flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-150 relative ${
                      isActive
                        ? 'bg-kio-light text-kio'
                        : 'text-gray-600 hover:bg-gray-50 hover:text-kanji'
                    }`
                  }
                >
                  {({ isActive }) => (
                    <>
                      {/* Active Indicator Bar */}
                      {isActive && (
                        <span className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-6 bg-kio rounded-r-full" />
                      )}
                      <span className={isActive ? 'text-kio' : 'text-gray-400 group-hover:text-kanji'}>
                        {item.icon}
                      </span>
                      {item.label}
                    </>
                  )}
                </NavLink>
              </li>
            ))}
          </ul>
        </nav>

        {/* Bottom Section */}
        <div className="px-3 pb-4 border-t border-gray-100 pt-3 space-y-0.5">
          <NavLink
            to="/settings"
            className={({ isActive }) =>
              `group flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-150 relative ${
                isActive
                  ? 'bg-kio-light text-kio'
                  : 'text-gray-600 hover:bg-gray-50 hover:text-kanji'
              }`
            }
          >
            {({ isActive }) => (
              <>
                {isActive && (
                  <span className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-6 bg-kio rounded-r-full" />
                )}
                <Settings size={20} className={isActive ? 'text-kio' : 'text-gray-400 group-hover:text-kanji'} />
                Configuración
              </>
            )}
          </NavLink>
          <button
            type="button"
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-gray-500 hover:bg-red-50 hover:text-red-600 transition-all duration-150"
          >
            <LogOut size={20} />
            Cerrar sesión
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col ml-64">
        {/* Top Header */}
        <header className="h-16 bg-white border-b border-gray-200 flex items-center justify-between px-6 sticky top-0 z-5">
          {/* Breadcrumb / Title */}
          <div className="flex items-center gap-2 text-sm">
            <span className="text-gray-400">Inicio</span>
            <ChevronRight size={14} className="text-gray-300" />
            <span className="text-kanji font-medium">Dashboard</span>
          </div>

          {/* User Avatar */}
          <div className="flex items-center gap-3">
            <div className="text-right hidden sm:block">
              <p className="text-sm font-medium text-kanji">{userName}</p>
              <p className="text-xs text-gray-400">
                {clinicianType === 'PSYCHOLOGIST' ? 'Psicólogo' : 'Nutricionista'}
              </p>
            </div>
            <div className="w-10 h-10 bg-gradient-to-br from-kio to-kanji rounded-full flex items-center justify-center shadow-sm">
              <span className="text-white font-semibold text-sm">{initials}</span>
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 p-6 overflow-auto">{children}</main>
      </div>
    </div>
  );
};
