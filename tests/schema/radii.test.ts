import { describe, it, expect } from 'vitest'
import { RadiusTokenSchema, validateRadiusTokens } from '../../src/schema/theme'
import { DEFAULT_THEME } from '../../src/lib/theme/defaults'

const validRadii = DEFAULT_THEME.radii

describe('RadiusTokenSchema — positive cases', () => {
  it('accepts DEFAULT_THEME radii', () => {
    expect(RadiusTokenSchema.safeParse(validRadii).success).toBe(true)
  })

  it('accepts all-zero radii', () => {
    expect(RadiusTokenSchema.safeParse({ pill: 0, sm: 0, md: 0, lg: 0, xl: 0 }).success).toBe(true)
  })

  it('accepts pill at the sentinel max (9999)', () => {
    expect(RadiusTokenSchema.safeParse({ ...validRadii, pill: 9999 }).success).toBe(true)
  })

  it('accepts strict ascending sm < md < lg < xl', () => {
    expect(RadiusTokenSchema.safeParse({ pill: 9999, sm: 2, md: 4, lg: 8, xl: 16 }).success).toBe(true)
  })

  it('accepts equal sm === md (boundary of ascending rule)', () => {
    expect(RadiusTokenSchema.safeParse({ pill: 9999, sm: 4, md: 4, lg: 8, xl: 16 }).success).toBe(true)
  })
})

describe('RadiusTokenSchema — missing slot rejected', () => {
  for (const k of ['pill', 'sm', 'md', 'lg', 'xl'] as const) {
    it(`rejects missing ${k}`, () => {
      const { [k]: _, ...rest } = validRadii
      expect(RadiusTokenSchema.safeParse(rest).success).toBe(false)
    })
  }

  it('rejects empty object', () => {
    expect(RadiusTokenSchema.safeParse({}).success).toBe(false)
  })
})

describe('RadiusTokenSchema — invalid values rejected', () => {
  it('rejects non-numeric sm (string)', () => {
    expect(RadiusTokenSchema.safeParse({ ...validRadii, sm: 'small' }).success).toBe(false)
  })

  it('rejects non-numeric md (null)', () => {
    expect(RadiusTokenSchema.safeParse({ ...validRadii, md: null }).success).toBe(false)
  })

  it('rejects extra unknown slot (.strict)', () => {
    expect(RadiusTokenSchema.safeParse({ ...validRadii, xxl: 9999 }).success).toBe(false)
  })

  it('rejects negative value (out-of-range)', () => {
    expect(RadiusTokenSchema.safeParse({ ...validRadii, sm: -1 }).success).toBe(false)
  })

  it('rejects value above 9999 (out-of-range)', () => {
    expect(RadiusTokenSchema.safeParse({ ...validRadii, xl: 10000 }).success).toBe(false)
  })
})

describe('RadiusTokenSchema — ascending-order rule', () => {
  it('rejects sm > md', () => {
    expect(RadiusTokenSchema.safeParse({ pill: 9999, sm: 8, md: 4, lg: 8, xl: 16 }).success).toBe(false)
  })

  it('rejects md > lg', () => {
    expect(RadiusTokenSchema.safeParse({ pill: 9999, sm: 2, md: 10, lg: 8, xl: 16 }).success).toBe(false)
  })

  it('rejects lg > xl', () => {
    expect(RadiusTokenSchema.safeParse({ pill: 9999, sm: 2, md: 4, lg: 20, xl: 16 }).success).toBe(false)
  })
})

describe('validateRadiusTokens', () => {
  it('returns success + data for valid input', () => {
    const r = validateRadiusTokens(validRadii)
    expect(r.success).toBe(true)
    if (r.success) expect(r.data).toEqual(validRadii)
  })

  it('returns errors for invalid input', () => {
    const r = validateRadiusTokens({ pill: 9999, sm: 8, md: 4, lg: 8, xl: 16 })
    expect(r.success).toBe(false)
    if (!r.success) expect(r.errors.length).toBeGreaterThan(0)
  })
})
