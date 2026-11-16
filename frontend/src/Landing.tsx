import { ArrowUpRight, Calculator, HandHeart, Landmark, LifeBuoy, LockKeyhole, MapPin, ShieldCheck } from 'lucide-react'
import { Link } from './navigation'

const actions = [
  { path: '/give', name: 'Give Zakat', description: 'Find a verified household or give through a Mahallu fund.', Icon: HandHeart },
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
            <p>Find verified households by locality or six-digit PIN code, give through your Mahallu, or request support privately.</p>
            <div className="hero-actions">
              <Link className="primary-link" href="/give">Give Zakat <ArrowUpRight size={18} aria-hidden="true" /></Link>
              <Link className="action-link" href="/help">Request support</Link>
            </div>
          </div>
          <div className="hero-product" data-visual>
            <div className="product-window app-frame">
              <div className="product-brand"><span className="product-mark"><Landmark size={18} aria-hidden="true" /></span>Amanah</div>
              <div className="product-content">
                <strong className="product-title">Choose how to give</strong>
                <Link className="product-option" href="/give">
                  <MapPin aria-hidden="true" size={20} /><span><strong>Find a household</strong><small>Search by locality or PIN code</small></span><ArrowUpRight size={16} aria-hidden="true" />
                </Link>
                <Link className="product-option" href="/give">
                  <Landmark aria-hidden="true" size={20} /><span><strong>Give through your Mahallu</strong><small>Track your contribution and receipt</small></span><ArrowUpRight size={16} aria-hidden="true" />
                </Link>
                <div className="product-verified"><ShieldCheck size={18} aria-hidden="true" /> Requests are reviewed before appearing in search.</div>
              </div>
            </div>
          </div>
        </div>
      </section>
      <section className="landing-overview" id="how-amanah-works">
        <div className="wrap public-wrap workflow-content">
          <h2>How Amanah works</h2>
          <div className="landing-links" data-visual>
            {actions.map(({ path, name, description, Icon }) => (
              <Link key={path} href={path}><Icon aria-hidden="true" /><strong>{name}</strong><span>{description}</span><ArrowUpRight className="workflow-arrow" size={17} aria-hidden="true" /></Link>
            ))}
          </div>
        </div>
      </section>
      <section className="landing-privacy">
        <div className="wrap public-wrap privacy-content">
          <div>
            <h2>Privacy for every household.</h2>
            <p>Applicants choose whether to share their exact income with signed-in givers.</p>
            <Link className="action-link" href={accountPath}>{accountPath === '/login' ? 'Log in to Amanah' : 'Open your account'}</Link>
          </div>
          <dl className="privacy-access" data-visual>
            <div><dt><LockKeyhole size={22} aria-hidden="true" /> Reviewers</dt><dd>See household details and the applicant’s explanation to assess the request.</dd></div>
            <div><dt><ShieldCheck size={22} aria-hidden="true" /> Givers</dt><dd>See approved requests by area, support category, and amount.</dd></div>
          </dl>
        </div>
      </section>
      <footer className="public-wrap landing-footer"><Link className="wordmark" href="/">Amanah</Link><Link href={accountPath}>{accountPath === '/login' ? 'Log in' : 'My account'}</Link></footer>
    </>
  )
}
