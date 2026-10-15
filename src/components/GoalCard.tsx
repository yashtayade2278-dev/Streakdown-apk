import React, { useState } from 'react';
import { Flame, Check, Calendar, Trash2, Edit3, Smartphone, Sparkles, Trophy, Award } from 'lucide-react';
import {
  Goal,
  calculateDaysRemaining,
  hasCheckedInOnDate,
  isGoalCompleted,
  calculateGoalCompletionStats,
  formatDisplayDate,
} from '../types.ts';

interface GoalCardProps {
  goal: Goal;
  simulatedDate: Date;
  onCheckIn: (id: string) => void;
  onEdit: (goal: Goal) => void;
  onDelete: (id: string) => void;
  onPinWidget: (goalId: string) => void;
  isWidgetPinned?: boolean;
}

export const GoalCard: React.FC<GoalCardProps> = ({
  goal,
  simulatedDate,
  onCheckIn,
  onEdit,
  onDelete,
  onPinWidget,
  isWidgetPinned = false,
}) => {
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [justCheckedIn, setJustCheckedIn] = useState(false);

  const isCompleted = isGoalCompleted(goal, simulatedDate);
  const { days: daysRemaining } = calculateDaysRemaining(
    goal.targetDate,
    simulatedDate
  );
  const checkedInToday = hasCheckedInOnDate(goal, simulatedDate);
  const completionStats = calculateGoalCompletionStats(goal, simulatedDate);

  const handleCheckInClick = () => {
    if (checkedInToday || isCompleted) return;
    onCheckIn(goal.id);
    setJustCheckedIn(true);
    setTimeout(() => setJustCheckedIn(false), 1200);
  };

  return (
    <div className={`rounded-2xl border transition-shadow p-5 flex flex-col justify-between gap-4 relative overflow-hidden ${
      isCompleted
        ? 'bg-emerald-50/30 border-emerald-200/90 shadow-xs'
        : 'bg-white border-slate-200/90 shadow-xs hover:shadow-sm'
    }`}>
      {justCheckedIn && (
        <div className="absolute inset-0 bg-sky-500/10 pointer-events-none flex items-center justify-center animate-fade-out">
          <div className="bg-sky-600 text-white text-xs font-semibold px-3 py-1.5 rounded-full shadow-md flex items-center gap-1.5 animate-bounce">
            <Sparkles className="w-3.5 h-3.5" /> Streak Updated!
          </div>
        </div>
      )}

      {/* Top Header: Title, Description, and inline Actions */}
      <div>
        <div className="flex items-start justify-between gap-3">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <h3 className="text-lg font-bold text-slate-900 tracking-tight leading-snug break-words">
                {goal.title}
              </h3>
              {isCompleted && (
                <span className="text-[11px] font-bold text-emerald-800 bg-emerald-100 px-2 py-0.5 rounded-md inline-flex items-center gap-1">
                  <Trophy className="w-3 h-3 text-emerald-600" /> Completed
                </span>
              )}
            </div>
            {goal.description && (
              <p className="mt-1 text-sm text-slate-600 leading-relaxed break-words">
                {goal.description}
              </p>
            )}
          </div>

          {/* Quick Actions (Edit, Delete, Pin) */}
          <div className="flex items-center gap-1 shrink-0 -mr-1">
            <button
              onClick={() => onPinWidget(goal.id)}
              title={isWidgetPinned ? 'Already on Home Screen' : 'Pin Widget to Android Home Screen'}
              className={`p-2 rounded-lg text-xs font-medium transition-colors ${
                isWidgetPinned
                  ? 'text-sky-600 bg-sky-50'
                  : 'text-slate-400 hover:text-sky-600 hover:bg-slate-100'
              }`}
              aria-label="Pin widget to home screen"
            >
              <Smartphone className="w-4 h-4" />
            </button>
            <button
              onClick={() => onEdit(goal)}
              title="Edit goal"
              className="p-2 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
              aria-label="Edit goal"
            >
              <Edit3 className="w-4 h-4" />
            </button>
            <button
              onClick={() => setShowDeleteConfirm(true)}
              title="Delete goal"
              className="p-2 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors"
              aria-label="Delete goal"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Delete Confirmation prompt */}
        {showDeleteConfirm && (
          <div className="mt-3 p-3 bg-rose-50 rounded-xl border border-rose-200 text-xs text-rose-800 flex items-center justify-between gap-2">
            <span>Delete this goal and its streak history?</span>
            <div className="flex items-center gap-2 shrink-0">
              <button
                onClick={() => {
                  onDelete(goal.id);
                  setShowDeleteConfirm(false);
                }}
                className="px-2.5 py-1 bg-rose-600 text-white font-medium rounded-md hover:bg-rose-700"
              >
                Delete
              </button>
              <button
                onClick={() => setShowDeleteConfirm(false)}
                className="px-2.5 py-1 bg-white text-slate-700 border border-slate-200 font-medium rounded-md hover:bg-slate-50"
              >
                Cancel
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Main Body: Completed Summary VS Active Streak Countdown */}
      {isCompleted ? (
        <div className="pt-2 border-t border-emerald-100 space-y-3">
          {/* Goal Completed Announcement Banner */}
          <div className="bg-emerald-100/70 border border-emerald-200 rounded-xl p-3 flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-emerald-600 text-white flex items-center justify-center shrink-0 shadow-xs">
                <Award className="w-4.5 h-4.5" />
              </div>
              <div>
                <span className="text-xs font-bold text-emerald-950 block leading-tight">
                  Goal Completed
                </span>
                <span className="text-[11px] text-emerald-800">
                  Target date ({formatDisplayDate(goal.targetDate)}) reached · No check-in required
                </span>
              </div>
            </div>
          </div>

          {/* Stats: Longest Streak and Days Missed */}
          <div className="grid grid-cols-2 gap-2.5">
            {/* Longest Streak */}
            <div className="bg-white border border-slate-200/90 rounded-xl p-3 flex flex-col justify-between shadow-2xs">
              <span className="text-xs font-semibold text-slate-600 flex items-center gap-1.5">
                <Flame className="w-4 h-4 text-amber-500 fill-amber-500" />
                Longest Streak
              </span>
              <div className="mt-1.5 flex items-baseline gap-1.5">
                <span className="text-2xl font-black text-amber-600 tabular-nums">
                  {completionStats.longestStreak}
                </span>
                <span className="text-xs font-medium text-slate-600">
                  {completionStats.longestStreak === 1 ? 'day' : 'days'}
                </span>
              </div>
              <span className="text-[10px] text-slate-600 mt-0.5">
                Best consecutive run
              </span>
            </div>

            {/* Days Missed */}
            <div className="bg-white border border-slate-200/90 rounded-xl p-3 flex flex-col justify-between shadow-2xs">
              <span className="text-xs font-semibold text-slate-600 flex items-center gap-1.5">
                <Calendar className="w-4 h-4 text-slate-400" />
                Days Missed
              </span>
              <div className="mt-1.5 flex items-baseline gap-1.5">
                <span
                  className={`text-2xl font-black tabular-nums ${
                    completionStats.daysMissed === 0
                      ? 'text-emerald-600'
                      : 'text-slate-800'
                  }`}
                >
                  {completionStats.daysMissed}
                </span>
                <span className="text-xs font-medium text-slate-600">
                  {completionStats.daysMissed === 1 ? 'day' : 'days'}
                </span>
              </div>
              <span className="text-[10px] text-slate-600 mt-0.5">
                {completionStats.daysMissed === 0
                  ? 'Perfect consistency!'
                  : `${completionStats.totalCheckIns} of ${completionStats.totalDays} checked in`}
              </span>
            </div>
          </div>
        </div>
      ) : (
        /* Regular Active Goal: Countdown, Current Streak, and Check In Button */
        <>
          <div className="grid grid-cols-2 gap-3 pt-1 border-t border-slate-100">
            {/* Days Remaining / Target Date */}
            <div className="flex flex-col">
              <span className="text-xs font-medium text-slate-600">Target Date</span>
              <div className="flex items-center gap-1.5 mt-0.5">
                <Calendar className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                <span className="text-sm font-semibold text-slate-900 tabular-nums">
                  {daysRemaining} {daysRemaining === 1 ? 'day' : 'days'} left
                </span>
              </div>
              <span className="text-[11px] text-slate-600 mt-0.5">
                Due {formatDisplayDate(goal.targetDate)}
              </span>
            </div>

            {/* Current Streak */}
            <div className="flex flex-col">
              <span className="text-xs font-medium text-slate-600">Current Streak</span>
              <div className="flex items-center gap-1.5 mt-0.5">
                <Flame
                  className={`w-4 h-4 shrink-0 transition-transform ${
                    goal.currentStreak > 0
                      ? 'text-amber-500 fill-amber-500 scale-105'
                      : 'text-slate-300'
                  }`}
                />
                <span
                  className={`text-lg font-bold tabular-nums ${
                    goal.currentStreak > 0 ? 'text-amber-600' : 'text-slate-400'
                  }`}
                >
                  {goal.currentStreak}
                </span>
                <span className="text-xs font-medium text-slate-600">
                  {goal.currentStreak === 1 ? 'day' : 'days'}
                </span>
              </div>
              <span className="text-[11px] text-slate-600 mt-0.5">
                {checkedInToday
                  ? 'Checked in for today'
                  : goal.currentStreak > 0
                  ? 'Check in to keep streak'
                  : 'Missed check-in · Check in restarts at 1'}
              </span>
            </div>
          </div>

          {/* Primary Daily Check In Action */}
          <div className="pt-1">
            {checkedInToday ? (
              <button
                disabled
                className="w-full h-11 rounded-xl bg-slate-100 text-slate-600 font-medium text-sm flex items-center justify-center gap-2 cursor-default select-none border border-slate-200"
              >
                <Check className="w-4 h-4 text-emerald-600 stroke-[2.5]" />
                <span>Checked In Today</span>
              </button>
            ) : (
              <button
                onClick={handleCheckInClick}
                className="w-full h-11 rounded-xl bg-sky-600 hover:bg-sky-700 active:scale-[0.99] text-white font-medium text-sm flex items-center justify-center gap-2 transition-all shadow-xs shadow-sky-600/20"
              >
                <Flame className="w-4 h-4 text-amber-200" />
                <span>
                  {goal.currentStreak === 0
                    ? 'Check In (Restart at 1)'
                    : 'Check In'}
                </span>
              </button>
            )}
          </div>
        </>
      )}
    </div>
  );
};

