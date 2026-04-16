---
created: "2026-04-16"
last_edited: "2026-04-16"
---

# Cavekit: Schema

## Scope
Defines the canonical data model for a theme: token groups (color, typography, spacing), the composite theme configuration, the variant pair structure (light/dark), and runtime validation. This domain is the single source of truth for what a "theme" is. All other domains consume types and validators from here.

## Requirements

### R1: Color Token Group
**Description:** A theme must define a color token group containing the named slots required by the editor: primary, secondary, background, and text. Each slot holds a single color value expressed as a hex string.
**Acceptance Criteria:**
- [ ] A color token group object contains exactly the slots: primary, secondary, background, text
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
**Description:** A theme configuration must compose the three token groups under a human-readable name.
**Acceptance Criteria:**
- [ ] The configuration contains exactly the fields: name, colors, typography, spacing
- [ ] name is a non-empty string
- [ ] colors satisfies the color token group requirements (R1)
- [ ] typography satisfies the typography token group requirements (R2)
- [ ] spacing satisfies the spacing token group requirements (R3)
- [ ] Validation produces a structured error report identifying the failing field path when any sub-validation fails
- [ ] An unknown top-level field on the configuration causes validation to fail
**Dependencies:** R1, R2, R3

### R5: Theme Variant Pair
**Description:** A theme may be expressed as a paired set of two theme configurations representing a light variant and a dark variant. The pair shares typography and spacing values; only color tokens differ between the two.
**Acceptance Criteria:**
- [ ] A variant pair contains exactly the fields: name, light, dark
- [ ] name is a non-empty string
- [ ] light and dark each satisfy the theme configuration requirements (R4)
- [ ] Validation rejects a pair when light and dark have differing typography values
- [ ] Validation rejects a pair when light and dark have differing spacing values
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
**Dependencies:** R4

## Out of Scope
- UI rendering of tokens (Editor domain)
- CSS variable generation or DOM application (Preview domain)
- Serialization to export formats (Export domain)
- Storage and loading of themes (Persistence domain)
- Color contrast or accessibility scoring
- Token aliases, semantic token layers, or per-component token overrides
- Animation, motion, border-radius, shadow, or breakpoint tokens
- Internationalization of token names
- Multiple font families per theme

## Cross-References
- See also: cavekit-editor.md (consumes default theme and validation)
- See also: cavekit-preview.md (consumes theme configuration and variant pair)
- See also: cavekit-export.md (consumes theme configuration)
- See also: cavekit-persistence.md (consumes validation for imported themes)

## Changelog
- 2026-04-16: Initial draft.
