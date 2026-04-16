---
created: "2026-04-16"
last_edited: "2026-04-16"
---

# Cavekit: Schema

## Scope
Defines the canonical data model for a theme: token groups (color, typography, spacing), the composite theme configuration, the variant pair structure (light/dark), and runtime validation. This domain is the single source of truth for what a "theme" is. All other domains consume types and validators from here.

## Requirements

### R1: Color Token Group
**Description:** A theme must define a color token group containing the named slots required by the editor and widget previews. Each slot holds a single color value expressed as a hex string.
**Acceptance Criteria:**
- [ ] The group contains exactly the slots: primary, secondary, background, text, muted, hairline, inkSoft, surfaceInvert, onInvert
- [ ] Each slot value is a string matching a valid 6-digit hex color pattern with leading hash
- [ ] Validation rejects values that are not valid hex colors (wrong length, missing hash, non-hex characters)
- [ ] Validation rejects color groups missing any required slot
- [ ] Validation rejects color groups containing slots not in the required set
**Dependencies:** none

### R2: Typography Token Group
**Description:** A theme must define a typography token group with a font family name, a base font size, and a modular type scale ratio.
**Acceptance Criteria:**
- [ ] The group contains exactly the fields: fontFamily, baseSizePx, scaleRatio
- [ ] fontFamily is a non-empty string
- [ ] baseSizePx is a number in the inclusive range 8 through 32
- [ ] scaleRatio is a number in the inclusive range 1.1 through 2.0
- [ ] Validation rejects values outside the stated ranges and non-numeric inputs
- [ ] Validation rejects an empty fontFamily
**Dependencies:** none

### R3: Spacing Token Group
**Description:** A theme must define a spacing token group with a base spacing unit used to derive a spacing scale.
**Acceptance Criteria:**
- [ ] The group contains exactly the field: baseUnitPx
- [ ] baseUnitPx is a number in the inclusive range 2 through 16
- [ ] Validation rejects values outside the stated range and non-numeric inputs
**Dependencies:** none

### R4: Theme Configuration
**Description:** A theme configuration must compose the token groups under a human-readable name.
**Acceptance Criteria:**
- [ ] The configuration contains exactly the fields: name, colors, typography, spacing, shadows, radii
- [ ] name is a non-empty string
- [ ] colors satisfies the color token group requirements (R1)
- [ ] typography satisfies the typography token group requirements (R2)
- [ ] spacing satisfies the spacing token group requirements (R3)
- [ ] shadows satisfies the shadow token group requirements (R8)
- [ ] radii satisfies the radius token group requirements (R9)
- [ ] Validation produces a structured error report identifying the failing field path when any sub-validation fails
- [ ] An unknown top-level field on the configuration causes validation to fail
**Dependencies:** R1, R2, R3, R8, R9

### R5: Theme Variant Pair
**Description:** A theme may be expressed as a paired set of two theme configurations representing a light variant and a dark variant. The pair shares typography and spacing values; only color tokens differ between the two.
**Acceptance Criteria:**
- [ ] A variant pair contains exactly the fields: name, light, dark
- [ ] name is a non-empty string
- [ ] light and dark each satisfy the theme configuration requirements (R4)
- [ ] Validation rejects a pair when light and dark have differing typography values
- [ ] Validation rejects a pair when light and dark have differing spacing values
- [ ] Validation rejects a pair when light and dark have differing shadows values
- [ ] Validation rejects a pair when light and dark have differing radii values
- [ ] Validation produces a structured error identifying which group diverged when the equality check fails
- [ ] A single (non-pair) theme configuration remains independently valid and is not required to be wrapped in a pair
**Dependencies:** R4

### R6: Validation Surface
**Description:** Schema validation must be invokable as a pure function from any other domain and must distinguish success from failure without throwing for expected validation outcomes.
**Acceptance Criteria:**
- [ ] A validation call against a valid input returns a success result containing the parsed value
- [ ] A validation call against an invalid input returns a failure result containing one or more issue descriptions, each with a field path and a human-readable message
- [ ] Repeated validation of the same input is deterministic and side-effect free
- [ ] Validation does not mutate the input
**Dependencies:** R4, R5

### R7: Default Theme Constant
**Description:** The schema domain must publish a single default theme configuration that satisfies R4 and is used as the seed state by other domains.
**Acceptance Criteria:**
- [ ] A constant default theme is exported and passes validation under R4
- [ ] The default theme name is a non-empty human-readable string
- [ ] The default theme values are stable across reads (immutable / not modifiable by consumers)
- [ ] The default theme includes shadows and radii values that satisfy R8 and R9
**Dependencies:** R4

### R8: Shadow Token Group
**Description:** A theme must define a shadow token group with four named CSS box-shadow strings used by widget previews and emitted into every export. Shadow values are interpolated raw into CSS / SCSS / Tailwind exports, so the validator MUST reject characters that would let a malicious or malformed value escape its declaration and inject unrelated CSS into the emitted artifact.
**Acceptance Criteria:**
- [ ] The group contains exactly the slots: primary, secondary, card, float
- [ ] Each slot value is a non-empty string
- [ ] Validation rejects shadow values containing any of the following characters or sequences anywhere in the string: `;`, `}`, `{`, `/*`, `*/`, `\n`, `\r`, `<`, `>`. (These characters are sufficient to break out of `:root { --shadow-x: VALUE; }` in CSS exports or `$shadow-x: VALUE;` in SCSS exports.)
- [ ] Validation rejects empty strings or non-string values
- [ ] Validation rejects shadow groups missing any required slot
- [ ] Validation rejects shadow groups containing slots not in the required set
- [ ] DEFAULT_THEME and all built-in presets pass the tightened validator
- [ ] Backslash (`\`) is intentionally NOT in the blocklist. CSS hexadecimal escapes (e.g., `\3b` for `;`) are decoded inside the value token AFTER declaration parsing per CSS Syntax Level 3, so they cannot break the `:root { --shadow-x: VALUE; }` declaration boundary. A test must demonstrate that a shadow value containing `\3b` validates as ok and the resulting CSS export is well-formed (one declaration, not two).
**Dependencies:** none

### R9: Radius Token Group
**Description:** A theme must define a radius token group with five named pixel-radius values used by widget previews and emitted into every export.
**Acceptance Criteria:**
- [ ] The group contains exactly the slots: pill, sm, md, lg, xl
- [ ] pill is a non-negative number representing the pixel radius for fully-rounded shapes; the implementation may interpret a sentinel (e.g., 9999) as "fully round"
- [ ] sm, md, lg, xl are non-negative numbers in ascending order (sm <= md <= lg <= xl)
- [ ] All values are in the inclusive range 0 through 9999
- [ ] Validation rejects values outside the stated range, non-numeric inputs, and groups violating the ascending-order constraint
- [ ] Validation rejects radius groups missing any required slot
- [ ] Validation rejects radius groups containing slots not in the required set
**Dependencies:** none

## Out of Scope
- UI rendering of tokens (Editor domain)
- CSS variable generation or DOM application (Preview domain)
- Serialization to export formats (Export domain)
- Storage and loading of themes (Persistence domain)
- Color contrast or accessibility scoring
- Token aliases, semantic token layers, or per-component token overrides
- Animation, motion, or breakpoint tokens
- Internationalization of token names
- Multiple font families per theme

## Cross-References
- See also: cavekit-product-boundary.md (token surface scope)
- See also: cavekit-editor.md (consumes default theme and validation)
- See also: cavekit-preview.md (consumes theme configuration and variant pair)
- See also: cavekit-export.md (consumes theme configuration)
- See also: cavekit-persistence.md (consumes validation for imported themes)
- See also: cavekit-widgets.md (widget previews consume the token surface)

## Changelog
- 2026-04-16: Initial draft.
- 2026-04-16 (Batch 9): Color group expanded to 9 slots (added muted, hairline, inkSoft, surfaceInvert, onInvert). Added shadow token group (R8) and radius token group (R9). Theme configuration and variant pair validation updated to compose them.
- 2026-04-16 (Batch 10): R8 tightened — shadow values now reject CSS-injection vectors (`;` `}` `{` `/*` `*/` `\n` `\r` `<` `>`) so untrusted imported themes cannot break out of the `:root { ... }` declaration in CSS / SCSS / Tailwind exports.
- 2026-04-16 (Batch 11): R8 documents the intentional backslash exemption — CSS hex escapes (`\3b` etc.) are decoded inside the value token after declaration parsing, so they cannot break the declaration boundary.
- 2026-04-16: Boundary revision (Batch 9). Color group extended to 9 slots (added muted, hairline, inkSoft, surfaceInvert, onInvert). Added shadow token group (R8) and radius token group (R9). Theme configuration and variant pair validation updated to compose them.
