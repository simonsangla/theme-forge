import { describe, it, expect } from 'vitest'
import {
  validateColorTokens,
  validateTypographyTokens,
  validateSpacingTokens,
  validateThemeConfig,
} from '../../src/schema/theme'

// ─── T-001: Color token group (R1) ───────────────────────────────────────────

describe('validateColorTokens', () => {
  const valid = {
    primary: '#aabbcc',
    secondary: '#001122',
    background: '#ffffff',
    text: '#000000',
  }

  it('accepts valid color group', () => {
    const r = validateColorTokens(valid)
    expect(r.success).toBe(true)
    if (r.success) expect(r.data).toEqual(valid)
  })

  it('accepts uppercase hex', () => {
    expect(validateColorTokens({ ...valid, primary: '#AABBCC' }).success).toBe(true)
  })

  it('rejects 3-digit shorthand hex', () => {
    const r = validateColorTokens({ ...valid, primary: '#abc' })
    expect(r.success).toBe(false)
    if (!r.success) expect(r.errors.some((e) => e.path === 'primary')).toBe(true)
  })

  it('rejects hex without leading hash', () => {
    expect(validateColorTokens({ ...valid, primary: 'aabbcc' }).success).toBe(false)
  })

  it('rejects non-hex characters', () => {
    expect(validateColorTokens({ ...valid, primary: '#xxyyzz' }).success).toBe(false)
  })

  it('rejects missing required slot', () => {
    const { text: _omit, ...noText } = valid
    const r = validateColorTokens(noText)
    expect(r.success).toBe(false)
    if (!r.success) expect(r.errors.some((e) => e.path === 'text')).toBe(true)
  })

  it('rejects extra slot (.strict)', () => {
    expect(validateColorTokens({ ...valid, accent: '#112233' }).success).toBe(false)
  })
})

// ─── T-002: Typography token group (R2) ──────────────────────────────────────

describe('validateTypographyTokens', () => {
  const valid = { fontFamily: 'Inter', baseSizePx: 16, scaleRatio: 1.25 }

  it('accepts valid typography group', () => {
    const r = validateTypographyTokens(valid)
    expect(r.success).toBe(true)
    if (r.success) expect(r.data).toEqual(valid)
  })

  it('accepts boundary min (baseSizePx=8, scaleRatio=1.1)', () => {
    expect(validateTypographyTokens({ fontFamily: 'A', baseSizePx: 8, scaleRatio: 1.1 }).success).toBe(true)
  })

  it('accepts boundary max (baseSizePx=32, scaleRatio=2.0)', () => {
    expect(validateTypographyTokens({ fontFamily: 'A', baseSizePx: 32, scaleRatio: 2.0 }).success).toBe(true)
  })

  it('rejects baseSizePx < 8', () => {
    const r = validateTypographyTokens({ ...valid, baseSizePx: 7 })
    expect(r.success).toBe(false)
    if (!r.success) expect(r.errors.some((e) => e.path === 'baseSizePx')).toBe(true)
  })

  it('rejects baseSizePx > 32', () => {
    expect(validateTypographyTokens({ ...valid, baseSizePx: 33 }).success).toBe(false)
  })

  it('rejects scaleRatio < 1.1', () => {
    const r = validateTypographyTokens({ ...valid, scaleRatio: 1.0 })
    expect(r.success).toBe(false)
    if (!r.success) expect(r.errors.some((e) => e.path === 'scaleRatio')).toBe(true)
  })

  it('rejects scaleRatio > 2.0', () => {
    expect(validateTypographyTokens({ ...valid, scaleRatio: 2.1 }).success).toBe(false)
  })

  it('rejects non-numeric baseSizePx', () => {
    expect(validateTypographyTokens({ ...valid, baseSizePx: '16' }).success).toBe(false)
  })

  it('rejects empty fontFamily', () => {
    const r = validateTypographyTokens({ ...valid, fontFamily: '' })
    expect(r.success).toBe(false)
    if (!r.success) expect(r.errors.some((e) => e.path === 'fontFamily')).toBe(true)
  })

  it('rejects extra keys (.strict)', () => {
    expect(validateTypographyTokens({ ...valid, extra: 'x' }).success).toBe(false)
  })
})

// ─── T-003: Spacing token group (R3) ─────────────────────────────────────────

describe('validateSpacingTokens', () => {
  it('accepts valid baseUnitPx', () => {
    const r = validateSpacingTokens({ baseUnitPx: 8 })
    expect(r.success).toBe(true)
    if (r.success) expect(r.data.baseUnitPx).toBe(8)
  })

  it('accepts boundary min (2)', () => {
    expect(validateSpacingTokens({ baseUnitPx: 2 }).success).toBe(true)
  })

  it('accepts boundary max (16)', () => {
    expect(validateSpacingTokens({ baseUnitPx: 16 }).success).toBe(true)
  })

  it('rejects baseUnitPx < 2', () => {
    const r = validateSpacingTokens({ baseUnitPx: 1 })
    expect(r.success).toBe(false)
    if (!r.success) expect(r.errors.some((e) => e.path === 'baseUnitPx')).toBe(true)
  })

  it('rejects baseUnitPx > 16', () => {
    expect(validateSpacingTokens({ baseUnitPx: 17 }).success).toBe(false)
  })

  it('rejects non-numeric baseUnitPx', () => {
    expect(validateSpacingTokens({ baseUnitPx: '8' }).success).toBe(false)
  })

  it('rejects extra keys (.strict)', () => {
    expect(validateSpacingTokens({ baseUnitPx: 8, extra: true }).success).toBe(false)
  })
})

// ─── T-004: Theme configuration (R4) ─────────────────────────────────────────

describe('validateThemeConfig', () => {
  const valid = {
    name: 'my-theme',
    colors: { primary: '#aabbcc', secondary: '#001122', background: '#ffffff', text: '#000000' },
    typography: { fontFamily: 'Inter', baseSizePx: 16, scaleRatio: 1.25 },
    spacing: { baseUnitPx: 8 },
  }

  it('accepts full valid config', () => {
    expect(validateThemeConfig(valid).success).toBe(true)
  })

  it('rejects empty name', () => {
    const r = validateThemeConfig({ ...valid, name: '' })
    expect(r.success).toBe(false)
    if (!r.success) expect(r.errors.some((e) => e.path === 'name')).toBe(true)
  })

  it('validates colors via R1 rules (invalid hex rejected)', () => {
    const r = validateThemeConfig({ ...valid, colors: { ...valid.colors, primary: 'bad' } })
    expect(r.success).toBe(false)
    if (!r.success) expect(r.errors.some((e) => e.path.includes('primary'))).toBe(true)
  })

  it('validates typography via R2 rules (out-of-range baseSizePx rejected)', () => {
    const r = validateThemeConfig({ ...valid, typography: { ...valid.typography, baseSizePx: 5 } })
    expect(r.success).toBe(false)
    if (!r.success) expect(r.errors.some((e) => e.path.includes('baseSizePx'))).toBe(true)
  })

  it('validates spacing via R3 rules (out-of-range baseUnitPx rejected)', () => {
    const r = validateThemeConfig({ ...valid, spacing: { baseUnitPx: 99 } })
    expect(r.success).toBe(false)
    if (!r.success) expect(r.errors.some((e) => e.path.includes('baseUnitPx'))).toBe(true)
  })

  it('rejects unknown top-level field (.strict)', () => {
    expect(validateThemeConfig({ ...valid, extra: true }).success).toBe(false)
  })

  it('reports field path on nested failure', () => {
    const r = validateThemeConfig({ ...valid, colors: { ...valid.colors, text: 'bad' } })
    expect(r.success).toBe(false)
    if (!r.success) {
      const paths = r.errors.map((e) => e.path)
      expect(paths.some((p) => p.includes('text'))).toBe(true)
    }
  })
})

// ─── T-006: Validation surface (R6) ──────────────────────────────────────────

describe('validation surface properties', () => {
  it('success result contains parsed data', () => {
    const r = validateSpacingTokens({ baseUnitPx: 4 })
    expect(r.success).toBe(true)
    if (r.success) expect(r.data).toEqual({ baseUnitPx: 4 })
  })

  it('failure result contains errors with path and message', () => {
    const r = validateSpacingTokens({ baseUnitPx: 99 })
    expect(r.success).toBe(false)
    if (!r.success) {
      expect(Array.isArray(r.errors)).toBe(true)
      expect(r.errors.length).toBeGreaterThan(0)
      expect(typeof r.errors[0].path).toBe('string')
      expect(typeof r.errors[0].message).toBe('string')
      expect(r.errors[0].message.length).toBeGreaterThan(0)
    }
  })

  it('validation is deterministic', () => {
    const input = { baseUnitPx: 99 }
    expect(validateSpacingTokens(input)).toEqual(validateSpacingTokens(input))
  })

  it('validation does not mutate input', () => {
    const input: Record<string, unknown> = { baseUnitPx: 8, extra: 'x' }
    const before = JSON.stringify(input)
    validateSpacingTokens(input)
    expect(JSON.stringify(input)).toBe(before)
  })

  it('validateThemeConfig accepts full valid config', () => {
    const r = validateThemeConfig({
      name: 'my-theme',
      colors: { primary: '#aabbcc', secondary: '#001122', background: '#ffffff', text: '#000000' },
      typography: { fontFamily: 'Inter', baseSizePx: 16, scaleRatio: 1.25 },
      spacing: { baseUnitPx: 8 },
    })
    expect(r.success).toBe(true)
  })

  it('validateThemeConfig reports path on nested failure', () => {
    const r = validateThemeConfig({
      name: 'x',
      colors: { primary: 'bad', secondary: '#001122', background: '#ffffff', text: '#000000' },
      typography: { fontFamily: 'Inter', baseSizePx: 16, scaleRatio: 1.25 },
      spacing: { baseUnitPx: 8 },
    })
    expect(r.success).toBe(false)
    if (!r.success) expect(r.errors.some((e) => e.path.includes('primary'))).toBe(true)
  })

  it('validateThemeConfig rejects unknown top-level field', () => {
    const r = validateThemeConfig({
      name: 'x',
      colors: { primary: '#aabbcc', secondary: '#001122', background: '#ffffff', text: '#000000' },
      typography: { fontFamily: 'Inter', baseSizePx: 16, scaleRatio: 1.25 },
      spacing: { baseUnitPx: 8 },
      extra: true,
    })
    expect(r.success).toBe(false)
  })
})
