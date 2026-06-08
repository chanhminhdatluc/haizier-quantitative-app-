from typing import Any

from fastapi import HTTPException, status
from supabase import create_client

from app.config import settings
from app.models.analysis import AnalysisRequest, AnalysisResult, MarketDataSummary


TABLE_NAME = "haizier_analyses"


def _safe_error_text(exc: Exception) -> str:
    text = str(exc)
    for secret in (settings.supabase_service_role_key, settings.supabase_url):
        if secret:
            text = text.replace(secret, "[redacted]")
    return text


def _get_client():
    if not settings.supabase_url:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Missing SUPABASE_URL backend environment variable.",
        )
    if not settings.supabase_service_role_key:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Missing SUPABASE_SERVICE_ROLE_KEY backend environment variable.",
        )

    return create_client(settings.supabase_url, settings.supabase_service_role_key)


def save_analysis_record(
    request: AnalysisRequest,
    market_data: MarketDataSummary,
    analysis_result: AnalysisResult,
) -> dict[str, Any]:
    client = _get_client()
    market_payload = market_data.model_dump(mode="json")
    analysis_payload = analysis_result.model_dump(mode="json")

    record = {
        "ticker": market_data.symbol,
        "asset_name": request.ticker,
        "risk_profile": {
            "email": request.email,
            "experience": request.experience,
            "risk_tolerance": request.risk_tolerance,
            "goal": request.goal,
            "consent": request.consent,
        },
        "investment_horizon": request.horizon,
        "investment_amount_range": request.amount_range,
        "selected_signals": list(request.signals),
        "market_data": market_payload,
        "analysis_result": analysis_payload,
    }

    try:
        response = client.table(TABLE_NAME).insert(record).execute()
    except Exception as exc:  # Supabase client raises multiple exception types.
        raise HTTPException(
            status_code=status.HTTP_502_BAD_GATEWAY,
            detail={
                "message": "Failed to save analysis record to Supabase.",
                "supabase_error": _safe_error_text(exc),
                "table": TABLE_NAME,
            },
        ) from exc

    if not response.data:
        raise HTTPException(
            status_code=status.HTTP_502_BAD_GATEWAY,
            detail="Supabase did not return the saved analysis record.",
        )

    return response.data[0]