import { RootLayout, handleServerFunctions } from '@payloadcms/next/layouts'
import config from '@payload-config'
import React from 'react'
import { importMap } from './admin/importMap.js'
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
import '@payloadcms/next/css'

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const serverFunction = async (args: any) => {
  'use server'
  return handleServerFunctions({ ...args, config, importMap })
}

export default function Layout({ children }: { children: React.ReactNode }) {
  return RootLayout({ children, config, importMap, serverFunction })
}
