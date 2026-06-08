import type { OpportunityScannerInput, RiskProfileForm, ScannerCandidate } from '../types'

const clamp = (value: number, min = 0, max = 100) => Math.min(max, Math.max(min, value))

const seedFrom = (value: string) =>
  value
    .split('')
    .reduce((acc, char) => acc + char.charCodeAt(0), 0)

const CANDIDATE_POOL: Array<{
  ticker: string
  companyName: string
  sector: ScannerCandidate['sector']
  region: ScannerCandidate['region']
}> = [
  { ticker: 'NASDAQ:NVDA', companyName: 'NVIDIA Corporation', sector: 'Technology', region: 'US' },
  { ticker: 'NASDAQ:MSFT', companyName: 'Microsoft Corporation', sector: 'Technology', region: 'US' },
  { ticker: 'NYSE:JPM', companyName: 'JPMorgan Chase & Co.', sector: 'Banking', region: 'US' },
  { ticker: 'NYSE:XOM', companyName: 'Exxon Mobil Corporation', sector: 'Energy', region: 'US' },
  { ticker: 'NYSE:WMT', companyName: 'Walmart Inc.', sector: 'Consumer', region: 'US' },
  { ticker: 'NYSE:PFE', companyName: 'Pfizer Inc.', sector: 'Healthcare', region: 'US' },
  { ticker: 'ASX:BHP', companyName: 'BHP Group Limited', sector: 'Mining', region: 'Australia' },
  { ticker: 'ASX:CBA', companyName: 'Commonwealth Bank of Australia', sector: 'Banking', region: 'Australia' },
  { ticker: 'ASX:CSL', companyName: 'CSL Limited', sector: 'Healthcare', region: 'Australia' },
  { ticker: 'ASX:WES', companyName: 'Wesfarmers Limited', sector: 'Consumer', region: 'Australia' },
]

const marketRationaleByCondition: Record<OpportunityScannerInput['marketCondition'], string> = {
  'Growth Market': 'Momentum-sensitive names are receiving increased watchlist attention in this growth backdrop.',
  'Defensive Market': 'Quality and resilience factors are being prioritised while risk appetite appears selective.',
  'Volatile Market': 'Price swings remain elevated, so setup quality depends on disciplined risk framing.',
  'Recovery Market': 'Early-cycle recovery themes are emerging as confidence gradually improves.',
}

export const generateOpportunityCandidates = (
  scannerInput: OpportunityScannerInput,
  riskProfile: RiskProfileForm,
): ScannerCandidate[] => {
  const baseSeed = seedFrom(
    `${scannerInput.marketCondition}-${scannerInput.horizon}-${scannerInput.riskPreference}-${scannerInput.sectorInterest}-${scannerInput.region}-${riskProfile.riskTolerance}`,
  )

  const filteredByRegion =
    scannerInput.region === 'Global'
      ? CANDIDATE_POOL
      : CANDIDATE_POOL.filter((candidate) => candidate.region === scannerInput.region)

  const filteredPool =
    scannerInput.sectorInterest === 'Any'
      ? filteredByRegion
      : filteredByRegion.filter((candidate) => candidate.sector === scannerInput.sectorInterest)

  const fallbackPool = filteredPool.length >= 4 ? filteredPool : filteredByRegion
  const sorted = [...fallbackPool].sort(
    (a, b) => (seedFrom(`${a.ticker}${baseSeed}`) % 100) - (seedFrom(`${b.ticker}${baseSeed}`) % 100),
  )

  const targetCount = 4 + (baseSeed % 3)
  const selected = sorted.slice(0, Math.min(6, Math.max(4, targetCount)))

  return selected.map((candidate, index) => {
    const candidateSeed = seedFrom(candidate.ticker) + baseSeed + index * 7
    const evidenceConfidenceScore = clamp(
      Math.round(
        54 +
          (candidateSeed % 24) +
          (scannerInput.marketCondition === 'Recovery Market' ? 4 : 0) +
          (scannerInput.riskPreference === 'Low' ? 3 : scannerInput.riskPreference === 'High' ? -2 : 0),
      ),
    )

    const riskLevel: ScannerCandidate['riskLevel'] =
      evidenceConfidenceScore >= 76 ? 'Low' : evidenceConfidenceScore >= 62 ? 'Medium' : 'High'

    const redditHypeLevel: ScannerCandidate['redditHypeLevel'] =
      candidateSeed % 10 >= 7 ? 'High' : candidateSeed % 10 >= 4 ? 'Moderate' : 'Low'

    const suggestedStance: ScannerCandidate['suggestedStance'] =
      evidenceConfidenceScore >= 75 && riskLevel === 'Low'
        ? 'Consider'
        : evidenceConfidenceScore <= 58 || riskLevel === 'High' || redditHypeLevel === 'High'
          ? 'High Caution'
          : 'Watch'

    const entryLow = 42 + (candidateSeed % 33)
    const entryHigh = entryLow + 4 + (candidateSeed % 4)
    const exitLow = entryHigh + 6 + (candidateSeed % 5)
    const exitHigh = exitLow + 5 + (candidateSeed % 6)

    const marketRationale = `${marketRationaleByCondition[scannerInput.marketCondition]} Potential watchlist candidate based on ${scannerInput.horizon.toLowerCase()} positioning.`

    const economicPotentialSignal =
      evidenceConfidenceScore >= 70
        ? 'Economic potential appears comparatively supportive under current mock conditions.'
        : 'Economic potential is mixed and may require further research before conviction increases.'

    const supplyDemandSignal =
      scannerInput.marketCondition === 'Volatile Market'
        ? 'Supply-demand balance shows rapid shifts; momentum persistence is less certain.'
        : 'Supply-demand balance indicates steady participation with moderate liquidity support.'

    return {
      ticker: candidate.ticker,
      companyName: candidate.companyName,
      sector: candidate.sector,
      region: candidate.region,
      marketRationale,
      economicPotentialSignal,
      supplyDemandSignal,
      redditHypeLevel,
      evidenceConfidenceScore,
      riskLevel,
      demoEntryZone: `$${entryLow} - $${entryHigh}`,
      demoExitZone: `$${exitLow} - $${exitHigh}`,
      suggestedStance,
    }
  })
}