import { DashboardSidebar, DashboardTopbar } from './DashboardChrome'
import { Landing } from './Landing'
import { Link } from './navigation'
import { navigate } from './navigate'
import { useEffect, useRef, useState, type FormEvent } from 'react'
import { Building2, Calculator, ClipboardCheck, Wallet } from 'lucide-react'
import { MahalluDirectory } from './MahalluDirectory'
import { AdminOverview } from './AdminOverview'
import { UserDashboard } from './UserDashboard'
import { Onboarding, type OnboardingProfile } from './Onboarding'
import { API_BASE_URL } from './config/api'
import { EmailAccess } from './EmailAccess'
import { ReviewDashboard } from './ReviewDashboard'
import { Giving } from './Giving'
import { ZakatCalculator } from './ZakatCalculator'
import { CommitteeLedger } from './CommitteeLedger'
import { CommitteeAllocations } from './CommitteeAllocations'
import { KnowledgeModal } from './KnowledgeModal'

type Mahall = { id: string; name: string; locality: string }
type Account = { email: string; name: string | null; mahallId: string | null; role: 'USER' | 'MAHALL_ADMIN' | 'SUPER_ADMIN'; onboardingProfile?: OnboardingProfile | null }
const sessionKey = 'amanah-session'
const returnKey = 'amanah-return'
const directoryPath = '/admin/mahallus'
const adminPaths = ['/admin/review', '/admin/collections', directoryPath]
const protectedPaths = ['/dashboard', '/onboarding', '/give', '/calculate', '/help', '/account', ...adminPaths]
const isDirectoryPage = (path: string) => path === directoryPath || /^\/admin\/mahallus\/[^/]+$/.test(path)
const isAdminPage = (path: string) => adminPaths.includes(path) || isDirectoryPage(path)
const intakeSteps = ['Where you live', 'Your household', 'Monthly finances', 'Supporting information']

function Eligibility({ account }: { account: Account }) {
  const profile = account.onboardingProfile
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
      const file = fields.get('document')
      let document: string | undefined
      if (file instanceof File && file.size > 0) {
        if (file.size > 2_097_152) throw new Error('Choose a document up to 2 MB.')
        document = await new Promise<string>((resolve, reject) => {
          const reader = new FileReader()
          reader.onload = () => resolve(String(reader.result).split(',')[1])
          reader.onerror = () => reject(new Error('Could not read your document. Choose the file again.'))
          reader.readAsDataURL(file)
        })
      }
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
          verificationNotes: fields.get('verificationNotes'),
          document,
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
      <h1 id="eligibility-title">Apply for Zakat eligibility</h1>
      {!caseStatus && <p>Share your household circumstances so an authorized reviewer can assess your eligibility.</p>}
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
          <p><label>Locality<input name="locality" defaultValue={profile?.locality} autoComplete="address-level2" required maxLength={120} /></label></p>
          <p><label>PIN code<input name="postalCode" defaultValue={profile?.postalCode} autoComplete="postal-code" inputMode="numeric" pattern="[0-9]{6}" required /></label></p>
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
            <input name="householdSize" defaultValue={profile?.householdSize} type="number" inputMode="numeric" min="1" max="100" required={step >= 1} />
          </label></p>
        </div>
        <div hidden={step !== 2}>
          <p>Enter 0 if there is no income or expense to report.</p>
          <p><label>Monthly household income (₹)<input name="income" defaultValue={profile ? profile.monthlyIncomePaise / 100 : undefined} type="number" inputMode="decimal" min="0" max="21474836.47" step="0.01" required={step >= 2} /></label></p>
          <p><label>Monthly essential expenses (₹)<input name="expenses" defaultValue={profile ? profile.monthlyExpensesPaise / 100 : undefined} type="number" inputMode="decimal" min="0" max="21474836.47" step="0.01" required={step >= 2} /></label></p>
        </div>
        <div hidden={step !== 3}>
          <p><label>Tell your reviewer about your circumstances<textarea name="verificationNotes" rows={4} maxLength={2000} required={step === 3} /></label></p>
          <p><label>Supporting document (optional)<input name="document" type="file" accept="application/pdf,image/jpeg,image/png" aria-describedby="document-hint" /></label></p>
          <p id="document-hint" className="privacy-note">One PDF, JPEG or PNG up to 2 MB. Choose a file that helps verify your circumstances.</p>
        </div>
        <div className="intake-actions">
          {step > 0 && <button type="button" disabled={saving} onClick={() => changeStep(step - 1)}>Back</button>}
          <button disabled={saving || (step === 0 && status !== 'ready')}>{step === 3 ? 'Submit for verification' : 'Continue'}</button>
        </div>
        <p className="privacy-note">Reviewers see your details and document. Givers only see your area and a broad financial summary after approval.</p>
      </form>
      )}
    </section>
  )
}

export default function App() {
  const [route, setRoute] = useState(() => {
    const params = new URLSearchParams(location.hash.slice(1))
    return ['session', 'auth_error', 'verify_email'].some((key) => params.has(key))
      ? '/login' + location.search
      : location.pathname + location.search
  })
  const [pathname, search = ''] = route.split('?')
  const page = pathname === '/index.html' ? '/' : pathname.replace(/\/$/, '') || '/'
  useEffect(() => {
    const update = () => setRoute(location.pathname + location.search)
    window.addEventListener('popstate', update)
    return () => window.removeEventListener('popstate', update)
  }, [])
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
  const needsOnboarding = account?.role === 'USER' && account.onboardingProfile === null
  const canReview = account?.role === 'SUPER_ADMIN' || (account?.role === 'MAHALL_ADMIN' && Boolean(account.mahallId))
  const nextPath = new URLSearchParams(search).get('next') ?? sessionStorage.getItem(returnKey)
  const destination = isAdmin
    ? nextPath && isAdminPage(nextPath) ? nextPath : '/account'
    : '/dashboard'

  useEffect(() => {
    if (loading) return
    if (requiresLogin) {
      sessionStorage.setItem(returnKey, page)
      navigate('/login?next=' + encodeURIComponent(page), true)
    } else if (needsOnboarding && page !== '/' && page !== '/onboarding') {
      navigate('/onboarding', true)
    } else if (page === '/onboarding' && account && !needsOnboarding) {
      navigate(isAdmin ? '/account' : '/dashboard', true)
    } else if (page === '/login' && account) {
      sessionStorage.removeItem(returnKey)
      navigate(destination, true)
    }
  }, [account, destination, isAdmin, loading, needsOnboarding, page, requiresLogin])

  const accountPage = !needsOnboarding && page === '/account'
  const publicLayout = page === '/' || page === '/login' || !account || needsOnboarding
  const canViewDirectory = account?.role === 'SUPER_ADMIN'
  const activePage = isDirectoryPage(page) ? directoryPath : page
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [activeKnowledgeTopic, setActiveKnowledgeTopic] = useState<string | null>(null)

  function signOut() {
    sessionStorage.removeItem(sessionKey)
    sessionStorage.removeItem(returnKey)
    setAccount(null)
    setError('')
    navigate('/login')
  }

  return (
    <div className={publicLayout ? 'public-shell' : 'reference-app'}>
    <a className="skip-link" href="#main-content">Skip to content</a>
    {publicLayout ? (
      page === '/' ? null : (
        <header className="public-header">
          <div>
            <Link className="wordmark" href="/">Amanah</Link>
            <Link className="primary-link public-login" href={account ? isAdmin ? '/account' : '/dashboard' : '/login'}>{account ? 'My account' : 'Log in'}</Link>
          </div>
        </header>
      )
    ) : (
      <>
        <div className="mobile-bar">
          <div className="reference-logo" style={{ padding: 0 }}>
            <div className="reference-logo-mark" aria-hidden="true">
              <svg viewBox="0 0 48 48" fill="none">
                <path d="M24 4 L24 8" stroke="#0A4A2A" strokeWidth="2" strokeLinecap="round" />
                <circle cx="24" cy="10" r="2" fill="#C9A86A" />
                <path d="M8 38 C8 24 14 18 24 12 C34 18 40 24 40 38" stroke="#0A4A2A" strokeWidth="2.4" fill="#EAF6EE" />
                <path d="M17 38 V28 C17 24 20 22 24 22 C28 22 31 24 31 28 V38" fill="#C9A86A" opacity=".9" />
                <path d="M6 38 H42" stroke="#0A4A2A" strokeWidth="2.4" strokeLinecap="round" />
              </svg>
            </div>
            <div className="reference-logo-text">
              <strong>AMANAH</strong>
              <span>Zakat Platform</span>
            </div>
          </div>
          <button
            type="button"
            className="menu-btn"
            id="menuBtn"
            aria-label="Open menu"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
            {mobileMenuOpen ? '✕' : '☰'}
          </button>
        </div>
        <DashboardSidebar
          active={activePage}
          member={!isAdmin}
          onSignOut={signOut}
          onOpenKnowledge={(topic) => setActiveKnowledgeTopic(topic ?? 'What is Zakat?')}
          open={mobileMenuOpen}
          setOpen={setMobileMenuOpen}
        />
      </>
    )}
    <main id="main-content" className={page === '/' ? 'landing' : publicLayout ? 'workspace' : 'reference-main'}>
    {!publicLayout && account && (
      <DashboardTopbar
        profile={account}
        onSignOut={signOut}
        onOpenKnowledge={(topic) => setActiveKnowledgeTopic(topic ?? 'What is Zakat?')}
      />
    )}
    {page === '/' && <Landing accountPath={account ? isAdmin ? '/account' : '/dashboard' : '/login'} />}
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
      <h1>{account.role === 'SUPER_ADMIN' ? 'Super admin dashboard' : account.role === 'MAHALL_ADMIN' ? 'Mahallu dashboard' : 'Your account'}</h1>
      {account && (
        <>
          <p>Signed in as {account.name ?? account.email}</p>
          <button type="button" onClick={signOut}>Sign out</button>
          {page === '/account' && canReview && token && <AdminOverview token={token} />}
          {isAdmin && page === '/account' && (
            canReview ? <div className="admin-shortcuts">
              {canViewDirectory && <Link href={directoryPath}><Building2 aria-hidden="true" /><strong>Mahallu directory</strong><span>View registered Mahallus, admins, and members.</span></Link>}
              <Link href="/admin/review"><ClipboardCheck aria-hidden="true" /><strong>Eligibility review</strong><span>{account.role === 'SUPER_ADMIN' ? 'Review or delegate eligibility cases.' : 'Review cases assigned to your Mahallu.'}</span></Link>
              <Link href="/admin/collections"><Wallet aria-hidden="true" /><strong>Committee collections</strong><span>Check contributions and confirm receipts.</span></Link>
            </div> : <p>A super admin needs to assign your Mahallu before you can review cases or collections.</p>
          )}
          {page === '/account' && account.role === 'USER' && <p><Link href="/help">Check your eligibility</Link></p>}
        </>
      )}
    </div>}
    {page === '/admin/review' && token && canReview && <div className="panel"><ReviewDashboard token={token} superAdmin={account?.role === 'SUPER_ADMIN'} /></div>}
    {page === '/admin/collections' && token && canReview && <CommitteeLedger token={token} admin />}
    {page === '/admin/collections' && token && canReview && <CommitteeAllocations token={token} admin />}
    {page === '/onboarding' && token && account && needsOnboarding && <Onboarding token={token} name={account.name} mahallId={account.mahallId} onSaved={(saved) => {
      setAccount({ ...account, ...saved })
      sessionStorage.removeItem(returnKey)
      navigate('/dashboard', true)
    }} />}
    {page === '/dashboard' && token && account && !needsOnboarding && (
      <UserDashboard
        token={token}
        name={account.name}
        onOpenKnowledge={(topic) => setActiveKnowledgeTopic(topic ?? 'What is Zakat?')}
      />
    )}
    {page === '/help' && token && account && !needsOnboarding && <>
      <div className="panel"><Eligibility account={account} /></div>
      <CommitteeAllocations token={token} />
    </>}
    {isDirectoryPage(page) && token && canViewDirectory && <MahalluDirectory token={token} path={directoryPath} selectedId={page === directoryPath ? undefined : page.slice(directoryPath.length + 1)} />}
    {isAdminPage(page) && account && (isDirectoryPage(page) ? !canViewDirectory : !canReview) && <section className="panel"><h1>Admin access required</h1><p>This page is available to authorized admins.</p><Link href="/account">Go to your account</Link></section>}
    {page === '/give' && token && !needsOnboarding && (
      <>
        <section className="panel">
          <h1>Give Zakat</h1>
          <div className="admin-shortcuts">
            <Link href="/calculate"><Calculator aria-hidden="true" /><strong>Calculate Zakat</strong></Link>
          </div>
        </section>
        <Giving key={account?.email ?? 'guest'} token={token} />
      </>
    )}
    {page === '/calculate' && token && !needsOnboarding && <ZakatCalculator token={token} />}
    {page !== '/' && page !== '/login' && !protectedPaths.includes(page) && !isDirectoryPage(page) && <h1>Page not found</h1>}
    </main>
    <KnowledgeModal
      topic={activeKnowledgeTopic}
      onClose={() => setActiveKnowledgeTopic(null)}
    />
    </div>
  )
}
