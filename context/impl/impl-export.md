---
created: "2026-04-16"
last_edited: "2026-04-16"
---
# Implementation Tracking: Export

Build site: context/plans/build-site.md

| Task | Status | Notes |
|------|--------|-------|
| T-022 | DONE | toJSON: deterministic, round-trips through schema, all canonical fields |
| T-023 | DONE | toCSSVars: :root scope, 4 font-size steps, 4 spacing steps, deterministic |
| T-024 | DONE | toTSObject: as const, single named export, deterministic |
| T-025 | DONE | toTailwindConfig: theme.extend.colors/fontSize/spacing with 4 steps each |
| T-026 | DONE | toSCSSVars: top-level vars, 4 type+spacing steps, no nesting |
| T-027 | DONE | toStyleDictionary: value+type per token, color/typography/spacing groups |
| T-028 | DONE | *Variant functions for all 6 formats (JSON light/dark, CSS :root[data-theme=dark], TS light/dark, Tailwind light/dark sub-keys, SCSS $light-/$dark-, SD light/dark groups) |
| T-029 | DONE | ExportPanel: 6 format tabs (role=tablist), monospaced pre output, active tab indicated |
| T-030 | DONE | Copy button: navigator.clipboard.writeText, 'Copied!'/'Copy failed' feedback |
| T-031 | DONE | Download button: Blob URL, correct ext per format, theme-name in filename |
| T-032 | DONE | Export generation is pure: no store mutation, no dispatch, no localStorage write |
