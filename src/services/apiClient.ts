import type { AnalysisResult, LoginForm, RiskProfileForm, StockInputForm } from '../types'

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000'

export async function getApiHealth(): Promise<{ status: string; service: string }> {
  const response = await fetch(`${API_BASE_URL}/api/health`)

  if (!response.ok) {
    throw new Error('Haizier API health check failed.')
  }

  return response.json() as Promise<{ status: string; service: string }>
}

interface BackendAnalysisRecord {
  id: string
  created_at?: string
  analysis_result: {
    market_trend: number
    sentiment: number
    ai_confidence: number
    research_alignment: number
    hype_risk: number
    evidence_confidence: number
    verdict: 'evidence-supported' | 'hype-driven'
    explanation: string
  }
  market_data: {
    symbol: string
    last_refreshed: string
    latest_trading_day: string
    latest_close: number
    previous_close: number
    change: number
    change_percent: number
    volume: number
    source: string
  }
}

const getErrorMessage = async (response: Response) => {
  try {
    const payload = (await response.json()) as {
      detail?: string | { message?: string; supabase_error?: string; [key: string]: unknown }
    }

    if (typeof payload.detail === 'string') {
      return payload.detail
    }

    if (payload.detail && typeof payload.detail === 'object') {
      const message = payload.detail.message
      const supabaseError = payload.detail.supabase_error

      if (message && supabaseError) return `${message} ${supabaseError}`
      if (message) return message
      if (supabaseError) return supabaseError
      return JSON.stringify(payload.detail)
    }

    return 'Unable to generate analysis. Please try again.'
  } catch {
    return 'Unable to generate analysis. Please try again.'
  }
}

export async function submitAnalysis(
  login: LoginForm,
  riskProfile: RiskProfileForm,
  stockInput: StockInputForm,
): Promise<AnalysisResult> {
  const response = await fetch(`${API_BASE_URL}/api/analyze`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      email: login.email,
      experience: riskProfile.experience,
      risk_tolerance: riskProfile.riskTolerance,
      goal: riskProfile.goal,
      consent: riskProfile.consent,
      ticker: stockInput.ticker,
      horizon: stockInput.horizon,
      amount_range: stockInput.amountRange || null,
      signals: stockInput.signals,
    }),
  })

  if (!response.ok) {
    throw new Error(await getErrorMessage(response))
  }

  const record = (await response.json()) as BackendAnalysisRecord
  return {
    marketTrend: record.analysis_result.market_trend,
    sentiment: record.analysis_result.sentiment,
    aiConfidence: record.analysis_result.ai_confidence,
    researchAlignment: record.analysis_result.research_alignment,
    hypeRisk: record.analysis_result.hype_risk,
    evidenceConfidence: record.analysis_result.evidence_confidence,
    verdict: record.analysis_result.verdict,
    explanation: record.analysis_result.explanation,
    savedRecordId: record.id,
    savedAt: record.created_at,
    marketData: {
      symbol: record.market_data.symbol,
      lastRefreshed: record.market_data.last_refreshed,
      latestTradingDay: record.market_data.latest_trading_day,
      latestClose: record.market_data.latest_close,
      previousClose: record.market_data.previous_close,
      change: record.market_data.change,
      changePercent: record.market_data.change_percent,
      volume: record.market_data.volume,
      source: record.market_data.source,
    },
  }
}

export { API_BASE_URL }