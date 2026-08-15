'use client'

import { useFormFields } from '@payloadcms/ui'
import { renderVerseHtml, type Block, type Segment } from '@mbc/bible-verses'
import styles from './BibleHtmlPreview.module.css'

/**
 * Live preview for a single verse, rendered through the same function the public
 * site uses. Editing a verse means editing the `segments` JSON, so a preview is
 * the only practical way to see what the markup actually produces.
 */
export function VersePreview() {
  const { segments, before, verseNumber, verseEnd } = useFormFields(([fields]) => ({
    segments: fields?.segments?.value as Segment[] | undefined,
    before: fields?.before?.value as Block[] | undefined,
    verseNumber: Number(fields?.verseNumber?.value ?? 0),
    verseEnd: Number(fields?.verseEnd?.value ?? 0),
  }))

  let html = ''
  let error: string | null = null
  try {
    if (Array.isArray(segments) && segments.length > 0) {
      html = renderVerseHtml({
        v: verseNumber,
        vEnd: verseEnd || verseNumber,
        before: Array.isArray(before) ? before : [],
        segs: segments,
      })
    }
  } catch (err) {
    error = err instanceof Error ? err.message : String(err)
  }

  return (
    <div className={styles.wrapper}>
      <span className={styles.label}>Live preview</span>
      {error ? (
        <div className={`${styles.preview} ${styles.empty}`}>{error}</div>
      ) : html ? (
        <div className={styles.preview} dangerouslySetInnerHTML={{ __html: html }} />
      ) : (
        <div className={`${styles.preview} ${styles.empty}`}>No segments to preview yet.</div>
      )}
    </div>
  )
}
