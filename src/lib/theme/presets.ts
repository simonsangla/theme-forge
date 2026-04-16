import type { ThemeConfig } from '../../schema/theme'
import { DEFAULT_THEME } from './defaults'

/**
 * Built-in preset library. Stable across sessions, not user-editable.
 *
 * Each preset only specifies what differs from DEFAULT_THEME so the new
 * shadow + radius groups (and any future schema additions) flow through
 * automatically. Presets that want to override shadows / radii / extra color
 * slots can supply them inline; the rest inherit defaults.
 */

interface PresetSpec {
  label: string
  name: string
  colors: Partial<ThemeConfig['colors']>
  typography?: Partial<ThemeConfig['typography']>
  spacing?: Partial<ThemeConfig['spacing']>
  shadows?: Partial<ThemeConfig['shadows']>
  radii?: Partial<ThemeConfig['radii']>
}

function buildPreset(spec: PresetSpec): { label: string; theme: ThemeConfig } {
  return {
    label: spec.label,
    theme: {
      name: spec.name,
      colors: { ...DEFAULT_THEME.colors, ...spec.colors },
      typography: { ...DEFAULT_THEME.typography, ...spec.typography },
      spacing: { ...DEFAULT_THEME.spacing, ...spec.spacing },
      shadows: { ...DEFAULT_THEME.shadows, ...spec.shadows },
      radii: { ...DEFAULT_THEME.radii, ...spec.radii },
    },
  }
}

const SPECS: readonly PresetSpec[] = [
  {
    label: 'Ocean',
    name: 'Ocean',
    colors: {
      primary: '#0284c7',
      secondary: '#0369a1',
      background: '#f0f9ff',
      text: '#0c4a6e',
      muted: '#0e7490',
      hairline: '#bae6fd',
      inkSoft: '#155e75',
      surfaceInvert: '#0c4a6e',
      onInvert: '#f0f9ff',
    },
  },
  {
    label: 'Dark',
    name: 'Dark',
    colors: {
      primary: '#8b5cf6',
      secondary: '#6d28d9',
      background: '#1e1e2e',
      text: '#cdd6f4',
      muted: '#7f849c',
      hairline: '#313244',
      inkSoft: '#bac2de',
      surfaceInvert: '#cdd6f4',
      onInvert: '#1e1e2e',
    },
    typography: { fontFamily: 'ui-monospace, monospace', baseSizePx: 14, scaleRatio: 1.2 },
  },
  {
    label: 'Warm',
    name: 'Warm',
    colors: {
      primary: '#ea580c',
      secondary: '#c2410c',
      background: '#fff7ed',
      text: '#431407',
      muted: '#9a3412',
      hairline: '#fed7aa',
      inkSoft: '#7c2d12',
      surfaceInvert: '#431407',
      onInvert: '#fff7ed',
    },
    typography: { fontFamily: 'Georgia, serif', baseSizePx: 16, scaleRatio: 1.333 },
    spacing: { baseUnitPx: 5 },
  },
  {
    label: 'Forest',
    name: 'Forest',
    colors: {
      primary: '#16a34a',
      secondary: '#15803d',
      background: '#f0fdf4',
      text: '#14532d',
      muted: '#15803d',
      hairline: '#bbf7d0',
      inkSoft: '#166534',
      surfaceInvert: '#14532d',
      onInvert: '#f0fdf4',
    },
    typography: { fontFamily: 'system-ui, sans-serif', baseSizePx: 15, scaleRatio: 1.25 },
  },
  {
    label: 'Slate',
    name: 'Slate',
    colors: {
      primary: '#475569',
      secondary: '#334155',
      background: '#f8fafc',
      text: '#0f172a',
      muted: '#64748b',
      hairline: '#e2e8f0',
      inkSoft: '#1e293b',
      surfaceInvert: '#0f172a',
      onInvert: '#f8fafc',
    },
    typography: { fontFamily: 'system-ui, sans-serif', baseSizePx: 16, scaleRatio: 1.2 },
  },
  {
    label: 'Pays Basque',
    name: 'Pays Basque',
    colors: {
      primary: '#c8102e',
      secondary: '#0a6b3b',
      background: '#fdf6ee',
      text: '#1a1a1a',
      muted: '#5b5b53',
      hairline: '#e6e1d4',
      inkSoft: '#2e1a18',
      surfaceInvert: '#1a1a1a',
      onInvert: '#fdf6ee',
    },
    typography: { fontFamily: 'Georgia, serif', baseSizePx: 16, scaleRatio: 1.25 },
  },
]

export const PRESETS: readonly { label: string; theme: ThemeConfig }[] = SPECS.map(buildPreset)
