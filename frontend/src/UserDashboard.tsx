import { useEffect, useState } from 'react'
import { ArrowUpRight } from 'lucide-react'
import { API_BASE_URL } from './config/api'
import { Link } from './navigation'

type Overview = { confirmedPaise: number; confirmedGifts: number; familiesSupported: number; eligibility: string | null; mahallName: string | null }
const rupees = new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR' })

export function UserDashboard({ token, name }: { token: string; name: string | null }) {
  const [overview, setOverview] = useState<Overview | null>(null)
  const [failure, setFailure] = useState(false)
  useEffect(() => {
    const request = new AbortController()
    async function load() {
      try {
        const response = await fetch(new URL('/auth/dashboard', API_BASE_URL), {
          headers: { Authorization: 'Bearer ' + token }, signal: request.signal,
        })
        if (!response.ok) throw new Error()
        setOverview(await response.json())
      } catch {
        if (!request.signal.aborted) setFailure(true)
      }
    }
    void load()
    return () => request.abort()
  }, [token])

  return (
    <section className="panel user-dashboard">
      <div className="directory-heading">
        <div><h1>{name ? 'Welcome, ' + name.split(' ')[0] : 'Your dashboard'}</h1><p>Track your giving and Zakat eligibility.</p></div>
        <Link className="primary-link dashboard-give" href="/give">Give Zakat <ArrowUpRight size={16} aria-hidden="true" /></Link>
      </div>
      {failure && <p role="alert">Could not load your dashboard. Reload to try again.</p>}
      {!overview && !failure && <p role="status">Loading dashboard figures…</p>}
      {overview && <>
        <dl className="overview-metrics user-metrics">
          <div><dt>Confirmed giving</dt><dd>{rupees.format(overview.confirmedPaise / 100)}</dd></div>
          <div><dt>Confirmed contributions</dt><dd>{overview.confirmedGifts}</dd></div>
          <div><dt>Families supported directly</dt><dd>{overview.familiesSupported}</dd></div>
        </dl>
        <div className="dashboard-row"><div><strong>Eligibility status</strong><p>{overview.eligibility?.toLowerCase().replaceAll('_', ' ') ?? 'No eligibility case yet'}</p></div><Link href="/help">Get help</Link></div>
        <div className="dashboard-row"><div><strong>Home Mahallu</strong><p>{overview.mahallName ?? 'No home Mahallu'}</p></div><Link href="/account">Account</Link></div>
      </>}
    </section>
  )
}
