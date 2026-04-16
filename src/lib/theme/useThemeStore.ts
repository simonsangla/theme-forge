import { useReducer, useCallback } from 'react'
import type { ThemeConfig } from '../../schema/theme'
import { ThemeConfigSchema, validateThemeConfig } from '../../schema/theme'
import type { ValidationResult } from '../../schema/theme'
import { DEFAULT_THEME } from './defaults'

const HISTORY_LIMIT = 50

// T-009: history-aware state shape
interface ThemeState {
  past: ThemeConfig[]    // oldest → newest prior states
  theme: ThemeConfig     // current active theme (always valid)
  future: ThemeConfig[]  // states available for redo (newest → oldest)
  // Cold-load flag: when true, the current entry is the initial state (not an undoable change)
  isInitialLoad: boolean
}

type ThemeAction =
  | { type: 'COMMIT'; next: ThemeConfig; isInitialLoad?: boolean }
  | { type: 'UNDO' }
  | { type: 'REDO' }

function themeReducer(state: ThemeState, action: ThemeAction): ThemeState {
  switch (action.type) {
    case 'COMMIT': {
      const valid = ThemeConfigSchema.safeParse(action.next)
      if (!valid.success) return state
      if (action.isInitialLoad) {
        // Cold-load restore: becomes initial state, no prior states
        return { past: [], theme: valid.data, future: [], isInitialLoad: true }
      }
      // Regular commit: push current to past, clear future
      const newPast = [...state.past, state.theme].slice(-HISTORY_LIMIT)
      return { past: newPast, theme: valid.data, future: [], isInitialLoad: false }
    }
    case 'UNDO': {
      if (state.past.length === 0) return state
      const previous = state.past[state.past.length - 1]
      return {
        past: state.past.slice(0, -1),
        theme: previous,
        future: [state.theme, ...state.future],
        isInitialLoad: false,
      }
    }
    case 'REDO': {
      if (state.future.length === 0) return state
      const next = state.future[0]
      return {
        past: [...state.past, state.theme].slice(-HISTORY_LIMIT),
        theme: next,
        future: state.future.slice(1),
        isInitialLoad: false,
      }
    }
  }
}

// T-008 + T-009: Active theme store with undo/redo history
export function useThemeStore(initial: ThemeConfig = DEFAULT_THEME) {
  const [state, dispatch] = useReducer(themeReducer, {
    past: [],
    theme: initial,
    future: [],
    isInitialLoad: true,
  })

  // Full validated commit (used by presets, import, reset, external adoption).
  // isInitialLoad=true → becomes initial history state (no prior states to undo).
  const commitTheme = useCallback(
    (candidate: unknown, isInitialLoad = false): ValidationResult<ThemeConfig> => {
      const result = validateThemeConfig(candidate)
      if (result.success) {
        dispatch({ type: 'COMMIT', next: result.data, isInitialLoad })
      }
      return result
    },
    [],
  )

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

  const undo = useCallback(() => dispatch({ type: 'UNDO' }), [])
  const redo = useCallback(() => dispatch({ type: 'REDO' }), [])

  return {
    theme: state.theme,
    commitTheme,
    updateColors,
    updateTypography,
    updateSpacing,
    updateName,
    undo,
    redo,
    canUndo: state.past.length > 0,
    canRedo: state.future.length > 0,
    historySize: state.past.length,
  }
}

export type ThemeStore = ReturnType<typeof useThemeStore>
