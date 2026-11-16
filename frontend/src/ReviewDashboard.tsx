import { useEffect, useState, type FormEvent } from 'react'
import { API_BASE_URL } from './config/api'

type Mahall = { id: string; name: string; locality: string }
type Review = {
  id: string
  status: string
  locality: string
  postalCode: string
  householdSize: number
  monthlyIncomePaise: number
  monthlyExpensesPaise: number
  additionalInformation: string | null
  applicantResponse: string | null
  applicant: { name: string | null; email: string; mahallId: string | null }
  reviewingMahall: { id: string; name: string } | null
}

const currency = new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR' })

export function ReviewDashboard({ token, superAdmin }: { token: string; superAdmin: boolean }) {
  const [reviews, setReviews] = useState<Review[] | null>(null)
  const [mahalls, setMahalls] = useState<Mahall[]>([])
  const [version, setVersion] = useState(0)
  const [busy, setBusy] = useState(false)
  const [message, setMessage] = useState('')
  const [error, setError] = useState('')

  useEffect(() => {
    const controller = new AbortController()
    async function load() {
      try {
        const [queue, directory] = await Promise.all([
          fetch(new URL('/auth/review', API_BASE_URL), {
            signal: controller.signal,
            headers: { Authorization: 'Bearer ' + token },
          }),
          superAdmin ? fetch(new URL('/mahalls', API_BASE_URL), { signal: controller.signal }) : null,
        ])
        if (!queue.ok || (directory && !directory.ok)) throw new Error('Could not load the review queue')
        setReviews(await queue.json())
        if (directory) setMahalls(await directory.json())
      } catch (failure) {
        if (!controller.signal.aborted) setError(failure instanceof Error ? failure.message : 'Could not load the review queue')
      }
    }
    void load()
    return () => controller.abort()
  }, [token, superAdmin, version])

  async function save(event: FormEvent<HTMLFormElement>, path: string, nullableField?: string) {
    event.preventDefault()
    const payload = Object.fromEntries(new FormData(event.currentTarget))
    if (nullableField && payload[nullableField] === '') delete payload[nullableField]
    setBusy(true)
    setMessage('')
    setError('')
    try {
      const response = await fetch(new URL(path, API_BASE_URL), {
        method: 'POST',
        headers: { Authorization: 'Bearer ' + token, 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...(nullableField ? { [nullableField]: null } : {}), ...payload }),
      })
      const result = await response.json()
      if (!response.ok) throw new Error(result.message || 'Could not save changes')
      setMessage('Changes saved.')
      setVersion((previous) => previous + 1)
    } catch (failure) {
      setError(failure instanceof Error ? failure.message : 'Could not save changes')
    } finally {
      setBusy(false)
    }
  }

  const options = mahalls.map((mahall) => <option key={mahall.id} value={mahall.id}>{mahall.name} ({mahall.locality})</option>)

  return (
    <section aria-labelledby="review-heading" className="review-dashboard">
      <h2 id="review-heading">Eligibility review</h2>
      {error && <p role="alert">{error}</p>}
      {message && <p role="status">{message}</p>}
      {reviews === null && !error && <p role="status">Loading cases…</p>}
      {reviews?.length === 0 && <p>No eligibility cases in this queue.</p>}
      {reviews?.map((review) => {
        const open = review.status === 'PENDING' || review.status === 'MORE_INFORMATION_REQUIRED'
        return (
          <article key={review.id} className="review-card">
            <h3>{review.applicant.name ?? review.applicant.email}</h3>
            <p>{review.locality} · {review.postalCode} · {review.householdSize} in household</p>
            <p>Income {currency.format(review.monthlyIncomePaise / 100)} · Expenses {currency.format(review.monthlyExpensesPaise / 100)} per month</p>
            <p>{review.status.toLowerCase().replaceAll('_', ' ')} · {review.reviewingMahall?.name ?? 'Unaffiliated'}</p>
            {review.additionalInformation && <p>{review.additionalInformation}</p>}
            {review.applicantResponse && <p><strong>Applicant response</strong><br />{review.applicantResponse}</p>}
            {open && (
              <form onSubmit={(event) => void save(event, '/auth/review/' + review.id + '/decision')}>
                <p><label>Decision<select name="status" required>
                  <option value="APPROVED">Approve</option>
                  <option value="MORE_INFORMATION_REQUIRED">Request more information</option>
                  <option value="REJECTED">Reject</option>
                </select></label></p>
                <p><label>Reason<textarea name="reason" maxLength={1000} required /></label></p>
                <button disabled={busy}>Save decision</button>
              </form>
            )}
            {open && superAdmin && !review.applicant.mahallId && (
              <form key={review.reviewingMahall?.id ?? 'direct'} onSubmit={(event) => void save(event, '/auth/review/' + review.id + '/assignment', 'mahallId')}>
                <p><label>Reviewing Mahallu<select name="mahallId" defaultValue={review.reviewingMahall?.id ?? ''}>
                  <option value="">Direct super admin review</option>{options}
                </select></label></p>
                <button disabled={busy}>Save assignment</button>
              </form>
            )}
          </article>
        )
      })}
    </section>
  )
}
