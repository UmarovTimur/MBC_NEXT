import type { CollectionConfig, PayloadRequest } from 'payload'
import { sql } from 'drizzle-orm'
import crypto from 'node:crypto'

const MAX_PAGE_URL_LENGTH = 500
const MAX_TEXT_LENGTH = 2000
const MAX_CONTACT_LENGTH = 200
const MIN_FIELD_LENGTH = 3

/** Burst + sustained caps for actual issue reports. */
const REPORT_BURST_LIMIT = 5
const REPORT_BURST_WINDOW_MINUTES = 15
const REPORT_DAILY_LIMIT = 20

/** "Leave a contact" is low-abuse-value (no free text), so a looser daily cap suffices. */
const CONTACT_DAILY_LIMIT = 3

const DEV_FALLBACK_SALT = 'dev-only-insecure-salt'

type ReportType = 'report' | 'contact'

function hashIp(ip: string): string {
  const salt = process.env.REPORT_IP_SALT
  if (!salt && process.env.NODE_ENV !== 'development') {
    console.warn('REPORT_IP_SALT is not set — falling back to an insecure default salt.')
  }
  return crypto
    .createHash('sha256')
    .update(ip + (salt || DEV_FALLBACK_SALT))
    .digest('hex')
}

function clientIp(req: PayloadRequest): string {
  const forwarded = req.headers?.get('x-forwarded-for')
  if (forwarded) return forwarded.split(',')[0]!.trim()
  return req.headers?.get('x-real-ip')?.trim() || 'unknown'
}

function clamp(value: unknown, maxLength: number): string {
  return typeof value === 'string' ? value.trim().slice(0, maxLength) : ''
}

/**
 * Verse-level storage aside, this is the only collection in the app that
 * accepts anonymous public writes — access.create is locked to `false` and
 * every write goes through `/submit` instead, same reasoning as the search
 * endpoints below: a public collection-level create would let a caller set
 * `status`/`ipHash` directly, which would defeat the rate limiter and let
 * reports masquerade as already-reviewed.
 */
export const ContentReports: CollectionConfig = {
  slug: 'content-reports',
  access: {
    read: ({ req }) => Boolean(req.user),
    create: () => false,
    update: ({ req }) => Boolean(req.user),
    delete: ({ req }) => Boolean(req.user),
  },
  admin: {
    useAsTitle: 'pageUrl',
    defaultColumns: ['type', 'pageUrl', 'selectedText', 'comment', 'status', 'createdAt'],
    pagination: { defaultLimit: 50 },
  },
  endpoints: [
    {
      path: '/submit',
      method: 'post',
      handler: async (req) => {
        let body: Record<string, unknown>
        try {
          body = ((await req.json?.()) ?? {}) as Record<string, unknown>
        } catch {
          return Response.json({ error: 'invalid_body' }, { status: 400 })
        }

        // Bots fill every field including hidden ones; a human never sees this
        // input. Silently pretend success so the bot has no signal to adapt to.
        if (typeof body.honeypot === 'string' && body.honeypot.trim() !== '') {
          return Response.json({ ok: true })
        }

        const type: ReportType = body.type === 'contact' ? 'contact' : 'report'
        const pageUrl = clamp(body.pageUrl, MAX_PAGE_URL_LENGTH)
        const selectedText = clamp(body.selectedText, MAX_TEXT_LENGTH)
        const comment = clamp(body.comment, MAX_TEXT_LENGTH)
        const contact = clamp(body.contact, MAX_CONTACT_LENGTH)

        if (!pageUrl) {
          return Response.json({ error: 'invalid_input' }, { status: 400 })
        }
        if (type === 'report') {
          if (selectedText.length < MIN_FIELD_LENGTH || comment.length < MIN_FIELD_LENGTH) {
            return Response.json({ error: 'invalid_input' }, { status: 400 })
          }
        } else if (contact.length < MIN_FIELD_LENGTH) {
          return Response.json({ error: 'invalid_input' }, { status: 400 })
        }

        const ipHash = hashIp(clientIp(req))

        const withinLimit = async (windowMinutes: number, limit: number, forType: ReportType) => {
          const rows = await req.payload.db.drizzle.execute(sql`
            SELECT count(*) AS count
              FROM content_reports
             WHERE ip_hash = ${ipHash}
               AND type = ${forType}
               AND created_at > now() - (${windowMinutes} || ' minutes')::interval
          `)
          const count = Number(((rows.rows ?? rows) as { count: string }[])[0]?.count ?? 0)
          return count < limit
        }

        if (type === 'report') {
          const [burstOk, dailyOk] = await Promise.all([
            withinLimit(REPORT_BURST_WINDOW_MINUTES, REPORT_BURST_LIMIT, 'report'),
            withinLimit(24 * 60, REPORT_DAILY_LIMIT, 'report'),
          ])
          if (!burstOk || !dailyOk) {
            return Response.json({ error: 'rate_limited' }, { status: 429 })
          }
        } else {
          const ok = await withinLimit(24 * 60, CONTACT_DAILY_LIMIT, 'contact')
          if (!ok) {
            return Response.json({ error: 'rate_limited' }, { status: 429 })
          }
        }

        await req.payload.create({
          collection: 'content-reports',
          data: {
            type,
            pageUrl,
            selectedText: type === 'report' ? selectedText : undefined,
            comment: type === 'report' ? comment : undefined,
            contact: contact || undefined,
            status: 'new',
            ipHash,
            userAgent: req.headers?.get('user-agent')?.slice(0, 300) || undefined,
          },
        })

        return Response.json({ ok: true })
      },
    },
  ],
  fields: [
    {
      type: 'row',
      fields: [
        {
          name: 'type',
          type: 'select',
          required: true,
          defaultValue: 'report',
          options: [
            { label: 'Report', value: 'report' },
            { label: 'Contact only', value: 'contact' },
          ],
        },
        {
          name: 'status',
          type: 'select',
          required: true,
          defaultValue: 'new',
          options: [
            { label: 'New', value: 'new' },
            { label: 'Reviewed', value: 'reviewed' },
            { label: 'Resolved', value: 'resolved' },
          ],
        },
      ],
    },
    {
      name: 'pageUrl',
      type: 'text',
      required: true,
      admin: { description: 'Full URL of the page the selection was made on.' },
    },
    {
      name: 'selectedText',
      type: 'textarea',
      admin: { description: 'Empty for contact-only submissions.' },
    },
    {
      name: 'comment',
      type: 'textarea',
      admin: { description: 'What the reporter says is wrong with the selected text.' },
    },
    {
      name: 'contact',
      type: 'text',
      admin: { description: 'Left voluntarily by the reporter so we can reach out.' },
    },
    {
      name: 'ipHash',
      type: 'text',
      admin: {
        readOnly: true,
        description: 'sha256(ip + salt) — used for rate limiting, not the raw IP.',
        position: 'sidebar',
      },
    },
    {
      name: 'userAgent',
      type: 'text',
      admin: { readOnly: true, position: 'sidebar' },
    },
  ],
}
