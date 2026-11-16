import { useState, type FormEvent } from 'react'
import { API_BASE_URL } from './config/api'

const fields = [
  ['cash', 'Cash and bank balances'],
  ['metals', 'Zakatable gold and silver value'],
  ['business', 'Business stock and assets'],
  ['investments', 'Zakatable investment value'],
  ['debts', 'Eligible liabilities'],
  ['nisab', 'Applicable Nisab threshold'],
]
const rupees = new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR' })
type Result = { assets: number; debts: number; net: number; due: number; thresholdReached: boolean }

export function ZakatCalculator() {
  const [result, setResult] = useState<Result | null>(null)
  const [error, setError] = useState('')
  const [busy, setBusy] = useState(false)

  async function calculate(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const form = new FormData(event.currentTarget)
    const amounts = Object.fromEntries(fields.map(([name]) => [name, Math.round(Number(form.get(name)) * 100)]))
    setError('')
    setResult(null)
    setBusy(true)
    try {
      const response = await fetch(new URL('/auth/calculator', API_BASE_URL), {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...amounts, hawl: form.has('hawl') }),
      })
      const data = await response.json()
      if (!response.ok) throw new Error(data.message)
      setResult(data)
    } catch (failure) {
      setError(failure instanceof Error ? failure.message : 'Could not calculate Zakat')
    } finally {
      setBusy(false)
    }
  }

  return (
    <section className="panel">
      <h2>Zakat calculator</h2>
      <p>Estimate Zakat at 2.5% for wealth that meets your chosen Nisab and Hawl criteria. Enter amounts in rupees.</p>
      <form onSubmit={(event) => void calculate(event)}>
        {fields.map(([name, label]) => (
          <p key={name}><label>{label}<input name={name} type="number" min={name === 'nisab' ? '.01' : '0'} max="1000000000" step=".01" required={name === 'nisab'} placeholder={name === 'nisab' ? '' : '0'} /></label></p>
        ))}
        <p><label className="checkbox"><input name="hawl" type="checkbox" /> The applicable lunar-year holding period has passed</label></p>
        <button disabled={busy}>Calculate</button>
      </form>
      {error && <p role="alert">{error}</p>}
      {result && (
        <div className="review-card" aria-live="polite">
          <h3>Estimated Zakat {rupees.format(result.due / 100)}</h3>
          <p>Assets {rupees.format(result.assets / 100)} · Deductions {rupees.format(result.debts / 100)}</p>
          <p>Net zakatable wealth {rupees.format(result.net / 100)} · {result.thresholdReached ? 'Nisab reached' : 'Below Nisab'}</p>
        </div>
      )}
    </section>
  )
}
