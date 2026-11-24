import { useState } from 'react'
import { Eye, EyeOff, LockKeyhole } from 'lucide-react'
import Brand from './Brand.jsx'
import { supabase } from './supabase.js'

export default function Auth() {
  const [mode, setMode] = useState('signin')
  const [passwordVisible, setPasswordVisible] = useState(false)
  const [pending, setPending] = useState(false)
  const [message, setMessage] = useState(null)
  const signingUp = mode === 'signup'

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

    setPending(true)
    setMessage(null)
    try {
      const { data, error } = signingUp
        ? await supabase.auth.signUp({
          ...credentials,
          options: { emailRedirectTo: window.location.origin },
        })
        : await supabase.auth.signInWithPassword(credentials)

      if (error) throw error
      if (signingUp && !data.session) {
        setMessage({ text: 'Check your email for a link to confirm your account.' })
      }
    } catch (error) {
      setMessage({
        error: true,
        text: error.code === 'invalid_credentials'
          ? 'That email and password combination didn’t work.'
          : error.message || 'Unable to continue. Please try again.',
      })
    } finally {
      setPending(false)
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
              <input name="email" type="email" autoComplete="email" required placeholder="you@example.com" />
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
                  required
                />
                <button
                  className="icon-button password-toggle"
                  type="button"
                  onClick={() => setPasswordVisible(!passwordVisible)}
                  aria-label={passwordVisible ? 'Hide password' : 'Show password'}
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
            <button className="button primary auth-submit" disabled={pending}>
              {pending ? 'Please wait…' : signingUp ? 'Create account' : 'Sign in'}
            </button>
          </form>
          <p className="auth-switch">
            {signingUp ? 'Already have an account?' : 'New to TaskNest?'}{' '}
            <button
              type="button"
              className="text-button"
              disabled={pending}
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
