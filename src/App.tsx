import type React from 'react'
import { themeToStyleVars } from './lib/theme/applyTheme'
import { useThemeStore } from './lib/theme/useThemeStore'
import ThemeEditor from './components/ThemeEditor/ThemeEditor'
import ThemePreview from './components/ThemePreview/ThemePreview'
import styles from './App.module.css'

export default function App() {
  const store = useThemeStore()

  return (
    <div className={styles.app} style={themeToStyleVars(store.theme) as React.CSSProperties}>
      <header className={styles.topbar}>
        <span className={styles.brand}>theme-forge</span>
      </header>
      <div className={styles.workspace}>
        <aside className={styles.sidebar}>
          <ThemeEditor
            theme={store.theme}
            onColorsChange={store.updateColors}
            onTypographyChange={store.updateTypography}
            onSpacingChange={store.updateSpacing}
          />
        </aside>
        <main className={styles.canvas}>
          <ThemePreview theme={store.theme} />
        </main>
      </div>
    </div>
  )
}
