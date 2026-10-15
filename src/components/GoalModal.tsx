import React, { useState, useEffect, useRef } from 'react';
import { X, Calendar, Target, AlertCircle } from 'lucide-react';
import { Goal, formatDateKey, calculateDaysRemaining, formatDisplayDate } from '../types.ts';

interface GoalModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: { title: string; description?: string; targetDate: string }) => void;
  initialGoal?: Goal | null;
  simulatedDate: Date;
}

export const GoalModal: React.FC<GoalModalProps> = ({
  isOpen,
  onClose,
  onSave,
  initialGoal,
  simulatedDate,
}) => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [targetDate, setTargetDate] = useState('');
  const [error, setError] = useState<string | null>(null);
  const dateInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (initialGoal) {
      setTitle(initialGoal.title);
      setDescription(initialGoal.description || '');
      setTargetDate(initialGoal.targetDate);
    } else {
      setTitle('');
      setDescription('');
      // Do not set an arbitrary default date like Nov 14; start empty with dd-mm-yyyy placeholder
      setTargetDate('');
    }
    setError(null);
  }, [initialGoal, isOpen, simulatedDate]);

  if (!isOpen) return null;

  const todayStr = formatDateKey(simulatedDate);
  const tomorrowDate = new Date(simulatedDate);
  tomorrowDate.setDate(tomorrowDate.getDate() + 1);
  const tomorrowStr = formatDateKey(tomorrowDate);

  const { days, isCompleted } = targetDate
    ? calculateDaysRemaining(targetDate, simulatedDate)
    : { days: 0, isCompleted: false };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) {
      setError('Please provide a goal title.');
      return;
    }
    if (!targetDate) {
      setError('Please select a target completion date (dd-mm-yyyy).');
      return;
    }
    onSave({
      title: title.trim(),
      description: description.trim() || undefined,
      targetDate,
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs animate-fade-in">
      <div
        className="bg-white w-full max-w-md rounded-3xl shadow-xl border border-slate-200 overflow-hidden flex flex-col animate-scale-up"
        role="dialog"
        aria-modal="true"
      >
        {/* Header */}
        <div className="px-6 py-5 border-b border-slate-100 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-sky-50 text-sky-600 flex items-center justify-center">
              <Target className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-slate-900 leading-tight">
                {initialGoal ? 'Edit Goal' : 'New Goal'}
              </h2>
              <p className="text-xs text-slate-600">
                Track countdown and build daily consistency
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-full transition-colors"
            aria-label="Close dialog"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {error && (
            <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-xs text-rose-700 flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* Goal Title */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5">
              Goal Title <span className="text-rose-500">*</span>
            </label>
            <div className="relative">
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g., Read 30 mins, 10,000 Steps, Launch MVP"
                maxLength={80}
                required
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500 transition-colors"
                autoFocus
              />
            </div>
          </div>

          {/* Target Completion Date */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5">
              Target Completion Date <span className="text-rose-500">*</span>
            </label>
            <div className="relative flex items-center">
              <Calendar className="w-4 h-4 text-slate-400 absolute left-3.5 pointer-events-none z-10" />

              {/* Visual dd-mm-yyyy display */}
              <div
                onClick={() => {
                  try {
                    dateInputRef.current?.showPicker();
                  } catch {
                    dateInputRef.current?.focus();
                  }
                }}
                className="w-full pl-10 pr-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm flex items-center justify-between cursor-pointer transition-colors"
              >
                <span className={targetDate ? 'text-slate-900 font-medium' : 'text-slate-400 tracking-wider'}>
                  {targetDate ? formatDisplayDate(targetDate) : 'dd-mm-yyyy'}
                </span>
                <span className="text-[11px] text-sky-600 font-semibold select-none">
                  Pick Date
                </span>
              </div>

              {/* Native date input overlay */}
              <input
                ref={dateInputRef}
                type="date"
                value={targetDate}
                min={tomorrowStr}
                onChange={(e) => setTargetDate(e.target.value)}
                required
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-20"
              />
            </div>

            {/* Countdown Preview */}
            {targetDate && (
              <div className="mt-1.5 flex items-center justify-between text-[11px] text-slate-600 px-1">
                <span>Countdown:</span>
                <span className="font-semibold text-sky-700 tabular-nums">
                  {isCompleted
                    ? 'Target reached · Directly completed'
                    : `${days} ${days === 1 ? 'day' : 'days'} left (Completes on ${formatDisplayDate(targetDate)})`}
                </span>
              </div>
            )}
          </div>

          {/* Description (Optional) */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5">
              Description <span className="text-slate-400 font-normal">(Optional)</span>
            </label>
            <div className="relative">
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Add motivating notes, rules, or milestone details..."
                rows={3}
                maxLength={250}
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500 transition-colors resize-none"
              />
            </div>
          </div>

          {/* Footer Actions */}
          <div className="pt-2 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 text-xs font-semibold text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-xl transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2.5 bg-sky-600 hover:bg-sky-700 active:scale-[0.98] text-white text-xs font-semibold rounded-xl shadow-sm transition-all"
            >
              {initialGoal ? 'Save Changes' : 'Create Goal'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
