# Full Application & Schema Audit Report: The Improvement System (TIS)

**Audit Date**: September 28, 2026  
**Auditor**: Antigravity Investigation Specialist  
**Repository**: `IGNISTHEBOSs1/theimprovementsystem`  
**Target Supabase Instance**: `xbrzrxfntixkiykfczjf.supabase.co`  
**Audit Methodology**: Read-only static analysis, call-chain tracing, live PostgREST schema verification, edge function probe analysis, and UI-to-backend linkage auditing. No source files, database migrations, or remote records were modified.

---

## 1. Scope & Coverage

### 1.1 Complete Verified Codebase Inventory

Every file and subsystem in the repository has been inventoried and audited against the active production application. All artifact counts below reflect verified disk files (zero hallucinated paths):

| Artifact Category | Total Count | Files / Subsystems Audited | Status | Notes |
| :--- | :---: | :--- | :---: | :--- |
| **Routes** | 9 | `src/App.tsx` (`/auth`, `/`, `/journey`, `/quests`, `/mentor`, `/profile`, `/profile/history`, `/profile/settings`, `*`) | Audited (100%) | Route definitions, layout wrappers, error boundaries, and redirection guards verified |
| **Pages** | 10 | `Auth.tsx`, `Dashboard.tsx`, `Journey.tsx`, `Landing.tsx`, `Mentor.tsx`, `NotFound.tsx`, `Profile.tsx`, `QuestHistory.tsx`, `Quests.tsx`, `Settings.tsx` in `src/pages/` | Audited (100%) | Full line-by-line inspection of state, event handlers, and data flow |
| **Layouts** | 1 | `src/layouts/AppLayout.tsx` | Audited (100%) | Persistent authenticated shell, swipe-to-navigate gesture system, provider mounting |
| **App Components** | 22 | `branding/Logo.tsx`, `dashboard/DailyClosureCard.tsx`, `dashboard/DirectionCard.tsx`, `dashboard/FirstLaunchState.tsx`, `dashboard/PageHeader.tsx`, `dashboard/PrimaryActionPanel.tsx`, `dashboard/RecoveryState.tsx`, `diagnostics/DevErrorBoundary.tsx`, `diagnostics/RenderProfiler.tsx`, `diagnostics/RouteErrorBoundary.tsx`, `diagnostics/ViewportNavDiagnostic.tsx`, `journey/TrajectoryChart.tsx`, `journey/TrajectoryVisualizer.tsx`, `mentor/AutoRebalanceModal.tsx`, `onboarding/AppTour.tsx`, `quests/QuestCard.tsx`, `quests/TodaysCommitment.tsx`, `shared/CommandPalette.tsx`, `shared/PlaceholderExperience.tsx`, `system-bar/IdentityAvatar.tsx`, `system-bar/SystemBar.tsx`, `NavLink.tsx` in `src/components/` | Audited (100%) | Verified props, rendering, event dispatching, and active consumption |
| **UI Components (shadcn)** | 54 | `src/components/ui/*` | Audited (100%) | Inspected all 54 primitives; checked custom components (`comparison-table.tsx`, `comparison-3.tsx`, `loading-screen.tsx`, `magnetic.tsx`) |
| **Hooks** | 9 | `use-mobile.tsx`, `use-toast.ts`, `useAuth.ts`, `useDailyLoginBonus.ts`, `useDashboardData.ts`, `usePomodoroTimer.tsx`, `useSoundEffects.ts`, `useTheme.ts`, `useTimezone.ts` in `src/hooks/` | Audited (100%) | Verified consumers, lifecycle hooks, storage access, and database queries |
| **Libraries & Utilities** | 14 | `animations.ts`, `devDiagnostics.ts`, `goalStats.ts`, `guidance.ts`, `haptics.ts`, `insights.ts`, `lazyWithRetry.ts`, `motion-tokens.ts`, `preloadRecovery.ts`, `priority.ts`, `rebalance.ts`, `serverTime.ts`, `trajectory.ts`, `utils.ts` in `src/lib/` | Audited (100%) | Mathematical consistency, date handling, and caller linkages verified |
| **Context Providers** | 3 | `AuthProvider.tsx`, `DashboardDataProvider.tsx`, `ThemeProvider.tsx` in `src/providers/` | Audited (100%) | Context propagation, sync loops, error handling, and persistence verified |
| **Types** | 1 | `src/types/quest.ts` | Audited (100%) | Authoritative domain model for Quests, priorities, and recurrence |
| **Integrations** | 3 | `src/integrations/lovable/index.ts`, `src/integrations/supabase/client.ts`, `src/integrations/supabase/types.ts` | Audited (100%) | Supabase client initialization, Lovable OAuth client, auto-generated database typings |
| **Edge Functions** | 2 | `ai-assistant/index.ts`, `generate-achievement-image/index.ts` in `supabase/functions/` | Audited (100%) | Inspected code, `supabase/config.toml`, and live HTTP endpoints |
| **Database Migrations** | 9 | `supabase/migrations/*.sql` (9 files) | Audited (100%) | All SQL DDL files traced against live schema |
| **Live Database Schema** | 7 Objects | Tables (3): `profiles`, `game_state`, `daily_login_bonus`<br>Views (1): `leaderboard_view`<br>RPCs (3): `get_server_time`, `handle_new_user`, `update_updated_at_column` | Audited (100%) | Verified against live Supabase instance `xbrzrxfntixkiykfczjf` |
| **Archive** | 43 | `src/archive/2026-v0/dead/` (3), `src/archive/2026-v0/dormant/` (40) | Audited (High-Level) | Confirmed exactly 0 live imports across active codebase |

---

## 2. Summary of Findings

### 2.1 Findings Matrix by Category and Severity

| Category | Blocker | Major | Minor | Total |
| :--- | :---: | :---: | :---: | :---: |
| **A. UI With No Backing** | 0 | 2 | 2 | **4** |
| **B. False Claims (Marketing vs Code)** | 0 | 5 | 0 | **5** |
| **C. Backend With No UI** | 0 | 4 | 3 | **7** |
| **D. Disconnected Wiring** | 0 | 4 | 6 | **10** |
| **E. Fake / Static Data Presented as Real** | 0 | 1 | 0 | **1** |
| **F. Silent Failures** | 1 | 2 | 2 | **5** |
| **G. Data Mismatches** | 0 | 2 | 1 | **3** |
| **H. Broken Flows** | 1 | 1 | 0 | **2** |
| **Total** | **2** | **21** | **14** | **37** |

---

## 3. Detailed Audit Findings (37 Verified Findings)

---

### Category A: UI With No Backing

#### [Finding A-01] Apple OAuth Provider button rendered on Auth page but unsupported on backend
- **Category**: A. UI With No Backing
- **Severity**: MAJOR
- **Confidence**: CONFIRMED
- **Location**: [`src/pages/Auth.tsx:352-367`](file:///c:/Users/user/Documents/My%20stuff/theimprovementsystem/src/pages/Auth.tsx#L352-L367)
- **Evidence**:
  ```tsx
  <Button type="button" variant="outline" disabled={appleLoading}
    className="rounded-lg border border-border dark:border-white/10 bg-card hover:bg-muted/60 dark:bg-muted/30 dark:hover:bg-muted/60 backdrop-blur-md text-foreground font-tech-mono text-xs h-8 sm:h-9 active:scale-[0.98] shadow-xs"
    onClick={async () => {
      playClick(); setAppleLoading(true);
      const { error } = await supabase.auth.signInWithOAuth({ provider: 'apple', options: { redirectTo: window.location.origin } });
      if (error) { playError(); toast({ title: 'Apple sign-in failed', variant: 'destructive' }); setAppleLoading(false); }
    }}
  >
    {appleLoading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : (
      <svg className="w-3.5 h-3.5 mr-1.5" viewBox="0 0 24 24" fill="currentColor">
        <path d="M17.05 20.28c-.98.95-2.05.88-3.08.4-1.09-.5-2.08-.48-3.24 0-1.44.62-2.2.44-3.06-.4C2.79 15.25 3.51 7.59 9.05 7.31c1.35.07 2.29.74 3.08.8 1.18-.24 2.31-.93 3.57-.84 1.51.12 2.65.72 3.4 1.8-3.12 1.87-2.38 5.98.48 7.13-.57 1.5-1.31 2.99-2.54 4.09zM12.03 7.25c-.15-2.23 1.66-4.07 3.74-4.25.29 2.58-2.34 4.5-3.74 4.25z"/>
      </svg>
    )}
    Apple
  </Button>
  ```
  Live HTTP probe to Supabase Auth endpoint `https://xbrzrxfntixkiykfczjf.supabase.co/auth/v1/authorize?provider=apple`:
  ```json
  {"code":400,"error_code":"validation_failed","msg":"Unsupported provider: provider is not enabled"}
  ```
- **What is broken**: The Apple OAuth sign-in button is fully interactive and styled as an active sign-in option alongside Google. Clicking it triggers `supabase.auth.signInWithOAuth({ provider: 'apple' })`, which immediately fails with HTTP 400 because Apple OAuth credentials have not been configured on the Supabase backend.
- **User impact**: Every user who attempts to sign up or sign in with Apple is shown a destructive toast ("Apple sign-in failed") and cannot authenticate.
- **Root cause**: Frontend button was placed in the UI before configuring Apple Developer credentials and keys in the Supabase project dashboard.

---

#### [Finding A-02] Command Palette multi-key shortcut badges have no keyboard event listeners
- **Category**: A. UI With No Backing
- **Severity**: MINOR
- **Confidence**: CONFIRMED
- **Location**: [`src/components/shared/CommandPalette.tsx:70-112`](file:///c:/Users/user/Documents/My%20stuff/theimprovementsystem/src/components/shared/CommandPalette.tsx#L70-L112)
- **Evidence**:
  ```tsx
  <CommandItem onSelect={() => runCommand(() => navigate("/"))}>
    <LayoutDashboard className="mr-2 size-4 text-muted-foreground" />
    <span>Dashboard</span>
    <CommandShortcut>G D</CommandShortcut>
  </CommandItem>
  <CommandItem onSelect={() => runCommand(() => navigate("/quests"))}>
    <CheckSquare className="mr-2 size-4 text-muted-foreground" />
    <span>Quests & Commitments</span>
    <CommandShortcut>G Q</CommandShortcut>
  </CommandItem>
  ...
  <CommandItem onSelect={() => runCommand(() => navigate("/quests"))}>
    <Plus className="mr-2 size-4 text-primary" />
    <span>Make a New Commitment</span>
    <CommandShortcut>C</CommandShortcut>
  </CommandItem>
  ```
  `CommandPalette.tsx:48-58` only listens for `Cmd+K` / `Ctrl+K`:
  ```typescript
  const handleKeyDown = (e: KeyboardEvent) => {
    if ((e.key === "k" && (e.metaKey || e.ctrlKey))) {
      e.preventDefault();
      setOpen(!open);
    }
  };
  ```
- **What is broken**: The Command Palette items display visual `<CommandShortcut>` tags indicating key chords: `G D`, `G Q`, `G J`, `G M`, `G P`, `G S`, and `C`. However, there is no keydown sequence listener registered anywhere in the application to intercept these key sequences.
- **User impact**: Users attempting to use Vim/Gmail-style chords (`g` then `d`) to navigate find that the shortcuts do nothing.
- **Root cause**: The shortcut badges were added to the command item markup as visual decoration without implementing a multi-key chord listener.

---

#### [Finding A-03] AutoRebalanceModal instructs user to change recurring days, but no edit UI exists
- **Category**: A. UI With No Backing / H. Broken Flows
- **Severity**: MAJOR
- **Confidence**: CONFIRMED
- **Location**: [`src/components/mentor/AutoRebalanceModal.tsx:66-70, 77-81`](file:///c:/Users/user/Documents/My%20stuff/theimprovementsystem/src/components/mentor/AutoRebalanceModal.tsx#L66-L70), [`src/components/quests/QuestCard.tsx:21`](file:///c:/Users/user/Documents/My%20stuff/theimprovementsystem/src/components/quests/QuestCard.tsx#L21)
- **Evidence**:
  In `AutoRebalanceModal.tsx`:
  ```tsx
  <div className="flex items-start gap-2 rounded-lg bg-muted/40 p-3 text-body-sm text-muted-foreground">
    <Info className="mt-0.5 size-4 shrink-0" aria-hidden="true" />
    <p>
      To switch it, open Quests and change the days.
    </p>
  </div>
  ...
  <Button asChild className="min-h-11">
    <Link to="/quests" onClick={() => onOpenChange(false)}>
      Go to Quests
    </Link>
  </Button>
  ```
  In `src/components/mentor/AutoRebalanceModal.tsx:20-29` (author comment):
  ```typescript
  // Important honesty note, visible in the UI itself (not just this comment): there
  // is currently no mutation in useDashboardData.ts that edits an existing
  // series' recurrenceDays, so "Apply" cannot silently persist this for
  // you yet — it hands you the exact change to make on the Quests screen
  // instead of claiming to have done something it didn't. That's a
  // backend gap (one new Supabase mutation + a UI control on the edit
  // flow), not something to fake from the modal layer.
  ```
  In `src/components/quests/QuestCard.tsx:21`:
  ```typescript
  const canCancel = Boolean(onCancel) && !isDone && !quest.seriesId && completionStage === "idle";
  ```
- **What is broken**: The Mentor modal recommends shifting recurring days for an underperforming routine and tells the user: "To switch it, open Quests and change the days." When the user navigates to `/quests`, there are no day-changing controls, no edit button, and `QuestCard.tsx` explicitly disables cancellation for recurring series (`!quest.seriesId`).
- **User impact**: The user is funneled into a dead end where the application asks them to perform an action that the interface physically does not support.
- **Root cause**: The rebalancing recommendation engine was implemented, but the accompanying series editing feature in `Quests.tsx` and mutation in `useDashboardData.ts` were never built.

---

#### [Finding A-04] "Contact support" directive in Settings has no backing UI, link, or contact channel
- **Category**: A. UI With No Backing
- **Severity**: MINOR
- **Confidence**: CONFIRMED
- **Location**: [`src/pages/Settings.tsx:264-267`](file:///c:/Users/user/Documents/My%20stuff/theimprovementsystem/src/pages/Settings.tsx#L264-L267)
- **Evidence**:
  ```tsx
  <p className="text-body-sm text-foreground">Delete account</p>
  <p className="mt-1 text-body-sm text-muted-foreground">
    Permanently removes your goal and all Quest history. Your login itself isn't removed by this — contact support if you also need that closed.
  </p>
  ```
  Grep search for `contact support`, `mailto:`, or support ticketing in `src/` yielded **0 actionable contact endpoints**.
- **What is broken**: The Settings account deletion section instructs users: *"contact support if you also need that closed."* However, there is no email link (`mailto:`), support URL, contact form, or support modal anywhere in the application.
- **User impact**: Users needing full GDPR/CCPA account deletion are instructed to contact support, but have no way to find or contact support.
- **Root cause**: The copy was written as an explanatory disclaimer for the Auth User limitation without providing a support channel.

---

### Category B: UI Claiming a Feature That Doesn't Exist (False Claims)

#### [Finding B-01] "100% Private Offline Vault" and "local encrypted vault" are false claims
- **Category**: B. False Claims
- **Severity**: MAJOR
- **Confidence**: CONFIRMED
- **Location**: [`src/pages/Landing.tsx:1194-1197, 2109-2112`](file:///c:/Users/user/Documents/My%20stuff/theimprovementsystem/src/pages/Landing.tsx#L1194-L1197), [`src/components/ui/comparison-table.tsx:54`](file:///c:/Users/user/Documents/My%20stuff/theimprovementsystem/src/components/ui/comparison-table.tsx#L54), [`AGENTS.md:48`](file:///c:/Users/user/Documents/My%20stuff/theimprovementsystem/AGENTS.md#L48)
- **Evidence**:
  In `Landing.tsx:1194-1197`:
  ```tsx
  <span className="flex items-center gap-1.5">
    <Lock className="size-3 text-muted-foreground" />
    100% Private Offline Vault
  </span>
  ```
  In `Landing.tsx:2109-2112`:
  ```tsx
  <span className="flex items-center gap-1">
    <Lock className="size-3 text-foreground" />
    100% Private Offline Vault
  </span>
  ```
  In `comparison-table.tsx:54`:
  ```typescript
  tisText: "100% Free forever & local encrypted vault",
  ```
  In `AGENTS.md:48`:
  ```markdown
  4. Local-first encrypted browser storage.
  ```
- **What is broken**: There is no local encrypted vault, no IndexedDB implementation, no WebCrypto/AES encryption layer, and no offline storage engine in the codebase. All user quests and profile records are stored remotely in a cloud PostgreSQL database on Supabase (`xbrzrxfntixkiykfczjf.supabase.co`). Browser `localStorage` holds only plain unencrypted Supabase session tokens, theme preferences, and tour flags. If the user is offline, the app cannot load or save quests.
- **User impact**: The marketing makes an explicit cryptographic privacy and local-first offline promise that is completely false.
- **Root cause**: Marketing copy and brand guidelines describe an aspirational architectural vision that was never built.

---

#### [Finding B-02] "Strict 1 Focus + 2 Routines" constraint claimed in Brand Invariants is not enforced in code
- **Category**: B. False Claims
- **Severity**: MAJOR
- **Confidence**: CONFIRMED
- **Location**: [`AGENTS.md:47`](file:///c:/Users/user/Documents/My%20stuff/theimprovementsystem/AGENTS.md#L47), [`src/components/ui/comparison-table.tsx:42`](file:///c:/Users/user/Documents/My%20stuff/theimprovementsystem/src/components/ui/comparison-table.tsx#L42), [`src/hooks/useDashboardData.ts:10, 654-655`](file:///c:/Users/user/Documents/My%20stuff/theimprovementsystem/src/hooks/useDashboardData.ts#L10)
- **Evidence**:
  In `AGENTS.md:47`:
  ```markdown
  3. Strict constraint: 1 Primary Focus + 2 Routines.
  ```
  In `comparison-table.tsx:42`:
  ```typescript
  tisText: "Strict 1 Focus + 2 Routines (<2 min execution)",
  ```
  In `useDashboardData.ts:10, 654-655`:
  ```typescript
  export const MAX_ACTIVE_QUESTS = 3;
  ...
  const activeCount = state.quests.filter((q) => occupiesActiveSlot(q, serverLocal.dateStr, timezone || "UTC")).length;
  if (activeCount >= MAX_ACTIVE_QUESTS) return { error: null };
  ```
- **What is broken**: The system rules and comparison table claim: *"Strict constraint: 1 Primary Focus + 2 Routines."* The code merely enforces a flat numeric limit (`activeCount >= 3`). A user can create 3 Essential one-off quests, 3 recurring routines, 0 Essential quests, or any arbitrary mix.
- **User impact**: The application's signature philosophical constraint ("1 Primary Focus + 2 Routines") is not upheld by the validation logic.
- **Root cause**: Only a flat numerical limit (`MAX_ACTIVE_QUESTS = 3`) was implemented.

---

#### [Finding B-03] "Dynamic 90-day trajectory & velocity index" claimed in Comparison Table does not exist
- **Category**: B. False Claims
- **Severity**: MAJOR
- **Confidence**: CONFIRMED
- **Location**: [`src/components/ui/comparison-table.tsx:48`](file:///c:/Users/user/Documents/My%20stuff/theimprovementsystem/src/components/ui/comparison-table.tsx#L48), [`src/lib/trajectory.ts:128-202`](file:///c:/Users/user/Documents/My%20stuff/theimprovementsystem/src/lib/trajectory.ts#L128-L202)
- **Evidence**:
  In `comparison-table.tsx:48`:
  ```typescript
  tisText: "Dynamic 90-day trajectory & velocity index",
  ```
  In `src/lib/trajectory.ts:128-202`:
  `deriveTrajectory(quests: Quest[])` takes all goal-linked quests and sorts them chronologically across the user's entire history. There is no 90-day rolling window calculation and no "velocity index" computed or returned in `TrajectoryResult`.
- **What is broken**: The comparison table promises a "Dynamic 90-day trajectory & velocity index." The actual codebase computes trajectory over an unwindowed cumulative array of quests with a linear scalar position, with no 90-day cut-off and no velocity index metric.
- **User impact**: Marketing copy advertises a mathematical metric ("velocity index") and 90-day rolling window that do not exist.
- **Root cause**: Marketing copy was drafted from early product concepts that were not reflected in `src/lib/trajectory.ts`.

---

#### [Finding B-04] Anti-streak marketing contradicts active Dashboard streak counter cockpit
- **Category**: B. False Claims / Brand Invariant Violation
- **Severity**: MAJOR
- **Confidence**: CONFIRMED
- **Location**: [`src/pages/Landing.tsx:397, 1138`](file:///c:/Users/user/Documents/My%20stuff/theimprovementsystem/src/pages/Landing.tsx#L397), [`src/components/ui/comparison-table.tsx:35, 47`](file:///c:/Users/user/Documents/My%20stuff/theimprovementsystem/src/components/ui/comparison-table.tsx#L35), [`src/pages/Dashboard.tsx:330-376`](file:///c:/Users/user/Documents/My%20stuff/theimprovementsystem/src/pages/Dashboard.tsx#L330-L376), [`AGENTS.md:49`](file:///c:/Users/user/Documents/My%20stuff/theimprovementsystem/AGENTS.md#L49)
- **Evidence**:
  In `Landing.tsx:397, 1138` and `comparison-table.tsx:47`:
  ```tsx
  "Streaks are fragile binary counters—miss once and 60 days vanish into zero. The Improvement System prioritizes Trajectory: a wholesome, velocity-based measure of real progress..."
  ```
  In `AGENTS.md:49`:
  ```markdown
  No RPG Gamification: Never introduce hunter ranks, XP bars, or fantasy game tropes. Frame user growth as deterministic personal trajectory and quiet mathematical velocity.
  ```
  In `Dashboard.tsx:330-376`:
  ```tsx
  {/* ── Rhythm & Momentum Cockpit (Prominent, Dedicated Streak & Weekly Rhythm) ── */}
  <section aria-label="Rhythm and Streak Momentum" ...>
    <Flame className={cn("size-6 transition-all", currentStreak > 0 ? "text-foreground fill-foreground/15" : "text-muted-foreground")} />
    <span className="text-2xl font-bold tracking-tight text-foreground font-mono">{currentStreak}</span>
    <span className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">
      {currentStreak === 1 ? "Day Active" : "Days Active"}
    </span>
    ...
    <span>Complete today&apos;s focus to extend your streak to {currentStreak + 1} days</span>
  ```
- **What is broken**: The Landing page and Comparison Table heavily attack streaks as "fragile binary counters" and position TIS as the antidote to streaks. Yet the active `Dashboard.tsx` features a large, prominent streak cockpit with an animated Flame icon, day counter, and the exact copy: *"Complete today's focus to extend your streak to {currentStreak + 1} days"*.
- **User impact**: Severe product positioning contradiction. Users who signed up because TIS promised freedom from rigid streaks are immediately greeted with a streak counter on their home screen.
- **Root cause**: Design drift where a streak cockpit was added to `Dashboard.tsx` despite brand invariants forbidding streak gamification.

---

#### [Finding B-05] Journey page mounts synthetic parametric Bézier curve instead of real user trajectory
- **Category**: B. False Claims / E. Fake / Static Data
- **Severity**: MAJOR
- **Confidence**: CONFIRMED
- **Location**: [`src/pages/Journey.tsx:165-171`](file:///c:/Users/user/Documents/My%20stuff/theimprovementsystem/src/pages/Journey.tsx#L165-L171), [`src/components/journey/TrajectoryVisualizer.tsx:35-81`](file:///c:/Users/user/Documents/My%20stuff/theimprovementsystem/src/components/journey/TrajectoryVisualizer.tsx#L35-L81)
- **Evidence**:
  In `Journey.tsx:165-171`:
  ```tsx
  <TrajectoryVisualizer
    completedQuests={goalStats.completed}
    targetQuests={goalStats.linked}
    isOnTrack={pace ? pace.isOnTrack : goalStats.failed === 0}
    goalLabel={profile?.primary_goal || undefined}
  />
  ```
  In `TrajectoryVisualizer.tsx:35-81`:
  ```typescript
  const xOrigin = 55;
  const yOrigin = 270;
  const xCurrent = 260;
  const yCurrent = yOrigin - progressRatio * 150;
  const xGoal = 650;
  const yGoal = 60;
  ...
  const predictiveCurvePath = `M ${xCurrent} ${yCurrent} C ${c1x} ${c1y}, ${c2x} ${c2y}, ${xGoal} ${yGoal}`;
  const conePath = `M ${xCurrent} ${yCurrent} C ${c1x} ${c1yUpper}, ${c2x} ${c2yUpper}, ${xGoal} ${yGoalUpper} ...`;
  const historicTrailPath = `M ${xOrigin} ${yOrigin} C ${trailC1x} ${trailC1y}, ${trailC2x} ${trailC2y}, ${xCurrent} ${yCurrent}`;
  ```
- **What is broken**: The Journey page claims to visualize the user's velocity along the trajectory corridor. A real, mathematically grounded component exists in [`src/components/journey/TrajectoryChart.tsx`](file:///c:/Users/user/Documents/My%20stuff/theimprovementsystem/src/components/journey/TrajectoryChart.tsx) that graphs real `TrajectoryResult` actual vs intended points and the ±10% buffer band. However, `Journey.tsx` mounts `TrajectoryVisualizer.tsx`, which draws hardcoded cubic Bézier curves between fixed coordinates (`xOrigin = 55`, `xCurrent = 260`, `xGoal = 650`).
- **User impact**: The trajectory curve shown to the user on their Journey page does not represent their actual quest completion points or trajectory history.
- **Root cause**: `TrajectoryVisualizer.tsx` was added as an illustrative centerpiece during visual polishing, leaving the real `TrajectoryChart.tsx` orphaned.

---

### Category C: Backend With No UI

#### [Finding C-01] `daily_login_bonus` table exists with zero active UI consumers
- **Category**: C. Backend With No UI
- **Severity**: MAJOR
- **Confidence**: CONFIRMED
- **Location**: `supabase/migrations/20260104060212_91ded04c-d980-48d9-8f1f-17d4df846a49.sql:1-32`, [`src/hooks/useDailyLoginBonus.ts:1-148`](file:///c:/Users/user/Documents/My%20stuff/theimprovementsystem/src/hooks/useDailyLoginBonus.ts#L1-L148)
- **Evidence**:
  Migration creates table `daily_login_bonus` with columns `id`, `user_id`, `last_login_date`, `current_streak`, `longest_streak`, `total_logins`.
  Grep search across active `src/` for `daily_login_bonus` or `useDailyLoginBonus` returned **0 active callers** (only referenced in `useDailyLoginBonus.ts` and `src/archive/2026-v0/dormant/DailyLoginBonus.tsx`).
- **What is broken**: A full database table with RLS policies and complete frontend hook exist, but no UI component in the active application renders or invokes them.
- **User impact**: Dead backend infrastructure and bundle bloat. Daily login bonuses and streaks are never awarded in the active application.
- **Root cause**: Part of the deprecated RPG progression system that was abandoned per Brand Invariant #3 ("No RPG Gamification").

---

#### [Finding C-02] `leaderboard_view` SQL view exists with zero active consumers
- **Category**: C. Backend With No UI
- **Severity**: MINOR
- **Confidence**: CONFIRMED
- **Location**: `supabase/migrations/20260215060127_b6183ad9-5091-4f3a-b813-a04ebc4eed39.sql:16-31`, `supabase/migrations/20260215060137_e365a09e-28f4-42f9-8e87-6e6116c84a52.sql:3-21`
- **Evidence**:
  ```sql
  CREATE OR REPLACE VIEW public.leaderboard_view
  WITH (security_invoker=on) AS
  SELECT 
    p.user_id,
    p.username,
    p.avatar_id,
    g.level,
    g.current_xp,
    g.total_quests_completed,
    g.credits,
    g.achievements,
    g.stats,
    d.current_streak,
    d.longest_streak
  FROM public.profiles p
  JOIN public.game_state g ON p.user_id = g.user_id
  LEFT JOIN public.daily_login_bonus d ON p.user_id = d.user_id;
  ```
  Only referenced in dormant archive files (`PlayerProfileModal.tsx`, `Leaderboard.tsx`) and auto-generated `types.ts`.
- **What is broken**: Database view exists in PostgreSQL but is never queried by any active route, hook, or component.
- **User impact**: Dead database DDL.
- **Root cause**: Leaderboard feature was removed per the "No RPG Gamification" brand rule.

---

#### [Finding C-03] 11 dead RPG-era columns in `game_state` table are unused in active app
- **Category**: C. Backend With No UI
- **Severity**: MAJOR
- **Confidence**: CONFIRMED
- **Location**: [`src/hooks/useDashboardData.ts:12-28`](file:///c:/Users/user/Documents/My%20stuff/theimprovementsystem/src/hooks/useDashboardData.ts#L12-L28), [`src/integrations/supabase/types.ts:51-68`](file:///c:/Users/user/Documents/My%20stuff/theimprovementsystem/src/integrations/supabase/types.ts#L51-L68)
- **Evidence**:
  In `src/hooks/useDashboardData.ts:12-25`:
  ```typescript
  // Founder Decision (RPG removal / Trajectory finalization chunk):
  // DashboardState no longer carries level, currentXp, maxXp, credits,
  // totalQuestsCompleted, stats, or a persisted trajectory scalar. All were
  // RPG-era or RPG-adjacent: level/XP/credits/stats had zero live
  // consumers... The DB columns themselves are left in place (no
  // migration) per "prefer existing data structures before introducing
  // migrations" — the app simply no longer selects, writes, or trusts them.
  export interface DashboardState {
    quests: Quest[];
  }
  ```
  Columns in `game_state` (`Row` in `types.ts`):
  1. `achievements: Json`
  2. `credits: number`
  3. `current_xp: number`
  4. `habits: Json`
  5. `level: number`
  6. `max_xp: number`
  7. `rank: string`
  8. `stats: Json`
  9. `system_messages: Json`
  10. `total_quests_completed: number`
  11. `trajectory: number`
- **What is broken**: The `game_state` table contains 11 columns from the retired RPG model. The active application only reads and writes the `quests` column. The other 11 columns are dead schema bloat.
- **User impact**: Cluttered database rows, oversized JSON payloads when selecting `*`, and schema confusion.
- **Root cause**: Deliberately left in place during the RPG removal chunk to avoid running a destructive migration, but never formally dropped.

---

#### [Finding C-04] Database column `profiles.date_of_birth` has no UI
- **Category**: C. Backend With No UI
- **Severity**: MINOR
- **Confidence**: CONFIRMED
- **Location**: `supabase/migrations/20260104044421_561e01a7-c97b-44f0-a823-4808761d3170.sql:7`, [`src/providers/AuthProvider.tsx:11`](file:///c:/Users/user/Documents/My%20stuff/theimprovementsystem/src/providers/AuthProvider.tsx#L11)
- **Evidence**:
  Column `date_of_birth` (`DATE`) exists in `profiles`. Declared in `Profile` interface in `AuthProvider.tsx:11`.
  Grep search across all components and pages in `src/` confirms 0 input fields, 0 displays, and 0 calculations read or write this column.
- **What is broken**: Live database column is declared on the `Profile` type but completely unused across the application.
- **User impact**: Dead column in database schema.
- **Root cause**: Legacy profile onboarding field abandoned during simplification.

---

#### [Finding C-05] Database columns `profiles.bio` and `profiles.is_public` have no active UI
- **Category**: C. Backend With No UI
- **Severity**: MINOR
- **Confidence**: CONFIRMED
- **Location**: Live Supabase DB `profiles` table, [`src/providers/AuthProvider.tsx:12`](file:///c:/Users/user/Documents/My%20stuff/theimprovementsystem/src/providers/AuthProvider.tsx#L12)
- **Evidence**:
  Live schema reflection confirms `bio` (`text`) and `is_public` (`bool`) exist on `profiles`.
  `AuthProvider.tsx:12` exposes `bio: string | null;`.
  Neither column is displayed or editable in any active UI page (`Profile.tsx`, `Settings.tsx`).
- **What is broken**: Two columns exist in production Postgres and `AuthProvider.tsx` but have zero UI presence in the active app.
- **User impact**: Dead data fields.
- **Root cause**: Remnants of social profile experiments (now relegated to `src/archive/2026-v0/dormant/`).

---

#### [Finding C-06] Edge function `ai-assistant` is deployed with public unauthenticated access but unused
- **Category**: C. Backend With No UI / Security
- **Severity**: MAJOR
- **Confidence**: CONFIRMED
- **Location**: [`supabase/functions/ai-assistant/index.ts:1-240`](file:///c:/Users/user/Documents/My%20stuff/theimprovementsystem/supabase/functions/ai-assistant/index.ts#L1-L240), [`supabase/config.toml:3-4`](file:///c:/Users/user/Documents/My%20stuff/theimprovementsystem/supabase/config.toml#L3-L4)
- **Evidence**:
  In `supabase/config.toml`:
  ```toml
  [functions.ai-assistant]
  verify_jwt = false
  ```
  Live POST request to `https://xbrzrxfntixkiykfczjf.supabase.co/functions/v1/ai-assistant` responds with HTTP 200/400 (function is deployed and reachable).
  Grep search across `src/` for `ai-assistant` returned **0 active callers** (only referenced in `src/archive/2026-v0/dormant/AIAssistant.tsx`).
- **What is broken**: The function is deployed and callable without authentication (`verify_jwt = false`). It forwards requests to Lovable AI Gateway using server-side secrets. However, the active app uses deterministic algorithms (`guidance.ts`, `insights.ts`) and never invokes `ai-assistant`.
- **User impact**: Security vulnerability: anyone with the project URL can invoke the edge function, consuming API gateway credits without authentication.
- **Root cause**: Left deployed when TIS transitioned to deterministic guidance algorithms.

---

#### [Finding C-07] Edge function `generate-achievement-image` exists without auth checks and is broken/undeployed
- **Category**: C. Backend With No UI
- **Severity**: MAJOR
- **Confidence**: CONFIRMED
- **Location**: [`supabase/functions/generate-achievement-image/index.ts:1-63`](file:///c:/Users/user/Documents/My%20stuff/theimprovementsystem/supabase/functions/generate-achievement-image/index.ts#L1-L63)
- **Evidence**:
  Omitted from `supabase/config.toml`.
  Live POST probe to `https://xbrzrxfntixkiykfczjf.supabase.co/functions/v1/generate-achievement-image` returns HTTP 404 Not Found.
  The code in `generate-achievement-image/index.ts` contains zero JWT verification.
  Zero callers exist in active `src/` code (only in archived `AchievementDetailModal.tsx`).
- **What is broken**: Undeployed, unauthenticated edge function file in repository referencing deprecated achievement systems.
- **User impact**: Repository bloat and security risk if deployed without auth checks.
- **Root cause**: Left behind from legacy gamification code.

---

### Category D: Disconnected Wiring

#### [Finding D-01] `usePomodoroTimer.tsx` complete focus timer system is completely unmounted
- **Category**: D. Disconnected Wiring
- **Severity**: MAJOR
- **Confidence**: CONFIRMED
- **Location**: [`src/hooks/usePomodoroTimer.tsx:1-197`](file:///c:/Users/user/Documents/My%20stuff/theimprovementsystem/src/hooks/usePomodoroTimer.tsx#L1-L197)
- **Evidence**:
  `usePomodoroTimer.tsx` defines `PomodoroProvider`, context, and `usePomodoroTimer` hook with 25-minute work intervals, 5-minute break intervals, audio cues, and session tracking.
  Grep search across active `src/` reveals **0 consumers** of `PomodoroProvider` or `usePomodoroTimer`. Neither `AppLayout.tsx` nor `App.tsx` wraps the app with `PomodoroProvider`.
- **What is broken**: A 197-line feature implementation exists in the codebase with zero connection to the user interface.
- **User impact**: Dead code in bundle (~6KB); users have no access to the built-in focus timer functionality.
- **Root cause**: The hook and provider were written, but UI dock components were placed in `src/archive/` and never surfaced in `SystemBar` or `Dashboard`.

---

#### [Finding D-02] `useDailyLoginBonus.ts` hook is orphaned
- **Category**: D. Disconnected Wiring
- **Severity**: MAJOR
- **Confidence**: CONFIRMED
- **Location**: [`src/hooks/useDailyLoginBonus.ts:1-148`](file:///c:/Users/user/Documents/My%20stuff/theimprovementsystem/src/hooks/useDailyLoginBonus.ts#L1-L148)
- **Evidence**:
  Full React hook `useDailyLoginBonus.ts` handles claiming bonuses, streak tracking, and optimistic database updates.
  Grep search across active `src/` returned **0 imports**.
- **What is broken**: Complete 148-line hook exists in `src/hooks/` but is never imported by any active page or component.
- **User impact**: Dead bundle bytes (~4KB).
- **Root cause**: The UI modal was archived to `src/archive/2026-v0/dormant/DailyLoginBonus.tsx`, but the hook was left in `src/hooks/`.

---

#### [Finding D-03] `useTheme.ts` hook declaring RPG accent themes is orphaned
- **Category**: D. Disconnected Wiring
- **Severity**: MINOR
- **Confidence**: CONFIRMED
- **Location**: [`src/hooks/useTheme.ts:1-44`](file:///c:/Users/user/Documents/My%20stuff/theimprovementsystem/src/hooks/useTheme.ts#L1-L44)
- **Evidence**:
  ```typescript
  export type AccentTheme = 'purple' | 'blue' | 'green' | 'red';
  ...
  export const accentThemes: { id: AccentTheme; name: string; color: string }[] = [
    { id: 'purple', name: 'Solo Purple', color: '#9333ea' },
    { id: 'blue', name: 'Cyberpunk Blue', color: '#06b6d4' },
    { id: 'green', name: 'Matrix Green', color: '#22c55e' },
    { id: 'red', name: 'Blood Red', color: '#ef4444' },
  ];
  ```
  The active application uses `useThemeContext()` from `@/providers/ThemeProvider.tsx`. `useTheme.ts` is only referenced by dormant archive files (`ThemeSwitcher.tsx`, `Index_old.tsx`).
- **What is broken**: Dead hook in `src/hooks/` exporting obsolete RPG accent themes.
- **User impact**: Maintenance confusion and dead bundle bytes.
- **Root cause**: Replaced by `ThemeProvider.tsx` during redesign, but old hook was never removed.

---

#### [Finding D-04] `useTimezone.ts` hook is orphaned
- **Category**: D. Disconnected Wiring
- **Severity**: MINOR
- **Confidence**: CONFIRMED
- **Location**: [`src/hooks/useTimezone.ts:1-50`](file:///c:/Users/user/Documents/My%20stuff/theimprovementsystem/src/hooks/useTimezone.ts#L1-L50)
- **Evidence**:
  `src/hooks/useTimezone.ts` defines a 50-line hook with `showTimezonePrompt`, `confirmTimezone`, `getTodayString`, and `getCurrentHour` using `localStorage.getItem('the-system-timezone')`.
  Grep search for `useTimezone` across `src/` returned **0 imports**. The active app uses `profiles.timezone` and `serverTime.ts` via `AuthProvider.tsx`.
- **What is broken**: Dead hook in `src/hooks/` with zero callers.
- **User impact**: Dead code in codebase.
- **Root cause**: Superseded by the server-authoritative time system in `serverTime.ts`.

---

#### [Finding D-05] Real interactive `TrajectoryChart.tsx` orphaned in favor of synthetic visualizer
- **Category**: D. Disconnected Wiring
- **Severity**: MAJOR
- **Confidence**: CONFIRMED
- **Location**: [`src/components/journey/TrajectoryChart.tsx:1-323`](file:///c:/Users/user/Documents/My%20stuff/theimprovementsystem/src/components/journey/TrajectoryChart.tsx#L1-L323)
- **Evidence**:
  `TrajectoryChart.tsx` is a 323-line custom SVG chart that calculates Catmull-Rom-to-cubic-Bezier curves from real `TrajectoryResult` data, graphs `actualSeries`, `intendedSeries`, and the ±10% buffer band (`bandUpper`, `bandLower`), with interactive inspection tooltips.
  Grep search confirms `TrajectoryChart.tsx` is imported by **0 files** in `src/`. `Journey.tsx` instead imports `TrajectoryVisualizer.tsx`.
- **What is broken**: A fully implemented, data-driven visualization component is completely disconnected from the application.
- **User impact**: Users see a mock SVG curve instead of their actual trajectory math.
- **Root cause**: UI replacement during design overhaul without deleting or reconnecting the real chart.

---

#### [Finding D-06] `scheduledFor` written by `recalibrateSchedule` is never read in active slot or sweep logic
- **Category**: D. Disconnected Wiring
- **Severity**: MAJOR
- **Confidence**: CONFIRMED
- **Location**: [`src/hooks/useDashboardData.ts:601-612, 114-116, 99-103, 436-441`](file:///c:/Users/user/Documents/My%20stuff/theimprovementsystem/src/hooks/useDashboardData.ts#L601-L612)
- **Evidence**:
  In `useDashboardData.ts:601-612`:
  ```typescript
  const nextQuests = state.quests.map((item) => {
    // 1. Filter all uncompleted Quests
    if (item.completed || item.failed) return item;
    // 2. Keep Quests tagged as "Essential" on today's schedule
    if (item.priority === "Essential") return item;
    // 3. Change due_date / scheduledFor of "Important" or "Optional" to T+1
    shiftedCount += 1;
    return {
      ...item,
      scheduledFor: tomorrowStr,
    };
  });
  ```
  In `occupiesActiveSlot` (`useDashboardData.ts:114-116`):
  ```typescript
  function occupiesActiveSlot(quest: Quest, today: string, timezone: string): boolean {
    return !quest.completed && !quest.failed && !isQuestExpired(quest, today, timezone);
  }
  ```
  In `isQuestExpired` (`useDashboardData.ts:99-103`):
  ```typescript
  export function isQuestExpired(quest: Quest, today: string, timezone: string): boolean {
    if (quest.completed || quest.failed) return false;
    if (quest.timeFrame !== "Today") return false;
    return toServerLocalDate(new Date(quest.createdAt), timezone).dateStr !== today;
  }
  ```
- **What is broken**: When `recalibrateSchedule` is triggered (e.g. from Journey page "One-Tap Bump"), it sets `scheduledFor: tomorrowStr` on uncompleted secondary quests and saves them to `game_state`. However, neither `occupiesActiveSlot`, `isQuestExpired`, nor the `load()` sweep ever reads or evaluates `scheduledFor`. Instead, `isQuestExpired` only checks `quest.createdAt`. As a result, when the day turns, the shifted quest has an old `createdAt` and is swept to `failed: true` anyway! Furthermore, during the current day, the quest continues to occupy an active slot.
- **User impact**: The "One-Tap Bump / Reschedule" button does nothing to protect the user's secondary commitments; they fail at midnight regardless of being bumped.
- **Root cause**: The `scheduledFor` field was added to the bump handler without updating the lifecycle predicate `isQuestExpired` or `occupiesActiveSlot`.

---

#### [Finding D-07] `soundEnabled` and `toggleSound` in `useSoundEffects.ts` have no active UI control
- **Category**: D. Disconnected Wiring
- **Severity**: MINOR
- **Confidence**: CONFIRMED
- **Location**: [`src/hooks/useSoundEffects.ts:6, 138-144`](file:///c:/Users/user/Documents/My%20stuff/theimprovementsystem/src/hooks/useSoundEffects.ts#L6)
- **Evidence**:
  In `useSoundEffects.ts`:
  ```typescript
  const [soundEnabled, setSoundEnabled] = useState(() => { ... });
  const toggleSound = useCallback(() => {
    setSoundEnabled((prev: boolean) => !prev);
  }, []);
  ```
  Grep search for `toggleSound` across active `src/` code returns **0 callers** (only found in `src/archive/2026-v0/dormant/Index_old.tsx`).
- **What is broken**: `soundEnabled` defaults to true and writes to `localStorage['system-sound-enabled']`. However, no settings toggle, button, or switch exists in the live app (`Settings.tsx`, `SystemBar.tsx`) to allow users to toggle sounds off.
- **User impact**: Users cannot mute application sound effects from the UI.
- **Root cause**: `SoundToggle.tsx` was moved to `src/archive/` and never recreated in `Settings.tsx`.

---

#### [Finding D-08] `DirectionCardProps.streak` and `DailyClosureCardProps.currentStreak` are unused props
- **Category**: D. Disconnected Wiring
- **Severity**: MINOR
- **Confidence**: CONFIRMED
- **Location**: [`src/components/dashboard/DirectionCard.tsx:13, 49`](file:///c:/Users/user/Documents/My%20stuff/theimprovementsystem/src/components/dashboard/DirectionCard.tsx#L13), [`src/components/dashboard/DailyClosureCard.tsx:6, 10`](file:///c:/Users/user/Documents/My%20stuff/theimprovementsystem/src/components/dashboard/DailyClosureCard.tsx#L6)
- **Evidence**:
  In `DirectionCard.tsx`:
  ```typescript
  interface DirectionCardProps {
    name: string;
    goalStats?: GoalStats;
    streak?: number;
  }
  export function DirectionCard({ name, goalStats }: DirectionCardProps) {
  ```
  In `DailyClosureCard.tsx`:
  ```typescript
  interface DailyClosureCardProps {
    completedToday: number;
    currentStreak?: number;
    onChooseQuest: () => void;
  }
  export function DailyClosureCard({
    completedToday,
    onChooseQuest,
  }: DailyClosureCardProps) {
  ```
- **What is broken**: Both components declare streak props in their TypeScript interfaces, but neither component destructures or renders the prop.
- **User impact**: Dead prop declarations causing developer confusion.
- **Root cause**: Streaks were stripped from card headers per brand guidelines, but the prop interfaces were not cleaned up.

---

#### [Finding D-09] Exported function `deriveGoalLinkageStats` in `goalStats.ts` has no callers
- **Category**: D. Disconnected Wiring
- **Severity**: MINOR
- **Confidence**: CONFIRMED
- **Location**: [`src/lib/goalStats.ts:17-23`](file:///c:/Users/user/Documents/My%20stuff/theimprovementsystem/src/lib/goalStats.ts#L17-L23)
- **Evidence**:
  ```typescript
  export function deriveGoalLinkageStats(quests: Quest[]): GoalLinkageStats {
    const linked = quests.filter((q) => q.linkedToGoal);
    return {
      totalLinked: linked.length,
      completedLinked: linked.filter((q) => q.completed).length,
    };
  }
  ```
  Grep search across `src/` for `deriveGoalLinkageStats` returned **0 callers**.
- **What is broken**: The entire 24-line file `goalStats.ts` has zero consumers in any component, page, or hook.
- **User impact**: Dead bundle bytes.
- **Root cause**: `guidance.ts` created its own internal goal linkage evaluation (`goalLinkageGapGuidance`).

---

#### [Finding D-10] Unused utilities and components (`animations.ts`, `NavLink.tsx`, `comparison-3.tsx`, `lovable/index.ts`)
- **Category**: D. Disconnected Wiring
- **Severity**: MINOR
- **Confidence**: CONFIRMED
- **Location**: [`src/lib/animations.ts:1-75`](file:///c:/Users/user/Documents/My%20stuff/theimprovementsystem/src/lib/animations.ts#L1-L75), [`src/components/NavLink.tsx:1-29`](file:///c:/Users/user/Documents/My%20stuff/theimprovementsystem/src/components/NavLink.tsx#L1-L29), [`src/components/ui/comparison-3.tsx:1-5`](file:///c:/Users/user/Documents/My%20stuff/theimprovementsystem/src/components/ui/comparison-3.tsx#L1-L5), [`src/integrations/lovable/index.ts:1-39`](file:///c:/Users/user/Documents/My%20stuff/theimprovementsystem/src/integrations/lovable/index.ts#L1-L39)
- **Evidence**:
  Grep search confirms 0 active imports in `src/` for all 4 files:
  - `animations.ts`: only imported in `src/archive/2026-v0/dormant/Index_old.tsx`.
  - `NavLink.tsx`: 0 imports across `src/`.
  - `comparison-3.tsx`: 0 imports across `src/` (redundant alias for `comparison-table.tsx`).
  - `lovable/index.ts`: 0 imports across `src/`.
- **What is broken**: 4 files exist in active source directories with zero consumers.
- **User impact**: Unnecessary code maintenance overhead.
- **Root cause**: Scaffolding and refactoring leftovers.

---

### Category E: Fake or Static Data Presented as Real

#### [Finding E-01] Synthetic Trajectory Curve in `TrajectoryVisualizer.tsx`
- **Category**: E. Fake / Static Data
- **Severity**: MAJOR
- **Confidence**: CONFIRMED
- **Location**: [`src/components/journey/TrajectoryVisualizer.tsx:35-81`](file:///c:/Users/user/Documents/My%20stuff/theimprovementsystem/src/components/journey/TrajectoryVisualizer.tsx#L35-L81)
- **Evidence**:
  ```typescript
  const xOrigin = 55;
  const yOrigin = 270;
  const xCurrent = 260;
  const yCurrent = yOrigin - progressRatio * 150;
  const xGoal = 650;
  const yGoal = 60;

  const dx = xGoal - xCurrent;
  const dy = yGoal - yCurrent;
  const c1x = xCurrent + dx * 0.40;
  const c1y = yCurrent + dy * 0.18;
  const c2x = xCurrent + dx * 0.72;
  const c2y = yGoal + (yCurrent - yGoal) * 0.08;

  const predictiveCurvePath = `M ${xCurrent} ${yCurrent} C ${c1x} ${c1y}, ${c2x} ${c2y}, ${xGoal} ${yGoal}`;
  ```
  The component renders an SVG with static Bézier paths and animated pulse dots that cycle on an infinite CSS loop. It takes no quest history array and does not plot historical completion points.
- **What is broken**: The centerpiece visual on `/journey` draws a synthetic parametric curve between fixed points rather than plotting the user's authentic daily quest completions.
- **User impact**: Users expect their progress graph to reflect their real quest completion history, but they are looking at a decorative curve.
- **Root cause**: A decorative visualizer was mounted in `Journey.tsx` while the real `TrajectoryChart.tsx` was left unused.

---

### Category F: Silent Failure

#### [Finding F-01] `deleteAccount` leaves Auth User and `daily_login_bonus` orphaned in database
- **Category**: F. Silent Failures / Security & Data Integrity
- **Severity**: BLOCKER
- **Confidence**: CONFIRMED
- **Location**: [`src/providers/AuthProvider.tsx:298-305`](file:///c:/Users/user/Documents/My%20stuff/theimprovementsystem/src/providers/AuthProvider.tsx#L298-L305)
- **Evidence**:
  ```typescript
  const deleteAccount = async () => {
    if (!user) return;
    const { error: gameStateDeleteError } = await supabase.from('game_state').delete().eq('user_id', user.id);
    if (gameStateDeleteError) throw gameStateDeleteError;
    const { error: profileDeleteError } = await supabase.from('profiles').delete().eq('user_id', user.id);
    if (profileDeleteError) throw profileDeleteError;
    await supabase.auth.signOut();
  };
  ```
  Foreign key constraint on `daily_login_bonus`:
  ```sql
  CONSTRAINT daily_login_bonus_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE
  ```
- **What is broken**: Deleting an account only deletes rows from `game_state` and `profiles`. It does NOT delete the user record from `auth.users` (which requires a `SECURITY DEFINER` RPC or Supabase Admin API). Furthermore, because `daily_login_bonus` references `auth.users(id)` with `ON DELETE CASCADE`, its rows are never deleted.
- **User impact**: When a user selects "Delete account" in Settings, they are told their account is permanently deleted. If they subsequently sign up or log in again with the same credentials/OAuth, they enter a corrupted state where `auth.users` already exists, old login bonus streaks remain, and the `handle_new_user()` trigger may conflict or fail.
- **Root cause**: Client-side SDK cannot delete from `auth.users` directly without a privileged `SECURITY DEFINER` RPC function.

---

#### [Finding F-02] Capacity guard returning `{ error: null }` silently swallows commit failure
- **Category**: F. Silent Failures
- **Severity**: MAJOR
- **Confidence**: CONFIRMED
- **Location**: [`src/hooks/useDashboardData.ts:655`](file:///c:/Users/user/Documents/My%20stuff/theimprovementsystem/src/hooks/useDashboardData.ts#L655), [`src/pages/Quests.tsx:86-94`](file:///c:/Users/user/Documents/My%20stuff/theimprovementsystem/src/pages/Quests.tsx#L86-L94)
- **Evidence**:
  In `useDashboardData.ts:654-655`:
  ```typescript
  const activeCount = state.quests.filter((q) => occupiesActiveSlot(q, serverLocal.dateStr, timezone || "UTC")).length;
  if (activeCount >= MAX_ACTIVE_QUESTS) return { error: null };
  ```
  In `Quests.tsx:86-94`:
  ```typescript
  const { error: commitErr } = await commitToTodaysQuest(
    commitment, linkedToGoal, cadence, customDays, priority,
    linkedToGoal ? profile?.primary_goal ?? undefined : undefined,
  );
  if (commitErr) {
    setCommitError(true);
  } else {
    setShowCommitForm(false);
  }
  ```
- **What is broken**: When an active user attempts to commit to a quest while at capacity (`activeCount >= MAX_ACTIVE_QUESTS`), `commitToTodaysQuest` silently returns `{ error: null }`. Because `commitErr` is `null`, `Quests.tsx` treats the operation as successful and closes the creation form (`setShowCommitForm(false)`). However, no quest was created or saved to the database.
- **User impact**: The user types a commitment, clicks "Commit", the form vanishes, but their quest is completely lost with no error message or feedback explaining why.
- **Root cause**: The capacity guard was coded as a silent early return `{ error: null }` instead of returning a descriptive error object (`{ error: new Error("Active quest limit reached") }`).

---

#### [Finding F-03] `recalibrateSchedule` relies on unauthoritative client `new Date()` clock
- **Category**: F. Silent Failures
- **Severity**: MAJOR
- **Confidence**: CONFIRMED
- **Location**: [`src/hooks/useDashboardData.ts:596-598`](file:///c:/Users/user/Documents/My%20stuff/theimprovementsystem/src/hooks/useDashboardData.ts#L596-L598)
- **Evidence**:
  In `useDashboardData.ts:596-598`:
  ```typescript
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  const tomorrowStr = tomorrow.toISOString().split("T")[0];
  ```
  This directly contradicts the architectural mandate documented in `useDashboardData.ts:38-40`:
  ```typescript
  // ...the entire point of the server-time system is that no recurrence-relevant
  // date/weekday value is ever sourced from the client's clock.
  ```
- **What is broken**: While every other date operation in `useDashboardData.ts` routes through `getServerLocalDate` or `toServerLocalDate`, `recalibrateSchedule` constructs a raw client `new Date()`. For users whose device clock is skewed or in a different timezone from their profile, tomorrow's date string will be computed incorrectly.
- **User impact**: Timezone/clock skew bugs during schedule rescheduling.
- **Root cause**: Omission of `getServerLocalDate(timezone)` in `recalibrateSchedule`.

---

#### [Finding F-04] Client timezone detection failure silently defaults to UTC without prompt
- **Category**: F. Silent Failures
- **Severity**: MINOR
- **Confidence**: CONFIRMED
- **Location**: [`src/lib/serverTime.ts:34-41`](file:///c:/Users/user/Documents/My%20stuff/theimprovementsystem/src/lib/serverTime.ts#L34-L41), [`src/providers/AuthProvider.tsx:127-138`](file:///c:/Users/user/Documents/My%20stuff/theimprovementsystem/src/providers/AuthProvider.tsx#L127-L138)
- **Evidence**:
  ```typescript
  export function detectDeviceTimezone(): string {
    try {
      const tz = Intl.DateTimeFormat().resolvedOptions().timeZone;
      return tz || "UTC";
    } catch {
      return "UTC";
    }
  }
  ```
  In `AuthProvider.tsx:127-138`, if `profile.timezone` is null, it silently updates `timezone: detected` in the database.
- **What is broken**: If timezone detection fails or the browser blocks timezone introspection, `"UTC"` is silently persisted to `profiles.timezone`.
- **User impact**: A user whose browser blocks timezone introspection silently experiences day rollovers and expiry at 00:00 UTC rather than their local midnight, with no prompt or warning.
- **Root cause**: Intended as a graceful fallback, but lacks an onboarding confirmation prompt when defaulting to UTC.

---

#### [Finding F-05] Timezone update promise in `AuthProvider.tsx` has unhandled rejection
- **Category**: F. Silent Failures
- **Severity**: MINOR
- **Confidence**: CONFIRMED
- **Location**: [`src/providers/AuthProvider.tsx:129-137`](file:///c:/Users/user/Documents/My%20stuff/theimprovementsystem/src/providers/AuthProvider.tsx#L129-L137)
- **Evidence**:
  ```typescript
  void supabase
    .from('profiles')
    .update({ timezone: detected })
    .eq('user_id', userId)
    .then(({ error: tzError }) => {
      if (!tzError && lastFetchedUserId.current === userId) {
        setProfile((prev) => prev ? { ...prev, timezone: detected } : prev);
      }
    });
  ```
- **What is broken**: The promise chain `.then(...)` has no `.catch()` handler. If a network disconnect or Supabase error occurs, an unhandled promise rejection is thrown.
- **User impact**: Silent network error; profile state remains out of sync with detected timezone.
- **Root cause**: Missing `.catch()` block on asynchronous Supabase update.

---

### Category G: Data Mismatch

#### [Finding G-01] Legacy Quest field fallback reads in `Dashboard.tsx`
- **Category**: G. Data Mismatches / F. Silent Failures
- **Severity**: MINOR
- **Confidence**: CONFIRMED
- **Location**: [`src/pages/Dashboard.tsx:297-299`](file:///c:/Users/user/Documents/My%20stuff/theimprovementsystem/src/pages/Dashboard.tsx#L297-L299), [`src/types/quest.ts:16-64`](file:///c:/Users/user/Documents/My%20stuff/theimprovementsystem/src/types/quest.ts#L16-L64)
- **Evidence**:
  ```typescript
  const completedToday = safeQuests.filter(
    (q) => (q.completed || (q as any).status === "completed") &&
      Boolean((q.resolvedAt || (q as any).completedAt) &&
        (todayStr ? String(q.resolvedAt || (q as any).completedAt).startsWith(todayStr) : false))
  ).length;
  ```
- **What is broken**: The code casts `q as any` to read `.status` and `.completedAt`. The authoritative `Quest` interface in [`src/types/quest.ts`](file:///c:/Users/user/Documents/My%20stuff/theimprovementsystem/src/types/quest.ts) defines `completed: boolean`, `failed: boolean`, and `resolvedAt?: string`. Live database records use `completed` and `resolvedAt`.
- **User impact**: Bypasses TypeScript type safety with unnecessary runtime fallback checks.
- **Root cause**: Defensive fallback from an ancient schema migration.

---

#### [Finding G-02] Untracked live database schema column `primary_goal_target_date` missing from repo migrations
- **Category**: G. Data Mismatches
- **Severity**: MAJOR
- **Confidence**: CONFIRMED
- **Location**: Live Supabase DB `profiles` table vs `supabase/migrations/`
- **Evidence**:
  Live database query to `profiles` returns column:
  - `primary_goal_target_date` (`timestamptz`)
  This column is actively read and written in [`src/pages/Profile.tsx:59-62`](file:///c:/Users/user/Documents/My%20stuff/theimprovementsystem/src/pages/Profile.tsx#L59-L62) and declared in [`src/providers/AuthProvider.tsx:20`](file:///c:/Users/user/Documents/My%20stuff/theimprovementsystem/src/providers/AuthProvider.tsx#L20).
  However, `primary_goal_target_date` is NOT defined in any migration file under `supabase/migrations/`.
- **What is broken**: Production schema has drifted from version control.
- **User impact**: If the database is recreated from migrations in local development, staging, or disaster recovery, `Profile.tsx` will fail with: `column "primary_goal_target_date" of relation "profiles" does not exist`.
- **Root cause**: Column was added directly in the Supabase Dashboard without committing a corresponding migration file.

---

#### [Finding G-03] Out-of-sync Supabase types (`src/integrations/supabase/types.ts`)
- **Category**: G. Data Mismatches
- **Severity**: MAJOR
- **Confidence**: CONFIRMED
- **Location**: [`src/integrations/supabase/types.ts:107-120`](file:///c:/Users/user/Documents/My%20stuff/theimprovementsystem/src/integrations/supabase/types.ts#L107-L120)
- **Evidence**:
  In `types.ts`, `profiles.Row` is defined as:
  ```typescript
  profiles: {
    Row: {
      avatar_id: string
      created_at: string
      date_of_birth: string | null
      has_completed_first_launch: boolean
      id: string
      primary_goal: string | null
      timezone: string | null
      updated_at: string
      user_id: string
      username: string
    }
  ```
  `primary_goal_target_date`, `bio`, and `is_public` are missing from `Row`, `Insert`, and `Update`.
- **What is broken**: Generated TypeScript definitions disagree with the live database shape, forcing developers to use manual casts (`as Profile`) or bypass Supabase client types.
- **User impact**: Loss of type safety across queries and mutations touching `profiles`.
- **Root cause**: `supabase gen types typescript` has not been run since schema modifications were applied.

---

### Category H: Broken Flows

#### [Finding H-01] Command Palette "Settings" navigates to `/settings` causing 404 NotFound
- **Category**: H. Broken Flows
- **Severity**: BLOCKER
- **Confidence**: CONFIRMED
- **Location**: [`src/components/shared/CommandPalette.tsx:96-100`](file:///c:/Users/user/Documents/My%20stuff/theimprovementsystem/src/components/shared/CommandPalette.tsx#L96-L100), [`src/App.tsx:111`](file:///c:/Users/user/Documents/My%20stuff/theimprovementsystem/src/App.tsx#L111)
- **Evidence**:
  In `CommandPalette.tsx:96-100`:
  ```tsx
  <CommandItem onSelect={() => runCommand(() => navigate("/settings"))}>
    <SettingsIcon className="mr-2 size-4 text-muted-foreground" />
    <span>Settings</span>
    <CommandShortcut>G S</CommandShortcut>
  </CommandItem>
  ```
  In `App.tsx:111`:
  ```tsx
  <Route path="/profile/settings" element={<RenderProfiler id="Settings"><Settings /></RenderProfiler>} />
  ```
- **What is broken**: The registered route is `/profile/settings`. The command palette dispatches `navigate("/settings")`, for which no route exists.
- **User impact**: Any user using `Cmd+K` / `Ctrl+K` and selecting "Settings" is dumped directly onto the `NotFound` 404 page ("This page does not exist").
- **Root cause**: The Settings page was relocated from `/settings` to `/profile/settings` during the Profile/Settings separation chunk, but `CommandPalette.tsx` was never updated.

---

#### [Finding H-02] Recurring quests cannot be cancelled, edited, or paused (trap state)
- **Category**: H. Broken Flows / A. UI With No Backing
- **Severity**: MAJOR
- **Confidence**: CONFIRMED
- **Location**: [`src/components/quests/QuestCard.tsx:21`](file:///c:/Users/user/Documents/My%20stuff/theimprovementsystem/src/components/quests/QuestCard.tsx#L21), [`src/components/mentor/AutoRebalanceModal.tsx:66-70`](file:///c:/Users/user/Documents/My%20stuff/theimprovementsystem/src/components/mentor/AutoRebalanceModal.tsx#L66-L70)
- **Evidence**:
  In `QuestCard.tsx:21`:
  ```typescript
  const canCancel = Boolean(onCancel) && !isDone && !quest.seriesId && completionStage === "idle";
  ```
- **What is broken**: One-off quests have a cancel/dismiss button. However, any quest that belongs to a recurring series has `quest.seriesId` defined, which immediately evaluates `canCancel = false`. There is no edit modal, no archive button, and no pause toggle.
- **User impact**: Once a user creates a recurring series, it generates new active occurrences indefinitely on scheduled weekdays. The user cannot stop, pause, or edit this series from any screen in the application. The only recourse is "Reset all Quest progress" in Settings, which wipes the user's entire history.
- **Root cause**: Cancellation guard was added to prevent cancelling an individual instance without a series management handler, but series management was never built.

---

## 4. Verification of "Already Known" Items

| # | Item Description | Status | Verification Evidence & Detailed Analysis |
| :-: | :--- | :---: | :--- |
| **1** | **Legacy Quest field fallbacks in Dashboard.tsx** | **CONFIRMED** | [`src/pages/Dashboard.tsx:297-299`](file:///c:/Users/user/Documents/My%20stuff/theimprovementsystem/src/pages/Dashboard.tsx#L297-L299) casts `(q as any).status === "completed"` and `(q as any).completedAt`. These fields do not exist on type `Quest` (`src/types/quest.ts`). Current quests always use `completed: boolean` and `resolvedAt: string`. |
| **2** | **leaderboard_view unused in src/** | **CONFIRMED** | Created in migration `20260215060127_b6183ad9-5091-4f3a-b813-a04ebc4eed39.sql:16-31` and updated in `20260215060137_e365a09e-28f4-42f9-8e87-6e6116c84a52.sql:3-21`. Only referenced in dormant archive (`PlayerProfileModal.tsx`, `Leaderboard.tsx`) and auto-generated `types.ts`. Live query returns `[]`. Zero active UI surfaces query it. |
| **3** | **deleteAccount leaves Auth user and daily_login_bonus intact** | **CONFIRMED** | [`src/providers/AuthProvider.tsx:298-305`](file:///c:/Users/user/Documents/My%20stuff/theimprovementsystem/src/providers/AuthProvider.tsx#L298-L305) deletes rows from `game_state` and `profiles`, but does NOT delete the `auth.users` row. `daily_login_bonus` references `auth.users(id)` and only cascades if `auth.users` is deleted. Both `auth.users` and `daily_login_bonus` survive account deletion. |
| **4** | **generate-achievement-image edge function** | **CONFIRMED** | Function exists in `supabase/functions/generate-achievement-image/index.ts:1-63`. Omitted from `supabase/config.toml`. Live POST returns 404 (not deployed). Zero active callers in `src/`. Zero auth verification in code. |
| **5** | **Marketing claims vs Trajectory Buffer** | **CONFIRMED / CHANGED** | Math buffer `TRAJECTORY_BUFFER_RATIO = 0.1` and `deriveTrajectoryTolerance` exist and work in [`src/lib/trajectory.ts:217-224`](file:///c:/Users/user/Documents/My%20stuff/theimprovementsystem/src/lib/trajectory.ts#L217-L224). However, `TrajectoryChart.tsx` (which graphs this buffer corridor and real actual/intended series) was unmounted/orphaned. `Journey.tsx` mounts `TrajectoryVisualizer.tsx`, which draws a synthetic 2-point hardcoded Bézier curve bypassing real data. |
| **6** | **"1 primary focus / 2 routines" limit** | **CONFIRMED** | [`src/hooks/useDashboardData.ts:10, 654-655`](file:///c:/Users/user/Documents/My%20stuff/theimprovementsystem/src/hooks/useDashboardData.ts#L10) only enforces `activeCount >= MAX_ACTIVE_QUESTS` (3). It does NOT enforce 1 Essential quest or 2 routines. A user can create 3 Essential one-off quests, 3 recurring routines, or 0 Essential quests. Furthermore, line 655 silently returns `{ error: null }` swallowing errors! |
| **7** | **profiles.date_of_birth** | **CONFIRMED** | Column exists in database (`20260104044421_561e01a7-c97b-44f0-a823-4808761d3170.sql:7`) and in `Profile` interface in `AuthProvider.tsx:11`. Never rendered, input, or queried in any live UI. |

---

## 5. Checked and Found Intact Features

The following features were audited end-to-end, traced from UI through state and network layers, and verified to be fully functional, mathematically sound, and properly wired:

1. **Deterministic Personal Guidance System (`src/lib/guidance.ts`)**:
   - All 7 guidance rules (`repeatedCommitmentGuidance`, `weekdayMissPatternGuidance`, `seriesReliabilityGuidance`, `goalLinkageGapGuidance`, `recoveryAfterMissGuidance`, `trajectoryPositionGuidance`, `priorityCompletionGuidance`) are pure deterministic mathematical functions over `quests`.
   - Properly converts timestamps through user's local timezone via `toServerLocalDate`.
   - Correctly handles sparse-data states without generating hallucinated advice.
2. **Personal Insights Engine (`src/lib/insights.ts`)**:
   - `momentumInsight`, `followThroughInsight`, `recurringFrictionInsight`, `goalAlignmentInsight` compute exact ratios and percentage deltas from real user quest history.
   - Accurately consumed and rendered in `Mentor.tsx` Executive Advisory Briefing and Pattern Ledger.
3. **Core Trajectory Mathematics (`src/lib/trajectory.ts`)**:
   - `deriveTrajectory`, `deriveTrajectoryTolerance`, `deriveFollowThroughStats`, `deriveCurrentStreak`, `deriveWeeklyCadence`, `deriveResolvedAt` are rigorous, unit-testable pure functions.
   - Handles empty states, single-quest histories, and edge cases gracefully.
4. **Authoritative Server Time Architecture (`src/lib/serverTime.ts`)**:
   - `get_server_time` PostgreSQL RPC returns authoritative UTC server timestamp.
   - Client converts this UTC instant through stored IANA timezone using native `Intl.DateTimeFormat.formatToParts`.
   - Clean degraded fallback to client clock when offline/unreachable.
5. **Day Rollover & Expiry Lifecycle (`src/hooks/useDashboardData.ts`)**:
   - `isQuestExpired` correctly compares quest creation date against authoritative local date.
   - Uncompleted active quests from previous days are deterministically transitioned to `failed: true` with `resolvedAt` set.
   - `nextOccurrencesToCreate` correctly spawns recurring series instances on scheduled recurrence weekdays without duplicate generation.
6. **Authentication & Session Lifecycle (`src/providers/AuthProvider.tsx`, `src/pages/Auth.tsx`)**:
   - Sign up, magic link, password sign-in, Google OAuth, and sign out are correctly wired to Supabase Auth API.
   - `handle_new_user` Postgres trigger initializes `profiles` and `game_state` records on user signup.
   - `ProtectedRoute` and `ProtectedLayout` correctly guard private routes and redirect unauthenticated sessions.
7. **Timezone Configuration & Persistence (`src/pages/Settings.tsx`, `src/providers/AuthProvider.tsx`)**:
   - Timezone editor validates entered IANA strings against `Intl.supportedValuesOf("timeZone")`.
   - Updates `profiles.timezone` in database and synchronizes React auth context.
8. **Theme System (`src/providers/ThemeProvider.tsx`, `src/pages/Settings.tsx`)**:
   - Supports `"light"`, `"dark"`, and `"system"`.
   - System mode attaches an active `window.matchMedia("(prefers-color-scheme: dark)")` change listener and dynamically updates document class list.
9. **Quest History Search & Filtering (`src/pages/QuestHistory.tsx`)**:
   - Filter tabs ("all", "completed", "failed") and text search filter against real resolved quest history.
   - All-time completion rate and receipt-style list render real data.
10. **Archive Isolation (`src/archive/2026-v0/`)**:
    - All 43 files in `src/archive/2026-v0/dead/` and `src/archive/2026-v0/dormant/` are completely isolated with **0 live imports** from active application code.

---

## 6. Proposed Solutions & Prioritized Implementation Roadmap

### 6.1 Solutions by Finding ID

| Finding ID | Proposed Minimal Fix | Files to Touch | Migration Needed | Risk | Size |
| :--- | :--- | :--- | :---: | :---: | :---: |
| **F-01** | Create a `SECURITY DEFINER` RPC `delete_user_account()` that deletes from `game_state`, `profiles`, `daily_login_bonus`, and calls `auth.admin.deleteUser()`. Call this RPC from `deleteAccount()`. | `src/providers/AuthProvider.tsx`, new SQL migration | **Yes** | Low | **M** |
| **H-01** | Change `navigate("/settings")` to `navigate("/profile/settings")` in `CommandPalette.tsx:96`. | [`src/components/shared/CommandPalette.tsx`](file:///c:/Users/user/Documents/My%20stuff/theimprovementsystem/src/components/shared/CommandPalette.tsx) | No | Minimal | **S** |
| **F-02** | Return `{ error: new Error("You can only have up to 3 active quests at a time.") }` instead of `{ error: null }` in `useDashboardData.ts:655`. | [`src/hooks/useDashboardData.ts`](file:///c:/Users/user/Documents/My%20stuff/theimprovementsystem/src/hooks/useDashboardData.ts) | No | Low | **S** |
| **A-01** | Either configure Apple OAuth credentials in Supabase Dashboard, OR remove the Apple OAuth button from `Auth.tsx`. | [`src/pages/Auth.tsx`](file:///c:/Users/user/Documents/My%20stuff/theimprovementsystem/src/pages/Auth.tsx) | No | Low | **S** |
| **A-02** | Implement a keydown chord listener in `CommandPalette.tsx` for `g` followed by navigation keys, or remove the inert `<CommandShortcut>` tags. | [`src/components/shared/CommandPalette.tsx`](file:///c:/Users/user/Documents/My%20stuff/theimprovementsystem/src/components/shared/CommandPalette.tsx) | No | Low | **S** |
| **A-03** & **H-02** | In `QuestCard.tsx`, allow users to stop or pause recurring series (`canCancel = Boolean(onCancel) && !isDone`), and add `cancelSeries` handler in `useDashboardData.ts`. | [`src/components/quests/QuestCard.tsx`](file:///c:/Users/user/Documents/My%20stuff/theimprovementsystem/src/components/quests/QuestCard.tsx), [`src/hooks/useDashboardData.ts`](file:///c:/Users/user/Documents/My%20stuff/theimprovementsystem/src/hooks/useDashboardData.ts) | No | Medium | **M** |
| **A-04** | Update Settings copy to link to support or remove the "contact support" sentence if self-serve deletion RPC is deployed. | [`src/pages/Settings.tsx`](file:///c:/Users/user/Documents/My%20stuff/theimprovementsystem/src/pages/Settings.tsx) | No | Minimal | **S** |
| **B-01** | Update marketing copy in `Landing.tsx` and `comparison-table.tsx` to state "Row-Level Security Encrypted Cloud Storage" instead of claiming "100% Private Offline Vault". | [`src/pages/Landing.tsx`](file:///c:/Users/user/Documents/My%20stuff/theimprovementsystem/src/pages/Landing.tsx), [`src/components/ui/comparison-table.tsx`](file:///c:/Users/user/Documents/My%20stuff/theimprovementsystem/src/components/ui/comparison-table.tsx) | No | Low | **S** |
| **B-02** | In `commitToTodaysQuest`, enforce the 1 Primary Focus + 2 Routines rule: reject creating a second active Essential quest, or a third recurring routine. | [`src/hooks/useDashboardData.ts`](file:///c:/Users/user/Documents/My%20stuff/theimprovementsystem/src/hooks/useDashboardData.ts) | No | Medium | **M** |
| **B-03** | Update comparison table copy from "Dynamic 90-day trajectory & velocity index" to "Dynamic cumulative trajectory corridor". | [`src/components/ui/comparison-table.tsx`](file:///c:/Users/user/Documents/My%20stuff/theimprovementsystem/src/components/ui/comparison-table.tsx) | No | Minimal | **S** |
| **B-04** | Reconcile Dashboard streak cockpit with Brand Invariant #3: replace the prominent flame streak counter with quiet mathematical velocity/trajectory indicators. | [`src/pages/Dashboard.tsx`](file:///c:/Users/user/Documents/My%20stuff/theimprovementsystem/src/pages/Dashboard.tsx) | No | Medium | **M** |
| **B-05**, **D-05**, **E-01** | Replace `TrajectoryVisualizer` in `Journey.tsx` with `TrajectoryChart.tsx`, passing real `trajectory` derived from `state.quests`. | [`src/pages/Journey.tsx`](file:///c:/Users/user/Documents/My%20stuff/theimprovementsystem/src/pages/Journey.tsx) | No | Low | **S** |
| **C-01**, **C-02** | Drop dead database objects in a clean migration (`DROP VIEW IF EXISTS leaderboard_view; DROP TABLE IF EXISTS daily_login_bonus;`) and delete `useDailyLoginBonus.ts`. | `supabase/migrations/`, `src/hooks/useDailyLoginBonus.ts` | **Yes** | Low | **S** |
| **C-03** | Drop 11 unused RPG columns from `game_state` in a future cleanup migration. | `supabase/migrations/` | **Yes** | Medium | **M** |
| **C-04**, **C-05** | Remove unused columns (`date_of_birth`, `bio`, `is_public`) from `profiles` in a cleanup migration. | `supabase/migrations/` | **Yes** | Low | **S** |
| **C-06** | Set `verify_jwt = true` in `config.toml` or delete `supabase/functions/ai-assistant/` if permanently retired. | `supabase/config.toml`, `supabase/functions/` | No | Low | **S** |
| **C-07** | Delete dead `supabase/functions/generate-achievement-image/` directory from repository. | `supabase/functions/generate-achievement-image/` | No | Minimal | **S** |
| **D-01** | Wire `PomodoroProvider` in `AppLayout.tsx` and surface a compact focus timer in `SystemBar`, or delete the unused hook. | [`src/layouts/AppLayout.tsx`](file:///c:/Users/user/Documents/My%20stuff/theimprovementsystem/src/layouts/AppLayout.tsx), `src/components/system-bar/` | No | Medium | **M** |
| **D-02** | Delete orphaned hook `useDailyLoginBonus.ts`. | `src/hooks/useDailyLoginBonus.ts` | No | Minimal | **S** |
| **D-03** | Delete orphaned hook `useTheme.ts`. | `src/hooks/useTheme.ts` | No | Minimal | **S** |
| **D-04** | Delete orphaned hook `useTimezone.ts`. | `src/hooks/useTimezone.ts` | No | Minimal | **S** |
| **D-06** | In `isQuestExpired` and `occupiesActiveSlot`, recognize `scheduledFor` so bumped quests do not expire on day rollover and are hidden until tomorrow. | [`src/hooks/useDashboardData.ts`](file:///c:/Users/user/Documents/My%20stuff/theimprovementsystem/src/hooks/useDashboardData.ts) | No | Medium | **M** |
| **D-07** | Add sound toggle to `Settings.tsx` appearance section using `useSoundEffects().toggleSound`. | [`src/pages/Settings.tsx`](file:///c:/Users/user/Documents/My%20stuff/theimprovementsystem/src/pages/Settings.tsx) | No | Low | **S** |
| **D-08** | Remove unused `streak` and `currentStreak` props from `DirectionCardProps` and `DailyClosureCardProps`. | [`src/components/dashboard/DirectionCard.tsx`](file:///c:/Users/user/Documents/My%20stuff/theimprovementsystem/src/components/dashboard/DirectionCard.tsx), [`src/components/dashboard/DailyClosureCard.tsx`](file:///c:/Users/user/Documents/My%20stuff/theimprovementsystem/src/components/dashboard/DailyClosureCard.tsx) | No | Minimal | **S** |
| **D-09**, **D-10** | Delete orphaned files `goalStats.ts`, `animations.ts`, `NavLink.tsx`, `comparison-3.tsx`, `integrations/lovable/index.ts`. | `src/lib/`, `src/components/`, `src/integrations/` | No | Minimal | **S** |
| **F-03** | In `recalibrateSchedule`, fetch `serverLocal` via `getServerLocalDate(timezone)` instead of `new Date()`. | [`src/hooks/useDashboardData.ts`](file:///c:/Users/user/Documents/My%20stuff/theimprovementsystem/src/hooks/useDashboardData.ts) | No | Minimal | **S** |
| **F-04** | In `Settings.tsx`, display a subtle callout if `profile.timezone` is `"UTC"` suggesting the user confirm their local timezone. | [`src/pages/Settings.tsx`](file:///c:/Users/user/Documents/My%20stuff/theimprovementsystem/src/pages/Settings.tsx) | No | Low | **S** |
| **F-05** | Add `.catch()` error logging to the timezone update promise in `AuthProvider.tsx`. | [`src/providers/AuthProvider.tsx`](file:///c:/Users/user/Documents/My%20stuff/theimprovementsystem/src/providers/AuthProvider.tsx) | No | Minimal | **S** |
| **G-01** | Replace `(q as any)` casts in `Dashboard.tsx:297-299` with strict `q.completed` and `q.resolvedAt` checks. | [`src/pages/Dashboard.tsx`](file:///c:/Users/user/Documents/My%20stuff/theimprovementsystem/src/pages/Dashboard.tsx) | No | Minimal | **S** |
| **G-02**, **G-03** | Create migration `add_primary_goal_target_date.sql` and run `supabase gen types typescript` to update `src/integrations/supabase/types.ts`. | `supabase/migrations/`, `src/integrations/supabase/types.ts` | **Yes** | Low | **S** |

---

### 6.2 Prioritized Implementation Roadmap

#### Phase 1: Critical Blockers & Broken Navigation (Immediate)
1. **H-01**: Fix Command Palette route link (`/settings` -> `/profile/settings`) to stop 404 crashes.
2. **F-01**: Add secure account deletion RPC to purge `auth.users` and cascade child tables.
3. **F-02**: Fix capacity guard in `useDashboardData.ts` to return an explicit error instead of silent `{ error: null }`.
4. **G-02 & G-03**: Check in migration for `primary_goal_target_date` and regenerate `types.ts`.
5. **A-01**: Remove Apple OAuth button from `Auth.tsx` until provider credentials are configured.

#### Phase 2: Core Architecture & Data Integrity (High Priority)
1. **D-06 & F-03**: Fix `recalibrateSchedule` and `scheduledFor` lifecycle wiring; ensure server-authoritative clock is used.
2. **A-03 & H-02**: Add series cancellation/pause support in `QuestCard.tsx` so users are not trapped in infinite recurring series.
3. **B-05, D-05, E-01**: Swap synthetic `TrajectoryVisualizer` with real mathematical `TrajectoryChart` on Journey page.
4. **B-02**: Enforce 1 Primary Focus + 2 Routines constraint in `commitToTodaysQuest`.

#### Phase 3: UX Reconciliation & False Claims (Medium Priority)
1. **B-01**: Update marketing copy in `Landing.tsx` and `comparison-table.tsx` to describe secure cloud storage instead of claiming offline encrypted vault.
2. **B-04**: Reconcile Dashboard streak cockpit with Brand Invariant #3 ("No RPG Gamification").
3. **B-03**: Correct Comparison Table copy regarding 90-day trajectory and velocity index.
4. **A-02**: Wire or remove inert Command Palette chord badges.
5. **A-04**: Add support contact channel to Settings copy.
6. **D-07 & F-04**: Add sound mute switch and UTC timezone confirmation banner in Settings.

#### Phase 4: Dead Backend & Orphaned Code Cleanup (Maintenance)
1. **C-06 & C-07**: Secure/delete unused edge functions `ai-assistant` and `generate-achievement-image`.
2. **C-01 & C-02**: Drop dead `daily_login_bonus` table and `leaderboard_view` view in a cleanup migration.
3. **C-03, C-04, C-05**: Drop unused columns in `game_state` (11 columns) and `profiles` (`date_of_birth`, `bio`, `is_public`).
4. **D-01**: Decide whether to surface Pomodoro timer in UI or delete the hook.
5. **D-02, D-03, D-04, D-08, D-09, D-10, F-05, G-01**: Delete orphaned hooks/utilities and clean dead props.

---

### 6.3 Explicit Decisions Needed From Leadership

1. **Trajectory Visualization**:
   - *Question*: Should `/journey` display the authentic mathematical `TrajectoryChart.tsx` (plotting real actual/intended series and ±10% buffer corridor), or was `TrajectoryVisualizer.tsx` intentionally adopted for aesthetic simplicity?
   - *Recommendation*: Mount `TrajectoryChart.tsx`. TIS's core brand promise is quiet, mathematically grounded trajectory tracking. Showing a synthetic static curve contradicts Brand Invariant #2 ("Deep Emerald kinetic contrast and signature ±10% buffer cone").
2. **Streak Counter in Dashboard**:
   - *Question*: `Dashboard.tsx:330-376` renders a prominent Flame streak counter ("Complete today's focus to extend your streak to N days"), while `Landing.tsx` and `comparison-table.tsx` claim TIS rejects fragile streaks in favor of trajectory. Should the Dashboard streak cockpit be replaced with trajectory velocity?
   - *Recommendation*: Replace the streak counter with velocity/trajectory metrics to maintain consistency with the landing page and Brand Invariant #3.
3. **Local-First Offline Vault vs Cloud Supabase**:
   - *Question*: Should TIS build a true local-first offline encrypted vault (RxDB / SQLite WASM), or update marketing copy to describe current cloud-backed Supabase storage with RLS?
   - *Recommendation*: Update marketing copy. Building a cryptographic local-first offline sync engine is a major multi-month architectural project.
4. **Recurring Series Management**:
   - *Question*: How should users stop, edit, or pause recurring series?
   - *Recommendation*: Allow users to click an active recurring quest on `/quests` and select "Stop series" or "Edit scheduled days".
5. **Pomodoro Timer Feature**:
   - *Question*: Should the unmounted 197-line `usePomodoroTimer.tsx` be wired into `SystemBar` as a focus widget, or removed from the codebase?
   - *Recommendation*: Mount a compact focus timer widget in `SystemBar` next to the user identity avatar.
