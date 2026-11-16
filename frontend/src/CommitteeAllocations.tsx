import { useEffect, useState, type FormEvent } from 'react'
import { API_BASE_URL } from './config/api'

type Applicant = { name: string | null; email: string }
type Allocation = { id: string; amountPaise: number; confirmedAt: string | null; mahall: { name: string }; eligibility?: { applicant: Applicant } }
type Overview = {
  mahalls: { id: string; name: string; availablePaise: number; distributedPaise: number }[]
  eligible: { id: string; reviewingMahallId: string; applicant: Applicant }[]
  entries: Allocation[]
}
const currency = new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR' })

export function CommitteeAllocations({ token, admin = false }: { token: string; admin?: boolean }) {
  const [overview, setOverview] = useState<Overview | null>(null)
  const [entries, setEntries] = useState<Allocation[] | null>(null)
  const [version, setVersion] = useState(0)
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')
  const [message, setMessage] = useState('')
  const path = admin ? '/auth/committee-allocations' : '/auth/allocations'

  useEffect(() => {
    const controller = new AbortController()
    async function load() {
      try {
        const response = await fetch(new URL(path, API_BASE_URL), {
          signal: controller.signal, headers: { Authorization: 'Bearer ' + token },
        })
        if (!response.ok) throw new Error()
        const result = await response.json()
        if (admin) setOverview(result)
        setEntries(admin ? result.entries : result)
      } catch {
        if (!controller.signal.aborted) setError('Could not load committee distributions.')
      }
    }
    void load()
    return () => controller.abort()
  }, [path, token, admin, version])

  async function save(endpoint: string, payload: object, success: string) {
    setBusy(true)
    setError('')
    setMessage('')
    try {
      const response = await fetch(new URL(endpoint, API_BASE_URL), {
        method: 'POST',
        headers: { Authorization: 'Bearer ' + token, 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })
      const result = await response.json()
      if (!response.ok) throw new Error(result.message || 'Could not save changes.')
      setMessage(success)
      setVersion((previous) => previous + 1)
      return true
    } catch (failure) {
      setError(failure instanceof Error ? failure.message : 'Could not save changes.')
      return false
    } finally {
      setBusy(false)
    }
  }

  async function allocate(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const form = event.currentTarget
    const data = new FormData(form)
    if (await save(path, { caseId: data.get('caseId'), amountPaise: Math.round(Number(data.get('amount')) * 100) }, 'Funds reserved. The recipient can confirm once they receive them.')) form.reset()
  }

  return (
    <section className="panel">
      <h2>{admin ? 'Committee distributions' : 'Zakat from Mahallus'}</h2>
      {error && <p role="alert">{error}</p>}
      {message && <p role="status">{message}</p>}
      {entries === null && !error && <p role="status">Loading distributions…</p>}
      {overview && <>
        <ul className="ledger-list">
          {overview.mahalls.map((mahall) => (
            <li key={mahall.id}><strong>{mahall.name}</strong><div>
              <span>{currency.format(mahall.availablePaise / 100)} available</span>
              <span>{currency.format(mahall.distributedPaise / 100)} receipt confirmed</span>
            </div></li>
          ))}
        </ul>
        <form onSubmit={(event) => void allocate(event)}>
          <p><label>Verified recipient<select name="caseId" required>
            <option value="">Choose a recipient</option>
            {overview.eligible.map(({ id, applicant, reviewingMahallId }) => (
              <option key={id} value={id}>{applicant.name ?? applicant.email} ({overview.mahalls.find((mahall) => mahall.id === reviewingMahallId)?.name})</option>
            ))}
          </select></label></p>
          <p><label>Amount (₹)<input name="amount" type="number" inputMode="decimal" min=".01" max="21474836.47" step=".01" required /></label></p>
          <button disabled={busy || overview.eligible.length === 0}>Allocate funds</button>
        </form>
      </>}
      {entries?.length === 0 && <p>No distributions recorded yet.</p>}
      {!!entries?.length && <ul className="ledger-list">
        {entries.map((entry) => (
          <li key={entry.id}>
            <div><strong>{entry.mahall.name}</strong>{entry.eligibility && <span>{entry.eligibility.applicant.name ?? entry.eligibility.applicant.email}</span>}</div>
            <div><strong>{currency.format(entry.amountPaise / 100)}</strong>
              {!admin && !entry.confirmedAt
                ? <button type="button" disabled={busy} onClick={() => void save(path + '/' + entry.id + '/confirm', {}, 'Receipt confirmed.')}>Confirm receipt</button>
                : <span>{entry.confirmedAt ? 'Receipt confirmed' : 'Awaiting receipt'}</span>}
            </div>
          </li>
        ))}
      </ul>}
    </section>
  )
}
