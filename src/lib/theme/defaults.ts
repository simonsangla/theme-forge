import type { ThemeConfig } from '../../schema/theme'

export const DEFAULT_THEME: ThemeConfig = {
  name: 'default',
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
}
