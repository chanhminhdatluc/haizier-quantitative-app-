import type { StockOption } from '../data/stockUniverse'

const FINNHUB_SEARCH_ENDPOINT = 'https://finnhub.io/api/v1/search'

interface FinnhubSearchResponse {
  result?: Array<{
    description?: string
    displaySymbol?: string
    symbol?: string
    type?: string
  }>
}

const inferExchange = (symbol: string): 'NASDAQ' | 'NYSE' => {
  if (symbol.includes(':')) {
    const [exchange] = symbol.split(':')
    return exchange.toUpperCase() === 'NYSE' ? 'NYSE' : 'NASDAQ'
  }

  // lightweight heuristic for MVP; defaults to NASDAQ when unknown
  return 'NASDAQ'
}

const normalizeApiOption = (entry: NonNullable<FinnhubSearchResponse['result']>[number]): StockOption | null => {
  const rawSymbol = (entry.displaySymbol || entry.symbol || '').trim().toUpperCase()
  const name = (entry.description || '').trim()
  if (!rawSymbol || !name) return null

  const symbolOnly = rawSymbol.includes(':') ? rawSymbol.split(':').at(-1) || rawSymbol : rawSymbol

  return {
    symbol: symbolOnly,
    name,
    exchange: inferExchange(rawSymbol),
  }
}

export const searchStocksFromApi = async (query: string): Promise<StockOption[]> => {
  const apiKey = import.meta.env.VITE_FINNHUB_API_KEY as string | undefined
  if (!apiKey) return []

  const url = `${FINNHUB_SEARCH_ENDPOINT}?q=${encodeURIComponent(query)}&token=${encodeURIComponent(apiKey)}`
  const response = await fetch(url)
  if (!response.ok) {
    throw new Error('Stock search service is currently unavailable.')
  }

  const payload = (await response.json()) as FinnhubSearchResponse
  const mapped = (payload.result || []).map(normalizeApiOption).filter((item): item is StockOption => Boolean(item))

  // dedupe by symbol + keep first 8
  const deduped = mapped.filter(
    (item, index, arr) => arr.findIndex((x) => x.symbol === item.symbol && x.exchange === item.exchange) === index,
  )

  return deduped.slice(0, 8)
}
