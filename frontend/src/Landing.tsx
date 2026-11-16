import { useState } from 'react'
import {
  ArrowRight,
  ArrowUpRight,
  Calculator,
  CheckCircle2,
  HandHeart,
  Landmark,
  LockKeyhole,
  MapPin,
  ShieldCheck,
  Building2,
  HeartHandshake,
  Coins,
  FileText,
  BadgeCheck,
  Scale,
  Sparkles,
} from 'lucide-react'
import { Link } from './navigation'

export function Landing({ accountPath }: { accountPath: string }) {
  // Interactive mini-calculator state on landing page
  const [cash, setCash] = useState<number>(450000)
  const [goldGrams, setGoldGrams] = useState<number>(25)
  const [stock, setStock] = useState<number>(120000)

  // Real-time Nisab calculation constants
  const goldRatePerGram = 6840 // Current Indian gold benchmark per gram
  const nisabThreshold = 85 * goldRatePerGram // 85g gold threshold: ₹5,81,400
  const totalWealth = (Number(cash) || 0) + (Number(goldGrams) || 0) * goldRatePerGram + (Number(stock) || 0)
  const isEligibleForZakat = totalWealth >= nisabThreshold
  const zakatDue = isEligibleForZakat ? Math.round(totalWealth * 0.025) : 0

  return (
    <div className="vx-landing">
      {/* 1. FLOATING PILL NAVIGATION */}
      <div className="vx-nav-wrapper">
        <header className="vx-nav">
          <Link className="vx-brand" href="/">
            <div className="vx-brand-mark" aria-hidden="true">
              <Landmark size={20} />
            </div>
            <div className="vx-brand-text">
              <span className="vx-brand-name">AMANAH</span>
              <span className="vx-brand-tag">Community Zakat</span>
            </div>
          </Link>

          <nav>
            <ul className="vx-nav-links">
              <li><a className="vx-nav-link" href="#how-it-works">How It Works</a></li>
              <li><a className="vx-nav-link" href="#calculator">Nisab Calculator</a></li>
              <li><a className="vx-nav-link" href="#asnaf">8 Asnaf Categories</a></li>
              <li><a className="vx-nav-link" href="#governance">Shariah Governance</a></li>
              <li><a className="vx-nav-link" href="#roles">Community Roles</a></li>
            </ul>
          </nav>

          <div className="vx-nav-actions">
            <Link className="vx-btn vx-btn-ghost" href={accountPath}>
              {accountPath === '/login' ? 'Log In' : 'Dashboard'}
            </Link>
            <Link className="vx-btn vx-btn-primary" href="/give">
              Give Zakat <ArrowUpRight size={15} aria-hidden="true" />
            </Link>
          </div>
        </header>
      </div>

      {/* 2. HERO SECTION */}
      <section className="vx-hero">
        <div className="vx-hero-bg" aria-hidden="true" />
        <div className="vx-container">
          <div style={{ textAlign: 'center' }}>
            <div className="vx-badge-pill">
              <span className="vx-badge-dot" />
              <span>Transparent · Mahallu-Verified · Shariah-Compliant</span>
            </div>
          </div>

          <h1 className="vx-hero-title">
            Your Zakat, <span className="serif">Direct &amp; Dignified</span> by Design.
          </h1>

          <p className="vx-hero-sub">
            Amanah connects conscientious Zakat givers directly with verified, local households in need—with zero intermediary cuts, complete anonymity, and verified Mahallu governance.
          </p>

          <div className="vx-hero-actions">
            <Link className="vx-btn vx-btn-primary" style={{ padding: '0.85rem 1.85rem', fontSize: '1rem' }} href="/give">
              Find Verified Households <ArrowRight size={18} aria-hidden="true" />
            </Link>
            <Link className="vx-btn vx-btn-secondary" style={{ padding: '0.85rem 1.75rem', fontSize: '1rem' }} href="/calculate">
              <Calculator size={18} aria-hidden="true" /> Calculate Your Zakat
            </Link>
            <Link className="vx-btn vx-btn-ghost" style={{ padding: '0.85rem 1.4rem' }} href="/help">
              Request Support Privately
            </Link>
          </div>

          {/* Hero App Mockup Frame (Vaynex Style Mobile Banking/Ledger Frame) */}
          <div className="vx-hero-frame-wrap">
            {/* Floating Trust Chips */}
            <div className="vx-floating-chip vx-chip-top">
              <div className="vx-chip-icon">
                <ShieldCheck size={20} />
              </div>
              <div className="vx-chip-text">
                <strong>100% Direct Giving</strong>
                <span>Zero administrative deduction</span>
              </div>
            </div>

            <div className="vx-floating-chip vx-chip-bottom">
              <div className="vx-chip-icon">
                <Scale size={20} />
              </div>
              <div className="vx-chip-text">
                <strong>Current Gold Nisab</strong>
                <span className="vx-mono">₹5,81,400 (85g Gold Threshold)</span>
              </div>
            </div>

            <div className="vx-hero-frame">
              {/* App Header Bar */}
              <div className="vx-app-header">
                <div className="vx-app-status">
                  <span className="vx-mono" style={{ fontWeight: 700 }}>9:41 AM</span>
                  <span>·</span>
                  <MapPin size={14} color="#72e0b9" />
                  <span style={{ fontWeight: 600 }}>Kozhikode South Mahallu #104</span>
                </div>
                <div className="vx-app-badge">
                  <span>Audited Mahallu</span>
                </div>
              </div>

              {/* Two-Column App Frame Content */}
              <div className="vx-app-grid">
                {/* Left: Fund & Balance Card */}
                <div className="vx-fund-card">
                  <div className="vx-fund-header">
                    <span className="vx-fund-label">Total Verified Mahallu Fund</span>
                    <span className="vx-fund-change vx-mono">+14.2% this quarter</span>
                  </div>
                  <div className="vx-fund-amount vx-mono">₹48,25,000</div>
                  <div style={{ fontSize: '0.82rem', color: '#8dafa4', marginBottom: '1.25rem' }}>
                    100% allocated to 14 verified local families under Asnaf supervision.
                  </div>

                  <div className="vx-fund-actions">
                    <Link className="vx-action-pill" href="/give">
                      <HandHeart size={16} />
                      <span>Give Direct</span>
                    </Link>
                    <Link className="vx-action-pill" href="/calculate">
                      <Calculator size={16} />
                      <span>Calculate</span>
                    </Link>
                    <Link className="vx-action-pill" href="/help">
                      <LockKeyhole size={16} />
                      <span>Request</span>
                    </Link>
                    <a className="vx-action-pill" href="#governance">
                      <BadgeCheck size={16} />
                      <span>Shariah Audit</span>
                    </a>
                  </div>
                </div>

                {/* Right: Live Household Allocation Stream */}
                <div className="vx-feed-card">
                  <div className="vx-feed-head">
                    <span className="vx-feed-title">Live Verified Allocations</span>
                    <span className="vx-mono" style={{ fontSize: '0.72rem', color: '#72e0b9' }}>LIVE LEDGER</span>
                  </div>
                  <div className="vx-feed-list">
                    <div className="vx-feed-item">
                      <div className="vx-feed-info">
                        <div className="vx-feed-name">Widowed Mother with 3 Schoolchildren</div>
                        <div className="vx-feed-meta">
                          <span className="vx-feed-asnaf">Al-Fuqara</span>
                          <span>· Mahallu Verified</span>
                        </div>
                      </div>
                      <div className="vx-feed-amount vx-mono">₹15,000</div>
                    </div>

                    <div className="vx-feed-item">
                      <div className="vx-feed-info">
                        <div className="vx-feed-name">Elderly Patient Dialysis Support</div>
                        <div className="vx-feed-meta">
                          <span className="vx-feed-asnaf">Al-Masakeen</span>
                          <span>· Direct Hospital Rail</span>
                        </div>
                      </div>
                      <div className="vx-feed-amount vx-mono">₹8,500</div>
                    </div>

                    <div className="vx-feed-item">
                      <div className="vx-feed-info">
                        <div className="vx-feed-name">Distressed Artisan Debt Relief</div>
                        <div className="vx-feed-meta">
                          <span className="vx-feed-asnaf">Al-Gharimun</span>
                          <span>· Committee Approved</span>
                        </div>
                      </div>
                      <div className="vx-feed-amount vx-mono">₹25,000</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 3. INFINITE MARQUEE TICKER */}
      <div className="vx-ticker" aria-hidden="true">
        <div className="vx-ticker-track">
          <span className="vx-ticker-item">VERIFIED LOCAL HOUSEHOLDS <span className="vx-ticker-dot" /></span>
          <span className="vx-ticker-item">ZERO PLATFORM COMMISSIONS <span className="vx-ticker-dot" /></span>
          <span className="vx-ticker-item">SCHOLAR-AUDITED GOVERNANCE <span className="vx-ticker-dot" /></span>
          <span className="vx-ticker-item">IMMUTABLE MAHALLU LEDGER <span className="vx-ticker-dot" /></span>
          <span className="vx-ticker-item">100% DIRECT TO BENEFICIARY <span className="vx-ticker-dot" /></span>
          <span className="vx-ticker-item">PRESERVED RECIPIENT DIGNITY <span className="vx-ticker-dot" /></span>
          <span className="vx-ticker-item">NO EXPOSING PHOTOGRAPHS <span className="vx-ticker-dot" /></span>
          <span className="vx-ticker-item">REAL-TIME GOLD NISAB <span className="vx-ticker-dot" /></span>
          {/* Duplicate set for seamless continuous marquee loop */}
          <span className="vx-ticker-item">VERIFIED LOCAL HOUSEHOLDS <span className="vx-ticker-dot" /></span>
          <span className="vx-ticker-item">ZERO PLATFORM COMMISSIONS <span className="vx-ticker-dot" /></span>
          <span className="vx-ticker-item">SCHOLAR-AUDITED GOVERNANCE <span className="vx-ticker-dot" /></span>
          <span className="vx-ticker-item">IMMUTABLE MAHALLU LEDGER <span className="vx-ticker-dot" /></span>
          <span className="vx-ticker-item">100% DIRECT TO BENEFICIARY <span className="vx-ticker-dot" /></span>
          <span className="vx-ticker-item">PRESERVED RECIPIENT DIGNITY <span className="vx-ticker-dot" /></span>
          <span className="vx-ticker-item">NO EXPOSING PHOTOGRAPHS <span className="vx-ticker-dot" /></span>
          <span className="vx-ticker-item">REAL-TIME GOLD NISAB <span className="vx-ticker-dot" /></span>
        </div>
      </div>

      {/* 4. "BY THE NUMBERS" METRICS SECTION */}
      <section className="vx-stats-section" id="metrics">
        <div className="vx-container">
          <span className="vx-section-kicker">BY THE NUMBERS</span>
          <h2 className="vx-section-title">Built for Transparency, Integrity, and Ground Reality.</h2>
          <p className="vx-section-sub">
            From verified household identification to scholar-audited allocations, Amanah brings absolute certainty to your religious obligations.
          </p>

          <div className="vx-stats-grid">
            <div className="vx-stat-card">
              <div className="vx-stat-top">
                <span className="vx-stat-idx">01</span>
                <span className="vx-stat-status"><span className="vx-badge-dot" /> LIVE RAIL</span>
              </div>
              <div>
                <div className="vx-stat-value">100%</div>
                <div className="vx-stat-label">Direct Distribution</div>
                <p className="vx-stat-desc">Zero platform fees or intermediary commission deducted from your contribution.</p>
              </div>
            </div>

            <div className="vx-stat-card">
              <div className="vx-stat-top">
                <span className="vx-stat-idx">02</span>
                <span className="vx-stat-status"><span className="vx-badge-dot" /> VERIFIED</span>
              </div>
              <div>
                <div className="vx-stat-value">1,420+</div>
                <div className="vx-stat-label">Verified Households</div>
                <p className="vx-stat-desc">Families physically assessed across income, living conditions, and emergency healthcare.</p>
              </div>
            </div>

            <div className="vx-stat-card">
              <div className="vx-stat-top">
                <span className="vx-stat-idx">03</span>
                <span className="vx-stat-status"><span className="vx-badge-dot" /> ACTIVE</span>
              </div>
              <div>
                <div className="vx-stat-value">85+</div>
                <div className="vx-stat-label">Registered Mahallus</div>
                <p className="vx-stat-desc">Local mosque committees and elders collaborating on a unified community ledger.</p>
              </div>
            </div>

            <div className="vx-stat-card">
              <div className="vx-stat-top">
                <span className="vx-stat-idx">04</span>
                <span className="vx-stat-status"><span className="vx-badge-dot" /> SHARIAH</span>
              </div>
              <div>
                <div className="vx-stat-value">100%</div>
                <div className="vx-stat-label">Quranic Compliance</div>
                <p className="vx-stat-desc">Every rupee strictly classified under the 8 Quranic Asnaf categories (Surah At-Tawbah 9:60).</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 5. "ONE WORKFLOW" (Vaynex 3-Pillar Section) */}
      <section className="vx-workflow-section" id="how-it-works">
        <div className="vx-container">
          <span className="vx-section-kicker">ONE CONNECTED WORKFLOW</span>
          <h2 className="vx-section-title">Everything You Need. Nothing You Don’t.</h2>
          <p className="vx-section-sub">
            Whether giving, receiving, or administering community funds, Amanah eliminates ambiguity with ground-truth verification.
          </p>

          <div className="vx-workflow-grid">
            <div className="vx-workflow-card">
              <div>
                <div className="vx-workflow-icon">
                  <Building2 size={26} />
                </div>
                <h3>Ground-Level Mahallu Verification</h3>
                <p>
                  No unchecked digital forms. Local Mahallu elders and administrators physically verify household income, family size, medical records, and living conditions before cases are admitted.
                </p>
              </div>
              <Link className="vx-workflow-link" href="/give">
                View verified listings <ArrowUpRight size={16} aria-hidden="true" />
              </Link>
            </div>

            <div className="vx-workflow-card">
              <div>
                <div className="vx-workflow-icon">
                  <ShieldCheck size={26} />
                </div>
                <h3>Anonymized &amp; Dignified Giving</h3>
                <p>
                  Recipients never face the humiliation of public fundraising or exposed photos. Givers search by locality or PIN code and review anonymized, quantified need profiles.
                </p>
              </div>
              <Link className="vx-workflow-link" href="/help">
                Learn about recipient privacy <ArrowUpRight size={16} aria-hidden="true" />
              </Link>
            </div>

            <div className="vx-workflow-card">
              <div>
                <div className="vx-workflow-icon">
                  <Coins size={26} />
                </div>
                <h3>Dual Contribution Rails</h3>
                <p>
                  Choose instant online platform transfers with digital receipts, or hand over cash in-person with a double-handshake digital receipt confirmed by the recipient.
                </p>
              </div>
              <Link className="vx-workflow-link" href="/calculate">
                Calculate your obligation <ArrowUpRight size={16} aria-hidden="true" />
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* 6. INTERACTIVE NISAB CALCULATOR WIDGET */}
      <section className="vx-calc-section" id="calculator">
        <div className="vx-container">
          <div className="vx-calc-box">
            <div className="vx-calc-copy">
              <div className="vx-nisab-pill">
                <Sparkles size={16} />
                <span>Nisab Standard: 85g Gold (₹{goldRatePerGram.toLocaleString()}/g)</span>
              </div>
              <h2>Calculate Your Zakat with Certainty.</h2>
              <p>
                Zakat is due at 2.5% on qualifying wealth held for one full lunar year (Hawl) exceeding the Nisab threshold of ₹{nisabThreshold.toLocaleString()}. Test your estimated contribution right now.
              </p>
              <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
                <Link className="vx-btn vx-btn-primary" href="/calculate">
                  Open Comprehensive Calculator <ArrowRight size={16} aria-hidden="true" />
                </Link>
                <Link className="vx-btn vx-btn-ghost" style={{ color: '#ffffff', borderColor: 'rgba(255,255,255,0.2)' }} href="/give">
                  Give Directly
                </Link>
              </div>
            </div>

            {/* Interactive Widget Box */}
            <div className="vx-calc-widget">
              <div className="vx-calc-input-group">
                <label>Cash &amp; Bank Balances (₹)</label>
                <input
                  type="number"
                  className="vx-calc-input"
                  value={cash || ''}
                  onChange={(e) => setCash(Number(e.target.value))}
                  placeholder="e.g. 200000"
                />
              </div>

              <div className="vx-calc-input-group">
                <label>Gold Holdings (Grams)</label>
                <input
                  type="number"
                  className="vx-calc-input"
                  value={goldGrams || ''}
                  onChange={(e) => setGoldGrams(Number(e.target.value))}
                  placeholder="e.g. 20"
                />
              </div>

              <div className="vx-calc-input-group">
                <label>Business Inventory / Stock (₹)</label>
                <input
                  type="number"
                  className="vx-calc-input"
                  value={stock || ''}
                  onChange={(e) => setStock(Number(e.target.value))}
                  placeholder="e.g. 100000"
                />
              </div>

              <div className="vx-calc-result-box">
                <div>
                  <div className="vx-calc-due-label">
                    {isEligibleForZakat ? 'Total Zakat Due (2.5%)' : 'Net Wealth Below Nisab'}
                  </div>
                  <div style={{ fontSize: '0.75rem', color: '#8dafa4' }}>
                    Total Wealth: ₹{totalWealth.toLocaleString()}
                  </div>
                </div>
                <div className="vx-calc-due-val">
                  {isEligibleForZakat ? `₹${zakatDue.toLocaleString()}` : '₹0'}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 7. THE 8 QURANIC ASNAF CATEGORIES */}
      <section className="vx-asnaf-section" id="asnaf">
        <div className="vx-container">
          <span className="vx-section-kicker">SHARIAH TAXONOMY</span>
          <h2 className="vx-section-title">Strictly Mapped to the 8 Quranic Asnaf.</h2>
          <p className="vx-section-sub">
            Every assistance case admitted onto Amanah is rigorously categorized according to the criteria defined in Surah At-Tawbah (9:60).
          </p>

          <div className="vx-asnaf-grid">
            <div className="vx-asnaf-card">
              <span className="vx-asnaf-tag">Al-Fuqara</span>
              <div className="vx-asnaf-name">The Impoverished</div>
              <p className="vx-asnaf-desc">Individuals without any source of income or property to meet essential sustenance.</p>
            </div>

            <div className="vx-asnaf-card">
              <span className="vx-asnaf-tag">Al-Masakeen</span>
              <div className="vx-asnaf-name">The Destitute</div>
              <p className="vx-asnaf-desc">Households with partial income insufficient to meet essential food, shelter, or critical medical care.</p>
            </div>

            <div className="vx-asnaf-card">
              <span className="vx-asnaf-tag">Al-Gharimun</span>
              <div className="vx-asnaf-name">The Debt-Burdened</div>
              <p className="vx-asnaf-desc">Those facing catastrophic, genuine debts contracted for medical emergencies or necessary survival.</p>
            </div>

            <div className="vx-asnaf-card">
              <span className="vx-asnaf-tag">Ibnus-Sabeel</span>
              <div className="vx-asnaf-name">The Wayfarer</div>
              <p className="vx-asnaf-desc">Stranded students or travelers temporarily cut off from their family and financial support.</p>
            </div>

            <div className="vx-asnaf-card">
              <span className="vx-asnaf-tag">Fi-Sabilillah</span>
              <div className="vx-asnaf-name">In the Cause of Allah</div>
              <p className="vx-asnaf-desc">Education, orphan care, and community welfare initiatives approved under Islamic scholarship.</p>
            </div>

            <div className="vx-asnaf-card">
              <span className="vx-asnaf-tag">Ar-Riqaab</span>
              <div className="vx-asnaf-name">Empowerment</div>
              <p className="vx-asnaf-desc">Liberating struggling breadwinners from coercive predatory lending and bonded traps.</p>
            </div>

            <div className="vx-asnaf-card">
              <span className="vx-asnaf-tag">Amilina Alayha</span>
              <div className="vx-asnaf-name">Zakat Administrators</div>
              <p className="vx-asnaf-desc">Honoring ground workers who collect and audit distributions (Amanah platform charges 0%).</p>
            </div>

            <div className="vx-asnaf-card">
              <span className="vx-asnaf-tag">Mu'allafat al-Qulub</span>
              <div className="vx-asnaf-name">Reconciling Hearts</div>
              <p className="vx-asnaf-desc">Providing solidarity, communal harmony, and emergency relief to vulnerable new converts.</p>
            </div>
          </div>
        </div>
      </section>

      {/* 8. PRIVACY BY DESIGN & GOVERNANCE */}
      <section className="vx-trust-section" id="governance">
        <div className="vx-container">
          <span className="vx-section-kicker">ETHICAL &amp; CONFIDENTIAL</span>
          <h2 className="vx-section-title">Dignity and Protection for Every Household.</h2>
          <p className="vx-section-sub">
            Amanah enforces zero-compromise security so recipients are honored and givers have complete peace of mind.
          </p>

          <div className="vx-trust-grid">
            <div className="vx-trust-card">
              <LockKeyhole size={28} color="#0e5c48" />
              <h4>Quarantined Identity Documents</h4>
              <p>Applicant medical records, identity cards, and family details are visible only to assigned Mahallu verifiers—never published online.</p>
            </div>

            <div className="vx-trust-card">
              <CheckCircle2 size={28} color="#0e5c48" />
              <h4>Dual-Signature Approvals</h4>
              <p>Disbursements require dual-key authorization from the Mahallu committee president and Imam to prevent favoritism.</p>
            </div>

            <div className="vx-trust-card">
              <HeartHandshake size={28} color="#0e5c48" />
              <h4>Double-Handshake Receipts</h4>
              <p>Direct cash or bank disbursements are closed only after digital or SMS verification from the recipient household.</p>
            </div>

            <div className="vx-trust-card">
              <FileText size={28} color="#0e5c48" />
              <h4>Immutable Community Ledger</h4>
              <p>Every rupee contributed, allocated, and disbursed is permanently recorded in an auditable financial trail.</p>
            </div>
          </div>
        </div>
      </section>

      {/* 9. ROLE PATHWAYS */}
      <section className="vx-roles-section" id="roles">
        <div className="vx-container">
          <span className="vx-section-kicker">COMMUNITY ROLES</span>
          <h2 className="vx-section-title">Built for Everyone in Your Mahallu.</h2>
          <p className="vx-section-sub">
            Whether fulfilling your obligation, seeking emergency assistance, or governing your masjid's Baitulmal.
          </p>

          <div className="vx-roles-grid">
            {/* Givers */}
            <div className="vx-role-card featured">
              <div className="vx-role-badge">MOST POPULAR</div>
              <div className="vx-role-header">
                <h3>For Zakat Givers</h3>
                <p>Calculate with certainty and give directly to verified households in your PIN code.</p>
                <ul className="vx-role-features">
                  <li><CheckCircle2 size={16} /> Instant accurate Nisab calculation</li>
                  <li><CheckCircle2 size={16} /> Search verified households by locality</li>
                  <li><CheckCircle2 size={16} /> 100% direct transfer with zero fees</li>
                  <li><CheckCircle2 size={16} /> Receive instant shariah-compliant receipts</li>
                </ul>
              </div>
              <Link className="vx-btn vx-btn-primary" href="/give">
                Give Zakat Directly <ArrowRight size={16} aria-hidden="true" />
              </Link>
            </div>

            {/* Households */}
            <div className="vx-role-card">
              <div className="vx-role-header">
                <h3>For Deserving Families</h3>
                <p>Request support with complete dignity, confidentiality, and prompt committee review.</p>
                <ul className="vx-role-features">
                  <li><CheckCircle2 size={16} /> Zero public exposure or photos</li>
                  <li><CheckCircle2 size={16} /> Assigned to your local Mahallu</li>
                  <li><CheckCircle2 size={16} /> Track case review progress in real time</li>
                  <li><CheckCircle2 size={16} /> Receive direct cash or pharmacy transfers</li>
                </ul>
              </div>
              <Link className="vx-btn vx-btn-secondary" href="/help">
                Request Assistance <ArrowRight size={16} aria-hidden="true" />
              </Link>
            </div>

            {/* Mahallus */}
            <div className="vx-role-card">
              <div className="vx-role-header">
                <h3>For Mahallu Masjids</h3>
                <p>Digitize your community Baitulmal, eliminate duplications, and manage verified rosters.</p>
                <ul className="vx-role-features">
                  <li><CheckCircle2 size={16} /> Unified Mahallu member directory</li>
                  <li><CheckCircle2 size={16} /> Eligibility review &amp; delegation workflow</li>
                  <li><CheckCircle2 size={16} /> Committee collection &amp; disbursement ledger</li>
                  <li><CheckCircle2 size={16} /> Eradicate poverty through local coordination</li>
                </ul>
              </div>
              <Link className="vx-btn vx-btn-secondary" href="/login">
                Mahallu Committee Access <ArrowRight size={16} aria-hidden="true" />
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* 10. FINAL CALL TO ACTION */}
      <section className="vx-cta-section">
        <div className="vx-container">
          <div className="vx-badge-pill">
            <span className="vx-badge-dot" />
            <span>START TODAY</span>
          </div>
          <h2 className="vx-cta-title">
            Bring <span className="serif">Barakah</span> to Your Wealth and Dignity to Your Community.
          </h2>
          <p className="vx-cta-sub">
            Join thousands of givers and dozens of Mahallus using Amanah to fulfill Zakat as it was intended: direct, transparent, and transformative.
          </p>

          <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center', flexWrap: 'wrap' }}>
            <Link className="vx-btn vx-btn-primary" style={{ padding: '0.9rem 2rem', fontSize: '1rem' }} href="/give">
              Find Verified Households <ArrowRight size={18} aria-hidden="true" />
            </Link>
            <Link className="vx-btn vx-btn-secondary" style={{ padding: '0.9rem 1.8rem', fontSize: '1rem' }} href="/calculate">
              Calculate Nisab
            </Link>
          </div>
        </div>
      </section>

      {/* 11. FOOTER */}
      <footer className="vx-footer">
        <div className="vx-container">
          <div className="vx-footer-grid">
            <div className="vx-footer-brand">
              <h4>
                <Landmark size={22} color="#38ef7d" /> AMANAH
              </h4>
              <p>
                A community-driven Zakat management platform connecting Zakat givers, eligible recipients, and local Mahallus through a transparent, verified system.
              </p>
              <div style={{ fontSize: '0.8rem', color: '#8dafa4' }}>
                Dedicated to poverty alleviation, recipient dignity, and absolute Shariah compliance.
              </div>
            </div>

            <div className="vx-footer-col">
              <h5>Platform</h5>
              <ul>
                <li><Link href="/give">Give Zakat</Link></li>
                <li><Link href="/calculate">Zakat Calculator</Link></li>
                <li><Link href="/help">Request Support</Link></li>
                <li><Link href="/dashboard">Community Dashboard</Link></li>
              </ul>
            </div>

            <div className="vx-footer-col">
              <h5>Governance</h5>
              <ul>
                <li><a href="#asnaf">8 Quranic Asnaf</a></li>
                <li><a href="#governance">Shariah Verification</a></li>
                <li><a href="#how-it-works">Mahallu Inspection</a></li>
                <li><a href="#metrics">Direct Rail Audit</a></li>
              </ul>
            </div>

            <div className="vx-footer-col">
              <h5>Community</h5>
              <ul>
                <li><Link href={accountPath}>Mahallu Directory</Link></li>
                <li><Link href="/login">Committee Access</Link></li>
                <li><a href="#calculator">Nisab Standards</a></li>
                <li><Link href="/help">Eligibility Guide</Link></li>
              </ul>
            </div>

            <div className="vx-footer-col">
              <h5>Account</h5>
              <ul>
                <li><Link href="/login">Sign In</Link></li>
                <li><Link href="/login">Register Mahallu</Link></li>
                <li><Link href={accountPath}>My Profile</Link></li>
              </ul>
            </div>
          </div>

          <div className="vx-footer-bottom">
            <div>© {new Date().getFullYear()} AMANAH Zakat Platform. All rights reserved.</div>
            <div>Built for the Ummah · Zero Administrative Cut · Direct Community Impact</div>
          </div>
        </div>
      </footer>
    </div>
  )
}
