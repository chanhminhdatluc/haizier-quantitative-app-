from datetime import datetime
from typing import Any

from pydantic import BaseModel, Field


class AnalysisRequest(BaseModel):
    email: str = Field(..., min_length=3)
    experience: str
    risk_tolerance: str
    goal: str
    consent: bool
    ticker: str
    horizon: str
    amount_range: str | None = None
    signals: list[str] = Field(default_factory=list)


class AnalysisResult(BaseModel):
    market_trend: int
    sentiment: int
    ai_confidence: int
    research_alignment: int
    hype_risk: int
    evidence_confidence: int
    verdict: str
    explanation: str


class MarketDataSummary(BaseModel):
    symbol: str
    last_refreshed: str
    latest_trading_day: str
    latest_close: float
    previous_close: float
    change: float
    change_percent: float
    volume: int
    source: str = "Alpha Vantage"


class SavedAnalysisRecord(BaseModel):
    id: str
    created_at: datetime | str | None = None
    email: str
    ticker: str
    request_payload: dict[str, Any]
    market_data: MarketDataSummary | dict[str, Any]
    analysis_result: AnalysisResult | dict[str, Any]