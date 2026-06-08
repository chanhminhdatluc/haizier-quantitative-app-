export type Step = 1 | 2 | 3 | 4 | 5

export type SignalType =
  | 'Market Trend'
  | 'Sentiment Intelligence'
  | 'AI Forecast'
  | 'Research Evidence'

export interface LoginForm {
  email: string
  password: string
}

export interface RiskProfileForm {
  experience: string
  riskTolerance: string
  goal: string
  consent: boolean
}

export interface StockInputForm {
  ticker: string
  horizon: string
  amountRange: string
  signals: SignalType[]
}

export interface AnalysisResult {
  marketTrend: number
  sentiment: number
  aiConfidence: number
  researchAlignment: number
  hypeRisk: number
  evidenceConfidence: number
  verdict: 'evidence-supported' | 'hype-driven'
  explanation: string
  savedRecordId?: string
  savedAt?: string
  marketData?: MarketDataSummary
}

export interface MarketDataSummary {
  symbol: string
  lastRefreshed: string
  latestTradingDay: string
  latestClose: number
  previousClose: number
  change: number
  changePercent: number
  volume: number
  source: string
}

export type MarketCondition =
  | 'Growth Market'
  | 'Defensive Market'
  | 'Volatile Market'
  | 'Recovery Market'

export type ScannerHorizon = 'Short-term' | 'Medium-term' | 'Long-term'
export type ScannerRiskPreference = 'Low' | 'Medium' | 'High'
export type ScannerSector =
  | 'Technology'
  | 'Banking'
  | 'Energy'
  | 'Consumer'
  | 'Healthcare'
  | 'Mining'
  | 'Any'
export type ScannerRegion = 'US' | 'Australia' | 'Global'

export interface OpportunityScannerInput {
  marketCondition: MarketCondition
  horizon: ScannerHorizon
  riskPreference: ScannerRiskPreference
  sectorInterest: ScannerSector
  region: ScannerRegion
}

export interface ScannerCandidate {
  ticker: string
  companyName: string
  sector: Exclude<ScannerSector, 'Any'>
  region: Exclude<ScannerRegion, 'Global'>
  marketRationale: string
  economicPotentialSignal: string
  supplyDemandSignal: string
  redditHypeLevel: 'Low' | 'Moderate' | 'High'
  evidenceConfidenceScore: number
  riskLevel: 'Low' | 'Medium' | 'High'
  demoEntryZone: string
  demoExitZone: string
  suggestedStance: 'Consider' | 'Watch' | 'High Caution'
}
