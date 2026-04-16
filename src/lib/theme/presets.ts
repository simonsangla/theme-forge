import type { ThemeConfig } from '../../schema/theme'

/** Built-in preset library (T-014 / R5). Stable across sessions, not user-editable. */
export const PRESETS: readonly { label: string; theme: ThemeConfig }[] = [
  {
    label: 'Ocean',
    theme: {
      name: 'Ocean',
      colors: { primary: '#0284c7', secondary: '#0369a1', background: '#f0f9ff', text: '#0c4a6e' },
      typography: { fontFamily: 'system-ui, sans-serif', baseSizePx: 16, scaleRatio: 1.25 },
      spacing: { baseUnitPx: 4 },
    },
  },
  {
    label: 'Dark',
    theme: {
      name: 'Dark',
      colors: { primary: '#8b5cf6', secondary: '#6d28d9', background: '#1e1e2e', text: '#cdd6f4' },
      typography: { fontFamily: 'ui-monospace, monospace', baseSizePx: 14, scaleRatio: 1.2 },
      spacing: { baseUnitPx: 4 },
    },
  },
  {
    label: 'Warm',
    theme: {
      name: 'Warm',
      colors: { primary: '#ea580c', secondary: '#c2410c', background: '#fff7ed', text: '#431407' },
      typography: { fontFamily: 'Georgia, serif', baseSizePx: 16, scaleRatio: 1.333 },
      spacing: { baseUnitPx: 5 },
    },
  },
  {
    label: 'Forest',
    theme: {
      name: 'Forest',
      colors: { primary: '#16a34a', secondary: '#15803d', background: '#f0fdf4', text: '#14532d' },
      typography: { fontFamily: 'system-ui, sans-serif', baseSizePx: 15, scaleRatio: 1.25 },
      spacing: { baseUnitPx: 4 },
    },
  },
  {
    label: 'Slate',
    theme: {
      name: 'Slate',
      colors: { primary: '#475569', secondary: '#334155', background: '#f8fafc', text: '#0f172a' },
      typography: { fontFamily: 'system-ui, sans-serif', baseSizePx: 16, scaleRatio: 1.2 },
      spacing: { baseUnitPx: 4 },
    },
  },
] as const
