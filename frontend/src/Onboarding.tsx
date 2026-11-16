import { useEffect, useRef, useState, type FormEvent } from 'react'
import { API_BASE_URL } from './config/api'

type Mahallu = { id: string; name: string; locality: string }
export type OnboardingProfile = { locality: string; postalCode: string; householdSize: number; monthlyIncomePaise: number; monthlyExpensesPaise: number }
export type OnboardedAccount = { name: string; mahallId: string | null; onboardingProfile: OnboardingProfile }
const steps = ['Your details', 'Household finances', 'Review your details']

export function Onboarding({ token, name, mahallId, onSaved }: {
  token: string; name: string | null; mahallId: string | null; onSaved: (account: OnboardedAccount) => void
}) {
  const [step, setStep] = useState(0)
  const [mahalls, setMahalls] = useState<Mahallu[] | null>(null)
  const [directoryError, setDirectoryError] = useState(false)
  const [attempt, setAttempt] = useState(0)
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')
  const [draft, setDraft] = useState({ name: name ?? '', locality: '', postalCode: '', mahallId: mahallId ?? '', householdSize: '', income: '', expenses: '' })
  const title = useRef<HTMLHeadingElement>(null)
  const set = (key: keyof typeof draft, value: string) => setDraft((previous) => ({ ...previous, [key]: value }))

  useEffect(() => {
    const request = new AbortController()
    async function load() {
      try {
        const response = await fetch(new URL('/mahalls', API_BASE_URL), { signal: request.signal })
        if (!response.ok) throw new Error()
        setMahalls(await response.json())
      } catch {
        if (!request.signal.aborted) setDirectoryError(true)
      }
    }
    void load()
    return () => request.abort()
  }, [attempt])

  function changeStep(next: number) {
    setStep(next)
    title.current?.focus()
  }

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setError('')
    if (step < 2) {
      changeStep(step + 1)
      return
    }
    setBusy(true)
    try {
      const response = await fetch(new URL('/auth/onboarding', API_BASE_URL), {
        method: 'POST', headers: { Authorization: 'Bearer ' + token, 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: draft.name, locality: draft.locality, postalCode: draft.postalCode, mahallId: draft.mahallId || null,
          householdSize: Number(draft.householdSize), monthlyIncomePaise: Math.round(Number(draft.income) * 100),
          monthlyExpensesPaise: Math.round(Number(draft.expenses) * 100),
        }),
      })
      const result = await response.json()
      if (!response.ok) throw new Error(result.message || 'Could not save your profile.')
      onSaved(result)
    } catch (failure) {
      setError(failure instanceof Error ? failure.message : 'Could not save your profile.')
    } finally {
      setBusy(false)
    }
  }

  return (
    <section className="panel account-panel">
      <h1>Set up your Amanah account</h1>
      <form className="intake" onSubmit={(event) => void submit(event)}>
        <p className="step-count">Step {step + 1} of {steps.length}</p>
        <progress aria-label="Profile setup progress" value={step + 1} max={steps.length} />
        <h2 ref={title} tabIndex={-1}>{steps[step]}</h2>
        {step === 0 && <>
          <p><label>Full name<input autoComplete="name" required maxLength={120} value={draft.name} onChange={(event) => set('name', event.target.value)} /></label></p>
          <p><label>Locality<input autoComplete="address-level2" required maxLength={120} value={draft.locality} onChange={(event) => set('locality', event.target.value)} /></label></p>
          <p><label>PIN code<input autoComplete="postal-code" required inputMode="numeric" pattern="[0-9]{6}" value={draft.postalCode} onChange={(event) => set('postalCode', event.target.value)} /></label></p>
          <p><label>Home Mahallu (optional)<select value={draft.mahallId} disabled={Boolean(mahallId) || !mahalls} onChange={(event) => set('mahallId', event.target.value)}>
            <option value="">No home Mahallu</option>
            {mahalls?.map((mahall) => <option key={mahall.id} value={mahall.id}>{mahall.name} ({mahall.locality})</option>)}
          </select></label></p>
          {directoryError && <p role="alert">Could not load Mahallus. <button type="button" onClick={() => {
            setDirectoryError(false)
            setAttempt((value) => value + 1)
          }}>Retry</button></p>}
        </>}
        {step === 1 && <>
          <p><label>People in your household<input type="number" inputMode="numeric" min="1" max="100" required value={draft.householdSize} onChange={(event) => set('householdSize', event.target.value)} /></label></p>
          <p><label>Monthly household income (₹)<input type="number" inputMode="decimal" min="0" max="21474836.47" step=".01" required value={draft.income} onChange={(event) => set('income', event.target.value)} /></label></p>
          <p><label>Monthly essential expenses (₹)<input type="number" inputMode="decimal" min="0" max="21474836.47" step=".01" required value={draft.expenses} onChange={(event) => set('expenses', event.target.value)} /></label></p>
        </>}
        {step === 2 && <>
          <dl>
            <dt>Name</dt><dd>{draft.name}</dd>
            <dt>Area</dt><dd>{draft.locality} · {draft.postalCode}</dd>
            <dt>Home Mahallu</dt><dd>{mahalls?.find((mahall) => mahall.id === draft.mahallId)?.name ?? 'No home Mahallu'}</dd>
            <dt>Household</dt><dd>{draft.householdSize} people</dd>
            <dt>Monthly finances</dt><dd>₹{draft.income} income · ₹{draft.expenses} expenses</dd>
          </dl>
          <p className="privacy-note">Your household finances are saved privately. Submitting this profile does not request Zakat.</p>
        </>}
        {error && <p role="alert">{error}</p>}
        <div className="intake-actions">
          {step > 0 && <button type="button" disabled={busy} onClick={() => changeStep(step - 1)}>Back</button>}
          <button disabled={busy || (step === 0 && !mahalls)}>{step === 2 ? 'Save and open dashboard' : 'Continue'}</button>
        </div>
      </form>
    </section>
  )
}
