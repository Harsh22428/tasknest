import { useEffect, useState } from 'react'
import { Eye, EyeOff, LockKeyhole } from 'lucide-react'
import Brand from './Brand.jsx'
import { supabase } from './supabase.js'

const authErrors = {
  invalid_credentials: 'That email and password combination didn’t work.',
  email_not_confirmed: 'Confirm your email before signing in. You can request a new link below.',
}

export default function Auth() {
  const [mode, setMode] = useState('signin')
  const [passwordVisible, setPasswordVisible] = useState(false)
  const [pending, setPending] = useState(null)
  const [message, setMessage] = useState(null)
  const signingUp = mode === 'signup'

  useEffect(() => {
    const { hash, pathname, search } = window.location
    if (new URLSearchParams(hash.slice(1)).get('error_code') !== 'otp_expired') return

    window.history.replaceState(window.history.state, '', pathname + search)
    setMessage({
      error: true,
      canResend: true,
      text: 'This confirmation link has expired or was already used. Enter your email to request a new link.',
    })
  }, [])

  function changeMode(nextMode) {
    setMode(nextMode)
    setMessage(null)
    setPasswordVisible(false)
  }

  async function submit(event) {
    event.preventDefault()
    const fields = new FormData(event.currentTarget)
    const credentials = {
      email: fields.get('email').trim(),
      password: fields.get('password'),
    }

    setPending('submit')
    setMessage(null)
    try {
      const { data, error } = signingUp
        ? await supabase.auth.signUp(credentials)
        : await supabase.auth.signInWithPassword(credentials)

      if (error) throw error
      if (signingUp && !data.session) {
        setMessage({ canResend: true, text: 'Check your email for a link to confirm your account.' })
      }
    } catch (error) {
      setMessage({
        error: true,
        canResend: error.code === 'email_not_confirmed',
        text: authErrors[error.code] || error.message || 'Unable to continue. Please try again.',
      })
    } finally {
      setPending(null)
    }
  }

  async function resendConfirmation(event) {
    const emailInput = event.currentTarget.form.elements.namedItem('email')
    if (!emailInput.reportValidity()) return

    setPending('resend')
    try {
      const { error } = await supabase.auth.resend({ type: 'signup', email: emailInput.value.trim() })
      if (error) throw error
      setMessage({ canResend: true, text: 'If that email is awaiting confirmation, a new link is on its way.' })
    } catch (error) {
      setMessage({
        error: true,
        canResend: true,
        text: error.message || 'Couldn’t send a new confirmation email. Try again.',
      })
    } finally {
      setPending(null)
    }
  }

  return (
    <main className="auth-shell">
      <div className="auth-content">
        <header className="auth-brand"><Brand /></header>
        <section className="auth-card" aria-labelledby="auth-heading">
          <h1 id="auth-heading">{signingUp ? 'Create your account' : 'Welcome back'}</h1>
          <p className="muted">
            {signingUp ? 'Start a private list for your tasks.' : 'Sign in to manage your tasks.'}
          </p>
          <form onSubmit={submit}>
            <label className="field">
              <span>Email address</span>
              <input name="email" type="email" autoComplete="email" required disabled={!!pending} placeholder="you@example.com" />
            </label>
            <div className="field">
              <label htmlFor="password">Password</label>
              <div className="password-field">
                <input
                  key={mode}
                  id="password"
                  name="password"
                  type={passwordVisible ? 'text' : 'password'}
                  autoComplete={signingUp ? 'new-password' : 'current-password'}
                  minLength={signingUp ? 8 : undefined}
                  placeholder={signingUp ? 'At least 8 characters' : 'Enter your password'}
                  disabled={!!pending}
                  required
                />
                <button
                  className="icon-button password-toggle"
                  type="button"
                  onClick={() => setPasswordVisible(!passwordVisible)}
                  aria-label={passwordVisible ? 'Hide password' : 'Show password'}
                  disabled={!!pending}
                >
                  {passwordVisible ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>
            {message && (
              <p className={message.error ? 'notice error' : 'notice'} role={message.error ? 'alert' : 'status'}>
                {message.text}
              </p>
            )}
            {message?.canResend && (
              <button type="button" className="text-button" onClick={resendConfirmation} disabled={!!pending}>
                {pending === 'resend' ? 'Sending…' : 'Send a new confirmation email'}
              </button>
            )}
            <button className="button primary auth-submit" disabled={!!pending}>
              {pending === 'submit' ? 'Please wait…' : signingUp ? 'Create account' : 'Sign in'}
            </button>
          </form>
          <p className="auth-switch">
            {signingUp ? 'Already have an account?' : 'New to TaskNest?'}{' '}
            <button
              type="button"
              className="text-button"
              disabled={!!pending}
              onClick={() => changeMode(signingUp ? 'signin' : 'signup')}
            >
              {signingUp ? 'Sign in' : 'Create an account'}
            </button>
          </p>
        </section>
        <p className="auth-footer"><LockKeyhole size={14} aria-hidden="true" /> Your tasks are private.</p>
      </div>
    </main>
  )
}
