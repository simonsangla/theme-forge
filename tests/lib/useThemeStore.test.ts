import { describe, it, expect } from 'vitest'
import { renderHook, act } from '@testing-library/react'
import { useThemeStore } from '../../src/lib/theme/useThemeStore'
import { DEFAULT_THEME } from '../../src/lib/theme/defaults'

const validAlt: typeof DEFAULT_THEME = {
  ...DEFAULT_THEME,
  name: 'Alt',
  colors: { ...DEFAULT_THEME.colors, primary: '#ff0000' },
}

const validAlt2: typeof DEFAULT_THEME = {
  ...DEFAULT_THEME,
  name: 'Alt2',
  colors: { ...DEFAULT_THEME.colors, primary: '#00ff00' },
}

// T-008 (R6): Active theme state

describe('useThemeStore — T-008 active theme state', () => {
  it('initialises with the provided theme', () => {
    const { result } = renderHook(() => useThemeStore(DEFAULT_THEME))
    expect(result.current.theme).toEqual(DEFAULT_THEME)
  })

  it('commitTheme replaces active theme with valid input', () => {
    const { result } = renderHook(() => useThemeStore())
    act(() => { result.current.commitTheme(validAlt) })
    expect(result.current.theme.colors.primary).toBe('#ff0000')
  })

  it('active theme always satisfies schema — invalid commit rejected', () => {
    const { result } = renderHook(() => useThemeStore())
    act(() => { result.current.commitTheme({ ...DEFAULT_THEME, colors: { ...DEFAULT_THEME.colors, primary: 'bad' } }) })
    // Theme unchanged
    expect(result.current.theme).toEqual(DEFAULT_THEME)
  })

  it('commitTheme returns success result for valid input', () => {
    const { result } = renderHook(() => useThemeStore())
    let res: ReturnType<typeof result.current.commitTheme>
    act(() => { res = result.current.commitTheme(validAlt) })
    expect(res!.success).toBe(true)
  })

  it('commitTheme returns failure result for invalid input', () => {
    const { result } = renderHook(() => useThemeStore())
    let res: ReturnType<typeof result.current.commitTheme>
    act(() => { res = result.current.commitTheme({ invalid: true }) })
    expect(res!.success).toBe(false)
  })

  it('reading theme after update returns latest committed value', () => {
    const { result } = renderHook(() => useThemeStore())
    act(() => { result.current.commitTheme(validAlt) })
    act(() => { result.current.commitTheme(validAlt2) })
    expect(result.current.theme.colors.primary).toBe('#00ff00')
  })
})

// T-009 (R7): Undo / redo history

describe('useThemeStore — T-009 undo/redo', () => {
  it('undo is unavailable at initialisation (canUndo=false)', () => {
    const { result } = renderHook(() => useThemeStore())
    expect(result.current.canUndo).toBe(false)
  })

  it('redo is unavailable at initialisation (canRedo=false)', () => {
    const { result } = renderHook(() => useThemeStore())
    expect(result.current.canRedo).toBe(false)
  })

  it('after one commit canUndo becomes true', () => {
    const { result } = renderHook(() => useThemeStore())
    act(() => { result.current.commitTheme(validAlt) })
    expect(result.current.canUndo).toBe(true)
  })

  it('undo restores active theme to prior committed value', () => {
    const { result } = renderHook(() => useThemeStore())
    act(() => { result.current.commitTheme(validAlt) })
    act(() => { result.current.undo() })
    expect(result.current.theme).toEqual(DEFAULT_THEME)
  })

  it('after undo canRedo becomes true', () => {
    const { result } = renderHook(() => useThemeStore())
    act(() => { result.current.commitTheme(validAlt) })
    act(() => { result.current.undo() })
    expect(result.current.canRedo).toBe(true)
  })

  it('redo restores the just-undone value', () => {
    const { result } = renderHook(() => useThemeStore())
    act(() => { result.current.commitTheme(validAlt) })
    act(() => { result.current.undo() })
    act(() => { result.current.redo() })
    expect(result.current.theme.colors.primary).toBe('#ff0000')
  })

  it('undo when unavailable is a no-op', () => {
    const { result } = renderHook(() => useThemeStore())
    const before = result.current.theme
    act(() => { result.current.undo() })
    expect(result.current.theme).toEqual(before)
  })

  it('redo when unavailable is a no-op', () => {
    const { result } = renderHook(() => useThemeStore())
    const before = result.current.theme
    act(() => { result.current.redo() })
    expect(result.current.theme).toEqual(before)
  })

  it('new commit after undo clears redo stack', () => {
    const { result } = renderHook(() => useThemeStore())
    act(() => { result.current.commitTheme(validAlt) })
    act(() => { result.current.undo() })
    expect(result.current.canRedo).toBe(true)
    act(() => { result.current.commitTheme(validAlt2) })
    expect(result.current.canRedo).toBe(false)
  })

  it('retains at least last 50 committed changes', () => {
    const { result } = renderHook(() => useThemeStore())
    // commit 52 distinct changes
    for (let i = 0; i < 52; i++) {
      const hex = `#${i.toString(16).padStart(2, '0')}0000`
      act(() => {
        result.current.commitTheme({
          ...DEFAULT_THEME,
          name: `t${i}`,
          colors: { ...DEFAULT_THEME.colors, primary: `#${String(i).padStart(2, '0')}0000`.slice(0, 7) || '#aabbcc' },
        })
      })
    }
    expect(result.current.historySize).toBeGreaterThanOrEqual(50)
    // Can undo at least 50 times
    for (let i = 0; i < 50; i++) {
      act(() => { result.current.undo() })
    }
    expect(result.current.canUndo).toBe(false)
  })

  it('isInitialLoad commit becomes initial history state (cannot undo)', () => {
    const { result } = renderHook(() => useThemeStore())
    // Simulate cold-load restore
    act(() => { result.current.commitTheme(validAlt, true) })
    expect(result.current.canUndo).toBe(false)
    expect(result.current.theme.colors.primary).toBe('#ff0000')
  })

  it('user-initiated import after cold-load is undoable', () => {
    const { result } = renderHook(() => useThemeStore())
    act(() => { result.current.commitTheme(validAlt, true) })  // cold-load
    act(() => { result.current.commitTheme(validAlt2) })        // user import
    expect(result.current.canUndo).toBe(true)
    act(() => { result.current.undo() })
    expect(result.current.theme.colors.primary).toBe('#ff0000') // back to cold-loaded
  })
})
