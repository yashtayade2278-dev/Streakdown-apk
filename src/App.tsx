/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useEffect, useCallback } from 'react';
import { Goal } from './types.ts';
import { loadGoals, createGoal, updateGoal, deleteGoal, checkInGoal, STORAGE_CHANGE_EVENT, replaceGoalsFromNative } from './utils/storage.ts';
import { AndroidFrame } from './components/AndroidFrame.tsx';
import { MainScreen } from './components/MainScreen.tsx';

export default function App() {
  const [goals, setGoals] = useState<Goal[]>(() => loadGoals(new Date()));
  const [currentDate, setCurrentDate] = useState<Date>(() => new Date());

  useEffect(() => {
    const timer = setInterval(() => setCurrentDate((p) => (new Date().toDateString() === p.toDateString() ? p : new Date())), 60000);
    return () => clearInterval(timer);
  }, []);

  const refreshData = useCallback(() => setGoals(loadGoals(new Date())), []);

  useEffect(() => {
    refreshData();
    const syncFromNative = async () => {
      try {
        const nativePlugin = (window as any)?.Capacitor?.Plugins?.StreakDownNative;
        if (!nativePlugin?.getGoals) return;
        const result = await nativePlugin.getGoals();
        if (Array.isArray(result?.goals)) {
          // Ignore legacy demo goals from older native storage; never seed examples.
          const nativeGoals = (result.goals as Goal[]).filter(
            (goal) => goal.id !== 'goal-seed-1' && goal.id !== 'goal-seed-2'
          );
          const hadLegacySamples = (result.goals as Goal[]).some(
            (goal) => goal.id === 'goal-seed-1' || goal.id === 'goal-seed-2'
          );
          if (nativeGoals.length > 0) {
            // Import genuine native goals before syncing the cleaned list back.
            replaceGoalsFromNative(nativeGoals);
            refreshData();
          }
          if (hadLegacySamples) {
            // Remove only known demo records. If the native list had no real goals,
            // preserve any real goals already stored by the web app.
            const cleanGoals = nativeGoals.length > 0 ? nativeGoals : loadGoals(new Date());
            await nativePlugin.syncGoals?.({ goals: cleanGoals });
          }
        }
      } catch {
        // Native bridge is unavailable in browser preview.
      }
    };
    void syncFromNative();
    const handleVisibility = () => { if (document.visibilityState === 'visible') void syncFromNative(); };
    const handleStorageChange = () => refreshData();
    document.addEventListener('visibilitychange', handleVisibility);
    window.addEventListener(STORAGE_CHANGE_EVENT, handleStorageChange);
    return () => {
      window.removeEventListener(STORAGE_CHANGE_EVENT, handleStorageChange);
      document.removeEventListener('visibilitychange', handleVisibility);
    };
  }, [refreshData]);

  const handleCheckIn = (goalId: string) => { checkInGoal(goalId, new Date()); refreshData(); };
  const handleAddGoal = (data: { title: string; description?: string; targetDate: string }) => { createGoal(data, new Date()); refreshData(); };
  const handleEditGoal = (id: string, updates: Partial<Goal>) => { updateGoal(id, updates, new Date()); refreshData(); };
  const handleDeleteGoal = (id: string) => { deleteGoal(id, new Date()); refreshData(); };

  return (
    <AndroidFrame>
      <MainScreen goals={goals} simulatedDate={currentDate} onCheckIn={handleCheckIn} onAddGoal={handleAddGoal} onEditGoal={handleEditGoal} onDeleteGoal={handleDeleteGoal} />
    </AndroidFrame>
  );
}
