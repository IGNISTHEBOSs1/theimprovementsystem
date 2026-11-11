# Kinetic — Preliminary Design Identity Specification
**Phase 01: Visual Identity Discovery & Design Research**
**Direction:** The Tectonic Monograph (Synthesis of Architectural Monolith & Editorial Chronicle)
**Date:** November 2026  
**Status:** Strategic Design Specification (Pre-Implementation)

---

## 1. Brand Foundations

### Visual Personality
- **Authoritative & Quiet:** Speaks with the weight of an engineered scientific instrument or an archival volume. Never shouts; never begs for attention with pushy banners or badges.
- **Physical & Milled:** Interactive elements possess tactile mass, specular edge reflections, recessed tracks, and physical detent resistance.
- **Intellectual & Stoic:** Treats the user as a serious, self-directed individual capable of sustained commitment.
- **Calibrated Precision:** Numbers, dates, and trajectory vectors are rendered with tabular accuracy, presenting progress as objective physics rather than emotional cheerleading.

### Emotional Objectives
- **Pre-Execution (Morning):** Total cognitive calm. The user opens the app and experiences a stillness that contrasts with the chaos of social feeds. There is only **one** essential commitment to focus on today.
- **Execution (Threshold Moment):** Purposeful, tactile friction. Sliding the commitment handle feels mechanical and intentional; crossing the 65% detent creates an unmistakable physical lock-in ritual.
- **Post-Execution (Evening Reflection):** Grounded satisfaction. The user sees their trajectory vector advance cleanly within the $\pm 10\%$ buffer cone—unshakable proof of personal agency.

### Core Design Principles
1. **The Law of Absolute Restraint (1 + 2):** Exactly one Primary Focus, a maximum of two Supporting Routines. The layout must enshrine this hierarchy spatially: the Primary Focus owns the dominant upper deck; routines occupy the supporting split bay.
2. **Planes Over Boxes (Card Elimination):** Content is organized on tactile structural slabs and editorial baseline planes. Never nest arbitrary rounded cards inside other cards.
3. **Directional Specular Lighting:** In dark mode, depth is articulated through directional light—crisp `1px` top-edge specular chamfers (`inset 0 1px 0 rgba(255,255,255,0.15)`) paired with deep ambient occlusion below. In light mode, surfaces behave like carved limestone.
4. **Trajectory Over Attendance:** Never celebrate unbroken attendance streaks. Honor the **$\pm 10\%$ Mathematical Buffer Cone**, visualizing human resilience and margin rather than fragility.
5. **Epistemic Discipline in Guidance:** Mentor insights must never use arbitrary motivational quotes. Every recommendation must strictly follow the tripartite logic: **Evidence $\to$ Interpretation $\to$ Action**.

### Brand Signatures
- **The Obsidian & Phosphor Emerald Monolith:** Stark nocturnal contrast where luminous green is reserved strictly as an active vector and completion signal.
- **The 65% Mechanical Slide Detent:** A physical, spring-damped slider that transitions visually and audibly from passive intention to locked covenant.
- **The Attitude Buffer Waterline:** A horizontal flight-director vector scale visualizing actual progress against the $\pm 10\%$ buffer corridor.

### What Kinetic Should NEVER Look Like
- **NOT an RPG / Habit Game:** No XP bars, leveling up, avatar badges, cute mascots, or fantasy tropes.
- **NOT a Streak Counter App:** No flaming streak icons, no "Don't break the chain" guilt messaging, no streak freezes.
- **NOT a SaaS Corporate Dashboard:** No rows of multicolored metric cards, no bubbly rounded pills, no gradient borders, no diffuse neon glow halos.
- **NOT a Todo List Clone:** No infinite scroll of unprioritized tasks, no checkbox spam, no nested subtask accordions.

---

## 2. Visual System

### Color Philosophy & Preliminary Palette
The palette is calibrated for high visual ergonomics in dark environments and warm readability in daylight. It completely rejects harsh pure white on black and avoids decorative multi-color chaos.

```
┌────────────────────────────────────────────────────────────────────────┐
│ THE DUAL-THEME PALETTE                                                 │
├────────────────────────────────────┬───────────────────────────────────┤
│ NOCTURNAL OBSIDIAN (Dark Theme)    │ ARCHITECTURAL BONE (Light Theme)  │
│ Base Void:        #060708          │ Base Canvas:       #F7F5F0        │
│ Milled Slab:      #121316          │ Elevated Limestone: #FFFFFF       │
│ Recessed Trench:  #090A0C          │ Recessed Inset:    #EAE7E0        │
│ Specular Chamfer: rgba(255,255,255,0.15) Specular Rim: rgba(255,255,255,0.9)│
│ Structural Stroke: #1E2024         │ Hairline Border:   #E2DFD8        │
│ Primary Text:     #F8FAFC          │ Primary Ink:       #111215        │
│ Secondary Muted:  #94A3B8          │ Secondary Slate:   #64748B        │
│ Kinetic Emerald:  #10B981 (Active) │ Forest Emerald:    #059669        │
│ Buffer Caution:   #F59E0B (Amber)  │ Buffer Caution:    #D97706        │
└────────────────────────────────────┴───────────────────────────────────┘
```

### Typography Pairing & Hierarchy
Kinetic employs a high-contrast pairing between an authoritative modern display face, a clean architectural reading sans, and an exacting tabular monospace data engine:

1. **Display & Section Anchors:** **Space Grotesk** (or *Instrument Sans*). Sharp geometric cuts, tight letter-spacing (`-0.02em`), confident and modern without ornamental distraction.
2. **Prose & Guidance Text:** **Inter** (or *Geist*). Exceptional optical legibility at $13\text{px}-15\text{px}$ for reading Mentor guidance and commitment titles.
3. **Data Telemetry & Coordinates:** **JetBrains Mono**. Strict tabular numbers (`font-variant-numeric: tabular-nums`) for day counters ($14/90$), velocity rads ($+0.82$), times, and margin indices (`01 //`, `02 //`).

```
TYPOGRAPHIC SCALE (MOBILE):
Display Monumental:  28px / 34px  (Space Grotesk 600, -0.02em)  -> North Star Goal
Headline Module:     18px / 24px  (Space Grotesk 600, -0.01em)  -> Primary Focus Title
Body Primary:        14px / 22px  (Inter 400, normal)          -> Routine Titles & Context
Body Secondary:      12px / 18px  (Inter 400, normal)          -> Contextual Subtitles
Telemetry Readout:   11px / 14px  (JetBrains Mono 500, tabular) -> Metrics & Buffer Stats
Section Kicker:      10px / 12px  (JetBrains Mono 600, +0.12em) -> "01 // PRIMARY FOCUS"
```

### Shape & Radius Philosophy
Kinetic completely rejects the bubbly, friendly $16\text{px}-24\text{px}$ pill-card aesthetic.
- **Structural Plinths & Cards:** Fixed $6\text{px}-8\text{px}$ industrial corner radius.
- **Sliders & Inputs:** $4\text{px}-6\text{px}$ radius.
- **Status Chips & Action Triggers:** $3\text{px}-4\text{px}$ micro-radius or sharp $90^\circ$ corners.
- **Circular Geometry:** Reserved strictly for status pips, profile avatar nodes, and circular checkbox rings.

### Surface Elevation & Specular Depth
Depth is never created with diffuse blurry drop shadows. Elevation is achieved through **optical light physics**:
- **Layer 0 (Canvas Void):** `#060708` (Dark) / `#F7F5F0` (Light).
- **Layer 1 (Tectonic Plinth):** `#121316` (Dark) with `box-shadow: inset 0 1px 0 rgba(255,255,255,0.15), 0 8px 24px -4px rgba(0,0,0,0.7)`.
- **Layer 2 (Recessed Mechanical Track):** `#090A0C` (Dark) with `box-shadow: inset 0 2px 5px rgba(0,0,0,0.8), 0 1px 0 rgba(255,255,255,0.05)`.
- **Layer 3 (Floating Frost Dock):** `rgba(18, 19, 22, 0.9)` with `backdrop-filter: blur(16px)` and top hairline border.

### Motion & Interaction Principles
- **Mechanical Resistance & Critical Damping:** All interactive transitions use spring physics with high stiffness and heavy damping ($k=450, d=32$), eliminating cartoonish bounce.
- **Threshold Lock-in:** The 65% slider crossing triggers a single discrete haptic tick (`selection`), a quiet synthesized detent sound, and an instantaneous visual shift to emerald rim lighting.
- **No Confetti:** On completing the Primary Focus, the slider locks in with an audible latch; the screen does not burst into confetti. The reward is quiet visual order.

---

## 3. Mobile Architecture ($390 \times 844\text{px}$)

```
┌──────────────────────────────────────────────┐
│ [STATUS BAR & NOTCH SAFE AREA]               │
│                                              │
│ ┌──────────────────────────────────────────┐ │
│ │ HEADER RAIL: DAY 14 OF 90  [8/9 BUFFER]  │ │  <- 44px
│ └──────────────────────────────────────────┘ │
│                                              │
│ ┌──────────────────────────────────────────┐ │
│ │ 01 // MONUMENTAL PRIMARY FOCUS PLINTH    │ │  <- Dominant Deck (~240px)
│ │ "Deep Work: Finish Core Trajectory"      │ │
│ │ [━━━━━━━━━━━━━[❚❚ 65%]━━━━━━━━━━━━━]     │ │
│ └──────────────────────────────────────────┘ │
│                                              │
│ ┌──────────────────────────────────────────┐ │
│ │ 02 // SUPPORTING ROUTINES SPLIT BAY      │ │  <- Dual Bay (~120px)
│ │ [ 45m Conditioning ] [ Read 20p Arch ]   │ │
│ └──────────────────────────────────────────┘ │
│                                              │
│ ┌──────────────────────────────────────────┐ │
│ │ 03 // TRAJECTORY ATTITUDE WATERLINE      │ │  <- Velocity Strip (~70px)
│ │ -10% ────────────[●]──────────── +10%    │ │
│ └──────────────────────────────────────────┘ │
│                                              │
│ [BOTTOM SCROLL CLEARANCE: 96px]              │
│ ┌──────────────────────────────────────────┐ │
│ │ [⌂]      [◎]      [✓]      [💬]     [ME] │ │  <- Floating Dock (56px)
│ └──────────────────────────────────────────┘ │
│ [HOME INDICATOR SAFE AREA]                   │
└──────────────────────────────────────────────┘
```

- **Thumb Zone Optimization:** The Primary Focus slide control sits precisely in the natural thumb sweep zone ($280\text{px}-420\text{px}$ from screen top).
- **Guaranteed Dock Clearance:** The scroll container enforces `padding-bottom: 96px` plus `env(safe-area-inset-bottom)`, guaranteeing that the lowest interactive control never crowds the floating navigation dock.
- **Minimum Touch Targets:** Every button, slider handle, and routine target enforces a minimum $44 \times 44\text{px}$ interactive hit box.

---

## 4. Signature Product Patterns

### 1. The Primary Focus Plinth
The Primary Focus is rendered as a monumental, elevated slab. It contains:
- Monospace Kicker: `01 // MONUMENTAL PRIMARY FOCUS`
- High-contrast Title: Max 2 lines of Space Grotesk, wrapping cleanly at all viewports down to 320px.
- Cognitive Context: Target allocation (`3.5 / 5.0h`) and linked 90-day goal pill.
- The Recessed Slider: Chiseled track with a milled metallic handle that snaps at 65%.

### 2. The Supporting Routines Split Bay
Supporting routines are visually distinct from the Primary Focus:
- Positioned as a side-by-side dual bay (on viewports $\ge 375\text{px}$) or stacked structural bricks (at 320px).
- Binary fulfillment state: Inactive state shows an engraved, recessed checkbox; completed state fills solid with an inverted micro checkmark and subtle emerald specular rim.
- Explicit restriction: The UI physically accommodates only **two** slots, reinforcing the 2-routine limit as a hard architectural constraint.

### 3. The 90-Day North Star Declaration
Instead of an editable text field, the North Star is framed as a solemn covenant:
- Displayed in the header or dedicated profile plinth in high-contrast display typography.
- Accompanied by cycle telemetry: Day index ($14/90$), elapsed percentage ($15.5\%$), and target horizon date.

### 4. The $\pm 10\%$ Trajectory Buffer Scale
Progress is visualized via the **Attitude Buffer Scale**:
- A horizontal flight-director instrument with a center nominal waterline and bounded $\pm 10\%$ drift cones.
- If the user misses a day, their coordinate node shifts within the allowable cone without triggering alarm or resetting anything.
- The UI explicitly displays: *"Buffer Active: 8 of 9 drift days remaining. Trajectory remains nominal."*

### 5. Mentor Epistemology (Evidence $\to$ Interpretation $\to$ Action)
Mentor insights are structured as diagnostic briefing slabs:
- **Evidence:** Exact data citation in monospace (e.g. `DATA: 4 consecutive missed completions on Thursday afternoons`).
- **Interpretation:** Clear psychological and operational analysis in editorial prose (e.g. *"Context fatigue is peaking before your 16:00 session."*).
- **Action:** A single high-contrast architectural button (e.g. `[ REBALANCE CADENCE TO MON-WED-FRI ]`).

### 6. Personal Execution History (The Indelible Chronicle)
History is elevated from a database table to an archival chronicle:
- Entries are formatted as daily log slabs with embossed date stamps, focus completion badges, and trajectory velocity deltas.
- Reviewing 90 days feels like reviewing the flight log of an extraordinary personal voyage.
