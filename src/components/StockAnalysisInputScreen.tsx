import { useEffect, useMemo, useState } from 'react'
import type { StockOption } from '../data/stockUniverse'
import type {
  OpportunityScannerInput,
  RiskProfileForm,
  ScannerCandidate,
  SignalType,
  StockInputForm,
} from '../types'
import { generateOpportunityCandidates } from '../utils/opportunityScanner'
import { getLocalStockSuggestions } from '../utils/symbolResolver'
import { searchStocksFromApi } from '../utils/stockSearch'

interface StockAnalysisInputScreenProps {
  data: StockInputForm
  riskProfile: RiskProfileForm
  errors: Partial<Record<'ticker' | 'horizon', string>>
  onChange: (field: keyof StockInputForm, value: string | SignalType[]) => void
  onScannerSelect: (candidate: ScannerCandidate, scannerInput: OpportunityScannerInput) => void
  onSubmit: () => void
  isSubmitting?: boolean
  submitError?: string
}

const signalOptions: SignalType[] = [
  'Market Trend',
  'Sentiment Intelligence',
  'AI Forecast',
  'Research Evidence',
]

export function StockAnalysisInputScreen({
  data,
  riskProfile,
  errors,
  onChange,
  onScannerSelect,
  onSubmit,
  isSubmitting = false,
  submitError = '',
}: StockAnalysisInputScreenProps) {
  const [apiSuggestions, setApiSuggestions] = useState<StockOption[]>([])
  const [searchError, setSearchError] = useState<string>('')
  const [scannerInput, setScannerInput] = useState<OpportunityScannerInput>({
    marketCondition: 'Growth Market',
    horizon: 'Medium-term',
    riskPreference: 'Medium',
    sectorInterest: 'Any',
    region: 'Global',
  })
  const [scannerCandidates, setScannerCandidates] = useState<ScannerCandidate[]>([])

  const rankedScannerCandidates = useMemo(() => {
    const preferredRisk: ScannerCandidate['riskLevel'] =
      scannerInput.riskPreference === 'Low'
        ? 'Low'
        : scannerInput.riskPreference === 'Medium'
          ? 'Medium'
          : 'High'

    const marketPreferenceBoost =
      scannerInput.marketCondition === 'Defensive Market'
        ? { Low: 8, Medium: 3, High: -4 }
        : scannerInput.marketCondition === 'Growth Market'
          ? { Low: 1, Medium: 5, High: 7 }
          : scannerInput.marketCondition === 'Recovery Market'
            ? { Low: 3, Medium: 6, High: 4 }
            : { Low: -3, Medium: 4, High: 8 }

    return scannerCandidates
      .map((candidate) => {
        const riskMatchScore =
          candidate.riskLevel === preferredRisk
            ? 16
            : preferredRisk === 'Medium' && candidate.riskLevel !== 'Medium'
              ? 8
              : 4

        const confidenceBoost = Math.round(candidate.evidenceConfidenceScore * 0.18)
        const stanceBoost =
          candidate.suggestedStance === 'Consider'
            ? 9
            : candidate.suggestedStance === 'Watch'
              ? 5
              : 1
        const hypeAdjustment =
          candidate.redditHypeLevel === 'Low' ? 7 : candidate.redditHypeLevel === 'Moderate' ? 3 : -4

        const matchScore =
          confidenceBoost +
          riskMatchScore +
          stanceBoost +
          hypeAdjustment +
          marketPreferenceBoost[candidate.riskLevel]

        return { ...candidate, matchScore }
      })
      .sort((a, b) => b.matchScore - a.matchScore)
  }, [scannerCandidates, scannerInput.marketCondition, scannerInput.riskPreference])

  const localSuggestions = useMemo(() => getLocalStockSuggestions(data.ticker, 6), [data.ticker])

  const suggestions = useMemo(() => {
    const merged = [...apiSuggestions, ...localSuggestions]
    return merged.filter(
      (item, index, arr) =>
        arr.findIndex((x) => x.symbol === item.symbol && x.exchange === item.exchange) === index,
    )
  }, [apiSuggestions, localSuggestions])

  useEffect(() => {
    let isCancelled = false

    const query = data.ticker.trim()
    if (query.length < 2) {
      setApiSuggestions([])
      setSearchError('')
      return
    }

    const runSearch = async () => {
      try {
        const apiResults = await searchStocksFromApi(query)
        if (!isCancelled) {
          setApiSuggestions(apiResults)
          setSearchError('')
        }
      } catch {
        if (!isCancelled) {
          setApiSuggestions([])
          setSearchError('Live symbol search is currently unavailable. Showing local suggestions.')
        }
      }
    }

    runSearch()

    return () => {
      isCancelled = true
    }
  }, [data.ticker])

  const toggleSignal = (signal: SignalType) => {
    const nextSignals = data.signals.includes(signal)
      ? data.signals.filter((item) => item !== signal)
      : [...data.signals, signal]

    onChange('signals', nextSignals)
  }

  const handleGenerateCandidates = () => {
    const candidates = generateOpportunityCandidates(scannerInput, riskProfile)
    setScannerCandidates(candidates)
  }

  return (
    <section className="surface-card">
      <p className="helper-heading">Step 3 · Analysis Inputs</p>
      <h2 className="section-title">Stock Analysis Input</h2>
      <p className="section-subtitle">
        Enter key details to generate your evidence confidence snapshot.
      </p>

      <p className="ethics-note mt-4">
        Why this step matters: clearer input context improves explanation quality and helps demonstrate
        how Haizier distinguishes evidence-supported signals from hype-driven signals.
      </p>

      <div className="mt-6 grid gap-5">
        <div className="rounded-xl border border-fintech-200 bg-fintech-50 p-4 sm:p-5">
          <p className="text-xs font-semibold uppercase tracking-[0.1em] text-fintech-700">
            Opportunity Scanner (Optional)
          </p>
          <p className="mt-2 text-sm leading-relaxed text-slate-600">
            Discover potential watchlist candidates based on mock market conditions and risk framing.
            This is an educational MVP decision-support feature.
          </p>
          <p className="info-alert mt-3 border-amber-200 bg-amber-50 text-amber-800">
            This scanner is a demo decision-support tool. It does not provide financial advice, and the
            entry/exit zones are mock ranges for MVP demonstration only.
          </p>

          <div className="mt-4 grid gap-3 md:grid-cols-2 lg:grid-cols-3">
            <label className="field-label">
              Market condition
              <select
                value={scannerInput.marketCondition}
                onChange={(event) =>
                  setScannerInput((prev) => ({ ...prev, marketCondition: event.target.value as OpportunityScannerInput['marketCondition'] }))
                }
                className="field-input"
              >
                <option value="Growth Market">Growth Market</option>
                <option value="Defensive Market">Defensive Market</option>
                <option value="Volatile Market">Volatile Market</option>
                <option value="Recovery Market">Recovery Market</option>
              </select>
            </label>

            <label className="field-label">
              Investment horizon
              <select
                value={scannerInput.horizon}
                onChange={(event) =>
                  setScannerInput((prev) => ({ ...prev, horizon: event.target.value as OpportunityScannerInput['horizon'] }))
                }
                className="field-input"
              >
                <option value="Short-term">Short-term</option>
                <option value="Medium-term">Medium-term</option>
                <option value="Long-term">Long-term</option>
              </select>
            </label>

            <label className="field-label">
              Risk preference
              <select
                value={scannerInput.riskPreference}
                onChange={(event) =>
                  setScannerInput((prev) => ({ ...prev, riskPreference: event.target.value as OpportunityScannerInput['riskPreference'] }))
                }
                className="field-input"
              >
                <option value="Low">Low</option>
                <option value="Medium">Medium</option>
                <option value="High">High</option>
              </select>
            </label>

            <label className="field-label">
              Sector interest
              <select
                value={scannerInput.sectorInterest}
                onChange={(event) =>
                  setScannerInput((prev) => ({ ...prev, sectorInterest: event.target.value as OpportunityScannerInput['sectorInterest'] }))
                }
                className="field-input"
              >
                <option value="Technology">Technology</option>
                <option value="Banking">Banking</option>
                <option value="Energy">Energy</option>
                <option value="Consumer">Consumer</option>
                <option value="Healthcare">Healthcare</option>
                <option value="Mining">Mining</option>
                <option value="Any">Any</option>
              </select>
            </label>

            <label className="field-label">
              Region
              <select
                value={scannerInput.region}
                onChange={(event) =>
                  setScannerInput((prev) => ({ ...prev, region: event.target.value as OpportunityScannerInput['region'] }))
                }
                className="field-input"
              >
                <option value="US">US</option>
                <option value="Australia">Australia</option>
                <option value="Global">Global</option>
              </select>
            </label>
          </div>

          <button
            type="button"
            onClick={handleGenerateCandidates}
            className="btn-secondary mt-4"
          >
            Generate Potential Watchlist Candidates
          </button>

          {rankedScannerCandidates.length > 0 ? (
            <div className="mt-4 grid gap-3 lg:grid-cols-2">
              <div className="rounded-xl border border-sky-200 bg-sky-50 p-3 text-left lg:col-span-2">
                <p className="text-sm leading-relaxed text-sky-900">
                  Haizier ranks watchlist candidates by combining market context, economic potential,
                  supply-demand style signals, sentiment hype risk, and research alignment.
                </p>
              </div>

              {rankedScannerCandidates.map((candidate, index) => (
                <article
                  key={candidate.ticker}
                  className={`rounded-xl p-4 text-left shadow-sm ${
                    index === 0
                      ? 'border-2 border-fintech-400 bg-fintech-50 shadow-blue-100'
                      : 'border border-slate-200 bg-white shadow-slate-200/70'
                  }`}
                >
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <p className="text-xs font-semibold uppercase tracking-[0.08em] text-fintech-600">
                      Potential watchlist candidate
                    </p>
                    {index === 0 ? (
                      <span className="rounded-full border border-fintech-300 bg-white px-2.5 py-1 text-[11px] font-semibold uppercase tracking-[0.06em] text-fintech-700">
                        Best match (demo)
                      </span>
                    ) : null}
                  </div>

                  <h3 className="mt-1 text-base font-semibold text-fintech-900">
                    {candidate.ticker} · {candidate.companyName}
                  </h3>

                  <div className="mt-2 flex flex-wrap gap-2 text-[11px] font-medium">
                    <span className="rounded-full border border-slate-200 bg-white px-2.5 py-1 text-slate-700">
                      Sector: {candidate.sector}
                    </span>
                    <span className="rounded-full border border-slate-200 bg-white px-2.5 py-1 text-slate-700">
                      Region: {candidate.region}
                    </span>
                    <span
                      className={`rounded-full border px-2.5 py-1 ${
                        candidate.riskLevel === 'Low'
                          ? 'border-emerald-200 bg-emerald-50 text-emerald-700'
                          : candidate.riskLevel === 'Medium'
                            ? 'border-amber-200 bg-amber-50 text-amber-700'
                            : 'border-rose-200 bg-rose-50 text-rose-700'
                      }`}
                    >
                      Risk: {candidate.riskLevel}
                    </span>
                    <span className="rounded-full border border-blue-200 bg-blue-50 px-2.5 py-1 text-blue-700">
                      Evidence: {candidate.evidenceConfidenceScore}%
                    </span>
                    <span
                      className={`rounded-full border px-2.5 py-1 ${
                        candidate.redditHypeLevel === 'Low'
                          ? 'border-emerald-200 bg-emerald-50 text-emerald-700'
                          : candidate.redditHypeLevel === 'Moderate'
                            ? 'border-amber-200 bg-amber-50 text-amber-700'
                            : 'border-rose-200 bg-rose-50 text-rose-700'
                      }`}
                    >
                      Hype risk: {candidate.redditHypeLevel}
                    </span>
                  </div>

                  <div className="mt-3 space-y-1.5 text-sm text-slate-600">
                    <p><span className="font-medium text-slate-700">Market rationale:</span> {candidate.marketRationale}</p>
                    <p><span className="font-medium text-slate-700">Economic potential signal:</span> {candidate.economicPotentialSignal}</p>
                    <p><span className="font-medium text-slate-700">Supply-demand signal:</span> {candidate.supplyDemandSignal}</p>
                  </div>

                  <div className="mt-3 grid grid-cols-2 gap-2 text-xs">
                    <p className="rounded-lg bg-slate-100 px-2 py-1.5 text-slate-700">Suggested stance: {candidate.suggestedStance}</p>
                    <p className="rounded-lg bg-slate-100 px-2 py-1.5 text-slate-700">Comparison score (demo): {candidate.matchScore}</p>
                  </div>

                  <p className="mt-3 text-xs text-slate-600">
                    <span className="font-medium text-fintech-700">Demo entry zone:</span> {candidate.demoEntryZone}
                  </p>
                  <p className="mt-1 text-xs text-slate-600">
                    <span className="font-medium text-fintech-700">Demo exit zone:</span> {candidate.demoExitZone}
                  </p>
                  <p className="mt-2 text-xs text-slate-500">
                    {candidate.suggestedStance === 'Consider'
                      ? 'Evidence-supported opportunity in this mock scan context.'
                      : 'Requires further research before confidence can improve.'}
                  </p>
                  <p className="mt-1 text-xs text-slate-500">
                    Demo decision-support only. Not personalised financial advice.
                  </p>

                  <button
                    type="button"
                    onClick={() => onScannerSelect(candidate, scannerInput)}
                    className="btn-primary mt-3"
                  >
                    Select Candidate for Analysis
                  </button>
                </article>
              ))}
            </div>
          ) : null}
        </div>

        <label className="field-label">
          Stock Ticker or Company Name
          <input
            type="text"
            value={data.ticker}
            onChange={(event) => onChange('ticker', event.target.value)}
            className={`field-input ${errors.ticker ? 'field-input-error' : ''}`}
            placeholder="e.g. AAPL or Apple"
          />
          {errors.ticker ? <span className="field-error">{errors.ticker}</span> : null}
          {searchError ? <span className="mt-1.5 block text-xs text-amber-600">{searchError}</span> : null}

          {suggestions.length > 0 ? (
            <div className="mt-2 rounded-xl border border-slate-300 bg-white">
              <p className="px-3 py-2 text-xs font-medium uppercase tracking-[0.08em] text-slate-500">
                Suggestions
              </p>
              <ul className="max-h-52 overflow-auto border-t border-slate-200">
                {suggestions.map((item) => (
                  <li key={`${item.exchange}-${item.symbol}`}>
                    <button
                      type="button"
                      className="flex w-full items-start justify-between px-3 py-2 text-left hover:bg-slate-50"
                      onClick={() => onChange('ticker', `${item.exchange}:${item.symbol}`)}
                    >
                      <span>
                        <span className="block text-sm font-semibold text-slate-800">{item.symbol}</span>
                        <span className="block text-xs text-slate-500">{item.name}</span>
                      </span>
                      <span className="text-xs text-slate-500">{item.exchange}</span>
                    </button>
                  </li>
                ))}
              </ul>
            </div>
          ) : null}

          <span className="mt-1.5 block text-xs text-slate-500">
            Tip: You can type a company name or a symbol. If exchange is unknown, we use a sensible default.
          </span>
        </label>

        <label className="field-label">
          Investment Horizon
          <select
            value={data.horizon}
            onChange={(event) => onChange('horizon', event.target.value)}
            className={`field-input ${errors.horizon ? 'field-input-error' : ''}`}
          >
            <option value="">Select horizon</option>
            <option value="Short-term (0-12 months)">Short-term (0-12 months)</option>
            <option value="Medium-term (1-3 years)">Medium-term (1-3 years)</option>
            <option value="Long-term (3+ years)">Long-term (3+ years)</option>
          </select>
          {errors.horizon ? <span className="field-error">{errors.horizon}</span> : null}
        </label>

        <label className="field-label">
          Intended Investment Amount Range
          <select
            value={data.amountRange}
            onChange={(event) => onChange('amountRange', event.target.value)}
            className="field-input"
          >
            <option value="">Select range (optional)</option>
            <option value="Below $1,000">Below $1,000</option>
            <option value="$1,000 - $5,000">$1,000 - $5,000</option>
            <option value="$5,001 - $20,000">$5,001 - $20,000</option>
            <option value="Above $20,000">Above $20,000</option>
          </select>
        </label>

        <fieldset className="rounded-xl border border-slate-200 bg-slate-50 p-4 sm:p-5">
          <legend className="px-1 text-left text-sm font-medium text-slate-700">Signal Selection</legend>
          <div className="mt-3 grid gap-2.5 sm:grid-cols-2">
            {signalOptions.map((signal) => (
              <label
                key={signal}
                className="flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-700"
              >
                <input
                  type="checkbox"
                  checked={data.signals.includes(signal)}
                  onChange={() => toggleSignal(signal)}
                  className="h-4 w-4 rounded border-slate-300 bg-white text-fintech-500"
                />
                {signal}
              </label>
            ))}
          </div>
          <p className="mt-3 text-xs leading-relaxed text-slate-500">
            Tip: selecting more than one signal improves cross-evidence confidence.
          </p>
        </fieldset>
      </div>

      <button
        type="button"
        onClick={onSubmit}
        disabled={isSubmitting}
        className="btn-primary mt-6 disabled:cursor-not-allowed disabled:opacity-70"
      >
        {isSubmitting ? 'Generating live analysis...' : 'Generate Analysis'}
      </button>
      {submitError ? (
        <p className="info-alert mt-4 border-rose-200 bg-rose-50 text-rose-700">
          {submitError}
        </p>
      ) : null}
    </section>
  )
}
