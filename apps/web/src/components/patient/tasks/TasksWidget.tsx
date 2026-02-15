import { useState } from 'react';
import { useTasks, useCreateTask, useUpdateTask, useDeleteTask } from '../../../hooks/use-tasks';
import { CheckCircle2, Circle, Plus, Trash2, Calendar, ListTodo } from 'lucide-react';
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

  if (isLoading) return <div className="animate-pulse h-full min-h-[300px] bg-white rounded-2xl border border-[var(--color-cruz)] shadow-sm" />;

  return (
    <div className="bg-white rounded-2xl border border-[var(--color-cruz)] shadow-sm overflow-hidden flex flex-col h-full min-h-[300px]">
      <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center bg-gray-50/30">
        <h3 className="text-lg font-bold text-[var(--color-kanji)] flex items-center gap-2">
          <ListTodo size={20} />
          Tareas / Homework
        </h3>
        <span className="text-xs font-bold bg-white px-2.5 py-1 rounded-md border border-gray-200 text-gray-500 shadow-sm">
          {tasks.filter(t => !t.isCompleted).length} pendientes
        </span>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-2">
        {tasks.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-center py-8">
            <div className="w-12 h-12 bg-gray-50 rounded-full flex items-center justify-center mb-3">
                 <CheckCircle2 size={24} className="text-gray-300" />
            </div>
            <p className="text-sm font-medium text-gray-400">Todo al día</p>
            <p className="text-xs text-gray-300 mt-1">No hay tareas pendientes.</p>
          </div>
        ) : (
          tasks.map((task) => (
            <div key={task.id} className="group flex items-start gap-3 p-3 hover:bg-gray-50 rounded-xl transition-all border border-transparent hover:border-gray-100">
              <button 
                onClick={() => updateTask({ id: task.id, isCompleted: !task.isCompleted })}
                className={`mt-0.5 transition-all ${task.isCompleted ? 'text-emerald-500' : 'text-gray-300 hover:text-[var(--color-kanji)]'}`}
              >
                {task.isCompleted ? <CheckCircle2 size={20} /> : <Circle size={20} />}
              </button>
              <div className="flex-1 min-w-0">
                <p className={`text-sm font-medium transition-all ${task.isCompleted ? 'text-gray-400 line-through decoration-gray-300' : 'text-gray-700'}`}>
                  {task.description}
                </p>
                {task.dueDate && (
                    <p className="text-[10px] text-gray-400 flex items-center gap-1 mt-1 font-medium">
                        <Calendar size={12} />
                        {new Date(task.dueDate).toLocaleDateString()}
                    </p>
                )}
              </div>
              <button 
                onClick={() => deleteTask(task.id)}
                className="text-gray-300 hover:text-rose-500 opacity-0 group-hover:opacity-100 transition-all p-1.5 hover:bg-rose-50 rounded-lg"
              >
                <Trash2 size={16} />
              </button>
            </div>
          ))
        )}
      </div>

      <form onSubmit={handleCreate} className="p-4 border-t border-gray-100 bg-gray-50/30">
        <div className="relative group">
          <input
            type="text"
            value={newTask}
            onChange={(e) => setNewTask(e.target.value)}
            placeholder="Nueva tarea..."
            className="w-full pl-4 pr-12 py-3 text-sm bg-white border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[var(--color-kanji)]/10 focus:border-[var(--color-kanji)] transition-all shadow-sm"
          />
          <button 
            type="submit"
            disabled={!newTask.trim()}
            className="absolute right-1.5 top-1.5 p-1.5 bg-[var(--color-kanji)] text-white rounded-lg hover:bg-opacity-90 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-sm group-focus-within:scale-105"
          >
            <Plus size={18} />
          </button>
        </div>
      </form>
    </div>
  );
}
