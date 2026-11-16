import { useEffect, useState, type FormEvent } from 'react'
import { ArrowLeft, Check, ChevronRight, Plus } from 'lucide-react'
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

export function MahalluDirectory({ token, path, selectedId }: { token: string; path: string; selectedId?: string }) {
  const [mahalls, setMahalls] = useState<Mahallu[] | null>(null)
  const [query, setQuery] = useState('')
  const [failed, setFailed] = useState(false)
  const [attempt, setAttempt] = useState(0)
  const [showCreate, setShowCreate] = useState(false)
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')
  const [message, setMessage] = useState('')

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
  const selected = mahalls?.find(({ id }) => encodeURIComponent(id) === selectedId)

  async function save(event: FormEvent<HTMLFormElement>, mahallId?: string) {
    event.preventDefault()
    const form = event.currentTarget
    const fields = Object.fromEntries(new FormData(form))
    setBusy(true)
    setError('')
    setMessage('')
    try {
      const response = await fetch(new URL(mahallId ? '/auth/mahalls/admins' : '/auth/mahalls', API_BASE_URL), {
        method: 'POST',
        headers: { Authorization: 'Bearer ' + token, 'Content-Type': 'application/json' },
        body: JSON.stringify(mahallId ? { ...fields, mahallId } : fields),
      })
      const result = await response.json()
      if (!response.ok) throw new Error(result.message || 'Could not save changes.')
      form.reset()
      setShowCreate(false)
      setMessage(mahallId ? 'Admin assigned.' : 'Mahallu registered.')
      setFailed(false)
      setAttempt((value) => value + 1)
    } catch (failure) {
      setError(failure instanceof Error ? failure.message : 'Could not save changes.')
    } finally {
      setBusy(false)
    }
  }

  return (
    <section className="panel">
      {selectedId && <a className="directory-back" href={path}><ArrowLeft size={16} aria-hidden="true" /> All Mahallus</a>}
      <div className="directory-heading">
        <div><h1>{selected?.name ?? 'Mahallus'}</h1><p>{selected?.locality ?? (selectedId ? '' : 'Manage registered Mahallus, administrators, and members.')}</p></div>
        {!selectedId && <button type="button" className="green-action" aria-expanded={showCreate} onClick={() => {
          setShowCreate(!showCreate)
          setError('')
        }}><Plus size={17} aria-hidden="true" /> {showCreate ? 'Close form' : 'Register Mahallu'}</button>}
      </div>
      {error && <p role="alert">{error}</p>}
      {message && <p role="status">{message}</p>}
      {showCreate && <form className="directory-form" onSubmit={(event) => void save(event)}>
        <label>Mahallu name<input name="name" maxLength={120} required /></label>
        <label>Locality<input name="locality" maxLength={120} required /></label>
        <button disabled={busy}>Save Mahallu</button>
      </form>}
      {failed ? <p role="alert">Could not load the directory. <button type="button" onClick={() => {
        setFailed(false)
        setAttempt(attempt + 1)
      }}>Retry</button></p> : mahalls === null && <p role="status">Loading Mahallus…</p>}
      {!selectedId && mahalls && mahalls.length > 0 && <label className="directory-search">Search by name or locality
        <input type="search" value={query} onChange={(event) => setQuery(event.target.value)} />
      </label>}
      {!selectedId && matches?.length === 0 && <p>{mahalls?.length ? 'No Mahallus match your search.' : 'No Mahallus are registered.'}</p>}
      {!selectedId && !!matches?.length && <table className="directory-table">
        <thead><tr><th scope="col">Mahallu</th><th scope="col">Admin assigned</th><th scope="col">Members</th></tr></thead>
        <tbody>{matches.map((mahall) => (
          <tr key={mahall.id}>
            <th scope="row"><a href={path + '/' + encodeURIComponent(mahall.id)}>
              <span><strong>{mahall.name}</strong><small>{mahall.locality}</small></span><ChevronRight size={16} aria-hidden="true" />
            </a></th>
            <td>{mahall.members.some((member) => member.role === 'MAHALL_ADMIN')
              ? <span className="assigned" aria-label="Assigned"><Check size={17} aria-hidden="true" /></span>
              : <span className="unassigned">Unassigned</span>}</td>
            <td>{mahall.members.length}</td>
          </tr>
        ))}</tbody>
      </table>}
      {selectedId && mahalls && !selected && <p>Mahallu not found.</p>}
      {selected && <>
        <form className="directory-form assign-form" onSubmit={(event) => void save(event, selected.id)}>
          <label>Admin account email<input name="email" type="email" required /></label>
          <button disabled={busy}>Assign admin</button>
        </form>
        <div className="directory-roster">
          <People title="Mahallu admins" people={selected.members.filter((member) => member.role === 'MAHALL_ADMIN')} empty="No admin assigned." />
          <People title="All registered members" people={selected.members} empty="No members registered." />
        </div>
      </>}
    </section>
  )
}
