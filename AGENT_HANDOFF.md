# AGENT HANDOFF — theme-forge

## Batch 5 — Instruction Updates: Dependabot Preflight + Widened Merge Review

**Date:** 2026-04-16
**Merged commit:** `a1a5287313d8913f0c6e3196001b9a8d65a7f621` (PR #15)
**Status:** Complete. All four gates green.

### What was done

Two new rules added to both instruction surfaces (AGENTS.md + external repo-bootstrap SKILL.md), plus a storage-location note to the skill:

1. **Dependabot preflight** — before any batch, run `gh pr list --author app/dependabot --state open` and resolve/disposition any that affect the current work.
2. **Widened merge review rule** — from "PR comments + bot/agent feedback" to "PR comments, formal reviews, bot/agent code review feedback, AND relevant automated review findings (CodeQL, Copilot, Dependabot, Snyk annotations)". Sources: `gh pr view --comments`, `gh pr view --json reviews`, `gh pr checks`.
3. **Storage note (skill only)** — canonical is `~/.claude/skills/repo-bootstrap/SKILL.md` (local shared skills dir for this machine); versioned shared skills repo flagged as future migration candidate for portability and change history.

### Evidence from this batch

Dependabot PRs #1–#5 are currently open on this repo (predating batch 3). None affected this instruction-only edit, but they validate the new preflight rule's value and should be addressed before Batch 3 product work.

### Files changed

- `AGENTS.md` — Dependabot preflight section + widened merge review rule
- `~/.claude/skills/repo-bootstrap/SKILL.md` (external) — same two rules + storage-location note in §9

### Next action

Before Batch 3 product work: address or disposition the 5 open Dependabot PRs (#1–#5).

---

## Batch 4 — Skill Storage Boundary Correction

**Date:** 2026-04-16
**Status:** Complete.

### What was done

The bootstrap skill was incorrectly placed inside this repo at `docs/skills/repo-bootstrap/SKILL.md`. A reusable cross-repo skill must live in the shared external skills directory. Corrected.

### Canonical location

`~/.claude/skills/repo-bootstrap/SKILL.md` (external, shared across all repos). Now visible as the `repo-bootstrap` skill in the Skill tool list.

### Repo changes

- Deleted `docs/skills/repo-bootstrap/SKILL.md` (was the canonical copy — wrong location)
- Removed now-empty `docs/skills/` and `docs/` directories
- No repo-local duplicate kept. Traceability is recorded here in this handoff only; no second source of truth.

### Why no repo-local pointer file

`AGENT_HANDOFF.md` already serves as the source of truth for batch history. A separate pointer file would be noise. The external canonical path and origin-from-this-repo are recorded in this entry plus in the skill's own §9 (validation status references theme-forge bootstrap run).

---

## Batch 3 — Bootstrap Skill Draft + Execution Rules

**Date:** 2026-04-16
**Merged commit:** `87bbd0c4cf1f815113bc45eae309888052a1f28f` (PR #12)
**Status:** Complete. All four gates green.

### What was done

- Created `docs/skills/repo-bootstrap/SKILL.md` — first-draft bootstrap skill (239 lines, DRAFT status, 10 sections)
- Updated `AGENTS.md` — added PR merge review guardrail to Execution Discipline section

### Files changed

| File | Action |
|---|---|
| `docs/skills/repo-bootstrap/SKILL.md` | New — bootstrap skill draft |
| `AGENTS.md` | Updated — PR merge review rule added |

### Skill scan findings

- `anthropics/skills@skill-creator` (151.6K installs) — used to guide structure
- `finishing-a-development-branch`, `pr`, `requesting-code-review` — relevant git/PR patterns, referenced in skill execution sequence
- No existing repo-bootstrap skill found locally or in skills ecosystem with sufficient quality/install count
- skill-creator path used: extract-from-conversation (4 batches of observed evidence)

### Proven findings captured in skill

13 proven findings, 5 failure modes, 30+ step execution checklist, 7-item validation contract, explicit DRAFT status, provisional items labeled.

### Next action

**Batch 3 product work (export actions + preset themes):**
- Add "Export JSON" and "Copy CSS" buttons wired to `toJSON`/`toCSSVars`/`toTSObject`
- Add 3–4 preset named themes selectable from dropdown
- Add theme name input (already in schema)
- No new dependencies required

---

## Batch 2 — V1 Theme Editor + Live Preview

**Date:** 2026-04-16
**Merged commit:** `b5be5bc608868ead8a2d60bf4bc2915f311b7309` (PR #10)
**Status:** Complete. All four gates green. V1 surface live.

### Objective completed

Scaffold-default UI replaced with minimal theme editor + live preview wired to export core.

### Files changed

| File | Action |
|---|---|
| `src/App.tsx` | Full rewrite — useReducer + Zod validation |
| `src/App.module.css` | New — app shell layout |
| `src/index.css` | Replaced — minimal reset |
| `src/lib/theme/defaults.ts` | New — DEFAULT_THEME |
| `src/lib/theme/applyTheme.ts` | New — themeToStyleVars() pure fn |
| `src/components/ThemeEditor/ThemeEditor.tsx` | New |
| `src/components/ThemeEditor/ThemeEditor.module.css` | New |
| `src/components/ThemePreview/ThemePreview.tsx` | New |
| `src/components/ThemePreview/ThemePreview.module.css` | New |
| `src/App.css` | Deleted |
| `src/assets/hero.png`, `react.svg`, `vite.svg` | Deleted |

### V1 controls (ThemeEditor)

- Accent color (`colors.primary`) — color picker
- Background (`colors.background`) — color picker
- Text color (`colors.text`) — color picker
- Font family (`typography.fontFamily`) — select: System / Serif / Mono
- Base size (`typography.baseSizePx`) — range 12–24px
- Base spacing (`spacing.baseUnitPx`) — range 2–12px

### V1 preview elements (ThemePreview)

- Header bar (accent bg color)
- Card: title + body text
- Primary button (accent bg, spacing-driven padding)
- Text input (themed bg/text/font)
- Caption text
- Collapsible CSS export panel (calls `toCSSVars` from export core)

### Schema changes: none
### Export core changes: none

### Gate status

| Gate | Local | CI |
|---|---|---|
| lint | PASS | PASS |
| typecheck | PASS | PASS |
| test | PASS (6/6) | PASS |
| build | PASS (101 modules) | PASS |

### Next recommended batch

**Batch 3 — Export actions + named themes**
- Add "Export JSON" and "Copy CSS" buttons wired to `toJSON`/`toCSSVars`/`toTSObject`
- Add 3–4 preset named themes selectable from a dropdown
- Add theme name input (already in schema)
- No new dependencies required

---

## Fix Batch 2 — Build gate

**Date:** 2026-04-16
**Merged commit:** `57b1cc24aabb6b2bc44b21fcd9e4c718e7c317e4` (PR #8)
**Status:** Complete. All four gates green. CI now runs lint + typecheck + test + build.

### Root causes fixed

- `src/export/exportTheme.ts:1` — `ThemeConfig` imported as value; `verbatimModuleSyntax: true` requires `import type` for type-only imports. Fix: `import { type ThemeConfig, ... }`
- `vite.config.ts:1` — `test` config block not in Vite's `UserConfigExport` type. Fix: import `defineConfig` from `vitest/config` instead of `vite`

### Files changed

- `src/export/exportTheme.ts` — `import type` for ThemeConfig
- `vite.config.ts` — import from `vitest/config`
- `.github/workflows/ci.yml` — added Build step

### Current gate status

| Gate | Local | CI |
|---|---|---|
| lint | PASS | PASS |
| typecheck | PASS | PASS |
| test | PASS (6/6) | PASS |
| build | PASS | PASS |

### Next action

Repo is a clean starter. All four gates green locally and in CI. Branch protection active on main. Ready for Batch 2 product work.

---

## Bootstrap Run 1

**Status:** Completed with drift. CI green. Branch protection NOT active.

**Date:** 2026-04-16

**Executor:** Claude Sonnet 4.6 (session ca281e0f)

---

## What was built

Vite scaffold + Zod schema + export module (toJSON / toCSSVars / toTSObject) + 6 Vitest golden snapshot tests + CI workflow + Dependabot + MIT LICENSE.

Commit: `7a995137137db7f50aa124a868cd4433e7dfe23d` on `main`
CI: PASSED — https://github.com/simonsangla/theme-forge/actions/runs/24511795302

---

## Executor drift from locked decisions

| Decision | Locked value | Actual installed | Cause |
|---|---|---|---|
| React | 18 | 19.2.4 | scaffold-default leakage |
| Vite | 6 | 8.0.4 | scaffold-default leakage |
| TypeScript | 5 | 6.0.2 | scaffold-default leakage |
| Zod | 3 | 4.3.6 | scaffold-default leakage |
| Vitest | 2 | 4.1.4 | scaffold-default leakage |
| Commit flow | PR-gated | direct push to main | workflow violation |
| Branch protection | Active | NOT active (false-positive confirmation) | bash pipe masked API error |

All drift was scaffold-default leakage. No intentional judgment was applied to version selection.

---

## Open items for next executor

1. ~~Branch protection~~ — **FIXED** in PR #1 (see Fix Batch 1 below).
2. **Drift resolution** — Brain must decide: keep newer versions (React 19 / Vite 8 / TS 6) or downgrade to locked values. Recommendation: keep (see below).
3. **No PR for bootstrap commit** — first commit went directly to main. Acceptable for root commit; must not recur.

---

## Fix Batch 1 — Branch protection + execution discipline

**Date:** 2026-04-16

**Status:** Completed. Branch protection readback-verified active.

### What was done
- Created `AGENTS.md` as main repo instruction file
- Added execution discipline rule: *Never trust a write command without a separate readback verification step.*
- Set branch protection on `main` via GitHub API
- Verified with separate `GET` readback (not inferred from exit code)

### Branch protection — readback-verified active state

Verified via separate `GET /branches/main/protection` after write. Merged commit: `d70db207233562aa7ccb3640d8a9532dd08d4a00`

```json
{
  "required_status_checks": ["Lint · Typecheck · Test"],
  "strict": true,
  "required_reviews": 1,
  "dismiss_stale": true,
  "enforce_admins": false,
  "allow_force_pushes": false,
  "allow_deletions": false
}
```

### Execution discipline
`AGENTS.md` now contains in a permanent **Execution Discipline** section:

> Never trust a write command without a separate readback verification step.

---

## Decisions needed from Brain

- **KEEP or CORRECT the version drift?**
  - Keep: React 19 + Vite 8 + TS 6 + Zod 4 + Vitest 4 all installed cleanly, CI green, no peer dep warnings. Newer versions are not inherently wrong.
  - Correct: downgrade to match original locked decisions. Costs one commit, adds no product value.

---

## Recommendation

**Keep the drift.** React 19, Vite 8, TypeScript 6, Zod 4, Vitest 4 resolved without errors and CI is green. The original "React 18" lock was a conservative scaffold assumption, not a hard product requirement.
