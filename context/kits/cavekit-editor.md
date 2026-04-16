---
created: "2026-04-16"
last_edited: "2026-04-16"
---

# Cavekit: Editor

## Scope
The interactive control surface where the user adjusts theme tokens. Covers the sidebar of token controls, the preset picker for built-in starter themes, and the undo/redo history stack. Owns the in-memory editing state and emits validated theme changes to the rest of the app.

## Requirements

### R1: Color Token Controls
**Description:** The editor must expose one editable control per color slot defined by the schema. Each control must allow the user to set a valid hex color and reflect the current value. Control rendering is mode-aware per R11 (Simple shows 2 controls; Advanced shows all 9).
**Acceptance Criteria:**
- [ ] One control is rendered for each color slot in the active theme
- [ ] Each control is labeled with the slot name in human-readable form
- [ ] Each control's displayed value matches the current theme's value for that slot
- [ ] Submitting a valid hex color updates the active theme to that value
- [ ] Submitting an invalid color value is rejected without mutating the active theme and surfaces a visible error message bound to that control
**Dependencies:** cavekit-schema.md R1, R6

### R2: Typography Controls
**Description:** The editor must expose controls for font family, base size, and scale ratio bound to the typography token group.
**Acceptance Criteria:**
- [ ] A font family control accepts a string and updates the active theme on commit
- [ ] A base size control accepts a numeric value, enforces the schema's allowed range at the input boundary, and updates the active theme on commit
- [ ] A scale ratio control accepts a numeric value, enforces the schema's allowed range at the input boundary, and updates the active theme on commit
- [ ] Out-of-range or non-numeric input is rejected without mutating the active theme and surfaces a visible error message bound to the offending control
**Dependencies:** cavekit-schema.md R2, R6

### R3: Spacing Controls
**Description:** The editor must expose a control for the base spacing unit bound to the spacing token group.
**Acceptance Criteria:**
- [ ] A base unit control accepts a numeric value and updates the active theme on commit
- [ ] Out-of-range or non-numeric input is rejected without mutating the active theme and surfaces a visible error message bound to the control
**Dependencies:** cavekit-schema.md R3, R6

### R4: Theme Name Control
**Description:** The editor must allow the user to edit the theme's display name.
**Acceptance Criteria:**
- [ ] A name control is rendered with the current theme name pre-filled
- [ ] Submitting a non-empty value updates the active theme name
- [ ] An empty name is rejected and surfaces a visible error message
**Dependencies:** cavekit-schema.md R4

### R5: Built-in Preset Library
**Description:** The editor must offer a set of named built-in starter themes the user can apply with a single action. The library must include at least the presets: Ocean, Dark, Warm.
**Acceptance Criteria:**
- [ ] A list of available presets is rendered with each preset's display name visible
- [ ] Each built-in preset passes schema validation
- [ ] Selecting a preset replaces the active theme with the preset's values
- [ ] Applying a preset is recorded as a single undoable action (R7)
- [ ] The set of built-in presets is stable across sessions and not user-editable from this domain
**Dependencies:** R7, cavekit-schema.md R4

### R6: Active Theme State
**Description:** The editor must own a single source of truth for the currently edited theme and expose it to the rest of the app via a defined observable interface.
**Acceptance Criteria:**
- [ ] At any time exactly one theme configuration is the active theme
- [ ] The active theme always satisfies schema validation
- [ ] Subscribers are notified after every committed change to the active theme
- [ ] Reading the active theme returns the most recently committed value
**Dependencies:** cavekit-schema.md R4, cavekit-schema.md R7

### R7: Undo / Redo History
**Description:** Every committed change to the active theme must be recorded in a history stack supporting undo and redo.
**Acceptance Criteria:**
- [ ] After at least one committed change, an undo action restores the active theme to its prior committed value
- [ ] After an undo, a redo action restores the just-undone value
- [ ] When undo is unavailable (no prior state), the undo affordance is disabled and invoking it has no effect
- [ ] When redo is unavailable (no undone state or new edit since undo), the redo affordance is disabled and invoking it has no effect
- [ ] A new committed change made after one or more undos clears the redo stack
- [ ] The history stack retains at least the last 50 committed changes
- [ ] Loading a preset or importing a theme via a user-initiated action each count as a single undoable change; restoring a theme from persistence on cold app load does not (it becomes the initial history state with no prior states to undo into)
**Dependencies:** R6

### R8: Reset to Default
**Description:** The editor must provide an action that returns the active theme to the schema's default theme.
**Acceptance Criteria:**
- [ ] A reset affordance is rendered and invokable
- [ ] Invoking reset replaces the active theme with the schema's default theme
- [ ] A reset is recorded as a single undoable change (R7)
**Dependencies:** R7, cavekit-schema.md R7

### R9: External Theme Application
**Description:** The editor must accept theme configurations supplied by other domains (import, persistence, presets) and adopt them as the active theme, subject to validation.
**Acceptance Criteria:**
- [ ] A valid externally supplied theme replaces the active theme and is recorded as a single undoable change (R7)
- [ ] An invalid externally supplied theme is rejected without altering the active theme and surfaces a visible error message identifying the failed field path
**Dependencies:** R6, R7, cavekit-schema.md R6

### R10: Visual Consistency
**Description:** The editor surface must conform to the project's visual design system if one is defined.
**Acceptance Criteria:**
- [ ] If a project DESIGN.md exists, the editor controls and layout reference its tokens for color, typography, and spacing decisions
- [ ] If no DESIGN.md exists, the editor uses the active theme's own tokens consistently across all controls
**Dependencies:** none

### R11: Color Mode (Simple / Advanced)
**Description:** The editor must expose a Simple ↔ Advanced color-mode toggle. Simple mode renders exactly two color inputs (Primary, Neutral) and derives the remaining seven color slots deterministically from those two inputs (per the Batch A handoff rule: secondary = primary hue-shifted +40°; background, text, muted, hairline, inkSoft, surfaceInvert, onInvert derived from neutral via fixed L values; exact derivation values are intentionally left to the implementation cavekit-revision or to the implementation batch). Advanced mode renders all nine color controls with no derivation, each independently editable. Switching Advanced→Simple discards manual overrides for the seven derived slots and resumes derivation. Switching Simple→Advanced seeds the nine controls with the currently displayed (derived) values, treated as overrides going forward. The mode is persisted across sessions via cavekit-persistence.md R8.
**Acceptance Criteria:**
- [ ] Default mode on first load (no persisted record) is Simple
- [ ] A mode toggle affordance is rendered and operable
- [ ] In Simple mode, exactly two color controls are rendered (Primary, Neutral)
- [ ] In Simple mode, changing Primary updates the secondary slot deterministically — the same Primary value always yields the same secondary value
- [ ] In Simple mode, changing Neutral updates background, text, muted, hairline, inkSoft, surfaceInvert, and onInvert deterministically
- [ ] In Advanced mode, all nine color controls are rendered and independently editable, with no derivation applied to any slot
- [ ] Switching from Advanced to Simple is recorded as a single undoable change (R7) and discards override state for the seven derived slots
- [ ] Switching from Simple to Advanced is recorded as a single undoable change (R7) and seeds the nine controls with the current derived values as overrides
- [ ] Mode is persisted across sessions per cavekit-persistence.md R8
**Dependencies:** R6, R7, cavekit-schema.md R1, cavekit-persistence.md R8

## Out of Scope
- Live preview rendering (Preview domain)
- Theme serialization to any export format (Export domain)
- Persisting state across browser sessions (Persistence domain)
- Importing themes from external sources (Persistence domain)
- User-defined or saved custom presets beyond the built-in library
- Collaborative editing or multi-user state
- Keyboard shortcut definition beyond what is required to invoke undo/redo affordances
- Color picker palette suggestions, contrast warnings, or accessibility scoring
- Drag-and-drop reordering of tokens

## Cross-References
- See also: cavekit-schema.md (data model and validation)
- See also: cavekit-preview.md (consumes the active theme)
- See also: cavekit-export.md (consumes the active theme)
- See also: cavekit-persistence.md (supplies themes via R9 and consumes the active theme to save)

## Changelog
- 2026-04-16: Initial draft.
- 2026-04-16: Batch B-arch — added R11 Color Mode (Simple/Advanced); R1 annotated as mode-aware.
