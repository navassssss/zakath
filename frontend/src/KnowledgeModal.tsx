type KnowledgeTopic = {
  title: string
  subtitle: string
  content: string
  points: string[]
}

const TOPICS: Record<string, KnowledgeTopic> = {
  'What is Zakat?': {
    title: 'What is Zakat?',
    subtitle: 'The third pillar of Islam — an obligatory act of purification and social justice.',
    content:
      'Zakat is an obligatory financial contribution commanded by Allah upon eligible Muslims. Unlike voluntary charity (Sadaqah), Zakat is a spiritual obligation and an institutional right of the poor, aimed at circulating wealth and preventing inequality within society.',
    points: [
      'Rate: Standard 2.5% per annum on surplus financial wealth, gold, and trade assets.',
      'Threshold: Requires meeting or exceeding the Nisab benchmark.',
      'Holding period: Must be held for a full lunar year (Hawl).',
      'Purification: Purifies existing wealth and fosters compassion in the community.',
    ],
  },
  'Who can receive Zakat?': {
    title: 'Who can receive Zakat?',
    subtitle: 'The eight Quranic categories defined in Surah At-Tawbah (9:60).',
    content:
      'Allah has designated the eight eligible recipients of Zakat directly in the Quran. Wealth cannot be arbitrarily diverted outside these verified categories.',
    points: [
      'Al-Fuqara: Extremely impoverished individuals with no steady livelihood.',
      'Al-Masakin: Needy individuals whose income does not cover essential family needs.',
      'Al-Gharimin: People overwhelmed by debt incurred for legitimate basic survival.',
      'Ibn as-Sabil: Stranded travelers in urgent need of assistance.',
      'Fi Sabilillah: Charitable causes serving the collective wellbeing of the community.',
    ],
  },
  'Nisab and Hawl': {
    title: 'Nisab and Hawl Explained',
    subtitle: 'The minimum threshold and time requirement for Zakat eligibility.',
    content:
      'To be liable for Zakat, your net wealth must equal or exceed the Nisab on your Zakat valuation date, and you must have maintained this baseline across one lunar year (Hawl).',
    points: [
      'Gold Nisab: 85 grams (2.73 troy oz) of 24-karat gold.',
      'Silver Nisab: 595 grams (19.13 troy oz) of pure silver — widely used for wider charitable benefit.',
      'Hawl: 354 days (one Islamic Hijri lunar year) of holding surplus assets.',
      'Deductions: Outstanding short-term living debts and due expenses are deducted before calculation.',
    ],
  },
  'Asnaf Categories': {
    title: 'The 8 Asnaf Categories',
    subtitle: 'Detailed Islamic jurisprudence on eligible Zakat beneficiaries.',
    content:
      'The Quranic blueprint ensures that community wealth flows directly to empower vulnerable households and restore human dignity.',
    points: [
      '1. The Poor (Al-Fuqara) — destitute households without basic subsistence.',
      '2. The Destitute (Al-Masakin) — those with insufficient income to meet essential health, housing, or food needs.',
      '3. Zakat Collectors (Al-Amilina Alayha) — administrators entrusted with fair distribution.',
      '4. Reconciling Hearts (Al-Mu’allafatu Qulubuhum) — those newly embracing or supporting the community.',
      '5. Freeing Bonds (Fir-Riqab) — emancipating people from bonded labor or unlawful detention.',
      '6. Debt Relief (Al-Gharimin) — individuals trapped in emergency or essential debt.',
      '7. Path of Good (Fi Sabilillah) — religious, educational, and welfare initiatives.',
      '8. The Wayfarer (Ibn As-Sabil) — travelers stranded away from home without access to funds.',
    ],
  },
}

export function KnowledgeModal({
  topic,
  onClose,
}: {
  topic: string | null
  onClose: () => void
}) {
  if (!topic) return null
  const data = TOPICS[topic] ?? TOPICS['What is Zakat?']

  return (
    <div
      className="knowledge-modal-backdrop"
      role="dialog"
      aria-modal="true"
      aria-labelledby="knowledge-title"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose()
      }}
    >
      <div className="knowledge-modal">
        <button
          type="button"
          className="knowledge-modal-close"
          aria-label="Close dialog"
          onClick={onClose}
        >
          ✕
        </button>
        <h3 id="knowledge-title">{data.title}</h3>
        <p style={{ fontWeight: 600, color: 'var(--green)', fontSize: '13.5px', marginBottom: '8px' }}>
          {data.subtitle}
        </p>
        <p>{data.content}</p>
        <ul>
          {data.points.map((pt, index) => (
            <li key={index} style={{ marginBottom: '6px' }}>
              {pt}
            </li>
          ))}
        </ul>
        <button
          type="button"
          className="btn-outline"
          onClick={onClose}
          style={{ width: '100%', marginTop: '12px' }}
        >
          Close
        </button>
      </div>
    </div>
  )
}
