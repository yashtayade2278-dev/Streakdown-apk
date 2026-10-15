import React, { useState } from 'react';
import { Plus, Flame, Smartphone, Target, Download } from 'lucide-react';
import { Goal } from '../types.ts';
import { GoalCard } from './GoalCard.tsx';
import { GoalModal } from './GoalModal.tsx';

interface MainScreenProps {
  goals: Goal[];
  widgets: { goalId: string }[];
  simulatedDate: Date;
  onCheckIn: (id: string) => void;
  onAddGoal: (data: { title: string; description?: string; targetDate: string }) => void;
  onEditGoal: (id: string, updates: Partial<Goal>) => void;
  onDeleteGoal: (id: string) => void;
  onPinWidget: (goalId: string) => void;
  onGoToHomeScreen?: () => void;
  onOpenDownloadApk?: () => void;
}

export const MainScreen: React.FC<MainScreenProps> = ({
  goals,
  widgets,
  simulatedDate,
  onCheckIn,
  onAddGoal,
  onEditGoal,
  onDeleteGoal,
  onPinWidget,
  onGoToHomeScreen,
  onOpenDownloadApk,
}) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingGoal, setEditingGoal] = useState<Goal | null>(null);

  const handleOpenAddModal = () => {
    setEditingGoal(null);
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (goal: Goal) => {
    setEditingGoal(goal);
    setIsModalOpen(true);
  };

  const handleSaveModal = (data: {
    title: string;
    description?: string;
    targetDate: string;
  }) => {
    if (editingGoal) {
      onEditGoal(editingGoal.id, data);
    } else {
      onAddGoal(data);
    }
    setIsModalOpen(false);
  };

  const dateFormatted = simulatedDate.toLocaleDateString('en-US', {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
  });

  return (
    <div className="relative h-full flex flex-col bg-slate-50 text-slate-900 select-none overflow-hidden">
      {/* Material 3 App Header */}
      <header className="px-5 pt-4 pb-3.5 bg-white border-b border-slate-200/90 shadow-2xs z-10 shrink-0">
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-sky-600 text-white flex items-center justify-center shadow-xs">
              <Flame className="w-5 h-5 text-amber-300 fill-amber-300" />
            </div>
            <div>
              <h1 className="text-xl font-bold tracking-tight text-slate-900 leading-none">
                StreakDown
              </h1>
              <p className="text-xs text-slate-600 mt-1">
                {dateFormatted} · Daily Check-Ins & Countdowns
              </p>
            </div>
          </div>

          <div className="flex items-center gap-1.5">
            {/* Download APK / Project button */}
            {onOpenDownloadApk && (
              <button
                onClick={onOpenDownloadApk}
                className="px-2.5 py-1.5 text-xs font-semibold text-emerald-800 bg-emerald-50 hover:bg-emerald-100 rounded-xl border border-emerald-200/80 flex items-center gap-1 transition-colors cursor-pointer"
                title="Download Android APK & Project"
              >
                <Download className="w-3.5 h-3.5 text-emerald-600" />
                <span className="font-bold">APK</span>
              </button>
            )}

            {/* Quick shortcut to Android Home Screen & Widget preview */}
            {onGoToHomeScreen && (
              <button
                onClick={onGoToHomeScreen}
                className="px-2.5 py-1.5 text-xs font-semibold text-sky-700 bg-sky-50 hover:bg-sky-100 rounded-xl border border-sky-200/60 flex items-center gap-1.5 transition-colors cursor-pointer"
                title="Switch to Android Home Screen to view and test interactive widgets"
              >
                <Smartphone className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Widgets</span>
              </button>
            )}
          </div>
        </div>
      </header>

      {/* Main Goal Cards Scrollable Feed */}
      <main className="flex-1 overflow-y-auto px-4 py-4 pb-24 space-y-4">
        {goals.length === 0 ? (
          <div className="h-full min-h-[340px] flex flex-col items-center justify-center text-center p-6 bg-white/70 rounded-3xl border border-dashed border-slate-300">
            <div className="w-14 h-14 rounded-2xl bg-sky-50 text-sky-600 flex items-center justify-center mb-3">
              <Target className="w-7 h-7" />
            </div>
            <h2 className="text-base font-bold text-slate-900">
              No Goals Tracked Yet
            </h2>
            <p className="text-xs text-slate-600 mt-1.5 max-w-xs leading-relaxed">
              Create your first personal goal to start your daily streak countdown.
              Tap the &quot;Add Goal&quot; button in the bottom-right corner!
            </p>
            <button
              onClick={handleOpenAddModal}
              className="mt-4 px-4 py-2 bg-sky-600 hover:bg-sky-700 text-white text-xs font-semibold rounded-xl inline-flex items-center gap-1.5 transition-colors shadow-xs"
            >
              <Plus className="w-4 h-4" /> Add Your First Goal
            </button>
          </div>
        ) : (
          goals.map((goal) => {
            const isPinned = widgets.some((w) => w.goalId === goal.id);
            return (
              <GoalCard
                key={goal.id}
                goal={goal}
                simulatedDate={simulatedDate}
                onCheckIn={onCheckIn}
                onEdit={handleOpenEditModal}
                onDelete={onDeleteGoal}
                onPinWidget={onPinWidget}
                isWidgetPinned={isPinned}
              />
            );
          })
        )}
      </main>

      {/* Floating "Add Goal" Button in the BOTTOM-RIGHT CORNER */}
      <div className="absolute bottom-5 right-5 z-20">
        <button
          onClick={handleOpenAddModal}
          className="h-13 px-4.5 bg-sky-600 hover:bg-sky-700 active:scale-95 text-white font-bold text-sm rounded-2xl shadow-lg shadow-sky-600/30 flex items-center gap-2 transition-all focus:outline-none focus:ring-4 focus:ring-sky-500/20"
          aria-label="Add Goal"
        >
          <Plus className="w-5 h-5 stroke-[2.5]" />
          <span>Add Goal</span>
        </button>
      </div>

      {/* Add / Edit Goal Modal */}
      <GoalModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSave={handleSaveModal}
        initialGoal={editingGoal}
        simulatedDate={simulatedDate}
      />
    </div>
  );
};
