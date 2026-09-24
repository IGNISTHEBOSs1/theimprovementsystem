# Design System – The Improvement System (Full UI/UX Specification)

> **Purpose** – This document defines a single source of truth for the visual language, interaction patterns, and accessibility guidelines of the entire Improvement System application. It is **not** a conceptual overview but a concrete UI/UX specification that can be directly consumed by designers and developers.

---

## 1. Foundations

### 1.1 Brand & Visual Invariants
| Invariant | Description |
|-----------|-------------|
| **Neoskeuomorphism** | Tactile depth created with inset highlights, specular shadows, and liquid‑frosted glass surfaces. All UI surfaces must include a subtle bevel or inner‑glow to convey materiality. |
| **Intentional Minimalism & 3‑Second Clarity** | Every screen must convey its purpose in ≤ 3 seconds using 6th‑grade language (except required branding terminology). Text should be concise, hierarchy clear, and visual noise minimal. |
| **No RPG Gamification** | Avoid XP bars, rank icons, or fantasy‑style progress meters. Use deterministic personal‑trajectory visuals (buffer cone, focus count). |
| **Side‑by‑Side Comparative Clarity** | When comparing features, use a clean matrix with tick (`✔`) / cross (`✖`) icons, no ambiguous sliders. |
| **Story‑Driven Motion** | Motion only when it guides focus, indicates state change, or reinforces the buffer‑cone metaphor. All animations ≤ 350 ms, respect `prefers-reduced-motion`. |

### 1.2 Colour Palette (HSL tokens – defined in `src/index.css`)
| Token | Light (HSL) | Light Hex | Dark (HSL) | Dark Hex |
|-------|-------------|----------|------------|----------|
| `--background` | 60 2% 98% | `#fafafa` | 0 0% 4% | `#0a0a0a` |
| `--foreground` | 0 0% 9% | `#171717` | 0 0% 98% | `#fafafa` |
| `--primary` | 0 0% 9% | `#171717` | 0 0% 98% | `#fafafa` |
| `--secondary` | 0 0% 20% | `#333333` | 0 0% 88% | `#e0e0e0` |
| `--accent` | 0 0% 93% | `#ededed` | 0 0% 14% | `#242424` |
| `--card` | 0 0% 100% | `#ffffff` | 0 0% 8% | `#141414` |
| `--border` | 0 0% 88% | `#e0e0e0` | 0 0% 16% | `#2a2a2a` |
| `--success` | 142 76% 36% | `#0f9d58` | 142 72% 50% | `#12c776` |
| `--warning` | 0 0% 25% | `#404040` | 0 0% 85% | `#d9d9d9` |
| `--destructive` | 0 0% 20% | `#333333` | 0 0% 80% | `#cccccc` |

#### Usage Notes
- Use `var(--primary)` for text on dark surfaces and `var(--foreground)` for dark‑theme text. 
- Backgrounds for glass surfaces **must** use the `--glass` utility classes (see §2.4). 
- All opacity values are derived from the token – never hard‑code `rgba(...,0.12)`.

### 1.3 Typography
| Class | Font‑family | Size (clamp) | Weight | Example Use |
|-------|-------------|--------------|--------|-------------|
| `.text-display-xl` | Inter | `clamp(2.5rem,6vw,4.5rem)` | 900 | Hero headline |
| `.text-display-lg` | Inter | `clamp(1.5rem,3vw,2.5rem)` | 800 | Section header |
| `.text-display-md` | Inter | `clamp(1rem,2vw,1.5rem)` | 700 | Sub‑headline |
| `.text-body-lg` | Inter | 1.125 rem | 400 | Body copy (large) |
| `.text-body-md` | Inter | 1 rem | 400 | Body copy |
| `.text-body-sm` | Inter | 0.875 rem | 400 | Small caption |
| `.text-caption` | Inter | 0.75 rem | 500 | UI captions |
| `.text-label` | Inter | 0.6875 rem | 600 | Form labels |
| `.font-tech-mono` | JetBrains Mono | – | – | Code snippets |
| `.font-display` | Inter | – | 700 | Primary UI text |

#### Text‑style guidelines
- **Line‑height**: 1.4 for body, 1.2 for display headings.
- **Letter‑spacing**: 0.02 em on headings, normal on body.
- **Contrast**: WCAG AA (≥ 4.5:1) against `--background`/`--card`.

### 1.4 Spacing & Layout Tokens
```css
:root {
  --spacing-page: 1.5rem;   /* outer page gutters */
  --spacing-card: 1.5rem;   /* inside cards */
  --spacing-section: 2.5rem;/* vertical section gaps */
}
```
- Apply using Tailwind utilities: `p-6` ↔ `--spacing-page`, `p-6` on cards, `mb-10` for sections.
- Minimum touch target class: `.touch-target { min-width:44px; min-height:44px; }`

### 1.5 Elevation & Shadows
```css
:root {
  --shadow-card: 0 1px 2px rgba(0,0,0,0.04), 0 4px 12px -2px rgba(0,0,0,0.05);
  --shadow-elevated: 0 1px 3px rgba(0,0,0,0.04), 0 8px 24px -4px rgba(0,0,0,0.07), 0 20px 32px -8px rgba(0,0,0,0.04);
  --shadow-glow-primary: 0 0 0 1px hsl(var(--primary)/0.18), 0 4px 16px hsl(var(--primary)/0.15);
}
```
- **Cards** use `var(--shadow-card)`.
- **Elevated panels** (modals, floating islands) use `var(--shadow-elevated)`.
- **Interactive focus** (e.g., button press) adds `var(--shadow-glow-primary)`.

### 1.6 Glass & Liquid‑Glass Utilities
| Utility class | Description |
|---------------|-------------|
| `.glass` | 88 % opacity, `backdrop-blur(12px)`, thin border, subtle shadow – generic overlay. |
| `.glass-strong` | 94 % opacity, `blur(16px)`, stronger border – for cards that need visual weight. |
| `.liquid-glass` | 65 % opacity, `blur(20px)`, specular inner‑glow – preferred for floating panels, navbars, and the “Island Dock”. |
| `.glass-nav-pill` | Sliding indicator with inner specular highlight – used in the top navigation toggle. |
| `.liquid-glass-nav` | Top navigation bar – 24 px blur, saturate 190 %, subtle bottom border. |
| `.glass-dock` | Bottom dock / mobile navigation – blurred, saturated background with bevel border. |

### 1.7 Motion & Interaction
| Class | Effect |
|-------|--------|
| `.tactile‑press` | `transform: scale(0.98)` and shadow change on `:active`. Applied to buttons, cards, toggles. |
| `.animate‑border` | Gradient border animation, used for attention‑grabbers (e.g., primary CTA). |
| `.animate‑glow‑pulse‑once` | One‑shot glow pulse for state change feedback (e.g., task completed). |
| Framer‑Motion wrappers (`motion.div`, `motion.h1`) are used for entrance fades; durations ≤ 350 ms. |
| Respect `prefers-reduced-motion` – if true, all animations collapse to ≤ 100 ms or are removed. |

---

## 2. Component Library (Tailwind + shadcn UI)
> All components are built with Tailwind utility classes and the shadcn UI base components. The source files live in `src/components/ui/`.

### 2.1 Core Layout
- **Page Container** – `class="min-h-screen bg-background text-foreground selection:bg-foreground/20 selection:text-foreground"`
- **Section Wrapper** – `class="relative z-10 max-w-6xl mx-auto px-4 sm:px-6 md:px-8 pt-24 sm:pt-32 pb-8 sm:pb-16"`
- **Glass Overlay** – `class="fixed inset-0 pointer-events-none z-0 overflow-hidden"` containing layered glass utilities (see §1.6).

### 2.2 Buttons
```tsx
<Button
  variant="default"   // also "outline", "secondary"
  size="sm"           // "lg" available
  className="shadow-xs active:scale-[0.98] rounded-full"
>
  <span>Log In</span>
</Button>
```
- **Variants**: `default` (primary background), `outline` (border + glass background), `secondary` (muted background). 
- **States**: `hover` – slight elevation, `active` – `tactile‑press`, `disabled` – `opacity-50`. 
- **Accessibility**: `type="button"`, focus ring via `focus-visible:ring-2 focus-visible:ring-primary`.

### 2.3 Badges / Tags
```tsx
<Badge variant="outline" className="flex items-center gap-1.5">
  <RiSparkling2Line /> Compare plans
</Badge>
```
- Small padding, `font-tech-mono`, `bg-card/70` + `backdrop-blur-xl`. 
- Used for status chips, e.g., "Free Forever", "Most Popular".

### 2.4 Cards & Surfaces
```tsx
<div className="card-base bg-card text-foreground shadow-card rounded-xl p-6">
  {children}
</div>
```
- **`card-base`** includes border‑radius 1 rem, background `var(--card)`, and `var(--shadow-card)`. 
- **Elevated Card** – add `surface-raised` to swap to `var(--shadow-elevated)` and a slightly darker background (`--card-elevated`). 
- **Liquid‑Glass Card** – replace `bg-card` with `liquid-glass` for floating panels.

### 2.5 Navigation Bar (Floating Island)
```tsx
<header className="fixed top-3 inset-x-3 max-w-5xl mx-auto z-50 tis-glass-island rounded-2xl md:rounded-full px-3.5 sm:px-5 py-2 sm:py-2.5 transition-all duration-300">
  {/* brand, toggles, login button */}
</header>
```
- Uses `liquid-glass-nav` utilities, includes dark/light toggle (`TactileThemeToggle`) and login button (styled as per §2.2). 
- Responsive: collapses to icons on mobile (`sm:hidden`/`hidden sm:block`).

### 2.6 Forms & Inputs
```tsx
<Input
  placeholder="Enter focus name"
  className="glass-strong focus-visible:ring-2 focus-visible:ring-primary"
/>
```
- **Base**: `bg-card/90`, `border border-white/20`, `backdrop-blur-md`. 
- **Focus**: `focus-visible:ring-2 focus-visible:ring-primary`. 
- **Error state**: `border-destructive bg-destructive/10`.

### 2.7 Modals / Dialogs
```tsx
<Dialog>
  <DialogTrigger asChild>
    <Button variant="outline">Open</Button>
  </DialogTrigger>
  <DialogContent className="glass-strong max-w-lg">
    {/* modal body */}
  </DialogContent>
</Dialog>
```
- Root overlay uses `bg-foreground/30` with `backdrop-blur-xl`. 
- Content panel uses `glass-strong` (94 % opacity) for a frosted look. 
- All dialogs must trap focus and include `aria-labelledby`/`aria-describedby`.

### 2.8 Tables & Comparison Matrices
- Wrapper: `class="overflow-x-auto glass-control"` (light translucent panel). 
- Header cells: `class="bg-primary/5 font-display text-sm"`. 
- Row hover: `hover:bg-transparent` to preserve glass‑look. 
- Icons: `RiCheckLine` (green `--success`) and `RiCloseLine` (gray `--muted`). 
- Responsive: horizontal scrolling on mobile.

### 2.9 Hero / Headline Section
```tsx
<motion.h1
  initial={{ opacity:0, y:12 }}
  animate={{ opacity:1, y:0 }}
  transition={{ duration:0.35, delay:0.05 }}
  className="font-display font-extrabold text-3xl sm:text-5xl md:text-6xl lg:text-7xl leading-[1.12] drop-shadow-[0_1px_2px_rgba(0,0,0,0.05)] dark:drop-shadow-[0_4px_24px_rgba(0,0,0,0.9)]"
>
  <span className="bg-gradient-to-b from-zinc-900 via-zinc-800 to-zinc-950 dark:from-zinc-100 dark:via-zinc-200 dark:to-zinc-400 bg-clip-text text-transparent">
    You don't need to be perfect
  </span>{' '}
  <span className="bg-gradient-to-b from-black via-zinc-950 to-black dark:from-white dark:via-zinc-50 dark:to-zinc-200 bg-clip-text text-transparent font-black">
    to keep improving.
  </span>
</motion.h1>
```
- Gradient text uses `bg-clip-text` and `text-transparent`. 
- Drop shadows differ per theme. 
- Max‑width limited to `max-w-4xl` for readability.

### 2.10 Interactive Trajectory / Buffer UI
- **Static buffer zone** – a glass‑styled area that never follows the moving curve.
- **Past line** – rendered as a fixed `<path>`; only the future curve updates with cursor movement.
- **Hover targets** – apply `.tactile‑press` for consistent feedback.
- Implementation lives in `src/components/interactive‑area/*`.

---

## 3. Accessibility Guidelines
1. **Colour Contrast** – All text meets WCAG AA against its background. Use the colour tokens; never override with low‑contrast custom colours.
2. **Focus Management** – Every interactive element must have a visible `focus-visible` ring (`ring-2 ring-primary`). Modals trap focus and return focus to the trigger on close.
3. **Touch Targets** – Minimum 44 × 44 px. Apply `.touch-target` class to icons and small buttons.
4. **ARIA** – 
   - Icon‑only buttons (e.g., theme toggle) need `aria-label`. 
   - Tabs, accordions, dialogs require appropriate `role` and `aria‑controls` attributes.
5. **Reduced Motion** – Global `@media (prefers-reduced-motion: reduce)` forces all `motion.*` components to a 0‑duration transition.
6. **Keyboard Navigation** – All controls reachable via `Tab`. Use `onKeyDown` handlers for custom components (e.g., toggles).

---

## 4. Usage & Extension Guidelines
1. **Adding a Token** – Edit `src/index.css` under `:root` (light) or `.dark` (dark) and reference via `var(--my-token)`.
2. **Creating a New Component** – Place the component in `src/components/ui/`, build with the base utility classes (e.g., `glass`, `tactile‑press`). Export it from `src/components/ui/index.ts`.
3. **Documenting** – Add a markdown section in this file following the same pattern: Foundations → Component → Usage → Accessibility.
4. **Sync with Code** – Run `npm run build` after changes; optionally generate Storybook stories (`npm run storybook`) to keep visual docs in sync.
5. **Governance** – Assign an owner for each token group (Colour, Typography, Motion). Changes must be reviewed and a changelog added.

---

*Generated on 2026‑09‑25 by Antigravity.*
