import { useEffect, useState } from 'react'
import { API_BASE_URL } from './config/api'

type Overview = { mahalls: number; members: number; cases: Record<string, number>; confirmedPaise: number }
const stages = [
  ['PENDING', 'Pending review'],
  ['MORE_INFORMATION_REQUIRED', 'Waiting for information'],
  ['APPROVED', 'Approved'],
  ['REJECTED', 'Rejected'],
] as const

export function AdminOverview({ token }: { token: string }) {
  const [data, setData] = useState<Overview | null>(null)
  const [failed, setFailed] = useState(false)
  useEffect(() => {
    const request = new AbortController()
    async function load() {
      try {
        const response = await fetch(new URL('/auth/admin/overview', API_BASE_URL), {
          signal: request.signal, headers: { Authorization: 'Bearer ' + token },
        })
        if (!response.ok) throw new Error()
        setData(await response.json())
      } catch {
        if (!request.signal.aborted) setFailed(true)
      }
    }
    void load()
    return () => request.abort()
  }, [token])

  if (!data) return failed ? <p role="alert">Could not load dashboard figures. Reload to try again.</p> : <p role="status">Loading dashboard figures…</p>
  const total = stages.reduce((sum, [status]) => sum + (data.cases[status] ?? 0), 0)
  const collections = new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR' }).format(data.confirmedPaise / 100)
  return (
    <section className="admin-overview" aria-label="Dashboard overview">
      <dl className="overview-metrics">
        <div><dt>Mahallus</dt><dd>{data.mahalls}</dd></div>
        <div><dt>Registered members</dt><dd>{data.members}</dd></div>
        <div><dt>Pending review</dt><dd>{data.cases.PENDING ?? 0}</dd></div>
        <div><dt>Confirmed collections</dt><dd>{collections}</dd></div>
      </dl>
      <h2>Eligibility cases</h2>
      {total === 0 ? <p>No eligibility cases recorded yet.</p> : (
        <ul className="case-breakdown">
          {stages.map(([status, label]) => (
            <li key={status}><span>{label}</span><strong>{data.cases[status] ?? 0}</strong>
              <progress aria-label={label} value={data.cases[status] ?? 0} max={total} />
            </li>
          ))}
        </ul>
      )}
    </section>
  )
}
