import { describe, it, expect } from 'vitest'
import { validateThemeVariantPair, validateThemeConfig } from '../../src/schema/theme'
import { DEFAULT_THEME } from '../../src/lib/theme/defaults'

// T-005: Theme variant pair (R5) — extended in batch 9 to require shared shadows + radii

const lightConfig = {
  ...DEFAULT_THEME,
  name: 'light',
  colors: {
    ...DEFAULT_THEME.colors,
    primary: '#6366f1',
    secondary: '#8b5cf6',
    background: '#ffffff',
    text: '#111827',
  },
  typography: { fontFamily: 'Inter', baseSizePx: 16, scaleRatio: 1.25 },
  spacing: { baseUnitPx: 4 },
}

const darkConfig = {
  ...DEFAULT_THEME,
  name: 'dark',
  colors: {
    ...DEFAULT_THEME.colors,
    primary: '#818cf8',
    secondary: '#a78bfa',
    background: '#111827',
    text: '#f9fafb',
  },
  typography: { fontFamily: 'Inter', baseSizePx: 16, scaleRatio: 1.25 },
  spacing: { baseUnitPx: 4 },
}

const validPair = { name: 'my-pair', light: lightConfig, dark: darkConfig }

describe('validateThemeVariantPair', () => {
  it('accepts valid light/dark pair', () => {
    const r = validateThemeVariantPair(validPair)
    expect(r.success).toBe(true)
  })

  it('requires name field', () => {
    const { name: _n, ...noPair } = validPair
    expect(validateThemeVariantPair(noPair).success).toBe(false)
  })

  it('requires light field', () => {
    const { light: _l, ...noLight } = validPair
    expect(validateThemeVariantPair(noLight).success).toBe(false)
  })

  it('requires dark field', () => {
    const { dark: _d, ...noDark } = validPair
    expect(validateThemeVariantPair(noDark).success).toBe(false)
  })

  it('each variant satisfies R4 — invalid light rejected', () => {
    const r = validateThemeVariantPair({
      ...validPair,
      light: { ...lightConfig, colors: { ...lightConfig.colors, primary: 'bad' } },
    })
    expect(r.success).toBe(false)
    if (!r.success) expect(r.errors.some((e) => e.path.includes('primary'))).toBe(true)
  })

  it('each variant satisfies R4 — invalid dark rejected', () => {
    const r = validateThemeVariantPair({
      ...validPair,
      dark: { ...darkConfig, spacing: { baseUnitPx: 99 } },
    })
    expect(r.success).toBe(false)
    if (!r.success) expect(r.errors.some((e) => e.path.includes('baseUnitPx'))).toBe(true)
  })

  it('rejects differing fontFamily between variants', () => {
    const r = validateThemeVariantPair({
      ...validPair,
      dark: { ...darkConfig, typography: { ...darkConfig.typography, fontFamily: 'Georgia' } },
    })
    expect(r.success).toBe(false)
    if (!r.success) {
      expect(r.errors.some((e) => e.path.includes('fontFamily'))).toBe(true)
      expect(r.errors.some((e) => e.message.includes('fontFamily'))).toBe(true)
    }
  })

  it('rejects differing baseSizePx between variants', () => {
    const r = validateThemeVariantPair({
      ...validPair,
      dark: { ...darkConfig, typography: { ...darkConfig.typography, baseSizePx: 18 } },
    })
    expect(r.success).toBe(false)
    if (!r.success) expect(r.errors.some((e) => e.path.includes('baseSizePx'))).toBe(true)
  })

  it('rejects differing scaleRatio between variants', () => {
    const r = validateThemeVariantPair({
      ...validPair,
      dark: { ...darkConfig, typography: { ...darkConfig.typography, scaleRatio: 1.5 } },
    })
    expect(r.success).toBe(false)
  })

  it('rejects differing spacing between variants', () => {
    const r = validateThemeVariantPair({
      ...validPair,
      dark: { ...darkConfig, spacing: { baseUnitPx: 8 } },
    })
    expect(r.success).toBe(false)
    if (!r.success) expect(r.errors.some((e) => e.path.includes('baseUnitPx'))).toBe(true)
  })

  it('rejects extra fields (.strict)', () => {
    expect(validateThemeVariantPair({ ...validPair, extra: true }).success).toBe(false)
  })

  // Batch 9 — variant pair must share shadows + radii
  it('rejects differing shadows between variants', () => {
    const r = validateThemeVariantPair({
      ...validPair,
      dark: { ...darkConfig, shadows: { ...darkConfig.shadows, primary: 'inset 0 0 0 #fff' } },
    })
    expect(r.success).toBe(false)
    if (!r.success) expect(r.errors.some((e) => e.path.includes('shadows'))).toBe(true)
  })

  it('rejects differing radii between variants', () => {
    const r = validateThemeVariantPair({
      ...validPair,
      dark: { ...darkConfig, radii: { ...darkConfig.radii, sm: 99 } },
    })
    expect(r.success).toBe(false)
    if (!r.success) expect(r.errors.some((e) => e.path.includes('radii'))).toBe(true)
  })
})

describe('single theme remains valid (no pair required)', () => {
  it('validateThemeConfig still accepts a standalone config', () => {
    expect(validateThemeConfig(lightConfig).success).toBe(true)
  })

  it('validateThemeConfig does not require light/dark pair shape', () => {
    // A single config without pair wrapper is valid
    const r = validateThemeConfig(darkConfig)
    expect(r.success).toBe(true)
  })
})
