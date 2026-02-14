import { useState } from 'react';
import { useTasks, useCreateTask, useUpdateTask, useDeleteTask } from '../../../hooks/use-tasks';
import { CheckCircle2, Circle, Plus, Trash2, Calendar } from 'lucide-react';
import { toast } from 'sonner';

interface TasksWidgetProps {
  patientId: string;
}

export function TasksWidget({ patientId }: TasksWidgetProps) {
  const { data: tasks = [], isLoading } = useTasks(patientId);
  const { mutate: createTask } = useCreateTask();
  const { mutate: updateTask } = useUpdateTask();
  const { mutate: deleteTask } = useDeleteTask();

  const [newTask, setNewTask] = useState('');

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTask.trim()) return;
    createTask({ patientId, description: newTask }, {
        onSuccess: () => {
            setNewTask('');
            toast.success('Tarea asignada');
        }
    });
  };

  if (isLoading) return <div className="animate-pulse h-32 bg-gray-100 rounded-xl" />;

  return (
    <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden flex flex-col h-full">
      <div className="bg-gray-50 px-4 py-3 border-b border-gray-200 flex justify-between items-center">
        <h3 className="font-bold text-gray-700 text-sm flex items-center gap-2">
          <CheckCircle2 size={16} className="text-[var(--color-kanji)]" />
          Tareas / Homework
        </h3>
        <span className="text-xs bg-white px-2 py-0.5 rounded-full border border-gray-200 text-gray-500">
          {tasks.filter(t => !t.isCompleted).length} pendientes
        </span>
      </div>

      <div className="flex-1 overflow-y-auto p-2 space-y-1">
        {tasks.length === 0 ? (
          <div className="text-center py-8 text-gray-400 text-xs italic">
            No hay tareas asignadas.
          </div>
        ) : (
          tasks.map((task) => (
            <div key={task.id} className="group flex items-start gap-3 p-2 hover:bg-gray-50 rounded-lg transition-colors">
              <button 
                onClick={() => updateTask({ id: task.id, isCompleted: !task.isCompleted })}
                className={`mt-0.5 transition-colors ${task.isCompleted ? 'text-emerald-500' : 'text-gray-300 hover:text-gray-400'}`}
              >
                {task.isCompleted ? <CheckCircle2 size={18} /> : <Circle size={18} />}
              </button>
              <div className="flex-1 min-w-0">
                <p className={`text-sm ${task.isCompleted ? 'text-gray-400 line-through' : 'text-gray-700'}`}>
                  {task.description}
                </p>
                {task.dueDate && (
                    <p className="text-[10px] text-gray-400 flex items-center gap-1 mt-0.5">
                        <Calendar size={10} />
                        {new Date(task.dueDate).toLocaleDateString()}
                    </p>
                )}
              </div>
              <button 
                onClick={() => deleteTask(task.id)}
                className="text-gray-300 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-all p-1"
              >
                <Trash2 size={14} />
              </button>
            </div>
          ))
        )}
      </div>

      <form onSubmit={handleCreate} className="p-3 border-t border-gray-100 bg-gray-50/50">
        <div className="relative">
          <input
            type="text"
            value={newTask}
            onChange={(e) => setNewTask(e.target.value)}
            placeholder="Nueva tarea..."
            className="w-full pl-3 pr-10 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[var(--color-kanji)]/20 focus:border-[var(--color-kanji)]"
          />
          <button 
            type="submit"
            disabled={!newTask.trim()}
            className="absolute right-1 top-1 p-1.5 bg-[var(--color-kanji)] text-white rounded-md hover:bg-opacity-90 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
          >
            <Plus size={14} />
          </button>
        </div>
      </form>
    </div>
  );
}
