import { describe, it, expect } from 'vitest'
import { ShadowTokenSchema, validateShadowTokens } from '../../src/schema/theme'
import { DEFAULT_THEME } from '../../src/lib/theme/defaults'

const validShadows = DEFAULT_THEME.shadows

describe('ShadowTokenSchema — positive cases', () => {
  it('accepts DEFAULT_THEME shadows', () => {
    expect(ShadowTokenSchema.safeParse(validShadows).success).toBe(true)
  })

  it('accepts simple box-shadow strings', () => {
    const result = ShadowTokenSchema.safeParse({
      primary: '0 2px 4px #000',
      secondary: '0 1px 2px rgba(0,0,0,0.1)',
      card: '0 4px 8px rgba(0,0,0,0.12)',
      float: '0 8px 24px rgba(0,0,0,0.15)',
    })
    expect(result.success).toBe(true)
  })

  it('accepts multi-layer shadow with rgba (commas inside parens)', () => {
    const result = ShadowTokenSchema.safeParse({
      primary: '0 2px 4px rgba(5,26,36,0.10), 0 4px 8px rgba(0,0,0,0.2)',
      secondary: '0 1px 2px #ccc',
      card: '0 4px 8px #aaa',
      float: '0 8px 24px #999',
    })
    expect(result.success).toBe(true)
  })

  it('accepts inset shadow', () => {
    const result = ShadowTokenSchema.safeParse({
      primary: 'inset 0 2px 4px rgba(0,0,0,0.1)',
      secondary: '0 1px 2px #ccc',
      card: '0 4px 8px #aaa',
      float: '0 8px 24px #999',
    })
    expect(result.success).toBe(true)
  })
})

describe('ShadowTokenSchema — missing slot rejected', () => {
  it('rejects missing primary', () => {
    const { primary: _p, ...rest } = validShadows
    expect(ShadowTokenSchema.safeParse(rest).success).toBe(false)
  })

  it('rejects missing secondary', () => {
    const { secondary: _s, ...rest } = validShadows
    expect(ShadowTokenSchema.safeParse(rest).success).toBe(false)
  })

  it('rejects missing card', () => {
    const { card: _c, ...rest } = validShadows
    expect(ShadowTokenSchema.safeParse(rest).success).toBe(false)
  })

  it('rejects missing float', () => {
    const { float: _f, ...rest } = validShadows
    expect(ShadowTokenSchema.safeParse(rest).success).toBe(false)
  })

  it('rejects empty object', () => {
    expect(ShadowTokenSchema.safeParse({}).success).toBe(false)
  })
})

describe('ShadowTokenSchema — invalid values rejected', () => {
  it('rejects empty-string slot', () => {
    expect(ShadowTokenSchema.safeParse({ ...validShadows, primary: '' }).success).toBe(false)
  })

  it('rejects non-string slot (number)', () => {
    expect(ShadowTokenSchema.safeParse({ ...validShadows, primary: 42 }).success).toBe(false)
  })

  it('rejects non-string slot (null)', () => {
    expect(ShadowTokenSchema.safeParse({ ...validShadows, primary: null }).success).toBe(false)
  })

  it('rejects extra unknown slot (.strict)', () => {
    expect(ShadowTokenSchema.safeParse({ ...validShadows, extra: '0 0 0 #000' }).success).toBe(false)
  })
})

describe('validateShadowTokens', () => {
  it('returns success + data for valid input', () => {
    const r = validateShadowTokens(validShadows)
    expect(r.success).toBe(true)
    if (r.success) expect(r.data).toEqual(validShadows)
  })

  it('returns errors with paths for invalid input', () => {
    const r = validateShadowTokens({ primary: '' })
    expect(r.success).toBe(false)
    if (!r.success) expect(r.errors.length).toBeGreaterThan(0)
  })
})
