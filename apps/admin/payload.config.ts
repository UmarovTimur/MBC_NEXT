import { buildConfig } from 'payload'
import { postgresAdapter } from '@payloadcms/db-postgres'
import { lexicalEditor } from '@payloadcms/richtext-lexical'
import path from 'path'
import { fileURLToPath } from 'url'
import { Users } from './src/collections/Users'
import { Books } from './src/collections/Books'
import { Media } from './src/collections/Media'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

export default buildConfig({
  serverURL: process.env.PAYLOAD_SERVER_URL || 'http://localhost:8001',
  admin: {
    user: 'users',
  },
  collections: [Users, Books, Media],
  editor: lexicalEditor(),
  db: postgresAdapter({
    pool: {
      connectionString: process.env.DATABASE_URL,
    },
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
  cors: (process.env.CORS_URLS || 'http://localhost:3000').split(','),
})
