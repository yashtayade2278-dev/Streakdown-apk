/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useEffect, useCallback } from 'react';
import { Goal, HomeWidget } from './types.ts';
import {
  loadGoals,
  loadWidgets,
  createGoal,
  updateGoal,
  deleteGoal,
  checkInGoal,
  pinWidget,
  unpinWidget,
  STORAGE_CHANGE_EVENT,
} from './utils/storage.ts';
import { AndroidFrame } from './components/AndroidFrame.tsx';
import { MainScreen } from './components/MainScreen.tsx';
import { AndroidHomeScreen } from './components/AndroidHomeScreen.tsx';

export default function App() {
  const [currentView, setCurrentView] = useState<'app' | 'homescreen'>('app');
  const [goals, setGoals] = useState<Goal[]>(() => loadGoals(new Date()));
  const [widgets, setWidgets] = useState<HomeWidget[]>(() => loadWidgets());
  const [currentDate, setCurrentDate] = useState<Date>(() => new Date());

  // Keep date in sync with real day turnover
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentDate(new Date());
    }, 60000); // Check every minute
    return () => clearInterval(timer);
  }, []);

  // Sync state from storage whenever a storage change event occurs
  const refreshData = useCallback(() => {
    setGoals(loadGoals(new Date()));
    setWidgets(loadWidgets());
  }, []);

  useEffect(() => {
    refreshData();

    const handleStorageChange = () => {
      refreshData();
    };

    window.addEventListener(STORAGE_CHANGE_EVENT, handleStorageChange);
    return () => {
      window.removeEventListener(STORAGE_CHANGE_EVENT, handleStorageChange);
    };
  }, [refreshData]);

  // Daily Check In Handler
  const handleCheckIn = (goalId: string) => {
    checkInGoal(goalId, new Date());
    refreshData();
  };

  // Add Goal Handler
  const handleAddGoal = (data: {
    title: string;
    description?: string;
    targetDate: string;
  }) => {
    createGoal(data, new Date());
    refreshData();
  };

  // Edit Goal Handler
  const handleEditGoal = (id: string, updates: Partial<Goal>) => {
    updateGoal(id, updates, new Date());
    refreshData();
  };

  // Delete Goal Handler
  const handleDeleteGoal = (id: string) => {
    deleteGoal(id, new Date());
    refreshData();
  };

  // Pin Goal to Android Home Screen Widget
  const handlePinWidget = (goalId: string) => {
    pinWidget(goalId);
    refreshData();
  };

  // Remove Widget from Android Home Screen
  const handleRemoveWidget = (widgetId: string) => {
    unpinWidget(widgetId);
    refreshData();
  };

  // Switch to StreakDown App view
  const handleOpenApp = () => {
    setCurrentView('app');
  };

  return (
    <AndroidFrame
      currentView={currentView}
      onViewChange={setCurrentView}
    >
      {currentView === 'app' ? (
        <MainScreen
          goals={goals}
          widgets={widgets}
          simulatedDate={currentDate}
          onCheckIn={handleCheckIn}
          onAddGoal={handleAddGoal}
          onEditGoal={handleEditGoal}
          onDeleteGoal={handleDeleteGoal}
          onPinWidget={handlePinWidget}
          onGoToHomeScreen={() => setCurrentView('homescreen')}
        />
      ) : (
        <AndroidHomeScreen
          goals={goals}
          widgets={widgets}
          simulatedDate={currentDate}
          onCheckIn={handleCheckIn}
          onRemoveWidget={handleRemoveWidget}
          onPinWidget={handlePinWidget}
          onOpenApp={handleOpenApp}
        />
      )}
    </AndroidFrame>
  );
}
