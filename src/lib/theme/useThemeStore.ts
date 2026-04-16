import { useReducer, useCallback } from 'react'
import type { ThemeConfig } from '../../schema/theme'
import { ThemeConfigSchema, validateThemeConfig } from '../../schema/theme'
import type { ValidationResult } from '../../schema/theme'
import { DEFAULT_THEME } from './defaults'

// Internal state shape — extended by T-009 to add history stack
interface ThemeState {
  theme: ThemeConfig
}

type ThemeAction =
  | { type: 'COMMIT'; next: ThemeConfig }

function themeReducer(state: ThemeState, action: ThemeAction): ThemeState {
  switch (action.type) {
    case 'COMMIT':
      // Validate to guarantee the active theme always satisfies R4
      return ThemeConfigSchema.safeParse(action.next).success
        ? { ...state, theme: action.next }
        : state
  }
}

// T-008 (R6): Active theme state store
// - Single source of truth for the active ThemeConfig
// - Always satisfies schema validation (invalid commits are silently rejected)
// - Subscribers notified via React re-render on every committed change
// - Reading .theme always returns the most recently committed valid value
export function useThemeStore(initial: ThemeConfig = DEFAULT_THEME) {
  const [state, dispatch] = useReducer(themeReducer, { theme: initial })

  // Commit a full theme replacement (used by presets, import, reset, external adoption)
  // Returns a ValidationResult so callers can surface errors to the user
  const commitTheme = useCallback(
    (candidate: unknown): ValidationResult<ThemeConfig> => {
      const result = validateThemeConfig(candidate)
      if (result.success) {
        dispatch({ type: 'COMMIT', next: result.data })
      }
      return result
    },
    [],
  )

  // Partial update helpers — merge partial into active theme, then validate + commit
  const updateColors = useCallback(
    (partial: Partial<ThemeConfig['colors']>) => {
      commitTheme({ ...state.theme, colors: { ...state.theme.colors, ...partial } })
    },
    [state.theme, commitTheme],
  )

  const updateTypography = useCallback(
    (partial: Partial<ThemeConfig['typography']>) => {
      commitTheme({ ...state.theme, typography: { ...state.theme.typography, ...partial } })
    },
    [state.theme, commitTheme],
  )

  const updateSpacing = useCallback(
    (partial: Partial<ThemeConfig['spacing']>) => {
      commitTheme({ ...state.theme, spacing: { ...state.theme.spacing, ...partial } })
    },
    [state.theme, commitTheme],
  )

  const updateName = useCallback(
    (name: string) => {
      commitTheme({ ...state.theme, name })
    },
    [state.theme, commitTheme],
  )

  return {
    theme: state.theme,
    commitTheme,
    updateColors,
    updateTypography,
    updateSpacing,
    updateName,
  }
}

export type ThemeStore = ReturnType<typeof useThemeStore>
