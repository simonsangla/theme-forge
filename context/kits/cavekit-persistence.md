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
**Description:** The persisted record must carry a version identifier so future schema changes can be migrated or detected.
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
