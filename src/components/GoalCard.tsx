import React, { useState } from 'react';
import { Flame, Check, Calendar, Trash2, Edit3, Sparkles, Trophy, Award } from 'lucide-react';
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
  colorIndex?: number;
  simulatedDate: Date;
  onCheckIn: (id: string) => void;
  onEdit: (goal: Goal) => void;
  onDelete: (id: string) => void;
}

export const GoalCard: React.FC<GoalCardProps> = ({
  goal,
  colorIndex = 0,
  simulatedDate,
  onCheckIn,
  onEdit,
  onDelete,
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

  const cardPalettes = [
    { bg: 'linear-gradient(135deg, #FFF8EE 0%, #FFF1DB 100%)', border: '#F4D9B9', accent: '#E9784E', soft: '#FFE5CB' },
    { bg: 'linear-gradient(135deg, #FFF8F7 0%, #FCE6EE 100%)', border: '#F2D0DD', accent: '#D85D87', soft: '#FBE0EA' },
    { bg: 'linear-gradient(135deg, #F8FBFF 0%, #E6F1FF 100%)', border: '#D0E1F6', accent: '#4389C8', soft: '#DDEEFF' },
    { bg: 'linear-gradient(135deg, #FFF9F0 0%, #F8EEDD 100%)', border: '#EAD9BF', accent: '#B88749', soft: '#F5E7D0' },
  ];
  const palette = cardPalettes[Math.abs(colorIndex) % cardPalettes.length];

  return (
    <div style={{ background: isCompleted ? 'linear-gradient(135deg, #F1FAF3 0%, #E6F5E8 100%)' : palette.bg, borderColor: isCompleted ? '#CDE8D2' : palette.border, ['--goal-accent' as any]: palette.accent, ['--goal-soft' as any]: palette.soft } as React.CSSProperties} className="kairo-goal-card rounded-[1.75rem] border transition-all p-5 shadow-sm hover:shadow-md flex flex-col gap-5 relative overflow-hidden">
      {justCheckedIn && (
        <div className="absolute inset-0 bg-[#F8A7A1]/20 pointer-events-none flex items-center justify-center animate-fade-out">
          <div className="bg-[#E9784E] text-white text-xs font-semibold px-3 py-1.5 rounded-full shadow-md flex items-center gap-1.5 animate-bounce">
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
            <div className="bg-white/65 border border-black/5 rounded-xl p-3 flex flex-col justify-between shadow-2xs">
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
            <div className="bg-white/65 border border-black/5 rounded-xl p-3 flex flex-col justify-between shadow-2xs">
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
          <div className="grid grid-cols-2 gap-5 pt-4 border-t border-black/10 items-stretch">
            {/* Days Remaining / Target Date */}
            <div className="flex flex-col min-w-0">
              <span className="text-sm font-semibold leading-6 min-h-6 text-slate-600">Target Date</span>
              <div className="flex items-center gap-2 mt-2 min-h-8">
                <Calendar className="w-4 h-4 text-slate-400 shrink-0" />
                <span className="text-base font-semibold text-slate-900 tabular-nums leading-6">
                  {daysRemaining} {daysRemaining === 1 ? 'day' : 'days'} left
                </span>
              </div>
              <span className="text-xs text-slate-600 mt-2 min-h-[2.5rem] leading-5 break-words">
                Due {formatDisplayDate(goal.targetDate)}
              </span>
            </div>

            {/* Current Streak */}
            <div className="flex flex-col min-w-0">
              <span className="text-sm font-semibold leading-6 min-h-6 text-slate-600">Current Streak</span>
              <div className="flex items-center gap-2 mt-2 min-h-8">
                <Flame
                  className={`w-4 h-4 shrink-0 transition-transform ${
                    goal.currentStreak > 0
                      ? 'text-amber-500 fill-amber-500 scale-105'
                      : 'text-slate-300'
                  }`}
                />
                <span
                  className={`text-xl font-bold tabular-nums leading-7 ${
                    goal.currentStreak > 0 ? 'text-amber-600' : 'text-slate-400'
                  }`}
                >
                  {goal.currentStreak}
                </span>
                <span className="text-xs font-medium text-slate-600">
                  {goal.currentStreak === 1 ? 'day' : 'days'}
                </span>
              </div>
              <span className="text-xs text-slate-600 mt-2 min-h-[2.5rem] leading-5 break-words">
                {checkedInToday
                  ? 'Checked in for today'
                  : goal.currentStreak > 0
                  ? 'Check in to keep streak'
                  : 'Missed check-in · Check in restarts at 1'}
              </span>
            </div>
          </div>

          {/* Primary Daily Check In Action */}
          <div className="pt-1 mt-auto">
            {checkedInToday ? (
              <button
                disabled
                className="w-full h-12 rounded-xl bg-[#F6EEDC] text-[#6C655D] font-medium text-sm flex items-center justify-center gap-2 cursor-default select-none border border-[#E9DDCC]"
              >
                <Check className="w-4 h-4 text-emerald-600 stroke-[2.5]" />
                <span>Checked In Today</span>
              </button>
            ) : (
              <button
                onClick={handleCheckInClick}
                className="kairo-checkin-button w-full h-12 rounded-xl font-semibold text-sm flex items-center justify-center gap-2 transition-all active:scale-[0.99]"
              >
                <Flame className="w-4 h-4" style={{ color: "var(--goal-accent)" }} />
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

