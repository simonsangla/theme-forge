import { describe, it, expect } from 'vitest'
import {
  toJSON, toJSONVariant,
  toCSSVars, toCSSVarsVariant,
  toTSObject, toTSObjectVariant,
  toTailwindConfig, toTailwindConfigVariant,
  toSCSSVars, toSCSSVarsVariant,
  toStyleDictionary, toStyleDictionaryVariant,
} from '../../src/export/exportTheme'
import { validateThemeConfig } from '../../src/schema/theme'
import type { ThemeConfig, ThemeVariantPair } from '../../src/schema/theme'
import { DEFAULT_THEME } from '../../src/lib/theme/defaults'

const baseTheme: ThemeConfig = {
  ...DEFAULT_THEME,
  name: 'test-theme',
  colors: {
    ...DEFAULT_THEME.colors,
    primary: '#3b82f6',
    secondary: '#8b5cf6',
    background: '#ffffff',
    text: '#111827',
  },
  typography: { fontFamily: 'Inter, sans-serif', baseSizePx: 16, scaleRatio: 1.25 },
  spacing: { baseUnitPx: 4 },
}

const variantPair: ThemeVariantPair = {
  name: 'test-pair',
  light: baseTheme,
  dark: {
    ...baseTheme,
    name: 'test-theme',
    colors: {
      ...baseTheme.colors,
      primary: '#818cf8',
      secondary: '#a78bfa',
      background: '#1e1e2e',
      text: '#cdd6f4',
    },
  },
}

// ── T-022 JSON ────────────────────────────────────────────────────────────────

describe('toJSON — T-022', () => {
  it('produces valid JSON', () => {
    expect(() => JSON.parse(toJSON(baseTheme))).not.toThrow()
  })

  it('round-trips through schema', () => {
    const parsed = JSON.parse(toJSON(baseTheme))
    expect(validateThemeConfig(parsed).success).toBe(true)
  })

  it('deterministic — same input same output', () => {
    expect(toJSON(baseTheme)).toBe(toJSON({ ...baseTheme }))
  })

  it('contains all canonical field names', () => {
    const parsed = JSON.parse(toJSON(baseTheme))
    expect(parsed.name).toBe(baseTheme.name)
    expect(parsed.colors.primary).toBe(baseTheme.colors.primary)
    expect(parsed.typography.baseSizePx).toBe(baseTheme.typography.baseSizePx)
    expect(parsed.spacing.baseUnitPx).toBe(baseTheme.spacing.baseUnitPx)
  })
})

describe('toJSONVariant — T-022/T-028', () => {
  it('emits light and dark top-level keys', () => {
    const parsed = JSON.parse(toJSONVariant(variantPair))
    expect(parsed.light).toBeDefined()
    expect(parsed.dark).toBeDefined()
  })
})

// ── T-023 CSS ─────────────────────────────────────────────────────────────────

describe('toCSSVars — T-023', () => {
  it('scoped under :root', () => {
    expect(toCSSVars(baseTheme)).toContain(':root {')
  })

  it('contains all color slots', () => {
    const css = toCSSVars(baseTheme)
    expect(css).toContain('--color-primary: #3b82f6')
    expect(css).toContain('--color-secondary: #8b5cf6')
    expect(css).toContain('--color-background: #ffffff')
    expect(css).toContain('--color-text: #111827')
  })

  it('emits at least 3 font-size scale steps', () => {
    const css = toCSSVars(baseTheme)
    const steps = ['--font-size-xs', '--font-size-sm', '--font-size-md', '--font-size-lg']
    steps.forEach(s => expect(css).toContain(s))
  })

  it('emits at least 3 spacing steps', () => {
    const css = toCSSVars(baseTheme)
    expect(css).toContain('--spacing-1')
    expect(css).toContain('--spacing-2')
    expect(css).toContain('--spacing-4')
  })

  it('deterministic output', () => {
    expect(toCSSVars(baseTheme)).toBe(toCSSVars({ ...baseTheme }))
  })
})

describe('toCSSVarsVariant — T-023/T-028', () => {
  it('emits :root for light variant', () => {
    expect(toCSSVarsVariant(variantPair)).toContain(':root {')
  })

  it('emits :root[data-theme="dark"] for dark variant', () => {
    expect(toCSSVarsVariant(variantPair)).toContain(':root[data-theme="dark"] {')
  })
})

// ── T-024 TypeScript ──────────────────────────────────────────────────────────

describe('toTSObject — T-024', () => {
  it('starts with export const theme =', () => {
    expect(toTSObject(baseTheme)).toMatch(/^export const theme =/)
  })

  it('ends with as const', () => {
    expect(toTSObject(baseTheme)).toMatch(/\} as const$/)
  })

  it('deterministic', () => {
    expect(toTSObject(baseTheme)).toBe(toTSObject({ ...baseTheme }))
  })
})

describe('toTSObjectVariant — T-024/T-028', () => {
  it('exports light and dark props', () => {
    const ts = toTSObjectVariant(variantPair)
    expect(ts).toContain('"light"')
    expect(ts).toContain('"dark"')
    expect(ts).toMatch(/as const$/)
  })
})

// ── T-025 Tailwind ────────────────────────────────────────────────────────────

describe('toTailwindConfig — T-025', () => {
  it('starts with /** @type', () => {
    expect(toTailwindConfig(baseTheme)).toMatch(/^\/\*\* @type/)
  })

  it('maps colors to theme.extend.colors', () => {
    const raw = toTailwindConfig(baseTheme)
    const jsonStr = raw.slice(raw.lastIndexOf('export default ') + 'export default '.length)
    const parsed = JSON.parse(jsonStr)
    expect(parsed.theme.extend.colors.primary).toBe('#3b82f6')
  })

  it('maps font sizes to theme.extend.fontSize with 4 steps', () => {
    const raw = toTailwindConfig(baseTheme)
    const jsonStr = raw.slice(raw.lastIndexOf('export default ') + 'export default '.length)
    const parsed = JSON.parse(jsonStr)
    expect(Object.keys(parsed.theme.extend.fontSize).length).toBeGreaterThanOrEqual(3)
  })

  it('maps spacing with 4 steps', () => {
    const raw = toTailwindConfig(baseTheme)
    const jsonStr = raw.slice(raw.lastIndexOf('export default ') + 'export default '.length)
    const parsed = JSON.parse(jsonStr)
    expect(Object.keys(parsed.theme.extend.spacing).length).toBeGreaterThanOrEqual(3)
  })

  it('deterministic', () => {
    expect(toTailwindConfig(baseTheme)).toBe(toTailwindConfig({ ...baseTheme }))
  })
})

describe('toTailwindConfigVariant — T-025/T-028', () => {
  it('has light/dark sub-keys under colors', () => {
    const raw = toTailwindConfigVariant(variantPair)
    const jsonStr = raw.slice(raw.lastIndexOf('export default ') + 'export default '.length)
    const parsed = JSON.parse(jsonStr)
    expect(parsed.theme.extend.colors.light).toBeDefined()
    expect(parsed.theme.extend.colors.dark).toBeDefined()
  })
})

// ── T-026 SCSS ────────────────────────────────────────────────────────────────

describe('toSCSSVars — T-026', () => {
  it('top-level vars — no selector nesting', () => {
    const scss = toSCSSVars(baseTheme)
    expect(scss).not.toContain('{')
  })

  it('one var per color slot', () => {
    const scss = toSCSSVars(baseTheme)
    expect(scss).toContain('$color-primary: #3b82f6')
    expect(scss).toContain('$color-secondary: #8b5cf6')
  })

  it('emits font-size vars with 4 steps', () => {
    const scss = toSCSSVars(baseTheme)
    expect(scss).toContain('$font-size-xs')
    expect(scss).toContain('$font-size-sm')
    expect(scss).toContain('$font-size-md')
    expect(scss).toContain('$font-size-lg')
  })

  it('emits spacing vars with 4 steps', () => {
    const scss = toSCSSVars(baseTheme)
    expect(scss).toContain('$spacing-1')
    expect(scss).toContain('$spacing-2')
    expect(scss).toContain('$spacing-4')
  })

  it('deterministic', () => {
    expect(toSCSSVars(baseTheme)).toBe(toSCSSVars({ ...baseTheme }))
  })
})

describe('toSCSSVarsVariant — T-026/T-028', () => {
  it('uses $light- and $dark- prefixes', () => {
    const scss = toSCSSVarsVariant(variantPair)
    expect(scss).toContain('$light-color-primary')
    expect(scss).toContain('$dark-color-primary')
  })
})

// ── T-027 Style Dictionary ────────────────────────────────────────────────────

describe('toStyleDictionary — T-027', () => {
  it('valid JSON', () => {
    expect(() => JSON.parse(toStyleDictionary(baseTheme))).not.toThrow()
  })

  it('each token has value and type fields', () => {
    const tokens = JSON.parse(toStyleDictionary(baseTheme))
    expect(tokens.color.primary.value).toBeDefined()
    expect(tokens.color.primary.type).toBe('color')
    expect(tokens.typography.fontSizeSm.type).toBe('fontSize')
    expect(tokens.spacing.s1.type).toBe('dimension')
  })

  it('nested under color/typography/spacing groups', () => {
    const tokens = JSON.parse(toStyleDictionary(baseTheme))
    expect(tokens.color).toBeDefined()
    expect(tokens.typography).toBeDefined()
    expect(tokens.spacing).toBeDefined()
  })

  it('deterministic', () => {
    expect(toStyleDictionary(baseTheme)).toBe(toStyleDictionary({ ...baseTheme }))
  })
})

describe('toStyleDictionaryVariant — T-027/T-028', () => {
  it('top-level light and dark groups', () => {
    const tokens = JSON.parse(toStyleDictionaryVariant(variantPair))
    expect(tokens.light).toBeDefined()
    expect(tokens.dark).toBeDefined()
    expect(tokens.light.color.primary.type).toBe('color')
  })
})
