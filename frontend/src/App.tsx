import { useEffect, useState, type FormEvent } from 'react'
import { API_BASE_URL } from './config/api'
import { EmailAccess } from './EmailAccess'

type Mahall = { id: string; name: string; locality: string }
type Account = { email: string; name: string | null; mahallId: string | null }
const sessionKey = 'amanah-session'

function Eligibility({ account }: { account: Account }) {
  const [mahalls, setMahalls] = useState<Mahall[]>([])
  const [status, setStatus] = useState<'loading' | 'ready' | 'error'>('loading')
  const [attempt, setAttempt] = useState(0)
  const [caseStatus, setCaseStatus] = useState<string | null | undefined>(undefined)
  const [caseError, setCaseError] = useState('')
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    const request = new AbortController()
    async function loadCase() {
      try {
        const response = await fetch(new URL('/auth/eligibility', API_BASE_URL), {
          signal: request.signal,
          headers: { Authorization: `Bearer ${sessionStorage.getItem(sessionKey)}` },
        })
        if (!response.ok) throw new Error()
        const result = await response.json()
        setCaseStatus(result.eligibility?.status ?? null)
      } catch {
        if (!request.signal.aborted) setCaseError('Could not load your eligibility case. Reload or sign in again.')
      }
    }
    void loadCase()
    return () => request.abort()
  }, [])

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const fields = new FormData(event.currentTarget)
    setSaving(true)
    setCaseError('')
    try {
      const response = await fetch(new URL('/auth/eligibility', API_BASE_URL), {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${sessionStorage.getItem(sessionKey)}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          mahallId: account.mahallId ?? (fields.get('mahall') || null),
          locality: fields.get('locality'),
          postalCode: fields.get('postalCode'),
          householdSize: Number(fields.get('householdSize')),
          monthlyIncomePaise: Math.round(Number(fields.get('income')) * 100),
          monthlyExpensesPaise: Math.round(Number(fields.get('expenses')) * 100),
        }),
      })
      const result = await response.json()
      if (!response.ok) throw new Error(result.message || 'Submission failed')
      setCaseStatus(result.eligibility.status)
    } catch (error) {
      setCaseError(error instanceof Error ? error.message : 'Could not submit. Try again.')
    } finally {
      setSaving(false)
    }
  }

  useEffect(() => {
    const request = new AbortController()

    async function loadMahalls() {
      try {
        const response = await fetch(new URL('/mahalls', API_BASE_URL), {
          signal: request.signal,
        })
        if (!response.ok) throw new Error('Mahallu lookup failed')
        const result: Mahall[] = await response.json()
        setMahalls(result)
        setStatus('ready')
      } catch {
        if (!request.signal.aborted) setStatus('error')
      }
    }

    void loadMahalls()
    return () => request.abort()
  }, [attempt])

  return (
    <section aria-labelledby="eligibility-title">
      <h2 id="eligibility-title">Zakat eligibility</h2>
      {caseError && <p role="alert">{caseError}</p>}
      {caseStatus === undefined && !caseError && <p role="status">Loading your eligibility case…</p>}
      {caseStatus && <p role="status">Verification status: {caseStatus.toLowerCase().replaceAll('_', ' ')}</p>}
      {caseStatus === null && (
      <form onSubmit={(event) => void submit(event)}>
      <label htmlFor="mahall">Home Mahallu (optional)</label>
      <select id="mahall" name="mahall" value={account.mahallId ?? undefined} disabled={status !== 'ready' || Boolean(account.mahallId)} style={{ display: 'block', width: '100%', padding: '0.7rem', marginTop: '0.5rem' }}>
        <option value="">No home Mahallu</option>
        {mahalls.map((mahall) => (
          <option key={mahall.id} value={mahall.id}>
            {mahall.name} ({mahall.locality})
          </option>
        ))}
      </select>
      {status === 'loading' && <p role="status">Loading Mahallus…</p>}
      {status === 'ready' && mahalls.length === 0 && <p>No Mahallus have been registered yet.</p>}
      {status === 'error' && (
        <p role="alert">
          Could not load Mahallus.{' '}
          <button type="button" onClick={() => {
            setStatus('loading')
            setAttempt(attempt + 1)
          }}>Retry</button>
        </p>
      )}
        <p><label>Locality <input name="locality" required maxLength={120} /></label></p>
        <p><label>PIN code <input name="postalCode" inputMode="numeric" pattern="[0-9]{6}" required /></label></p>
        <p><label>Household size <input name="householdSize" type="number" min="1" max="100" required /></label></p>
        <p><label>Monthly household income (₹) <input name="income" type="number" min="0" max="21474836.47" step="0.01" required /></label></p>
        <p><label>Monthly essential expenses (₹) <input name="expenses" type="number" min="0" max="21474836.47" step="0.01" required /></label></p>
        <button type="submit" disabled={saving || status !== 'ready'}>Submit for verification</button>
      </form>
      )}
    </section>
  )
}

export default function App() {
  const [account, setAccount] = useState<Account | null>(null)
  const [loading, setLoading] = useState(() =>
    new URLSearchParams(window.location.hash.slice(1)).has('session') ||
    Boolean(sessionStorage.getItem(sessionKey)),
  )
  const [error, setError] = useState(() =>
    new URLSearchParams(window.location.hash.slice(1)).has('auth_error')
      ? 'Google sign-in failed. Try again.'
      : '',
  )

  useEffect(() => {
    const params = new URLSearchParams(window.location.hash.slice(1))
    const returnedToken = params.get('session')
    if (returnedToken) sessionStorage.setItem(sessionKey, returnedToken)
    if (returnedToken || params.has('auth_error')) {
      history.replaceState(null, '', window.location.pathname + window.location.search)
    }
    const token = sessionStorage.getItem(sessionKey)
    if (!token) return
    const request = new AbortController()
    async function loadAccount() {
      try {
        const response = await fetch(new URL('/auth/me', API_BASE_URL), {
          signal: request.signal,
          headers: { Authorization: `Bearer ${token}` },
        })
        if (response.status === 401) sessionStorage.removeItem(sessionKey)
        if (!response.ok) throw new Error('Account lookup failed')
        setAccount(await response.json())
      } catch {
        if (!request.signal.aborted) setError('Could not open your session. Sign in again.')
      } finally {
        if (!request.signal.aborted) setLoading(false)
      }
    }
    void loadAccount()
    return () => request.abort()
  }, [])

  return (
    <>
    <header className="site-header"><div><span aria-hidden="true">A</span>Amanah</div></header>
    <main className="workspace">
    <div className="panel">
      <h1>{account ? 'Your account' : 'Welcome to Amanah'}</h1>
      {loading && <p role="status">Checking your session…</p>}
      {!loading && !account && (
        <>
          <a className="action-link" href={new URL('/auth/google', API_BASE_URL).href}>Sign in with Google</a>
          <EmailAccess sessionKey={sessionKey} />
        </>
      )}
      {error && <p role="alert">{error}</p>}
      {account && (
        <>
          <p>Signed in as {account.name ?? account.email}</p>
          <button type="button" onClick={() => {
            sessionStorage.removeItem(sessionKey)
            setAccount(null)
            setError('')
          }}>Sign out</button>
          <Eligibility account={account} />
        </>
      )}
    </div>
    </main>
    </>
  )
}
