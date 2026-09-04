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
  Plus,
  UserPlus,
  CalendarPlus,
  ShieldCheck,
} from 'lucide-react';
import { motion } from 'framer-motion';
import { TrialBanner } from './common/TrialBanner';
import { PatientModal } from './patients/PatientModal';
import { ScheduleAppointmentModal } from '../features/calendar/components/ScheduleAppointmentModal';
import { useCreatePatient } from '../hooks/use-patients';
import type { PatientFormValues } from '../schemas/patients.schema';
import type { User } from '../types/auth.types';

type ClinicRole = NonNullable<User['clinicRole']>;

interface DashboardLayoutProps {
  children: ReactNode;
}

interface NavItem {
  to: string;
  label: string;
  icon: ReactNode;
  tourId?: string;
}

/**
 * Etiqueta bajo el nombre del usuario.
 *
 * Aquí estaba cableado "Psicólogo" para cualquiera: es falso para el personal
 * de recepción, que no da terapia, y fija el género en un mercado donde la
 * mayoría de profesionales son mujeres. El único dato de rol que el producto
 * tiene de verdad es `clinicRole`, así que se toma de ahí — en sustantivos de
 * función, que en español no marcan género — y quien trabaja solo no lleva
 * etiqueta, porque no hay nada que se sepa sobre su rol.
 */
const CLINIC_ROLE_LABEL: Record<ClinicRole, string> = {
  OWNER: 'Titular de la clínica',
  ADMIN: 'Administración de la clínica',
  MEMBER: 'Equipo de la clínica',
};

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

  // Antes esto colgaba de `profile.plan`, que se elegía en el onboarding y no
  // se podía cambiar: quien marcó "individual" nunca volvía a ver esta entrada.
  // Ahora aparece cuando hay una clínica de verdad detrás. Crear una se
  // descubre desde Configuración, disponible durante toda la prueba.
  const clinicNavItem: NavItem[] = user?.clinicId
    ? [{ to: '/clinic', label: 'Clínica', icon: <Building2 size={20} /> }]
    : [];
  const accessLogNavItem: NavItem = {
    to: '/access-logs',
    label: 'Accesos',
    icon: <ShieldCheck size={20} />,
  };
  const navItems = [...PSYCHOLOGIST_NAV, ...clinicNavItem, accessLogNavItem];

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

  const userName = user?.fullName || user?.email?.split('@')[0] || 'Profesional';
  const initials = userName.slice(0, 2).toUpperCase();
  const roleLabel = user?.clinicRole ? CLINIC_ROLE_LABEL[user.clinicRole] : null;

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
        <div className="h-16 flex items-center justify-between px-5 border-b border-gray-200 dark:border-slate-800">
          <div className="flex items-center gap-1">
            <img src="/logo.png" alt="Kio Health" className="h-10 w-10 object-contain" />
            <span className="text-kanji-deep dark:text-kio text-lg font-bold">Health</span>
          </div>
          <button
            type="button"
            onClick={() => setSidebarOpen(false)}
            aria-label="Cerrar menú de navegación"
            className="lg:hidden flex h-11 w-11 items-center justify-center rounded-xl text-gray-600 hover:text-kanji-deep hover:bg-secondary dark:text-slate-300 dark:hover:bg-slate-800 dark:hover:text-kio transition-colors"
          >
            <X size={20} aria-hidden="true" />
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
                    `group flex min-h-11 items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-150 relative ${
                      isActive
                        ? 'bg-kio-light dark:bg-kio/10 text-kanji-deep dark:text-kio'
                        : 'text-gray-600 dark:text-slate-300 hover:bg-secondary dark:hover:bg-slate-800 hover:text-kanji-deep dark:hover:text-kio'
                    }`
                  }
                >
                  {({ isActive }) => (
                    <>
                      {/* Active Indicator Bar */}
                      {isActive && (
                        <span className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-6 bg-kio rounded-r-full shadow-[0_0_10px_rgba(174,147,254,0.4)]" />
                      )}
                      <span className={isActive ? 'text-kio' : 'text-gray-600 dark:text-slate-300 group-hover:text-kanji-deep dark:group-hover:text-kio'}>
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
              `group flex min-h-11 items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-150 relative ${
                // Púrpura legible: sobre el velo lavanda en claro el texto va
                // en `kanji-deep` (6.6:1), nunca en `kio` (2.2:1) ni en
                // `kanji` (3.88:1, que solo aprueba para texto grande y esto
                // es `text-sm`). Es la misma pareja que ya usa la navegación
                // principal doce líneas más arriba; aquí se había quedado sin
                // corregir. El par oscuro sigue siendo `kio`, donde sí contrasta.
                isActive
                  ? 'bg-kio-light dark:bg-kio/10 text-kanji-deep dark:text-kio'
                  : 'text-gray-600 dark:text-slate-400 hover:bg-surface/80 dark:hover:bg-slate-800 hover:text-kanji-deep dark:hover:text-kio'
              }`
            }
          >
            {({ isActive }) => (
              <>
                {isActive && (
                  <span className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-6 bg-kio rounded-r-full" />
                )}
                <Settings size={20} className={isActive ? 'text-kio' : 'text-gray-600 dark:text-slate-300 group-hover:text-kanji-deep dark:group-hover:text-kio'} />
                Configuración
              </>
            )}
          </NavLink>
          <button
            type="button"
            onClick={handleLogout}
            className="w-full flex min-h-11 items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-gray-600 dark:text-slate-300 hover:bg-rose-50 dark:hover:bg-rose-900/20 hover:text-rose-700 dark:hover:text-rose-300 transition-colors duration-150"
          >
            <LogOut size={20} aria-hidden="true" />
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
              aria-label="Abrir menú de navegación"
              aria-expanded={sidebarOpen}
              className="lg:hidden flex h-11 w-11 shrink-0 items-center justify-center rounded-xl text-gray-600 hover:bg-secondary hover:text-kanji-deep dark:text-slate-300 dark:hover:bg-slate-800 dark:hover:text-kio transition-colors"
            >
              <Menu size={22} aria-hidden="true" />
            </button>
            {/* Logo — solo visible en móvil (el sidebar está oculto) */}
            <div className="lg:hidden flex items-center">
              <img src="/logo.png" alt="Kio" className="h-8 w-8 object-contain" />
            </div>
            <span className="hidden sm:inline text-gray-600 dark:text-slate-300 font-medium">Inicio</span>
            <ChevronRight size={14} aria-hidden="true" className="hidden sm:inline text-gray-500 dark:text-slate-400" />
            <span className="text-kanji-deep dark:text-kio font-bold">{pageLabel}</span>
          </div>

          {/* Right side actions */}
          <div className="flex items-center gap-3">
            {/* Botón único "+ Nuevo" con dropdown (portal para evitar clipping del header sticky) */}
            <div>
              <button
                ref={quickBtnRef}
                type="button"
                data-tour="tour-quick-actions"
                onClick={openQuickMenu}
                aria-label="Crear nuevo paciente o cita"
                aria-expanded={isQuickMenuOpen}
                // `shadow-md shadow-kanji-deep/20` es la entrada "Marca" del
                // vocabulario de sombra de DESIGN.md, no una excepción tácita:
                // la sombra teñida del botón primario convive con la Regla del
                // Plano en Reposo por diseño. Este botón vive en el shell, así
                // que se pinta sobre todas las páginas y tiene que leerse igual
                // que el resto de primarios del producto. Retirarla es un
                // cambio de sistema (DESIGN.md + todos los primarios a la vez),
                // nunca una decisión local de esta pantalla.
                className="flex min-h-11 items-center gap-1.5 px-3.5 rounded-xl text-sm font-bold text-white bg-kanji-deep shadow-md shadow-kanji-deep/20 hover:bg-kanji-deep/90 active:scale-95 transition-all duration-150"
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
            {/* Plain conditional, not AnimatePresence: its exit animation runs
                but never unmounts the node here, leaving a stale menu in the
                DOM after every close. Same defect as the guided tour. */}
            {createPortal(
              <>
                {isQuickMenuOpen && (
                  <motion.div
                    ref={quickMenuRef}
                    initial={{ opacity: 0, scale: 0.95, y: -6 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
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
                        <UserPlus size={15} className="text-kanji-deep dark:text-kio" />
                      </span>
                      <div className="text-left">
                        <p className="text-sm font-semibold text-kanji-deep dark:text-white leading-tight">Nuevo paciente</p>
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
                        <p className="text-sm font-semibold text-kanji-deep dark:text-white leading-tight">Nueva cita</p>
                        <p className="text-xs text-gray-400 dark:text-slate-500 leading-tight mt-0.5">Agendar sesión</p>
                      </div>
                    </button>
                  </motion.div>
                )}
              </>,
              document.body,
            )}

            <div className="w-px h-6 bg-gray-200 dark:bg-slate-700" />

            <ThemeToggle />
            <div className="w-px h-6 bg-gray-200 dark:bg-slate-700 mx-1" />
            <div className="text-right hidden sm:block">
              <p className="text-sm font-bold text-kanji-deep dark:text-kio">{userName}</p>
              {roleLabel && (
                <p className="text-xs font-medium text-gray-600 dark:text-slate-300">{roleLabel}</p>
              )}
            </div>
            <div className="w-10 h-10 bg-gradient-to-br from-kio to-kanji rounded-full flex items-center justify-center shadow-sm ring-2 ring-surface dark:ring-slate-800">
              <span className="text-white font-semibold text-sm">{initials}</span>
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 p-4 sm:p-6 overflow-auto">
          <TrialBanner />
          {children}
        </main>

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

