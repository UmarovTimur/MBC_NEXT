'use client'

import { useFormFields } from '@payloadcms/ui'
import { renderVerseHtml, verseToPlainText, plainTextToSegmentHtml, type Block, type Segment } from '@mbc/bible-verses'
import styles from './BibleHtmlPreview.module.css'

/**
 * Live preview for a single verse, rendered through the same function the public
 * site uses. `segments` only changes on save (it's rebuilt from "Verse text" in
 * the `beforeChange` hook), so previewing it directly would show stale markup
 * while typing. Mirroring that same rebuild here — swap in a single collapsed
 * block whenever the typed text has diverged from what `segments` currently
 * says — keeps the preview live without waiting for a save.
 */
export function VersePreview() {
  const { segments, before, verseNumber, verseEnd, plainText } = useFormFields(([fields]) => ({
    segments: fields?.segments?.value as Segment[] | undefined,
    before: fields?.before?.value as Block[] | undefined,
    verseNumber: Number(fields?.verseNumber?.value ?? 0),
    verseEnd: Number(fields?.verseEnd?.value ?? 0),
    plainText: fields?.plainText?.value as string | undefined,
  }))

  let html = ''
  let error: string | null = null
  try {
    if (Array.isArray(segments) && segments.length > 0) {
      const editedText = typeof plainText === 'string' ? plainText.trim() : ''
      const savedText = verseToPlainText({ v: verseNumber, vEnd: verseEnd || verseNumber, before: [], segs: segments })
      const effectiveSegments: Segment[] =
        editedText !== savedText
          ? [
              {
                cls: segments[0]?.cls ?? 'p',
                html: plainTextToSegmentHtml(editedText),
                newBlock: segments[0]?.newBlock ?? true,
              },
            ]
          : segments

      html = renderVerseHtml({
        v: verseNumber,
        vEnd: verseEnd || verseNumber,
        before: Array.isArray(before) ? before : [],
        segs: effectiveSegments,
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
