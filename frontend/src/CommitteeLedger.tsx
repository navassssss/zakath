import { useEffect, useState, type FormEvent } from 'react'
import { API_BASE_URL } from './config/api'

type Mahallu = { id: string; name: string; locality: string }
type Entry = {
  id: string
  amountPaise: number
  confirmedAt: string | null
  mahall: { name: string }
  giver?: { name: string | null; email: string }
}
const currency = new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR' })

export function CommitteeLedger({ token, admin = false }: { token: string; admin?: boolean }) {
  const [mahalls, setMahalls] = useState<Mahallu[]>([])
  const [entries, setEntries] = useState<Entry[] | null>(null)
  const [total, setTotal] = useState(0)
  const [version, setVersion] = useState(0)
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')
  const [feedback, setFeedback] = useState('')
  const path = admin ? '/auth/committee-ledger' : '/auth/contributions'

  useEffect(() => {
    const controller = new AbortController()
    async function load() {
      try {
        const [ledger, directory] = await Promise.all([
          fetch(new URL(path, API_BASE_URL), {
            signal: controller.signal, headers: { Authorization: 'Bearer ' + token },
          }),
          admin ? null : fetch(new URL('/mahalls', API_BASE_URL), { signal: controller.signal }),
        ])
        if (!ledger.ok || (directory && !directory.ok)) throw new Error('Could not load committee contributions.')
        const data = await ledger.json()
        if (controller.signal.aborted) return
        setEntries(admin ? data.entries : data)
        if (admin) setTotal(data.confirmedPaise)
        if (directory) setMahalls(await directory.json())
      } catch {
        if (!controller.signal.aborted) setError('Could not load committee contributions. Reload to try again.')
      }
    }
    void load()
    return () => controller.abort()
  }, [token, admin, path, version])

  async function update(endpoint: string, body: object, success: string) {
    setBusy(true)
    setError('')
    setFeedback('')
    try {
      const response = await fetch(new URL(endpoint, API_BASE_URL), {
        method: 'POST',
        headers: { Authorization: 'Bearer ' + token, 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      })
      const data = await response.json()
      if (!response.ok) throw new Error(data.message)
      setFeedback(success)
      setVersion((value) => value + 1)
      return true
    } catch (failure) {
      setError(failure instanceof Error ? failure.message : 'Could not save the contribution.')
      return false
    } finally {
      setBusy(false)
    }
  }

  async function record(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const form = event.currentTarget
    const details = new FormData(form)
    if (await update(path, {
      mahallId: details.get('mahallId'),
      amountPaise: Math.round(Number(details.get('amount')) * 100),
    }, 'Contribution recorded. Your Mahallu will confirm receipt.')) form.reset()
  }

  return (
    <section className="panel committee-panel">
      <h2>{admin ? 'Committee collections' : 'Give through a Mahallu'}</h2>
      {admin ? (
        <div className="ledger-total"><strong>{currency.format(total / 100)}</strong><span>Confirmed collections</span></div>
      ) : (
        <>
          <p>Record a contribution after you give it to a Mahallu committee.</p>
          {entries !== null && mahalls.length === 0 && <p>No Mahallus are available to receive contributions yet.</p>}
          <form onSubmit={(event) => void record(event)}>
            <div className="committee-fields">
              <p><label>Mahallu<select name="mahallId" required><option value="">Choose a Mahallu</option>
                {mahalls.map((mahall) => <option key={mahall.id} value={mahall.id}>{mahall.name} ({mahall.locality})</option>)}
              </select></label></p>
              <p><label>Amount (₹)<input name="amount" type="number" min=".01" max="21474836.47" step=".01" required /></label></p>
            </div>
            <button disabled={busy || mahalls.length === 0}>Record contribution</button>
          </form>
        </>
      )}
      {error && <p role="alert">{error}</p>}
      {feedback && <p role="status">{feedback}</p>}
      {entries === null && !error && <p role="status">Loading contributions…</p>}
      {entries?.length === 0 && <p>No contributions recorded yet.</p>}
      {!!entries?.length && (
        <ul className="ledger-list">
          {entries.map((entry) => (
            <li key={entry.id}>
              <div><strong>{entry.mahall.name}</strong><span>{entry.giver?.name ?? entry.giver?.email ?? (entry.confirmedAt ? 'Receipt confirmed' : 'Awaiting confirmation')}</span></div>
              <div>
                <strong>{currency.format(entry.amountPaise / 100)}</strong>
                {admin && (entry.confirmedAt ? <span>Confirmed</span> :
                  <button type="button" disabled={busy} onClick={() => void update(path + '/' + entry.id + '/confirm', {}, 'Receipt confirmed.')}>Confirm receipt</button>)}
              </div>
            </li>
          ))}
        </ul>
      )}
    </section>
  )
}
