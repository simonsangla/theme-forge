# AGENT HANDOFF — theme-forge

## Batch B-arch — Simple/Advanced color mode contract (no code)

**Date:** 2026-04-16
**Merged commit:** `0c1cbce` (PR #24)
**Status:** Complete. Architecture-only. Zero source/test/schema changes. All four gates green.

### Scope

Pure cavekit edits locking the contract for the deferred Batch B (Simple/Advanced color mode) named in the Batch A "Next recommended batch" section. Frees the next executor to implement against a frozen contract.

| File | Change |
|---|---|
| `context/kits/cavekit-editor.md` | New **R11: Color Mode (Simple / Advanced)** with 9 testable acceptance criteria. R1 annotated as mode-aware. |
| `context/kits/cavekit-persistence.md` | New **R8: Optional Color-Mode Fields on Persisted Record** (`colorMode`, `colorOverrides` — both omittable, no version bump, legacy records load as Simple with empty overrides). R6 clarified that wrapper-field additions don't bump version. |
| `context/kits/cavekit-product-boundary.md` | Changelog-only — Simple/Advanced confirmed in-scope under R1 capability "Theme design via interactive controls". R1/R2/R3/R4 text unchanged. |
| `context/kits/cavekit-overview.md` | Domain index counts updated (Editor R1–R11, Persistence R1–R8). Coverage Summary 53 → 55 reqs. New Editor→Persistence cross-ref. |

### Constraints honored

- `git diff --stat` shows exactly 4 files, all under `context/kits/`. No `src/`, `tests/`, or schema touched.
- Boundary R2 unviolated: no backend, auth, DB, CMS, routing, SSR, drag-drop, plugin system, analytics, motion, theme marketplace.
- Schema generation (PersistedRecord version) stays at 1; back-compat via optional fields + read-time defaults.
- Catalog stays at 11 widget IDs in alphabetical order.
- Out of scope (deferred to a later dedicated product batch): preset redesign, new template/theme families, "modern/smooth/funny" template aesthetics.

### Validation

| Gate | Result |
|---|---|
| Lint | 0 errors |
| Typecheck | pass |
| Test | 267/267 pass (no new tests; kit edits don't run code) |
| Build | pass (vite ~101ms; 21.39kB CSS / 295.78kB JS) |
| CI | pass (Lint · Typecheck · Test, Vercel, Vercel Preview Comments) |
| Open Dependabot PRs at preflight | none |
| Pre-merge review surface | only Vercel deployment notification — no material findings |

### Next recommended batch

**Batch B-impl — wire R11 + R8 into editor/store/persistence.** Add deterministic derivation function for Simple mode (Primary + Neutral → 9 colors per Batch A handoff rule). Add tests for derivation determinism (same Primary always yields same secondary; same Neutral always yields same neutral-derived 7 slots) and round-trip preservation (save → load preserves `colorMode` and `colorOverrides`). Stays within R1 capabilities; no new boundary revisions required.

---

## Batch A — UI hierarchy + payoff surface

**Date:** 2026-04-16
**Status:** Complete. Pure UI reorganization + visual polish. Zero schema / persistence / export-core changes. No new tests required; all 267 existing tests remain green.

### Scope

Five UI improvements, all file-isolated to `src/App.*`, `src/components/*`. Boundary preserved: still a theme + widget manifest generator.

| Area | Change | Key files |
|---|---|---|
| Left rail regroup | Identity (name + presets) → Colors → Typography → Spacing → Advanced (collapsed). Native `<details>` collapsible with matched `.summary` styling. | `ThemeEditor.tsx`, `ThemeEditor.module.css` |
| Preview frame | Added a chrome header strip ("Preview" eyebrow + theme name, outside scoped vars) and a framed canvas with 12px radius + subtle shadow. Body padding bumped 20→24px. | `ThemePreview.tsx`, `ThemePreview.module.css` |
| Widget gallery states | Dropped opacity-dim unselected pattern. Unselected = white card + neutral hairline. Hover = primary hairline + 1px lift. Selected = 2px primary ring + check-badge in top-right corner. `role="switch"` + `aria-checked` preserved. | `WidgetSelector.tsx`, `WidgetSelector.module.css` |
| Export panel payoff | Panel header (EXPORT / Ship your theme). Chip-style tabs with label + `.ext` sub-line; active tab filled primary. Per-format one-line description. Download = primary filled CTA, Copy = secondary ghost. `data-testid="export-output"` preserved. | `ExportPanel.tsx`, `ExportPanel.module.css` |
| App shell rhythm | Sidebar 280 → 300px. Topbar +4px height with hairline bottom border. Canvas gutter 24 → 28px. Import section bumped to 640px / 12px radius. | `App.module.css` |

### Constraints honored

- `ThemeConfigSchema` and all zod validators untouched.
- `src/export/*` formatters untouched.
- `src/lib/persistence/*` untouched.
- `src/lib/theme/*` untouched.
- No new component directories; Collapsible is a local helper in `ThemeEditor.tsx`.
- Simple-mode color derivation deliberately deferred to the next batch.

### Validation

| Gate | Result |
|---|---|
| Lint | 0 errors |
| Typecheck | pass |
| Test | 267/267 pass (no new tests; all existing still green) |
| Build | pass (vite ~111ms; 21.39kB CSS / 295.78kB JS) |
| Preview | verified at 1440×2400 — Advanced collapsed by default, expands on click; widget badges render; export chips + CTA render; topbar contained |

### Next recommended batch

**Batch B — 2-color Simple mode + Advanced overrides (deferred).** Ship the deterministic derivation from Primary + Neutral (secondary = primary hue-shifted +40°; background / text / muted / hairline / inkSoft / surfaceInvert / onInvert derived from neutral via fixed L values). Persist `colorMode` + per-slot `colorOverrides` as optional fields on `PersistedRecord` (no `ThemeConfigSchema` change). Advanced stays fully available; auto/override state shown per slot. Back-compat: legacy records load as Simple with empty override map.

---

## Batch 11 — Nit-pick cleanup (Batch 10 inspector findings)

**Date:** 2026-04-16
**Status:** Complete. Closes 2 P2 + 4 P3 + 2 cavekit clarifications surfaced by Batch 10 inspect.

### Scope

Eight tasks T-140..T-147 across 2 tiers, all from the Batch 10 inspector report:

| Origin | Task | Resolution |
|---|---|---|
| F-001 (P2) | T-140, T-147 | Removed dead `e.stopPropagation()` and misleading comment from variant click handler. Test reworded to credit the structural sibling separation rather than propagation suppression. |
| F-002 (P2) | T-143 | Replaced theatrical render-only assertion with a real CSS-consumption test that scans `WidgetPreview.module.css` and proves every theme color slot is referenced via `var(--token)` somewhere — catches token-drop regressions. |
| F-003 (P3) | T-144 | Replaced loose `outerHTML !== outerHTML` comparison with specific `data-variant="metric"` attribute assertion. |
| F-004 (P3) | T-145 | Split `toCSSVarsVariant` output on `:root[data-theme="dark"] {` and assert each new var appears in BOTH halves. Catches future regression where dark block omits a token. |
| F-005 (P3) | T-141 | Variant `aria-label` simplified from `"kpi-tile <v> variant"` to `"<V> variant"` (Tile variant / Metric variant) — cleaner SR announcement. |
| F-006 (P3) | T-146 | Cavekit-widgets R4 codified that variant toggle is operable regardless of selection; new test asserts toggle renders + responds when kpi-tile selection is false. |
| Cavekit-schema R8 (revised) | T-142 | New backslash-exemption acceptance criterion + 3 tests proving CSS hex escapes (`\3b` etc.) load successfully and don't break declaration boundaries (CSS Syntax Level 3 decodes inside value token after declaration parsing). |

### Cavekit revisions

- **cavekit-schema R8** — added explicit acceptance criterion: backslash is intentionally NOT in the blocklist; CSS hex escapes are decoded after declaration parsing per CSS Syntax Level 3 and cannot break the declaration boundary. Test mandate added.
- **cavekit-widgets R4** — added acceptance criterion: variant toggle renders + remains interactive regardless of kpi-tile selection state (codifies shipped behavior).

### Validation

| Gate | Result |
|---|---|
| Lint | 0 errors |
| Typecheck | pass |
| Test | 267/267 pass (261 prior + 6 new across 3 files) |
| Build | pass (vite ~99ms; 18.09kB CSS / 293kB JS) |
| CI | (pending — see PR) |

### Browser verification

- Variant toggle now reads "Tile" / "Metric" with simplified `aria-label="Tile variant"` / `"Metric variant"`
- Clicking Metric flips `aria-pressed`, switches preview `data-variant` to `metric`
- Old `aria-label="kpi-tile tile variant"` no longer present (regression check passes)

### Next recommended batch

The repo is in a notably clean state: 3 boundary-locked cavekits, 11-widget catalog, 9-color/4-shadow/5-radius token surface, full back-compat on persistence, hardened shadow-injection guard. Two non-overlapping next directions:

1. **Variant-pair authoring UI.** Schema + persistence already support `ThemeVariantPair` with shared shadows/radii. Add light/dark editor toggle and a variant-aware export selector. Closes the dark-mode export story.
2. **Accessibility audit pass.** With 9 color pickers, 4 shadow textareas, 5 radius inputs, 11 widget cards, and the new variant toggle, the editor surface has grown enough to warrant formal WCAG AA review (color contrast, keyboard nav, SR announcements). Would need a small cavekit addition to scope it — boundary R1 doesn't include accessibility explicitly.

---

## Batch 10 — Follow-up: Shadow Safety + Coverage GAPs + KPI Variant UX

**Date:** 2026-04-16
**Status:** Complete. Closes the 1 P1 + 2 GAPs surfaced by the Batch 9 inspect phase.

### Scope

Six tasks (T-130..T-135) addressing the Batch 9 inspector's REVISE verdict:

| Task | Title | Closes |
|---|---|---|
| T-130 | Tighten `cssShadow` validator: reject `;` `}` `{` `/*` `*/` newlines `<` `>` | P1 CSS injection |
| T-131 | Per-format export-emission tests for all new color/shadow/radius tokens | GAP #2 |
| T-132 | Integration tests: `toJSON` round-trip preserves shadows + radii through persistence; preset apply re-themes downstream `WidgetPreview` | GAP #1 |
| T-133 | Shadow injection regression test: 8 malicious payloads in persisted shadow values rejected as corrupt | P1 + cavekit-schema R8 (revised) |
| T-134 | kpi-tile in-card variant toggle (Tile / Metric pills, transient per-session, accessible) | T-132 P2 |
| T-135 | WidgetSelector behavior tests for the variant toggle (aria-pressed, click flips, switch isolation, single-widget scope) | T-132 P2 |

### Cavekit revisions

- **cavekit-schema R8** — clarified to mandate the character blocklist (`;` `}` `{` `/*` `*/` `\n` `\r` `<` `>`) as the explicit security contract. Rationale documented in the requirement description.
- **cavekit-widgets R4** — clarified the kpi-tile metric variant is user-selectable via an in-card toggle (transient, not persisted, not in export). Codifies that no other widget gains per-widget configuration UI.

### Implementation notes

- `cssShadow` validator now uses a single regex `[;}{<>\n\r]|\/\*|\*\/` — minimum sufficient guard; multi-layer rgba/hsla strings still accepted because the blocklist doesn't include `(` `)` or `,`.
- `WidgetSelector` gained local `kpiVariant: 'tile' | 'metric'` state; passes through to `WidgetPreview` only for kpi-tile. `e.stopPropagation()` on toggle clicks prevents the parent switch from flipping.
- `toggle` button uses `aria-pressed` (not `aria-checked`) since it's a toggle button, not a switch.
- Shadow injection tests cover 8 distinct payloads (semicolon escape, brace open/close, comment open/close, newline, angle brackets) — each asserts `loadTheme` returns `corrupt` status.

### Validation

| Gate | Result |
|---|---|
| Lint | 0 errors |
| Typecheck | pass |
| Test | 261/261 (220 prior + 41 new) |
| Build | pass (vite ~107ms; 18.09kB CSS / 293kB JS) |
| CI | (pending — see PR) |

### Browser verification

- Tile / Metric pill toggle visible below the kpi-tile card
- Default state: Tile pressed (filled with primary color), Metric outlined
- Click Metric → toggle flips, kpi-tile preview switches to top-hairline serif "1,284" / "ACTIVE USERS" rendering
- Switch role="switch" on the kpi-tile card itself NOT toggled by variant clicks (event isolation working)

### Next recommended batch

Two viable directions (pick one):

1. **Accessibility audit pass.** The 11 widget previews and editor controls have grown — formal WCAG AA review (color contrast against actual theme tokens, keyboard navigation through 9 color pickers + 4 shadow textareas + 5 radius inputs + 11 widget cards + variant toggle, screen-reader announcements). Boundary R1 doesn't include accessibility explicitly; would need a small cavekit addition to scope it.
2. **Variant-pair authoring UI.** Schema + persistence already support `ThemeVariantPair` with shared shadows/radii. Only the light/dark editor surface and a variant-aware export selector are missing. Closes the dark-mode export story.

---

## Batch 9 — Boundary Revision: Token Surface + Catalog Expansion

**Date:** 2026-04-16
**Status:** Complete. Boundary cavekit locks scope; schema gains 5 color slots + shadow group + radius group; widget catalog grows 8 → 11.

### Scope

Single coherent batch implementing the boundary-revision recommendation: lock the product surface as "theme + widget manifest generator" via a new `cavekit-product-boundary.md`, backfill the missing `cavekit-widgets.md`, and extend the schema + widget catalog with the cavekit-approved additions (5 color slots, 4 shadows, 5 radii, 3 new widget IDs, kpi-tile metric variant).

### Domain additions

| Cavekit | New | Notes |
|---|---|---|
| `cavekit-product-boundary.md` | 4 reqs | R1 in-scope, R2 hard-wall denials, R3 frozen 11-widget catalog, R4 cross-cutting purity invariants |
| `cavekit-widgets.md` | 6 reqs | Backfills shipped widget-builder + previews + extends catalog to 11 IDs |
| `cavekit-schema.md` (edited) | R1 expanded; R8 + R9 added | Color group → 9 slots; new shadow + radius groups; R4/R5/R7 updated to compose them |
| `cavekit-overview.md` (edited) | 7 domains, 53 reqs | Cross-ref map + dependency graph updated |

### Implementation deltas (29 tasks T-100..T-129, all DONE)

**Schema (T-100..T-110):**
- ColorTokenSchema: 4 → 9 slots (added muted, hairline, inkSoft, surfaceInvert, onInvert)
- ShadowTokenSchema: 4 named CSS box-shadow strings (primary/secondary/card/float)
- RadiusTokenSchema: 5 numeric pixel values with sm<=md<=lg<=xl ascending rule
- ThemeConfigSchema, ThemeVariantPair: compose new groups + share-equality validation
- DEFAULT_THEME: full 9 colors, 4 shadows, 5 radii (values from portfolio/DESIGN.md §2/§5/§6)
- Widget catalog: WIDGET_IDS 8 → 11 (added badge, pricing-card, testimonial alphabetically)
- Persistence: legacy 4-color records load with patched defaults; legacy 8-widget selections load with 3 new keys patched to false (read back-compat)

**Exports (T-111..T-116):** every export function emits the new tokens
- CSS Vars: --color-muted, --color-hairline, --color-ink-soft, --color-surface-invert, --color-on-invert; --shadow-* (4); --radius-* (5)
- SCSS Vars: $color-* (5 new) + $shadow-* (4) + $radius-* (5)
- Tailwind: theme.extend.colors gains 5 keys; new theme.extend.boxShadow + borderRadius
- Style Dictionary: shadow group (type 'boxShadow') + radius group (type 'dimension')
- JSON / TS: nested colors/shadows/radii surface naturally via the schema-extended object
- Back-compat preserved: omitting widgets argument yields prior output exactly

**Widget UI (T-117..T-122):**
- WidgetSelector: 11 toggles (auto-grew with catalog)
- WidgetPreview: 4 new arms (badge, pricing-card, testimonial, kpi-tile metric variant)
- kpi-tile gains optional `variant?: 'tile' | 'metric'` prop — metric uses top-hairline + serif numeric + uppercase tracked label per portfolio/DESIGN.md §4.10/§6

**Editor (T-123..T-126):**
- Store actions: updateShadows, updateRadii (validated, undoable, partial)
- 5 new color pickers with per-field error surface
- Shadow editor: 4 monospaced textareas
- Radius editor: 5 number inputs with per-field error

**Wiring (T-127..T-129):**
- themeToStyleVars: emits all new --color-*, --shadow-*, --radius- vars
- App passes new store actions through to ThemeEditor; preview chrome inherits

### Untouched (no drift)

- Editor presets — existing presets gained the 5 new color slots + inherit shadow/radius defaults, list of 6 presets (Ocean, Dark, Warm, Forest, Slate, Pays Basque) preserved
- Public API of WidgetSelector unchanged (still `selection` + `onChange`)
- Persistence record version stays at 1 — read back-compat via missing-field patch, no migration needed
- The 31-test widgets test suite from PR #18 stays green
- Build-site.md primary file untouched (T-001..T-061 stays as historical truth)

### Validation

| Gate | Result |
|---|---|
| Lint | 0 errors |
| Typecheck | pass |
| Test | 220/220 pass (157 prior fixed + 63 new schema/persistence/widget coverage) |
| Build | pass (vite ~108ms, 17.47kB CSS / 292kB JS) |
| CI | (pending — see PR) |
| Open Dependabot PRs at preflight | none |

### Browser verification

- 9-slot color editor + Shadow section + Radii section all rendered live
- 11 themed preview cards with Pays Basque / Dark / Slate presets re-theming all of them within the same render cycle
- JSON export shows the 5 new color slots in `colors`, plus widgets array reflecting selection
- All persisted records (legacy + modern) round-trip without loss

### Boundary cavekit content (R3 frozen catalog reference)

Catalog: badge, button, card, empty-state, input, kpi-tile, modal, navbar, pricing-card, table, testimonial.
Adding/removing/renaming any ID requires a dedicated boundary-revision PR.

### Next recommended batch

Two viable next directions (pick one — do not stack):

1. **Variant-pair authoring UI.** The schema already supports `ThemeVariantPair` with shared shadows/radii (batch 9 extension); only a light/dark editor toggle and variant-aware export selection are missing. Closes the dark-mode export story.
2. **Per-widget mini-config slot.** Tightly bounded: e.g., button shape (square/pill via radius token), table density, navbar position. Requires a small per-widget config schema plus minor export-shape extension. Boundary R2 currently denies "open-ended widget schema" — a per-widget config would need an explicit boundary R2 amendment.

---

## Batch 8 — Widget Preview Cards (Primary Selector Surface)

**Date:** 2026-04-16
**Status:** Complete. Widget catalog now selected via themed preview cards instead of text checkboxes.

### Scope

Narrow correction batch on top of PR #18 (widget-builder). Replaced the text-only checkbox grid in `WidgetSelector` with clickable preview cards. Each card is a `<button role="switch">` containing a small read-only mini-rendering of its widget (button, card, empty-state, input, kpi-tile, modal, navbar, table). Cards inherit theme tokens via CSS custom properties, so swapping the active theme (or applying a preset) re-themes all 8 previews live. Cards visually reflect selection (full opacity + accent ring when selected; dimmed when not). The `Select all` / `Clear` bulk actions and the `N/8 selected` count are retained.

### Disposition

| Change | File(s) |
|---|---|
| New: read-only widget mini-rendering | `src/components/WidgetSelector/WidgetPreview.tsx`, `WidgetPreview.module.css` |
| Modified: WidgetSelector now uses card toggles | `src/components/WidgetSelector/WidgetSelector.tsx`, `WidgetSelector.module.css` |
| New: behavior + export-linkage tests | `tests/components/WidgetSelector.test.tsx` (8 tests) |
| Carry-forward: `.vercel` to gitignore | `.gitignore` |

### Untouched (no drift)

- `src/schema/widgets.ts` — manifest model unchanged
- `src/export/exportTheme.ts` — pure / Node-safe / unchanged
- `src/lib/persistence/` — no record-shape change
- `src/App.tsx` — already provides themed CSS-var context
- The 31-test widget suite from PR #18 stays untouched and passing

### Validation

| Gate | Result |
|---|---|
| Lint | 0 errors |
| Typecheck | pass |
| Test | 153/153 pass (145 prior + 8 new behavior/linkage) |
| Build | pass (vite, ~97ms) |
| CI | (pending — see PR) |
| Open Dependabot PRs at preflight | none (`gh pr list --author app/dependabot --state open` empty) |

### Key UX guarantees verified in browser preview

- 8 themed preview cards render with the active theme (Pays Basque red/green/cream confirmed visually)
- Toggling preset → all 8 previews re-theme instantly (no toggle on widgets needed)
- Click card → `aria-checked` flips, card opacity flips, JSON export `widgets` array updates within the same tick
- `Select all` / `Clear` toggle every card; topbar `N widgets in export` badge stays in sync

### Next recommended batch

Two viable next-step candidates (pick one — do not stack):

1. **Variant-pair authoring UI.** Schema (`ThemeVariantPairSchema`) and persistence-record extension already exist; only a light/dark editor surface and a variant-aware selector in `ExportPanel` are missing. Would close out the "dark-mode export" story.
2. **Per-widget mini-config slot.** Tightly bounded — e.g. button shape (square/pill), table density (compact/regular), navbar position (top/side). Would require a small widget-config schema slice and minor export-shape extension. Only do this if user genuinely wants more design surface; current bounded model is the right default.

---

## Batch 6 — Dependabot Triage (PRs #1–#5)

**Date:** 2026-04-16
**Status:** Complete. Repo baseline cleared.

### Disposition

| PR | Title | Disposition | Reason |
|---|---|---|---|
| #1 | `@eslint/js` 9→10 | CLOSED (deferred) | ESLint 10 requires coordinated ecosystem upgrade; breaks typescript-eslint + plugins peer deps. Not a single-PR bump. |
| #2 | `actions/setup-node` v4→v6.3.0 | MERGED | Clean SHA pin update, CI pass |
| #3 | `actions/checkout` v4→v6.0.2 | MERGED (manual rebase in this PR) | Conflicted with #2 on same file; manually applied |
| #4 | `eslint` 9→10 | CLOSED (deferred) | Same ecosystem issue as #1 |
| #5 | `@types/node` v24→v25 | MERGED | Clean dev-type bump, CI pass |

### Follow-up needed

ESLint 10 ecosystem upgrade is a dedicated batch. Wait for `typescript-eslint`, `eslint-plugin-react-hooks`, `eslint-plugin-react-refresh` to publish eslint@10-compatible versions before retrying #1/#4 equivalents.

### Next recommended batch

Batch 3 product work: export actions (Copy CSS/JSON buttons) + preset named themes + theme name input. Repo baseline is now clean — all 5 Dependabot PRs dispositioned.

---

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
