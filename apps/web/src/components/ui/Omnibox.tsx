import { Command } from 'cmdk';
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, User, Calendar, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import axios from 'axios'; // Or use your configured api client
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
  const [results, setResults] = useState<SearchResult>({ patients: [], appointments: [] });
  const navigate = useNavigate();
  
  const debouncedSearch = useDebounceValue(search, 300);

  // Toggle with Cmd+K
  useKeyboardShortcut(['k', 'K'], () => setOpen((open) => !open));

  useEffect(() => {
    if (debouncedSearch.length < 2) {
      setResults({ patients: [], appointments: [] });
      return;
    }

    const fetchResults = async () => {
      setLoading(true);
      try {
        // Replace with your actual API call
        const token = localStorage.getItem('accessToken'); // Simplistic auth
        const { data } = await axios.get(`http://localhost:3000/search?q=${debouncedSearch}`, {
            headers: { Authorization: `Bearer ${token}` }
        });
        setResults(data);
      } catch (error) {
        console.error('Search failed', error);
        toast.error('Error en la búsqueda');
      } finally {
        setLoading(false);
      }
    };

    fetchResults();
  }, [debouncedSearch]);

  return (
    <Command.Dialog
      open={open}
      onOpenChange={setOpen}
      label="Global Search"
      className="fixed top-[20%] left-1/2 -translate-x-1/2 w-full max-w-[640px] bg-white dark:bg-slate-900 rounded-xl shadow-2xl border border-gray-100 dark:border-slate-800 overflow-hidden z-[100] animate-in fade-in zoom-in-95 duration-200"
      overlayClassName="fixed inset-0 bg-black/40 dark:bg-black/60 backdrop-blur-sm z-[90] animate-in fade-in duration-200"
    >
      <div className="flex items-center border-b border-gray-100 dark:border-slate-800 px-4">
        <Search className="w-5 h-5 text-gray-400 dark:text-slate-500 mr-2" />
        <Command.Input 
          value={search}
          onValueChange={setSearch}
          placeholder="Buscar pacientes, citas..."
          className="w-full h-14 outline-none text-base dark:text-white placeholder:text-gray-400 dark:placeholder:text-slate-500 bg-transparent"
        />
        {loading && <Loader2 className="w-4 h-4 text-gray-400 dark:text-slate-500 animate-spin" />}
      </div>

      <Command.List className="max-h-[300px] overflow-y-auto p-2">
        <Command.Empty className="py-6 text-center text-sm text-gray-500 dark:text-slate-400">
          No se encontraron resultados.
        </Command.Empty>

        {results.patients.length > 0 && (
          <Command.Group heading="Pacientes" className="text-xs font-bold text-gray-400 dark:text-slate-500 px-2 py-1.5 uppercase tracking-wider">
            {results.patients.map((patient) => (
              <Command.Item
                key={patient.id}
                onSelect={() => {
                  navigate(`/patients/${patient.id}`);
                  setOpen(false);
                }}
                className="flex items-center px-3 py-2.5 rounded-lg text-sm font-medium text-gray-700 dark:text-slate-300 data-[selected=true]:bg-gray-100 dark:data-[selected=true]:bg-slate-800 data-[selected=true]:text-black dark:data-[selected=true]:text-white cursor-pointer transition-colors"
              >
                <User className="w-4 h-4 mr-3 text-gray-400 dark:text-slate-500" />
                {patient.fullName}
                {patient.status === 'WAITLIST' && (
                    <span className="ml-auto text-[10px] bg-amber-100 dark:bg-amber-900/40 text-amber-700 dark:text-amber-200 px-2 py-0.5 rounded-full">Lista de Espera</span>
                )}
              </Command.Item>
            ))}
          </Command.Group>
        )}

        {results.appointments.length > 0 && (
          <Command.Group heading="Citas" className="text-xs font-bold text-gray-400 dark:text-slate-500 px-2 py-1.5 uppercase tracking-wider mt-2">
            {results.appointments.map((apt) => (
              <Command.Item
                key={apt.id}
                onSelect={() => {
                  navigate(`/session/${apt.id}`);
                  setOpen(false);
                }}
                className="flex items-center px-3 py-2.5 rounded-lg text-sm font-medium text-gray-700 dark:text-slate-300 data-[selected=true]:bg-gray-100 dark:data-[selected=true]:bg-slate-800 data-[selected=true]:text-black dark:data-[selected=true]:text-white cursor-pointer transition-colors"
              >
                <Calendar className="w-4 h-4 mr-3 text-gray-400 dark:text-slate-500" />
                <div className="flex flex-col">
                    <span>{apt.label}</span>
                    <span className="text-[10px] text-gray-400 dark:text-slate-500">{new Date(apt.startTime).toLocaleDateString()}</span>
                </div>
              </Command.Item>
            ))}
          </Command.Group>
        )}
      </Command.List>
      
      <div className="border-t border-gray-100 dark:border-slate-800 px-4 py-2 text-[10px] text-gray-400 dark:text-slate-500 flex justify-end">
         <span className="bg-gray-100 dark:bg-slate-800 px-1.5 py-0.5 rounded text-gray-500 dark:text-slate-400 font-bold mr-1">Esc</span> para cerrar
      </div>
    </Command.Dialog>
  );
}
