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

describe('ShadowTokenSchema — backslash exemption (R8 revised)', () => {
  // CSS hex escapes are decoded inside the value token after declaration parsing
  // per CSS Syntax Level 3, so they cannot break the :root { --shadow-x: VALUE; }
  // declaration boundary. Backslash is intentionally NOT in the blocklist.
  it('accepts shadow value containing CSS hex escape "\\3b" (encoded semicolon)', () => {
    const result = ShadowTokenSchema.safeParse({
      ...validShadows,
      primary: '0 1px 2px red\\3b color: blue',
    })
    expect(result.success).toBe(true)
  })

  it('accepts shadow value containing other CSS hex escapes', () => {
    expect(
      ShadowTokenSchema.safeParse({ ...validShadows, primary: '0 1px 2px \\7d red' }).success,
    ).toBe(true)
  })

  it('exported CSS containing escaped value remains a single well-formed declaration', () => {
    // Sanity: the escaped value lands inside a single `--shadow-primary: ...;`
    // declaration in the CSS output — no premature closing.
    const themed = { ...validShadows, primary: '0 1px 2px red\\3b color' }
    const result = ShadowTokenSchema.safeParse(themed)
    expect(result.success).toBe(true)
    // Build a tiny CSS snippet the way exportTheme.toCSSVars would, to prove
    // the escape doesn't break the declaration boundary syntactically.
    const css = `:root { --shadow-primary: ${themed.primary}; }`
    // Exactly one `:root {`, exactly one closing `}`, exactly one `;` (the
    // declaration terminator — the `\3b` is inside the value, not a delimiter).
    expect((css.match(/:root \{/g) ?? []).length).toBe(1)
    expect((css.match(/}/g) ?? []).length).toBe(1)
    expect((css.match(/;/g) ?? []).length).toBe(1)
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
