import type { AnalysisResult, RiskProfileForm, SignalType, StockInputForm } from '../types'

const clamp = (value: number, min = 0, max = 100) => Math.min(max, Math.max(min, value))

const signalBoost: Record<SignalType, number> = {
  'Market Trend': 5,
  'Sentiment Intelligence': 4,
  'AI Forecast': 6,
  'Research Evidence': 7,
}

const riskAdjustment: Record<string, number> = {
  Conservative: 3,
  Balanced: 0,
  Aggressive: -2,
}

export const generateMockAnalysis = (
  stockInput: StockInputForm,
  riskProfile: RiskProfileForm,
): AnalysisResult => {
  const tickerSeed = stockInput.ticker
    .toUpperCase()
    .split('')
    .reduce((acc, char) => acc + char.charCodeAt(0), 0)

  const selectedSignalBoost = stockInput.signals.reduce(
    (acc, signal) => acc + signalBoost[signal],
    0,
  )

  const adjustment = riskAdjustment[riskProfile.riskTolerance] ?? 0

  const marketTrend = clamp(52 + (tickerSeed % 18) + selectedSignalBoost * 0.5 + adjustment)
  const sentiment = clamp(50 + (tickerSeed % 15) + selectedSignalBoost * 0.4 - 2)
  const aiConfidence = clamp(54 + (tickerSeed % 16) + selectedSignalBoost * 0.6)
  const researchAlignment = clamp(55 + (tickerSeed % 14) + selectedSignalBoost * 0.7 + adjustment)

  const evidenceConfidence = clamp(
    Math.round(
      marketTrend * 0.25 + sentiment * 0.2 + aiConfidence * 0.25 + researchAlignment * 0.3,
    ),
  )

  const hypeRisk = clamp(Math.round(100 - evidenceConfidence + (sentiment > 78 ? 5 : 0)))

  const verdict: AnalysisResult['verdict'] =
    evidenceConfidence >= 65 ? 'evidence-supported' : 'hype-driven'

  const explanation =
    verdict === 'evidence-supported'
      ? 'The selected signals show moderate-to-strong alignment. This opportunity appears to be supported by multiple evidence layers, not only short-term sentiment.'
      : 'The signal mix suggests weaker evidence alignment and elevated hype risk. Consider collecting more evidence before relying on this opportunity.'

  return {
    marketTrend,
    sentiment,
    aiConfidence,
    researchAlignment,
    hypeRisk,
    evidenceConfidence,
    verdict,
    explanation,
  }
}
