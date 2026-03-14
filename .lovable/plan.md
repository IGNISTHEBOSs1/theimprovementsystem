

# Professional Polish Plan

This plan covers smooth animations, image caching improvements, and overall UI/UX refinement across the app.

## What Changes

### 1. Smoother Page Transitions & Animations
- Add `transition` config to all `AnimatePresence mode="wait"` section switches in Index.tsx for smoother easing (spring-based, no jarring jumps)
- Use `layout` prop on key containers for fluid layout shifts
- Add staggered children animations with consistent timing across all sections
- Smooth the header/nav hover states with proper `transition-all duration-200`

### 2. Achievement Image Caching (Instant Load)
- Current: Images cached in localStorage as URLs, but the URLs are base64 data URIs from the AI gateway which are already cached. The issue is when a new achievement is opened, it re-generates if not cached.
- Improvement: Pre-cache images in the background. When the AchievementsPanel mounts, silently pre-generate images for all unlocked achievements that aren't yet cached. Use a queue system to avoid flooding the API.
- Add a `useMemo` check in AchievementDetailModal so cached images appear instantly with zero loading state.

### 3. NavigationHub Polish
- Add subtle gradient border animation on active tab
- Smooth the icon container transition with `transition-colors duration-300`
- Add a subtle entrance stagger (currently 0.1s delay per item -- reduce to 0.05s for snappier feel)

### 4. PlayerCard Refinements
- Add a subtle float animation on the avatar
- Smooth XP bar with spring physics instead of linear easing
- Add micro-interaction on rank badge hover

### 5. RewardCenter & Leaderboard Polish
- Reward cards: Add `transition-shadow` for hover glow effect, increase card padding slightly, better typography hierarchy
- Leaderboard: Add row hover highlight with smooth transition, shimmer effect on top 3 entries
- Both: Remove per-item stagger delays on large lists (causes sluggish appearance with 50 rewards) -- use a single fade-in for the grid

### 6. QuestCard & SystemLog
- QuestCard: Add a subtle left border accent color matching difficulty
- SystemLog: Limit animation delays to first 5 messages to avoid slow cascading on large logs

### 7. Auth Page
- Add subtle floating particles or ambient glow animation behind the form
- Smoother button press feedback with `active:scale-[0.98]` instead of framer-motion whileTap for snappier response

### 8. Global CSS Enhancements
- Add smooth scroll behavior `scroll-behavior: smooth`
- Add `will-change: transform` on frequently animated elements
- Refine glass effect with slightly more blur for depth
- Add a professional focus ring style across all interactive elements

### 9. Landing Page
- Add parallax-style scroll animation on feature cards
- Smoother hero text entrance with proper spring config

## Technical Details

**Files to modify:**
- `src/pages/Index.tsx` -- smoother section transitions, stagger config
- `src/components/game/AchievementDetailModal.tsx` -- instant cached image display
- `src/components/game/AchievementsPanel.tsx` -- background pre-caching logic
- `src/components/game/NavigationHub.tsx` -- snappier stagger, border animation
- `src/components/game/PlayerCard.tsx` -- avatar float, spring XP bar
- `src/components/game/RewardCenter.tsx` -- remove per-item delay, hover effects
- `src/components/game/Leaderboard.tsx` -- row hover, shimmer on podium
- `src/components/game/QuestCard.tsx` -- difficulty accent border
- `src/components/game/SystemLog.tsx` -- cap animation delays
- `src/components/game/MotivationQuote.tsx` -- smoother refresh transition
- `src/index.css` -- scroll-behavior, refined glass, focus rings
- `src/pages/Auth.tsx` -- ambient glow, snappier buttons
- `src/pages/Landing.tsx` -- spring-based hero animations

**No database changes required.**

