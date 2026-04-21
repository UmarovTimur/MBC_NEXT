import { buildConfig } from 'payload'
import { postgresAdapter } from '@payloadcms/db-postgres'
import { lexicalEditor } from '@payloadcms/richtext-lexical'
import path from 'path'
import sharp from 'sharp'
import { fileURLToPath } from 'url'
import { Users } from './src/collections/Users'
import { Books } from './src/collections/Books'
import { Media } from './src/collections/Media'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)
const payloadServerURL = process.env.PAYLOAD_SERVER_URL?.trim() ?? ''
const corsUrls = (process.env.CORS_URLS || 'http://localhost:3000')
  .split(',')
  .map((url) => url.trim())
  .filter(Boolean)
const csrfUrls = (process.env.PAYLOAD_CSRF || '')
  .split(',')
  .map((url) => url.trim())
  .filter(Boolean)

export default buildConfig({
  // Leave serverURL empty unless it is explicitly required so Payload does not
  // auto-populate csrf with the same origin and reject cookie auth requests
  // that arrive without Origin / Sec-Fetch-Site headers.
  serverURL: payloadServerURL,
  csrf: csrfUrls,
  admin: {
    user: 'users',
    components: {
      views: {
        login: {
          Component: './src/components/admin/FixedLoginView#FixedLoginView',
        },
      },
    },
  },
  collections: [Users, Books, Media],
  editor: lexicalEditor(),
  sharp,
  db: postgresAdapter({
    pool: {
      connectionString: process.env.DATABASE_URL,
    },
    push: process.env.NODE_ENV === 'development',
  }),
  secret: process.env.PAYLOAD_SECRET || '',
  typescript: {
    outputFile: path.resolve(__dirname, 'payload-types.ts'),
  },
  upload: {
    limits: {
      fileSize: 5_000_000,
    },
  },
  cors: corsUrls,
})
