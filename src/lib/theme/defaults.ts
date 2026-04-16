import { validateThemeConfig } from '../../schema/theme'
import type { ThemeConfig } from '../../schema/theme'

const _default = {
  name: 'Default',
  colors: {
    primary: '#6366f1',
    secondary: '#8b5cf6',
    background: '#ffffff',
    text: '#111827',
  },
  typography: {
    fontFamily: 'system-ui, sans-serif',
    baseSizePx: 16,
    scaleRatio: 1.25,
  },
  spacing: {
    baseUnitPx: 4,
  },
} satisfies ThemeConfig

// T-007: immutable, schema-valid, stable across reads
export const DEFAULT_THEME: Readonly<ThemeConfig> = Object.freeze({
  ..._default,
  colors: Object.freeze({ ..._default.colors }),
  typography: Object.freeze({ ..._default.typography }),
  spacing: Object.freeze({ ..._default.spacing }),
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
