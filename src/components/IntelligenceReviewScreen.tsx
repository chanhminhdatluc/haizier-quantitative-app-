import type { AnalysisResult } from '../types'
import { TradingViewChart } from './TradingViewChart'

interface IntelligenceReviewScreenProps {
  ticker: string
  result: AnalysisResult
  onConfirm: () => void
  onBack: () => void
}

const metricCardClass =
  'rounded-xl border border-slate-200 bg-white p-4 text-left shadow-sm shadow-slate-200/70'

const clamp = (value: number, min = 0, max = 100) => Math.min(max, Math.max(min, value))

const deriveTickerSeed = (ticker: string) =>
  ticker
    .toUpperCase()
    .split('')
    .reduce((acc, char) => acc + char.charCodeAt(0), 0)

const extractBaseTicker = (ticker: string) => ticker.toUpperCase().split(':').pop() ?? ticker.toUpperCase()

const buildRedditSearchLink = (query: string) =>
  `https://www.reddit.com/search/?q=${encodeURIComponent(query)}&sort=relevance&t=month`

export function IntelligenceReviewScreen({
  ticker,
  result,
  onConfirm,
  onBack,
}: IntelligenceReviewScreenProps) {
  const baseTicker = extractBaseTicker(ticker)
  const tickerSeed = deriveTickerSeed(ticker)
  const redditHypeScore = clamp(
    Math.round(result.sentiment * 0.55 + result.hypeRisk * 0.35 + (tickerSeed % 11) - 5),
  )
  const bullishRatio = clamp(Math.round(result.sentiment - result.hypeRisk * 0.18 + (tickerSeed % 9) + 4))
  const bearishRatio = 100 - bullishRatio

  const communityBuzzLevel =
    redditHypeScore >= 75 ? 'Very High Buzz' : redditHypeScore >= 58 ? 'Moderate Buzz' : 'Low Buzz'

  const evidenceConnectionText =
    result.evidenceConfidence >= 72 && redditHypeScore <= 60
      ? 'Social chatter is present but not overwhelming, so cross-evidence remains comparatively stable.'
      : result.evidenceConfidence < 60 && redditHypeScore >= 70
        ? 'Elevated hype is outpacing supporting evidence, reducing overall confidence quality.'
        : 'Reddit-style hype is being balanced against market, AI, and research intelligence in the final score.'

  const hypeRiskInterpretation =
    result.hypeRisk >= 70
      ? 'High hype risk: discussion momentum appears speculative and may be detached from broader evidence.'
      : result.hypeRisk >= 45
        ? 'Moderate hype risk: interest is meaningful, but requires confirmation from other intelligence layers.'
        : 'Lower hype risk: social buzz appears relatively contained versus broader supporting evidence.'

  const suggestedStance =
    result.evidenceConfidence >= 75 && result.hypeRisk <= 35
      ? 'Consider'
      : result.evidenceConfidence <= 55 || result.hypeRisk >= 65
        ? 'High Caution'
        : 'Watch'

  const discussionKeywords = [
    `${baseTicker} momentum`,
    result.aiConfidence >= 70 ? 'earnings setup' : 'valuation debate',
    bullishRatio >= 60 ? 'breakout thesis' : 'risk-off positioning',
    result.researchAlignment >= 70 ? 'fundamental catalysts' : 'speculation watch',
    result.marketTrend >= 70 ? 'trend continuation' : 'mean reversion',
  ]

  const discussionSnippets = [
    `Thread summary: community users are split on whether ${baseTicker} can sustain near-term momentum after recent attention spikes.`,
    `Discussion pulse: several comments highlight potential upside catalysts, while others flag that conviction is mostly sentiment-led.`,
    `Risk signal recap: a subset of participants warns that fast-moving excitement may reverse if supporting evidence weakens.`,
  ]

  const redditSearchLinks = [
    { label: `Search Reddit for "${baseTicker} stock buy"`, query: `${baseTicker} stock buy` },
    { label: `Search Reddit for "${baseTicker} stock discussion"`, query: `${baseTicker} stock discussion` },
    { label: `Search Reddit for "${baseTicker} earnings sentiment"`, query: `${baseTicker} earnings sentiment` },
    { label: `Search Reddit for "${baseTicker} wallstreetbets"`, query: `${baseTicker} wallstreetbets` },
    { label: `Search Reddit for "${baseTicker} investing"`, query: `${baseTicker} investing` },
  ]

  const isAustralianTicker = [
    'BHP',
    'CBA',
    'CSL',
    'WES',
    'NAB',
    'ANZ',
    'WOW',
    'TLS',
    'MQG',
    'RIO',
  ].includes(baseTicker)

  const ausExtendedLinks = isAustralianTicker
    ? [
        { label: `Search Reddit for "ASX ${baseTicker} stock discussion"`, query: `ASX ${baseTicker} stock discussion` },
        { label: `Search Reddit for "${baseTicker} ASX buy"`, query: `${baseTicker} ASX buy` },
      ]
    : []

  const hotCopperLink = isAustralianTicker
    ? `https://hotcopper.com.au/search?q=${encodeURIComponent(`${baseTicker} discussion`)}`
    : ''

  return (
    <section className="surface-card">
      <p className="helper-heading">Step 4 · Intelligence Synthesis Review</p>
      <h2 className="section-title">Intelligence Review: {ticker}</h2>
      <p className="section-subtitle">
        Review this decision-support intelligence report before confirming your analysis outcome.
      </p>

      <p className="ethics-note mt-4">
        Novelty of Haizier: instead of relying on one signal source, this MVP combines four
        intelligence layers to produce a single evidence confidence view for transparent decision
        support.
      </p>

      {result.savedRecordId || result.marketData ? (
        <div className="mt-5 rounded-xl border border-emerald-200 bg-emerald-50 p-4 text-left">
          <p className="text-xs font-semibold uppercase tracking-[0.1em] text-emerald-700">
            Supabase Persistence Proof
          </p>
          {result.savedRecordId ? (
            <p className="mt-2 text-sm text-emerald-900">
              Saved record ID: <span className="font-semibold">{result.savedRecordId}</span>
            </p>
          ) : null}
          {result.savedAt ? (
            <p className="mt-1 text-xs text-emerald-800">Saved at: {result.savedAt}</p>
          ) : null}
          {result.marketData ? (
            <div className="mt-3 grid gap-2 text-xs text-emerald-900 sm:grid-cols-2 lg:grid-cols-4">
              <p className="rounded-lg bg-white/70 px-2.5 py-2">Source: {result.marketData.source}</p>
              <p className="rounded-lg bg-white/70 px-2.5 py-2">Symbol: {result.marketData.symbol}</p>
              <p className="rounded-lg bg-white/70 px-2.5 py-2">Latest close: ${result.marketData.latestClose.toFixed(2)}</p>
              <p className="rounded-lg bg-white/70 px-2.5 py-2">Change: {result.marketData.changePercent.toFixed(2)}%</p>
            </div>
          ) : null}
        </div>
      ) : null}

      <div className="mt-5 rounded-xl border border-slate-200 bg-fintech-50 p-4 text-left">
        <p className="text-xs font-semibold uppercase tracking-[0.1em] text-fintech-600">How the score is built</p>
        <p className="mt-2 text-sm leading-relaxed text-slate-600">
          Haizier combines <span className="font-medium text-fintech-900">Market Intelligence</span>,{' '}
          <span className="font-medium text-fintech-900">Sentiment Intelligence</span>,{' '}
          <span className="font-medium text-fintech-900">Predictive Intelligence</span> (AI Forecast), and{' '}
          <span className="font-medium text-fintech-900">Research Intelligence</span>. These streams are
          cross-checked and synthesized into one <span className="font-semibold text-fintech-700">Evidence Confidence Score</span>.
        </p>
      </div>

      <div className="mt-6">
        <TradingViewChart ticker={ticker} />
      </div>

      <div className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        <article className={metricCardClass}>
          <p className="text-xs text-slate-500">Market Trend Score</p>
          <p className="mt-1 text-2xl font-semibold text-fintech-900">{result.marketTrend}%</p>
        </article>
        <article className={metricCardClass}>
          <p className="text-xs text-slate-500">Sentiment Score</p>
          <p className="mt-1 text-2xl font-semibold text-fintech-900">{result.sentiment}%</p>
        </article>
        <article className={metricCardClass}>
          <p className="text-xs text-slate-500">AI Confidence Score</p>
          <p className="mt-1 text-2xl font-semibold text-fintech-900">{result.aiConfidence}%</p>
        </article>
        <article className={metricCardClass}>
          <p className="text-xs text-slate-500">Research Alignment</p>
          <p className="mt-1 text-2xl font-semibold text-fintech-900">{result.researchAlignment}%</p>
        </article>
        <article className={metricCardClass}>
          <p className="text-xs text-slate-500">Hype Risk</p>
          <p className="mt-1 text-2xl font-semibold text-rose-600">{result.hypeRisk}%</p>
        </article>
        <article className="rounded-xl border border-fintech-300 bg-fintech-100 p-4 text-left shadow-sm shadow-blue-100">
          <p className="text-xs text-fintech-700">Evidence Confidence Score</p>
          <p className="mt-1 text-2xl font-semibold text-fintech-900">{result.evidenceConfidence}%</p>
        </article>
      </div>

      <div className="mt-5 rounded-xl border border-slate-200 bg-white p-4 text-left shadow-sm shadow-slate-200/70">
        <p className="text-sm font-semibold text-fintech-900">
          Verdict:{' '}
          <span className={result.verdict === 'evidence-supported' ? 'text-emerald-600' : 'text-rose-600'}>
            {result.verdict === 'evidence-supported' ? 'Evidence-Supported Signal' : 'Potentially Hype-Driven Signal'}
          </span>
        </p>
        <p className="mt-2 text-sm text-slate-600">{result.explanation}</p>
        <p className="mt-2 text-xs leading-relaxed text-slate-500">
          These scores are educational decision-support outputs derived from selected signals, backend
          scoring logic, and Alpha Vantage market data.
        </p>

        <p className="mt-3 text-xs font-semibold uppercase tracking-[0.1em] text-fintech-600">Why this is different</p>
        <p className="mt-1 text-sm leading-relaxed text-slate-600">
          Unlike basic finance apps that mainly show price charts, Haizier combines live market context,
          sentiment intelligence, predictive confidence, and research alignment into one Evidence
          Confidence Score to compare evidence-supported signals against hype-driven signals.
        </p>
      </div>

      <div className="mt-4 rounded-xl border border-slate-200 bg-slate-50 p-4 text-left">
        <p className="text-xs font-semibold uppercase tracking-[0.1em] text-slate-500">Signal interpretation guide</p>
        <p className="mt-2 text-sm leading-relaxed text-slate-600">
          <span className="font-semibold text-emerald-700">Evidence-supported signals</span> show stronger
          agreement across intelligence layers. <span className="font-semibold text-rose-700">Hype-driven signals</span>{' '}
          show weaker alignment, elevated hype risk, or conflicting evidence.
        </p>
      </div>

      <div className="mt-4 rounded-xl border border-cyan-200 bg-cyan-50 p-4 text-left">
        <p className="text-xs font-semibold uppercase tracking-[0.1em] text-cyan-800">
          Reddit Market Discussion: Buy Interest vs Hype Risk
        </p>

        <article className="mt-3 rounded-lg border border-cyan-100 bg-white p-3">
          <p className="text-xs font-semibold uppercase tracking-[0.08em] text-fintech-700">
            Live Reddit Evidence Links
          </p>
          <p className="mt-2 text-sm leading-relaxed text-slate-600">
            These links open real Reddit searches related to the selected stock. The MVP uses these as
            research pathways, while the hype score below remains a demo decision-support signal.
          </p>
          <ul className="mt-2 space-y-1.5 text-sm">
            {redditSearchLinks.map((item) => (
              <li key={item.query}>
                <a
                  href={buildRedditSearchLink(item.query)}
                  target="_blank"
                  rel="noreferrer"
                  className="font-medium text-fintech-700 underline decoration-fintech-300 underline-offset-2"
                >
                  {item.label}
                </a>
              </li>
            ))}
            {ausExtendedLinks.map((item) => (
              <li key={item.query}>
                <a
                  href={buildRedditSearchLink(item.query)}
                  target="_blank"
                  rel="noreferrer"
                  className="font-medium text-fintech-700 underline decoration-fintech-300 underline-offset-2"
                >
                  {item.label}
                </a>
              </li>
            ))}
          </ul>

          {isAustralianTicker ? (
            <div className="mt-3 rounded-lg border border-slate-200 bg-slate-50 p-2.5">
              <p className="text-xs font-semibold uppercase tracking-[0.08em] text-slate-600">
                External discussion source
              </p>
              <a
                href={hotCopperLink}
                target="_blank"
                rel="noreferrer"
                className="mt-1 inline-block text-sm font-medium text-fintech-700 underline decoration-fintech-300 underline-offset-2"
              >
                Search HotCopper for "{baseTicker} discussion"
              </a>
            </div>
          ) : null}

          <p className="mt-3 text-xs leading-relaxed text-slate-500">
            The MVP opens real discussion pathways but does not claim to scrape or analyse Reddit posts directly.
          </p>

          {isAustralianTicker ? (
            <p className="mt-2 text-xs text-slate-500">
              Australian ticker detected: ASX-style and HotCopper-related terms are included as additional
              research pathways while Reddit remains the primary social discussion source.
            </p>
          ) : null}
        </article>

        <div className="mt-3 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          <article className="rounded-lg border border-cyan-100 bg-white p-3">
            <p className="text-xs text-slate-500">Reddit Hype Score</p>
            <p className="mt-1 text-xl font-semibold text-fintech-900">{redditHypeScore}%</p>
            <p className="mt-1 text-xs text-slate-500">Simulated MVP output</p>
          </article>
          <article className="rounded-lg border border-cyan-100 bg-white p-3">
            <p className="text-xs text-slate-500">Bullish vs Bearish Ratio</p>
            <p className="mt-1 text-xl font-semibold text-fintech-900">{bullishRatio}% / {bearishRatio}%</p>
          </article>
          <article className="rounded-lg border border-cyan-100 bg-white p-3">
            <p className="text-xs text-slate-500">Community Buzz Level</p>
            <p className="mt-1 text-xl font-semibold text-fintech-900">{communityBuzzLevel}</p>
          </article>
          <article className="rounded-lg border border-cyan-100 bg-white p-3">
            <p className="text-xs text-slate-500">Hype Risk</p>
            <p className="mt-1 text-xl font-semibold text-rose-600">{result.hypeRisk}%</p>
          </article>
          <article className="rounded-lg border border-cyan-100 bg-white p-3 sm:col-span-2 lg:col-span-2">
            <p className="text-xs text-slate-500">Suggested Stance (Demo)</p>
            <p className="mt-1 text-xl font-semibold text-fintech-900">
              {suggestedStance === 'Consider'
                ? 'Consider researching further'
                : suggestedStance === 'Watch'
                  ? 'Watchlist candidate'
                  : 'High caution'}
            </p>
            <p className="mt-1 text-xs text-slate-500">This is a demo decision-support signal, not financial advice.</p>
          </article>
        </div>

        <div className="mt-3 grid gap-3 lg:grid-cols-2">
          <article className="rounded-lg border border-cyan-100 bg-white p-3">
            <p className="text-xs text-slate-500">Trending Discussion Keywords</p>
            <div className="mt-2 flex flex-wrap gap-2">
              {discussionKeywords.map((keyword) => (
                <span
                  key={keyword}
                  className="rounded-full border border-fintech-200 bg-fintech-50 px-2.5 py-1 text-xs font-medium text-fintech-700"
                >
                  {keyword}
                </span>
              ))}
            </div>
          </article>

          <article className="rounded-lg border border-cyan-100 bg-white p-3">
            <p className="text-xs text-slate-500">Hype Risk Interpretation</p>
            <p className="mt-2 text-sm leading-relaxed text-slate-600">{hypeRiskInterpretation}</p>
            <p className="mt-2 text-xs leading-relaxed text-fintech-700">
              Connection to Evidence Confidence Score: {evidenceConnectionText}
            </p>
          </article>
        </div>

        <article className="mt-3 rounded-lg border border-cyan-100 bg-white p-3">
          <p className="text-xs text-slate-500">Example Reddit-style Discussion Snippets (Simulated MVP Output)</p>
          <ul className="mt-2 space-y-2 text-sm text-slate-600">
            {discussionSnippets.map((snippet) => (
              <li key={snippet} className="rounded-lg bg-slate-50 p-2.5 leading-relaxed">
                {snippet}
              </li>
            ))}
          </ul>
          <p className="mt-2 text-xs text-slate-500">
            Snippets are synthetic community-summary examples generated for this MVP and do not quote real
            user posts. Haizier does not claim to read Reddit posts directly in this frontend-only version.
          </p>
        </article>

        <p className="mt-3 text-xs leading-relaxed text-slate-600">
          Reddit discussion may reflect speculation, bias, or crowd excitement. Haizier does not treat
          Reddit sentiment as investment advice.
        </p>
      </div>

      <p className="info-alert mt-5 border-amber-200 bg-amber-50 text-amber-800">
        Non-financial-advice warning: this output is for educational decision support only.
      </p>

      <div className="mt-6 flex flex-col gap-3 sm:flex-row">
        <button
          type="button"
          onClick={onConfirm}
          className="btn-primary flex-1"
        >
          Confirm Analysis
        </button>
        <button
          type="button"
          onClick={onBack}
          className="btn-secondary flex-1"
        >
          Go Back
        </button>
      </div>
    </section>
  )
}
