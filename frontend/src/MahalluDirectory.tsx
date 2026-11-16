import { useEffect, useState } from 'react'
import { Building2 } from 'lucide-react'
import { API_BASE_URL } from './config/api'

type Member = { id: string; name: string | null; email: string; role: string }
type Mahallu = { id: string; name: string; locality: string; members: Member[] }

function People({ title, people, empty }: { title: string; people: Member[]; empty: string }) {
  return (
    <section className="directory-people">
      <h3>{title}</h3>
      {people.length ? <ul className="ledger-list">
        {people.map(({ id, name, email }) => (
          <li key={id}><div><strong>{name ?? email}</strong>{name && <span>{email}</span>}</div></li>
        ))}
      </ul> : <p>{empty}</p>}
    </section>
  )
}

export function MahalluDirectory({ token }: { token: string }) {
  const [mahalls, setMahalls] = useState<Mahallu[] | null>(null)
  const [query, setQuery] = useState('')
  const [failed, setFailed] = useState(false)
  const [attempt, setAttempt] = useState(0)

  useEffect(() => {
    const request = new AbortController()
    async function load() {
      try {
        const response = await fetch(new URL('/auth/mahalls/directory', API_BASE_URL), {
          signal: request.signal,
          headers: { Authorization: 'Bearer ' + token },
        })
        if (!response.ok) throw new Error()
        setMahalls(await response.json())
      } catch {
        if (!request.signal.aborted) setFailed(true)
      }
    }
    void load()
    return () => request.abort()
  }, [attempt, token])

  const search = query.trim().toLowerCase()
  const matches = mahalls?.filter(({ name, locality }) => name.toLowerCase().includes(search) || locality.toLowerCase().includes(search))
  return (
    <section className="panel">
      <h1>Mahallu directory</h1>
      <p>Open a Mahallu to see its admins and registered members.</p>
      {failed ? <p role="alert">Could not load the directory. <button type="button" onClick={() => {
        setFailed(false)
        setAttempt(attempt + 1)
      }}>Retry</button></p> : mahalls === null && <p role="status">Loading Mahallus…</p>}
      {mahalls && mahalls.length > 0 && <label>Search by name or locality
        <input type="search" value={query} onChange={(event) => setQuery(event.target.value)} />
      </label>}
      {matches?.length === 0 && <p>{mahalls?.length ? 'No Mahallus match your search.' : 'No Mahallus are registered.'}</p>}
      <div className="directory-list">
        {matches?.map((mahall) => {
          const admins = mahall.members.filter((member) => member.role === 'MAHALL_ADMIN')
          return (
            <details key={mahall.id}>
              <summary><Building2 aria-hidden="true" size={20} /><span><strong>{mahall.name}</strong><small>{mahall.locality} · {mahall.members.length} registered · {admins.length} admins</small></span></summary>
              <People title="Mahallu admins" people={admins} empty="No admin assigned." />
              <People title="All registered members" people={mahall.members} empty="No members registered." />
            </details>
          )
        })}
      </div>
    </section>
  )
}
