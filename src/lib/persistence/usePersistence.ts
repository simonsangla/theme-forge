/**
 * Hook that wires auto-save + availability detection.
 *
 * Returns:
 * - loadResult  — result of the initial load (for App to act on)
 * - save(theme, widgets) — persists the payload; returns save result
 * - clear()     — removes the persisted record
 * - storageOk   — false if localStorage unavailable at mount
 */

import { useState, useCallback } from 'react'
import type { ThemeConfig } from '../../schema/theme'
import type { WidgetSelection } from '../../schema/widgets'
import { loadTheme, saveTheme, clearTheme, isStorageAvailable, type LoadResult, type SaveResult } from './storage'

export interface PersistenceHook {
  loadResult: LoadResult
  save: (theme: ThemeConfig, widgets: WidgetSelection) => SaveResult
  clear: () => void
  storageOk: boolean
}

export function usePersistence(): PersistenceHook {
  // Load once at mount via lazy initializer — stable for the lifetime of the hook
  const [loadResult] = useState<LoadResult>(() => loadTheme())
  const [storageOk] = useState<boolean>(() => isStorageAvailable())

  const save = useCallback((theme: ThemeConfig, widgets: WidgetSelection): SaveResult => {
    return saveTheme(theme, widgets)
  }, [])

  const clear = useCallback(() => {
    clearTheme()
  }, [])

  return {
    loadResult,
    save,
    clear,
    storageOk,
  }
}
