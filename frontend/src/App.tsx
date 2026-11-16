import { useEffect, useRef, useState, type FormEvent } from 'react'
import { Building2, Calculator, ClipboardCheck, HandHeart, House, LifeBuoy, ShieldCheck, UserRound, Wallet } from 'lucide-react'
import { MahalluDirectory } from './MahalluDirectory'
import { AdminOverview } from './AdminOverview'
import { API_BASE_URL } from './config/api'
import { EmailAccess } from './EmailAccess'
import { ReviewDashboard } from './ReviewDashboard'
import { Giving } from './Giving'
import { ZakatCalculator } from './ZakatCalculator'
import { CommitteeLedger } from './CommitteeLedger'

type Mahall = { id: string; name: string; locality: string }
type Account = { email: string; name: string | null; mahallId: string | null; role: 'USER' | 'MAHALL_ADMIN' | 'SUPER_ADMIN' }
const sessionKey = 'amanah-session'
const returnKey = 'amanah-return'
const directoryPath = '/admin/mahallus'
const adminPaths = ['/admin/review', '/admin/collections', directoryPath]
const protectedPaths = ['/give', '/calculate', '/help', '/account', ...adminPaths]
const isDirectoryPage = (path: string) => path === directoryPath || /^\/admin\/mahallus\/[^/]+$/.test(path)
const isAdminPage = (path: string) => adminPaths.includes(path) || isDirectoryPage(path)
const intakeSteps = ['Where you live', 'Your household', 'Monthly finances']
const pages = [
  ['/', 'Home', House],
  ['/give', 'Give', HandHeart],
  ['/calculate', 'Calculate', Calculator],
  ['/help', 'Get help', LifeBuoy],
  ['/account', 'Account', UserRound],
] as const
const adminPages = [
  ['/account', 'Dashboard', House],
  ['/admin/review', 'Review', ClipboardCheck],
  ['/admin/collections', 'Collections', Wallet],
] as const
const superAdminPages = [adminPages[0], [directoryPath, 'Mahallus', Building2] as const, ...adminPages.slice(1)]

function Eligibility({ account }: { account: Account }) {
  const [mahalls, setMahalls] = useState<Mahall[]>([])
  const [status, setStatus] = useState<'loading' | 'ready' | 'error'>('loading')
  const [attempt, setAttempt] = useState(0)
  const [caseStatus, setCaseStatus] = useState<string | null | undefined>(undefined)
  const [caseError, setCaseError] = useState('')
  const [reviewNote, setReviewNote] = useState('')
  const [applicantResponse, setApplicantResponse] = useState('')
  const [saving, setSaving] = useState(false)
  const [step, setStep] = useState(0)
  const heading = useRef<HTMLHeadingElement>(null)

  function changeStep(next: number) {
    setStep(next)
    heading.current?.focus()
  }

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
        setReviewNote(result.eligibility?.additionalInformation ?? '')
        setApplicantResponse(result.eligibility?.applicantResponse ?? '')
      } catch {
        if (!request.signal.aborted) setCaseError('Could not load your eligibility case. Reload or sign in again.')
      }
    }
    void loadCase()
    return () => request.abort()
  }, [])

  async function sendFollowUp(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const message = new FormData(event.currentTarget).get('message')
    setSaving(true)
    setCaseError('')
    try {
      const response = await fetch(new URL('/auth/eligibility/follow-up', API_BASE_URL), {
        method: 'POST',
        headers: { Authorization: `Bearer ${sessionStorage.getItem(sessionKey)}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({ message }),
      })
      const result = await response.json()
      if (!response.ok) throw new Error(result.message || 'Could not send your response')
      setCaseStatus(result.status)
      setApplicantResponse(result.applicantResponse)
    } catch (error) {
      setCaseError(error instanceof Error ? error.message : 'Could not send your response')
    } finally {
      setSaving(false)
    }
  }

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (step < intakeSteps.length - 1) {
      changeStep(step + 1)
      return
    }
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
      {reviewNote && <p>{reviewNote}</p>}
      {applicantResponse && <p><strong>Your response</strong><br />{applicantResponse}</p>}
      {caseStatus === 'MORE_INFORMATION_REQUIRED' && (
        <form onSubmit={(event) => void sendFollowUp(event)}>
          <p><label>Respond to your reviewer<textarea name="message" rows={4} maxLength={2000} required /></label></p>
          <button disabled={saving}>Send response</button>
        </form>
      )}
      {caseStatus === null && (
      <form className="intake" onSubmit={(event) => void submit(event)}>
        <p className="step-count">Step {step + 1} of {intakeSteps.length}</p>
        <progress aria-label="Eligibility steps" value={step + 1} max={intakeSteps.length} />
        <h3 ref={heading} tabIndex={-1}>{intakeSteps[step]}</h3>
        <div hidden={step !== 0}>
          <p><label>Locality<input name="locality" autoComplete="address-level2" required maxLength={120} /></label></p>
          <p><label>PIN code<input name="postalCode" autoComplete="postal-code" inputMode="numeric" pattern="[0-9]{6}" required /></label></p>
          <p><label>Home Mahallu (optional)
            <select name="mahall" value={account.mahallId ?? undefined} disabled={status !== 'ready' || Boolean(account.mahallId)}>
              <option value="">No home Mahallu</option>
              {mahalls.map((mahall) => <option key={mahall.id} value={mahall.id}>{mahall.name} ({mahall.locality})</option>)}
            </select>
          </label></p>
          {status === 'loading' && <p role="status">Loading Mahallus…</p>}
          {status === 'error' && <p role="alert">Could not load Mahallus. <button type="button" onClick={() => {
            setStatus('loading')
            setAttempt(attempt + 1)
          }}>Retry</button></p>}
        </div>
        <div hidden={step !== 1}>
          <p><label>How many people live in your household?
            <input name="householdSize" type="number" inputMode="numeric" min="1" max="100" required={step >= 1} />
          </label></p>
        </div>
        <div hidden={step !== 2}>
          <p>Enter 0 if there is no income or expense to report.</p>
          <p><label>Monthly household income (₹)<input name="income" type="number" inputMode="decimal" min="0" max="21474836.47" step="0.01" required={step === 2} /></label></p>
          <p><label>Monthly essential expenses (₹)<input name="expenses" type="number" inputMode="decimal" min="0" max="21474836.47" step="0.01" required={step === 2} /></label></p>
        </div>
        <div className="intake-actions">
          {step > 0 && <button type="button" disabled={saving} onClick={() => changeStep(step - 1)}>Back</button>}
          <button disabled={saving || (step === 0 && status !== 'ready')}>{step === 2 ? 'Submit for verification' : 'Continue'}</button>
        </div>
        <p className="privacy-note">Only authorized reviewers can see your household details.</p>
      </form>
      )}
    </section>
  )
}

export default function App() {
  const [page] = useState(() => {
    const params = new URLSearchParams(location.hash.slice(1))
    return ['session', 'auth_error', 'verify_email'].some((key) => params.has(key))
      ? '/login'
      : location.pathname.replace(/\/$/, '') || '/'
  })
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
      history.replaceState(null, '', '/login' + window.location.search)
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

  const token = account ? sessionStorage.getItem(sessionKey) : null
  const requiresLogin = (protectedPaths.includes(page) || isDirectoryPage(page)) && !account
  const isAdmin = Boolean(account && account.role !== 'USER')
  const canReview = account?.role === 'SUPER_ADMIN' || (account?.role === 'MAHALL_ADMIN' && Boolean(account.mahallId))
  const nextPath = new URLSearchParams(location.search).get('next') ?? sessionStorage.getItem(returnKey)
  const destination = isAdmin
    ? nextPath && isAdminPage(nextPath) ? nextPath : '/account'
    : nextPath && protectedPaths.includes(nextPath) && !adminPaths.includes(nextPath) ? nextPath : '/account'

  useEffect(() => {
    if (loading) return
    if (requiresLogin) {
      sessionStorage.setItem(returnKey, page)
      location.replace('/login?next=' + encodeURIComponent(page))
    } else if (page === '/login' && account) {
      sessionStorage.removeItem(returnKey)
      location.replace(destination)
    }
  }, [account, destination, loading, page, requiresLogin])

  const accountPage = page === '/account' || page === '/help'
  const publicLayout = page === '/' || page === '/login' || !account
  const canViewDirectory = account?.role === 'SUPER_ADMIN'
  const navigation = canViewDirectory ? superAdminPages : isAdmin ? adminPages : pages

  return (
    <div className={publicLayout ? 'public-shell' : isAdmin ? 'app-shell admin-shell' : 'app-shell'}>
    {publicLayout ? (
      <header className="public-header">
        <div>
          <a className="wordmark" href="/">Amanah</a>
          <a className="primary-link public-login" href={account ? '/account' : '/login'}>{account ? 'My account' : 'Log in'}</a>
        </div>
      </header>
    ) : <header className="site-header">
      <div className="site-header-inner">
        <a className="wordmark" href="/">Amanah</a>
        <nav className="site-nav" aria-label="Main navigation">
          {navigation.map(([path, title, Icon]) => (
            <a key={path} href={path} aria-current={page === path || (path === directoryPath && isDirectoryPage(page)) ? 'page' : undefined}>
              <Icon aria-hidden="true" size={21} strokeWidth={1.8} />
              <span>{path === '/account' && !account ? 'Log in' : title}</span>
            </a>
          ))}
        </nav>
      </div>
    </header>}
    <main id="main-content" className={page === '/' ? 'landing' : 'workspace'}>
    {page === '/' && (
      <>
        <section className="landing-hero">
          <h1>Zakat,<br />made simple.</h1>
          <p>Give to verified recipients in your community or check your eligibility through Amanah.</p>
          <div className="hero-actions">
            <a className="primary-link" href="/give">I want to give</a>
            <a className="action-link" href="/help">I need help</a>
          </div>
        </section>
        <section className="landing-overview">
          <h2>How Amanah helps</h2>
          <div className="landing-links">
            <a href="/give"><HandHeart aria-hidden="true" /><strong>Give Zakat</strong><span>Find verified recipients by area or give through a Mahallu committee.</span></a>
            <a href="/calculate"><Calculator aria-hidden="true" /><strong>Calculate Zakat</strong><span>Estimate what you owe using your Nisab threshold.</span></a>
            <a href="/help"><LifeBuoy aria-hidden="true" /><strong>Get help</strong><span>Send your household details for verification and track your status.</span></a>
          </div>
        </section>
        <section className="landing-privacy">
          <ShieldCheck aria-hidden="true" size={32} />
          <h2>Private by design.</h2>
          <p>Only authorized reviewers see household details. Givers see the recipient’s area and level of need.</p>
        </section>
        <footer className="landing-footer">Amanah <a href={account ? '/account' : '/login'}>{account ? 'My account' : 'Log in'}</a></footer>
      </>
    )}
    {requiresLogin && <p role="status">{loading ? 'Checking your session…' : 'Opening login…'}</p>}
    {page === '/login' && <section className="login-panel">
      <h1>Welcome back</h1>
      <p>{nextPath ? 'Log in to continue.' : 'Log in to Amanah.'}</p>
      {error && <p role="alert">{error}</p>}
      {loading ? <p role="status">Checking your session…</p> : !account && (
        <>
          <EmailAccess sessionKey={sessionKey} />
          <a className="action-link google-login" href={new URL('/auth/google', API_BASE_URL).href}>Sign in with Google</a>
        </>
      )}
    </section>}
    {accountPage && account && <div className={isAdmin && page === '/account' ? 'panel' : 'panel account-panel'}>
      <h1>{page === '/help' ? 'Get help with Zakat' : account.role === 'SUPER_ADMIN' ? 'Super admin dashboard' : account.role === 'MAHALL_ADMIN' ? 'Mahallu dashboard' : 'Your account'}</h1>
      {account && (
        <>
          <p>Signed in as {account.name ?? account.email}</p>
          <button type="button" onClick={() => {
            sessionStorage.removeItem(sessionKey)
            sessionStorage.removeItem(returnKey)
            location.assign('/login')
          }}>Sign out</button>
          {page === '/account' && canReview && token && <AdminOverview token={token} />}
          {isAdmin && page === '/account' && (
            canReview ? <div className="admin-shortcuts">
              {canViewDirectory && <a href={directoryPath}><Building2 aria-hidden="true" /><strong>Mahallu directory</strong><span>View registered Mahallus, admins, and members.</span></a>}
              <a href="/admin/review"><ClipboardCheck aria-hidden="true" /><strong>Eligibility review</strong><span>{account.role === 'SUPER_ADMIN' ? 'Review or delegate eligibility cases.' : 'Review cases assigned to your Mahallu.'}</span></a>
              <a href="/admin/collections"><Wallet aria-hidden="true" /><strong>Committee collections</strong><span>Check contributions and confirm receipts.</span></a>
            </div> : <p>A super admin needs to assign your Mahallu before you can review cases or collections.</p>
          )}
          {page === '/help' && <Eligibility account={account} />}
          {page === '/account' && account.role === 'USER' && <p><a href="/help">Check your eligibility</a></p>}
        </>
      )}
    </div>}
    {page === '/admin/review' && token && canReview && <div className="panel"><ReviewDashboard token={token} superAdmin={account?.role === 'SUPER_ADMIN'} /></div>}
    {page === '/admin/collections' && token && canReview && <CommitteeLedger token={token} admin />}
    {isDirectoryPage(page) && token && canViewDirectory && <MahalluDirectory token={token} path={directoryPath} selectedId={page === directoryPath ? undefined : page.slice(directoryPath.length + 1)} />}
    {isAdminPage(page) && account && (isDirectoryPage(page) ? !canViewDirectory : !canReview) && <section className="panel"><h1>Admin access required</h1><p>This page is available to authorized admins.</p><a href="/account">Go to your account</a></section>}
    {page === '/give' && token && (
      <>
        <Giving key={account?.email ?? 'guest'} token={token} />
        {token && <CommitteeLedger token={token} />}
      </>
    )}
    {page === '/calculate' && token && <ZakatCalculator token={token} />}
    {page !== '/' && page !== '/login' && !protectedPaths.includes(page) && !isDirectoryPage(page) && <h1>Page not found</h1>}
    </main>
    </div>
  )
}
