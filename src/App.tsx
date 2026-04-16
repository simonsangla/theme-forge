import { useReducer } from 'react'
import type { ThemeConfig } from './schema/theme'
import { ThemeConfigSchema } from './schema/theme'
import { DEFAULT_THEME } from './lib/theme/defaults'
import ThemeEditor from './components/ThemeEditor/ThemeEditor'
import ThemePreview from './components/ThemePreview/ThemePreview'
import styles from './App.module.css'

type ThemeAction =
  | { type: 'SET_COLORS'; payload: Partial<ThemeConfig['colors']> }
  | { type: 'SET_TYPOGRAPHY'; payload: Partial<ThemeConfig['typography']> }
  | { type: 'SET_SPACING'; payload: Partial<ThemeConfig['spacing']> }

function themeReducer(state: ThemeConfig, action: ThemeAction): ThemeConfig {
  let candidate: ThemeConfig
  switch (action.type) {
    case 'SET_COLORS':
      candidate = { ...state, colors: { ...state.colors, ...action.payload } }
      break
    case 'SET_TYPOGRAPHY':
      candidate = {
        ...state,
        typography: { ...state.typography, ...action.payload },
      }
      break
    case 'SET_SPACING':
      candidate = { ...state, spacing: { ...state.spacing, ...action.payload } }
      break
    default:
      return state
  }
  const result = ThemeConfigSchema.safeParse(candidate)
  return result.success ? result.data : state
}

export default function App() {
  const [theme, dispatch] = useReducer(themeReducer, DEFAULT_THEME)

  return (
    <div className={styles.app}>
      <header className={styles.topbar}>
        <span className={styles.brand}>theme-forge</span>
      </header>
      <div className={styles.workspace}>
        <aside className={styles.sidebar}>
          <ThemeEditor
            theme={theme}
            onColorsChange={(p) =>
              dispatch({ type: 'SET_COLORS', payload: p })
            }
            onTypographyChange={(p) =>
              dispatch({ type: 'SET_TYPOGRAPHY', payload: p })
            }
            onSpacingChange={(p) =>
              dispatch({ type: 'SET_SPACING', payload: p })
            }
          />
        </aside>
        <main className={styles.canvas}>
          <ThemePreview theme={theme} />
        </main>
      </div>
    </div>
  )
}
