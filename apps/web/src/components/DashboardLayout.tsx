import { type FC, type ReactNode, useState, useRef, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { NavLink, useNavigate, useLocation } from 'react-router-dom';
import { useAuthStore } from '../stores/auth.store';
import { ThemeToggle } from './common/ThemeToggle';
import {
  LayoutDashboard,
  Calendar,
  Users,
  Settings,
  LogOut,
  ChevronRight,
  Menu,
  X,
  DollarSign,
  Building2,
  Search,
  Plus,
  UserPlus,
  CalendarPlus,
} from 'lucide-react';
import { AnimatePresence, motion } from 'framer-motion';
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
  tourId?: string;
}

const PSYCHOLOGIST_NAV: NavItem[] = [
  { to: '/dashboard', label: 'Dashboard', icon: <LayoutDashboard size={20} />, tourId: 'sidebar-dashboard' },
  { to: '/patients', label: 'Pacientes', icon: <Users size={20} />, tourId: 'sidebar-patients' },
  { to: '/agenda', label: 'Agenda', icon: <Calendar size={20} />, tourId: 'sidebar-agenda' },
  { to: '/finance', label: 'Finanzas', icon: <DollarSign size={20} />, tourId: 'sidebar-finance' },
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
  const [isQuickMenuOpen, setIsQuickMenuOpen] = useState(false);
  const [dropdownPos, setDropdownPos] = useState({ top: 0, right: 0 });
  const quickBtnRef = useRef<HTMLButtonElement>(null);
  const quickMenuRef = useRef<HTMLDivElement>(null);
  const createPatientMutation = useCreatePatient();

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (
        quickMenuRef.current && !quickMenuRef.current.contains(e.target as Node) &&
        quickBtnRef.current && !quickBtnRef.current.contains(e.target as Node)
      ) {
        setIsQuickMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const openQuickMenu = () => {
    if (quickBtnRef.current) {
      const rect = quickBtnRef.current.getBoundingClientRect();
      setDropdownPos({ top: rect.bottom + 8, right: window.innerWidth - rect.right });
    }
    setIsQuickMenuOpen((v) => !v);
  };

  const clinicNavItem: NavItem[] = user?.profile?.plan === 'CLINIC'
    ? [{ to: '/clinic', label: 'Clínica', icon: <Building2 size={20} /> }]
    : [];
  const navItems = [...PSYCHOLOGIST_NAV, ...clinicNavItem];

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

  const userName = user?.fullName || user?.email?.split('@')[0] || 'Doctor';
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
        <div className="h-28 flex items-center justify-between px-5 border-b border-transparent dark:border-slate-800">
          <div className="flex items-center gap-0">
            <div className="w-28 h-28 overflow-hidden">
              <img src="/logo.png" alt="Kio Health" className="w-full h-full object-contain" />
            </div>
            <span className="text-gray-400 dark:text-kanji text-lg ml-1">Health</span>
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
                  {...(item.tourId ? { 'data-tour': item.tourId } : {})}
                  className={({ isActive }) =>
                    `group flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-150 relative ${
                      isActive
                        ? 'bg-kio-light dark:bg-kio/10 text-kio'
                        : 'text-gray-600 dark:text-slate-400 hover:bg-surface/80 dark:hover:bg-slate-800 hover:text-kanji dark:hover:text-kio'
                    }`
                  }
                >
                  {({ isActive }) => (
                    <>
                      {/* Active Indicator Bar */}
                      {isActive && (
                        <span className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-6 bg-kio rounded-r-full shadow-[0_0_10px_rgba(174,147,254,0.4)]" />
                      )}
                      <span className={isActive ? 'text-kio' : 'text-gray-400 dark:text-slate-500 group-hover:text-kanji dark:group-hover:text-kio'}>
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
            data-tour="sidebar-settings"
            className={({ isActive }) =>
              `group flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-150 relative ${
                isActive
                  ? 'bg-kio-light dark:bg-kio/10 text-kio'
                  : 'text-gray-600 dark:text-slate-400 hover:bg-surface/80 dark:hover:bg-slate-800 hover:text-kanji dark:hover:text-kio'
              }`
            }
          >
            {({ isActive }) => (
              <>
                {isActive && (
                  <span className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-6 bg-kio rounded-r-full" />
                )}
                <Settings size={20} className={isActive ? 'text-kio' : 'text-gray-400 dark:text-slate-500 group-hover:text-kanji dark:group-hover:text-kio'} />
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
        <header className="h-16 bg-surface dark:bg-slate-900 border-b border-gray-200 dark:border-slate-800 flex items-center justify-between px-4 sm:px-6 sticky top-0 z-30 transition-colors duration-200">
          {/* Hamburger + Logo (mobile) + Breadcrumb */}
          <div className="flex items-center gap-3 text-sm">
            <button
              type="button"
              onClick={() => setSidebarOpen(true)}
              className="lg:hidden text-gray-500 dark:text-slate-400 hover:text-kanji dark:hover:text-kio"
            >
              <Menu size={22} />
            </button>
            {/* Logo — solo visible en móvil (el sidebar está oculto) */}
            <div className="lg:hidden flex items-center">
              <img src="/logo.png" alt="Kio" className="h-8 w-8 object-contain" />
            </div>
            <span className="hidden sm:inline text-gray-400 dark:text-slate-500 font-medium">Inicio</span>
            <ChevronRight size={14} className="hidden sm:inline text-gray-300 dark:text-slate-600" />
            <span className="text-kanji dark:text-kio font-bold">{pageLabel}</span>
          </div>

          {/* Right side actions */}
          <div className="flex items-center gap-3">
            {/* Búsqueda ⌘K */}
            <button
              onClick={() => window.dispatchEvent(new KeyboardEvent('keydown', { key: 'k', metaKey: true, bubbles: true }))}
              aria-label="Búsqueda global (⌘K)"
              className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm text-gray-400 dark:text-slate-500 bg-gray-100 dark:bg-slate-800 hover:text-kanji dark:hover:text-kio transition-colors border border-gray-200 dark:border-slate-700"
            >
              <Search size={14} aria-hidden="true" />
              <kbd className="text-[11px] font-mono bg-white dark:bg-slate-700 border border-gray-200 dark:border-slate-600 px-1.5 py-0.5 rounded shadow-sm leading-none">
                ⌘K
              </kbd>
            </button>

            {/* Botón único "+ Nuevo" con dropdown (portal para evitar clipping del header sticky) */}
            <div>
              <button
                ref={quickBtnRef}
                type="button"
                data-tour="tour-quick-actions"
                onClick={openQuickMenu}
                className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-sm font-semibold text-white bg-kio shadow-md shadow-kio/20 hover:bg-kio/90 active:scale-95 transition-all duration-150"
              >
                <motion.span
                  animate={{ rotate: isQuickMenuOpen ? 45 : 0 }}
                  transition={{ duration: 0.2 }}
                  className="flex"
                >
                  <Plus size={16} strokeWidth={2.5} />
                </motion.span>
                <span className="hidden sm:inline">Nuevo</span>
              </button>
            </div>

            {/* Portal dropdown — renderizado en body para escapar el stacking context del header */}
            {createPortal(
              <AnimatePresence>
                {isQuickMenuOpen && (
                  <motion.div
                    ref={quickMenuRef}
                    initial={{ opacity: 0, scale: 0.95, y: -6 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95, y: -6 }}
                    transition={{ duration: 0.15, ease: 'easeOut' }}
                    style={{ position: 'fixed', top: dropdownPos.top, right: dropdownPos.right }}
                    className="w-56 bg-white dark:bg-slate-900 border border-gray-100 dark:border-slate-700 rounded-2xl shadow-xl shadow-black/10 dark:shadow-black/40 overflow-hidden z-[9999]"
                  >
                    <button
                      type="button"
                      onClick={() => { setIsPatientModalOpen(true); setIsQuickMenuOpen(false); }}
                      className="w-full flex items-center gap-3 px-4 py-3.5 hover:bg-gray-50 dark:hover:bg-slate-800 transition-colors group"
                    >
                      <span className="w-8 h-8 rounded-xl bg-kio/10 dark:bg-kio/20 flex items-center justify-center shrink-0 group-hover:bg-kio/20 dark:group-hover:bg-kio/30 transition-colors">
                        <UserPlus size={15} className="text-kio" />
                      </span>
                      <div className="text-left">
                        <p className="text-sm font-semibold text-kanji dark:text-white leading-tight">Nuevo Paciente</p>
                        <p className="text-xs text-gray-400 dark:text-slate-500 leading-tight mt-0.5">Registrar expediente</p>
                      </div>
                    </button>

                    <div className="mx-4 h-px bg-gray-100 dark:bg-slate-800" />

                    <button
                      type="button"
                      onClick={() => { setIsAppointmentModalOpen(true); setIsQuickMenuOpen(false); }}
                      className="w-full flex items-center gap-3 px-4 py-3.5 hover:bg-gray-50 dark:hover:bg-slate-800 transition-colors group"
                    >
                      <span className="w-8 h-8 rounded-xl bg-emerald-50 dark:bg-emerald-900/30 flex items-center justify-center shrink-0 group-hover:bg-emerald-100 dark:group-hover:bg-emerald-900/50 transition-colors">
                        <CalendarPlus size={15} className="text-emerald-600 dark:text-emerald-400" />
                      </span>
                      <div className="text-left">
                        <p className="text-sm font-semibold text-kanji dark:text-white leading-tight">Nueva Cita</p>
                        <p className="text-xs text-gray-400 dark:text-slate-500 leading-tight mt-0.5">Agendar sesión</p>
                      </div>
                    </button>
                  </motion.div>
                )}
              </AnimatePresence>,
              document.body,
            )}

            <div className="w-px h-6 bg-gray-200 dark:bg-slate-700" />

            <ThemeToggle />
            <div className="w-px h-6 bg-gray-200 dark:bg-slate-700 mx-1" />
            <div className="text-right hidden sm:block">
              <p className="text-sm font-medium text-kanji dark:text-kio">{userName}</p>
              <p className="text-xs text-gray-400 dark:text-kanji">
                Psicólogo
              </p>
            </div>
            <div className="w-10 h-10 bg-gradient-to-br from-kio to-kanji rounded-full flex items-center justify-center shadow-sm ring-2 ring-surface dark:ring-slate-800">
              <span className="text-white font-semibold text-sm">{initials}</span>
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 p-4 sm:p-6 overflow-auto">{children}</main>

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

