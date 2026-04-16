---
created: "2026-04-16"
last_edited: "2026-04-16"
---

# Cavekit: Export

## Scope
Pure serialization of a validated theme configuration into multiple downstream formats: JSON, CSS custom properties, TypeScript object, Tailwind config, SCSS variables, and Style Dictionary tokens. Provides a copy-to-clipboard and download surface for each format. All exports are deterministic, fully derived from the active theme, and have no runtime side effects on the editor or preview.

## Requirements

### R1: JSON Export
**Description:** A theme must be serializable to a JSON document that round-trips back through schema validation.
**Acceptance Criteria:**
- [ ] The output is a syntactically valid JSON document
- [ ] The output contains the theme name and all token groups with the same field names as the canonical schema
- [ ] Parsing the output and validating it against the schema yields the original theme
- [ ] The output is deterministic for a given input (stable key order, consistent whitespace)
**Dependencies:** cavekit-schema.md R4

### R2: CSS Custom Properties Export
**Description:** A theme must be serializable to a CSS document that declares custom properties for every token.
**Acceptance Criteria:**
- [ ] The output declares one CSS custom property per color slot, named consistently and prefixed to avoid collision
- [ ] The output declares CSS custom properties for the typography base size, font family, and at least three derived scale steps
- [ ] The output declares CSS custom properties for the base spacing unit and at least three derived spacing steps
- [ ] All properties are scoped under a single rule selector
- [ ] The output is deterministic for a given input
- [ ] The output is syntactically valid CSS
**Dependencies:** cavekit-schema.md R4

### R3: TypeScript Object Export
**Description:** A theme must be serializable to a TypeScript module exporting a typed constant object.
**Acceptance Criteria:**
- [ ] The output is a syntactically valid TypeScript source file
- [ ] The output exports a single named constant whose shape mirrors the theme schema
- [ ] Token values are typed as literal types rather than widened to their base type (string, number)
- [ ] The output is deterministic for a given input
**Dependencies:** cavekit-schema.md R4

### R4: Tailwind Config Export
**Description:** A theme must be serializable to a Tailwind CSS configuration fragment that maps theme tokens into Tailwind's theme extension surface.
**Acceptance Criteria:**
- [ ] The output is a syntactically valid JavaScript or TypeScript module suitable for use as a Tailwind config
- [ ] Color tokens populate the `theme.extend.colors` namespace
- [ ] The typography base size and at least three derived scale steps populate the `theme.extend.fontSize` namespace
- [ ] The base spacing unit and at least three derived spacing steps populate the `theme.extend.spacing` namespace
- [ ] The output is deterministic for a given input
**Dependencies:** cavekit-schema.md R4

### R5: SCSS Variables Export
**Description:** A theme must be serializable to an SCSS partial declaring variables for every token.
**Acceptance Criteria:**
- [ ] The output is a syntactically valid SCSS document
- [ ] One SCSS variable is declared per color slot with a consistent name
- [ ] SCSS variables are declared for the typography base size, font family, and at least three derived scale steps
- [ ] SCSS variables are declared for the base spacing unit and at least three derived spacing steps
- [ ] All variables are top-level (not nested under a selector)
- [ ] The output is deterministic for a given input
**Dependencies:** cavekit-schema.md R4

### R6: Style Dictionary Export
**Description:** A theme must be serializable to a Style Dictionary tokens document conforming to the canonical Style Dictionary token shape.
**Acceptance Criteria:**
- [ ] The output is a syntactically valid JSON document
- [ ] Each token is represented as an object with a `value` field and a `type` field
- [ ] Color tokens use type `color`, typography size tokens use type `dimension` or `fontSize`, spacing tokens use type `dimension`
- [ ] Tokens are nested under category groupings (color, typography, spacing)
- [ ] The output is deterministic for a given input
**Dependencies:** cavekit-schema.md R4

### R7: Variant Pair Export
**Description:** When the input is a variant pair, every export format must emit both light and dark variants in a way appropriate to that format.
**Acceptance Criteria:**
- [ ] JSON export emits a single document containing both variants under `"light"` and `"dark"` top-level keys
- [ ] CSS export emits two rule selectors: `:root` for the light variant and `:root[data-theme="dark"]` for the dark variant, each declaring the full token set
- [ ] TypeScript export emits a single object with `light` and `dark` top-level properties, each containing the full token set
- [ ] Tailwind export emits a single module where color, fontSize, and spacing namespaces each contain `light` and `dark` sub-keys (e.g., `theme.extend.colors.light`, `theme.extend.colors.dark`)
- [ ] SCSS export declares all variables twice: once with a `light-` prefix and once with a `dark-` prefix (e.g., `$light-color-primary`, `$dark-color-primary`)
- [ ] Style Dictionary export nests all tokens under top-level `light` and `dark` category groups
- [ ] When the input is a single configuration (not a pair), exports omit any variant scaffolding
**Dependencies:** R1, R2, R3, R4, R5, R6, cavekit-schema.md R5

### R8: Format Selection Surface
**Description:** The export surface must let the user choose a format and view the resulting output.
**Acceptance Criteria:**
- [ ] All six formats (R1–R6) are selectable
- [ ] The currently selected format is visibly indicated
- [ ] The output for the selected format is displayed in a readable, monospaced presentation
- [ ] Switching format updates the displayed output without modifying the active theme
**Dependencies:** R1, R2, R3, R4, R5, R6, cavekit-editor.md R6

### R9: Copy to Clipboard
**Description:** The export surface must allow the user to copy the currently displayed output to the system clipboard.
**Acceptance Criteria:**
- [ ] A copy affordance is rendered for the displayed output
- [ ] Invoking copy places the exact displayed output into the system clipboard
- [ ] Successful copy is acknowledged with a transient visible confirmation
- [ ] A failure to access the clipboard surfaces a visible error message
**Dependencies:** R8

### R10: Download as File
**Description:** The export surface must allow the user to download the currently displayed output as a file with an appropriate extension.
**Acceptance Criteria:**
- [ ] A download affordance is rendered for the displayed output
- [ ] Invoking download triggers a file download whose contents exactly match the displayed output
- [ ] The downloaded file has an extension matching the selected format: `.json` for JSON, `.css` for CSS, `.ts` for TypeScript, `.js` for Tailwind config, `.scss` for SCSS, `.tokens.json` for Style Dictionary
- [ ] The downloaded filename incorporates the theme name in a filesystem-safe form
**Dependencies:** R8

### R11: Purity
**Description:** All export operations must be pure with respect to the active theme.
**Acceptance Criteria:**
- [ ] Generating any export does not mutate the active theme
- [ ] Generating any export does not record an undoable change
- [ ] Generating any export does not write to persistence
**Dependencies:** R1, R2, R3, R4, R5, R6

## Out of Scope
- Importing themes from any of the supported formats (Persistence domain handles JSON import only)
- Custom user-defined export formats or templates
- Server-side rendering or compilation of exports
- Bundling exports into a downloadable archive
- Publishing exports to external services (npm, GitHub, design tool plugins)
- Format conversion between exports without going through the schema
- Minification or pretty-printing options beyond the deterministic default

## Cross-References
- See also: cavekit-schema.md (data model that all exports serialize)
- See also: cavekit-editor.md (supplies the active theme)
- See also: cavekit-preview.md (peer consumer of the active theme; export and preview are independent)
- See also: cavekit-persistence.md (handles import; export is one-way out)

## Changelog
- 2026-04-16: Initial draft.
