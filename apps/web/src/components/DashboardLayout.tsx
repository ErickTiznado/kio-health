import { type FC, type ReactNode, useState } from 'react';
import { NavLink, useNavigate, useLocation } from 'react-router-dom';
import { useAuthStore } from '../stores/auth.store';
import { ThemeToggle } from './common/ThemeToggle';
import {
  LayoutDashboard,
  Calendar,
  Users,
  BookOpen,
  Ruler,
  Settings,
  LogOut,
  ChevronRight,
  Menu,
  X,
  DollarSign,
  UserPlus,
  CalendarPlus,
} from 'lucide-react';
import { PatientModal } from './patients/PatientModal';
import { ScheduleAppointmentModal } from '../features/calendar/components/ScheduleAppointmentModal';
import { useCreatePatient } from '../hooks/use-patients';
import type { PatientFormValues } from '../schemas/patients.schema';

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
  { to: '/patients', label: 'Pacientes', icon: <Users size={20} /> },
  { to: '/agenda', label: 'Agenda', icon: <Calendar size={20} /> },
  { to: '/bitacora', label: 'Bitácora', icon: <BookOpen size={20} /> },
  { to: '/finance', label: 'Finanzas', icon: <DollarSign size={20} /> },
];

const NUTRITIONIST_NAV: NavItem[] = [
  { to: '/dashboard', label: 'Dashboard', icon: <LayoutDashboard size={20} /> },
  { to: '/patients', label: 'Pacientes', icon: <Users size={20} /> },
  { to: '/agenda', label: 'Agenda', icon: <Calendar size={20} /> },
  { to: '/measurements', label: 'Mediciones', icon: <Ruler size={20} /> },
  { to: '/finance', label: 'Finanzas', icon: <DollarSign size={20} /> },
];

/**
 * Professional Dashboard Layout with fixed sidebar.
 * Active state: purple accent bar on the left.
 */
export const DashboardLayout: FC<DashboardLayoutProps> = ({ children }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, logout } = useAuthStore();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  
  // Quick Actions State
  const [isPatientModalOpen, setIsPatientModalOpen] = useState(false);
  const [isAppointmentModalOpen, setIsAppointmentModalOpen] = useState(false);
  const createPatientMutation = useCreatePatient();

  const clinicianType = user?.profile?.type;
  const navItems = clinicianType === 'NUTRITIONIST' ? NUTRITIONIST_NAV : PSYCHOLOGIST_NAV;

  const handleLogout = async () => {
    setSidebarOpen(false);
    await logout();
    navigate('/login', { replace: true });
  };
  
  const handleCreatePatient = (data: PatientFormValues) => {
    createPatientMutation.mutate(data, {
      onSuccess: () => {
        setIsPatientModalOpen(false);
      },
    });
  };

  const userName = user?.email?.split('@')[0] || 'Doctor';
  const initials = userName.slice(0, 2).toUpperCase();

  // Determine current page label for breadcrumb
  const currentNavItem = [...navItems, { to: '/settings', label: 'Configuración' }].find(
    (item) => item.to === location.pathname
  );
  const pageLabel = currentNavItem?.label || 'Dashboard';

  return (
    <div className="min-h-screen bg-bg flex transition-colors duration-200">
      {/* Mobile Sidebar Overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/30 z-30 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`w-64 lg:w-60 xl:w-64 bg-surface dark:bg-slate-900 border-r border-gray-200 dark:border-slate-800 flex flex-col fixed h-full z-40 transition-all duration-200 ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full'
        } lg:translate-x-0`}
      >
        {/* Logo */}
        <div className="h-16 flex items-center justify-between px-5 border-b border-transparent dark:border-slate-800">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 bg-gradient-to-br from-kio to-kanji rounded-xl flex items-center justify-center shadow-sm">
              <span className="text-white font-bold text-sm">K</span>
            </div>
            <div>
              <span className="font-bold text-kanji dark:text-kio text-lg">Kio</span>
              <span className="text-gray-400 dark:text-kanji text-lg ml-0.5">Health</span>
            </div>
          </div>
          <button
            type="button"
            onClick={() => setSidebarOpen(false)}
            className="lg:hidden text-gray-400 hover:text-kanji"
          >
            <X size={20} />
          </button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 py-4 px-3 overflow-y-auto">
          <ul className="space-y-0.5">
            {navItems.map((item) => (
              <li key={item.to}>
                <NavLink
                  to={item.to}
                  onClick={() => setSidebarOpen(false)}
                  className={({ isActive }) =>
                    `group flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-150 relative ${
                      isActive
                        ? 'bg-kio-light dark:bg-kio/10 text-kio'
                        : 'text-gray-600 dark:text-kio hover:bg-surface/80 dark:hover:bg-slate-800 hover:text-kanji dark:hover:text-kio'
                    }`
                  }
                >
                  {({ isActive }) => (
                    <>
                      {/* Active Indicator Bar */}
                      {isActive && (
                        <span className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-6 bg-kio rounded-r-full shadow-[0_0_10px_rgba(174,147,254,0.4)]" />
                      )}
                      <span className={isActive ? 'text-kio' : 'text-gray-400 dark:text-kanji group-hover:text-kanji dark:group-hover:text-kio'}>
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
        <div className="px-3 pb-4 border-t border-gray-100 dark:border-slate-800 pt-3 space-y-0.5">
          <NavLink
            to="/settings"
            onClick={() => setSidebarOpen(false)}
            className={({ isActive }) =>
              `group flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-150 relative ${
                isActive
                  ? 'bg-kio-light dark:bg-kio/10 text-kio'
                  : 'text-gray-600 dark:text-kio hover:bg-surface/80 dark:hover:bg-slate-800 hover:text-kanji dark:hover:text-kio'
              }`
            }
          >
            {({ isActive }) => (
              <>
                {isActive && (
                  <span className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-6 bg-kio rounded-r-full" />
                )}
                <Settings size={20} className={isActive ? 'text-kio' : 'text-gray-400 dark:text-kanji group-hover:text-kanji dark:group-hover:text-kio'} />
                Configuración
              </>
            )}
          </NavLink>
          <button
            type="button"
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-gray-500 dark:text-kanji hover:bg-red-50 dark:hover:bg-red-900/20 hover:text-red-600 dark:hover:text-red-400 transition-all duration-150"
          >
            <LogOut size={20} />
            Cerrar sesión
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col lg:ml-60 xl:ml-64 transition-all duration-200">
        {/* Top Header */}
        <header className="h-16 bg-surface dark:bg-slate-900 border-b border-gray-200 dark:border-slate-800 flex items-center justify-between px-6 sticky top-0 z-20 transition-colors duration-200">
          {/* Hamburger + Breadcrumb */}
          <div className="flex items-center gap-3 text-sm">
            <button
              type="button"
              onClick={() => setSidebarOpen(true)}
              className="lg:hidden text-gray-500 dark:text-kio hover:text-kanji dark:hover:text-kio"
            >
              <Menu size={22} />
            </button>
            <span className="text-gray-400 dark:text-kanji font-medium">Inicio</span>
            <ChevronRight size={14} className="text-gray-300 dark:text-kanji/60" />
            <span className="text-kanji dark:text-kio font-bold">{pageLabel}</span>
          </div>

          {/* User Avatar */}
          <div className="flex items-center gap-3">
            {/* Quick Actions (Header) */}
            <div className="flex items-center gap-1 mr-2">
              <button
                onClick={() => setIsPatientModalOpen(true)}
                className="p-2 rounded-full transition-all bg-surface dark:bg-slate-800 text-gray-400 dark:text-slate-400 hover:bg-purple-50 dark:hover:bg-purple-900/20 hover:text-kanji dark:hover:text-kio"
                title="Nuevo Paciente"
              >
                <UserPlus size={20} />
              </button>
              <button
                onClick={() => setIsAppointmentModalOpen(true)}
                className="p-2 rounded-full transition-all bg-surface dark:bg-slate-800 text-gray-400 dark:text-slate-400 hover:bg-emerald-50 dark:hover:bg-emerald-900/20 hover:text-emerald-600 dark:hover:text-emerald-400"
                title="Agendar Cita"
              >
                <CalendarPlus size={20} />
              </button>
            </div>
            
            <div className="w-px h-6 bg-gray-200 dark:bg-slate-700 mx-1" />

            <ThemeToggle />
            <div className="w-px h-6 bg-gray-200 dark:bg-slate-700 mx-1" />
            <div className="text-right hidden sm:block">
              <p className="text-sm font-medium text-kanji dark:text-kio">{userName}</p>
              <p className="text-xs text-gray-400 dark:text-kanji">
                {clinicianType === 'PSYCHOLOGIST' ? 'Psicólogo' : 'Nutricionista'}
              </p>
            </div>
            <div className="w-10 h-10 bg-gradient-to-br from-kio to-kanji rounded-full flex items-center justify-center shadow-sm ring-2 ring-surface dark:ring-slate-800">
              <span className="text-white font-semibold text-sm">{initials}</span>
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 p-6 overflow-auto">{children}</main>

        {/* Global Modals */}
        <PatientModal 
            isOpen={isPatientModalOpen} 
            onClose={() => setIsPatientModalOpen(false)} 
            onSubmit={handleCreatePatient}
            isLoading={createPatientMutation.isPending}
         />

         <ScheduleAppointmentModal
            isOpen={isAppointmentModalOpen}
            onClose={() => setIsAppointmentModalOpen(false)}
            initialDate={new Date()}
            isRescheduleMode={false}
         />
      </div>
    </div>
  );
};

