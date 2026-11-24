import { useEffect, useState } from 'react'
import Auth from './Auth.jsx'
import Brand from './Brand.jsx'
import Dashboard from './Dashboard.jsx'
import { supabase } from './supabase.js'

export default function App() {
  const [session, setSession] = useState(undefined)

  useEffect(() => {
    if (!supabase) return

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, activeSession) => {
      setSession(activeSession)
    })
    return () => subscription.unsubscribe()
  }, [])

  if (!supabase) {
    return (
      <main className="auth-shell">
        <div className="auth-content">
          <Brand />
          <section className="auth-card">
            <h1>Setup required</h1>
            <p className="muted">Connect a Supabase project to start using TaskNest.</p>
          </section>
        </div>
      </main>
    )
  }

  if (session === undefined) {
    return <main className="auth-shell"><p role="status">Loading TaskNest…</p></main>
  }

  if (!session) return <Auth />

  return <Dashboard key={session.user.id} user={session.user} />
}
