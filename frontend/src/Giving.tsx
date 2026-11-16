import { useEffect, useState, type FormEvent } from 'react'
import { API_BASE_URL } from './config/api'
import { MapPin, HeartHandshake } from 'lucide-react'
import { razorpayCheckout } from './razorpay'

type Recipient = {
  id: string
  locality: string
  priority: string
  noReceipts: boolean
  incomeBand: string
  demo: boolean
  onlineGiving: boolean
}

type Payment = {
  id: string
  amountPaise: number
  receivedPaise: number
  status: string
}

const paymentStatus: Record<string, string> = {
  PENDING: 'Awaiting payment',
  CAPTURED: 'Payment captured · transfer pending',
  TRANSFERRED: 'Transferred to household',
  TRANSFER_FAILED: 'Transfer failed · contact Amanah',
  PARTIALLY_REVERSED: 'Partially reversed',
  REVERSED: 'Reversed',
}

type Handover = {
  id: string
  amountPaise: number
  createdAt: string
  confirmedAt: string | null
  incoming: boolean
}

const currency = new Intl.NumberFormat('en-IN', {
  style: 'currency',
  currency: 'INR',
  maximumFractionDigits: 0,
})

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

const POPULAR_AREAS = ['All Areas', 'Kannur', 'Kozhikode', 'Malappuram', 'Wayanad']

export function Giving({ token }: { token: string | null }) {
  const [recipients, setRecipients] = useState<Recipient[] | null>(null)
  const [handovers, setHandovers] = useState<Handover[] | null>(null)
  const [payments, setPayments] = useState<Payment[]>([])
  const [selected, setSelected] = useState('')
  const [online, setOnline] = useState(false)
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')
  const [message, setMessage] = useState('')
  const [revision, setRevision] = useState(0)
  const [filter, setFilter] = useState({ area: '' })
  const [searching, setSearching] = useState(true)
  const [searchError, setSearchError] = useState('')

  useEffect(() => {
    if (!token) return
    const controller = new AbortController()
    async function discover() {
      try {
        const url = new URL('/auth/discovery', API_BASE_URL)
        if (filter.area) url.searchParams.set('area', filter.area)
        const response = await fetch(url, { signal: controller.signal, headers: { Authorization: 'Bearer ' + token } })
        const results = await response.json()
        if (!response.ok) throw new Error(results.message || 'Could not load eligible households')
        setRecipients(results)
      } catch (failure) {
        if (!controller.signal.aborted) setSearchError(failure instanceof Error ? failure.message : 'Could not load eligible households')
      } finally {
        if (!controller.signal.aborted) setSearching(false)
      }
    }
    void discover()
    return () => controller.abort()
  }, [token, filter, revision])

  useEffect(() => {
    if (!token) return
    const controller = new AbortController()
    async function history() {
      try {
        const response = await fetch(new URL('/auth/handovers', API_BASE_URL), {
          signal: controller.signal, headers: { Authorization: 'Bearer ' + token },
        })
        if (!response.ok) throw new Error('Could not load your handovers')
        setHandovers(await response.json())
      } catch {
        if (!controller.signal.aborted) setError('Could not load your handovers')
      }
    }
    async function paymentHistory() {
      try {
        const response = await fetch(new URL('/auth/route-payments', API_BASE_URL), {
          signal: controller.signal, headers: { Authorization: 'Bearer ' + token },
        })
        if (response.ok) setPayments(await response.json())
      } catch {
        // Direct and offline history can load independently during deployment or an outage.
      }
    }
    void history()
    void paymentHistory()
    return () => controller.abort()
  }, [token, revision])

  function search(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setSearching(true)
    setSearchError('')
    setSelected('')
    setFilter({ area: String(new FormData(event.currentTarget).get('area')).trim() })
  }

  function selectArea(area: string) {
    setSearching(true)
    setSearchError('')
    setSelected('')
    setFilter({ area: area === 'All Areas' ? '' : area })
  }

  async function update(path: string, body?: object) {
    if (!token) return
    setBusy(true)
    setError('')
    setMessage('')
    try {
      const response = await fetch(new URL(path, API_BASE_URL), {
        method: 'POST', headers: { Authorization: 'Bearer ' + token, 'Content-Type': 'application/json' },
        body: body ? JSON.stringify(body) : undefined,
      })
      const result = await response.json()
      if (!response.ok) throw new Error(result.message)
      setMessage(body ? 'Handover recorded. Awaiting recipient confirmation.' : 'Receipt confirmed.')
      setSelected('')
      setRevision((previous) => previous + 1)
    } catch (failure) {
      setError(failure instanceof Error ? failure.message : 'Could not save the handover')
    } finally {
      setBusy(false)
    }
  }

  async function checkPayment(id: string, details: object = {}) {
    setBusy(true)
    setError('')
    setMessage('')
    try {
      const response = await fetch(new URL('/auth/route-payments/' + encodeURIComponent(id) + '/check', API_BASE_URL), {
        method: 'POST', headers: { Authorization: 'Bearer ' + token, 'Content-Type': 'application/json' },
        body: JSON.stringify(details),
      })
      const result = await response.json()
      if (!response.ok) throw new Error(result.message || 'Payment status check failed')
      setMessage('Payment status updated to: ' + (paymentStatus[result.status] ?? result.status))
      setRevision((previous) => previous + 1)
    } catch (failure) {
      setError(failure instanceof Error ? failure.message : 'Could not refresh payment status')
    } finally {
      setBusy(false)
    }
  }

  async function pay(caseId: string, amountPaise: number) {
    if (!token) return
    setBusy(true)
    setError('')
    setMessage('')
    try {
      const Checkout = await razorpayCheckout()
      const response = await fetch(new URL('/auth/route-payments', API_BASE_URL), {
        method: 'POST', headers: { Authorization: 'Bearer ' + token, 'Content-Type': 'application/json' },
        body: JSON.stringify({ caseId, amountPaise }),
      })
      const order = await response.json()
      if (!response.ok) throw new Error(order.message || 'Could not start checkout')
      new Checkout({
        key: order.key, order_id: order.orderId, amount: order.amountPaise, currency: 'INR',
        name: 'Amanah', description: 'Zakat for a verified household',
        handler: (result) => void checkPayment(order.id, { paymentId: result.razorpay_payment_id, signature: result.razorpay_signature }),
        modal: { ondismiss: () => {
          setBusy(false)
          setRevision((previous) => previous + 1)
        } },
      }).open()
    } catch (failure) {
      setError(failure instanceof Error ? failure.message : 'Could not start checkout')
      setBusy(false)
    }
  }

  return (
    <section className="panel" style={{ borderRadius: '24px', padding: '32px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '16px', marginBottom: '24px' }}>
        <div>
          <span className="status-beacon" style={{ marginBottom: '8px' }}>
            <span className="status-beacon-dot"><span className="status-beacon-ping" /></span>
            Direct Shariah Allocation
          </span>
          <h2 style={{ fontSize: '32px', margin: '4px 0 8px', letterSpacing: '-0.02em', fontWeight: 650 }}>
            Find <span className="vx-serif" style={{ color: 'var(--green)' }}>verified households</span>.
          </h2>
          <p style={{ color: 'var(--muted)', fontSize: '15px', maxWidth: '640px', margin: 0 }}>
            Browse anonymous household profiles rigorously audited by local Mahallu committees and verified for Zakat eligibility under Shariah criteria.
          </p>
        </div>
      </div>

      {/* Filter Area Chips */}
      <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', marginBottom: '20px' }}>
        {POPULAR_AREAS.map((area) => {
          const isSelected = (area === 'All Areas' && !filter.area) || filter.area.toLowerCase() === area.toLowerCase()
          return (
            <button
              key={area}
              type="button"
              onClick={() => selectArea(area)}
              style={{
                padding: '7px 16px',
                borderRadius: '9999px',
                fontSize: '13px',
                fontWeight: 600,
                border: isSelected ? '1px solid var(--green)' : '1px solid var(--line)',
                background: isSelected ? 'var(--green)' : 'var(--panel)',
                color: isSelected ? '#ffffff' : 'var(--ink)',
                cursor: 'pointer',
                transition: 'all 0.2s ease',
              }}
            >
              {area}
            </button>
          )
        })}
      </div>

      <form className="giving-search" onSubmit={search} style={{ marginBottom: '28px' }}>
        <div style={{ position: 'relative', flex: 1 }}>
          <label htmlFor="area-search" style={{ position: 'absolute', opacity: 0, pointerEvents: 'none' }}>Locality or PIN code</label>
          <input
            id="area-search"
            name="area"
            defaultValue={filter.area}
            minLength={2}
            maxLength={120}
            placeholder="Search locality or 6-digit PIN code…"
            style={{
              width: '100%',
              padding: '12px 18px',
              borderRadius: '9999px',
              border: '1px solid var(--line)',
              fontSize: '14px',
              outline: 'none',
              background: 'var(--panel-soft)',
            }}
          />
        </div>
        <button
          disabled={searching}
          style={{
            padding: '12px 24px',
            borderRadius: '9999px',
            background: 'var(--green)',
            color: '#fff',
            fontWeight: 600,
            border: 'none',
            cursor: 'pointer',
            boxShadow: '0 4px 14px rgba(14, 92, 72, 0.25)',
          }}
        >
          <VxRollText text={searching ? 'Searching…' : 'Filter Profiles'} />
        </button>
      </form>

      {error && <p role="alert" style={{ color: '#c53030', background: '#fff5f5', padding: '12px 16px', borderRadius: '12px', fontSize: '14px' }}>{error}</p>}
      {message && <p role="status" style={{ color: 'var(--green)', background: 'var(--light)', padding: '12px 16px', borderRadius: '12px', fontSize: '14px' }}>{message}</p>}
      {searchError && <p role="alert" style={{ color: '#c53030', background: '#fff5f5', padding: '12px 16px', borderRadius: '12px', fontSize: '14px' }}>{searchError}</p>}
      {searching && <p role="status" style={{ color: 'var(--muted)', fontSize: '14px' }}>Loading verified households…</p>}

      {!searching && !searchError && recipients?.length === 0 && (
        <div style={{ textAlign: 'center', padding: '48px 24px', background: 'var(--panel-soft)', borderRadius: '20px', border: '1px dashed var(--line)' }}>
          <HeartHandshake size={36} color="var(--muted)" style={{ margin: '0 auto 12px' }} />
          <h3 style={{ fontSize: '18px', margin: '0 0 6px', fontWeight: 600 }}>No unmet need found in this area</h3>
          <p style={{ color: 'var(--muted)', fontSize: '14px', maxWidth: '420px', margin: '0 auto 16px' }}>
            All verified households in this locality currently have their monthly essential requirements met.
          </p>
          <button
            type="button"
            onClick={() => selectArea('All Areas')}
            style={{ padding: '8px 18px', borderRadius: '9999px', background: 'var(--green)', color: '#fff', border: 'none', cursor: 'pointer', fontSize: '13px', fontWeight: 600 }}
          >
            <VxRollText text="View All Areas" />
          </button>
        </div>
      )}

      {/* Bento Household Cards */}
      <div className="giving-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '20px' }}>
        {!searching && !searchError && recipients?.map((recipient) => (
          <article
            className="review-card giving-household"
            key={recipient.id}
            style={{
              padding: '24px',
              borderRadius: '20px',
              background: 'var(--panel)',
              border: '1px solid var(--line)',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between',
            }}
          >
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
                <span className="status-beacon">
                  <span className="status-beacon-dot"><span className="status-beacon-ping" /></span>
                  {recipient.demo ? 'Demo Household' : 'Verified Eligible'}
                </span>
                <span className="mono-num" style={{ fontSize: '11.5px', color: 'var(--muted)', letterSpacing: '0.05em' }}>
                  ID #{recipient.id.slice(-6).toUpperCase()}
                </span>
              </div>

              <h3 style={{ fontSize: '20px', margin: '0 0 12px', display: 'flex', alignItems: 'center', gap: '8px', fontWeight: 650 }}>
                <MapPin size={18} color="var(--green)" /> {recipient.locality}
              </h3>

              <div style={{ background: 'var(--panel-soft)', padding: '14px 16px', borderRadius: '14px', marginBottom: '16px', border: '1px solid var(--line)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px', fontSize: '13px' }}>
                  <span style={{ color: 'var(--muted)' }}>Income Band</span>
                  <span className="mono-num" style={{ fontWeight: 600 }}>{recipient.incomeBand}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px' }}>
                  <span style={{ color: 'var(--muted)' }}>Priority Need</span>
                  <span style={{ fontWeight: 600, color: recipient.priority.includes('URGENT') || recipient.priority.includes('HIGH') ? '#c53030' : 'var(--green)' }}>
                    {recipient.priority}
                  </span>
                </div>
              </div>

              {recipient.noReceipts && (
                <p style={{ fontSize: '12px', color: '#b7791f', background: '#fffaf0', padding: '6px 12px', borderRadius: '8px', margin: '0 0 16px' }}>
                  No confirmed Zakat received this cycle.
                </p>
              )}
            </div>

            <div>
              {recipient.demo ? (
                <p style={{ fontSize: '13px', color: 'var(--muted)', margin: 0 }}>Example preview only.</p>
              ) : token ? (
                <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
                  {recipient.onlineGiving && (
                    <button
                      type="button"
                      disabled={busy}
                      onClick={() => { setSelected(recipient.id); setOnline(true) }}
                      style={{
                        flex: 1,
                        padding: '10px 16px',
                        borderRadius: '9999px',
                        background: 'var(--green)',
                        color: '#fff',
                        fontWeight: 600,
                        fontSize: '13px',
                        border: 'none',
                        cursor: 'pointer',
                        boxShadow: '0 4px 12px rgba(14, 92, 72, 0.2)',
                      }}
                    >
                      <VxRollText text="Give Online" />
                    </button>
                  )}
                  <button
                    type="button"
                    disabled={busy}
                    onClick={() => { setSelected(recipient.id); setOnline(false) }}
                    style={{
                      flex: recipient.onlineGiving ? undefined : 1,
                      padding: '10px 16px',
                      borderRadius: '9999px',
                      background: 'transparent',
                      color: 'var(--green)',
                      border: '1px solid var(--green)',
                      fontWeight: 600,
                      fontSize: '13px',
                      cursor: 'pointer',
                    }}
                  >
                    <VxRollText text="Direct Handover" />
                  </button>
                </div>
              ) : (
                <a
                  href="/login"
                  style={{
                    display: 'block',
                    textAlign: 'center',
                    padding: '10px 16px',
                    borderRadius: '9999px',
                    background: 'var(--green)',
                    color: '#fff',
                    textDecoration: 'none',
                    fontWeight: 600,
                    fontSize: '13px',
                  }}
                >
                  <VxRollText text="Sign in to Give" />
                </a>
              )}

              {selected === recipient.id && (
                <form
                  onSubmit={(event) => {
                    event.preventDefault()
                    const amount = Number(new FormData(event.currentTarget).get('amount'))
                    const amountPaise = Math.round(amount * 100)
                    if (online) void pay(recipient.id, amountPaise)
                    else void update('/auth/handovers', { caseId: recipient.id, amountPaise })
                  }}
                  style={{ marginTop: '16px', padding: '16px', background: 'var(--panel-soft)', borderRadius: '16px', border: '1px solid var(--line)' }}
                >
                  <p style={{ fontSize: '13px', margin: '0 0 10px', color: 'var(--muted)' }}>
                    {online ? 'Instant transfer via Razorpay Checkout.' : 'Record amount for Shariah receipt verification.'}
                  </p>
                  <div style={{ display: 'flex', gap: '8px', marginBottom: '10px' }}>
                    <label htmlFor={`amount-${recipient.id}`} style={{ position: 'absolute', opacity: 0, pointerEvents: 'none' }}>Amount (₹)</label>
                    <input
                      id={`amount-${recipient.id}`}
                      name="amount"
                      type="number"
                      placeholder="Amount in ₹"
                      min={online ? '1' : '.01'}
                      max="21474836.47"
                      step=".01"
                      required
                      style={{
                        flex: 1,
                        padding: '8px 12px',
                        borderRadius: '8px',
                        border: '1px solid var(--line)',
                        fontSize: '14px',
                      }}
                    />
                    <button
                      disabled={busy}
                      style={{
                        padding: '8px 16px',
                        borderRadius: '9999px',
                        background: 'var(--green)',
                        color: '#fff',
                        border: 'none',
                        fontWeight: 600,
                        fontSize: '13px',
                        cursor: 'pointer',
                      }}
                    >
                      <VxRollText text={online ? 'Pay' : 'Confirm'} />
                    </button>
                  </div>
                </form>
              )}
            </div>
          </article>
        ))}
      </div>

      {payments.length > 0 && (
        <section style={{ marginTop: '40px' }}>
          <h3 style={{ fontSize: '20px', margin: '0 0 16px', fontWeight: 650 }}>Online Transfer History</h3>
          <ul className="ledger-list" style={{ listStyle: 'none', padding: 0, margin: 0, display: 'grid', gap: '12px' }}>
            {payments.map((payment) => (
              <li
                key={payment.id}
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  padding: '16px 20px',
                  borderRadius: '16px',
                  background: 'var(--panel)',
                  border: '1px solid var(--line)',
                }}
              >
                <div>
                  <strong className="mono-num" style={{ fontSize: '16px', color: 'var(--ink)' }}>
                    {currency.format(payment.amountPaise / 100)}
                  </strong>
                  <div style={{ fontSize: '13px', color: 'var(--muted)', marginTop: '4px' }}>
                    {paymentStatus[payment.status] ?? payment.status}
                  </div>
                </div>
                {payment.status !== 'REVERSED' && (
                  <button
                    type="button"
                    disabled={busy}
                    onClick={() => void checkPayment(payment.id)}
                    style={{
                      padding: '7px 14px',
                      borderRadius: '9999px',
                      border: '1px solid var(--line)',
                      background: 'transparent',
                      fontSize: '12.5px',
                      fontWeight: 600,
                      cursor: 'pointer',
                    }}
                  >
                    <VxRollText text="Check Status" />
                  </button>
                )}
              </li>
            ))}
          </ul>
        </section>
      )}

      {token && (
        <section style={{ marginTop: '40px' }}>
          <h3 style={{ fontSize: '20px', margin: '0 0 16px', fontWeight: 650 }}>Direct Handover Records</h3>
          {handovers?.length === 0 && (
            <p style={{ color: 'var(--muted)', fontSize: '14px' }}>No direct handovers recorded yet.</p>
          )}
          <div style={{ display: 'grid', gap: '12px' }}>
            {handovers?.map((item) => (
              <article
                className="review-card"
                key={item.id}
                style={{
                  padding: '16px 20px',
                  borderRadius: '16px',
                  background: 'var(--panel)',
                  border: '1px solid var(--line)',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                }}
              >
                <div>
                  <h4 className="mono-num" style={{ fontSize: '18px', margin: '0 0 4px', fontWeight: 650 }}>
                    {currency.format(item.amountPaise / 100)}
                  </h4>
                  <p style={{ margin: 0, fontSize: '13px', color: 'var(--muted)' }}>
                    {item.incoming ? 'Incoming' : 'Outgoing'} · {item.confirmedAt ? 'Verified by Recipient' : 'Awaiting confirmation'}
                  </p>
                </div>
                {item.incoming && !item.confirmedAt && (
                  <button
                    disabled={busy}
                    onClick={() => void update('/auth/handovers/' + item.id + '/confirm')}
                    style={{
                      padding: '8px 16px',
                      borderRadius: '9999px',
                      background: 'var(--green)',
                      color: '#fff',
                      border: 'none',
                      fontWeight: 600,
                      fontSize: '13px',
                      cursor: 'pointer',
                    }}
                  >
                    <VxRollText text="Confirm Receipt" />
                  </button>
                )}
              </article>
            ))}
          </div>
        </section>
      )}
    </section>
  )
}
