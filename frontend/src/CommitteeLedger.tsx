import { useEffect, useState, type FormEvent } from 'react'
import { API_BASE_URL } from './config/api'

type Entry = {
  id: string
  amountPaise: number
  confirmedAt: string | null
  mahall: { name: string } | null
  giver?: { name: string | null; email: string }
}
const currency = new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR' })

export function CommitteeLedger({ token, admin = false, hasHomeMahallu = false }: { token: string; admin?: boolean; hasHomeMahallu?: boolean }) {
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
        const ledger = await fetch(new URL(path, API_BASE_URL), {
          signal: controller.signal, headers: { Authorization: 'Bearer ' + token },
        })
        if (!ledger.ok) throw new Error('Could not load committee contributions.')
        const data = await ledger.json()
        if (controller.signal.aborted) return
        setEntries(admin ? data.entries : data)
        if (admin) setTotal(data.confirmedPaise)
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
      amountPaise: Math.round(Number(details.get('amount')) * 100),
    }, 'Contribution recorded. Awaiting receipt confirmation.')) form.reset()
  }

  return (
    <section className="panel committee-panel" id={admin ? undefined : 'committee-giving'}>
      <h2>{admin ? 'Committee collections' : hasHomeMahallu ? 'Give through your Mahallu' : 'Give through the Super Admin fund'}</h2>
      {admin ? (
        <div className="ledger-total"><strong>{currency.format(total / 100)}</strong><span>Confirmed collections</span></div>
      ) : (
        <>
          <p>{hasHomeMahallu ? 'Record your contribution after giving it to your home Mahallu.' : 'You have no home Mahallu. Record your contribution after giving it to the central fund for Super Admin to confirm.'}</p>
          <form onSubmit={(event) => void record(event)}>
            <div className="committee-fields">
              <p><label>Amount (₹)<input name="amount" type="number" min=".01" max="21474836.47" step=".01" required /></label></p>
            </div>
            <button disabled={busy}>Record contribution</button>
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
              <div><strong>{entry.mahall?.name ?? 'Super Admin fund'}</strong><span>{entry.giver?.name ?? entry.giver?.email ?? (entry.confirmedAt ? 'Receipt confirmed' : 'Awaiting confirmation')}</span></div>
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
