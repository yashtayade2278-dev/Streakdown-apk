import React, { useState } from 'react';
import {
  Search,
  Mic,
  Camera,
  Plus,
  Phone,
  MessageSquare,
  Globe,
  Flame,
  Calendar,
  Sparkles,
  CheckCircle2,
} from 'lucide-react';
import { Goal, HomeWidget, formatDisplayDate } from '../types.ts';
import { GoalWidget } from './GoalWidget.tsx';
import { KairoLogo } from './KairoLogo.tsx';

interface AndroidHomeScreenProps {
  goals: Goal[];
  widgets: HomeWidget[];
  simulatedDate: Date;
  onCheckIn: (goalId: string) => void;
  onRemoveWidget: (widgetId: string) => void;
  onPinWidget: (goalId: string) => void;
  onOpenApp: (goalId?: string) => void;
}

export const AndroidHomeScreen: React.FC<AndroidHomeScreenProps> = ({
  goals,
  widgets,
  simulatedDate,
  onCheckIn,
  onRemoveWidget,
  onPinWidget,
  onOpenApp,
}) => {
  const [showPicker, setShowPicker] = useState(false);

  // Map widgets to goals
  const widgetDataList = widgets
    .map((w) => {
      const goal = goals.find((g) => g.id === w.goalId);
      return goal ? { widget: w, goal } : null;
    })
    .filter((item): item is { widget: HomeWidget; goal: Goal } => item !== null);

  // Calculate active goals pending check-in today (completed goals do not require check in)
  const pendingGoalsCount = goals.filter((g) => {
    if (g.targetDate < simulatedDate.toISOString().split('T')[0]) return false;
    const todayKey = simulatedDate.toISOString().split('T')[0];
    if (g.targetDate === todayKey && g.checkIns.includes(todayKey)) return false;
    return !g.checkIns.includes(todayKey);
  }).length;

  const dateFormatted = simulatedDate.toLocaleDateString('en-US', {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
  });

  return (
    <div className="relative h-full flex flex-col justify-between bg-gradient-to-b from-slate-100 via-sky-50/50 to-slate-200 p-4 select-none overflow-y-auto">
      {/* Top Section: At a Glance + Widget Adder */}
      <div className="space-y-4">
        {/* Android At a Glance Widget */}
        <div className="flex items-center justify-between pt-1 px-1">
          <div>
            <div className="text-xl font-bold text-slate-800 tracking-tight">
              {dateFormatted}
            </div>
            <div className="text-xs font-medium text-slate-500 flex items-center gap-1.5 mt-0.5">
              <span>Partly Cloudy</span>
              <span>·</span>
              <span>21°C</span>
            </div>
          </div>

          {/* Quick Add Widget button */}
          <button
            onClick={() => setShowPicker(true)}
            className="px-3 py-1.5 bg-white/90 hover:bg-white text-slate-700 text-xs font-semibold rounded-full shadow-xs border border-slate-200/80 flex items-center gap-1.5 transition-all active:scale-95"
          >
            <Plus className="w-3.5 h-3.5 text-sky-600" />
            <span>Add Widget</span>
          </button>
        </div>

        {/* Google Android Search Bar */}
        <div className="bg-white/95 rounded-full px-4 py-2.5 shadow-xs border border-slate-200/80 flex items-center justify-between text-slate-500">
          <div className="flex items-center gap-3">
            <span className="text-base font-bold text-sky-600">G</span>
            <span className="text-xs text-slate-400">Search apps & web...</span>
          </div>
          <div className="flex items-center gap-3">
            <Mic className="w-4 h-4 text-slate-400 hover:text-slate-600 cursor-pointer" />
            <Camera className="w-4 h-4 text-slate-400 hover:text-slate-600 cursor-pointer" />
          </div>
        </div>

        {/* Home Screen Widgets Area (The Core Focus) */}
        <div>
          <div className="flex items-center justify-between px-1 mb-2">
            <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-700">
              <Sparkles className="w-3.5 h-3.5 text-sky-600" />
              <span>Active Goal Widgets ({widgetDataList.length})</span>
            </div>
            <span className="text-[11px] text-slate-600">Tap Check In directly</span>
          </div>

          {widgetDataList.length === 0 ? (
            <div className="bg-white/80 backdrop-blur-xs border border-dashed border-slate-300 rounded-2xl p-6 text-center">
              <Flame className="w-8 h-8 text-amber-500/60 mx-auto mb-2" />
              <h5 className="text-sm font-bold text-slate-800">
                No Widgets on Home Screen
              </h5>
              <p className="text-xs text-slate-600 mt-1 max-w-xs mx-auto">
                Add quick-access goal widgets to track days remaining and check in
                with one tap without opening the app!
              </p>
              <button
                onClick={() => setShowPicker(true)}
                className="mt-3.5 px-4 py-2 bg-sky-600 hover:bg-sky-700 text-white text-xs font-semibold rounded-xl inline-flex items-center gap-1.5 transition-colors shadow-xs"
              >
                <Plus className="w-3.5 h-3.5" /> Pin a Goal Widget
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {widgetDataList.map(({ widget, goal }) => (
                <GoalWidget
                  key={widget.id}
                  goal={goal}
                  widgetId={widget.id}
                  simulatedDate={simulatedDate}
                  onCheckIn={onCheckIn}
                  onRemoveWidget={onRemoveWidget}
                  onOpenApp={onOpenApp}
                />
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Bottom Section: Android Dock / Pinned Apps */}
      <div className="pt-6 pb-2">
        <div className="bg-white/70 backdrop-blur-md rounded-3xl p-3 shadow-xs border border-slate-200/60 flex items-center justify-around">
          {/* Phone */}
          <div className="flex flex-col items-center gap-1 cursor-default opacity-80 hover:opacity-100">
            <div className="w-11 h-11 rounded-2xl bg-emerald-500 text-white flex items-center justify-center shadow-xs">
              <Phone className="w-5 h-5" />
            </div>
            <span className="text-[10px] font-medium text-slate-600">Phone</span>
          </div>

          {/* Messages */}
          <div className="flex flex-col items-center gap-1 cursor-default opacity-80 hover:opacity-100">
            <div className="w-11 h-11 rounded-2xl bg-blue-500 text-white flex items-center justify-center shadow-xs">
              <MessageSquare className="w-5 h-5" />
            </div>
            <span className="text-[10px] font-medium text-slate-600">Chat</span>
          </div>

          {/* Chrome */}
          <div className="flex flex-col items-center gap-1 cursor-default opacity-80 hover:opacity-100">
            <div className="w-11 h-11 rounded-2xl bg-amber-500 text-white flex items-center justify-center shadow-xs">
              <Globe className="w-5 h-5" />
            </div>
            <span className="text-[10px] font-medium text-slate-600">Chrome</span>
          </div>

          {/* Kairo App (Interactive) */}
          <button
            onClick={() => onOpenApp()}
            className="flex flex-col items-center gap-1 group relative transition-transform active:scale-95"
            title="Open Kairo App"
          >
            <div className="relative">
              <KairoLogo size={44} />
              {pendingGoalsCount > 0 && (
                <span className="absolute -top-1 -right-1 w-5 h-5 bg-amber-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center border-2 border-white shadow-xs">
                  {pendingGoalsCount}
                </span>
              )}
            </div>
            <span className="text-[10px] font-bold text-slate-700">Kairo</span>
          </button>
        </div>
      </div>

      {/* Widget Picker Modal / Drawer */}
      {showPicker && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs animate-fade-in">
          <div className="bg-white w-full max-w-sm rounded-3xl p-5 shadow-xl border border-slate-200 animate-scale-up">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div>
                <h3 className="text-base font-bold text-slate-900">
                  Add Goal Widget
                </h3>
                <p className="text-xs text-slate-600">
                  Select a goal to pin to Android Home
                </p>
              </div>
              <button
                onClick={() => setShowPicker(false)}
                className="text-slate-400 hover:text-slate-600 p-1 rounded-full"
              >
                ✕
              </button>
            </div>

            <div className="py-3 max-h-60 overflow-y-auto space-y-2">
              {goals.length === 0 ? (
                <div className="text-center py-6 text-xs text-slate-600">
                  No goals found. Create a goal in the app first!
                </div>
              ) : (
                goals.map((goal) => {
                  const isPinned = widgets.some((w) => w.goalId === goal.id);
                  return (
                    <button
                      key={goal.id}
                      onClick={() => {
                        onPinWidget(goal.id);
                        setShowPicker(false);
                      }}
                      className="w-full text-left p-3 rounded-xl border border-slate-200/90 hover:border-sky-500 hover:bg-sky-50/50 transition-all flex items-center justify-between gap-3 group"
                    >
                      <div className="min-w-0">
                        <div className="text-xs font-bold text-slate-900 truncate">
                          {goal.title}
                        </div>
                        <div className="text-[11px] text-slate-600 flex items-center gap-1.5 mt-0.5">
                          <span>Streak: {goal.currentStreak}d</span>
                          <span>·</span>
                          <span>Due {formatDisplayDate(goal.targetDate)}</span>
                        </div>
                      </div>
                      <div className="shrink-0">
                        {isPinned ? (
                          <span className="text-[11px] font-semibold text-sky-700 bg-sky-100 px-2 py-0.5 rounded-full flex items-center gap-1">
                            <CheckCircle2 className="w-3 h-3" /> Pinned
                          </span>
                        ) : (
                          <span className="text-[11px] font-semibold text-slate-600 group-hover:text-sky-600 flex items-center gap-1">
                            <Plus className="w-3 h-3" /> Pin
                          </span>
                        )}
                      </div>
                    </button>
                  );
                })
              )}
            </div>

            <div className="pt-2 border-t border-slate-100 flex justify-end">
              <button
                onClick={() => setShowPicker(false)}
                className="px-4 py-2 text-xs font-semibold text-slate-600 hover:text-slate-800"
              >
                Done
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
