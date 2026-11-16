import { useState, useEffect, type FormEvent } from 'react'
import {
  Mail,
  LockKeyhole,
  Eye,
  EyeOff,
  ArrowRight,
  ArrowLeft,
  ShieldCheck,
  Landmark,
  CheckCircle2,
  Sparkles,
  AlertCircle,
  Scale,
} from 'lucide-react'
import { Link } from './navigation'
import { navigate } from './navigate'
import { API_BASE_URL } from './config/api'

// Framer-style dual-layer text roll helper component
function VxRollText({ text }: { text: string }) {
  return (
    <span className="vx-btn-roll">
      <span className="vx-btn-roll-inner">
        <span className="vx-btn-roll-text">{text}</span>
        <span className="vx-btn-roll-text" aria-hidden="true">{text}</span>
      </span>
    </span>
  )
}

export function AuthPage({
  initialMode = 'login',
  sessionKey,
  nextPath,
  initialError,
}: {
  initialMode?: 'login' | 'register'
  sessionKey: string
  nextPath?: string | null
  initialError?: string
}) {
  const [mode, setMode] = useState<'login' | 'register' | 'verify'>(() => {
    const hash = new URLSearchParams(location.hash.slice(1))
    if (hash.has('verify_email')) return 'verify'
    return initialMode
  })

  const [verifyToken] = useState<string | null>(() => {
    return new URLSearchParams(location.hash.slice(1)).get('verify_email')
  })

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [busy, setBusy] = useState(false)
  const [errorMessage, setErrorMessage] = useState(initialError || '')
  const [successMessage, setSuccessMessage] = useState('')

  // Sync mode changes with URL without full page reload
  const changeMode = (newMode: 'login' | 'register') => {
    setMode(newMode)
    setErrorMessage('')
    setSuccessMessage('')
    const targetUrl = newMode === 'register' ? '/register' : '/login'
    const fullTarget = nextPath ? `${targetUrl}?next=${encodeURIComponent(nextPath)}` : targetUrl
    history.replaceState(null, '', fullTarget)
  }

  useEffect(() => {
    if (verifyToken) {
      history.replaceState(null, '', '/login' + location.search)
    }
  }, [verifyToken])

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setBusy(true)
    setErrorMessage('')
    setSuccessMessage('')

    const action = mode === 'verify' ? 'verify' : mode === 'register' ? 'register' : 'login'
    const payload =
      mode === 'verify'
        ? { token: verifyToken, password }
        : mode === 'register'
        ? { email }
        : { email, password }

    try {
      const response = await fetch(new URL('/auth/email/' + action, API_BASE_URL), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })

      const result = await response.json()
      if (!response.ok) {
        throw new Error(result.message || 'Authentication request failed.')
      }

      if (result.session) {
        sessionStorage.setItem(sessionKey, result.session)
        const destination = nextPath || '/dashboard'
        navigate(destination, true)
        window.location.reload()
      } else if (result.message) {
        setSuccessMessage(result.message)
      }
    } catch (err) {
      setErrorMessage(err instanceof Error ? err.message : 'An unexpected error occurred. Please try again.')
    } finally {
      setBusy(false)
    }
  }

  const googleAuthUrl = new URL('/auth/google', API_BASE_URL).href

  return (
    <div className="vx-landing" style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      {/* 1. FLOATING PILL NAVBAR */}
      <div className="vx-nav-wrapper">
        <header className="vx-nav">
          <Link className="vx-brand" href="/">
            <div className="vx-brand-mark" aria-hidden="true">
              <Landmark size={20} />
            </div>
            <div className="vx-brand-text">
              <span className="vx-brand-name">AMANAH</span>
              <span className="vx-brand-tag">Community Zakat</span>
            </div>
          </Link>

          <div className="vx-nav-actions">
            <Link className="vx-btn vx-btn-ghost" href="/">
              <ArrowLeft size={16} />
              <VxRollText text="Back to Home" />
            </Link>
            <Link className="vx-btn vx-btn-secondary" href="/calculate">
              <Scale size={15} />
              <VxRollText text="Nisab Rates" />
            </Link>
          </div>
        </header>
      </div>

      {/* 2. AUTH MAIN CONTENT */}
      <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1.5rem', position: 'relative' }}>
        {/* Ambient Radial Glow */}
        <div className="vx-hero-bg" aria-hidden="true" style={{ top: '-10%', height: '700px' }} />

        {/* Floating Trust Badges */}
        <div className="vx-floating-chip vx-chip-top" style={{ top: '8%', right: '8%' }}>
          <div className="vx-chip-icon">
            <ShieldCheck size={20} />
          </div>
          <div className="vx-chip-text">
            <strong>100% Direct Giving</strong>
            <span>Zero administrative deductions</span>
          </div>
        </div>

        <div className="vx-floating-chip vx-chip-bottom" style={{ bottom: '8%', left: '8%' }}>
          <div className="vx-chip-icon">
            <Sparkles size={20} />
          </div>
          <div className="vx-chip-text">
            <strong>Scholar-Audited Governance</strong>
            <span>Surah At-Tawbah (9:60) Compliant</span>
          </div>
        </div>

        {/* Central Auth Glass Card */}
        <div className="vx-auth-card" style={{
          width: '100%',
          maxWidth: '480px',
          background: 'rgba(255, 255, 255, 0.94)',
          backdropFilter: 'blur(20px)',
          WebkitBackdropFilter: 'blur(20px)',
          border: '1px solid rgba(14, 92, 72, 0.15)',
          borderRadius: '28px',
          padding: 'clamp(1.75rem, 4vw, 2.5rem)',
          boxShadow: '0 25px 70px rgba(11, 42, 34, 0.08), 0 4px 16px rgba(11, 42, 34, 0.03)',
          position: 'relative',
          zIndex: 10,
        }}>
          {/* Top Pill Badge */}
          <div style={{ textAlign: 'center', marginBottom: '1.25rem' }}>
            <div className="vx-badge-pill" style={{ marginBottom: '0.75rem' }}>
              <span className="vx-badge-dot" />
              <span>
                {mode === 'verify'
                  ? 'PASSWORD VERIFICATION'
                  : mode === 'register'
                  ? 'JOIN AMANAH COMMUNITY'
                  : 'COMMUNITY PORTAL'}
              </span>
            </div>

            <h1 style={{
              fontSize: 'clamp(1.75rem, 3.2vw, 2.25rem)',
              fontWeight: 800,
              letterSpacing: '-0.03em',
              color: 'var(--vx-dark)',
              lineHeight: 1.15,
              margin: '0 0 0.5rem',
            }}>
              {mode === 'verify' ? (
                <>Activate Your <span className="vx-serif">Account</span></>
              ) : mode === 'register' ? (
                <>Join the <span className="vx-serif">Barakah</span> Community</>
              ) : (
                <>Welcome Back to <span className="vx-serif">Amanah</span></>
              )}
            </h1>

            <p style={{
              fontSize: '0.88rem',
              color: 'var(--vx-text-secondary)',
              lineHeight: 1.5,
              margin: 0,
            }}>
              {mode === 'verify'
                ? 'Set a secure password to finalize your verified community profile.'
                : mode === 'register'
                ? 'Create a verified account to give directly, request emergency aid, or access your local Mahallu.'
                : 'Sign in to access your direct Zakat allocations, local Mahallu ledger, and tax receipts.'}
            </p>
          </div>

          {/* Interactive Mode Tabs (Sign In / Register) */}
          {mode !== 'verify' && (
            <div style={{
              display: 'flex',
              background: 'var(--vx-surface-alt)',
              padding: '0.3rem',
              borderRadius: '9999px',
              border: '1px solid var(--vx-border)',
              marginBottom: '1.5rem',
            }}>
              <button
                type="button"
                onClick={() => changeMode('login')}
                style={{
                  flex: 1,
                  padding: '0.55rem',
                  borderRadius: '9999px',
                  border: 'none',
                  fontSize: '0.85rem',
                  fontWeight: 700,
                  cursor: 'pointer',
                  transition: 'all 0.25s cubic-bezier(0.16, 1, 0.3, 1)',
                  background: mode === 'login' ? '#ffffff' : 'transparent',
                  color: mode === 'login' ? 'var(--vx-dark)' : 'var(--vx-text-secondary)',
                  boxShadow: mode === 'login' ? '0 2px 10px rgba(11, 42, 34, 0.08)' : 'none',
                }}
              >
                Sign In
              </button>
              <button
                type="button"
                onClick={() => changeMode('register')}
                style={{
                  flex: 1,
                  padding: '0.55rem',
                  borderRadius: '9999px',
                  border: 'none',
                  fontSize: '0.85rem',
                  fontWeight: 700,
                  cursor: 'pointer',
                  transition: 'all 0.25s cubic-bezier(0.16, 1, 0.3, 1)',
                  background: mode === 'register' ? '#ffffff' : 'transparent',
                  color: mode === 'register' ? 'var(--vx-dark)' : 'var(--vx-text-secondary)',
                  boxShadow: mode === 'register' ? '0 2px 10px rgba(11, 42, 34, 0.08)' : 'none',
                }}
              >
                Create Account
              </button>
            </div>
          )}

          {/* Google Fast Authentication Button */}
          {mode !== 'verify' && (
            <>
              <a
                href={googleAuthUrl}
                className="vx-btn vx-btn-secondary"
                style={{
                  width: '100%',
                  padding: '0.75rem',
                  fontSize: '0.9rem',
                  fontWeight: 700,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '0.75rem',
                  borderRadius: '14px',
                  borderColor: 'var(--vx-border)',
                  marginBottom: '1.25rem',
                  boxShadow: '0 2px 6px rgba(11, 42, 34, 0.03)',
                }}
              >
                <svg width="18" height="18" viewBox="0 0 24 24">
                  <path
                    fill="#4285F4"
                    d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.8-2.4 3.66v3.05h3.89c2.28-2.1 3.655-5.2 3.655-9.15z"
                  />
                  <path
                    fill="#34A853"
                    d="M12 24c3.24 0 5.96-1.07 7.95-2.91l-3.89-3.05c-1.08.72-2.46 1.16-4.06 1.16-3.13 0-5.78-2.11-6.73-4.96H1.24v3.15C3.26 21.36 7.34 24 12 24z"
                  />
                  <path
                    fill="#FBBC05"
                    d="M5.27 14.24c-.25-.72-.39-1.49-.39-2.24s.14-1.52.39-2.24V6.61H1.24C.45 8.18 0 9.94 0 12s.45 3.82 1.24 5.39l4.03-3.15z"
                  />
                  <path
                    fill="#EA4335"
                    d="M12 4.75c1.76 0 3.35.61 4.6 1.8l3.43-3.43C17.95 1.19 15.23 0 12 0 7.34 0 3.26 2.64 1.24 6.61l4.03 3.15c.95-2.85 3.6-4.96 6.73-4.96z"
                  />
                </svg>
                <VxRollText text="Continue with Google" />
              </a>

              {/* Modern Divider */}
              <div style={{
                display: 'flex',
                alignItems: 'center',
                margin: '1.25rem 0',
                color: 'var(--vx-text-muted)',
                fontSize: '0.72rem',
                fontFamily: 'var(--vx-font-mono)',
                textTransform: 'uppercase',
                letterSpacing: '0.08em',
              }}>
                <div style={{ flex: 1, height: '1px', background: 'var(--vx-border)' }} />
                <span style={{ padding: '0 0.85rem' }}>or continue with email</span>
                <div style={{ flex: 1, height: '1px', background: 'var(--vx-border)' }} />
              </div>
            </>
          )}

          {/* Alert Messages */}
          {errorMessage && (
            <div style={{
              display: 'flex',
              alignItems: 'flex-start',
              gap: '0.65rem',
              padding: '0.85rem 1rem',
              background: '#fef2f2',
              border: '1px solid #fecaca',
              borderRadius: '12px',
              color: '#991b1b',
              fontSize: '0.82rem',
              lineHeight: 1.5,
              marginBottom: '1.25rem',
            }}>
              <AlertCircle size={17} style={{ flexShrink: 0, marginTop: '2px' }} />
              <div>{errorMessage}</div>
            </div>
          )}

          {successMessage && (
            <div style={{
              display: 'flex',
              alignItems: 'flex-start',
              gap: '0.65rem',
              padding: '0.85rem 1rem',
              background: '#ecfdf5',
              border: '1px solid #a7f3d0',
              borderRadius: '12px',
              color: '#065f46',
              fontSize: '0.82rem',
              lineHeight: 1.5,
              marginBottom: '1.25rem',
            }}>
              <CheckCircle2 size={17} style={{ flexShrink: 0, marginTop: '2px' }} />
              <div>{successMessage}</div>
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit}>
            {/* Email Field (hidden during password verification) */}
            {mode !== 'verify' && (
              <div style={{ marginBottom: '1.15rem' }}>
                <label style={{
                  display: 'block',
                  fontSize: '0.8rem',
                  fontWeight: 700,
                  color: 'var(--vx-dark)',
                  marginBottom: '0.45rem',
                }}>
                  Email Address
                </label>
                <div style={{ position: 'relative' }}>
                  <div style={{
                    position: 'absolute',
                    left: '1rem',
                    top: '50%',
                    transform: 'translateY(-50%)',
                    color: 'var(--vx-text-muted)',
                    display: 'flex',
                    alignItems: 'center',
                    pointerEvents: 'none',
                  }}>
                    <Mail size={18} />
                  </div>
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="e.g. name@example.com"
                    autoComplete="email"
                    style={{
                      width: '100%',
                      padding: '0.75rem 1rem 0.75rem 2.75rem',
                      borderRadius: '12px',
                      border: '1px solid var(--vx-border)',
                      fontSize: '0.92rem',
                      color: 'var(--vx-dark)',
                      background: 'var(--vx-surface-alt)',
                      outline: 'none',
                      transition: 'all 0.2s ease',
                      fontFamily: 'inherit',
                    }}
                    onFocus={(e) => {
                      e.target.style.borderColor = 'var(--vx-primary)'
                      e.target.style.background = '#ffffff'
                      e.target.style.boxShadow = '0 0 0 3px rgba(14, 92, 72, 0.12)'
                    }}
                    onBlur={(e) => {
                      e.target.style.borderColor = 'var(--vx-border)'
                      e.target.style.background = 'var(--vx-surface-alt)'
                      e.target.style.boxShadow = 'none'
                    }}
                  />
                </div>
              </div>
            )}

            {/* Password Field (for Login and Verify) */}
            {(mode === 'login' || mode === 'verify') && (
              <div style={{ marginBottom: '1.25rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.45rem' }}>
                  <label style={{
                    fontSize: '0.8rem',
                    fontWeight: 700,
                    color: 'var(--vx-dark)',
                  }}>
                    {mode === 'verify' ? 'Create New Password' : 'Password'}
                  </label>
                  {mode === 'login' && (
                    <button
                      type="button"
                      onClick={() => changeMode('register')}
                      style={{
                        background: 'none',
                        border: 'none',
                        color: 'var(--vx-primary)',
                        fontSize: '0.75rem',
                        fontWeight: 600,
                        cursor: 'pointer',
                        padding: 0,
                      }}
                    >
                      Need help?
                    </button>
                  )}
                </div>

                <div style={{ position: 'relative' }}>
                  <div style={{
                    position: 'absolute',
                    left: '1rem',
                    top: '50%',
                    transform: 'translateY(-50%)',
                    color: 'var(--vx-text-muted)',
                    display: 'flex',
                    alignItems: 'center',
                    pointerEvents: 'none',
                  }}>
                    <LockKeyhole size={18} />
                  </div>
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder={mode === 'verify' ? 'Minimum 12 characters' : 'Enter your password'}
                    autoComplete={mode === 'verify' ? 'new-password' : 'current-password'}
                    minLength={mode === 'verify' ? 12 : undefined}
                    style={{
                      width: '100%',
                      padding: '0.75rem 2.75rem 0.75rem 2.75rem',
                      borderRadius: '12px',
                      border: '1px solid var(--vx-border)',
                      fontSize: '0.92rem',
                      color: 'var(--vx-dark)',
                      background: 'var(--vx-surface-alt)',
                      outline: 'none',
                      transition: 'all 0.2s ease',
                      fontFamily: 'inherit',
                    }}
                    onFocus={(e) => {
                      e.target.style.borderColor = 'var(--vx-primary)'
                      e.target.style.background = '#ffffff'
                      e.target.style.boxShadow = '0 0 0 3px rgba(14, 92, 72, 0.12)'
                    }}
                    onBlur={(e) => {
                      e.target.style.borderColor = 'var(--vx-border)'
                      e.target.style.background = 'var(--vx-surface-alt)'
                      e.target.style.boxShadow = 'none'
                    }}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    aria-label={showPassword ? 'Hide password' : 'Show password'}
                    style={{
                      position: 'absolute',
                      right: '0.85rem',
                      top: '50%',
                      transform: 'translateY(-50%)',
                      background: 'none',
                      border: 'none',
                      color: 'var(--vx-text-muted)',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                    }}
                  >
                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
              </div>
            )}

            {/* Registration note */}
            {mode === 'register' && (
              <div style={{
                background: 'var(--vx-mint-light)',
                border: '1px solid var(--vx-mint-border)',
                borderRadius: '12px',
                padding: '0.85rem 1rem',
                fontSize: '0.78rem',
                color: 'var(--vx-primary)',
                lineHeight: 1.5,
                marginBottom: '1.25rem',
              }}>
                <strong>Passwordless One-Time Link:</strong> We will email you a secure link to activate your account. No upfront password required and zero promotional messages.
              </div>
            )}

            {/* Primary Action Button */}
            <button
              type="submit"
              disabled={busy}
              className="vx-btn vx-btn-primary"
              style={{
                width: '100%',
                padding: '0.85rem',
                fontSize: '0.95rem',
                borderRadius: '14px',
                cursor: busy ? 'not-allowed' : 'pointer',
                opacity: busy ? 0.8 : 1,
              }}
            >
              <VxRollText
                text={
                  busy
                    ? 'Processing…'
                    : mode === 'verify'
                    ? 'Activate My Account'
                    : mode === 'register'
                    ? 'Send Verification Link'
                    : 'Sign In to Dashboard'
                }
              />
              <ArrowRight size={17} aria-hidden="true" />
            </button>
          </form>

          {/* Toggle Footnote */}
          {mode !== 'verify' && (
            <div style={{ textAlign: 'center', marginTop: '1.5rem', fontSize: '0.82rem', color: 'var(--vx-text-secondary)' }}>
              {mode === 'login' ? (
                <>
                  Don't have an Amanah account?{' '}
                  <button
                    type="button"
                    onClick={() => changeMode('register')}
                    style={{
                      background: 'none',
                      border: 'none',
                      color: 'var(--vx-primary)',
                      fontWeight: 700,
                      cursor: 'pointer',
                      padding: 0,
                    }}
                  >
                    Create one for free
                  </button>
                </>
              ) : (
                <>
                  Already registered?{' '}
                  <button
                    type="button"
                    onClick={() => changeMode('login')}
                    style={{
                      background: 'none',
                      border: 'none',
                      color: 'var(--vx-primary)',
                      fontWeight: 700,
                      cursor: 'pointer',
                      padding: 0,
                    }}
                  >
                    Sign in to your account
                  </button>
                </>
              )}
            </div>
          )}

          {/* Bottom Trust Guarantee */}
          <div style={{
            borderTop: '1px solid var(--vx-border)',
            marginTop: '1.5rem',
            paddingTop: '1rem',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '0.5rem',
            fontSize: '0.72rem',
            color: 'var(--vx-text-muted)',
            fontFamily: 'var(--vx-font-mono)',
          }}>
            <ShieldCheck size={14} color="var(--vx-mint)" />
            <span>256-bit Encrypted · Zero Admin Cuts · Tamleek Guaranteed</span>
          </div>
        </div>
      </div>
    </div>
  )
}
