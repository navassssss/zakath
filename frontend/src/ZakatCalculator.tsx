import { useState, type FormEvent } from 'react'
import { API_BASE_URL } from './config/api'
import { ArrowRight } from 'lucide-react'
import { Link } from './navigation'

const fields = [
  ['cash', 'Cash & Bank Balances', 'Liquid savings, bank deposits, and cash in hand'],
  ['metals', 'Gold & Precious Metals', 'Zakatable gold jewellery, coins, bullion & silver'],
  ['business', 'Business Stock & Inventory', 'Wholesale/retail goods held for sale or trade'],
  ['investments', 'Shares & Liquid Investments', 'Mutual funds, marketable securities, dividends'],
  ['debts', 'Eligible Immediate Liabilities', 'Due bills, immediate debts & operational expenses'],
  ['nisab', 'Applicable Nisab Threshold (₹)', 'Minimum wealth threshold (Gold ~₹5,95,000 / Silver ~₹53,550)'],
]

const rupees = new Intl.NumberFormat('en-IN', {
  style: 'currency',
  currency: 'INR',
  maximumFractionDigits: 0,
})

type Result = {
  assets: number
  debts: number
  net: number
  due: number
  thresholdReached: boolean
}

// Framer-style dual-layer text roll helper component
function VxRollText({ text }: { text: string }) {
  return (
    <span className="vx-btn-roll">
      <span className="vx-btn-roll-inner">
        <span className="vx-btn-roll-text">{text}</span>
        <span className="vx-btn-roll-text" aria-hidden="true">{text}</span>
      </span>
    </span>
  )
}

export function ZakatCalculator({ token }: { token?: string | null }) {
  const [result, setResult] = useState<Result | null>(null)
  const [error, setError] = useState('')
  const [busy, setBusy] = useState(false)
  const [nisabPreset, setNisabPreset] = useState<'gold' | 'silver' | 'custom'>('silver')
  const [nisabValue, setNisabValue] = useState<string>('53550')

  function applyPreset(preset: 'gold' | 'silver') {
    setNisabPreset(preset)
    if (preset === 'gold') {
      setNisabValue('595000') // 85 grams gold approx
    } else {
      setNisabValue('53550')  // 595 grams silver approx
    }
  }

  async function calculate(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const form = new FormData(event.currentTarget)
    const amounts = Object.fromEntries(
      fields.map(([name]) => [name, Math.round(Number(form.get(name)) * 100)])
    )
    setError('')
    setResult(null)
    setBusy(true)
    try {
      if (token) {
        const response = await fetch(new URL('/auth/calculator', API_BASE_URL), {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: 'Bearer ' + token,
          },
          body: JSON.stringify({ ...amounts, hawl: form.has('hawl') }),
        })
        if (response.ok) {
          const data = await response.json()
          setResult(data)
          return
        }
      }

      // Client-side Shariah calculation for public calculation & offline resilience
      const cash = amounts['cash'] || 0
      const metals = amounts['metals'] || 0
      const business = amounts['business'] || 0
      const investments = amounts['investments'] || 0
      const debts = amounts['debts'] || 0
      const nisab = amounts['nisab'] || 5355000 // 53,550 in paise
      const hawl = form.has('hawl')

      const assets = cash + metals + business + investments
      const net = Math.max(0, assets - debts)
      const thresholdReached = net >= nisab
      const due = thresholdReached && hawl ? Math.round(net * 0.025) : 0

      setResult({ assets, debts, net, due, thresholdReached })
    } catch (failure) {
      setError(failure instanceof Error ? failure.message : 'Could not calculate Zakat')
    } finally {
      setBusy(false)
    }
  }

  return (
    <section className="panel" style={{ borderRadius: '24px', padding: '32px' }}>
      <div style={{ marginBottom: '28px' }}>
        <span className="status-beacon" style={{ marginBottom: '8px' }}>
          <span className="status-beacon-dot"><span className="status-beacon-ping" /></span>
          Shariah Compliant 2.5% Rate
        </span>
        <h2 style={{ fontSize: '32px', margin: '4px 0 8px', letterSpacing: '-0.02em', fontWeight: 650 }}>
          Precision <span className="vx-serif" style={{ color: 'var(--green)' }}>Zakat calculation</span>.
        </h2>
        <p style={{ color: 'var(--muted)', fontSize: '15px', maxWidth: '640px', margin: 0 }}>
          Calculate your annual Zakat with exact Islamic jurisprudence criteria. Wealth held for one full lunar year (Hawl) above the Nisab threshold is subject to 2.5%.
        </p>
      </div>

      {/* Nisab Standard Selector */}
      <div style={{ background: 'var(--panel-soft)', padding: '18px 20px', borderRadius: '18px', border: '1px solid var(--line)', marginBottom: '28px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px', marginBottom: '12px' }}>
          <div>
            <strong style={{ fontSize: '14px', color: 'var(--ink)' }}>Choose Nisab Standard:</strong>
            <span style={{ fontSize: '12.5px', color: 'var(--muted)', marginLeft: '8px' }}>
              Most scholars recommend Silver Nisab as it benefits more recipients.
            </span>
          </div>
          <div style={{ display: 'flex', gap: '8px' }}>
            <button
              type="button"
              onClick={() => applyPreset('silver')}
              style={{
                padding: '6px 14px',
                borderRadius: '9999px',
                fontSize: '12.5px',
                fontWeight: 600,
                border: nisabPreset === 'silver' ? '1px solid var(--green)' : '1px solid var(--line)',
                background: nisabPreset === 'silver' ? 'var(--green)' : 'var(--panel)',
                color: nisabPreset === 'silver' ? '#fff' : 'var(--ink)',
                cursor: 'pointer',
              }}
            >
              Silver (595g · ₹53,550)
            </button>
            <button
              type="button"
              onClick={() => applyPreset('gold')}
              style={{
                padding: '6px 14px',
                borderRadius: '9999px',
                fontSize: '12.5px',
                fontWeight: 600,
                border: nisabPreset === 'gold' ? '1px solid var(--gold)' : '1px solid var(--line)',
                background: nisabPreset === 'gold' ? 'var(--gold)' : 'var(--panel)',
                color: nisabPreset === 'gold' ? '#fff' : 'var(--ink)',
                cursor: 'pointer',
              }}
            >
              Gold (85g · ₹5,95,000)
            </button>
          </div>
        </div>
      </div>

      <form onSubmit={(event) => void calculate(event)}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '18px', marginBottom: '24px' }}>
          {fields.map(([name, label, desc]) => (
            <div
              key={name}
              style={{
                background: 'var(--panel)',
                padding: '18px 20px',
                borderRadius: '16px',
                border: '1px solid var(--line)',
              }}
            >
              <label style={{ display: 'block', fontSize: '13.5px', fontWeight: 600, color: 'var(--ink)', marginBottom: '4px' }}>
                {label}
              </label>
              <p style={{ margin: '0 0 10px', fontSize: '12px', color: 'var(--muted)', minHeight: '32px' }}>
                {desc}
              </p>
              <div style={{ position: 'relative' }}>
                <span style={{ position: 'absolute', left: '12px', top: '10px', color: 'var(--muted)', fontSize: '14px' }}>₹</span>
                <input
                  name={name}
                  type="number"
                  min={name === 'nisab' ? '.01' : '0'}
                  max="1000000000"
                  step=".01"
                  required={name === 'nisab'}
                  value={name === 'nisab' ? nisabValue : undefined}
                  onChange={name === 'nisab' ? (e) => { setNisabValue(e.target.value); setNisabPreset('custom'); } : undefined}
                  placeholder={name === 'nisab' ? '' : '0'}
                  style={{
                    width: '100%',
                    padding: '8px 12px 8px 28px',
                    borderRadius: '10px',
                    border: '1px solid var(--line)',
                    background: 'var(--panel-soft)',
                    fontSize: '15px',
                    fontFamily: 'var(--font-mono)',
                    outline: 'none',
                    boxSizing: 'border-box',
                  }}
                />
              </div>
            </div>
          ))}
        </div>

        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '16px', padding: '16px 20px', background: 'var(--panel-soft)', borderRadius: '16px', border: '1px solid var(--line)', marginBottom: '24px' }}>
          <label style={{ display: 'flex', alignItems: 'center', gap: '10px', cursor: 'pointer', fontSize: '14px', fontWeight: 500 }}>
            <input
              name="hawl"
              type="checkbox"
              defaultChecked
              style={{ width: '18px', height: '18px', accentColor: 'var(--green)' }}
            />
            The applicable lunar-year holding period (Hawl) has completed for these assets
          </label>
          <button
            disabled={busy}
            style={{
              padding: '12px 28px',
              borderRadius: '9999px',
              background: 'var(--green)',
              color: '#fff',
              border: 'none',
              fontWeight: 600,
              fontSize: '14px',
              cursor: 'pointer',
              boxShadow: '0 4px 14px rgba(14, 92, 72, 0.25)',
            }}
          >
            <VxRollText text={busy ? 'Calculating…' : 'Calculate Zakat'} />
          </button>
        </div>
      </form>

      {error && (
        <p role="alert" style={{ color: '#c53030', background: '#fff5f5', padding: '12px 16px', borderRadius: '12px', fontSize: '14px', marginTop: '16px' }}>
          {error}
        </p>
      )}

      {result && (
        <div
          className="review-card"
          aria-live="polite"
          style={{
            marginTop: '28px',
            padding: '28px',
            borderRadius: '20px',
            background: 'linear-gradient(135deg, #091814 0%, #06080c 100%)',
            border: '1px solid rgba(16, 185, 129, 0.25)',
            color: '#ffffff',
            boxShadow: '0 16px 40px rgba(0, 0, 0, 0.3)',
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '16px', marginBottom: '20px' }}>
            <div>
              <span className="status-beacon" style={{ background: 'rgba(16, 185, 129, 0.15)', borderColor: 'rgba(16, 185, 129, 0.3)', color: '#38ef7d', marginBottom: '10px' }}>
                <span className="status-beacon-dot" style={{ background: '#38ef7d' }}><span className="status-beacon-ping" style={{ background: '#38ef7d' }} /></span>
                {result.thresholdReached ? 'Nisab Threshold Met' : 'Below Nisab Threshold'}
              </span>
              <h3 style={{ fontSize: '16px', margin: '4px 0', color: 'rgba(255, 255, 255, 0.7)', fontWeight: 500 }}>
                Estimated Annual Zakat (2.5%)
              </h3>
              <div className="mono-num" style={{ fontSize: '40px', fontWeight: 700, color: '#38ef7d', letterSpacing: '-0.02em' }}>
                {rupees.format(result.due / 100)}
              </div>
            </div>

            <Link
              href="/give"
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '8px',
                padding: '12px 24px',
                borderRadius: '9999px',
                background: '#38ef7d',
                color: '#06080c',
                textDecoration: 'none',
                fontWeight: 700,
                fontSize: '14px',
                boxShadow: '0 4px 16px rgba(56, 239, 125, 0.35)',
              }}
            >
              <VxRollText text="Fulfill Zakat via Amanah" /> <ArrowRight size={16} />
            </Link>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '16px', paddingTop: '20px', borderTop: '1px solid rgba(255, 255, 255, 0.1)' }}>
            <div>
              <div style={{ fontSize: '12px', color: 'rgba(255, 255, 255, 0.6)', marginBottom: '4px' }}>Gross Zakatable Assets</div>
              <div className="mono-num" style={{ fontSize: '18px', fontWeight: 600 }}>{rupees.format(result.assets / 100)}</div>
            </div>
            <div>
              <div style={{ fontSize: '12px', color: 'rgba(255, 255, 255, 0.6)', marginBottom: '4px' }}>Immediate Deductions</div>
              <div className="mono-num" style={{ fontSize: '18px', fontWeight: 600 }}>{rupees.format(result.debts / 100)}</div>
            </div>
            <div>
              <div style={{ fontSize: '12px', color: 'rgba(255, 255, 255, 0.6)', marginBottom: '4px' }}>Net Zakatable Pool</div>
              <div className="mono-num" style={{ fontSize: '18px', fontWeight: 600, color: '#34d399' }}>{rupees.format(result.net / 100)}</div>
            </div>
          </div>
        </div>
      )}
    </section>
  )
}
