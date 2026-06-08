import { useEffect, useId, useMemo, useRef } from 'react'
import { resolveTradingViewSymbol } from '../utils/symbolResolver'

interface TradingViewChartProps {
  ticker: string
}

export function TradingViewChart({ ticker }: TradingViewChartProps) {
  const chartId = useId().replace(/:/g, '-')
  const widgetRef = useRef<HTMLDivElement | null>(null)
  const resolved = useMemo(() => resolveTradingViewSymbol(ticker), [ticker])
  const symbol = resolved.tradingViewSymbol

  useEffect(() => {
    if (!widgetRef.current) return undefined

    widgetRef.current.innerHTML = ''

    const container = document.createElement('div')
    container.className = 'tradingview-widget-container h-full w-full'

    const widgetHost = document.createElement('div')
    widgetHost.className = 'tradingview-widget-container__widget h-full w-full'
    widgetHost.id = `tradingview-widget-${chartId}`

    const script = document.createElement('script')
    script.src = 'https://s3.tradingview.com/external-embedding/embed-widget-advanced-chart.js'
    script.type = 'text/javascript'
    script.async = true
    script.innerHTML = JSON.stringify({
      autosize: true,
      symbol,
      interval: 'D',
      timezone: 'Etc/UTC',
      theme: 'light',
      style: '1',
      locale: 'en',
      allow_symbol_change: false,
      calendar: false,
      hide_side_toolbar: false,
      support_host: 'https://www.tradingview.com',
    })

    container.appendChild(widgetHost)
    container.appendChild(script)
    widgetRef.current.appendChild(container)

    return () => {
      if (widgetRef.current) {
        widgetRef.current.innerHTML = ''
      }
    }
  }, [chartId, symbol])

  return (
    <section className="rounded-xl border border-slate-200 bg-slate-50 p-3 sm:p-4">
      <div className="mb-3 flex items-center justify-between gap-2">
        <p className="text-xs font-semibold uppercase tracking-[0.1em] text-fintech-600">Live Market Chart</p>
        <p className="text-xs text-slate-500">{symbol}</p>
      </div>

      {!resolved.isResolved ? (
        <p className="mb-2 rounded-lg border border-amber-300 bg-amber-50 px-3 py-2 text-xs text-amber-700">
          {resolved.message}
        </p>
      ) : resolved.usedDefaultExchange && resolved.message ? (
        <p className="mb-2 rounded-lg border border-sky-300 bg-sky-50 px-3 py-2 text-xs text-sky-700">
          {resolved.message}
        </p>
      ) : null}

      <div className="h-[460px] w-full overflow-hidden rounded-lg border border-slate-200 bg-white">
        <div ref={widgetRef} className="h-full w-full" />
      </div>

      <p className="mt-3 text-xs leading-relaxed text-slate-600">
        Live chart is embedded for demonstration. Forecast scores are mock decision-support outputs and
        not financial advice.
      </p>
    </section>
  )
}
