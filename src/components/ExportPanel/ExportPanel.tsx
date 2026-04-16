import { useState, useCallback } from 'react'
import type { ThemeConfig } from '../../schema/theme'
import type { WidgetSelection } from '../../schema/widgets'
import {
  toJSON, toCSSVars, toTSObject, toTailwindConfig, toSCSSVars, toStyleDictionary,
} from '../../export/exportTheme'
import styles from './ExportPanel.module.css'

// T-029 / R8 — all 6 selectable formats
type Format = 'json' | 'css' | 'ts' | 'tailwind' | 'scss' | 'style-dictionary'

interface FormatMeta {
  id: Format
  label: string
  ext: string
  generate: (theme: ThemeConfig, widgets?: WidgetSelection) => string
}

const FORMATS: FormatMeta[] = [
  { id: 'json',             label: 'JSON',           ext: '.json',       generate: toJSON },
  { id: 'css',              label: 'CSS Vars',        ext: '.css',        generate: toCSSVars },
  { id: 'ts',               label: 'TypeScript',      ext: '.ts',         generate: toTSObject },
  { id: 'tailwind',         label: 'Tailwind',        ext: '.js',         generate: toTailwindConfig },
  { id: 'scss',             label: 'SCSS',            ext: '.scss',       generate: toSCSSVars },
  { id: 'style-dictionary', label: 'Style Dict',      ext: '.tokens.json', generate: toStyleDictionary },
]

function toSafeFilename(name: string): string {
  return name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '') || 'theme'
}

interface Props {
  theme: ThemeConfig
  widgets: WidgetSelection
}

export default function ExportPanel({ theme, widgets }: Props) {
  const [format, setFormat] = useState<Format>('json')
  const [copyStatus, setCopyStatus] = useState<'idle' | 'ok' | 'err'>('idle')

  const meta = FORMATS.find(f => f.id === format)!
  // T-032 / R11: generation is pure — no mutation, no undo entry, no persist write
  const output = meta.generate(theme, widgets)

  // T-030 / R9 — copy exact displayed output
  const handleCopy = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(output)
      setCopyStatus('ok')
    } catch {
      setCopyStatus('err')
    }
    setTimeout(() => setCopyStatus('idle'), 2000)
  }, [output])

  // T-031 / R10 — download with correct extension, theme-name filename
  const handleDownload = useCallback(() => {
    const filename = `${toSafeFilename(theme.name)}${meta.ext}`
    const blob = new Blob([output], { type: 'text/plain' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = filename
    a.click()
    URL.revokeObjectURL(url)
  }, [output, theme.name, meta.ext])

  return (
    <div className={styles.panel}>
      {/* Format selector — T-029 / R8 */}
      <div className={styles.tabs} role="tablist" aria-label="Export format">
        {FORMATS.map(f => (
          <button
            key={f.id}
            role="tab"
            type="button"
            aria-selected={format === f.id}
            className={`${styles.tab} ${format === f.id ? styles.tabActive : ''}`}
            onClick={() => setFormat(f.id)}
          >
            {f.label}
          </button>
        ))}
      </div>

      {/* Actions — T-030 copy + T-031 download */}
      <div className={styles.actions}>
        <button type="button" className={styles.actionBtn} onClick={handleCopy}>
          {copyStatus === 'ok' ? 'Copied!' : copyStatus === 'err' ? 'Copy failed' : 'Copy'}
        </button>
        <button type="button" className={styles.actionBtn} onClick={handleDownload}>
          Download {meta.ext}
        </button>
      </div>

      {/* Monospaced output — T-029 / R8 */}
      <pre className={styles.code} data-testid="export-output">{output}</pre>
    </div>
  )
}
