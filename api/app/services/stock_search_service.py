from typing import Any

import httpx
from fastapi import HTTPException, status

from app.config import settings
from app.models.analysis import MarketDataSummary


ALPHA_VANTAGE_ENDPOINT = "https://www.alphavantage.co/query"


def _normalise_symbol(raw_symbol: str) -> str:
    symbol = raw_symbol.strip().upper().split(":")[-1]
    symbol = "".join(char for char in symbol if char.isalnum() or char in {".", "-"})
    if not symbol or len(symbol) > 15:
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            detail="Please enter a valid stock ticker symbol.",
        )
    return symbol


def _to_float(value: str) -> float:
    try:
        return float(value)
    except (TypeError, ValueError) as exc:
        raise HTTPException(
            status_code=status.HTTP_502_BAD_GATEWAY,
            detail="Market data provider returned an unexpected numeric value.",
        ) from exc


def _to_int(value: str) -> int:
    try:
        return int(float(value))
    except (TypeError, ValueError) as exc:
        raise HTTPException(
            status_code=status.HTTP_502_BAD_GATEWAY,
            detail="Market data provider returned an unexpected volume value.",
        ) from exc


async def fetch_market_data_summary(raw_symbol: str) -> MarketDataSummary:
    if not settings.alpha_vantage_api_key:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Missing ALPHA_VANTAGE_API_KEY backend environment variable.",
        )

    symbol = _normalise_symbol(raw_symbol)
    params = {
        "function": "TIME_SERIES_DAILY",
        "symbol": symbol,
        "apikey": settings.alpha_vantage_api_key,
        "outputsize": "compact",
    }

    try:
        async with httpx.AsyncClient(timeout=12) as client:
            response = await client.get(ALPHA_VANTAGE_ENDPOINT, params=params)
            response.raise_for_status()
    except httpx.HTTPError as exc:
        raise HTTPException(
            status_code=status.HTTP_502_BAD_GATEWAY,
            detail="Failed to retrieve market data from Alpha Vantage.",
        ) from exc

    payload: dict[str, Any] = response.json()

    if "Error Message" in payload:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Alpha Vantage could not find that ticker symbol.",
        )

    if "Note" in payload or "Information" in payload:
        raise HTTPException(
            status_code=status.HTTP_429_TOO_MANY_REQUESTS,
            detail="Alpha Vantage rate limit or service message received. Please try again later.",
        )

    time_series = payload.get("Time Series (Daily)")
    metadata = payload.get("Meta Data", {})
    if not isinstance(time_series, dict) or len(time_series) < 2:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="No daily market data was found for that ticker symbol.",
        )

    trading_days = sorted(time_series.keys(), reverse=True)
    latest_day = trading_days[0]
    previous_day = trading_days[1]
    latest = time_series[latest_day]
    previous = time_series[previous_day]

    latest_close = _to_float(latest.get("4. close"))
    previous_close = _to_float(previous.get("4. close"))
    change = round(latest_close - previous_close, 4)
    change_percent = round((change / previous_close) * 100, 4) if previous_close else 0

    return MarketDataSummary(
        symbol=str(metadata.get("2. Symbol", symbol)).upper(),
        last_refreshed=str(metadata.get("3. Last Refreshed", latest_day)),
        latest_trading_day=latest_day,
        latest_close=latest_close,
        previous_close=previous_close,
        change=change,
        change_percent=change_percent,
        volume=_to_int(latest.get("5. volume")),
    )