import React, { useState, useEffect } from 'react'
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
  X,
  Check,
  Send,
  Activity,
} from 'lucide-react'
import { Link } from './navigation'

// Helper component for Framer-style dual-layer text roll button animation
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

export function Landing({ accountPath }: { accountPath: string }) {
  // 1. Appear on scroll IntersectionObserver
  useEffect(() => {
    const elements = document.querySelectorAll('[data-vx-appear]')
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('is-visible')
          }
        })
      },
      { threshold: 0.1, rootMargin: '0px 0px -40px 0px' }
    )
    elements.forEach((el) => observer.observe(el))
    return () => observer.disconnect()
  }, [])

  // 2. Hero Interactive Mobile Frame Mode Switcher
  const [heroMode, setHeroMode] = useState<'give' | 'calc' | 'request' | 'audit'>('give')

  // 3. Mini-Calculator inside Hero Frame
  const [heroGoldGrams, setHeroGoldGrams] = useState<number>(30)
  const [heroCash, setHeroCash] = useState<number>(350000)

  // 4. Main Nisab Calculator State
  const [cash, setCash] = useState<number>(450000)
  const [goldGrams, setGoldGrams] = useState<number>(25)
  const [stock, setStock] = useState<number>(120000)

  // Real-time Nisab calculation constants
  const goldRatePerGram = 6840 // Indian gold benchmark per gram
  const nisabThreshold = 85 * goldRatePerGram // 85g gold = ₹5,81,400
  const totalWealth = (Number(cash) || 0) + (Number(goldGrams) || 0) * goldRatePerGram + (Number(stock) || 0)
  const isEligibleForZakat = totalWealth >= nisabThreshold
  const zakatDue = isEligibleForZakat ? Math.round(totalWealth * 0.025) : 0
  const wealthProgress = Math.min(100, Math.round((totalWealth / nisabThreshold) * 100))

  // 5. Interactive 3-Tab Impact Section State (Vaynex Breakdown / Portfolio / Markets)
  const [impactTab, setImpactTab] = useState<'breakdown' | 'portfolio' | 'network'>('breakdown')

  // 6. Interactive 8 Quranic Asnaf Detail Drawer State
  const [selectedAsnaf, setSelectedAsnaf] = useState<number>(0)

  const asnafDetails = [
    {
      arabic: 'Al-Fuqara (The Impoverished)',
      tag: 'Category 01',
      desc: 'Individuals and households whose total income and assets do not reach even 50% of basic life sustenance (food, shelter, basic clothing).',
      checklist: ['Verified zero regular income or breadwinner disability', 'Physical residence inspection by Mahallu committee', 'Government BPL/AAY ration tier cross-reference', 'Zero financial support from legal heirs'],
      sample: 'Widowed mother of three school-aged children with zero agricultural land or pension support in Kozhikode South #104.'
    },
    {
      arabic: 'Al-Masakeen (The Destitute)',
      tag: 'Category 02',
      desc: 'Households with partial income or low wages that fall short of covering critical recurring living and medical expenses.',
      checklist: ['Monthly wage slips or day-labor register check', 'High-cost recurring medical bills (dialysis, chemotherapy)', 'Rent agreement and overdue utility notices verification', 'Quarterly re-assessment by local Baitulmal elders'],
      sample: 'Daily-wage carpenter undergoing chronic renal dialysis requiring ₹8,500 monthly medical copay in Ernakulam West #071.'
    },
    {
      arabic: 'Al-Gharimun (The Debt-Burdened)',
      tag: 'Category 03',
      desc: 'Individuals burdened by genuine debts contracted for permissible necessities—such as emergency hospitalization, catastrophic loss, or basic survival.',
      checklist: ['Creditor verification & hospital billing audit', 'Exclusion of speculative, luxury, or interest-accruing debts', 'Direct settlement paid directly to creditor/hospital rail', 'Committee dual-signature before disbursement'],
      sample: 'Small artisan whose workshop suffered flash-flood destruction, facing immediate distributor distress debt of ₹25,000.'
    },
    {
      arabic: 'Ibnus-Sabeel (The Wayfarer)',
      tag: 'Category 04',
      desc: 'Stranded travelers or migrant students who are cut off from their family resources, regardless of their financial standing back home.',
      checklist: ['Proof of travel or enrolled institutional study', 'Immediate stranded necessity verification', 'Direct ticket, hostel, or emergency subsistence grant', 'Emergency one-time disbursement within 2 hours'],
      sample: 'Out-of-state nursing student whose family in Assam lost their livelihood due to landslides, facing immediate college hostel eviction.'
    },
    {
      arabic: 'Fi-Sabilillah (In the Cause of Allah)',
      tag: 'Category 05',
      desc: 'Community educational, moral, and welfare institutions dedicated to safeguarding Islamic knowledge, orphan education, and community flourishing.',
      checklist: ['Registered non-profit or waqf recognition', 'Curriculum and faculty scholar board audit', 'Transparent student sponsorship accounting', 'Zero administrative diversion guarantee'],
      sample: 'Community scholarship fund providing free books and transport for 45 orphaned children across rural Malappuram.'
    },
    {
      arabic: 'Ar-Riqaab (Empowerment & Liberation)',
      tag: 'Category 06',
      desc: 'Liberating vulnerable workers and families trapped in coercive bonded labor, predatory moneylender servitude, or illegal wage confiscation.',
      checklist: ['Legal grievance or social worker report', 'Moneylender dispute settlement mediation', 'Immediate release and dignified livelihood rehabilitation grant', 'Follow-up protection by local community panchayat'],
      sample: 'Agricultural laborer trapped under hereditary illegal debt with predatory interest, liberated and provided independent handloom tools.'
    },
    {
      arabic: 'Amilina Alayha (Zakat Administrators)',
      tag: 'Category 07',
      desc: 'Workers and scholars appointed by the community to collect, audit, and distribute Zakat funds. Amanah platform charges 0.00% fee; this category sustains local ground field verifiers.',
      checklist: ['Official appointment by Mahallu Shura', 'Logbook of household physical inspections', 'Transparent stipend determined by community elders', 'Zero commission-based or percentage incentives'],
      sample: 'Two full-time community field caseworkers auditing living conditions and updating the digital ledger for 85 registered families.'
    },
    {
      arabic: 'Mu\'allafat al-Qulub (Reconciling Hearts)',
      tag: 'Category 08',
      desc: 'Providing emotional solidarity, social security, and economic assistance to recent converts facing family boycott, eviction, or sudden destitution.',
      checklist: ['Confidential counselor interview', 'Emergency transitional housing assistance', 'Vocational training and community mentorship pairing', 'Absolute privacy protection from public exposure'],
      sample: 'New convert evicted from family home, provided 6 months dignified rental assistance and vocational tailoring apprenticeship.'
    }
  ]

  // 7. Shariah AI Copilot State (Vaynex Intelligence Style)
  const copilotQA = [
    {
      q: 'Can Zakat be given to close relatives?',
      a: 'Yes, according to classical jurisprudence (Hanafi, Shafi\'i, Maliki, Hanbali), Zakat can be given to needy relatives such as siblings, aunts, uncles, and cousins—provided they are not your direct dependents (parents, grandparents, children, or spouse). In fact, the Prophet (ﷺ) stated that giving to needy relatives doubles the spiritual reward: one for charity and one for upholding kinship ties (Sunan at-Tirmidhi 658).',
      citation: 'Surah At-Tawbah 9:60 · Tirmidhi 658 · Shafi\'i Kitab al-Umm'
    },
    {
      q: 'Is Zakat due on personal residential property?',
      a: 'No. Zakat is not due on assets used for personal living, including your primary residence, personal vehicle, household furniture, clothing, and primary tools of trade. Zakat only applies to wealth classified as growing or liquid wealth (Amwal Namiyah)—such as cash balances, physical gold, silver, tradable business stock, and liquid investments held for one full lunar year.',
      citation: 'AAOIFI Shariah Standard No. 35 · Fiqh Academy Resolution #42'
    },
    {
      q: 'How is Nisab calculated on mixed gold, cash, and trade assets?',
      a: 'When you possess multiple qualifying asset types (e.g., cash, gold ornaments above personal use, and trade inventory), their cumulative monetary value is combined. If the total equals or exceeds the value of 85 grams of 24k gold (or 595 grams of silver depending on school) and has remained above threshold for one lunar year (Hawl), 2.5% is due on the full amount.',
      citation: 'Nisab Benchmark: 85g Gold (₹5,81,400) · Contemporary Consensus'
    },
    {
      q: 'Can Zakat settle emergency medical debts for neighbors?',
      a: 'Yes, directly under the Quranic category of Al-Gharimun (The Debt-Burdened, Surah At-Tawbah 9:60). Needy individuals who contracted debts for essential life necessities, emergency surgical procedures, or survival qualify directly. Amanah enables direct hospital payment rails to eliminate fraud while honoring recipient dignity.',
      citation: 'Surah At-Tawbah 9:60 · Kuwait Zakat House Guidelines'
    }
  ]

  const [activeCopilotIdx, setActiveCopilotIdx] = useState<number>(0)
  const [copilotInput, setCopilotInput] = useState<string>('')
  const [customReply, setCustomReply] = useState<string | null>(null)

  const handleCopilotSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!copilotInput.trim()) return
    setCustomReply(
      `Under classical Shariah principles, questions regarding "${copilotInput}" are evaluated against the 8 Asnaf categories (Surah At-Tawbah 9:60) and the condition of Tamleek (direct ownership transfer). Amanah verifies every disbursement through local Mahallu scholar boards to guarantee complete compliance.`
    )
  }

  // 8. Direct Transfer Simulation Modal State
  const [transferModal, setTransferModal] = useState<{
    open: boolean
    householdName: string
    asnafCategory: string
    targetAmount: number
    suggestedAmount: number
    completed: boolean
  }>({
    open: false,
    householdName: '',
    asnafCategory: '',
    targetAmount: 0,
    suggestedAmount: 2500,
    completed: false
  })

  const openTransferModal = (name: string, asnaf: string, target: number) => {
    setTransferModal({
      open: true,
      householdName: name,
      asnafCategory: asnaf,
      targetAmount: target,
      suggestedAmount: Math.min(target, 5000),
      completed: false
    })
  }

  const handleExecuteTransfer = () => {
    setTransferModal((prev) => ({ ...prev, completed: true }))
    setTimeout(() => {
      // Auto close after 2.5s
      setTransferModal((prev) => ({ ...prev, open: false, completed: false }))
    }, 2800)
  }

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
              <li><a className="vx-nav-link" href="#impact">Live Ledger</a></li>
              <li><a className="vx-nav-link" href="#calculator">Nisab Calculator</a></li>
              <li><a className="vx-nav-link" href="#copilot">Shariah AI</a></li>
              <li><a className="vx-nav-link" href="#asnaf">8 Asnaf Categories</a></li>
              <li><a className="vx-nav-link" href="#governance">Governance</a></li>
            </ul>
          </nav>

          <div className="vx-nav-actions">
            <Link className="vx-btn vx-btn-ghost" href={accountPath}>
              <VxRollText text={accountPath === '/login' ? 'Log In' : 'Dashboard'} />
            </Link>
            <Link className="vx-btn vx-btn-primary" href="/give">
              <VxRollText text="Give Zakat" />
              <ArrowUpRight size={15} aria-hidden="true" />
            </Link>
          </div>
        </header>
      </div>

      {/* 2. HERO SECTION */}
      <section className="vx-hero">
        <div className="vx-hero-bg" aria-hidden="true" />
        <div className="vx-container">
          <div style={{ textAlign: 'center' }}>
            <div className="vx-badge-pill" data-vx-appear>
              <span className="vx-badge-dot" />
              <span>Transparent · Mahallu-Verified · Shariah-Compliant</span>
            </div>
          </div>

          <h1 className="vx-hero-title" data-vx-appear data-vx-delay="100">
            Your Zakat, <span className="serif">Direct &amp; Dignified</span> by Design.
          </h1>

          <p className="vx-hero-sub" data-vx-appear data-vx-delay="200">
            Amanah connects conscientious Zakat givers directly with verified, local households in need—with zero intermediary cuts, complete anonymity, and verified Mahallu governance.
          </p>

          <div className="vx-hero-actions" data-vx-appear data-vx-delay="300">
            <Link className="vx-btn vx-btn-primary" style={{ padding: '0.9rem 2rem', fontSize: '1.02rem' }} href="/give">
              <VxRollText text="Find Verified Households" />
              <ArrowRight size={18} aria-hidden="true" />
            </Link>
            <Link className="vx-btn vx-btn-secondary" style={{ padding: '0.9rem 1.85rem', fontSize: '1.02rem' }} href="/calculate">
              <Calculator size={18} aria-hidden="true" />
              <VxRollText text="Calculate Your Zakat" />
            </Link>
            <Link className="vx-btn vx-btn-ghost" style={{ padding: '0.9rem 1.5rem' }} href="/help">
              <VxRollText text="Request Support Privately" />
            </Link>
          </div>

          {/* Hero App Mockup Frame (Vaynex Style Multi-Layered UI Frame with Live Action Tabs) */}
          <div className="vx-hero-frame-wrap" data-vx-appear data-vx-delay="400">
            {/* Floating Trust Chips with Keyframe Levitation */}
            <div className="vx-floating-chip vx-chip-top">
              <div className="vx-chip-icon">
                <ShieldCheck size={20} />
              </div>
              <div className="vx-chip-text">
                <strong>100% Direct Giving</strong>
                <span>Zero administrative deductions</span>
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
                  <span className="vx-mono" style={{ fontWeight: 700, color: '#38ef7d' }}>LIVE RAIL</span>
                  <span>·</span>
                  <MapPin size={14} color="#72e0b9" />
                  <span style={{ fontWeight: 600 }}>Kozhikode South Mahallu #104</span>
                </div>
                <div className="vx-app-badge">
                  <BadgeCheck size={14} />
                  <span>Audited Mahallu</span>
                </div>
              </div>

              {/* Two-Column App Frame Content */}
              <div className="vx-app-grid">
                {/* Left: Fund & Balance Card with Interactive Action Pills */}
                <div className="vx-fund-card">
                  <div>
                    <div className="vx-fund-header">
                      <span className="vx-fund-label">Total Verified Mahallu Fund</span>
                      <span className="vx-fund-change vx-mono">+14.2% this quarter</span>
                    </div>
                    <div className="vx-fund-amount vx-mono">₹48,25,000</div>
                    <div style={{ fontSize: '0.84rem', color: '#8dafa4', lineHeight: 1.5 }}>
                      100% allocated to 14 verified local families under strict Asnaf supervision.
                    </div>
                  </div>

                  {/* 4 Interactive Action Tabs */}
                  <div>
                    <div style={{ fontSize: '0.72rem', color: '#8dafa4', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '0.5rem', fontWeight: 700 }}>
                      Choose Action Mode:
                    </div>
                    <div className="vx-fund-actions">
                      <button
                        type="button"
                        className={`vx-action-pill ${heroMode === 'give' ? 'active' : ''}`}
                        onClick={() => setHeroMode('give')}
                      >
                        <HandHeart size={16} />
                        <span>Give Direct</span>
                      </button>
                      <button
                        type="button"
                        className={`vx-action-pill ${heroMode === 'calc' ? 'active' : ''}`}
                        onClick={() => setHeroMode('calc')}
                      >
                        <Calculator size={16} />
                        <span>Quick Nisab</span>
                      </button>
                      <button
                        type="button"
                        className={`vx-action-pill ${heroMode === 'request' ? 'active' : ''}`}
                        onClick={() => setHeroMode('request')}
                      >
                        <LockKeyhole size={16} />
                        <span>Apply Aid</span>
                      </button>
                      <button
                        type="button"
                        className={`vx-action-pill ${heroMode === 'audit' ? 'active' : ''}`}
                        onClick={() => setHeroMode('audit')}
                      >
                        <BadgeCheck size={16} />
                        <span>Audit Seal</span>
                      </button>
                    </div>
                  </div>
                </div>

                {/* Right: Dynamic Interactive Content based on chosen Mode */}
                <div className="vx-feed-card">
                  {heroMode === 'give' && (
                    <>
                      <div className="vx-feed-head">
                        <span className="vx-feed-title">Live Verified Allocations</span>
                        <span className="vx-mono" style={{ fontSize: '0.72rem', color: '#38ef7d' }}>CLICK TO GIVE</span>
                      </div>
                      <div className="vx-feed-list">
                        <div
                          className="vx-feed-item"
                          onClick={() => openTransferModal('Widowed Mother with 3 Schoolchildren', 'Al-Fuqara', 15000)}
                        >
                          <div className="vx-feed-info">
                            <div className="vx-feed-name">Widowed Mother with 3 Schoolchildren</div>
                            <div className="vx-feed-meta">
                              <span className="vx-feed-asnaf">Al-Fuqara</span>
                              <span>· Mahallu Verified</span>
                            </div>
                          </div>
                          <div className="vx-feed-right">
                            <div className="vx-feed-amount vx-mono">₹15,000</div>
                            <button type="button" className="vx-feed-give-btn">Give</button>
                          </div>
                        </div>

                        <div
                          className="vx-feed-item"
                          onClick={() => openTransferModal('Elderly Patient Dialysis Support', 'Al-Masakeen', 8500)}
                        >
                          <div className="vx-feed-info">
                            <div className="vx-feed-name">Elderly Patient Dialysis Support</div>
                            <div className="vx-feed-meta">
                              <span className="vx-feed-asnaf">Al-Masakeen</span>
                              <span>· Direct Hospital Rail</span>
                            </div>
                          </div>
                          <div className="vx-feed-right">
                            <div className="vx-feed-amount vx-mono">₹8,500</div>
                            <button type="button" className="vx-feed-give-btn">Give</button>
                          </div>
                        </div>

                        <div
                          className="vx-feed-item"
                          onClick={() => openTransferModal('Distressed Artisan Flood Debt Relief', 'Al-Gharimun', 25000)}
                        >
                          <div className="vx-feed-info">
                            <div className="vx-feed-name">Distressed Artisan Debt Relief</div>
                            <div className="vx-feed-meta">
                              <span className="vx-feed-asnaf">Al-Gharimun</span>
                              <span>· Committee Approved</span>
                            </div>
                          </div>
                          <div className="vx-feed-right">
                            <div className="vx-feed-amount vx-mono">₹25,000</div>
                            <button type="button" className="vx-feed-give-btn">Give</button>
                          </div>
                        </div>
                      </div>
                    </>
                  )}

                  {heroMode === 'calc' && (
                    <div>
                      <div className="vx-feed-head">
                        <span className="vx-feed-title">Quick Gold Nisab Estimator</span>
                        <span className="vx-mono" style={{ fontSize: '0.72rem', color: '#72e0b9' }}>85g GOLD BENCHMARK</span>
                      </div>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.9rem' }}>
                        <div>
                          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.78rem', color: '#a3c2b8', marginBottom: '0.3rem' }}>
                            <span>Gold Holdings:</span>
                            <span className="vx-mono" style={{ color: '#ffffff', fontWeight: 700 }}>{heroGoldGrams} grams</span>
                          </div>
                          <input
                            type="range"
                            min="0"
                            max="150"
                            value={heroGoldGrams}
                            onChange={(e) => setHeroGoldGrams(Number(e.target.value))}
                            style={{ width: '100%', accentColor: '#38ef7d', cursor: 'pointer' }}
                          />
                        </div>

                        <div>
                          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.78rem', color: '#a3c2b8', marginBottom: '0.3rem' }}>
                            <span>Liquid Cash &amp; Bank:</span>
                            <span className="vx-mono" style={{ color: '#ffffff', fontWeight: 700 }}>₹{heroCash.toLocaleString()}</span>
                          </div>
                          <input
                            type="range"
                            min="0"
                            max="1000000"
                            step="25000"
                            value={heroCash}
                            onChange={(e) => setHeroCash(Number(e.target.value))}
                            style={{ width: '100%', accentColor: '#38ef7d', cursor: 'pointer' }}
                          />
                        </div>

                        {(() => {
                          const quickTotal = heroCash + heroGoldGrams * goldRatePerGram
                          const quickEligible = quickTotal >= nisabThreshold
                          const quickDue = quickEligible ? Math.round(quickTotal * 0.025) : 0
                          return (
                            <div style={{ background: 'rgba(42, 143, 114, 0.25)', border: '1px solid rgba(42,143,114,0.4)', borderRadius: '12px', padding: '0.85rem 1rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                              <div>
                                <div style={{ fontSize: '0.75rem', color: '#a3c2b8' }}>
                                  {quickEligible ? 'Estimated Zakat Due (2.5%)' : 'Net Wealth Below Nisab'}
                                </div>
                                <div style={{ fontSize: '0.72rem', color: '#72e0b9' }}>
                                  Total: ₹{quickTotal.toLocaleString()}
                                </div>
                              </div>
                              <div className="vx-mono" style={{ fontSize: '1.25rem', fontWeight: 800, color: '#38ef7d' }}>
                                {quickEligible ? `₹${quickDue.toLocaleString()}` : '₹0'}
                              </div>
                            </div>
                          )
                        })()}

                        <Link className="vx-btn vx-btn-primary" style={{ width: '100%', padding: '0.55rem', fontSize: '0.8rem' }} href="/calculate">
                          <VxRollText text="Open Full Zakat Calculator" />
                        </Link>
                      </div>
                    </div>
                  )}

                  {heroMode === 'request' && (
                    <div>
                      <div className="vx-feed-head">
                        <span className="vx-feed-title">Confidential Aid Application</span>
                        <span className="vx-mono" style={{ fontSize: '0.72rem', color: '#72e0b9' }}>100% PRIVATE</span>
                      </div>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', fontSize: '0.82rem', color: '#c2dbd2' }}>
                        <div style={{ background: 'rgba(255,255,255,0.04)', padding: '0.75rem', borderRadius: '10px', border: '1px solid rgba(255,255,255,0.08)' }}>
                          <strong style={{ color: '#ffffff', display: 'block' }}>Zero Public Exposure:</strong>
                          No photos or humiliating campaigns. Your application is reviewed only by local registered committee elders.
                        </div>
                        <div style={{ background: 'rgba(255,255,255,0.04)', padding: '0.75rem', borderRadius: '10px', border: '1px solid rgba(255,255,255,0.08)' }}>
                          <strong style={{ color: '#ffffff', display: 'block' }}>Direct Medical &amp; Ration Rails:</strong>
                          Disbursements can be delivered directly to local pharmacies, clinics, or in dignified sealed envelopes.
                        </div>
                        <Link className="vx-btn vx-btn-secondary" style={{ width: '100%', padding: '0.55rem', fontSize: '0.8rem', marginTop: '0.25rem' }} href="/help">
                          <VxRollText text="Submit Private Assistance Request" />
                        </Link>
                      </div>
                    </div>
                  )}

                  {heroMode === 'audit' && (
                    <div>
                      <div className="vx-feed-head">
                        <span className="vx-feed-title">Scholar Audit Certification</span>
                        <span className="vx-mono" style={{ fontSize: '0.72rem', color: '#38ef7d' }}>CERTIFIED</span>
                      </div>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', fontSize: '0.82rem', color: '#c2dbd2' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#ffffff' }}>
                          <CheckCircle2 size={16} color="#38ef7d" />
                          <span>Fatwa Board Resolution #418/2025</span>
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#ffffff' }}>
                          <CheckCircle2 size={16} color="#38ef7d" />
                          <span>Strict Tamleek (Ownership Transfer) Verified</span>
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#ffffff' }}>
                          <CheckCircle2 size={16} color="#38ef7d" />
                          <span>0.00% Platform Fee / Zero Intermediary Cut</span>
                        </div>
                        <div style={{ background: 'rgba(42, 143, 114, 0.2)', padding: '0.65rem 0.85rem', borderRadius: '8px', fontSize: '0.75rem', color: '#72e0b9', marginTop: '0.25rem' }}>
                          "Every rupee given directly satisfies the strict Quranic mandate of Surah At-Tawbah (9:60)."
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 3. INFINITE MARQUEE TICKER (Smooth Framer Physics with Pause on Hover) */}
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
          <span className="vx-section-kicker" data-vx-appear>BY THE NUMBERS</span>
          <h2 className="vx-section-title" data-vx-appear data-vx-delay="100">Built for Transparency, Integrity, and Ground Reality.</h2>
          <p className="vx-section-sub" data-vx-appear data-vx-delay="200">
            From verified household identification to scholar-audited allocations, Amanah brings absolute certainty to your religious obligations.
          </p>

          <div className="vx-stats-grid">
            <div className="vx-stat-card" data-vx-appear data-vx-delay="100">
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

            <div className="vx-stat-card" data-vx-appear data-vx-delay="200">
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

            <div className="vx-stat-card" data-vx-appear data-vx-delay="300">
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

            <div className="vx-stat-card" data-vx-appear data-vx-delay="400">
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
          <span className="vx-section-kicker" data-vx-appear>ONE CONNECTED WORKFLOW</span>
          <h2 className="vx-section-title" data-vx-appear data-vx-delay="100">Everything You Need. Nothing You Don’t.</h2>
          <p className="vx-section-sub" data-vx-appear data-vx-delay="200">
            Whether giving, receiving, or administering community funds, Amanah eliminates ambiguity with ground-truth verification.
          </p>

          <div className="vx-workflow-grid">
            <div className="vx-workflow-card" data-vx-appear data-vx-delay="150">
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

            <div className="vx-workflow-card" data-vx-appear data-vx-delay="250">
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

            <div className="vx-workflow-card" data-vx-appear data-vx-delay="350">
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

      {/* 6. INTERACTIVE 3-TAB IMPACT SECTION (VAYNEX STYLE: BREAKDOWN | PORTFOLIO | MARKETS) */}
      <section className="vx-impact-section" id="impact">
        <div className="vx-container">
          <div style={{ textAlign: 'center' }}>
            <span className="vx-section-kicker" data-vx-appear>REAL-TIME COMMUNITY LEDGER</span>
            <h2 className="vx-section-title" style={{ maxWidth: '24ch', margin: '0 auto 1rem' }} data-vx-appear data-vx-delay="100">
              See Exactly Where Every Paisa Goes.
            </h2>
            <p className="vx-section-sub" style={{ margin: '0 auto 2.5rem' }} data-vx-appear data-vx-delay="200">
              Toggle between Quranic category allocations, active emergency relief portfolios, and Mahallu network metrics.
            </p>

            {/* Interactive Tab Switcher */}
            <div className="vx-tab-bar" data-vx-appear data-vx-delay="250">
              <button
                type="button"
                className={`vx-tab-btn ${impactTab === 'breakdown' ? 'active' : ''}`}
                onClick={() => setImpactTab('breakdown')}
              >
                <Coins size={16} />
                <span>Asnaf Breakdown</span>
              </button>
              <button
                type="button"
                className={`vx-tab-btn ${impactTab === 'portfolio' ? 'active' : ''}`}
                onClick={() => setImpactTab('portfolio')}
              >
                <Activity size={16} />
                <span>Relief Portfolio</span>
              </button>
              <button
                type="button"
                className={`vx-tab-btn ${impactTab === 'network' ? 'active' : ''}`}
                onClick={() => setImpactTab('network')}
              >
                <Building2 size={16} />
                <span>Mahallu Network</span>
              </button>
            </div>
          </div>

          {/* Tab Pane 1: Asnaf Breakdown */}
          {impactTab === 'breakdown' && (
            <div className="vx-tab-card" data-vx-appear>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '2rem' }}>
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 700, fontSize: '0.95rem' }}>
                    <span>Al-Fuqara (The Impoverished)</span>
                    <span className="vx-mono" style={{ color: '#0e5c48' }}>₹16,40,500 (34%)</span>
                  </div>
                  <div className="vx-progress-bar-wrap">
                    <div className="vx-progress-fill" style={{ width: '34%' }} />
                  </div>
                  <p style={{ fontSize: '0.82rem', color: '#5f706a', margin: 0 }}>Basic sustenance and emergency shelter for households under 50% basic poverty line.</p>
                </div>

                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 700, fontSize: '0.95rem' }}>
                    <span>Al-Masakeen (The Destitute)</span>
                    <span className="vx-mono" style={{ color: '#0e5c48' }}>₹13,51,000 (28%)</span>
                  </div>
                  <div className="vx-progress-bar-wrap">
                    <div className="vx-progress-fill" style={{ width: '28%' }} />
                  </div>
                  <p style={{ fontSize: '0.82rem', color: '#5f706a', margin: 0 }}>Dialysis, surgery copays, and chronic medicine supplies for struggling low-wage earners.</p>
                </div>

                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 700, fontSize: '0.95rem' }}>
                    <span>Al-Gharimun (Debt Burdened)</span>
                    <span className="vx-mono" style={{ color: '#0e5c48' }}>₹8,68,500 (18%)</span>
                  </div>
                  <div className="vx-progress-bar-wrap">
                    <div className="vx-progress-fill" style={{ width: '18%' }} />
                  </div>
                  <p style={{ fontSize: '0.82rem', color: '#5f706a', margin: 0 }}>Direct hospital and essential livelihood debt clearances audited by Shura committees.</p>
                </div>

                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 700, fontSize: '0.95rem' }}>
                    <span>Fi Sabilillah &amp; Education</span>
                    <span className="vx-mono" style={{ color: '#0e5c48' }}>₹5,79,000 (12%)</span>
                  </div>
                  <div className="vx-progress-bar-wrap">
                    <div className="vx-progress-fill" style={{ width: '12%' }} />
                  </div>
                  <p style={{ fontSize: '0.82rem', color: '#5f706a', margin: 0 }}>Orphan scholarship programs, school kits, and community learning resources.</p>
                </div>
              </div>
            </div>
          )}

          {/* Tab Pane 2: Relief Portfolio */}
          {impactTab === 'portfolio' && (
            <div className="vx-tab-card" data-vx-appear>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '2rem' }}>
                <div style={{ background: '#f6faf8', padding: '1.5rem', borderRadius: '16px', border: '1px solid #e4eae8' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                    <span className="vx-badge-pill" style={{ margin: 0, padding: '0.2rem 0.6rem' }}>HEALTHCARE RAIL</span>
                    <span className="vx-mono" style={{ fontSize: '0.85rem', fontWeight: 700, color: '#0e5c48' }}>84% Funded</span>
                  </div>
                  <h4 style={{ margin: '0.5rem 0', fontSize: '1.15rem', fontWeight: 800 }}>Kozhikode Dialysis Subsidy</h4>
                  <div className="vx-progress-bar-wrap">
                    <div className="vx-progress-fill" style={{ width: '84%' }} />
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem', color: '#5f706a' }}>
                    <span>₹4,20,000 Raised</span>
                    <span className="vx-mono">Goal: ₹5,00,000</span>
                  </div>
                </div>

                <div style={{ background: '#f6faf8', padding: '1.5rem', borderRadius: '16px', border: '1px solid #e4eae8' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                    <span className="vx-badge-pill" style={{ margin: 0, padding: '0.2rem 0.6rem' }}>WIDOWED SUPPORT</span>
                    <span className="vx-mono" style={{ fontSize: '0.85rem', fontWeight: 700, color: '#0e5c48' }}>86% Funded</span>
                  </div>
                  <h4 style={{ margin: '0.5rem 0', fontSize: '1.15rem', fontWeight: 800 }}>Malappuram Livelihood Grants</h4>
                  <div className="vx-progress-bar-wrap">
                    <div className="vx-progress-fill" style={{ width: '86%' }} />
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem', color: '#5f706a' }}>
                    <span>₹8,60,000 Raised</span>
                    <span className="vx-mono">Goal: ₹10,00,000</span>
                  </div>
                </div>

                <div style={{ background: '#f6faf8', padding: '1.5rem', borderRadius: '16px', border: '1px solid #e4eae8' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                    <span className="vx-badge-pill" style={{ margin: 0, padding: '0.2rem 0.6rem' }}>EDUCATION RAIL</span>
                    <span className="vx-mono" style={{ fontSize: '0.85rem', fontWeight: 700, color: '#0e5c48' }}>90% Funded</span>
                  </div>
                  <h4 style={{ margin: '0.5rem 0', fontSize: '1.15rem', fontWeight: 800 }}>Orphan Student Schooling</h4>
                  <div className="vx-progress-bar-wrap">
                    <div className="vx-progress-fill" style={{ width: '90%' }} />
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem', color: '#5f706a' }}>
                    <span>₹3,15,000 Raised</span>
                    <span className="vx-mono">Goal: ₹3,50,000</span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Tab Pane 3: Mahallu Network */}
          {impactTab === 'network' && (
            <div className="vx-tab-card" data-vx-appear>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '1.5rem' }}>
                <div style={{ border: '1px solid #e4eae8', padding: '1.5rem', borderRadius: '16px' }}>
                  <div style={{ fontSize: '0.78rem', color: '#8b9b95', fontWeight: 700, textTransform: 'uppercase' }}>MAHALLU #104</div>
                  <h4 style={{ margin: '0.25rem 0 0.5rem', fontSize: '1.1rem', fontWeight: 800 }}>Kozhikode South</h4>
                  <div style={{ fontSize: '0.85rem', color: '#0e5c48', fontWeight: 700 }}>14 Households Active</div>
                  <div style={{ fontSize: '0.8rem', color: '#5f706a', marginTop: '0.5rem' }}>Average disbursement turnaround: <strong style={{ color: '#0b2a22' }}>4.2 hours</strong></div>
                </div>

                <div style={{ border: '1px solid #e4eae8', padding: '1.5rem', borderRadius: '16px' }}>
                  <div style={{ fontSize: '0.78rem', color: '#8b9b95', fontWeight: 700, textTransform: 'uppercase' }}>MAHALLU #028</div>
                  <h4 style={{ margin: '0.25rem 0 0.5rem', fontSize: '1.1rem', fontWeight: 800 }}>Malappuram Central</h4>
                  <div style={{ fontSize: '0.85rem', color: '#0e5c48', fontWeight: 700 }}>22 Households Active</div>
                  <div style={{ fontSize: '0.8rem', color: '#5f706a', marginTop: '0.5rem' }}>Average disbursement turnaround: <strong style={{ color: '#0b2a22' }}>3.8 hours</strong></div>
                </div>

                <div style={{ border: '1px solid #e4eae8', padding: '1.5rem', borderRadius: '16px' }}>
                  <div style={{ fontSize: '0.78rem', color: '#8b9b95', fontWeight: 700, textTransform: 'uppercase' }}>MAHALLU #071</div>
                  <h4 style={{ margin: '0.25rem 0 0.5rem', fontSize: '1.1rem', fontWeight: 800 }}>Ernakulam West</h4>
                  <div style={{ fontSize: '0.85rem', color: '#0e5c48', fontWeight: 700 }}>9 Households Active</div>
                  <div style={{ fontSize: '0.8rem', color: '#5f706a', marginTop: '0.5rem' }}>Average disbursement turnaround: <strong style={{ color: '#0b2a22' }}>2.9 hours</strong></div>
                </div>
              </div>
            </div>
          )}
        </div>
      </section>

      {/* 7. INTERACTIVE NISAB CALCULATOR WIDGET WITH PRESETS & WEALTH METER */}
      <section className="vx-calc-section" id="calculator">
        <div className="vx-container">
          <div className="vx-calc-box" data-vx-appear>
            <div className="vx-calc-copy">
              <div className="vx-nisab-pill">
                <Sparkles size={16} />
                <span>Nisab Standard: 85g Gold (₹{goldRatePerGram.toLocaleString()}/g)</span>
              </div>
              <h2>Calculate Your Zakat with Certainty.</h2>
              <p>
                Zakat is due at 2.5% on qualifying wealth held for one full lunar year (Hawl) exceeding the Nisab threshold of ₹{nisabThreshold.toLocaleString()}. Test your estimated contribution right now.
              </p>

              {/* Real-time Nisab Progress Gauge */}
              <div className="vx-calc-meter-wrap">
                <div className="vx-calc-meter-head">
                  <span>Wealth vs Nisab Threshold:</span>
                  <span className="vx-mono" style={{ fontWeight: 700, color: isEligibleForZakat ? '#38ef7d' : '#e5c387' }}>
                    {wealthProgress}% of Nisab
                  </span>
                </div>
                <div className="vx-progress-bar-wrap" style={{ background: 'rgba(255,255,255,0.1)', height: '10px' }}>
                  <div
                    className="vx-progress-fill"
                    style={{
                      width: `${wealthProgress}%`,
                      background: isEligibleForZakat
                        ? 'linear-gradient(90deg, #2a8f72 0%, #38ef7d 100%)'
                        : 'linear-gradient(90deg, #c9a86a 0%, #ffd080 100%)'
                    }}
                  />
                </div>
                <div style={{ fontSize: '0.75rem', color: '#8dafa4' }}>
                  {isEligibleForZakat
                    ? '✓ Nisab threshold reached. Zakat of 2.5% is obligatory upon Hawl completion.'
                    : 'ℹ Below Nisab threshold (₹5,81,400). No Zakat due, voluntary Sadaqah recommended.'}
                </div>
              </div>

              <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap', marginTop: '1.5rem' }}>
                <Link className="vx-btn vx-btn-primary" href="/calculate">
                  <VxRollText text="Open Comprehensive Calculator" />
                  <ArrowRight size={16} aria-hidden="true" />
                </Link>
                <Link className="vx-btn vx-btn-ghost" style={{ color: '#ffffff', borderColor: 'rgba(255,255,255,0.2)' }} href="/give">
                  <VxRollText text="Give Directly Now" />
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
                <div className="vx-quick-presets">
                  <button type="button" className="vx-preset-btn" onClick={() => setCash(c => (c || 0) + 50000)}>+₹50k</button>
                  <button type="button" className="vx-preset-btn" onClick={() => setCash(c => (c || 0) + 100000)}>+₹1 Lakh</button>
                  <button type="button" className="vx-preset-btn" onClick={() => setCash(0)}>Clear</button>
                </div>
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
                <div className="vx-quick-presets">
                  <button type="button" className="vx-preset-btn" onClick={() => setGoldGrams(g => (g || 0) + 10)}>+10g</button>
                  <button type="button" className="vx-preset-btn" onClick={() => setGoldGrams(g => (g || 0) + 25)}>+25g</button>
                  <button type="button" className="vx-preset-btn" onClick={() => setGoldGrams(85)}>Set 85g (Nisab)</button>
                </div>
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

      {/* 8. AMANAH INTELLIGENCE: SHARIAH & NISAB AI COPILOT (MATCHING VAYNEX INTELLIGENCE) */}
      <section className="vx-copilot-section" id="copilot">
        <div className="vx-container">
          <div className="vx-copilot-card" data-vx-appear>
            <div>
              <span className="vx-section-kicker">AMANAH INTELLIGENCE</span>
              <h2 style={{ fontSize: 'clamp(1.8rem, 3.2vw, 2.6rem)', fontWeight: 800, letterSpacing: '-0.02em', color: '#0b2a22', margin: '0.5rem 0 1rem' }}>
                Scholar-Verified Shariah Copilot.
              </h2>
              <p style={{ color: '#5f706a', fontSize: '0.98rem', lineHeight: 1.6, margin: '0 0 1.5rem' }}>
                Instant answers to common Zakat, Nisab, Hawl, and Asnaf dilemmas—referenced against classical Islamic jurisprudence and contemporary Fiqh resolutions.
              </p>

              <div style={{ fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em', color: '#8b9b95', marginBottom: '0.5rem' }}>
                Frequently Asked Jurisprudence Queries:
              </div>

              <div className="vx-prompt-chips">
                {copilotQA.map((item, idx) => (
                  <button
                    key={idx}
                    type="button"
                    className={`vx-prompt-chip ${activeCopilotIdx === idx && !customReply ? 'active' : ''}`}
                    onClick={() => {
                      setActiveCopilotIdx(idx)
                      setCustomReply(null)
                    }}
                  >
                    <span>{item.q}</span>
                    <Sparkles size={14} color="#2a8f72" />
                  </button>
                ))}
              </div>

              <form onSubmit={handleCopilotSubmit} style={{ display: 'flex', gap: '0.5rem', marginTop: '1rem' }}>
                <input
                  type="text"
                  placeholder="Ask any question about your Zakat..."
                  value={copilotInput}
                  onChange={(e) => setCopilotInput(e.target.value)}
                  style={{
                    flex: 1,
                    padding: '0.65rem 1rem',
                    borderRadius: '9999px',
                    border: '1px solid #d4e7df',
                    fontSize: '0.85rem',
                    outline: 'none'
                  }}
                />
                <button
                  type="submit"
                  className="vx-btn vx-btn-primary"
                  style={{ padding: '0.65rem 1.25rem', borderRadius: '9999px' }}
                >
                  <Send size={15} />
                </button>
              </form>
            </div>

            {/* Chat Simulator Output */}
            <div className="vx-chat-box">
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', borderBottom: '1px solid rgba(255,255,255,0.08)', paddingBottom: '0.75rem' }}>
                <div style={{ width: '28px', height: '28px', borderRadius: '8px', background: 'rgba(42, 143, 114, 0.4)', display: 'grid', placeItems: 'center' }}>
                  <Sparkles size={16} color="#38ef7d" />
                </div>
                <div>
                  <div style={{ fontSize: '0.82rem', fontWeight: 700, color: '#ffffff' }}>Amanah Shariah Advisor</div>
                  <div style={{ fontSize: '0.7rem', color: '#72e0b9' }}>Referenced across 4 Classical Schools</div>
                </div>
              </div>

              <div className="vx-chat-bubble-user">
                {customReply ? copilotInput : copilotQA[activeCopilotIdx].q}
              </div>

              <div className="vx-chat-bubble-ai">
                {customReply ? customReply : copilotQA[activeCopilotIdx].a}
                <div className="vx-chat-citation">
                  {customReply ? 'Surah At-Tawbah 9:60 · Shariah Audit' : copilotQA[activeCopilotIdx].citation}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 9. THE 8 QURANIC ASNAF CATEGORIES (INTERACTIVE GRID WITH DETAILED DRAWER) */}
      <section className="vx-asnaf-section" id="asnaf">
        <div className="vx-container">
          <div style={{ textAlign: 'center' }}>
            <span className="vx-section-kicker" data-vx-appear>SHARIAH TAXONOMY</span>
            <h2 className="vx-section-title" style={{ maxWidth: '24ch', margin: '0 auto 1rem' }} data-vx-appear data-vx-delay="100">
              Strictly Mapped to the 8 Quranic Asnaf.
            </h2>
            <p className="vx-section-sub" style={{ margin: '0 auto 3rem' }} data-vx-appear data-vx-delay="200">
              Click any category below to view specific Shariah thresholds, local verification criteria, and case guidelines defined in Surah At-Tawbah (9:60).
            </p>
          </div>

          <div className="vx-asnaf-grid">
            {asnafDetails.map((asnaf, idx) => (
              <div
                key={idx}
                className={`vx-asnaf-card ${selectedAsnaf === idx ? 'selected' : ''}`}
                onClick={() => setSelectedAsnaf(idx)}
                data-vx-appear
                data-vx-delay={String((idx % 4) * 100 + 100)}
              >
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span className="vx-asnaf-tag">{asnaf.tag}</span>
                    {selectedAsnaf === idx && <Check size={16} color="#0e5c48" />}
                  </div>
                  <div className="vx-asnaf-name">{asnaf.arabic.split(' ')[0]}</div>
                  <div style={{ fontSize: '0.82rem', fontWeight: 600, color: '#0e5c48', marginBottom: '0.5rem' }}>
                    {asnaf.arabic.split('(')[1]?.replace(')', '') || ''}
                  </div>
                </div>
                <p className="vx-asnaf-desc">{asnaf.desc.slice(0, 95)}...</p>
              </div>
            ))}
          </div>

          {/* Detailed Drawer for Active Asnaf */}
          {selectedAsnaf !== null && asnafDetails[selectedAsnaf] && (
            <div className="vx-asnaf-drawer" data-vx-appear>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '1rem', marginBottom: '1.25rem' }}>
                <div>
                  <span className="vx-badge-pill" style={{ marginBottom: '0.5rem' }}>
                    {asnafDetails[selectedAsnaf].tag} OF 08 · SURAH AT-TAWBAH 9:60
                  </span>
                  <h3 style={{ fontSize: '1.45rem', fontWeight: 800, color: '#0b2a22', margin: 0 }}>
                    {asnafDetails[selectedAsnaf].arabic}
                  </h3>
                </div>
                <Link className="vx-btn vx-btn-primary" href="/give">
                  <VxRollText text="Find Verified Cases in this Category" />
                  <ArrowRight size={15} />
                </Link>
              </div>

              <p style={{ color: '#5f706a', fontSize: '0.95rem', lineHeight: 1.6, marginBottom: '1.5rem' }}>
                {asnafDetails[selectedAsnaf].desc}
              </p>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1.5rem' }}>
                <div style={{ background: '#ffffff', padding: '1.25rem', borderRadius: '12px', border: '1px solid #e4eae8' }}>
                  <div style={{ fontSize: '0.78rem', fontWeight: 800, textTransform: 'uppercase', color: '#0e5c48', marginBottom: '0.75rem' }}>
                    Mandatory Physical Verification Checklist:
                  </div>
                  <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '0.5rem', fontSize: '0.85rem', color: '#0b2a22' }}>
                    {asnafDetails[selectedAsnaf].checklist.map((item, i) => (
                      <li key={i} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <CheckCircle2 size={15} color="#2a8f72" style={{ flexShrink: 0 }} />
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <div style={{ background: '#ffffff', padding: '1.25rem', borderRadius: '12px', border: '1px solid #e4eae8' }}>
                  <div style={{ fontSize: '0.78rem', fontWeight: 800, textTransform: 'uppercase', color: '#0e5c48', marginBottom: '0.75rem' }}>
                    Sample Verified Mahallu Application:
                  </div>
                  <p style={{ fontSize: '0.88rem', color: '#5f706a', lineHeight: 1.6, margin: 0 }}>
                    {asnafDetails[selectedAsnaf].sample}
                  </p>
                  <div style={{ marginTop: '0.75rem', fontSize: '0.78rem', color: '#2a8f72', fontWeight: 700 }}>
                    100% Direct Receipt · Tamleek Guaranteed
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </section>

      {/* 10. PRIVACY BY DESIGN & GOVERNANCE */}
      <section className="vx-trust-section" id="governance">
        <div className="vx-container">
          <span className="vx-section-kicker" data-vx-appear>ETHICAL &amp; CONFIDENTIAL</span>
          <h2 className="vx-section-title" data-vx-appear data-vx-delay="100">Dignity and Protection for Every Household.</h2>
          <p className="vx-section-sub" data-vx-appear data-vx-delay="200">
            Amanah enforces zero-compromise security so recipients are honored and givers have complete peace of mind.
          </p>

          <div className="vx-trust-grid">
            <div className="vx-trust-card" data-vx-appear data-vx-delay="100">
              <LockKeyhole size={28} color="#0e5c48" />
              <h4>Quarantined Identity Documents</h4>
              <p>Applicant medical records, identity cards, and family details are visible only to assigned Mahallu verifiers—never published online.</p>
            </div>

            <div className="vx-trust-card" data-vx-appear data-vx-delay="200">
              <CheckCircle2 size={28} color="#0e5c48" />
              <h4>Dual-Signature Approvals</h4>
              <p>Disbursements require dual-key authorization from the Mahallu committee president and Imam to prevent favoritism.</p>
            </div>

            <div className="vx-trust-card" data-vx-appear data-vx-delay="300">
              <HeartHandshake size={28} color="#0e5c48" />
              <h4>Double-Handshake Receipts</h4>
              <p>Direct cash or bank disbursements are closed only after digital or SMS verification from the recipient household.</p>
            </div>

            <div className="vx-trust-card" data-vx-appear data-vx-delay="400">
              <FileText size={28} color="#0e5c48" />
              <h4>Immutable Community Ledger</h4>
              <p>Every rupee contributed, allocated, and disbursed is permanently recorded in an auditable financial trail.</p>
            </div>
          </div>
        </div>
      </section>

      {/* 11. ROLE PATHWAYS */}
      <section className="vx-roles-section" id="roles">
        <div className="vx-container">
          <span className="vx-section-kicker" data-vx-appear>COMMUNITY ROLES</span>
          <h2 className="vx-section-title" data-vx-appear data-vx-delay="100">Built for Everyone in Your Mahallu.</h2>
          <p className="vx-section-sub" data-vx-appear data-vx-delay="200">
            Whether fulfilling your obligation, seeking emergency assistance, or governing your masjid's Baitulmal.
          </p>

          <div className="vx-roles-grid">
            {/* Givers */}
            <div className="vx-role-card featured" data-vx-appear data-vx-delay="150">
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
                <VxRollText text="Give Zakat Directly" />
                <ArrowRight size={16} aria-hidden="true" />
              </Link>
            </div>

            {/* Households */}
            <div className="vx-role-card" data-vx-appear data-vx-delay="250">
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
                <VxRollText text="Request Assistance Privately" />
                <ArrowRight size={16} aria-hidden="true" />
              </Link>
            </div>

            {/* Mahallus */}
            <div className="vx-role-card" data-vx-appear data-vx-delay="350">
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
                <VxRollText text="Mahallu Committee Access" />
                <ArrowRight size={16} aria-hidden="true" />
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* 12. FINAL CALL TO ACTION */}
      <section className="vx-cta-section">
        <div className="vx-container">
          <div className="vx-badge-pill" data-vx-appear>
            <span className="vx-badge-dot" />
            <span>START TODAY</span>
          </div>
          <h2 className="vx-cta-title" data-vx-appear data-vx-delay="100">
            Bring <span className="serif">Barakah</span> to Your Wealth and Dignity to Your Community.
          </h2>
          <p className="vx-cta-sub" data-vx-appear data-vx-delay="200">
            Join thousands of givers and dozens of Mahallus using Amanah to fulfill Zakat as it was intended: direct, transparent, and transformative.
          </p>

          <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center', flexWrap: 'wrap' }} data-vx-appear data-vx-delay="300">
            <Link className="vx-btn vx-btn-primary" style={{ padding: '0.95rem 2.25rem', fontSize: '1.05rem' }} href="/give">
              <VxRollText text="Find Verified Households" />
              <ArrowRight size={18} aria-hidden="true" />
            </Link>
            <Link className="vx-btn vx-btn-secondary" style={{ padding: '0.95rem 2rem', fontSize: '1.05rem' }} href="/calculate">
              <VxRollText text="Calculate Nisab" />
            </Link>
          </div>
        </div>
      </section>

      {/* 13. FOOTER */}
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

      {/* 14. INTERACTIVE DIRECT HANDSHAKE MODAL (TRIGGERED BY HERO FEED ITEMS) */}
      {transferModal.open && (
        <div className="vx-modal-backdrop" onClick={() => setTransferModal(prev => ({ ...prev, open: false }))}>
          <div className="vx-modal-card" onClick={(e) => e.stopPropagation()}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1.25rem' }}>
              <div>
                <span className="vx-badge-pill" style={{ marginBottom: '0.4rem', padding: '0.2rem 0.6rem' }}>
                  DIRECT GIVING RAIL · 0% FEES
                </span>
                <h3 style={{ fontSize: '1.25rem', fontWeight: 800, color: '#0b2a22', margin: 0 }}>
                  Direct Zakat Handshake
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setTransferModal(prev => ({ ...prev, open: false }))}
                style={{ background: 'transparent', border: 'none', cursor: 'pointer', color: '#5f706a' }}
              >
                <X size={20} />
              </button>
            </div>

            {!transferModal.completed ? (
              <div>
                <div style={{ background: '#f6faf8', padding: '1rem', borderRadius: '12px', border: '1px solid #e4eae8', marginBottom: '1.25rem' }}>
                  <div style={{ fontSize: '0.78rem', color: '#8b9b95', textTransform: 'uppercase', fontWeight: 700 }}>Beneficiary Case:</div>
                  <div style={{ fontSize: '0.95rem', fontWeight: 800, color: '#0b2a22', margin: '0.2rem 0' }}>
                    {transferModal.householdName}
                  </div>
                  <div style={{ display: 'flex', gap: '0.5rem', fontSize: '0.78rem', color: '#0e5c48', fontWeight: 600 }}>
                    <span>{transferModal.asnafCategory}</span>
                    <span>·</span>
                    <span>Kozhikode South Mahallu #104</span>
                  </div>
                </div>

                <div style={{ marginBottom: '1.25rem' }}>
                  <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, color: '#0b2a22', marginBottom: '0.4rem' }}>
                    Contribution Amount (₹):
                  </label>
                  <input
                    type="number"
                    value={transferModal.suggestedAmount}
                    onChange={(e) => setTransferModal(prev => ({ ...prev, suggestedAmount: Number(e.target.value) }))}
                    style={{
                      width: '100%',
                      padding: '0.75rem 1rem',
                      borderRadius: '10px',
                      border: '1px solid #d4e7df',
                      fontSize: '1.1rem',
                      fontFamily: 'monospace',
                      fontWeight: 700,
                      outline: 'none'
                    }}
                  />
                  <div style={{ display: 'flex', gap: '0.4rem', marginTop: '0.5rem' }}>
                    {[1000, 2500, 5000, 10000].map((amt) => (
                      <button
                        key={amt}
                        type="button"
                        onClick={() => setTransferModal(prev => ({ ...prev, suggestedAmount: amt }))}
                        className="vx-preset-btn"
                        style={{ color: '#0e5c48', borderColor: '#d4e7df', background: '#f6faf8' }}
                      >
                        ₹{amt.toLocaleString()}
                      </button>
                    ))}
                  </div>
                </div>

                <div style={{ borderTop: '1px solid #e4eae8', paddingTop: '1rem', marginBottom: '1.5rem', fontSize: '0.82rem', color: '#5f706a' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.25rem' }}>
                    <span>Platform Administrative Cut:</span>
                    <strong style={{ color: '#0e5c48' }}>₹0.00 (0.00%)</strong>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.25rem' }}>
                    <span>Amount Reaching Beneficiary:</span>
                    <strong style={{ color: '#0b2a22' }}>₹{transferModal.suggestedAmount.toLocaleString()}</strong>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span>Tamleek Handshake Protocol:</span>
                    <span style={{ color: '#0e5c48', fontWeight: 600 }}>Recipient SMS Receipt + Mahallu Signoff</span>
                  </div>
                </div>

                <div style={{ display: 'flex', gap: '0.75rem' }}>
                  <button
                    type="button"
                    className="vx-btn vx-btn-primary"
                    style={{ flex: 1, padding: '0.85rem' }}
                    onClick={handleExecuteTransfer}
                  >
                    <VxRollText text={`Confirm ₹${transferModal.suggestedAmount.toLocaleString()} Contribution`} />
                    <ArrowRight size={16} />
                  </button>
                  <button
                    type="button"
                    className="vx-btn vx-btn-secondary"
                    onClick={() => setTransferModal(prev => ({ ...prev, open: false }))}
                  >
                    Cancel
                  </button>
                </div>
              </div>
            ) : (
              <div style={{ textAlign: 'center', padding: '1.5rem 0' }}>
                <div style={{ width: '64px', height: '64px', borderRadius: '50%', background: '#eef7f3', border: '2px solid #2a8f72', color: '#0e5c48', display: 'grid', placeItems: 'center', margin: '0 auto 1.25rem' }}>
                  <Check size={32} />
                </div>
                <h4 style={{ fontSize: '1.35rem', fontWeight: 800, color: '#0b2a22', margin: '0 0 0.5rem' }}>
                  Direct Handshake Initiated!
                </h4>
                <p style={{ color: '#5f706a', fontSize: '0.9rem', lineHeight: 1.5, maxWidth: '38ch', margin: '0 auto 1rem' }}>
                  ₹{transferModal.suggestedAmount.toLocaleString()} has been queued for immediate direct settlement to {transferModal.householdName}.
                </p>
                <div style={{ display: 'inline-block', background: '#f6faf8', border: '1px solid #e4eae8', padding: '0.4rem 0.85rem', borderRadius: '8px', fontSize: '0.75rem', fontFamily: 'monospace', color: '#0e5c48', fontWeight: 700 }}>
                  HASH: AMN-2026-KZK-9921 · 0.00% FEES
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
