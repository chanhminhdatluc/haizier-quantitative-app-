import { STOCK_UNIVERSE, type StockOption } from '../data/stockUniverse'

export interface ResolvedSymbol {
  input: string
  displayName?: string
  tradingViewSymbol: string
  exchange: string
  symbol: string
  usedDefaultExchange: boolean
  isResolved: boolean
  message?: string
}

const FALLBACK_EXCHANGE = 'NASDAQ'
const FALLBACK_SYMBOL = 'AAPL'

const cleanInput = (value: string) => value.trim().replace(/\s+/g, ' ')

const sanitizeSymbol = (value: string) => value.toUpperCase().replace(/[^A-Z0-9.-]/g, '')

const findLocalMatch = (value: string) => {
  const query = value.trim().toUpperCase()
  if (!query) return null

  return (
    STOCK_UNIVERSE.find((item) => item.symbol === query) ||
    STOCK_UNIVERSE.find((item) => item.name.toUpperCase() === query) ||
    STOCK_UNIVERSE.find((item) => item.name.toUpperCase().includes(query))
  )
}

export const resolveTradingViewSymbol = (raw: string): ResolvedSymbol => {
  const input = cleanInput(raw)

  if (!input) {
    return {
      input,
      tradingViewSymbol: `${FALLBACK_EXCHANGE}:${FALLBACK_SYMBOL}`,
      exchange: FALLBACK_EXCHANGE,
      symbol: FALLBACK_SYMBOL,
      usedDefaultExchange: true,
      isResolved: false,
      message: 'Please enter a stock ticker or company name to load a live chart.',
    }
  }

  const uppercase = input.toUpperCase()

  if (uppercase.includes(':')) {
    const [exchange, ...rest] = uppercase.split(':')
    const symbol = rest.join(':').trim()

    if (exchange && symbol) {
      return {
        input,
        tradingViewSymbol: `${exchange}:${symbol}`,
        exchange,
        symbol,
        usedDefaultExchange: false,
        isResolved: true,
      }
    }
  }

  const localMatch = findLocalMatch(input)
  if (localMatch) {
    return {
      input,
      displayName: localMatch.name,
      tradingViewSymbol: `${localMatch.exchange}:${localMatch.symbol}`,
      exchange: localMatch.exchange,
      symbol: localMatch.symbol,
      usedDefaultExchange: false,
      isResolved: true,
    }
  }

  const symbolGuess = sanitizeSymbol(uppercase)

  if (!symbolGuess || symbolGuess.length > 12) {
    return {
      input,
      tradingViewSymbol: `${FALLBACK_EXCHANGE}:${FALLBACK_SYMBOL}`,
      exchange: FALLBACK_EXCHANGE,
      symbol: FALLBACK_SYMBOL,
      usedDefaultExchange: true,
      isResolved: false,
      message:
        'We could not confidently resolve that symbol. Try a ticker like AAPL or select a suggestion.',
    }
  }

  return {
    input,
    tradingViewSymbol: `${FALLBACK_EXCHANGE}:${symbolGuess}`,
    exchange: FALLBACK_EXCHANGE,
    symbol: symbolGuess,
    usedDefaultExchange: true,
    isResolved: true,
    message: `Exchange not specified. Attempting ${FALLBACK_EXCHANGE}:${symbolGuess}. Chart provider may require the correct exchange prefix.`,
  }
}

export const getLocalStockSuggestions = (query: string, limit = 8): StockOption[] => {
  const cleaned = query.trim().toUpperCase()
  if (!cleaned) return []

  return STOCK_UNIVERSE.filter(
    (item) => item.symbol.includes(cleaned) || item.name.toUpperCase().includes(cleaned),
  ).slice(0, limit)
}
