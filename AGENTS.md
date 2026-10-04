# Agent Rules — The Improvement System

Read this before making any change. These aren't style preferences — the
two sections below exist because both already happened in this repo.

## 1. Never commit a secret. Ever. No exceptions.

`scripts/vp0.mjs` shipped with a live API key hardcoded as a fallback
literal:
```js
const API_KEY = process.env.VP0_API_KEY || "vp0_9c645a0e_...";
```
That key was live, in a public GitHub repo, readable by anyone,
indexed by automated secret-scanners, for as long as it took a human to
notice. It has since been rotated, but it should never have been
possible to write that line in the first place.

**The rule, with no exceptions:** a secret — API key, token, password,
connection string, anything that grants access to something — is never
written as a literal string in any file that gets committed. Not as a
"temporary" value, not as a fallback, not as an example, not even in a
comment. If code needs a secret, it reads it from an environment
variable (`process.env.X`) with NO hardcoded fallback value. If the
variable isn't set, the code should fail loudly (throw, refuse to run)
— never silently fall back to a string that happens to work.

Before every commit, mentally check every new literal string that looks
like a key, token, or credential (long random-looking strings, anything
starting with a recognizable prefix like `sk-`, `vp0_`, `pk_`, etc.).
If you're not sure whether something is a secret, treat it as one.

**Why this matters more than almost anything else in this repo:** a bad
UI decision is reversible — someone notices, it gets fixed, nothing was
lost. A leaked secret is not reversible the same way. Once it's
committed and pushed, it may already be scraped, cached, or indexed
before anyone catches it, and rotating it after the fact only stops
*future* damage, not whatever already happened in the window before
anyone noticed. Treat every secret with that asymmetry in mind: the
cost of being paranoid about this is a few extra seconds of care; the
cost of being wrong once is not undoable.

## 2. Do not expand scope beyond what was asked.

A full native Flutter mobile app (`mobile/` — ~1,300 lines, a parallel
codebase in a different language and framework) was added to this repo
without being requested in any task. So was `.agents/mcp_config.json`
(a NotebookLM MCP server config) and `scripts/vp0.mjs` itself — none of
these were asked for.

**The rule:** every task comes with an explicit scope — specific files,
specific changes, usually with a "DO NOT touch" list. Stay inside it.
If something outside that scope seems worth doing — a new tool, a new
platform, a helper script, a dependency, anything not explicitly
requested — do not build it. Instead, stop and describe what you think
is worth doing and why, and wait for an explicit yes before writing any
of it. This applies even if you're confident it's a good idea. Being
right about the idea doesn't change whether it was authorized.

If a task's own instructions don't cover something you're about to do,
that's the signal to ask, not the signal that you have discretion.

## 3. When in doubt, report — don't decide

Both of the above failures share one root cause: an assumption that
"this seems like a good idea" was enough reason to act. It isn't. If a
verification step asks you to report something (a schema mismatch, a
leftover TODO, an unexpected file), report it plainly rather than
quietly fixing or working around it. The person you're working for
decides what happens next — that's not a formality, it's the actual
point of asking.

## 4. The Improvement System (TIS) Visual Language & Brand Invariants

- **Neoskeuomorphism over Flatness**: Use tactile depth, specular highlights (`inset 0 1px 1px 0 rgba(...)` on top edges), and liquid frosted glass (`backdrop-blur-xl`, saturation boost) for elevated cards and navigation docks. Every interactive element must provide a tangible press/hover state (`active:scale-[0.98]`).
- **Intentional Minimalism & 3-Second Clarity**: Strip noise, never character. The app must communicate its purpose in under 3 seconds using 6th-grade clarity (except core branding terms):
  1. Deep Obsidian + Emerald kinetic contrast.
  2. The signature ±10% mathematical buffer cone.
  3. Strict constraint: 1 Primary Focus + 2 Routines.
  4. Local-first encrypted browser storage.
- **No RPG Gamification**: Never introduce hunter ranks, XP bars, or fantasy game tropes. Frame user growth as deterministic personal trajectory and quiet mathematical velocity.
- **Side-by-Side Comparative Clarity**: When contrasting TIS with conventional streak apps, use clean side-by-side matrices with responsive segmented controls, never ambiguous sliders.
- **Story-Driven Motion**: Motion must do real work (guiding the eye, recalculating velocity curves, demonstrating buffer resilience). If the user notices the animation before the product, the motion is too loud.

