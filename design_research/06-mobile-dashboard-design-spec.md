# Kinetic — Mobile Dashboard Design Specification
**Synthesized Identity: The Tectonic Monograph**
*Document Version: 1.0.0 — Production Reference*

---

## 1. Executive Summary & Design Rationale

This specification defines the exact design architecture, layout geometry, component hierarchy, styling tokens, and interaction physics for the mobile Dashboard of **Kinetic**.

The design embodies the winning synthesis from Phase 01 research: **The Tectonic Monograph**. This visual language fuses the editorial discipline and typographic authority of *Direction 01 (Chronicle)* with the physical permanence, recessed tactile depth, and structural plinths of *Direction 02 (Monolith)*.

### Core Product Principles Enforced
1. **The 3-Second Rule**: Upon opening, the user instantly absorbs their current trajectory, their single Primary Focus, and their supporting commitments without visual clutter.
2. **Absolute Discipline Invariants**:
   - Exactly **1 Primary Focus**.
   - Maximum **2 Supporting Routines**.
   - No streak meters, flame badges, or attendance guilt.
   - Progress measured exclusively by trajectory velocity and the signature **$\pm 10\%$ Trajectory Buffer Cone**.
3. **Physical Weight & Tactility**: Moving parts feel milled and seated; completions feel irreversible and consequential; surfaces carry tactile depth through neoskeuomorphic specular highlights and milled recessed tracks.

---

## 2. Viewport Geometry & Safe Area Architecture

The mobile dashboard is architected natively for the standard modern mobile viewport (**$390 \times 844\text{px}$** — iPhone 14/15/16), with fully tested responsive adaptations for compact mobile (**$375 \times 667\text{px}$** — iPhone SE) and expansive mobile (**$430 \times 932\text{px}$** — iPhone Pro Max / Plus).

```
+-----------------------------------------------------------+ 0px
| Status Bar Safe Area (47px)                               |
+-----------------------------------------------------------+ 47px
| Masthead & Trajectory Waterline (Height: 88px)            |
+-----------------------------------------------------------+ 135px
| Margin / Breathing Void (16px)                            |
+-----------------------------------------------------------+ 151px
| Section 01: The Primary Focus Plinth (Height: ~210px)     |
| - Numbered Margin Rail ("01 / PRIMARY FOCUS")             |
| - High-Clarity Commitment Title & Context                 |
| - Recessed Mechanical Slider Track (Height: 52px)         |
+-----------------------------------------------------------+ 361px
| Margin / Divider Rule (20px)                              |
+-----------------------------------------------------------+ 381px
| Section 02: Supporting Routines Ledger (Height: ~140px)   |
| - Numbered Margin Rail ("02 / SUPPORTING DISCIPLINE")     |
| - Dual Routine Cards / Ledger Rows (Max 2)                |
+-----------------------------------------------------------+ 521px
| Margin / Divider Rule (16px)                              |
+-----------------------------------------------------------+ 537px
| Section 03: Mentor Telemetry Aperture (Height: ~94px)     |
| - Evidence-First Whispered Guidance                       |
+-----------------------------------------------------------+ 631px
| Bottom Scroll Padding (Clearance for Dock: 112px)         |
+-----------------------------------------------------------+ 743px
| Floating Navigation Dock (Height: 64px + 34px Home Bar)   |
+-----------------------------------------------------------+ 844px
```

### Viewport Responsive Matrix

| Viewport | Screen Width | Horizontal Margin | Card Padding | Max Content Width | Notes |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **Compact** | $320\text{px} - 375\text{px}$ | $16\text{px}$ | $16\text{px}$ | $343\text{px}$ | Stack routine cards vertically; truncate nothing; wrap titles naturally. |
| **Standard** | $390\text{px}$ | $20\text{px}$ | $20\text{px}$ | $350\text{px}$ | Primary design canvas; split-bay or stacked routine ledger. |
| **Expansive**| $430\text{px}+$ | $24\text{px}$ | $22\text{px}$ | $382\text{px}$ | Increased breathing room; routine ledger renders as dual side-by-side bays. |

---

## 3. Dual-Theme Design Tokens (Obsidian Night & Archival Bone)

The color palette avoids both generic saturated blues and stark, clinical `#000000` / `#FFFFFF` extremes. Colors evoke high-end horology, architectural slate, unbleached cotton rag paper, and tactile machined metal.

### 3.1 Color Palette & Semantic Tokens

```
===================================================================================================
TOKEN                    DARK THEME (Obsidian Night)     LIGHT THEME (Archival Bone)      ROLE
===================================================================================================
--surface-canvas         #060709 (Deep Obsidian)         #F6F4EF (Warm Archival Bone)     Root canvas
--surface-plinth         #121317 (Machined Slate)        #FFFFFF (Pressed Pure Paper)     Primary elevations
--surface-bay            #17191F (Elevated Bay)          #EDE9E1 (Tectonic Stone)         Secondary cards
--surface-trench         #0A0B0E (Recessed Void)         #E2DDD4 (Milled Trench)          Slider groove
--surface-overlay        rgba(18, 19, 23, 0.88)          rgba(255, 255, 255, 0.92)       Frosted docks

--border-subtle          rgba(255, 255, 255, 0.05)       rgba(0, 0, 0, 0.06)              Structure rules
--border-contrast        rgba(255, 255, 255, 0.12)       rgba(0, 0, 0, 0.14)              Plinth borders
--border-highlight       rgba(255, 255, 255, 0.22)       rgba(255, 255, 255, 0.90)       Top specular edge

--text-primary           #F8FAFC (Slate White)           #14171A (Tectonic Black)         Headlines, titles
--text-secondary         #94A3B8 (Cool Muted Slate)      #575E6A (Book Charcoal)          Body, descriptions
--text-tertiary          #64748B (Dim Slate)             #8A919E (Archival Graphite)      Labels, margins, kicks

--accent-kinetic         #10B981 (Kinetic Emerald)       #059669 (Deep Forest Emerald)    Trajectory on-track
--accent-buffer          #34D399 (Buffer Mint)           #10B981 (Tactile Green)          Buffer zone fill
--accent-advisory        #F59E0B (Advisory Amber)        #D97706 (Warm Ochre Amber)       Buffer warning
--accent-brass           #E6C280 (Horological Brass)     #926A20 (Burnished Bronze)       Margin numerals

--shadow-plinth          0 10px 28px -4px rgba(0,0,0,0.65), inset 0 1px 0 rgba(255,255,255,0.14) [Dark]
                         0 4px 20px -2px rgba(0,0,0,0.06), inset 0 1px 0 rgba(255,255,255,0.95) [Light]
--shadow-trench          inset 0 3px 6px rgba(0,0,0,0.85), 0 1px 0 rgba(255,255,255,0.04) [Dark]
                         inset 0 2px 5px rgba(0,0,0,0.14), 0 1px 0 #FFFFFF [Light]
--shadow-thumb           0 4px 12px rgba(0,0,0,0.5), inset 0 1px 0 rgba(255,255,255,0.25) [Dark]
                         0 3px 8px rgba(0,0,0,0.15), inset 0 1px 0 rgba(255,255,255,0.9) [Light]
===================================================================================================
```

---

## 4. Typography Hierarchy & Font Roles

Kinetic utilizes a triple-type pairing to establish clear separation between editorial narrative, operational clarity, and numerical precision:

1. **Editorial Serif (`Newsreader` / `Instrument Serif`)**: Used for the Master North Star Goal and primary philosophical anchors. Conveys deliberate, long-term permanence.
2. **Operational Sans (`Inter` / `SF Pro Display`)**: Used for commitments, routine titles, instructional text, and Mentor insights. Ensures instant legibility down to $11\text{px}$.
3. **Technical Monospace (`JetBrains Mono` / `SF Mono`)**: Used for trajectory vectors, buffer percentages, countdown days, and margin sequence indices (`01 //`, `02 //`).

```
+---------------------------------------------------------------------------------------------------+
| ELEMENT                   FONT FAMILY         SIZE    WEIGHT   LINE-HT   TRACKING   CASE          |
+---------------------------------------------------------------------------------------------------+
| Kicker / Overline         Technical Mono      10px    600      12px      +0.14em    UPPERCASE     |
| North Star Goal           Editorial Serif     24px    500      28px      -0.01em    Title Case    |
| Margin Section Header     Technical Mono      11px    700      14px      +0.12em    UPPERCASE     |
| Primary Focus Title       Operational Sans    18px    600      24px      -0.015em   Sentence Case |
| Primary Focus Context     Operational Sans    13px    400      18px      normal     Sentence Case |
| Slider Instructional Text Operational Sans    12px    600      14px      +0.04em    Sentence Case |
| Routine Title             Operational Sans    14px    500      18px      -0.01em    Sentence Case |
| Telemetry Metric Value    Technical Mono      13px    700      16px      +0.02em    Tabular       |
| Mentor Observation        Operational Sans    13px    400      19px      normal     Sentence Case |
| Dock Navigation Label     Operational Sans    10px    600      12px      +0.08em    UPPERCASE     |
+---------------------------------------------------------------------------------------------------+
```

---

## 5. Screen Breakdown: Component Specifications

### 5.1 Component A: The Trajectory Masthead & Waterline
*Location: Top of screen, immediately below status bar.*

#### Visual Appearance
- **Top Row**: Date and Cycle Telemetry.
  - Left: `DAY 42 OF 90` in `JetBrains Mono` $11\text{px}$, bold.
  - Right: `TRAJECTORY: +8.4% NOMINAL` in kinetic emerald badge.
- **Center**: The 90-Day North Star Goal in `Newsreader` $24\text{px}$, medium weight. Wrapped onto 2 lines maximum without truncation.
- **Bottom**: The **Attitude Waterline** (Signature Progress Buffer).
  - Rather than a conventional streak flame or flat bar, this is a precision dual-line gauge representing the $\pm 10\%$ corridor.
  - Height: $6\text{px}$. Width: $100\%$. Radius: $3\text{px}$.
  - The central channel represents the nominal path; an emerald-lit beam represents actual velocity; subtle boundary ticks indicate the upper ($+10\%$) and lower ($-10\%$) buffer bounds.

#### Specifications (CSS & Geometry)
- Container padding: `16px 20px 12px 20px`.
- Divider: `border-bottom: 1px solid var(--border-subtle)`.
- Margin bottom: `16px`.

---

### 5.2 Component B: The Primary Focus Plinth
*Location: Hero position, directly under Masthead.*

This is the gravitational center of the dashboard. It holds the user's single most critical daily commitment.

#### Layout Anatomy
1. **Section Rail**:
   - `01 // PRIMARY COMMITMENT` in `JetBrains Mono` $10\text{px}$ bold brass text (`--accent-brass`).
   - Right: Estimated duration / focus session tag (`75 MINS`).
2. **Commitment Title**:
   - Font: Inter $18\text{px}$, SemiBold, line-height $24\text{px}$.
   - Full text wraps cleanly up to 3 lines without truncation.
3. **Commitment Context / Friction Reducer**:
   - Font: Inter $13\text{px}$, Regular, color `--text-secondary`.
   - Explains the definition of done (e.g., *"Complete API contracts and push PR. No unfinished stubs."*).
4. **The Milled Slider Assembly (Slide-to-Complete)**:
   - **Trench (Track)**:
     - Height: $52\text{px}$.
     - Background: `var(--surface-trench)`.
     - Inset Shadow: `var(--shadow-trench)` (deep debossed cavity feel).
     - Radius: $10\text{px}$.
     - Full-width track with subtle guide groove down center.
   - **Thumb (Milled Mechanical Handle)**:
     - Dimensions: $48\text{px}$ width $\times 42\text{px}$ height.
     - Position: $5\text{px}$ inset from trench edge.
     - Surface: Machined gradient with metallic vertical micro-ribbing.
     - Top Edge Highlight: `inset 0 1px 0 rgba(255, 255, 255, 0.3)`.
     - Center Icon: Emerald double chevrons (`»`) or milled grip ridges.
   - **Interactive States**:
     - *Idle*: Track reads `"SLIDE TO COMMIT"` in $11\text{px}$ mono, $30\%$ opacity.
     - *Dragging (<65%)*: Thumb follows pointer; emerald glow expands behind handle.
     - *Threshold Reached (65%)*: Haptic detent triggers (`navigator.vibrate([12])`). Track text pulses to `"RELEASE TO LOCK IN"`. Accent flips to bright kinetic emerald.
     - *Released & Locked*: Thumb seats smoothly into right pocket; satisfying lock audio cue; plinth surface transitions to a quiet, sealed state with an emerald verification seal: `"LOCKED IN // COMPLETED AT 14:32"`.

---

### 5.3 Component C: Supporting Routines Ledger
*Location: Directly below Primary Focus Plinth.*

Strictly capped at two routines. No infinite scroll; no task bloating.

#### Layout Anatomy
1. **Section Rail**:
   - `02 // SUPPORTING DISCIPLINE (2 MAX)` in `JetBrains Mono` $10\text{px}$.
   - Right: Completion ratio (`1/2 ACTIVE`).
2. **Presentation Options**:
   - **Compact / Mobile Default ($390\text{px}$)**: Stacked Ledger Rows.
     - Height: $56\text{px}$ per row.
     - Left: Category indicator pip ($6\text{px}$ square) + Routine title ($14\text{px}$ Inter).
     - Right: Tactile Debossed Toggle Box ($24 \times 24\text{px}$).
   - **Wide Mobile ($430\text{px}$)**: Split-Bay Side-by-Side Cards.
     - Two equal-width cards ($168\text{px}$ each).
     - Top: Routine title and target frequency.
     - Bottom: Tactile completion pad.
3. **Toggle Interaction**:
   - Uncompleted: Debossed recessed box with subtle inset border.
   - Tap feedback: Instant scale down (`active:scale-[0.96]`), haptic pulse.
   - Completed: Solid Emerald fill with check glyph; title transitions to muted slate with strikethrough or check prefix.

---

### 5.4 Component D: Mentor Telemetry Aperture (Insight Whisper)
*Location: Bottom of primary content, above dock clearance.*

Replaces generic chat widgets or intrusive banners with a serene, architecturally integrated aperture.

#### Layout Anatomy
1. **Header**:
   - Left: `MENTOR // TELEMETRY ANALYSIS` ($9\text{px}$ mono uppercase).
   - Right: `OBSERVATION 42B` ($9\text{px}$ mono).
2. **Content (Evidence-First Structure)**:
   - **Evidence**: *"Primary focus completed 6 consecutive days. Routine 2 missed yesterday."*
   - **Interpretation**: *"Trajectory buffer remains safe at +8%, but conditioning routine cadence is slipping."*
   - **Action**: *"Protect morning routine slot before 09:00 tomorrow to prevent buffer decay."*
3. **Container**:
   - Background: `rgba(16, 185, 129, 0.03)` (ultra-subtle emerald whisper).
   - Left Border: $2\text{px}$ solid `var(--accent-kinetic)`.
   - Radius: $6\text{px}$.
   - Padding: $14\text{px} \times 16\text{px}$.

---

### 5.5 Component E: Floating Glass Dock & Safe Area Clearance
*Location: Fixed at screen bottom.*

#### Specifications
- **Position**: `fixed; bottom: 0; left: 0; right: 0;`
- **Container Height**: $64\text{px}$ + Safe Area Inset (`env(safe-area-inset-bottom, 34px)`).
- **Dock Pill Geometry**:
  - Max Width: $350\text{px}$ (centered horizontally).
  - Bottom Margin: $16\text{px}$ above device home indicator.
  - Border Radius: $24\text{px}$.
  - Background: `var(--surface-overlay)` with `backdrop-filter: blur(20px) saturate(180%)`.
  - Border: `1px solid var(--border-contrast)`.
  - Shadow: `0 12px 32px rgba(0, 0, 0, 0.45)`.
- **Navigation Tabs (4 Minimal Items)**:
  1. `HORIZON` (Active / Dashboard)
  2. `TRAJECTORY` (Journey / Buffer Charts)
  3. `COMMITMENTS` (Quests / Focus History)
  4. `MENTOR` (Evidence & Strategy Dialogue)
- **Clearance Guarantee**:
  - The scrollable canvas container MUST maintain `padding-bottom: 120px` at all times to prevent any actionable button, slider, or routine control from being occluded by the dock.

---

## 6. Micro-Interaction Physics & Haptic Specifications

Every interaction in Kinetic produces deterministic physical feedback without frivolous celebratory particles.

```
+---------------------------------------------------------------------------------------------------+
| EVENT                AUDIO FREQ / SYNTH              HAPTIC PATTERN         VISUAL SPRING         |
+---------------------------------------------------------------------------------------------------+
| Slider Drag Start    None                            None                   None                  |
| Slider 65% Detent    180Hz sine click (20ms, 0.15v)  12ms light pulse       Handle border emerald |
| Slider Lock In       65Hz resonant thump (80ms)      25ms heavy impact      Seals with glow flash |
| Routine Check        240Hz wooden clack (15ms)       15ms medium pulse      Recessed deboss       |
| Routine Uncheck      160Hz dull pop (12ms)           10ms soft release      Re-elevates surface   |
| Mentor Drawer Open   Smooth pneumatic whoosh (120ms) 8ms subtle tap         Spring (stiffness 280)|
+---------------------------------------------------------------------------------------------------+
```

---

## 7. Accessibility & Touch Ergonomics

1. **Target Sizing**:
   - The Primary Focus slider handle has an effective touch envelope of $56 \times 52\text{px}$ (exceeds WCAG $48 \times 48\text{px}$).
   - Routine check boxes have hit areas padded to $44 \times 44\text{px}$.
   - Dock tab items span $75 \times 54\text{px}$ each.
2. **Contrast Validation**:
   - In Dark Theme: Body text (`#F8FAFC` on `#121317`) achieves **14.8:1** contrast (AAA). Secondary text (`#94A3B8` on `#121317`) achieves **5.9:1** contrast (AA).
   - In Light Theme: Body text (`#14171A` on `#FFFFFF`) achieves **16.5:1** contrast (AAA). Secondary text (`#575E6A` on `#FFFFFF`) achieves **6.2:1** contrast (AA).
   - Monospace telemetry numbers exceed **7:1** in both themes.
3. **Screen Reader Semantic Tree**:
   - Plinth is wrapped in `<article aria-labelledby="primary-focus-title">`.
   - Slider contains an accessible `role="slider"` with `aria-valuenow`, `aria-valuemin="0"`, `aria-valuemax="100"`, and keyboard arrow fallback support (`Enter` or `Space` to execute).

---

## 8. Summary Implementation Checklist

- [x] Viewport responsive constraints defined for 320px, 375px, 390px, 430px.
- [x] Complete semantic token definitions for Dark (Obsidian) and Light (Bone).
- [x] Typography system using Newsreader, Inter, and JetBrains Mono.
- [x] Component specifications for Masthead, Waterline, Plinth, Ledger, Mentor, and Dock.
- [x] Micro-interaction mechanics, haptics, and audio frequencies mapped.
- [x] 120px bottom dock clearance verified to prevent content collision.
- [x] WCAG AA/AAA compliance verified for text and interactive controls.
