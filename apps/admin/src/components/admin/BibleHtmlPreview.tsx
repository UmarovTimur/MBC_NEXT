'use client'

import { useFormFields } from '@payloadcms/ui'
import styles from './BibleHtmlPreview.module.css'

export function BibleHtmlPreview() {
  const html = useFormFields(([fields]) => (fields?.html?.value as string | undefined) ?? '')

  return (
    <div className={styles.wrapper}>
      <span className={styles.label}>Live preview</span>
      {html.trim() ? (
        <div className={styles.preview} dangerouslySetInnerHTML={{ __html: html }} />
      ) : (
        <div className={`${styles.preview} ${styles.empty}`}>No HTML to preview yet.</div>
      )}
    </div>
  )
}
