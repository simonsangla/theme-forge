---
name: repo-bootstrap
description: >
  Deterministic execution checklist for bootstrapping a fresh or near-empty public GitHub repo.
  Use this skill whenever starting a new project repo, stabilizing an empty scaffold, or
  securing a GitHub public repo baseline (branch protection, Dependabot, CI, LICENSE).
  Trigger on: "bootstrap a repo", "set up a new repo", "initialize a project",
  "set up GitHub Actions", "secure a new codebase", "start a fresh project".
  Do NOT use for repos with significant existing history or active production traffic.
validation_status: DRAFT — grounded in one bootstrap run (theme-forge). Not yet validated across multiple repo types.
---

# repo-bootstrap

Deterministic bootstrap skill for fresh or near-empty GitHub repos.

**Draft status:** Grounded in theme-forge bootstrap run 1 + 3 stabilization batches (2026-04-16).
Provisional items are marked `[PROVISIONAL]`. Do not promote to general skill without ≥2 additional repo runs.

---

## 1. Purpose

**For:** Starting a fresh repo that needs a secure, minimal, structurally correct baseline — scaffold,
security hygiene, CI, branch protection — before any product work begins.

**Not for:**
- Repos with existing significant code or commit history
- Repos requiring backend, auth, DB, or cloud infra at bootstrap
- Adding CI/CD to an existing project (different problem)
- Repos where stack is already locked by a framework or org standard

---

## 2. Trigger Conditions

**Use when:**
- Repo is empty or contains only a root-commit scaffold
- Repo is newly created on GitHub with no CI, no branch protection, no LICENSE
- Stabilizing a scaffold that was seeded by a scaffolding tool (e.g. `npm create vite`)
- Public GitHub repo baseline is required (LICENSE + Dependabot + Actions security)

**Do not use when:**
- Repo has >5 commits of real product work
- Stack is already locked by org infra
- Branch protection is already configured and verified

---

## 3. Inputs

Required before executing:

| Input | Notes |
|---|---|
| Repo path (local) | Verify with `git remote -v` |
| Repo visibility | Public enables branch protection on free plan |
| Stack choice | Or defer to architecture gate (see §5) |
| Product type | Frontend app / CLI / library / service — affects export contract |
| Solo vs team | Affects required approving review count |
| Branch protection available | Requires public repo or GitHub Pro |

---

## 4. Proven Findings

Observed in theme-forge run. All items are **proven** unless marked `[PROVISIONAL]`.

### Execution discipline
- **Reuse-first before reinvention.** Scan for existing bootstrap assets, handoff files, and skill templates before writing anything from scratch.
- **Official docs before community sources.** Use `docs.github.com` for Actions permissions, Dependabot syntax, branch protection API. Community sources are for edge cases and failure modes only.
- **Architecture gate before implementation.** Answer export contract, schema validation, preview isolation, state management, and test strategy questions before writing any code.
- **Smallest valid secure move only.** No speculative features, no overbuild.
- **Never trust a write command without separate readback.** After any API write, issue a distinct read and report actual observed state. Do not infer success from exit code alone. Do not use silent-fail pipes.
- **Before merging a PR, review PR page comments and bot/agent feedback.** Address or explicitly disposition before merge.

### Security baseline
- **Public repo requires MIT LICENSE in first commit.** Absence = all-rights-reserved by default.
- **Dependabot for `npm` + `github-actions` ecosystems, `weekly` cadence.** File: `.github/dependabot.yml`.
- **GitHub Actions: `permissions: contents: read` at workflow level.** Overrides permissive org defaults.
- **Pin actions to full commit SHA** (`actions/checkout@<sha>`). Tag pinning is weaker; Dependabot can be configured to update SHA pins.
- **Branch protection requires public repo or GitHub Pro on free plan.** Private free plan returns `403`. Set protection immediately after first push.

### CI
- **Build must be a CI gate, not just lint/typecheck/test.** Pre-existing build errors (TypeScript, config types) survive lint and typecheck but fail `tsc -b`. Discovered only when build runs in CI.
- **Add all four gates: lint + typecheck + test + build.** `tsc --noEmit` (typecheck) and `tsc -b` (build) are different; `noEmit` does not catch all build errors.

### Git workflow
- **Root commit is a one-time exception for direct push to main.** Branch protection cannot exist before the first commit. Immediately set protection after push; no exceptions after that.
- **Branch → PR → CI → merge only.** Never push directly to main after root commit.
- **Update handoff after every meaningful batch.** Include: what was built, exact files changed, gate status, next action.

### Scaffold leakage risk
- **Scaffolding tools (`npm create vite`, etc.) override locked version decisions.** Explicit version locking must be enforced after scaffold, not assumed. Check `package.json` immediately after scaffold and pin if needed.
- **`verbatimModuleSyntax: true` (TypeScript) requires `import type` for type-only imports.** Vite + TypeScript 6 defaults include this. Missed imports fail `tsc -b` but not `tsc --noEmit`.
- **`vitest/config` must be used for `defineConfig` when test block is in `vite.config.ts`.** Importing from `vite` instead causes type error TS2769 in build mode.

### Export core
- **Export functions (JSON, CSS vars, TS object) must remain Node-safe.** No browser APIs in lib layer. CSS var injection belongs in UI layer only.
- **Zod is the correct V1 schema validation choice** for small constrained domains. Single schema = runtime validation + TypeScript types. No separate type maintenance burden.

---

## 5. Failure Modes Observed

| Class | Description |
|---|---|
| Scaffold-default leakage | `npm create vite` installed React 19/Vite 8/TS 6 when React 18/Vite 6/TS 5 were declared as locked defaults. Not caught until package.json inspection. |
| False positive from silent-fail pipe | `cmd \| python3 -c ... 2>/dev/null \|\| echo "success"` masked a 403 API error and printed "protection set". Branch protection was NOT active. |
| Build not in CI | lint + typecheck + test all passed; `tsc -b` build errors (TS1484, TS2769) existed for 3 batches before being caught. |
| Direct push to main | Bootstrap root commit pushed directly to main before branch protection existed. Workflow violation; acceptable only for root commit; documented in handoff. |
| Success claimed without readback | Branch protection write appeared to succeed (exit 0) but separate GET readback revealed `404 Branch not protected`. |

---

## 6. Execution Sequence

Deterministic checklist for a bootstrap batch.

### Preflight
- [ ] Verify local repo path matches intended repo
- [ ] `git status` — confirm clean or document untracked files
- [ ] `git remote -v` — confirm remote URL
- [ ] `gh auth status` — confirm CLI auth and scopes (`repo`, `workflow`)
- [ ] `gh api repos/<owner>/<repo>/branches/main/protection` — readback current protection state

### Reuse scan
- [ ] Check for existing bootstrap assets: handoff files, skill templates, `ck-init`, CLAUDE.md
- [ ] Check skills ecosystem: `npx skills find "repo bootstrap"`
- [ ] Explicitly document: what was found vs what is missing

### Official-doc check
- [ ] Verify Dependabot `dependabot.yml` syntax at `docs.github.com`
- [ ] Verify GitHub Actions least-privilege `permissions` syntax
- [ ] Verify action SHA pinning recommendation
- [ ] Verify branch protection API fields for chosen plan (free/Pro/public)
- [ ] Document: verified / unverified / blocked

### Architecture / stack gate
- [ ] Answer export contract: what formats, why
- [ ] Answer schema validation: which library, why
- [ ] Answer preview isolation: direct / iframe / shadow DOM, why
- [ ] Answer state management: local state / reducer / store, why
- [ ] Answer determinism test strategy: golden snapshots vs UI tests

### Implement
- [ ] Scaffold with `npm create vite` or equivalent
- [ ] **Immediately verify versions** in `package.json` against any locked decisions
- [ ] Install additional deps
- [ ] Write security baseline files: `LICENSE`, `.github/dependabot.yml`, `.github/workflows/ci.yml`
- [ ] Write stub schema + golden snapshot tests
- [ ] Stage specific files only (no `git add -A`)

### Validate all gates
- [ ] `npm run lint` — must pass
- [ ] `npm run typecheck` (`tsc --noEmit`) — must pass
- [ ] `npm run test` — must pass
- [ ] `npm run build` (`tsc -b && vite build`) — must pass
- [ ] All four gates in CI workflow

### PR
- [ ] Create branch (not main)
- [ ] Commit with conventional message
- [ ] Push branch
- [ ] `gh pr create`
- [ ] Record PR link

### Review comments / bot feedback
- [ ] `gh pr view <number> --comments` — check for bot/agent comments
- [ ] `gh pr reviews` — check review decisions
- [ ] Address or explicitly disposition each finding before merge

### Merge
- [ ] CI passes (all four gates)
- [ ] `gh pr merge --squash --admin` (admin bypass if solo repo + enforce_admins: false)
- [ ] `git checkout main && git pull origin main`
- [ ] `git log --oneline -3` — confirm HEAD is merge commit

### Post-merge readbacks
- [ ] If branch protection was written: `gh api repos/<owner>/<repo>/branches/main/protection` — confirm active
- [ ] `git status` — confirm clean

### Handoff update
- [ ] Update `AGENT_HANDOFF.md` with: what was built, files changed, gate status, next action
- [ ] Commit handoff update via PR (not direct push)

---

## 7. Validation Contract

Minimum required before any merge:

| Gate | Tool | Notes |
|---|---|---|
| lint | `npm run lint` | ESLint flat config |
| typecheck | `npm run typecheck` | `tsc --noEmit` only |
| test | `npm run test` | Vitest, golden snapshots for export fns |
| build | `npm run build` | `tsc -b && vite build` — catches what typecheck misses |
| CI green | `gh pr checks --watch` | All four gates must run in CI, not just locally |
| Branch protection | GET readback after PUT | Never infer from exit code |

---

## 8. Boundaries

This skill must NOT:

- Add backend, auth, database, CMS, or cloud infra unless explicitly requested
- Add deployment config (Vercel, Netlify, Docker) at bootstrap
- Start product feature work before security baseline is committed
- Perform broad code refactors during stabilization batches
- Claim generalization from one bootstrap run [PROVISIONAL until ≥3 runs]
- Use `git add -A` or `git add .` (risk of committing secrets or binaries)

---

## 9. Validation Status

**Status: DRAFT — constrained, not generalized**

- Grounded in: theme-forge bootstrap run 1 + 3 stabilization batches (2026-04-16)
- Stack observed: Vite 8 / React 19 / TypeScript 6 / Zod 4 / Vitest 4
- Repo type: public solo GitHub repo, frontend app
- PRs observed: #1–#11 (root commit through Batch 2 product work)
- Failure modes observed: 5 (documented in §5)

Items marked `[PROVISIONAL]` have not been validated across additional repo types. Do not promote
to a global installable skill without at least 2 additional bootstrap runs on different repo types.

---

## 10. Next Validation Recommendation

To promote this draft to a general skill, validate against:

1. **Library/package repo** — different export contract (npm package vs app), no preview, publish step needed, different CI shape
2. **Backend/API service repo** — Python or Go, different scaffold tool, different test strategy, different branch protection needs, possible Docker or DB in CI

After each run, update §4 (findings), §5 (failure modes), and §9 (validation status).
