import { ArrowUpRight, Calculator, HandHeart, LifeBuoy, LockKeyhole, MapPin, ShieldCheck } from 'lucide-react'
import { Link } from './navigation'

const actions = [
  { path: '/give', name: 'Give Zakat', description: 'Find a verified household and give directly.', Icon: HandHeart },
  { path: '/calculate', name: 'Calculate Zakat', description: 'Estimate your contribution using your Nisab threshold.', Icon: Calculator },
  { path: '/help', name: 'Request support', description: 'Send your request privately and follow the review.', Icon: LifeBuoy },
]

export function Landing({ accountPath }: { accountPath: string }) {
  return (
    <>
      <section className="landing-hero" data-enter>
        <div className="wrap public-wrap hero-grid">
          <div className="hero-copy">
            <h1>Zakat for your community.</h1>
            <p>Find verified households by locality or six-digit PIN code, give directly, or request support privately.</p>
            <div className="hero-actions">
              <Link className="primary-link" href="/give">Give Zakat <ArrowUpRight size={18} aria-hidden="true" /></Link>
              <Link className="action-link" href="/help">Request support</Link>
            </div>
          </div>
          <div className="hero-product" aria-hidden="true">
            <div className="product-window">
              <div className="product-brand"><span className="product-mark">A</span><span>Amanah</span></div>
              <div className="product-content">
                <span className="product-title">Community giving</span>
                <Link className="product-option" href="/give">
                  <MapPin aria-hidden="true" size={20} /><span><strong>Find a household</strong><small>Search by locality or PIN code</small></span><ArrowUpRight size={16} aria-hidden="true" />
                </Link>
                <Link className="product-option" href="/calculate">
                  <Calculator aria-hidden="true" size={20} /><span><strong>Calculate Zakat</strong><small>Estimate your contribution</small></span><ArrowUpRight size={16} aria-hidden="true" />
                </Link>
                <div className="product-verified"><ShieldCheck size={18} aria-hidden="true" /> Requests are reviewed before appearing in search.</div>
              </div>
            </div>
          </div>
        </div>
      </section>
      <section className="landing-overview">
        <div className="wrap public-wrap">
          <h2>Three simple paths.</h2>
          <div className="landing-links">
            {actions.map(({ path, name, description, Icon }) => (
              <Link key={path} href={path}>
                <Icon aria-hidden="true" size={24} />
                <strong>{name}</strong>
                <span>{description}</span>
              </Link>
            ))}
          </div>
        </div>
      </section>
      <section className="landing-privacy">
        <div className="wrap public-wrap">
          <div className="privacy-content">
            <div>
              <h2>Private and verified.</h2>
              <p>Households are reviewed before requests appear in search. Direct transfers go straight to the recipient without intermediary fees.</p>
            </div>
            <div className="privacy-badge"><LockKeyhole size={28} aria-hidden="true" /><span>End-to-end community governance.</span></div>
          </div>
        </div>
      </section>
      <footer className="landing-footer">
        <div className="wrap public-wrap">
          <span>Amanah · Built for verified community giving</span>
          <Link href={accountPath}>Account</Link>
        </div>
      </footer>
    </>
  )
}
