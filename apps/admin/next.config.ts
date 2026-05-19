import { withPayload } from '@payloadcms/next/withPayload'
import type { NextConfig } from 'next'

type WebpackAsset = {
  name: string
  source: {
    source: () => string | Buffer
  }
}

type WebpackCompilation = {
  hooks: {
    processAssets: {
      tap: (
        options: { name: string; stage: number },
        callback: () => void,
      ) => void
    }
  }
  getAssets: () => WebpackAsset[]
  updateAsset: (name: string, source: unknown) => void
}

type WebpackCompiler = {
  hooks: {
    thisCompilation: {
      tap: (name: string, callback: (compilation: WebpackCompilation) => void) => void
    }
  }
}

const nextConfig: NextConfig = {
  allowedDevOrigins: [
    'localhost',
    '127.0.0.1',
    '204.168.149.182',
    'localhost:8001',
    '127.0.0.1:8001',
    '204.168.149.182:8001',
  ],
  webpack: (config, { isServer, dev, webpack }) => {
    if (isServer && !dev) {
      config.plugins ??= []
      config.plugins.push({
        apply(compiler: WebpackCompiler) {
          compiler.hooks.thisCompilation.tap('FixServerChunkRuntimePlugin', (compilation) => {
            compilation.hooks.processAssets.tap(
              {
                name: 'FixServerChunkRuntimePlugin',
                stage: webpack.Compilation.PROCESS_ASSETS_STAGE_SUMMARIZE,
              },
              () => {
                for (const asset of compilation.getAssets()) {
                  if (!asset.name.endsWith('webpack-runtime.js')) continue

                  const source = asset.source.source().toString()
                  const patched = source.replace(
                    'return "" + chunkId + ".js";',
                    'return "chunks/" + chunkId + ".js";',
                  )

                  if (patched !== source) {
                    compilation.updateAsset(asset.name, new webpack.sources.RawSource(patched))
                  }
                }
              },
            )
          })
        },
      })
    }

    return config
  },
}

export default withPayload(nextConfig)
