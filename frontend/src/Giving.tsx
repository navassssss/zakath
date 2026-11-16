import { useEffect, useState, type FormEvent } from 'react'
import { API_BASE_URL } from './config/api'

type Recipient = { id: string; locality: string; priority: string; noReceipts: boolean; requestCategory: string | null; requestedPaise: number | null; monthlyIncomePaise: number | null }
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

  async function search(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const url = new URL('/auth/discovery', API_BASE_URL)
    url.searchParams.set('area', String(new FormData(event.currentTarget).get('area')))
    setBusy(true)
    setError('')
    setMessage('')
    setSelected('')
    try {
      const response = await fetch(url, { headers: { Authorization: 'Bearer ' + token } })
      const result = await response.json()
      if (!response.ok) throw new Error(result.message)
      setRecipients(result)
    } catch (failure) {
      setRecipients(null)
      setError(failure instanceof Error ? failure.message : 'Could not search this area')
    } finally {
      setBusy(false)
    }
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
      if (!body) setRecipients(null)
      setRevision((previous) => previous + 1)
    } catch (failure) {
      setError(failure instanceof Error ? failure.message : 'Could not save the handover')
    } finally {
      setBusy(false)
    }
  }

  return (
    <section className="panel">
      <h2>Find verified recipients</h2>
      <form onSubmit={(event) => void search(event)}>
        <p><label>Locality or PIN code<input name="area" minLength={2} maxLength={120} required /></label></p>
        <button disabled={busy}>Search</button>
      </form>
      {error && <p role="alert">{error}</p>}
      {message && <p role="status">{message}</p>}
      {recipients?.length === 0 && <p>No verified recipients with unmet need found in this area.</p>}
      {recipients?.map((recipient) => (
        <article className="review-card" key={recipient.id}>
          <h3>{recipient.locality}</h3>
          <p>{recipient.priority}{recipient.noReceipts && ' · No confirmed receipt this month'}</p>
          {recipient.requestCategory && recipient.requestedPaise != null && <p><strong>{recipient.requestCategory}</strong> · {currency.format(recipient.requestedPaise / 100)} requested</p>}
          {recipient.monthlyIncomePaise != null && <p>Monthly household income {currency.format(recipient.monthlyIncomePaise / 100)}</p>}
          {token && (
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
