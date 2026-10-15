/**
 * Storage and Persistence Layer for StreakDown
 * Uses localStorage with custom event dispatching for instant multi-component reactivity.
 */

import {
  Goal,
  HomeWidget,
  applyCheckIn,
  calculateActiveStreak,
  formatDateKey,
} from '../types.ts';

const GOALS_STORAGE_KEY = 'streakdown_goals_v1';
const WIDGETS_STORAGE_KEY = 'streakdown_widgets_v1';
export const STORAGE_CHANGE_EVENT = 'streakdown_data_updated';

// Seed data generated relative to today's date
function getInitialSeedGoals(baseDate: Date = new Date()): Goal[] {
  const d1 = new Date(baseDate);
  d1.setDate(d1.getDate() + 30);

  const d2 = new Date(baseDate);
  d2.setDate(d2.getDate() + 45);

  // Seed check-in dates for Goal 1 (3-day streak ending yesterday, ready for check-in today)
  const g1Yesterday = new Date(baseDate);
  g1Yesterday.setDate(g1Yesterday.getDate() - 1);
  const g1TwoDaysAgo = new Date(baseDate);
  g1TwoDaysAgo.setDate(g1TwoDaysAgo.getDate() - 2);
  const g1ThreeDaysAgo = new Date(baseDate);
  g1ThreeDaysAgo.setDate(g1ThreeDaysAgo.getDate() - 3);

  const g1CheckIns = [
    formatDateKey(g1ThreeDaysAgo),
    formatDateKey(g1TwoDaysAgo),
    formatDateKey(g1Yesterday),
  ];

  // Seed check-in dates for Goal 2 (checked in today already, 5-day streak)
  const g2Today = formatDateKey(baseDate);
  const g2Yesterday = formatDateKey(new Date(baseDate.getTime() - 86400000));
  const g2TwoAgo = formatDateKey(new Date(baseDate.getTime() - 86400000 * 2));
  const g2ThreeAgo = formatDateKey(new Date(baseDate.getTime() - 86400000 * 3));
  const g2FourAgo = formatDateKey(new Date(baseDate.getTime() - 86400000 * 4));

  const g2CheckIns = [
    g2FourAgo,
    g2ThreeAgo,
    g2TwoAgo,
    g2Yesterday,
    g2Today,
  ];

  const goal1: Goal = {
    id: 'goal-seed-1',
    title: 'Morning 5km Run',
    description: 'Prepare for the autumn half-marathon with consistent daily runs.',
    targetDate: formatDateKey(d1),
    createdAt: new Date(baseDate.getTime() - 86400000 * 4).toISOString(),
    checkIns: g1CheckIns,
    currentStreak: calculateActiveStreak(g1CheckIns, baseDate),
    lastCheckInDate: formatDateKey(g1Yesterday),
  };

  const goal2: Goal = {
    id: 'goal-seed-2',
    title: 'Read 20 Pages of Non-Fiction',
    description: 'Expand mental models and deepen tech leadership habits.',
    targetDate: formatDateKey(d2),
    createdAt: new Date(baseDate.getTime() - 86400000 * 5).toISOString(),
    checkIns: g2CheckIns,
    currentStreak: calculateActiveStreak(g2CheckIns, baseDate),
    lastCheckInDate: g2Today,
  };

  return [goal1, goal2];
}

function notifyDataChanged() {
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new CustomEvent(STORAGE_CHANGE_EVENT));
  }
}

export function loadGoals(simulatedDate: Date = new Date()): Goal[] {
  try {
    const raw = localStorage.getItem(GOALS_STORAGE_KEY);
    if (!raw) {
      const seed = getInitialSeedGoals(simulatedDate);
      saveGoals(seed, false);
      return seed;
    }
    const goals: Goal[] = JSON.parse(raw);
    // Recalculate streak dynamically based on the current/simulated date
    return goals.map((g) => ({
      ...g,
      currentStreak: calculateActiveStreak(g.checkIns, simulatedDate),
    }));
  } catch {
    const seed = getInitialSeedGoals(simulatedDate);
    return seed;
  }
}

export function saveGoals(goals: Goal[], notify = true): void {
  try {
    localStorage.setItem(GOALS_STORAGE_KEY, JSON.stringify(goals));
    if (notify) notifyDataChanged();
  } catch (err) {
    console.error('Failed to save goals to localStorage:', err);
  }
}

export function loadWidgets(): HomeWidget[] {
  try {
    const raw = localStorage.getItem(WIDGETS_STORAGE_KEY);
    if (!raw) {
      // Default to 1 active widget on home screen for the first seed goal
      const defaultWidgets: HomeWidget[] = [
        {
          id: 'widget-default-1',
          goalId: 'goal-seed-1',
          addedAt: new Date().toISOString(),
        },
      ];
      saveWidgets(defaultWidgets, false);
      return defaultWidgets;
    }
    return JSON.parse(raw);
  } catch {
    return [];
  }
}

export function saveWidgets(widgets: HomeWidget[], notify = true): void {
  try {
    localStorage.setItem(WIDGETS_STORAGE_KEY, JSON.stringify(widgets));
    if (notify) notifyDataChanged();
  } catch (err) {
    console.error('Failed to save widgets to localStorage:', err);
  }
}

export function createGoal(
  data: { title: string; description?: string; targetDate: string },
  currentDate: Date = new Date()
): Goal {
  const goals = loadGoals(currentDate);
  const todayKey = formatDateKey(currentDate);
  const newGoal: Goal = {
    id: `goal-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
    title: data.title.trim(),
    description: data.description?.trim() || undefined,
    targetDate: data.targetDate,
    createdAt: new Date().toISOString(),
    checkIns: [todayKey], // Auto checked-in on creation day
    currentStreak: 1, // Streak immediately jumps to 1
    lastCheckInDate: todayKey,
  };

  const updatedGoals = [newGoal, ...goals];
  saveGoals(updatedGoals);
  return newGoal;
}

export function updateGoal(
  id: string,
  updates: Partial<Omit<Goal, 'id' | 'createdAt'>>,
  currentDate: Date = new Date()
): Goal | null {
  const goals = loadGoals(currentDate);
  const idx = goals.findIndex((g) => g.id === id);
  if (idx === -1) return null;

  const current = goals[idx];
  const updated: Goal = {
    ...current,
    ...updates,
    title: updates.title !== undefined ? updates.title.trim() : current.title,
    description:
      updates.description !== undefined
        ? updates.description.trim() || undefined
        : current.description,
  };

  // Recalculate streak if check-ins updated
  if (updates.checkIns) {
    updated.currentStreak = calculateActiveStreak(updated.checkIns, currentDate);
  }

  goals[idx] = updated;
  saveGoals(goals);
  return updated;
}

export function deleteGoal(id: string, currentDate: Date = new Date()): void {
  const goals = loadGoals(currentDate);
  const updatedGoals = goals.filter((g) => g.id !== id);
  saveGoals(updatedGoals);

  // Also remove any widgets associated with this deleted goal
  const widgets = loadWidgets();
  const updatedWidgets = widgets.filter((w) => w.goalId !== id);
  saveWidgets(updatedWidgets);
}

export function checkInGoal(id: string, currentDate: Date = new Date()): Goal | null {
  const goals = loadGoals(currentDate);
  const goal = goals.find((g) => g.id === id);
  if (!goal) return null;

  const updated = applyCheckIn(goal, currentDate);
  if (!updated) {
    return null; // Already checked in today
  }

  const updatedGoals = goals.map((g) => (g.id === id ? updated : g));
  saveGoals(updatedGoals);
  return updated;
}

export function pinWidget(goalId: string): HomeWidget {
  const widgets = loadWidgets();
  // Allow multiple widgets, but if this exact goal is already pinned, still allow or reuse
  const newWidget: HomeWidget = {
    id: `widget-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
    goalId,
    addedAt: new Date().toISOString(),
  };

  const updated = [...widgets, newWidget];
  saveWidgets(updated);
  return newWidget;
}

export function unpinWidget(widgetId: string): void {
  const widgets = loadWidgets();
  const updated = widgets.filter((w) => w.id !== widgetId);
  saveWidgets(updated);
}
