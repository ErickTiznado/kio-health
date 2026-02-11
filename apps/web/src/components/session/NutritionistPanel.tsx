import { useState, type FC } from 'react';
import { BarChart3, Utensils, StickyNote } from 'lucide-react';
import { AnthropometryTab } from './AnthropometryTab';
import { MealPlanTab } from './MealPlanTab';
import { ClinicalEditor } from './ClinicalEditor';

type NutriTabId = 'anthropometry' | 'plan' | 'notes';

interface TabDefinition {
  readonly id: NutriTabId;
  readonly label: string;
  readonly icon: React.ReactNode;
}

const TABS: readonly TabDefinition[] = [
  { id: 'anthropometry', label: 'Antropometría', icon: <BarChart3 size={15} /> },
  { id: 'plan', label: 'Plan', icon: <Utensils size={15} /> },
  { id: 'notes', label: 'Notas', icon: <StickyNote size={15} /> },
] as const;

/**
 * Nutritionist session view — tabbed interface replacing the generic editor.
 * Tabs: Antropometría (default) · Plan · Notas.
 * Liquid/Soft pill-style tab selector.
 */
export const NutritionistPanel: FC = () => {
  const [activeTab, setActiveTab] = useState<NutriTabId>('anthropometry');

  return (
    <div className="h-full flex flex-col bg-white shadow-[-4px_0_24px_rgba(0,0,0,0.04)]">
      {/* ── Tab Bar ── */}
      <div className="px-6 pt-4 pb-0">
        <div className="flex items-center gap-1 bg-gray-100/60 rounded-2xl p-1 w-fit">
          {TABS.map((tab) => {
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveTab(tab.id)}
                className={`
                  flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold transition-all duration-200
                  ${
                    isActive
                      ? 'bg-white text-kanji shadow-sm'
                      : 'text-gray-400 hover:text-gray-600'
                  }
                `}
              >
                {tab.icon}
                {tab.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* ── Tab Content ── */}
      <div className="flex-1 min-h-0">
        {activeTab === 'anthropometry' && <AnthropometryTab />}
        {activeTab === 'plan' && <MealPlanTab />}
        {activeTab === 'notes' && <ClinicalEditor />}
      </div>
    </div>
  );
};
