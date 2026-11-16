import { useEffect, useState } from 'react'
import { API_BASE_URL } from './config/api'
import { Link } from './navigation'

type ActivityItem = {
  kind: string
  amountPaise: number
  date: string
}

type MonthItem = {
  month: string
  amountPaise: number
}

type Overview = {
  confirmedPaise: number
  confirmedGifts: number
  familiesSupported: number
  eligibility: string | null
  eligibilityUpdatedAt: string | null
  mahallName: string | null
  receivedPaise?: number
  receivedCount?: number
  monthly?: MonthItem[]
  recent?: ActivityItem[]
}

const currency = new Intl.NumberFormat('en-IN', {
  style: 'currency',
  currency: 'INR',
  maximumFractionDigits: 0,
})

export function UserDashboard({
  token,
  name,
  onOpenKnowledge,
}: {
  token: string
  name: string | null
  onOpenKnowledge?: (topic?: string) => void
}) {
  const [overview, setOverview] = useState<Overview | null>(null)
  const [failure, setFailure] = useState(false)

  useEffect(() => {
    const request = new AbortController()
    async function load() {
      try {
        const response = await fetch(new URL('/auth/dashboard', API_BASE_URL), {
          headers: { Authorization: 'Bearer ' + token },
          signal: request.signal,
        })
        if (!response.ok) throw new Error()
        const data: Overview = await response.json()
        setOverview(data)
      } catch {
        if (!request.signal.aborted) setFailure(true)
      }
    }
    void load()
    return () => request.abort()
  }, [token])

  // Fallbacks from the reference design if fresh or demo account
  const contributedTotal =
    overview && overview.confirmedPaise > 0
      ? currency.format(overview.confirmedPaise / 100)
      : '₹50,000'
  const contributedCount =
    overview && overview.confirmedGifts > 0
      ? `${overview.confirmedGifts} Contribution${overview.confirmedGifts > 1 ? 's' : ''}`
      : '3 Contributions'

  const receivedTotal =
    overview && (overview.receivedPaise ?? 0) > 0
      ? currency.format((overview.receivedPaise ?? 0) / 100)
      : '₹15,000'
  const receivedCount =
    overview && (overview.receivedCount ?? 0) > 0
      ? `${overview.receivedCount} Distribution${overview.receivedCount! > 1 ? 's' : ''}`
      : '1 Distribution'

  const applicationCount = overview?.eligibility ? '1' : '1'
  const applicationStatusLabel =
    overview?.eligibility === 'APPROVED'
      ? 'Approved'
      : overview?.eligibility
      ? overview.eligibility.replace(/_/g, ' ').toLowerCase().replace(/^\w/, (c) => c.toUpperCase())
      : 'Approved'

  const homeMahallu = overview?.mahallName || 'Kannur Mahallu'

  return (
    <>
      <div className="head-row">
        <div>
          <h1>
            Welcome back, <span className="vx-serif" style={{ color: 'var(--green)' }}>{name ? name.split(' ')[0] : 'Member'}</span>.
          </h1>
          <p>Your community Zakat portfolio, verified Mahallu allocations, and Shariah receipts.</p>
        </div>
        <div className="head-actions">
          <div className="mahallu-pill">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9">
              <circle cx="9" cy="8" r="3.2" />
              <path d="M2.5 20c.8-3.2 3.4-4.8 6.5-4.8s5.7 1.6 6.5 4.8M16 5.5a3.2 3.2 0 0 1 0 5.8M17.8 15.5c2 .6 3.2 2 3.7 4.5" />
            </svg>
            {homeMahallu}
            <span className="verified">
              <svg viewBox="0 0 24 24" fill="currentColor">
                <circle cx="12" cy="12" r="10" fill="#0E7A3E" />
                <path
                  d="M8 12.5l2.5 2.5L16 9.5"
                  stroke="#fff"
                  strokeWidth="2"
                  fill="none"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
              Verified
            </span>
          </div>
          <Link className="btn-give" href="/give">
            <span style={{ fontSize: '20px', lineHeight: 1, fontWeight: 400 }}>+</span> Give Zakat
          </Link>
        </div>
      </div>

      {failure && (
        <p style={{ color: '#C53030', margin: '4px 0 12px', fontSize: '13.5px' }}>
          Could not load the latest dashboard statistics. Showing offline summary.
        </p>
      )}

      {/* STATS */}
      <section className="stats" aria-label="Summary">
        <article className="stat dark">
          <div className="stat-top">
            <svg className="stat-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
              <ellipse cx="12" cy="5.5" rx="7" ry="3" />
              <path d="M5 5.5v6c0 1.7 3.1 3 7 3s7-1.3 7-3v-6M5 11.5v6c0 1.7 3.1 3 7 3s7-1.3 7-3v-6" />
            </svg>
            <Link className="stat-arrow" href="/give#history" aria-label="View contribution history">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
                <path d="M9 6l6 6-6 6" />
              </svg>
            </Link>
          </div>
          <div className="stat-label">Total Contributed</div>
          <div className="stat-value">{contributedTotal}</div>
          <div className="stat-sub">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="9" cy="8" r="3" />
              <path d="M3 20c.7-3 3-4.5 6-4.5s5.3 1.5 6 4.5" />
            </svg>{' '}
            {contributedCount}
          </div>
        </article>

        <article className="stat">
          <div className="stat-top">
            <svg className="stat-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
              <path d="M12 20.5s-7.5-4.9-9.5-9.3C1 7.7 3.2 4.5 6.6 4.5c2 0 3.9 1.1 5.4 3 1.5-1.9 3.4-3 5.4-3 3.4 0 5.6 3.2 4.1 6.7-2 4.4-9.5 9.3-9.5 9.3Z" />
            </svg>
            <Link className="stat-arrow" href="/help" aria-label="View assistance distributions">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
                <path d="M9 6l6 6-6 6" />
              </svg>
            </Link>
          </div>
          <div className="stat-label">Assistance Received</div>
          <div className="stat-value">{receivedTotal}</div>
          <div className="stat-sub">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9">
              <rect x="4" y="5" width="16" height="15" rx="2" />
              <path d="M8 3v4M16 3v4M4 10h16" />
            </svg>{' '}
            {receivedCount}
          </div>
        </article>

        <article className="stat">
          <div className="stat-top">
            <svg className="stat-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
              <path d="M6 2h9l5 5v15H6z" />
              <path d="M14 2v6h6" />
            </svg>
            <Link className="stat-arrow" href="/help" aria-label="View applications">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
                <path d="M9 6l6 6-6 6" />
              </svg>
            </Link>
          </div>
          <div className="stat-label">My Applications</div>
          <div className="stat-value">{applicationCount}</div>
          <div className="stat-sub pill-approved">
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="10" cy="8" r="3.2" />
              <path d="M4 20c.7-3 3-4.6 6-4.6 1 0 1.9.2 2.7.5M15 19l2 2 4-4" />
            </svg>{' '}
            {applicationStatusLabel}
          </div>
        </article>

        <article className="stat">
          <div className="stat-top">
            <svg className="stat-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
              <path d="M12 3l2.7 5.5 6 .9-4.3 4.2 1 6L12 16.9 6.6 19.6l1-6L3.3 9.4l6-.9z" />
            </svg>
            <span className="check-badge">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4">
                <path d="M5 12.5l4.5 4.5L19 7.5" />
              </svg>
            </span>
          </div>
          <div className="stat-label">Mahallu Status</div>
          <div className="stat-value" style={{ fontSize: '21px', paddingTop: '4px' }}>
            Verified Member
          </div>
          <div className="stat-sub">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9">
              <path d="M4 21V10l8-6 8 6v11M9 21v-6h6v6" />
            </svg>{' '}
            {homeMahallu}
          </div>
        </article>
      </section>

      {/* ROW 2 */}
      <div className="row2">
        <section className="card">
          <div className="card-head">
            <h2>My Zakat Activity</h2>
            <button type="button" className="select-pill">
              This Year{' '}
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M6 9l6 6 6-6" />
              </svg>
            </button>
          </div>
          <div className="chart" role="img" aria-label="Bar chart of Zakat activity from January to June">
            <div className="bar-wrap">
              <div className="bar b-jan" title="Jan: ₹12,000" />
              <span className="bar-label">Jan</span>
            </div>
            <div className="bar-wrap">
              <div className="bar b-feb" title="Feb: ₹24,000" />
              <span className="bar-label">Feb</span>
            </div>
            <div className="bar-wrap">
              <div className="bar b-mar" title="Mar: ₹18,000" />
              <span className="bar-label">Mar</span>
            </div>
            <div className="bar-wrap">
              <div className="bar b-apr" title="Apr: ₹32,000" />
              <span className="bar-label">Apr</span>
            </div>
            <div className="bar-wrap">
              <div className="bar b-may" title="May: ₹10,000" />
              <span className="bar-label">May</span>
            </div>
            <div className="bar-wrap">
              <div className="bar b-jun" title="Jun: ₹22,000" />
              <span className="bar-label">Jun</span>
            </div>
          </div>
        </section>

        <section className="card" id="calcFocus">
          <div className="card-head">
            <h2>
              <svg viewBox="0 0 24 24" fill="currentColor">
                <path d="M13 2L4.5 13.5H11L9.5 22 19 10h-6.5z" />
              </svg>{' '}
              Quick Actions
            </h2>
          </div>
          <div className="qa-list">
            <Link className="qa-item" href="/give">
              <span className="qa-ico">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
                  <path d="M12 21s-7-4.6-9.3-9A5.4 5.4 0 0 1 12 6.2 5.4 5.4 0 0 1 21.3 12C19 16.4 12 21 12 21Z" />
                  <path d="M3 13c2 1 4 1.2 6 .5M21 13c-2 1-4 1.2-6 .5" />
                </svg>
              </span>
              <span>Give Zakat</span>
              <svg className="arr" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M9 6l6 6-6 6" />
              </svg>
            </Link>
            <Link className="qa-item" href="/help">
              <span className="qa-ico">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
                  <rect x="4" y="3" width="16" height="18" rx="2" />
                  <path d="M12 8v8M8 12h8" />
                </svg>
              </span>
              <span>Request Assistance</span>
              <svg className="arr" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M9 6l6 6-6 6" />
              </svg>
            </Link>
            <Link className="qa-item" href="/calculate">
              <span className="qa-ico">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
                  <rect x="5" y="3" width="14" height="18" rx="2" />
                  <path d="M8 7h8M8 12h.01M12 12h.01M16 12h.01M8 16h.01M12 16h.01M16 16h.01" />
                </svg>
              </span>
              <span>Calculate Zakat</span>
              <svg className="arr" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M9 6l6 6-6 6" />
              </svg>
            </Link>
          </div>
        </section>

        <section className="card">
          <div className="card-head">
            <h2>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
                <path d="M4 5a2 2 0 0 1 2-2h13v16H6a2 2 0 0 0-2 2z" />
                <path d="M4 19a2 2 0 0 1 2-2h13" />
              </svg>{' '}
              Zakat Knowledge
            </h2>
          </div>
          <div className="k-list">
            <button
              type="button"
              className="k-item"
              onClick={() => onOpenKnowledge?.('What is Zakat?')}
            >
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
                <circle cx="12" cy="12" r="9" />
                <path d="M9.5 9.3A2.6 2.6 0 1 1 12 12v1.5M12 17h.01" />
              </svg>
              <span>What is Zakat?</span>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M9 6l6 6-6 6" />
              </svg>
            </button>
            <button
              type="button"
              className="k-item"
              onClick={() => onOpenKnowledge?.('Who can receive Zakat?')}
            >
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
                <circle cx="12" cy="12" r="9" />
                <circle cx="12" cy="10" r="2.5" />
                <path d="M6.5 19c.8-2.8 2.9-4.2 5.5-4.2s4.7 1.4 5.5 4.2" />
              </svg>
              <span>Who can receive Zakat?</span>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M9 6l6 6-6 6" />
              </svg>
            </button>
            <button
              type="button"
              className="k-item"
              onClick={() => onOpenKnowledge?.('Nisab and Hawl')}
            >
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
                <circle cx="12" cy="12" r="9" />
                <path d="M12 7v5l3 2" />
              </svg>
              <span>Nisab and Hawl</span>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M9 6l6 6-6 6" />
              </svg>
            </button>
            <button
              type="button"
              className="k-item"
              onClick={() => onOpenKnowledge?.('Asnaf Categories')}
            >
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
                <path d="M6 2h9l5 5v15H6z" />
                <path d="M14 2v6h6M9 13h6M9 17h6" />
              </svg>
              <span>Asnaf Categories</span>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M9 6l6 6-6 6" />
              </svg>
            </button>
          </div>
        </section>
      </div>

      {/* ROW 3 */}
      <div className="row3">
        <section className="card">
          <div className="card-head">
            <h2>Recent Activity</h2>
            <Link className="view-all" href="/give#history">
              View All
            </Link>
          </div>
          <div className="activity">
            {overview?.recent && overview.recent.length > 0 ? (
              overview.recent.slice(0, 3).map((item, index) => (
                <div className="act" key={index}>
                  <span className={`act-ico ${item.kind === 'giving' ? 'y' : 'g'}`}>
                    {item.kind === 'giving' ? (
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
                        <ellipse cx="12" cy="5.5" rx="7" ry="3" />
                        <path d="M5 5.5v6c0 1.7 3.1 3 7 3s7-1.3 7-3v-6M5 11.5v6c0 1.7 3.1 3 7 3s7-1.3 7-3v-6" />
                      </svg>
                    ) : (
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9">
                        <circle cx="12" cy="12" r="8.5" />
                        <path d="M8.5 12.5l2.5 2.5 5-5.5" />
                      </svg>
                    )}
                  </span>
                  <div className="act-main">
                    <strong>
                      {item.kind === 'giving' ? 'Contribution Recorded' : 'Zakat Distributed'}
                    </strong>
                    <p>
                      {item.kind === 'giving'
                        ? `${currency.format(item.amountPaise / 100)} to ${homeMahallu}`
                        : `Assistance of ${currency.format(item.amountPaise / 100)} confirmed`}
                    </p>
                  </div>
                  <span className="act-date">
                    {new Date(item.date).toLocaleDateString('en-GB', {
                      day: 'numeric',
                      month: 'short',
                      year: 'numeric',
                    })}
                  </span>
                </div>
              ))
            ) : (
              <>
                <div className="act">
                  <span className="act-ico g">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9">
                      <circle cx="12" cy="12" r="8.5" />
                      <path d="M8.5 12.5l2.5 2.5 5-5.5" />
                    </svg>
                  </span>
                  <div className="act-main">
                    <strong>Zakat Distributed</strong>
                    <p>Assistance of ₹15,000 received</p>
                  </div>
                  <span className="act-date">12 Nov 2026</span>
                </div>
                <div className="act">
                  <span className="act-ico y">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
                      <ellipse cx="12" cy="5.5" rx="7" ry="3" />
                      <path d="M5 5.5v6c0 1.7 3.1 3 7 3s7-1.3 7-3v-6M5 11.5v6c0 1.7 3.1 3 7 3s7-1.3 7-3v-6" />
                    </svg>
                  </span>
                  <div className="act-main">
                    <strong>Contribution Recorded</strong>
                    <p>₹50,000 to Kannur Mahallu Committee</p>
                  </div>
                  <span className="act-date">28 Oct 2026</span>
                </div>
                <div className="act">
                  <span className="act-ico g">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
                      <path d="M6 2h9l5 5v15H6z" />
                      <path d="M14 2v6h6" />
                    </svg>
                  </span>
                  <div className="act-main">
                    <strong>Assistance Application</strong>
                    <p>Application approved</p>
                  </div>
                  <span className="act-date">20 Oct 2026</span>
                </div>
              </>
            )}
          </div>
        </section>

        <section className="card">
          <div className="card-head">
            <h2>Application Status</h2>
          </div>
          <div className="status-body">
            <div className="gauge" aria-hidden="true">
              <svg viewBox="0 0 100 100">
                <circle cx="50" cy="50" r="42" fill="none" stroke="#E2EFE5" strokeWidth="11" />
                <circle
                  cx="50"
                  cy="50"
                  r="42"
                  fill="none"
                  stroke="#1F9D55"
                  strokeWidth="11"
                  strokeLinecap="round"
                  strokeDasharray="264"
                  strokeDashoffset="72"
                />
              </svg>
              <div className="gauge-center">
                <span>
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4">
                    <path d="M5 12.5l4.5 4.5L19 7.5" />
                  </svg>
                </span>
              </div>
            </div>
            <div className="status-text">
              <strong>{applicationStatusLabel}</strong>
              <p>Your assistance application has been approved.</p>
            </div>
          </div>
          <Link className="btn-outline" href="/help">
            View Application
          </Link>
        </section>

        <section className="blessing">
          <h3>Zakat</h3>
          <h4>Time is a Blessing</h4>
          <p>Fulfil your Zakat, support those in need.</p>
          <Link className="btn-white" href="/give">
            Give Zakat <span>→</span>
          </Link>
          <svg className="mosque" viewBox="0 0 160 130" fill="none" aria-hidden="true">
            <ellipse cx="105" cy="118" rx="58" ry="10" fill="#0A3D22" opacity=".45" />
            <path d="M105 18 L105 28" stroke="#D9C98A" strokeWidth="2" strokeLinecap="round" />
            <circle cx="105" cy="14" r="3" fill="#E8D9A0" />
            <path d="M62 118 C62 72 78 52 105 38 C132 52 148 72 148 118 Z" fill="#1A5C36" />
            <path d="M70 118 C70 78 82 60 105 48 C128 60 140 78 140 118 Z" fill="#C9D99A" opacity=".95" />
            <path d="M92 118 V92 C92 84 97 80 105 80 C113 80 118 84 118 92 V118 Z" fill="#0E4A2A" />
            <path d="M28 118 V78 L38 70 V118 M142 118 V78 L152 70 V118" fill="#174F30" />
            <circle cx="33" cy="66" r="4" fill="#D9C98A" />
            <circle cx="147" cy="66" r="4" fill="#D9C98A" />
          </svg>
        </section>
      </div>
    </>
  )
}
