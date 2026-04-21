import { withPayload } from '@payloadcms/next/withPayload'
import type { NextConfig } from 'next'

const nextConfig: NextConfig = {
  allowedDevOrigins: [
    'localhost',
    '127.0.0.1',
    '204.168.149.182',
    'localhost:8001',
    '127.0.0.1:8001',
    '204.168.149.182:8001',
  ],
}

export default withPayload(nextConfig)
