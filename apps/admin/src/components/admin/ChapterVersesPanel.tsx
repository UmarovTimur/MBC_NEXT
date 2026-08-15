'use client'

import { useEffect, useState } from 'react'
import { useDocumentInfo } from '@payloadcms/ui'
import { verseRefLabel } from '@mbc/bible-verses'
import styles from './ChapterVersesPanel.module.css'

type VerseRow = {
  id: number | string
  verseNumber: number
  verseEnd?: number | null
  plainText: string | null
}

/**
 * Replaces the raw HTML editor for verse-mode chapters: the chapter is assembled
 * from bible-verses, so what an editor needs here is a way in to the individual
 * verses plus a preview of the assembled result.
 */
export function ChapterVersesPanel() {
  const { id } = useDocumentInfo()
  const [verses, setVerses] = useState<VerseRow[] | null>(null)
  const [html, setHtml] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!id) return
    let cancelled = false

    const load = async () => {
      try {
        const res = await fetch(
          `/api/bible-verses?where[chapter][equals]=${id}&sort=verseNumber&limit=0&depth=0`,
          { credentials: 'include' },
        )
        if (!res.ok) throw new Error(`verses: HTTP ${res.status}`)
        const json = await res.json()
        if (!cancelled) setVerses(json.docs ?? [])

        const preview = await fetch(`/api/bible-chapters/${id}/assembled`, {
          credentials: 'include',
        })
        if (preview.ok) {
          const body = await preview.json()
          if (!cancelled) setHtml(body.html ?? '')
        }
      } catch (err) {
        if (!cancelled) setError(err instanceof Error ? err.message : String(err))
      }
    }

    void load()
    return () => {
      cancelled = true
    }
  }, [id])

  if (!id) {
    return <div className={styles.note}>Save the chapter first, then import its verses.</div>
  }
  if (error) return <div className={styles.note}>{error}</div>
  if (!verses) return <div className={styles.note}>Loading verses…</div>

  const body = verses.filter((v) => v.verseNumber > 0)
  const preamble = verses.find((v) => v.verseNumber === 0)

  return (
    <div className={styles.wrapper}>
      <span className={styles.label}>
        Verses ({body.length}
        {preamble ? ' + preamble' : ''})
      </span>

      {body.length === 0 ? (
        <div className={styles.note}>
          No verses stored for this chapter yet. Run <code>yarn workspace @mbc/admin
          migrate:bible-verses</code>.
        </div>
      ) : (
        <div className={styles.table}>
          {verses.map((v) => (
            <a key={v.id} className={styles.row} href={`/admin/collections/bible-verses/${v.id}`}>
              <span className={styles.num}>{v.verseNumber === 0 ? '—' : verseRefLabel(v.verseNumber, v.verseEnd ?? undefined)}</span>
              <span className={styles.text}>
                {v.verseNumber === 0
                  ? 'chapter preamble'
                  : (v.plainText ?? '').slice(0, 120) || '(no text)'}
              </span>
            </a>
          ))}
        </div>
      )}

      {html !== null && (
        <>
          <span className={styles.label}>Assembled chapter</span>
          <div className={styles.preview} dangerouslySetInnerHTML={{ __html: html }} />
        </>
      )}
    </div>
  )
}
