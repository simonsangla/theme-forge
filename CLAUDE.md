# theme-forge — project rules

> See `context/kits/` for requirements · `context/plans/` for task dependency graphs

## Stack (locked)
- **Vite** `^8` · **React** `^19` · **TypeScript** `^6` (strict)
- **Vitest** `^4` + Testing Library (React, user-event, jest-dom)
- **Zod** `^4` — schema validation
- **Prettier** `^3` — formatting (runs alongside lint)
- **CSS Modules** + CSS custom properties for all theme tokens
- **Deploy**: Vercel (auto-deploy on push to main)

## Commands
```bash
npm run dev          # Vite dev server (HMR)
npm run lint         # ESLint
npm run typecheck    # tsc --noEmit
npm run test         # Vitest run (once)
npm run build        # tsc -b && vite build
npm run format       # prettier --write .
```

## CI gates (all must pass before merge)
`npm run lint` → `npm run typecheck` → `npm run test` → `npm run build`

## Conventions
- All theme tokens via CSS custom properties — no hardcoded hex/rgb in components
- CSS Modules only — no global class names, no inline styles
- Zod schemas live in `src/schema/` — validate all user input and export targets
- Named exports everywhere — no default exports except where framework requires
- No class components
- Write + readback: after any write, issue a distinct read to verify. Do not infer success from exit code alone.

## Key paths
```
src/                  App source (components, lib, schema, export, App.tsx)
src/schema/           Zod schemas
tests/                Vitest test files
context/kits/         Requirements kits
context/plans/        Task dependency graphs
```

## Git workflow
Branch → PR → CI (`Lint · Typecheck · Test`) → merge. Branch protection: PR + 1 review + CI pass.

## Before any PR merge, check
```bash
gh pr view <N> --comments
gh pr view <N> --json reviews
gh pr checks <N>
gh pr list --author app/dependabot --state open
```
Disposition every material finding before merge.

## Never do
- Push directly to main
- Hardcode theme values outside CSS custom properties
- Skip readback verification after write operations
- Merge with red CI or unaddressed review findings
