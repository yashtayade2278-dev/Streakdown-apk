/**
 * Kairo - Type Definitions and Date/Streak Utilities
 */

export interface Goal {
  id: string;
  title: string;
  description?: string;
  targetDate: string; // ISO format "YYYY-MM-DD"
  createdAt: string;  // ISO timestamp
  checkIns: string[]; // List of unique "YYYY-MM-DD" dates on which user checked in
  currentStreak: number;
  lastCheckInDate?: string; // "YYYY-MM-DD"
}

export interface HomeWidget {
  id: string;
  goalId: string;
  addedAt: string;
}

/**
 * Format a Date object to YYYY-MM-DD string using local calendar
 */
export function formatDateKey(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

/**
 * Format an ISO date string (YYYY-MM-DD) to dd-mm-yyyy for display
 */
export function formatDisplayDate(dateStr?: string): string {
  if (!dateStr) return 'dd-mm-yyyy';
  const parts = dateStr.split('-');
  if (parts.length === 3) {
    const [year, month, day] = parts;
    return `${day}-${month}-${year}`;
  }
  return dateStr;
}

/**
 * Parse a YYYY-MM-DD string into a local midnight Date
 */
export function parseDateKey(dateStr: string): Date {
  const [year, month, day] = dateStr.split('-').map(Number);
  return new Date(year, month - 1, day, 0, 0, 0, 0);
}

/**
 * Get yesterday's date string relative to a given date
 */
export function getYesterdayKey(date: Date): string {
  const yesterday = new Date(date);
  yesterday.setDate(yesterday.getDate() - 1);
  return formatDateKey(yesterday);
}

/**
 * Calculate days remaining until target date
 */
export function calculateDaysRemaining(
  targetDateStr: string,
  currentDate: Date = new Date()
): { days: number; isCompleted: boolean } {
  const currentKey = formatDateKey(currentDate);
  // On target date itself, it directly shows completed!
  if (currentKey >= targetDateStr) {
    return { days: 0, isCompleted: true };
  }

  const currentMid = parseDateKey(currentKey);
  const targetMid = parseDateKey(targetDateStr);
  const diffTime = targetMid.getTime() - currentMid.getTime();
  const days = Math.round(diffTime / (1000 * 60 * 60 * 24));

  return {
    days: Math.max(0, days),
    isCompleted: days <= 0,
  };
}

/**
 * Calculate current consecutive streak strictly based on check-in history
 * Rules:
 * - One check-in per day maximum.
 * - Consecutive daily check-ins increase the streak.
 * - Missing a day breaks the streak.
 * - If user checked in today: streak is the consecutive run leading up to and including today.
 * - If user has NOT checked in today:
 *   - If they checked in yesterday: streak is still active (consecutive run ending yesterday).
 *   - If they did not check in yesterday: streak is broken (0).
 */
export function calculateActiveStreak(
  checkIns: string[],
  currentDate: Date = new Date()
): number {
  if (!checkIns || checkIns.length === 0) return 0;

  const checkInSet = new Set(checkIns);
  const todayKey = formatDateKey(currentDate);
  const yesterdayKey = getYesterdayKey(currentDate);

  const hasToday = checkInSet.has(todayKey);
  const hasYesterday = checkInSet.has(yesterdayKey);

  // If neither today nor yesterday has a check-in, the streak is broken
  if (!hasToday && !hasYesterday) {
    return 0;
  }

  // Count consecutive days backwards
  let streak = 0;
  const cursor = new Date(currentDate);

  if (!hasToday) {
    // Start counting backwards from yesterday
    cursor.setDate(cursor.getDate() - 1);
  }

  while (true) {
    const key = formatDateKey(cursor);
    if (checkInSet.has(key)) {
      streak += 1;
      cursor.setDate(cursor.getDate() - 1);
    } else {
      break;
    }
  }

  return streak;
}

/**
 * Check if the user has already checked in on the given date
 */
export function hasCheckedInOnDate(goal: Goal, date: Date = new Date()): boolean {
  const key = formatDateKey(date);
  return goal.checkIns.includes(key);
}

/**
 * Process a check-in for a goal on a given date
 * Returns the updated Goal or null if already checked in today
 */
export function applyCheckIn(goal: Goal, date: Date = new Date()): Goal | null {
  const dateKey = formatDateKey(date);
  if (goal.checkIns.includes(dateKey)) {
    return null; // Already checked in on this date
  }

  const updatedCheckIns = [...goal.checkIns, dateKey].sort();
  const newStreak = calculateActiveStreak(updatedCheckIns, date);

  return {
    ...goal,
    checkIns: updatedCheckIns,
    currentStreak: newStreak,
    lastCheckInDate: dateKey,
  };
}

/**
 * Determine if a goal is completed
 * On target date itself, it directly shows completed (no check-in needed on target date).
 */
export function isGoalCompleted(goal: Goal, currentDate: Date = new Date()): boolean {
  const currentKey = formatDateKey(currentDate);
  return currentKey >= goal.targetDate;
}

/**
 * Calculate the longest consecutive daily check-in streak ever achieved
 */
export function calculateLongestStreak(checkIns: string[]): number {
  if (!checkIns || checkIns.length === 0) return 0;
  const sorted = Array.from(new Set(checkIns)).sort();
  let longest = 1;
  let current = 1;

  for (let i = 1; i < sorted.length; i++) {
    const prev = parseDateKey(sorted[i - 1]);
    const curr = parseDateKey(sorted[i]);
    const diff = Math.round((curr.getTime() - prev.getTime()) / (1000 * 60 * 60 * 24));

    if (diff === 1) {
      current += 1;
      if (current > longest) longest = current;
    } else if (diff > 1) {
      current = 1;
    }
  }

  return longest;
}

export interface GoalCompletionStats {
  isCompleted: boolean;
  longestStreak: number;
  daysMissed: number;
  totalDays: number;
  totalCheckIns: number;
}

/**
 * Calculate completion summary stats:
 * - Target date is NOT included in total days (e.g. from 15th to 17th is 2 days: 15th & 16th).
 * - On the 17th it directly shows completed.
 * - Days missed is calculated strictly across days before the target date.
 */
export function calculateGoalCompletionStats(
  goal: Goal,
  currentDate: Date = new Date()
): GoalCompletionStats {
  const longestStreak = calculateLongestStreak(goal.checkIns);

  let startKey: string;
  try {
    const createdDate = new Date(goal.createdAt);
    startKey = isNaN(createdDate.getTime()) ? goal.targetDate : formatDateKey(createdDate);
  } catch {
    startKey = goal.targetDate;
  }

  const endKey = goal.targetDate;
  const effectiveStartKey = startKey < endKey ? startKey : endKey;

  const startMid = parseDateKey(effectiveStartKey);
  const endMid = parseDateKey(endKey);

  // Target date is NOT included in total days!
  // e.g., start 15th, target 17th -> 17 - 15 = 2 days (15th and 16th), not 3!
  const diffDays = Math.round((endMid.getTime() - startMid.getTime()) / (1000 * 60 * 60 * 24));
  const totalDays = Math.max(1, diffDays);

  const checkInsSet = new Set(goal.checkIns);
  let checkedInCount = 0;
  const cursor = new Date(startMid);

  // Check each day strictly BEFORE the target date
  for (let i = 0; i < totalDays; i++) {
    const key = formatDateKey(cursor);
    if (key < endKey && checkInsSet.has(key)) {
      checkedInCount += 1;
    }
    cursor.setDate(cursor.getDate() + 1);
  }

  const daysMissed = Math.max(0, totalDays - checkedInCount);

  return {
    isCompleted: isGoalCompleted(goal, currentDate),
    longestStreak,
    daysMissed,
    totalDays,
    totalCheckIns: checkedInCount,
  };
}
