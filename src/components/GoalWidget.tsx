import React, { useState } from 'react';
import { Flame, Check, Calendar, X, Sparkles, Trophy } from 'lucide-react';
import { KairoLogo } from './KairoLogo.tsx';
import {
  Goal,
  calculateDaysRemaining,
  hasCheckedInOnDate,
  isGoalCompleted,
  calculateGoalCompletionStats,
} from '../types.ts';

interface GoalWidgetProps {
  goal: Goal;
  widgetId: string;
  simulatedDate: Date;
  onCheckIn: (goalId: string) => void;
  onRemoveWidget: (widgetId: string) => void;
  onOpenApp: (goalId?: string) => void;
}

export const GoalWidget: React.FC<GoalWidgetProps> = ({
  goal,
  widgetId,
  simulatedDate,
  onCheckIn,
  onRemoveWidget,
  onOpenApp,
}) => {
  const [justCheckedIn, setJustCheckedIn] = useState(false);

  const isCompleted = isGoalCompleted(goal, simulatedDate);
  const { days: daysRemaining } = calculateDaysRemaining(
    goal.targetDate,
    simulatedDate
  );
  const checkedInToday = hasCheckedInOnDate(goal, simulatedDate);
  const completionStats = calculateGoalCompletionStats(goal, simulatedDate);

  const handleCheckIn = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (checkedInToday || isCompleted) return;
    onCheckIn(goal.id);
    setJustCheckedIn(true);
    setTimeout(() => setJustCheckedIn(false), 1200);
  };

  const handleRemove = (e: React.MouseEvent) => {
    e.stopPropagation();
    onRemoveWidget(widgetId);
  };

  return (
    <div
      onClick={() => onOpenApp(goal.id)}
      className={`group relative rounded-2xl p-3.5 shadow-md border hover:shadow-lg transition-all cursor-pointer flex flex-col justify-between select-none ${
        isCompleted
          ? 'bg-emerald-50/70 border-emerald-200/90'
          : 'bg-white/95 backdrop-blur-md border-slate-200/90'
      }`}
    >
      {/* Micro confetti / animation feedback */}
      {justCheckedIn && (
        <div className="absolute inset-0 bg-[#F8A7A1]/15 rounded-2xl pointer-events-none flex items-center justify-center animate-fade-out z-10">
          <div className="bg-sky-600 text-white text-[11px] font-semibold px-2.5 py-1 rounded-full shadow-md flex items-center gap-1">
            <Sparkles className="w-3 h-3" /> Streak +1!
          </div>
        </div>
      )}

      {/* Widget Header with Android app indicator and remove icon */}
      <div className="flex items-center justify-between gap-1.5 pb-1">
        <div className="flex items-center gap-1.5 min-w-0">
          {/* Mini App icon */}
          <KairoLogo size={16} />
          <span className="text-[10px] font-semibold text-slate-600 tracking-wider uppercase truncate">
            Kairo
          </span>
        </div>

        <div className="flex items-center gap-1">
          {isCompleted && (
            <span className="text-[9px] font-bold text-emerald-800 bg-emerald-100/90 px-1.5 py-0.5 rounded flex items-center gap-0.5">
              <Trophy className="w-2.5 h-2.5 text-emerald-600" /> Done
            </span>
          )}

          {/* Remove widget from home screen button */}
          <button
            onClick={handleRemove}
            title="Remove widget from home screen"
            className="w-5 h-5 rounded-full text-slate-400 hover:text-slate-700 hover:bg-slate-100 flex items-center justify-center opacity-70 group-hover:opacity-100 transition-opacity"
            aria-label="Remove widget"
          >
            <X className="w-3 h-3" />
          </button>
        </div>
      </div>

      {/* Goal Title */}
      <div className="my-1">
        <h4 className="text-sm font-bold text-slate-900 leading-snug line-clamp-2">
          {goal.title}
        </h4>
        {goal.description && (
          <p className="text-[11px] text-slate-600 line-clamp-1 mt-0.5">
            {goal.description}
          </p>
        )}
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 gap-2 my-2 py-1.5 px-2 bg-white/80 rounded-xl border border-slate-200/80">
        {isCompleted ? (
          <>
            {/* Completed: Longest Streak */}
            <div className="flex flex-col">
              <span className="text-[10px] font-medium text-slate-500 uppercase tracking-tight">
                Longest
              </span>
              <div className="flex items-center gap-1 mt-0.5">
                <Flame className="w-3.5 h-3.5 shrink-0 text-amber-500 fill-amber-500" />
                <span className="text-sm font-bold tabular-nums text-amber-600">
                  {completionStats.longestStreak}d
                </span>
              </div>
            </div>

            {/* Completed: Days Missed */}
            <div className="flex flex-col">
              <span className="text-[10px] font-medium text-slate-500 uppercase tracking-tight">
                Missed
              </span>
              <div className="flex items-center gap-1 mt-0.5">
                <Calendar className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                <span className={`text-sm font-bold tabular-nums ${
                  completionStats.daysMissed === 0 ? 'text-emerald-600' : 'text-slate-800'
                }`}>
                  {completionStats.daysMissed}d
                </span>
              </div>
            </div>
          </>
        ) : (
          <>
            {/* Active: Current Streak */}
            <div className="flex flex-col">
              <span className="text-[10px] font-medium text-slate-500 uppercase tracking-tight">
                Streak
              </span>
              <div className="flex items-center gap-1 mt-0.5">
                <Flame
                  className={`w-3.5 h-3.5 shrink-0 ${
                    goal.currentStreak > 0
                      ? 'text-amber-500 fill-amber-500'
                      : 'text-slate-300'
                  }`}
                />
                <span
                  className={`text-sm font-bold tabular-nums ${
                    goal.currentStreak > 0 ? 'text-amber-600' : 'text-slate-400'
                  }`}
                >
                  {goal.currentStreak}d
                </span>
              </div>
            </div>

            {/* Active: Countdown */}
            <div className="flex flex-col">
              <span className="text-[10px] font-medium text-slate-500 uppercase tracking-tight">
                Countdown
              </span>
              <div className="flex items-center gap-1 mt-0.5">
                <Calendar className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                <span className="text-sm font-bold text-slate-800 tabular-nums">
                  {daysRemaining}d left
                </span>
              </div>
            </div>
          </>
        )}
      </div>

      {/* Widget Action: Completed Banner OR Check In Button */}
      <div className="pt-0.5">
        {isCompleted ? (
          <div
            onClick={(e) => e.stopPropagation()}
            className="w-full h-8 rounded-lg bg-emerald-100/90 text-emerald-900 font-bold text-xs flex items-center justify-center gap-1.5 border border-emerald-300/80 cursor-default"
          >
            <Trophy className="w-3.5 h-3.5 text-emerald-700" />
            <span>Goal Completed</span>
          </div>
        ) : checkedInToday ? (
          <button
            disabled
            onClick={(e) => e.stopPropagation()}
            className="w-full h-8 rounded-lg bg-slate-100 text-slate-600 font-semibold text-xs flex items-center justify-center gap-1.5 border border-slate-200 cursor-default"
          >
            <Check className="w-3.5 h-3.5 text-emerald-600 stroke-[2.5]" />
            <span>Checked In</span>
          </button>
        ) : (
          <button
            onClick={handleCheckIn}
            className="w-full h-8 rounded-lg bg-gradient-to-r from-[#F9C77A] to-[#F8A7A1] active:scale-[0.98] text-white font-semibold text-xs flex items-center justify-center gap-1.5 transition-colors shadow-xs"
          >
            <Flame className="w-3.5 h-3.5 text-amber-200" />
            <span>{goal.currentStreak === 0 ? 'Restart at 1' : 'Check In'}</span>
          </button>
        )}
      </div>
    </div>
  );
};
