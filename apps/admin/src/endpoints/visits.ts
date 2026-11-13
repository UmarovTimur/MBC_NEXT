import { sql } from 'drizzle-orm'
import type { Endpoint } from 'payload'

// Site-wide visit counter shown in the az footer. One row (id = 1) in
// `visit_counter`; the az app proxies /api/visits here. The az client decides
// what counts as a visit (once per browser per day) — this only stores N.
//
// POST upserts instead of a bare UPDATE so it also works on a dev database
// where `push` created the table but the seeding migration never ran. Either
// way it is a single atomic statement, so concurrent visits are never lost.

const headers = {
  'content-type': 'application/json; charset=utf-8',
  'cache-control': 'no-store',
}

type Row = { n: number | string }

const firstN = (rows: unknown): number => {
  const list = ((rows as { rows?: Row[] }).rows ?? rows) as Row[]
  return Number(list[0]?.n ?? 0)
}

export const visitsEndpoints: Endpoint[] = [
  {
    path: '/visits',
    method: 'get',
    handler: async (req) => {
      const rows = await req.payload.db.drizzle.execute(sql`
        SELECT n FROM visit_counter WHERE id = 1
      `)
      return new Response(JSON.stringify({ total: firstN(rows) }), { headers })
    },
  },
  {
    path: '/visits',
    method: 'post',
    handler: async (req) => {
      const rows = await req.payload.db.drizzle.execute(sql`
        INSERT INTO visit_counter (id, n) VALUES (1, 1)
        ON CONFLICT (id) DO UPDATE SET n = visit_counter.n + 1
        RETURNING n
      `)
      return new Response(JSON.stringify({ total: firstN(rows) }), { headers })
    },
  },
]
