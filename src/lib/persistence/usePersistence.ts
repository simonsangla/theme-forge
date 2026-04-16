/**
 * T-033 / T-037: Hook that wires auto-save + availability detection.
 *
 * Returns:
 * - loadResult  — result of the initial load (for App to act on)
 * - save(theme) — persists the theme; returns save result
 * - clear()     — removes the persisted record
 * - storageOk   — false if localStorage unavailable at mount
 */

import { useRef, useCallback } from 'react'
import type { ThemeConfig } from '../../schema/theme'
import { loadTheme, saveTheme, clearTheme, isStorageAvailable, type LoadResult, type SaveResult } from './storage'

export interface PersistenceHook {
  loadResult: LoadResult
  save: (theme: ThemeConfig) => SaveResult
  clear: () => void
  storageOk: boolean
}

export function usePersistence(): PersistenceHook {
  // Load once at mount time — stable ref, never changes
  const loadResultRef = useRef<LoadResult | null>(null)
  if (loadResultRef.current === null) {
    loadResultRef.current = loadTheme()
  }

  const storageOk = isStorageAvailable()

  const save = useCallback((theme: ThemeConfig): SaveResult => {
    return saveTheme(theme)
  }, [])

  const clear = useCallback(() => {
    clearTheme()
  }, [])

  return {
    loadResult: loadResultRef.current,
    save,
    clear,
    storageOk,
  }
}
