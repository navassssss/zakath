import { useEffect, useState, type FormEvent } from 'react'
import { API_BASE_URL } from './config/api'
import { MapPin, ShieldCheck } from 'lucide-react'

type Recipient = { id: string; locality: string; priority: string; noReceipts: boolean; incomeBand: string; demo: boolean }
type Handover = { id: string; amountPaise: number; createdAt: string; confirmedAt: string | null; incoming: boolean }
const currency = new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR' })

export function Giving({ token }: { token: string | null }) {
  const [recipients, setRecipients] = useState<Recipient[] | null>(null)
  const [handovers, setHandovers] = useState<Handover[] | null>(null)
  const [selected, setSelected] = useState('')
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
    void history()
    return () => controller.abort()
  }, [token, revision])

  function search(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setSearching(true)
    setSearchError('')
    setSelected('')
    setFilter({ area: String(new FormData(event.currentTarget).get('area')).trim() })
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

  return (
    <section className="panel">
      <h2>Find eligible households</h2>
      <p>Browse anonymous profiles verified by a Mahallu or Super Admin.</p>
      <form className="giving-search" onSubmit={search}>
        <label>Locality or PIN code<input name="area" minLength={2} maxLength={120} placeholder="All areas" /></label>
        <button disabled={searching}>Search</button>
      </form>
      {error && <p role="alert">{error}</p>}
      {message && <p role="status">{message}</p>}
      {searchError && <p role="alert">{searchError}</p>}
      {searching && <p role="status">Loading households…</p>}
      {!searching && !searchError && recipients?.length === 0 && <p>No eligible households with unmet need found. Try another area.</p>}
      <div className="giving-grid">
      {!searching && !searchError && recipients?.map((recipient) => (
        <article className="review-card giving-household" key={recipient.id}>
          <div className="giving-status"><ShieldCheck size={16} aria-hidden="true" /> {recipient.demo ? 'Demo profile' : 'Verified eligible'}</div>
          <h3><MapPin size={18} aria-hidden="true" /> {recipient.locality}</h3>
          <dl><dt>Monthly household income</dt><dd>{recipient.incomeBand}</dd><dt>Financial need</dt><dd>{recipient.priority}</dd></dl>
          {recipient.noReceipts && <p>No confirmed Zakat this month.</p>}
          {recipient.demo ? <p>Example only. Giving is disabled.</p> : token && (
            <button type="button" disabled={busy} onClick={() => setSelected(recipient.id)}>Record direct handover</button>
          )}
          {!token && <p>Sign in to record a handover.</p>}
          {selected === recipient.id && (
            <form onSubmit={(event) => {
              event.preventDefault()
              const amount = Number(new FormData(event.currentTarget).get('amount'))
              void update('/auth/handovers', { caseId: recipient.id, amountPaise: Math.round(amount * 100) })
            }}>
              <p>Record the amount after you hand it over in person.</p>
              <p><label>Amount (₹)<input name="amount" type="number" min=".01" max="21474836.47" step=".01" required /></label></p>
              <button disabled={busy}>Save handover</button>
            </form>
          )}
        </article>
      ))}
      </div>
      {token && (
        <section>
          <h2>Your handovers</h2>
          {handovers?.length === 0 && <p>No handovers recorded yet.</p>}
          {handovers?.map((item) => (
            <article className="review-card" key={item.id}>
              <h3>{currency.format(item.amountPaise / 100)}</h3>
              <p>{item.incoming ? 'Incoming' : 'Outgoing'} · {item.confirmedAt ? 'Confirmed' : 'Awaiting confirmation'}</p>
              {item.incoming && !item.confirmedAt && <button disabled={busy} onClick={() => void update('/auth/handovers/' + item.id + '/confirm')}>Confirm receipt</button>}
            </article>
          ))}
        </section>
      )}
    </section>
  )
}
