import { Command } from 'cmdk';
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, User, Calendar, Loader2, AlertTriangle, RefreshCcw } from 'lucide-react';
import { toast } from 'sonner';
import { api } from '../../lib/api';
import { useKeyboardShortcut } from '../../hooks/useKeyboardShortcut';

// Minimal debounce hook implementation if not exists
function useDebounceValue<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);
    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);
  return debouncedValue;
}

interface SearchResult {
  patients: Array<{ id: string; fullName: string; status: string }>;
  appointments: Array<{ id: string; label: string; startTime: string; type: 'appointment' }>;
}

export function Omnibox() {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(false);
  const [failed, setFailed] = useState(false);
  const [retryToken, setRetryToken] = useState(0);
  const [results, setResults] = useState<SearchResult>({ patients: [], appointments: [] });
  // Última consulta que el backend efectivamente respondió. Es lo que permite
  // distinguir "todavía no hemos preguntado esto" de "preguntamos y no hay nada".
  const [servedQuery, setServedQuery] = useState<string | null>(null);
  const navigate = useNavigate();

  const debouncedSearch = useDebounceValue(search, 300);

  // Toggle with Cmd+K
  useKeyboardShortcut(['k', 'K'], () => setOpen((open) => !open));

  useEffect(() => {
    // Mismo criterio que la pista de "escribe al menos 2 caracteres": si el
    // panel dice que no hemos preguntado, no podemos estar preguntando.
    const query = debouncedSearch.trim();

    if (query.length < 2) {
      setResults({ patients: [], appointments: [] });
      setFailed(false);
      setServedQuery(null);
      return;
    }

    // Una respuesta que llega tarde pertenece a una consulta que ya no está en
    // pantalla. Escribirla — sobre todo escribir su fallo — haría que la
    // superficie afirmara algo falso sobre la consulta actual.
    let cancelled = false;

    const fetchResults = async () => {
      setLoading(true);
      setFailed(false);
      try {
        const { data } = await api.get('/search', { params: { q: query } });
        if (cancelled) return;
        setResults(data);
        setServedQuery(query);
      } catch (error) {
        if (cancelled) return;
        console.error('Search failed', error);
        setResults({ patients: [], appointments: [] });
        setServedQuery(null);
        setFailed(true);
        toast.error('Error en la búsqueda');
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    fetchResults();

    return () => {
      cancelled = true;
    };
  }, [debouncedSearch, retryToken]);

  const trimmedSearch = search.trim();
  const trimmedDebounced = debouncedSearch.trim();

  // La búsqueda sigue en vuelo mientras el debounce no ha alcanzado al texto
  // tecleado, y también en el frame en que el debounce ya alcanzó pero el
  // efecto pasivo todavía no ha puesto `loading` en true. La tercera condición
  // cierra ese hueco: mientras la consulta vigente no sea la que el backend
  // respondió, seguimos ocupados. Sin esto la lista afirmaría "no se
  // encontraron resultados" antes de haber preguntado.
  const isBusy =
    loading ||
    search !== debouncedSearch ||
    (trimmedDebounced.length >= 2 && servedQuery !== trimmedDebounced);
  const isTooShort = trimmedSearch.length < 2;
  const hasResults = results.patients.length > 0 || results.appointments.length > 0;

  return (
    <Command.Dialog
      open={open}
      onOpenChange={setOpen}
      label="Búsqueda global"
      className="fixed top-[20%] left-1/2 -translate-x-1/2 w-full max-w-[640px] bg-surface dark:bg-slate-900 rounded-xl shadow-2xl border border-gray-100 dark:border-slate-800 overflow-hidden z-[100] animate-in fade-in zoom-in-95 duration-200"
      overlayClassName="fixed inset-0 bg-black/40 dark:bg-black/60 backdrop-blur-sm z-[90] animate-in fade-in duration-200"
    >
      <div className="flex items-center border-b border-gray-100 dark:border-slate-800 px-4">
        <Search aria-hidden="true" className="w-5 h-5 text-gray-400 dark:text-slate-500 mr-2" />
        <Command.Input 
          value={search}
          onValueChange={setSearch}
          placeholder="Buscar pacientes, citas..."
          className="w-full h-14 outline-none text-base dark:text-white placeholder:text-gray-400 dark:placeholder:text-slate-500 bg-transparent"
        />
        {isBusy && <Loader2 aria-hidden="true" className="w-4 h-4 text-gray-400 dark:text-slate-500 animate-spin" />}
      </div>

      <Command.List className="max-h-[300px] overflow-y-auto p-2">
        {/* Orden obligatorio: error, luego carga, luego vacío. Decir "no se
            encontraron resultados" cuando la petición falló o sigue en vuelo
            sería afirmar algo que esta superficie no puede sostener. */}
        {failed ? (
          <div role="alert" className="flex flex-col items-center gap-3 px-4 py-6 text-center">
            <AlertTriangle aria-hidden="true" className="w-5 h-5 text-rose-500 dark:text-rose-400" />
            <p className="text-sm font-medium text-gray-700 dark:text-slate-300">
              No pudimos completar la búsqueda.
            </p>
            <p className="text-xs text-gray-500 dark:text-slate-400">
              No podemos decir si hay resultados para «{trimmedDebounced}».
            </p>
            <button
              type="button"
              onClick={() => setRetryToken((token) => token + 1)}
              className="flex min-h-11 items-center gap-2 rounded-xl px-4 text-sm font-bold text-kanji-deep hover:bg-gray-100 dark:text-kio dark:hover:bg-slate-800 transition-colors"
            >
              <RefreshCcw aria-hidden="true" className="w-4 h-4" />
              Reintentar
            </button>
          </div>
        ) : isBusy && !hasResults ? (
          <p aria-live="polite" className="py-6 text-center text-sm text-gray-500 dark:text-slate-400">
            Buscando…
          </p>
        ) : isTooShort && !hasResults ? (
          <p className="py-6 text-center text-sm text-gray-500 dark:text-slate-400">
            Escribe al menos 2 caracteres para buscar.
          </p>
        ) : (
          <Command.Empty className="py-6 text-center text-sm text-gray-500 dark:text-slate-400">
            No se encontraron resultados.
          </Command.Empty>
        )}

        {results.patients.length > 0 && (
          <Command.Group heading="Pacientes" className="text-[11px] font-bold text-gray-500 dark:text-slate-400 px-2 py-1.5 uppercase tracking-wider">
            {results.patients.map((patient) => (
              <Command.Item
                key={patient.id}
                onSelect={() => {
                  navigate(`/patients/${patient.id}`);
                  setOpen(false);
                }}
                className="flex min-h-11 items-center px-3 py-2.5 rounded-lg text-sm font-medium text-gray-700 dark:text-slate-300 data-[selected=true]:bg-gray-100 dark:data-[selected=true]:bg-slate-800 data-[selected=true]:text-gray-900 dark:data-[selected=true]:text-white cursor-pointer transition-colors"
              >
                <User aria-hidden="true" className="w-4 h-4 mr-3 text-gray-400 dark:text-slate-500" />
                {patient.fullName}
              </Command.Item>
            ))}
          </Command.Group>
        )}

        {results.appointments.length > 0 && (
          <Command.Group heading="Citas" className="text-[11px] font-bold text-gray-500 dark:text-slate-400 px-2 py-1.5 uppercase tracking-wider mt-2">
            {results.appointments.map((apt) => (
              <Command.Item
                key={apt.id}
                onSelect={() => {
                  navigate(`/session/${apt.id}`);
                  setOpen(false);
                }}
                className="flex min-h-11 items-center px-3 py-2.5 rounded-lg text-sm font-medium text-gray-700 dark:text-slate-300 data-[selected=true]:bg-gray-100 dark:data-[selected=true]:bg-slate-800 data-[selected=true]:text-gray-900 dark:data-[selected=true]:text-white cursor-pointer transition-colors"
              >
                <Calendar aria-hidden="true" className="w-4 h-4 mr-3 text-gray-400 dark:text-slate-500" />
                <div className="flex flex-col">
                    <span>{apt.label}</span>
                    <span className="text-[11px] text-gray-500 dark:text-slate-400">{new Date(apt.startTime).toLocaleDateString()}</span>
                </div>
              </Command.Item>
            ))}
          </Command.Group>
        )}
      </Command.List>
      
      <div className="border-t border-gray-100 dark:border-slate-800 px-4 py-2 text-[11px] text-gray-500 dark:text-slate-400 flex justify-end">
         <span className="bg-gray-100 dark:bg-slate-800 px-1.5 py-0.5 rounded-xs text-gray-600 dark:text-slate-300 font-bold mr-1">Esc</span> para cerrar
      </div>
    </Command.Dialog>
  );
}
