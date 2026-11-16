import { useEffect, useRef, useState, type FormEvent } from 'react'
import { Landmark } from 'lucide-react'
import { Link } from './navigation'
import { navigate } from './navigate'

type Profile = {
  name: string | null
  email: string
  role: string
  mahallName?: string | null
}

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

export function DashboardSidebar({
  active,
  member,
  onSignOut,
  onOpenKnowledge,
  open,
  setOpen,
}: {
  active: string
  member: boolean
  onSignOut: () => void
  onOpenKnowledge?: (topic?: string) => void
  open: boolean
  setOpen: (open: boolean) => void
}) {
  return (
    <aside className={open ? 'reference-sidebar open' : 'reference-sidebar'} id="sidebar">
      <Link className="vx-brand" href={member ? '/dashboard' : '/account'} onClick={() => setOpen(false)} style={{ padding: '4px 10px 14px' }}>
        <div className="vx-brand-mark" aria-hidden="true" style={{ width: '2.4rem', height: '2.4rem' }}>
          <Landmark size={20} />
        </div>
        <div className="vx-brand-text">
          <span className="vx-brand-name">AMANAH</span>
          <span className="vx-brand-tag">Community Zakat</span>
        </div>
      </Link>

      <div className="reference-nav-label">Menu</div>
      <nav className="reference-nav" aria-label="Main">
        {member ? (
          <>
            <Link href="/dashboard" className={active === '/dashboard' ? 'active' : undefined} onClick={() => setOpen(false)}>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9">
                <rect x="3" y="3" width="7" height="7" rx="1.5" />
                <rect x="14" y="3" width="7" height="7" rx="1.5" />
                <rect x="3" y="14" width="7" height="7" rx="1.5" />
                <rect x="14" y="14" width="7" height="7" rx="1.5" />
              </svg>
              Dashboard
            </Link>
            <Link href="/" onClick={() => setOpen(false)}>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
                <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
                <polyline points="9 22 9 12 15 12 15 22" />
              </svg>
              Landing Page
            </Link>
            <Link href="/give" className={active === '/give' ? 'active' : undefined} onClick={() => setOpen(false)}>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8">
                <path d="M12 21s-7-4.6-9.3-9A5.4 5.4 0 0 1 12 6.2 5.4 5.4 0 0 1 21.3 12C19 16.4 12 21 12 21Z" />
                <path d="M7 12h3l1.2-2 1.6 4L14 12h3" />
              </svg>
              Give Zakat
            </Link>
            <Link href="/help" className={active === '/help' ? 'active' : undefined} onClick={() => setOpen(false)}>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8">
                <path d="M6 2h9l5 5v15H6z" />
                <path d="M14 2v6h6M9 13h6M9 17h6" />
              </svg>
              Request Assistance
            </Link>
            <Link href="/give#history" onClick={() => setOpen(false)}>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8">
                <path d="M4 7h13l-2.5-2.5M20 17H7l2.5 2.5" />
              </svg>
              My Transactions
            </Link>
            <Link href="/help" onClick={() => setOpen(false)}>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8">
                <path d="M3 7a2 2 0 0 1 2-2h4l2 2h8a2 2 0 0 1 2 2v9a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
              </svg>
              My Applications
            </Link>
            <Link href="/calculate" className={active === '/calculate' ? 'active' : undefined} onClick={() => setOpen(false)}>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8">
                <rect x="5" y="3" width="14" height="18" rx="2" />
                <path d="M8 7h8M8 12h.01M12 12h.01M16 12h.01M8 16h.01M12 16h.01M16 16h.01" />
              </svg>
              Calculator
            </Link>
            <button
              type="button"
              onClick={() => {
                setOpen(false)
                onOpenKnowledge?.('What is Zakat?')
              }}
            >
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8">
                <path d="M4 5a2 2 0 0 1 2-2h13v16H6a2 2 0 0 0-2 2z" />
                <path d="M4 19a2 2 0 0 1 2-2h13" />
              </svg>
              Learn About Zakat
            </button>
            <Link href="/help" onClick={() => setOpen(false)}>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8">
                <path d="M21 12a8 8 0 0 1-8 8H4l2-3a8 8 0 1 1 15-5Z" />
                <path d="M8.5 11h.01M12 11h.01M15.5 11h.01" />
              </svg>
              Ask a Question
            </Link>
          </>
        ) : (
          <>
            <Link href="/account" className={active === '/account' ? 'active' : undefined} onClick={() => setOpen(false)}>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9">
                <rect x="3" y="3" width="7" height="7" rx="1.5" />
                <rect x="14" y="3" width="7" height="7" rx="1.5" />
                <rect x="3" y="14" width="7" height="7" rx="1.5" />
                <rect x="14" y="14" width="7" height="7" rx="1.5" />
              </svg>
              Dashboard
            </Link>
            <Link href="/" onClick={() => setOpen(false)}>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
                <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
                <polyline points="9 22 9 12 15 12 15 22" />
              </svg>
              Landing Page
            </Link>
            <Link href="/admin/review" className={active === '/admin/review' ? 'active' : undefined} onClick={() => setOpen(false)}>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8">
                <path d="M9 5H7a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V7a2 2 0 0 0-2-2h-2" />
                <rect x="9" y="3" width="6" height="4" rx="2" />
                <path d="m9 14 2 2 4-4" />
              </svg>
              Review Cases
            </Link>
            <Link href="/admin/collections" className={active === '/admin/collections' ? 'active' : undefined} onClick={() => setOpen(false)}>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8">
                <path d="M19 7V4a1 1 0 0 0-1-1H5a2 2 0 0 0 0 4h15a1 1 0 0 1 1 1v4h-3a2 2 0 0 0 0 4h3a1 1 0 0 0 1-1v-2a1 1 0 0 0-1-1" />
                <path d="M3 5v14a2 2 0 0 0 2 2h15a1 1 0 0 0 1-1v-4" />
              </svg>
              Collections
            </Link>
            <Link href="/admin/mahallus" className={active === '/admin/mahallus' ? 'active' : undefined} onClick={() => setOpen(false)}>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8">
                <rect x="4" y="2" width="16" height="20" rx="2" />
                <path d="M9 22v-4h6v4M8 6h.01M16 6h.01M8 10h.01M16 10h.01M8 14h.01M16 14h.01" />
              </svg>
              Mahallus
            </Link>
            <Link href="/give" className={active === '/give' ? 'active' : undefined} onClick={() => setOpen(false)}>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8">
                <path d="M12 21s-7-4.6-9.3-9A5.4 5.4 0 0 1 12 6.2 5.4 5.4 0 0 1 21.3 12C19 16.4 12 21 12 21Z" />
                <path d="M7 12h3l1.2-2 1.6 4L14 12h3" />
              </svg>
              Give Zakat
            </Link>
            <Link href="/calculate" className={active === '/calculate' ? 'active' : undefined} onClick={() => setOpen(false)}>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8">
                <rect x="5" y="3" width="14" height="18" rx="2" />
                <path d="M8 7h8M8 12h.01M12 12h.01M16 12h.01M8 16h.01M12 16h.01M16 16h.01" />
              </svg>
              Calculator
            </Link>
          </>
        )}
      </nav>

      <div className="reference-nav-label">Account</div>
      <nav className="reference-nav" aria-label="Account">
        <Link href="/account" className={active === '/account' ? 'active' : undefined} onClick={() => setOpen(false)}>
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8">
            <circle cx="12" cy="8" r="4" />
            <path d="M4 21c1.5-4 5-5.5 8-5.5s6.5 1.5 8 5.5" />
          </svg>
          My Profile
        </Link>
        <Link href="/account" onClick={() => setOpen(false)}>
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8">
            <circle cx="12" cy="12" r="3" />
            <path d="M19 12a7 7 0 0 0-.1-1.2l2-1.6-2-3.4-2.4 1a7 7 0 0 0-2-1.2L14 3h-4l-.5 2.6a7 7 0 0 0-2 1.2l-2.4-1-2 3.4 2 1.6A7 7 0 0 0 5 12c0 .4 0 .8.1 1.2l-2 1.6 2 3.4 2.4-1a7 7 0 0 0 2 1.2L10 21h4l.5-2.6a7 7 0 0 0 2-1.2l2.4 1 2-3.4-2-1.6c.07-.4.1-.8.1-1.2Z" />
          </svg>
          Settings
        </Link>
        <Link href="/help" onClick={() => setOpen(false)}>
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8">
            <circle cx="12" cy="12" r="9" />
            <path d="M9.5 9.3A2.6 2.6 0 1 1 12 12v1.5M12 17h.01" />
          </svg>
          Help
        </Link>
        <button
          type="button"
          onClick={() => {
            setOpen(false)
            onSignOut()
          }}
        >
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8">
            <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4M16 17l5-5-5-5M21 12H9" />
          </svg>
          Logout
        </button>
      </nav>

      <div className="reference-side-card">
        <svg className="book" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7">
          <path d="M4 5a2 2 0 0 1 2-2h13v16H6a2 2 0 0 0-2 2z" />
          <path d="M4 19a2 2 0 0 1 2-2h13" />
        </svg>
        <h3>Zakat Calculator</h3>
        <p>
          Easily calculate
          <br />
          your Zakat amount
        </p>
        <Link className="btn-calc" href="/calculate" onClick={() => setOpen(false)}>
          <VxRollText text="Calculate Now" /> <span style={{ marginLeft: '4px' }}>→</span>
        </Link>
      </div>
    </aside>
  )
}

const SEARCH_LINKS = [
  { path: '/dashboard', label: 'Dashboard', desc: 'Summary & activity' },
  { path: '/give', label: 'Give Zakat', desc: 'Find eligible households' },
  { path: '/calculate', label: 'Calculator', desc: 'Estimate Nisab & Zakat due' },
  { path: '/help', label: 'Request Assistance', desc: 'Submit or view eligibility' },
  { path: '/account', label: 'My Profile', desc: 'Account details & settings' },
]

export function DashboardTopbar({
  profile,
  onSignOut,
  onOpenKnowledge,
}: {
  profile: Profile
  onSignOut: () => void
  onOpenKnowledge?: (topic?: string) => void
}) {
  const [query, setQuery] = useState('')
  const [notificationsOpen, setNotificationsOpen] = useState(false)
  const [profileOpen, setProfileOpen] = useState(false)
  const searchInput = useRef<HTMLInputElement>(null)

  const name = profile.name || profile.email.split('@')[0]
  const roleLabel =
    profile.role === 'SUPER_ADMIN'
      ? 'Super Admin'
      : profile.role === 'MAHALL_ADMIN'
      ? 'Mahallu Admin'
      : 'Member'
  const subText = `${roleLabel} • ${profile.mahallName ?? 'Kannur Mahallu'}`

  const match = query.trim().toLowerCase()
  const matches = match
    ? SEARCH_LINKS.filter(
        (item) => item.label.toLowerCase().includes(match) || item.desc.toLowerCase().includes(match)
      )
    : []

  useEffect(() => {
    const shortcut = (event: KeyboardEvent) => {
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === 'k') {
        event.preventDefault()
        searchInput.current?.focus()
      }
    }
    window.addEventListener('keydown', shortcut)
    return () => window.removeEventListener('keydown', shortcut)
  }, [])

  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (matches[0]) {
      navigate(matches[0].path)
      setQuery('')
    }
  }

  return (
    <div className="reference-topbar">
      <form className="reference-search" role="search" onSubmit={submit}>
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <circle cx="11" cy="11" r="7" />
          <path d="M20 20l-3.5-3.5" />
        </svg>
        <input
          ref={searchInput}
          type="search"
          placeholder="Search anything in Amanah..."
          aria-label="Search anything in Amanah"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Escape') setQuery('')
          }}
        />
        <span className="kbd">Ctrl K</span>

        {match && (
          <div className="search-results-flyout">
            {matches.length ? (
              matches.map((item) => (
                <Link
                  key={item.path}
                  href={item.path}
                  onClick={() => setQuery('')}
                >
                  <span>
                    <strong>{item.label}</strong>
                    <small style={{ display: 'block', color: 'var(--muted)', fontSize: '12px' }}>
                      {item.desc}
                    </small>
                  </span>
                  <span style={{ fontSize: '13px', color: 'var(--green)' }}>Jump →</span>
                </Link>
              ))
            ) : (
              <p className="search-empty">No results found for &ldquo;{query}&rdquo;</p>
            )}
          </div>
        )}
      </form>

      <div className="reference-top-right">
        <button
          type="button"
          className="bell"
          aria-label="Notifications"
          onClick={() => {
            setNotificationsOpen(!notificationsOpen)
            setProfileOpen(false)
          }}
        >
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9">
            <path d="M18 8a6 6 0 1 0-12 0c0 7-3 7-3 9h18c0-2-3-2-3-9M10.3 21a2 2 0 0 0 3.4 0" />
          </svg>
          <i />
        </button>

        {notificationsOpen && (
          <div className="notifications-flyout">
            <h4>Notifications</h4>
            <div className="notification-item">
              <strong>Zakat distribution update</strong>
              <span>Kannur Mahallu confirmed your community record.</span>
            </div>
            <div className="notification-item">
              <strong>Hawl verification reminder</strong>
              <span>Review your annual Nisab threshold before upcoming distribution.</span>
            </div>
          </div>
        )}

        <button
          type="button"
          className="profile"
          onClick={() => {
            setProfileOpen(!profileOpen)
            setNotificationsOpen(false)
          }}
        >
          <div className="avatar" aria-hidden="true">
            <svg viewBox="0 0 44 44">
              <rect width="44" height="44" fill="#EADCC6" />
              <ellipse cx="22" cy="17" rx="9" ry="10" fill="#8D5A3B" />
              <path d="M13 15c0-6 4-10 9-10s9 4 9 10l-2 1c-1-3-3-5-7-5s-6 2-7 5z" fill="#fff" />
              <path d="M10 44c1-8 6-12 12-12s11 4 12 12z" fill="#1E3A2A" />
              <circle cx="18.5" cy="17" r="1.1" fill="#1A1A1A" />
              <circle cx="25.5" cy="17" r="1.1" fill="#1A1A1A" />
              <path d="M18 26c1.2 2.5 6.8 2.5 8 0-1 3.5-2 5-4 5s-3-1.5-4-5z" fill="#5C3A26" />
            </svg>
          </div>
          <div className="profile-text">
            <strong>{name}</strong>
            <span>{subText}</span>
          </div>
          <svg className="chev" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M6 9l6 6 6-6" />
          </svg>
        </button>

        {profileOpen && (
          <div className="profile-menu-flyout">
            <Link href="/account" onClick={() => setProfileOpen(false)}>
              My Profile
            </Link>
            <Link href="/calculate" onClick={() => setProfileOpen(false)}>
              Calculator
            </Link>
            <button
              type="button"
              onClick={() => {
                setProfileOpen(false)
                onOpenKnowledge?.('What is Zakat?')
              }}
            >
              Learn About Zakat
            </button>
            <button
              type="button"
              onClick={() => {
                setProfileOpen(false)
                onSignOut()
              }}
              style={{ color: '#C53030' }}
            >
              Sign out
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
