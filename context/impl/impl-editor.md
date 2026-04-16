---
created: "2026-04-16"
last_edited: "2026-04-16"
---
# Implementation Tracking: Editor

Build site: context/plans/build-site.md

| Task | Status | Notes |
|------|--------|-------|
| T-008 | DONE | useThemeStore: single source of truth, validation gate, updateColors/Typography/Spacing/Name |
| T-009 | DONE | 50-entry undo/redo stack, cold-load=initial state, user import=undoable; 18 tests |
| T-010 | DONE | 4 color controls (picker+hex text), error surface per slot; secondary included |
| T-011 | DONE | fontFamily select, baseSizePx range, scaleRatio range; per-field error surface |
| T-012 | DONE | baseUnitPx range, error surface |
| T-013 | DONE | Theme name text input, pre-filled, empty rejected |
| T-014 | DONE | 5 presets (Ocean, Dark, Warm, Forest, Slate), validate on apply, undoable via commitTheme |
| T-015 | DONE | Reset button → commitTheme(DEFAULT_THEME) — undoable |
| T-016 | DONE | onAdoptTheme prop passes to commitTheme; validates + errors surfaced in App |
| T-061 | DONE | App.tsx applies themeToStyleVars() CSS vars; editor accent-color uses var(--color-primary) |
