# theme-forge — Agent Operating Instructions

This file is the main operating instruction file for all AI agents working in this repository.

---

## Execution Discipline

**Never trust a write command without a separate readback verification step.**

After any write operation (API call, file write, config change, branch protection update, etc.),
issue a distinct read call and report the actual observed state. Do not infer success from exit
code alone. Do not use silent pipes or fallback echo hacks that mask API errors.

Examples:
- After `PUT /branches/main/protection` → call `GET /branches/main/protection` and report the response.
- After writing a file → read it back and confirm expected content is present.
- After a git push → verify remote state with `git ls-remote` or equivalent.

---

## Git Workflow

- Never push directly to `main`.
- All changes via branch → PR → CI → merge.
- Branch protection on `main` requires: PR + 1 review + CI pass (`Lint · Typecheck · Test`).
- Commit and sync to main via PR after every narrow loop.

## Test Gates

Run before every commit: `npm run lint && npm run typecheck && npm run test`.

## Stack (Bootstrap Run 1)

- Vite 8 / React 19 / TypeScript 6 / Zod 4 / Vitest 4
- CSS Modules + CSS custom properties for theme tokens
- Export target: browser-only
