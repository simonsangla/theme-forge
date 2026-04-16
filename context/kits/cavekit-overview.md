---
created: "2026-04-16"
last_edited: "2026-04-16"
---

# Cavekit Overview

## Project
theme-forge — portfolio-grade visual theme editor. A static, browser-only React/TypeScript app that lets a user adjust color, typography, and spacing tokens in a sidebar, see a live preview, and export the finished theme in multiple developer-ready formats.

## Domain Index
| Domain | Cavekit File | Requirements | Status | Description |
|--------|-------------|-------------|--------|-------------|
| Schema | cavekit-schema.md | R1–R7 | Drafted | Canonical theme data model, variant pair shape, and validation surface |
| Editor | cavekit-editor.md | R1–R10 | Drafted | Interactive token controls, built-in presets, undo/redo history, active-theme state |
| Preview | cavekit-preview.md | R1–R6 | Drafted | Live canvas rendering representative UI under the active theme with light/dark variant toggle |
| Export | cavekit-export.md | R1–R11 | Drafted | Pure serialization to JSON, CSS, TS, Tailwind, SCSS, Style Dictionary; copy and download |
| Persistence | cavekit-persistence.md | R1–R7 | Drafted | Local-storage save/restore of the active theme and import from JSON string or file |

## Cross-Reference Map
| Domain A | Interacts With | Interaction Type |
|----------|---------------|-----------------|
| Editor | Schema | Consumes default theme, types, and validation |
| Preview | Schema | Consumes theme configuration and variant pair shape |
| Preview | Editor | Subscribes to active theme |
| Export | Schema | Consumes theme configuration as input to serialization |
| Export | Editor | Reads active theme on demand (read-only, no mutation) |
| Persistence | Schema | Validates records on save, restore, and import |
| Persistence | Editor | Saves active-theme changes; supplies restored or imported themes via the editor's external-adoption interface |

## Dependency Graph
```
Schema  (foundation — no dependencies)
   |
   +--> Editor       (active state, history, presets)
   |       |
   |       +--> Preview        (subscribes to active theme)
   |       +--> Export         (reads active theme)
   |       +--> Persistence    (saves active theme; supplies themes back to Editor)
   |
   +--> Preview      (also reads schema directly for variant pair shape)
   +--> Export       (also reads schema directly for serialization shape)
   +--> Persistence  (also reads schema directly for validation)
```

Implementation order:
1. Schema — must exist before any other domain can be built or tested.
2. Editor — establishes the active-theme contract that Preview, Export, and Persistence all depend on.
3. Preview, Export, Persistence — independent of one another and may be built in parallel after Editor.

## Coverage Summary
- Total domains: 5
- Total requirements: 41
- All requirements have testable acceptance criteria
- All domains have explicit Out of Scope sections
- All cross-references are bidirectional

## Changelog
- 2026-04-16: Initial overview with five drafted domains (Schema, Editor, Preview, Export, Persistence).
