'use client'

import { Button, PayloadIcon, useAuth, useTranslation } from '@payloadcms/ui'
import type { FormEvent } from 'react'
import { useState } from 'react'
import styles from './FixedLoginForm.module.css'

type FixedLoginFormProps = {
  forgotHref: string
  loginEndpoint: string
  meEndpoint: string
  redirectTo: string
}

type LoginResponse = {
  errors?: Array<{
    message?: string
  }>
  message?: string
  user?: object | null
}

export function FixedLoginForm({
  forgotHref,
  loginEndpoint,
  meEndpoint,
  redirectTo,
}: FixedLoginFormProps) {
  const { setUser } = useAuth()
  type SuccessfulLoginResponse = Parameters<typeof setUser>[0]
  const { t } = useTranslation()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)

  const waitForAuthenticatedSession = async () => {
    for (let attempt = 0; attempt < 10; attempt += 1) {
      const response = await fetch(meEndpoint, {
        credentials: 'include',
      })

      if (response.ok) {
        const data = (await response.json()) as LoginResponse

        if (data.user) {
          return true
        }
      }

      await new Promise((resolve) => {
        window.setTimeout(resolve, 150)
      })
    }

    return false
  }

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()

    if (isSubmitting) {
      return
    }

    setError(null)
    setIsSubmitting(true)

    try {
      const response = await fetch(loginEndpoint, {
        method: 'POST',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email,
          password,
        }),
      })

      const contentType = response.headers.get('content-type')
      const data: LoginResponse =
        contentType?.includes('application/json')
          ? await response.json()
          : {}

      if (!response.ok) {
        setError(
          data.errors?.[0]?.message ||
            data.message ||
            t('error:unknown'),
        )
        return
      }

      setUser(data as SuccessfulLoginResponse)
      await waitForAuthenticatedSession()

      // Use a hard navigation so the next admin request definitely includes the new cookie.
      window.location.replace(redirectTo)
    } catch (error_) {
      setError(
        error_ instanceof Error ? error_.message : t('error:unknown'),
      )
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className={styles.wrapper}>
      <div className={styles.brand} aria-hidden="true">
        <PayloadIcon />
      </div>

      <section className={styles.panel}>
        <header className={styles.header}>
          <h1 className={styles.title}>{t('authentication:login')}</h1>
          <p className={styles.subtitle}>Sign in to continue managing content.</p>
        </header>

        <form className={styles.form} onSubmit={handleSubmit}>
          <div className={styles.field}>
            <label className={styles.label} htmlFor="fixed-login-email">
              {t('general:email')}
            </label>
            <input
              autoComplete="email"
              className={styles.input}
              id="fixed-login-email"
              name="email"
              onChange={(event) => setEmail(event.target.value)}
              required
              type="email"
              value={email}
            />
          </div>

          <div className={styles.field}>
            <label className={styles.label} htmlFor="fixed-login-password">
              {t('general:password')}
            </label>
            <input
              autoComplete="current-password"
              className={styles.input}
              id="fixed-login-password"
              name="password"
              onChange={(event) => setPassword(event.target.value)}
              required
              type="password"
              value={password}
            />
          </div>

          {error ? (
            <div className={styles.error} role="alert">
              {error}
            </div>
          ) : null}

          <div className={styles.actions}>
            <a className={styles.forgot} href={forgotHref}>
              {t('authentication:forgotPasswordQuestion')}
            </a>

            <Button
              buttonStyle="primary"
              disabled={isSubmitting}
              size="large"
              type="submit"
            >
              {isSubmitting
                ? t('general:loading')
                : t('authentication:login')}
            </Button>
          </div>
        </form>
      </section>
    </div>
  )
}
