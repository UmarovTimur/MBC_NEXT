import { redirect } from 'next/navigation'
import type { AdminViewServerProps } from 'payload'
import { formatAdminURL, getSafeRedirect } from 'payload/shared'
import { FixedLoginForm } from './FixedLoginForm'

export function FixedLoginView({
  initPageResult,
  searchParams,
}: AdminViewServerProps) {
  const { req } = initPageResult
  const {
    admin: {
      routes: { forgot: forgotRoute },
      user: userSlug,
    },
    routes: { admin: adminRoute, api: apiRoute },
  } = req.payload.config

  const redirectTo = getSafeRedirect({
    fallbackTo: adminRoute,
    redirectTo: searchParams?.redirect || '',
  })

  if (req.user) {
    redirect(redirectTo)
  }

  return (
    <FixedLoginForm
      forgotHref={formatAdminURL({
        adminRoute,
        path: forgotRoute,
      })}
      loginEndpoint={formatAdminURL({
        apiRoute,
        path: `/${userSlug}/login`,
      })}
      meEndpoint={formatAdminURL({
        apiRoute,
        path: `/${userSlug}/me`,
      })}
      redirectTo={redirectTo}
    />
  )
}
