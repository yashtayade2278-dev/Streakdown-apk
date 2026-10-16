import React, { useState } from 'react';
import { Plus, Target } from 'lucide-react';
import { Goal } from '../types.ts';
import { GoalCard } from './GoalCard.tsx';
import { GoalModal } from './GoalModal.tsx';
import { KairoLogo } from './KairoLogo.tsx';

interface MainScreenProps {
  goals: Goal[];
  simulatedDate: Date;
  onCheckIn: (id: string) => void;
  onAddGoal: (data: { title: string; description?: string; targetDate: string }) => void;
  onEditGoal: (id: string, updates: Partial<Goal>) => void;
  onDeleteGoal: (id: string) => void;
}

export const MainScreen: React.FC<MainScreenProps> = ({
  goals, simulatedDate, onCheckIn, onAddGoal, onEditGoal, onDeleteGoal,
}) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingGoal, setEditingGoal] = useState<Goal | null>(null);
  const dateFormatted = simulatedDate.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' });

  const handleSaveModal = (data: { title: string; description?: string; targetDate: string }) => {
    if (editingGoal) onEditGoal(editingGoal.id, data); else onAddGoal(data);
    setIsModalOpen(false);
  };

  return (
    <div className="kairo-app relative h-[100dvh] max-h-[100dvh] w-full flex flex-col text-slate-800 select-none overflow-hidden">
      <header className="kairo-header sticky top-0 z-30 px-5 pt-4 pb-4 shrink-0">
        <div className="flex items-center gap-3">
          <KairoLogo size={52} />
          <div className="min-w-0">
            <h1 className="text-2xl font-bold tracking-tight leading-none">Kairo</h1>
            <p className="text-sm font-medium mt-1.5 kairo-tagline">Make Today Count.</p>
            <p className="text-xs text-slate-500 mt-1">{dateFormatted} · Daily Check-Ins &amp; Countdowns</p>
          </div>
        </div>
      </header>

      <main className="flex-1 min-h-0 overflow-y-auto overscroll-contain px-4 pt-4 pb-28 space-y-4">
        {goals.length === 0 ? (
          <div className="kairo-empty-state min-h-[360px] flex flex-col items-center justify-center text-center p-7 rounded-[2rem]">
            <div className="kairo-empty-icon mb-4"><Target className="w-8 h-8" /></div>
            <h2 className="text-lg font-bold text-slate-800">Your next chapter starts here</h2>
            <p className="text-sm text-slate-500 mt-2 max-w-xs leading-relaxed">Create a goal, check in each day, and watch your streak grow as your target date gets closer.</p>
            <button onClick={() => { setEditingGoal(null); setIsModalOpen(true); }} className="kairo-primary-button mt-5 px-5 py-3 text-sm font-semibold rounded-2xl inline-flex items-center gap-2">
              <Plus className="w-5 h-5" /> Create your first goal
            </button>
          </div>
        ) : (
          goals.map((goal, index) => <GoalCard key={goal.id} goal={goal} colorIndex={index} simulatedDate={simulatedDate} onCheckIn={onCheckIn} onEdit={(g) => { setEditingGoal(g); setIsModalOpen(true); }} onDelete={onDeleteGoal} />)
        )}
      </main>

      <div className="fixed bottom-[calc(env(safe-area-inset-bottom)+1.25rem)] right-5 z-40">
        <button onClick={() => { setEditingGoal(null); setIsModalOpen(true); }} className="kairo-primary-button h-14 px-5 font-bold text-sm rounded-2xl flex items-center gap-2" aria-label="Add Goal">
          <Plus className="w-5 h-5 stroke-[2.5]" /><span>Add Goal</span>
        </button>
      </div>

      <GoalModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} onSave={handleSaveModal} initialGoal={editingGoal} simulatedDate={simulatedDate} />
    </div>
  );
};
