---
created: "2026-04-16"
last_edited: "2026-04-16"
---

# Cavekit: Persistence

## Scope
Long-lived storage of the user's working theme in browser local storage and ingestion of themes supplied from outside the app. Covers automatic save of the active theme, restore of the most recent theme on app load, explicit clear, and import from either a pasted JSON string or an uploaded JSON file. Hands validated themes to the editor for adoption; never mutates them itself.

## Requirements

### R1: Automatic Save of Active Theme
**Description:** The active theme must be persisted to browser local storage whenever it changes so that closing and reopening the app preserves the user's work.
**Acceptance Criteria:**
- [ ] After any committed change to the active theme, the persisted record reflects the new value within one update cycle
- [ ] The persisted record contains a complete theme configuration that satisfies schema validation
- [ ] At most one persisted active-theme record exists at any time per browser origin
- [ ] Save failures (e.g., storage quota exceeded, storage unavailable) surface a visible non-blocking error message and do not crash the app
**Dependencies:** cavekit-editor.md R6, cavekit-schema.md R6

### R2: Restore on Load
**Description:** When the app loads and a persisted active theme exists, that theme must be adopted as the active theme.
**Acceptance Criteria:**
- [ ] If a valid persisted theme exists, it is loaded as the active theme on app initialization
- [ ] If no persisted theme exists, the schema's default theme is used
- [ ] If a persisted theme exists but fails validation, the schema's default theme is used and the user is shown a visible non-blocking notice that a corrupt saved theme was discarded
- [ ] Restored adoption on cold load is recorded as the initial state of the undo history (no prior states to undo into); this is distinct from user-initiated import (R4, R5) which counts as an undoable change per cavekit-editor.md R7
**Dependencies:** R1, cavekit-editor.md R9, cavekit-schema.md R6, cavekit-schema.md R7

### R3: Clear Persisted Theme
**Description:** The user must be able to explicitly clear the persisted theme.
**Acceptance Criteria:**
- [ ] A clear affordance is rendered and invokable
- [ ] Invoking clear removes the persisted active-theme record from local storage
- [ ] Invoking clear does not change the in-memory active theme
- [ ] After clear, the next app load uses the schema's default theme (per R2)
- [ ] Invoking clear when no record exists is a no-op and does not error
**Dependencies:** R1

### R4: Import from JSON String
**Description:** The user must be able to import a theme by pasting a JSON string.
**Acceptance Criteria:**
- [ ] A paste-input affordance is rendered for the user to enter a JSON string
- [ ] On submit, the input is parsed as JSON and validated against the schema
- [ ] A valid theme is handed to the editor for adoption as a single undoable change
- [ ] Invalid JSON surfaces a visible error message identifying the parse failure
- [ ] A parsed value that fails schema validation surfaces a visible error message identifying the failing field path
- [ ] A failed import does not modify the active theme or the persisted record
**Dependencies:** cavekit-editor.md R9, cavekit-schema.md R6

### R5: Import from JSON File
**Description:** The user must be able to import a theme by selecting a local JSON file.
**Acceptance Criteria:**
- [ ] A file-selection affordance is rendered, restricted to JSON file types
- [ ] On selection, the file contents are read, parsed as JSON, and validated against the schema
- [ ] A valid theme is handed to the editor for adoption as a single undoable change
- [ ] An unreadable file surfaces a visible error message
- [ ] Invalid JSON surfaces a visible error message identifying the parse failure
- [ ] A parsed value that fails schema validation surfaces a visible error message identifying the failing field path
- [ ] A failed import does not modify the active theme or the persisted record
**Dependencies:** cavekit-editor.md R9, cavekit-schema.md R6

### R6: Storage Schema Versioning
**Description:** The persisted record must carry a version identifier so future schema changes can be migrated or detected. Adding optional fields to the PersistedRecord wrapper (e.g., `colorMode` and `colorOverrides` per R8) does NOT bump the version; only field-shape changes that break legacy reads do.
**Acceptance Criteria:**
- [ ] Every persisted record includes a version field with a stable identifier for the current schema generation
- [ ] On load, a record whose version matches the current generation is loaded normally (subject to R2)
- [ ] On load, a record whose version is unknown is treated as corrupt under R2 and the user is shown the same non-blocking notice
**Dependencies:** R1, R2

### R7: Storage Availability Detection
**Description:** The persistence domain must detect when local storage is unavailable and degrade gracefully.
**Acceptance Criteria:**
- [ ] If local storage is unavailable at app load, the app initializes with the schema's default theme
- [ ] If local storage is unavailable, save attempts (R1) are skipped silently after an initial visible non-blocking notice
- [ ] The editor and preview remain fully functional in the absence of storage
**Dependencies:** R1, R2

### R8: Optional Color-Mode Fields on Persisted Record
**Description:** The PersistedRecord may carry two optional fields — `colorMode` (a string equal to `'simple'` or `'advanced'`) and `colorOverrides` (a partial map of `ColorTokens` representing user-edited slot values applied on top of the Simple-mode-derived base). Both fields are omittable. The persistence schema generation (version) stays at 1; legacy records lacking these fields load as Simple mode with an empty override map. `ThemeConfigSchema` is NOT extended — these fields live on the PersistedRecord wrapper around the theme.
**Acceptance Criteria:**
- [ ] PersistedRecord shape accepts records with or without the `colorMode` and `colorOverrides` fields without error
- [ ] At save time, when the editor is in Simple mode the record persists `colorMode='simple'` plus any active overrides; when in Advanced mode the record persists `colorMode='advanced'` plus the full override set
- [ ] At load time, a missing `colorMode` field defaults to `'simple'` and a missing `colorOverrides` field defaults to `{}`
- [ ] At load time, a `colorMode` value not in `{'simple','advanced'}` is treated as corrupt per R2 / R6 (visible non-blocking notice; default theme used)
- [ ] At load time, every key in `colorOverrides` must be a valid color slot name and every value must satisfy hex-color validation; otherwise the record is treated as corrupt per R2 / R6
- [ ] The schema generation (version) field remains 1; no migration is required
- [ ] Round-trip preservation: saving then loading an unchanged record yields equal `colorMode` and equal `colorOverrides`
**Dependencies:** R1, R2, R6, cavekit-editor.md R11

## Out of Scope
- Cloud sync or any network-backed storage
- Multi-theme libraries or saved snapshots beyond a single active record
- Versioned history of past saved themes
- Account-bound or device-syncing persistence
- Export to file (Export domain owns downloads)
- Import from formats other than JSON (CSS, TS, Tailwind, SCSS, Style Dictionary)
- Encryption of stored themes
- Automatic migration of records from prior schema versions (versioning is detection-only at this stage)
- Conflict resolution when multiple browser tabs edit simultaneously

## Cross-References
- See also: cavekit-schema.md (validation of all loaded and imported themes)
- See also: cavekit-editor.md (consumer of restored and imported themes via R9; source of the active theme to save)
- See also: cavekit-export.md (independent one-way output path; not used by import)

## Changelog
- 2026-04-16: Initial draft.
- 2026-04-16: Batch B-arch — added R8 (optional `colorMode` + `colorOverrides` on PersistedRecord; no version bump). R6 clarified that wrapper-field additions don't bump version.
