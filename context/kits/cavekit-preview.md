---
created: "2026-04-16"
last_edited: "2026-04-16"
---

# Cavekit: Preview

## Scope
The live visual canvas that renders representative UI under the currently active theme. Reflects edits in real time, applies theme tokens to the canvas without leaking them into the surrounding application chrome, and supports toggling between the light and dark variants of a paired theme.

## Requirements

### R1: Canvas Render Surface
**Description:** The preview must render a self-contained canvas displaying representative interface elements styled exclusively by the active theme.
**Acceptance Criteria:**
- [ ] The canvas displays at minimum: a heading at the typographic base size scaled by the configured ratio, a body text sample, a primary-styled button, a secondary-styled button, and a background fill region
- [ ] All rendered elements derive their colors solely from the active theme's color tokens
- [ ] All rendered text derives its font family from the active theme's typography tokens
- [ ] All rendered spacing between sample elements derives from the active theme's spacing tokens
- [ ] Theme tokens applied within the canvas do not affect styling of the editor surface or other application chrome
**Dependencies:** cavekit-schema.md R4, cavekit-editor.md R6

### R2: Live Update
**Description:** The preview must reflect every committed change to the active theme without explicit refresh.
**Acceptance Criteria:**
- [ ] A committed change to any color, typography, or spacing token is visible in the canvas without user-initiated reload
- [ ] The visible state of the canvas always corresponds to the most recently committed active theme
- [ ] No stale token values persist in the canvas after an undo, redo, preset application, or import
**Dependencies:** R1, cavekit-editor.md R6, cavekit-editor.md R7

### R3: Variant Pair Toggle
**Description:** When the active theme is a variant pair, the preview must allow the user to switch the canvas between the light and dark variant.
**Acceptance Criteria:**
- [ ] When the active theme is a single configuration (not a pair), no variant toggle is shown
- [ ] When the active theme is a variant pair, a toggle with two states (light, dark) is rendered
- [ ] Selecting a variant updates the canvas to render under that variant's color tokens
- [ ] The currently selected variant is visibly indicated
- [ ] Switching variants does not modify the underlying active theme
- [ ] The default selected variant on initial load is the light variant
**Dependencies:** R1, cavekit-schema.md R5

### R4: Type Scale Visualization
**Description:** The canvas must render at least three discrete type sizes so the user can perceive the effect of the scale ratio.
**Acceptance Criteria:**
- [ ] At least three text samples at distinct steps of the modular type scale are visible
- [ ] Adjacent step sizes differ by the configured scale ratio
- [ ] All steps use the configured base size as the anchor point
**Dependencies:** R1, cavekit-schema.md R2

### R5: Spacing Scale Visualization
**Description:** The canvas must visibly demonstrate the effect of the base spacing unit.
**Acceptance Criteria:**
- [ ] At least one rendered group of elements uses gap or padding derived from the base spacing unit
- [ ] Changing the base spacing unit produces a visible change in the spacing of that group
**Dependencies:** R1, cavekit-schema.md R3

### R6: Visual Consistency
**Description:** The chrome surrounding the preview canvas (toggle, frame, labels) must conform to the project's visual design system if one is defined.
**Acceptance Criteria:**
- [ ] If a project DESIGN.md exists, preview chrome references its tokens
- [ ] The canvas itself remains styled exclusively by the active theme regardless of design system tokens
**Dependencies:** R1

## Out of Scope
- Editing tokens from within the preview (Editor domain)
- Exporting the canvas as image, PDF, or screenshot
- Rendering arbitrary user-supplied component code
- Responsive breakpoint preview at different viewport widths
- Side-by-side comparison of two themes
- Animation of token transitions
- Component library beyond the representative samples listed in R1
- Accessibility audit overlays (contrast ratios, focus rings, etc.)
- Print preview

## Cross-References
- See also: cavekit-schema.md (data model and variant pair definition)
- See also: cavekit-editor.md (supplies the active theme)
- See also: cavekit-export.md (independent consumer of the same active theme)

## Changelog
- 2026-04-16: Initial draft.
