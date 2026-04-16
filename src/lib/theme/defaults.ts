import { validateThemeConfig } from '../../schema/theme'
import type { ThemeConfig } from '../../schema/theme'

// T-106 — DEFAULT_THEME extended with 5 new color slots, 4 shadows, 5 radii.
// Color values follow portfolio/DESIGN.md §2 (semantic palette).
// Shadow values follow portfolio/DESIGN.md §6 (the four canonical tokens).
// Radius values follow portfolio/DESIGN.md §5 (5-stop scale).
const _default = {
  name: 'Default',
  colors: {
    primary: '#6366f1',
    secondary: '#8b5cf6',
    background: '#ffffff',
    text: '#111827',
    muted: '#6b7280',
    hairline: '#e5e7eb',
    inkSoft: '#1f2937',
    surfaceInvert: '#0f172a',
    onInvert: '#f8fafc',
  },
  typography: {
    fontFamily: 'system-ui, sans-serif',
    baseSizePx: 16,
    scaleRatio: 1.25,
  },
  spacing: {
    baseUnitPx: 4,
  },
  shadows: {
    primary:
      '0 1px 2px 0 rgba(5,26,36,0.10), 0 4px 4px 0 rgba(5,26,36,0.09), 0 9px 6px 0 rgba(5,26,36,0.05), 0 17px 7px 0 rgba(5,26,36,0.01), 0 26px 7px 0 rgba(5,26,36,0.00), inset 0 2px 8px 0 rgba(255,255,255,0.50)',
    secondary: '0 0 0 0.5px rgba(0,0,0,0.05), 0 4px 30px rgba(0,0,0,0.08)',
    card: '0 4px 16px rgba(0,0,0,0.08)',
    float: '0 8px 24px rgba(5,26,36,0.10), 0 2px 6px rgba(5,26,36,0.06)',
  },
  radii: {
    pill: 9999,
    sm: 4,
    md: 8,
    lg: 16,
    xl: 32,
  },
} satisfies ThemeConfig

// T-007 + T-106: immutable, schema-valid, stable across reads
export const DEFAULT_THEME: Readonly<ThemeConfig> = Object.freeze({
  ..._default,
  colors: Object.freeze({ ..._default.colors }),
  typography: Object.freeze({ ..._default.typography }),
  spacing: Object.freeze({ ..._default.spacing }),
  shadows: Object.freeze({ ..._default.shadows }),
  radii: Object.freeze({ ..._default.radii }),
})

// Validate at module load to catch any drift (throws in dev if schema diverges)
if (import.meta.env?.DEV !== false) {
  const check = validateThemeConfig(DEFAULT_THEME)
  if (!check.success) {
    throw new Error(
      `DEFAULT_THEME fails schema validation: ${check.errors.map((e) => `${e.path}: ${e.message}`).join(', ')}`,
    )
  }
}
