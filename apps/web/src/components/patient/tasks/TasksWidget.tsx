import { useEffect, useMemo, useRef, useState } from 'react';
import {
  useTasks,
  useCreateTask,
  useUpdateTask,
  useDeleteTask,
  TASK_DESCRIPTION_MAX_LENGTH,
} from '../../../hooks/use-tasks';
import { CheckCircle2, Circle, Plus, Trash2, Calendar, ListTodo, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { WidgetError } from '../../widgets/WidgetError';

interface TasksWidgetProps {
  patientId: string;
}

// Ventana de arrepentimiento antes de que salga el DELETE. El borrado en el
// backend es duro e irreversible, así que la fila desaparece al instante pero
// la petición espera a que expire el toast de "Deshacer".
const UNDO_WINDOW_MS = 5000;

export function TasksWidget({ patientId }: TasksWidgetProps) {
  const { data: tasks = [], isLoading, isError, refetch } = useTasks(patientId);
  const { mutate: createTask, isPending: isCreating } = useCreateTask();
  const { mutate: updateTask, variables: updateVariables, isPending: isUpdating } = useUpdateTask();
  const { mutate: deleteTask } = useDeleteTask();

  const [newTask, setNewTask] = useState('');
  // Tareas ocultas mientras corre su ventana de undo.
  const [pendingDeletes, setPendingDeletes] = useState<string[]>([]);
  const timersRef = useRef(new Map<string, ReturnType<typeof setTimeout>>());
  const submittingRef = useRef(false);

  useEffect(() => {
    const timers = timersRef.current;
    return () => {
      // Al desmontar (p. ej. al cerrar el modal) no dejamos la acción a medias:
      // se cancela el temporizador y el borrado sale ya. Si lo descartáramos,
      // la tarea reaparecería sin explicación.
      timers.forEach((timer, id) => {
        clearTimeout(timer);
        deleteTask({ id, patientId });
      });
      timers.clear();
    };
    // Solo en desmontaje: reprogramar aquí cancelaría los undos en vuelo.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const visibleTasks = useMemo(
    () => tasks.filter((t) => !pendingDeletes.includes(t.id)),
    [tasks, pendingDeletes],
  );
  const pending = visibleTasks.filter((t) => !t.isCompleted);
  const completed = visibleTasks.filter((t) => t.isCompleted);

  const trimmed = newTask.trim();
  const canSubmit = trimmed.length > 0 && !isCreating;

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    // `isPending` no basta: se apoya en un re-render, así que dos submits en el
    // mismo tick (doble Enter, doble clic) lo esquivan y crean dos tareas
    // idénticas. El ref cierra la puerta de inmediato.
    if (!canSubmit || submittingRef.current) return;
    submittingRef.current = true;
    createTask({ patientId, description: trimmed }, {
      onSuccess: () => {
        setNewTask('');
        toast.success('Tarea asignada');
      },
      onSettled: () => {
        submittingRef.current = false;
      },
    });
  };

  const handleDelete = (id: string) => {
    setPendingDeletes((prev) => [...prev, id]);

    const commit = () => {
      timersRef.current.delete(id);
      deleteTask({ id, patientId });
    };
    timersRef.current.set(id, setTimeout(commit, UNDO_WINDOW_MS));

    toast.success('Tarea eliminada', {
      duration: UNDO_WINDOW_MS,
      action: {
        label: 'Deshacer',
        onClick: () => {
          const timer = timersRef.current.get(id);
          if (timer) clearTimeout(timer);
          timersRef.current.delete(id);
          setPendingDeletes((prev) => prev.filter((p) => p !== id));
        },
      },
    });
  };

  // El error va ANTES que el vacío: "Todo al día" tras un 500 afirma que este
  // paciente no tiene tareas pendientes sin haberlo comprobado.
  if (isError)
    return (
      <div className="h-full min-h-[300px] rounded-2xl border border-cruz bg-white p-4 dark:border-slate-800 dark:bg-slate-900">
        <WidgetError what="las tareas de este paciente" onRetry={() => refetch()} />
      </div>
    );

  if (isLoading)
    return (
      <div
        aria-busy="true"
        className="animate-pulse h-full min-h-[300px] bg-white dark:bg-slate-900 rounded-2xl border border-cruz dark:border-slate-800 shadow-sm"
      >
        <span className="sr-only">Cargando tareas del paciente…</span>
      </div>
    );

  const renderTask = (task: (typeof visibleTasks)[number]) => {
    // Un solo PATCH por tarea a la vez: sin esto, clics rápidos generaban
    // peticiones en carrera y el estado final podía quedar invertido.
    const isToggling = isUpdating && updateVariables?.id === task.id;
    return (
      <div key={task.id} className="group flex items-start gap-2 p-3 hover:bg-gray-50 dark:hover:bg-slate-800 rounded-xl transition-all border border-transparent hover:border-gray-100 dark:hover:border-slate-700">
        {/* Marcar una tarea es un control real: 44px como el de eliminar, no un
            icono de 20px sin área. */}
        <button
          type="button"
          onClick={() => updateTask({ id: task.id, patientId, isCompleted: !task.isCompleted })}
          disabled={isToggling}
          aria-pressed={task.isCompleted}
          aria-label={`${task.isCompleted ? 'Marcar como pendiente' : 'Marcar como completada'}: ${task.description}`}
          className={`grid h-11 w-11 shrink-0 place-items-center rounded-full transition-colors duration-150 disabled:opacity-50 ${task.isCompleted ? 'text-emerald-600 dark:text-emerald-400' : 'text-slate-400 hover:text-kanji-deep dark:text-slate-500 dark:hover:text-kio'}`}
        >
          {task.isCompleted ? (
            <CheckCircle2 size={20} aria-hidden="true" />
          ) : (
            <Circle size={20} aria-hidden="true" />
          )}
        </button>
        <div className="flex-1 min-w-0 py-2.5">
          <p className={`text-sm font-medium transition-all break-words ${task.isCompleted ? 'text-slate-500 dark:text-slate-500 line-through decoration-slate-400 dark:decoration-slate-600' : 'text-gray-700 dark:text-slate-300'}`}>
            {task.description}
          </p>
          {task.dueDate && (
            <p className="text-[11px] text-slate-600 dark:text-slate-400 flex items-center gap-1 mt-1 font-medium">
              <Calendar size={12} aria-hidden="true" />
              {new Date(task.dueDate).toLocaleDateString()}
            </p>
          )}
        </div>
        {/* Visible siempre y con nombre accesible: vivía en `opacity-0
            group-hover:opacity-100`, o sea inalcanzable en táctil. */}
        <button
          onClick={() => handleDelete(task.id)}
          aria-label={`Eliminar tarea: ${task.description}`}
          className="grid h-11 w-11 shrink-0 place-items-center rounded-full text-slate-600 transition-colors duration-150 hover:bg-rose-50 hover:text-rose-700 dark:text-slate-400 dark:hover:bg-rose-900/20 dark:hover:text-rose-400"
        >
          <Trash2 size={16} aria-hidden="true" />
        </button>
      </div>
    );
  };

  return (
    <div className="bg-white dark:bg-slate-900 rounded-2xl border border-cruz dark:border-slate-800 shadow-sm overflow-hidden flex flex-col h-full min-h-[300px]">
      <div className="px-6 py-4 border-b border-gray-100 dark:border-slate-800 flex justify-between items-center gap-3 bg-gray-50/30 dark:bg-slate-800/30">
        <h3 className="text-base font-bold text-kanji-deep dark:text-white flex items-center gap-2">
          <ListTodo size={20} aria-hidden="true" />
          Tareas / Homework
        </h3>
        <span className="text-xs font-bold bg-white dark:bg-slate-800 px-2.5 py-1 rounded-md border border-gray-200 dark:border-slate-700 text-slate-600 dark:text-slate-400">
          {pending.length} pendientes
        </span>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-2">
        {pending.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-8 text-center">
            <div className="w-12 h-12 bg-gray-50 dark:bg-slate-800 rounded-full flex items-center justify-center mb-3">
              <CheckCircle2 size={24} aria-hidden="true" className="text-slate-400 dark:text-slate-500" />
            </div>
            <p className="text-sm font-bold text-text dark:text-slate-200">Todo al día</p>
            <p className="mt-1 text-xs font-medium text-slate-600 dark:text-slate-400">No hay tareas pendientes.</p>
          </div>
        ) : (
          pending.map(renderTask)
        )}

        {completed.length > 0 && (
          <>
            <p className="px-3 pt-4 pb-1 text-[11px] font-bold uppercase tracking-wider text-slate-600 dark:text-slate-400">
              Completadas ({completed.length})
            </p>
            {completed.map(renderTask)}
          </>
        )}
      </div>

      <form onSubmit={handleCreate} className="p-4 border-t border-gray-100 dark:border-slate-800 bg-gray-50/30 dark:bg-slate-800/30">
        <div className="relative">
          <label className="sr-only" htmlFor="new-task-description">
            Nueva tarea para el paciente
          </label>
          <input
            id="new-task-description"
            type="text"
            value={newTask}
            onChange={(e) => setNewTask(e.target.value)}
            maxLength={TASK_DESCRIPTION_MAX_LENGTH}
            placeholder="Nueva tarea…"
            className="w-full pl-4 pr-14 py-3.5 text-sm font-medium bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-xl focus:outline-none focus:border-kio focus:ring-2 focus:ring-kio/50 transition-colors duration-150 text-gray-700 dark:text-slate-300 placeholder:text-slate-500 placeholder:font-normal dark:placeholder:text-slate-400"
          />
          {/* 44px reales: era un objetivo de ~30px sobre un input de 44. */}
          <button
            type="submit"
            disabled={!canSubmit}
            aria-label="Agregar tarea"
            className="absolute right-1 top-1 grid h-11 w-11 place-items-center rounded-xl bg-kanji-deep text-white transition-colors duration-150 hover:bg-kanji disabled:cursor-not-allowed disabled:opacity-50 dark:bg-kio dark:text-slate-900 dark:hover:bg-cruz"
          >
            {isCreating ? (
              <Loader2 size={18} aria-hidden="true" className="animate-spin" />
            ) : (
              <Plus size={18} aria-hidden="true" />
            )}
          </button>
        </div>
        {newTask.length > TASK_DESCRIPTION_MAX_LENGTH - 40 && (
          <p className="mt-1.5 text-right text-[11px] font-medium text-slate-600 dark:text-slate-400">
            {newTask.length} / {TASK_DESCRIPTION_MAX_LENGTH}
          </p>
        )}
      </form>
    </div>
  );
}
