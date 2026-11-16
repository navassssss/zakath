import { useEffect, useState, type FormEvent } from 'react'
import { API_BASE_URL } from './config/api'

export function EmailAccess({ sessionKey }: { sessionKey: string }) {
  const [token, setToken] = useState(() => new URLSearchParams(location.hash.slice(1)).get('verify_email'))
  const [registering, setRegistering] = useState(false)
  const [busy, setBusy] = useState(false)
  const [message, setMessage] = useState('')

  useEffect(() => {
    if (token) history.replaceState(null, '', location.pathname + location.search)
  }, [token])

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const fields = new FormData(event.currentTarget)
    const email = fields.get('email')
    const password = fields.get('password')
    const action = token ? 'verify' : registering ? 'register' : 'login'
    const payload = token ? { token, password } : registering ? { email } : { email, password }
    setBusy(true)
    setMessage('')
    try {
      const response = await fetch(new URL('/auth/email/' + action, API_BASE_URL), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })
      const result = await response.json()
      if (!response.ok) throw new Error(result.message || 'Email sign-in failed.')
      if (result.session) {
        sessionStorage.setItem(sessionKey, result.session)
        location.reload()
      } else {
        setMessage(result.message)
      }
    } catch (error) {
      setMessage(error instanceof Error ? error.message : 'Try again.')
    } finally {
      setBusy(false)
    }
  }

  return (
    <section>
      <h2>{token ? 'Set your password' : registering ? 'Register with email' : 'Sign in with email'}</h2>
      <form key={token ? 'verify' : registering ? 'register' : 'login'} onSubmit={(event) => void submit(event)}>
        {!token && <p><label>Email <input name="email" type="email" autoComplete="email" maxLength={254} required /></label></p>}
        {(!registering || token) && (
          <p><label>Password <input name="password" type="password" autoComplete={token ? 'new-password' : 'current-password'} minLength={token ? 12 : undefined} maxLength={128} required /></label></p>
        )}
        <button type="submit" disabled={busy}>
          {token ? 'Create account' : registering ? 'Send verification link' : 'Sign in'}
        </button>
      </form>
      <p><button type="button" disabled={busy} onClick={() => {
        setRegistering(!registering && !token)
        setToken(null)
        setMessage('')
      }}>{registering || token ? 'Back to sign in' : 'Create an account'}</button></p>
      {message && <p role="status">{message}</p>}
    </section>
  )
}
