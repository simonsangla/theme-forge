import { describe, it, expect } from 'vitest'
import { toJSON, toCSSVars, toTSObject } from '../../src/export/exportTheme'
import type { ThemeConfig } from '../../src/schema/theme'

const baseTheme: ThemeConfig = {
  name: 'test-theme',
  colors: {
    primary: '#3b82f6',
    secondary: '#8b5cf6',
    background: '#ffffff',
    text: '#111827',
  },
  typography: {
    fontFamily: 'Inter, sans-serif',
    baseSizePx: 16,
    scaleRatio: 1.25,
  },
  spacing: {
    baseUnitPx: 4,
  },
}

describe('toJSON', () => {
  it('produces valid JSON matching snapshot', () => {
    expect(toJSON(baseTheme)).toMatchSnapshot()
  })

  it('round-trips through JSON.parse', () => {
    const parsed = JSON.parse(toJSON(baseTheme))
    expect(parsed.name).toBe(baseTheme.name)
    expect(parsed.colors.primary).toBe(baseTheme.colors.primary)
  })
})

describe('toCSSVars', () => {
  it('produces CSS custom properties matching snapshot', () => {
    expect(toCSSVars(baseTheme)).toMatchSnapshot()
  })

  it('includes all token categories', () => {
    const css = toCSSVars(baseTheme)
    expect(css).toContain('--color-primary')
    expect(css).toContain('--font-family')
    expect(css).toContain('--spacing-base')
    expect(css).toContain(':root {')
  })
})

describe('toTSObject', () => {
  it('produces TS object export matching snapshot', () => {
    expect(toTSObject(baseTheme)).toMatchSnapshot()
  })

  it('starts with export const theme', () => {
    expect(toTSObject(baseTheme)).toMatch(/^export const theme =/)
  })
})
