import type { AnalysisResult, RiskProfileForm, SignalType, StockInputForm } from '../types'

interface FinalConfirmationScreenProps {
  status: 'success' | 'failure'
  riskProfile: RiskProfileForm
  stockInput: StockInputForm
  analysisResult: AnalysisResult | null
  onRestart: () => void
}

const formatSignals = (signals: SignalType[]) =>
  signals.length > 0 ? signals.join(', ') : 'No signals selected'

export function FinalConfirmationScreen({
  status,
  riskProfile,
  stockInput,
  analysisResult,
  onRestart,
}: FinalConfirmationScreenProps) {
  const isSuccess = status === 'success'

  return (
    <section className="surface-card">
      <p className="helper-heading">Step 5 · Outcome Summary</p>
      <h2 className="section-title">
        {isSuccess ? 'Analysis Generated Successfully' : 'Unable to Generate Analysis'}
      </h2>
      <p className="section-subtitle">
        {isSuccess
          ? 'Your demo intelligence summary is ready to review.'
          : 'Please restart and ensure consent and required fields are completed.'}
      </p>

      <div className="mt-6 grid gap-3 rounded-xl border border-slate-200 bg-slate-50 p-4 text-left text-sm text-slate-700 sm:grid-cols-2">
        <p>
          <span className="text-slate-500">Ticker:</span> {stockInput.ticker || 'N/A'}
        </p>
        <p>
          <span className="text-slate-500">Risk Profile:</span> {riskProfile.riskTolerance || 'N/A'}
        </p>
        <p>
          <span className="text-slate-500">Investment Horizon:</span> {stockInput.horizon || 'N/A'}
        </p>
        <p>
          <span className="text-slate-500">Selected Signals:</span> {formatSignals(stockInput.signals)}
        </p>
        <p>
          <span className="text-slate-500">Evidence Confidence Score:</span>{' '}
          {analysisResult ? `${analysisResult.evidenceConfidence}%` : 'N/A'}
        </p>
        <p>
          <span className="text-slate-500">Supabase Record ID:</span>{' '}
          {analysisResult?.savedRecordId || 'N/A'}
        </p>
        <p>
          <span className="text-slate-500">Market Data Source:</span>{' '}
          {analysisResult?.marketData?.source || 'N/A'}
        </p>
      </div>

      <p className="ethics-note mt-5">
        Interpretation note: this result is an educational output saved for assignment evidence. It
        should not be treated as financial advice or a recommendation to buy/sell.
      </p>

      <button
        type="button"
        onClick={onRestart}
        className="btn-primary mt-6"
      >
        Restart
      </button>
    </section>
  )
}
