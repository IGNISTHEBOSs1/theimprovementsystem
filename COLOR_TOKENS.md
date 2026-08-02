# Color Tokens

Canonical semantic color system. Every color in the product should resolve
to one of these names — never a raw hex/rgb value or a Tailwind palette
utility (`red-500`, `bg-[#...]`, etc).

Tokens are CSS custom properties defined once in `src/index.css`
(`:root, [data-accent="purple"]`), registered in `tailwind.config.ts`, and
consumed as ordinary Tailwind utilities (`bg-primary`, `text-foreground`,
`border-border`, ...).

| Semantic name | Tailwind utility | CSS variable | Notes |
|---|---|---|---|
| background | `bg-background` | `--background` | App canvas. |
| surface | `bg-card` / `bg-popover` | `--card` / `--popover` | Raised/content surfaces. Elevation itself is governed separately by the Material System (see Environmental Constitution, Phase II) — this token is color only. |
| border | `border-border` | `--border` | All dividers and outlines. |
| text | `text-foreground` | `--foreground` | Primary text. Secondary/dim text uses `text-muted-foreground`. |
| primary | `bg-primary` / `text-primary` | `--primary` | Brand/action color. Varies by `[data-accent]` theme. |
| success | `bg-success` / `text-success` | `--success` | Positive state. |
| warning | `bg-warning` / `text-warning` | `--warning` | Caution state. **Added by this pass — did not previously exist.** |
| danger | `bg-destructive` / `text-destructive` | `--destructive` | Destructive/error state. Named `destructive` in code for shadcn/ui convention continuity; `danger` is the semantic name. |

Supporting tokens that already existed and remain as-is: `secondary`,
`accent`, `muted`, `input`, `ring`, `glass`, `sidebar-*`.

## Rule

New code must not introduce a hex/rgb literal or a raw Tailwind palette
class (`red-500`, `slate-400`, etc.) for anything that represents product
UI color. If a needed semantic category doesn't exist yet, add the CSS
variable + Tailwind mapping following the pattern above — don't reach for
a one-off literal.

## Known exceptions (not touched in this pass)

Found during audit, intentionally left as-is to avoid visual regression or
component redesign outside this task's scope:

- `src/components/ui/toast.tsx` — a handful of raw `red-*` utilities on the
  destructive toast's close button (unmodified shadcn/ui boilerplate).
- `src/pages/Landing.tsx` — marketing page category colors (orange/red/
  purple/green/blue used decoratively per feature card). These are
  thematic, not status colors, and don't map cleanly onto the 8 semantic
  names without changing appearance or inventing new tokens.
- `src/components/diagnostics/DevErrorBoundary.tsx` — dev-only crash
  overlay, not a production UI surface.

These should be revisited in a follow-up pass, not patched opportunistically.
