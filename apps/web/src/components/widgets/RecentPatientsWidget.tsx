import { History } from 'lucide-react';

interface Patient {
  id: string;
  name: string;
  reason: string;
  time: string;
  color: string;
}

interface RecentPatientsWidgetProps {
  patients: Patient[];
}

export function RecentPatientsWidget({ patients }: RecentPatientsWidgetProps) {
  return (
    <div className="col-span-12 lg:col-span-7">
      <div className="bg-white rounded-[40px] p-8 lg:p-10 shadow-sm border border-gray-100 h-full">
        <div className="flex items-center justify-between mb-8">
          <h3 className="font-bold text-gray-900 flex items-center gap-3 text-lg">
            <History size={24} className="text-gray-300" /> Vistos Recientemente
          </h3>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {patients.map((p) => (
            <div key={p.id} className="p-5 rounded-3xl bg-gray-50 hover:bg-gray-100 transition-colors cursor-pointer group border border-transparent hover:border-gray-200">
              <div className="flex items-start justify-between mb-3">
                <div className={`w-10 h-10 rounded-2xl flex items-center justify-center font-bold text-sm ${p.color}`}>{p.name[0]}</div>
                <span className="text-[10px] font-bold text-gray-400 bg-white px-2 py-1 rounded-full">{p.time}</span>
              </div>
              <div>
                <p className="font-bold text-gray-900 mb-1 group-hover:text-kanji transition-colors">{p.name}</p>
                <p className="text-xs text-gray-400 font-medium">{p.reason}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
