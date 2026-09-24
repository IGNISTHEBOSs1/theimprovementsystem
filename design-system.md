# The Improvement System – Project‑Specific Design System

## 1️⃣ Vision & Brand Invariants
- **Neoskeuomorphism** – tactile depth, specular highlights, liquid‑glass surfaces.
- **Intentional Minimalism & 3‑Second Clarity** – communicate purpose in ≤ 3 seconds using 6‑th‑grade language (except branding terms).
- **No RPG Gamification** – deterministic personal trajectory, no XP bars or ranks.
- **Side‑by‑Side Comparative Clarity** – clean matrix with tick/✖ icons.
- **Story‑Driven Motion** – motion only when it guides the eye or reflects state changes.

## 2️⃣ Core Design Principles
| Principle | What it means for the UI |
|-----------|--------------------------|
| **Focus** | One Primary Focus per day, two supporting routines, ±10 % buffer cone. |
| **Local‑first** | All data stored encrypted in the browser – UI must hint at privacy. |
| **Depth** | Use shadows, inset highlights and glass bevels to convey layers. |
| **Consistency** | Same glass‑morphism token set used everywhere (no ad‑hoc opacity values). |
| **Accessibility** | Sufficient colour contrast, clear focus outlines, touch‑target ≥ 44 × 44 px. |

## 3️⃣ Foundations (Tokens)
### Colours
The app uses **HSL custom properties** defined in `src/index.css`. The light / dark mappings are:

| Token | Light (HSL) | Light (Hex) | Dark (HSL) | Dark (Hex) |
|-------|-------------|-------------|------------|-----------|
| **--background** | 60 2% 98% | `#fafafa` | 0 0% 4% | `#0a0a0a` |
| **--foreground** | 0 0% 9% | `#171717` | 0 0% 98% | `#fafafa` |
| **--primary** | 0 0% 9% | `#171717` | 0 0% 98% | `#fafafa` |
| **--secondary** | 0 0% 20% | `#333333` | 0 0% 88% | `#e0e0e0` |
| **--accent** | 0 0% 93% | `#ededed` | 0 0% 14% | `#242424` |
| **--card** | 0 0% 100% | `#ffffff` | 0 0% 8% | `#141414` |
| **--border** | 0 0% 88% | `#e0e0e0` | 0 0% 16% | `#2a2a2a` |
| **--glass** | 0 0% 100% (opacity applied via class) | – | 0 0% 8% | – |
| **--success** | 142 76% 36% | `#0f9d58` | 142 72% 50% | `#12c776` |
| **--warning** | 0 0% 25% | `#404040` | 0 0% 85% | `#d9d9d9` |
| **--destructive** | 0 0% 20% | `#333333` | 0 0% 80% | `#cccccc` |

### Typography
| Class | Font‑family | Size (clamp) | Weight | Usage |
|-------|-------------|--------------|--------|-------|
| `.text-display-xl` | Inter | `clamp(2.5rem, 6vw, 4.5rem)` | 900 | Hero headline |
| `.text-display-lg` | Inter | `clamp(1.5rem, 3vw, 2.5rem)` | 800 | Section header |
| `.text-display-md` | Inter | `clamp(1rem, 2vw, 1.5rem)` | 700 | Sub‑headline |
| `.text-body-lg` | Inter | 1.125 rem | 400 | Body copy (large) |
| `.text-body-md` | Inter | 1 rem | 400 | Body copy |
| `.text-body-sm` | Inter | 0.875 rem | 400 | Small caption |
| `.text-caption` | Inter | 0.75 rem | 500 | UI captions |
| `.text-label` | Inter | 0.6875 rem | 600 | Form labels |
| `.font-tech-mono` | JetBrains Mono | – | – | Code snippets |
| `.font-display` | Inter | – | 700 | Primary UI text |

### Spacing & Layout
- `--spacing-page: 1.5rem` – outer page gutters.
- `--spacing-card: 1.5rem` – card internal padding.
- `--spacing-section: 2.5rem` – vertical section gap.
- `.touch-target` – min‑size 44 px (ensures tap‑targets).

### Elevation & Shadows
| Token | Light value | Dark value |
|-------|-------------|------------|
| `--shadow-card` | `0 1px 2px rgba(0,0,0,0.04), 0 4px 12px -2px rgba(0,0,0,0.05)` | `0 0 0 1px hsl(var(--border)), inset 0 1px 0 0 rgba(255,255,255,0.06), 0 4px 16px rgba(0,0,0,0.5)` |
| `--shadow-elevated` | `0 1px 3px rgba(0,0,0,0.04), 0 8px 24px -4px rgba(0,0,0,0.07), 0 20px 32px -8px rgba(0,0,0,0.04)` | `0 0 0 1px hsl(var(--border)), inset 0 1px 0 0 rgba(255,255,255,0.09), 0 8px 32px rgba(0,0,0,0.7)` |
| `--shadow-glow-primary` | `0 0 0 1px hsl(var(--primary)/0.18), 0 4px 16px hsl(var(--primary)/0.15)` | `0 0 0 1px hsl(var(--primary)/0.25), 0 0 24px hsl(var(--primary)/0.3)` |

### Glass & Liquid‑Glass Tokens
| Class | Description |
|-------|-------------|
| `.glass` | 88 % background opacity, `backdrop‑blur(12px)`, thin border, subtle shadow – used for generic overlays. |
| `.glass-strong` | 94 % opacity, `blur(16px)`, stronger border – for cards that need visual weight. |
| `.liquid‑glass` | 65 % opacity, `blur(20px)`, specular inner‑glow – preferred for floating panels and navbars. |
| `.glass‑nav‑pill` | Navbar sliding indicator with inner specular highlight. |
| `.liquid‑glass‑nav` | Top navigation bar – 24 px blur, saturate 190 % gradient, subtle bottom border. |
| `.glass‑dock` | Bottom dock / mobile navbar – blurred, saturated background with bevel border. |

### Motion & Interaction
- `.tactile‑press` – press animation (scale 0.98, shadow change). Use on interactive elements (`Button`, `Card`). 
- `.animate‑border` – flowing gradient border for attention‑grabbers.
- `.animate‑glow‑pulse‑once` – one‑shot pulse for state changes (e.g., task completed).
- Framer‑Motion wrappers are already used for entrance fades (`motion.div`, `motion.h1`). Keep durations ≤ 0.35 s for quick feedback.

## 4️⃣ Component Library (Tailwind/​shadcn UI)
### 4.1 Button
```tsx
<Button
  variant="default"   // also "outline", "secondary"
  size="sm"           // "lg" available
  className="shadow-xs active:scale-[0.98] rounded-full"
>
  <span>Log In</span>
</Button>
```
- **Core classes**: `font-display font-semibold`, `px-3.5 sm:px-4`, `h-8 sm:h-9`.
- **States**: `active:scale-[0.98]` (tactile‑press), `disabled:opacity-50`.
- **Variants**: `default` uses `bg-primary/90 text-foreground`; `outline` uses `border border-border bg-card/60 backdrop‑blur‑md`.
- **Accessibility**: proper `type="button"`, focus ring via Tailwind `focus-visible:ring-2` (inherited from shadcn).

### 4.2 Badge
```tsx
<Badge variant="outline" className="flex items-center gap-1.5">
  <RiSparkling2Line /> Compare plans
</Badge>
```
- Uses `font-tech-mono`, small padding, background `bg-card/70` with `backdrop‑blur‑xl`.
- Good for status chips, e.g., "Most Popular".

### 4.3 Card / Surface
- Base class: `card-base` (border‑radius 1 rem, `background: hsl(var(--card))`, `box-shadow: var(--shadow-card)`).
- Elevated version: `surface-raised` – swaps background to `--card-elevated` and uses `var(--shadow-elevated)`.
- Liquid‑glass variant: `liquid-glass-card` – gradient background, stronger blur, border‑glow.

### 4.4 Navigation Bar (Floating Island)
```tsx
<header className="fixed top-3 inset-x-3 max-w-5xl mx-auto z-50 tis-glass-island rounded-2xl md:rounded-full px-3.5 sm:px-5 py-2 sm:py-2.5 transition-all duration-300">
  …
</header>
```
- Combines `liquid‑glass-nav` utilities (blur 24 px, saturate 190 %).
- Contains brand logo, dark/light toggle (`TactileThemeToggle`), and login button.
- **Responsive**: height shrinks on mobile, icons hide/show via `sm:hidden`.

### 4.5 Comparison Table (Side‑by‑Side)
Located in `src/components/ui/comparison-table.tsx`.
- Root wrapper uses `glass‑control` for translucent panel.
- Table rows have `hover:bg-transparent` to keep glass‑look.
- Header cells apply `bg-primary/5` when highlighted.
- Icons (`RiCheckLine`, `RiCloseLine`) are colour‑coded via `bg-primary` / `bg-muted`.
- **Responsive**: `overflow-x-auto` on mobile, fixed width on desktop.

### 4.6 Hero / Headline Section
- Uses `motion.h1` with `font-display` and gradient text (`bg-gradient-to-b … bg-clip-text text-transparent`).
- Drop‑shadow varies per theme (`dark:drop-shadow-[0_4px_24px_rgba(0,0,0,0.9)]`).
- Max‑width limited to `max-w-4xl` for readability.

### 4.7 Interactive Area (Trajectory / Buffer)
- Current implementation lives in `src/components/interactive‑area/*.tsx` (not fully shown here). Ensure:
  - **Buffer zone** is a static element (`position: absolute;`) that does **not** follow the moving curve.
  - Past line (`<path>` element) stays fixed; only the **future curve** updates with cursor.
  - Add class `tactile‑press` to hover targets for consistent feedback.

## 5️⃣ Accessibility Checklist
- **Colour contrast**: All text against `--background` / `--card` meets WCAG AA (≥ 4.5:1). Verify with Lighthouse.
- **Focus style**: Ensure `focus-visible` ring on interactive elements (Tailwind `focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary`).
- **Touch targets**: Apply `.touch-target` to any clickable icon or small button.
- **ARIA**: Add `aria‑label` for icon‑only buttons (e.g., theme toggle), `role="alert"` for status messages.
- **Reduced motion**: Global `@media (prefers-reduced-motion: reduce)` already forces near‑instant animation durations.

## 6️⃣ How to Extend the System
1. **Add a token** – edit `src/index.css` under `:root` (light) or `.dark` (dark) and reference via `var(--my-token)`. 
2. **Create a component** – place it in `src/components/ui/` and compose using existing utility classes (`glass‑card`, `tactile‑press`). 
3. **Document** – add a markdown section in this file following the same pattern (foundations → component → usage). 
4. **Sync** – run `npm run build` and optionally generate Storybook stories to keep docs in‑sync.

---
*Generated on 2026‑09‑25 by Antigravity.*
