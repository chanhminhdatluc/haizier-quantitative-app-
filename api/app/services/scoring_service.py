from app.models.analysis import AnalysisRequest, AnalysisResult, MarketDataSummary


SIGNAL_BOOST = {
    "Market Trend": 5,
    "Sentiment Intelligence": 4,
    "AI Forecast": 6,
    "Research Evidence": 7,
}

RISK_ADJUSTMENT = {
    "Conservative": 3,
    "Balanced": 0,
    "Aggressive": -2,
}


def _clamp(value: float, minimum: int = 0, maximum: int = 100) -> int:
    return int(min(maximum, max(minimum, round(value))))


def generate_haizier_analysis(
    request: AnalysisRequest,
    market_data: MarketDataSummary,
) -> AnalysisResult:
    selected_signal_boost = sum(SIGNAL_BOOST.get(signal, 0) for signal in request.signals)
    risk_adjustment = RISK_ADJUSTMENT.get(request.risk_tolerance, 0)
    momentum_adjustment = max(-12, min(12, market_data.change_percent * 2.5))
    volume_seed = min(10, max(0, len(str(market_data.volume)) - 4))

    market_trend = _clamp(58 + momentum_adjustment + selected_signal_boost * 0.45 + risk_adjustment)
    sentiment = _clamp(52 + momentum_adjustment * 0.6 + selected_signal_boost * 0.35)
    ai_confidence = _clamp(55 + abs(momentum_adjustment) * 0.5 + selected_signal_boost * 0.6 + volume_seed)
    research_alignment = _clamp(57 + selected_signal_boost * 0.7 + risk_adjustment + (4 if market_data.volume > 0 else -4))

    evidence_confidence = _clamp(
        market_trend * 0.3 + sentiment * 0.18 + ai_confidence * 0.24 + research_alignment * 0.28
    )
    hype_risk = _clamp(100 - evidence_confidence + (8 if abs(market_data.change_percent) >= 5 else 0))
    verdict = "evidence-supported" if evidence_confidence >= 65 else "hype-driven"

    direction = "rose" if market_data.change >= 0 else "fell"
    explanation = (
        f"Alpha Vantage daily data shows {request.ticker.upper()} {direction} "
        f"{abs(market_data.change_percent):.2f}% on the latest trading day. "
    )
    if verdict == "evidence-supported":
        explanation += "The live market movement and selected intelligence signals show moderate-to-strong cross-evidence alignment."
    else:
        explanation += "The live market movement and selected signals show weaker alignment or elevated volatility risk, so further research is recommended."

    return AnalysisResult(
        market_trend=market_trend,
        sentiment=sentiment,
        ai_confidence=ai_confidence,
        research_alignment=research_alignment,
        hype_risk=hype_risk,
        evidence_confidence=evidence_confidence,
        verdict=verdict,
        explanation=explanation,
    )