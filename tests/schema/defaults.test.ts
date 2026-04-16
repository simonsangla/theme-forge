import { describe, it, expect } from 'vitest'
import { DEFAULT_THEME } from '../../src/lib/theme/defaults'
import { validateThemeConfig } from '../../src/schema/theme'

// T-007: Default theme constant (R7)

describe('DEFAULT_THEME', () => {
  it('passes schema validation', () => {
    const r = validateThemeConfig(DEFAULT_THEME)
    expect(r.success).toBe(true)
  })

  it('has a non-empty human-readable name', () => {
    expect(typeof DEFAULT_THEME.name).toBe('string')
    expect(DEFAULT_THEME.name.length).toBeGreaterThan(0)
  })

  it('is immutable — top-level write throws in strict mode', () => {
    expect(() => {
      ;(DEFAULT_THEME as Record<string, unknown>).name = 'mutated'
    }).toThrow()
  })

  it('is immutable — nested colors write throws in strict mode', () => {
    expect(() => {
      ;(DEFAULT_THEME.colors as Record<string, unknown>).primary = '#000000'
    }).toThrow()
  })

  it('returns same reference on repeated access', () => {
    const a = DEFAULT_THEME
    const b = DEFAULT_THEME
    expect(a).toBe(b)
  })
})
