# StreakDown — Minimalist Android Goal & Streak Tracker

StreakDown is a focused Android-style goal tracking application designed to help users reach personal milestones through daily check-in streaks and precise countdowns. It features a single-screen main interface, local storage persistence, and an interactive Android Home Screen Widget system with instant state synchronization.

## User Review & Critical Decisions

> [!IMPORTANT]
> The following product and design choices were confirmed in Phase 1 and guide this plan:

- **Confirmed Decision 1 (Android & Widget Experience)**: Interactive Android phone frame featuring both the **StreakDown App View** and the **Android Home Screen View**, allowing users to experience the application as well as place, inspect, and check into live Android home screen widgets.
- **Confirmed Decision 2 (Design System & Colorway)**: Material 3 light theme using **Material Ocean Blue** (`#0284c7` / `#0369a1`) paired with clean slate surfaces (`#f8fafc`, `#ffffff`), crisp typography, and high-contrast touch targets.
- **Confirmed Decision 3 (Goal Management)**: Goal cards include seamless inline edit and delete actions alongside the primary daily check-in action.
- **Open Decision (Time Travel Testing)**: A discreet "Simulate Next Day" date scrubber will be included in the Android system bar/widget control bar so users can readily verify streak continuity (+1 consecutive) and streak breaks (resetting to 1 after skipped days).

---

## 1. Overview & Core Concept

- **What It Does**: Allows users to create personal goals with a target date and description, tracking daily progress through a rigorous consecutive-day streak counter and a countdown indicator. Users can pin any goal as an interactive Android Home Screen widget to check in directly without opening the full app.
- **Target Audience / Persona**: Individuals seeking distraction-free personal habit building and milestone tracking without accounts, cloud dependencies, or notification noise.
- **Key Value**: Zero cognitive overhead—one screen, instant local feedback, and live home screen widgets that keep commitments front and center.

---

## 2. User Experience & Visual Design

### Key User Flows

1. **Viewing Goals (Zero to Many State)**:
   - When empty, a clean, welcoming Material 3 prompt guides the user to tap the bottom-left Floating Action Button (FAB).
   - When goals exist, cards display in a clean vertical feed showing Title, Description, Days Remaining badge (or "Completed"), Current Streak flame counter, and the primary Check In button.
2. **Creating a Goal**:
   - Tapping the bottom-left FAB (`Add Goal`) opens a clean Material bottom sheet / dialog.
   - Form fields: Title (required), Description (optional), Target Completion Date (required, date picker).
   - On save, the goal instantly appears in the card feed and becomes available for home screen widget placement.
3. **Daily Check-In**:
   - Users tap "Check In" on either a Goal Card or a Home Screen Widget.
   - Streak updates immediately. If the user checked in yesterday, the streak increments by 1. If checked in today already, button indicates "Checked In Today" (disabled). If a day was missed, streak resets to 1.
4. **Android Home Screen & Widgets**:
   - Users can switch to the Android Home Screen or tap "Add Widget" to pin any goal to the home screen.
   - Multiple widgets can be added simultaneously. Each widget displays the goal title, current streak, days remaining, and a functional "Check In" button.
   - Pressing "Check In" on the widget updates streak and countdown immediately, synchronized across app and widget.

### Visual Identity & Theme

- **Aesthetic Direction**: Material Design 3 (Material You) light-only theme with rounded containers, soft surface tints, and clear visual hierarchy.
- **Color Palette**:
  - Dominant Canvas (60%): `#f8fafc` (Slate 50) and `#ffffff` pure white cards.
  - Structural Surfaces (30%): Subtle hairline borders (`#e2e8f0`), `#f1f5f9` chip surfaces, and muted slate typography (`#64748b`).
  - Accent Budget (10%): `#0284c7` (Ocean Blue) for primary actions, `#e0f2fe` for subtle active container fills, and `#ea580c` for streak indicators.
- **Typography & Hierarchy**:
  - Display & Headings: `Plus Jakarta Sans` or system sans (600/700 weight).
  - Body & Form: Clean sans-serif (400/500 weight).
  - Metric Figures: Tabular numbers (`tabular-nums font-mono`) for countdown and streak numbers to prevent layout jitter.
- **Component Styling & Layout**:
  - Rounded containers (`rounded-2xl` to `rounded-3xl` for sheets/dialogs).
  - Minimum touch target hitbox of 44×44px for all controls.
  - FAB pinned to **bottom-left** per user specification (`fixed bottom-6 left-6`).

---

## 3. Key Product Decisions & Trade-Offs

- **Decision 1: Full-Featured Android Device Shell with Dual Modes**:
  - *Chosen Approach*: An interactive Android device frame that toggles between "StreakDown App" and "Android Home Screen".
  - *Why*: The home screen widget is explicitly specified as the "most important feature". Presenting it within an authentic Android home screen environment enables the user to test real widget placement, resizing, and one-tap widget check-ins side-by-side with the main app.
  - *Alternatives Considered*: A separate browser modal preview was considered, but it lacks the contextual realism and fidelity of an authentic home screen widget experience.
- **Decision 2: Streak Continuity Calculation**:
  - *Chosen Approach*: Normalized UTC/local calendar day comparison (`YYYY-MM-DD`). If last check-in was `today - 1 day`, streak increments. If `today`, check-in is blocked. If `today - 2+ days`, streak resets to 1.
  - *Why*: Deterministic and resilient against timezone shifts or minor clock drift.
- **Decision 3: Zero-Dependency Local Storage Persistence**:
  - *Chosen Approach*: `localStorage` with reactive state synchronization and an in-memory event bus to keep app view and widget view immediately in sync.
  - *Why*: Fast, offline-first, private, and fully complies with "no accounts, no cloud sync, no internet required".

---

## 4. Technical Architecture & Data Strategy

### Architecture & Component Diagram

```
┌────────────────────────────────────────────────────────────────────────┐
│                        StreakDown Main Shell                           │
│  ┌───────────────────────┐                  ┌───────────────────────┐  │
│  │   Android Phone Bar   │                  │  View Switcher & Date │  │
│  │ (Status, Time, Batt)  │                  │  Simulation Toolbar   │  │
│  └───────────┬───────────┘                  └───────────┬───────────┘  │
│              ▼                                          ▼              │
│  ┌──────────────────────────────────────────────────────────────────┐  │
│  │                     Active View Container                        │  │
│  │                                                                  │  │
│  │  ┌─────────────────────────────┐   ┌──────────────────────────┐  │  │
│  │  │       StreakDown App        │   │    Android Home Screen   │  │  │
│  │  │                             │   │                          │  │  │
│  │  │  • Main Header              │   │  • Google Search Bar     │  │  │
│  │  │  • Goal Cards List          │   │  • App Grid & Wallpapers │  │  │
│  │  │    - Title & Description    │   │  • Multi-Goal Widgets:   │  │  │
│  │  │    - Days Countdown         │   │    - Goal Title          │  │  │
│  │  │    - Current Streak         │   │    - Streak & Countdown  │  │  │
│  │  │    - Daily Check In Button  │   │    - Interactive CheckIn │  │  │
│  │  │    - Edit / Delete Actions  │   │  • "Pin Widget" Drawer   │  │  │
│  │  │  • Bottom-Left FAB (+)      │   │                          │  │  │
│  │  │  • Add/Edit Goal Modal      │   │                          │  │  │
│  │  └──────────────┬──────────────┘   └─────────────┬────────────┘  │  │
│  └─────────────────┼────────────────────────────────┼───────────────┘  │
│                    ▼                                ▼                  │
│  ┌──────────────────────────────────────────────────────────────────┐  │
│  │             Goal & Check-In State Management                     │  │
│  │  • checkInGoal(id, date)        • addGoal(goal)                  │  │
│  │  • editGoal(id, updates)        • deleteGoal(id)                 │  │
│  │  • pinWidget(goalId)            • removeWidget(widgetId)         │  │
│  │  • calculateCountdown(target)   • calculateStreak(history)       │  │
│  └──────────────────────────────────┬───────────────────────────────┘  │
│                                     ▼                                  │
│  ┌──────────────────────────────────────────────────────────────────┐  │
│  │             Browser LocalStorage Persistence Engine              │  │
│  │         Keys: `streakdown_goals`, `streakdown_widgets`           │  │
│  └──────────────────────────────────────────────────────────────────┘  │
└────────────────────────────────────────────────────────────────────────┘
```

### Data Model

```typescript
export interface Goal {
  id: string;
  title: string;
  description?: string;
  targetDate: string; // ISO format "YYYY-MM-DD"
  createdAt: string;  // ISO timestamp
  checkIns: string[]; // Array of unique "YYYY-MM-DD" dates
  currentStreak: number;
  lastCheckInDate?: string; // "YYYY-MM-DD"
}

export interface HomeWidget {
  id: string;
  goalId: string;
  addedAt: string;
}
```

### Verification & Test Plan

1. **Goal Creation**: Create a goal with target date 10 days in future; verify card displays title, description, "10 days remaining", streak 0, and active "Check In" button.
2. **Target Date Logic**: Set target date to today or past date; verify card displays "Completed".
3. **Streak Rules**:
   - Check in today: Streak increments to 1, button updates to "Checked In Today" (disabled).
   - Simulate next day: Button unlocks. Check in: Streak increments to 2.
   - Advance date by 2 days (missed day): Check in: Streak resets to 1.
4. **Android Widget Interaction**:
   - Switch to Android Home Screen, tap "Add Widget" for a goal.
   - Verify widget shows goal title, streak, and days remaining.
   - Click "Check In" on the widget: streak updates instantly on the widget and in the main app without delay.
5. **Responsiveness**: Verify on desktop and mobile viewports with clean Material 3 touch ergonomics.
