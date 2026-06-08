import os
from typing import Any, Dict, List, Optional

import httpx


class SupabaseService:
    def __init__(self) -> None:
        self.supabase_url = os.getenv("SUPABASE_URL")
        self.service_role_key = os.getenv("SUPABASE_SERVICE_ROLE_KEY")

        if not self.supabase_url:
            raise ValueError("Missing SUPABASE_URL backend environment variable.")

        if not self.service_role_key:
            raise ValueError("Missing SUPABASE_SERVICE_ROLE_KEY backend environment variable.")

        self.table_url = f"{self.supabase_url.rstrip('/')}/rest/v1/haizier_analyses"

        self.headers = {
            "apikey": self.service_role_key,
            "Authorization": f"Bearer {self.service_role_key}",
            "Content-Type": "application/json",
            "Prefer": "return=representation",
        }

    async def save_analysis_record(self, payload: Dict[str, Any]) -> Dict[str, Any]:
        allowed_payload = {
            "ticker": payload.get("ticker"),
            "asset_name": payload.get("asset_name"),
            "risk_profile": payload.get("risk_profile"),
            "investment_horizon": payload.get("investment_horizon"),
            "investment_amount_range": payload.get("investment_amount_range"),
            "selected_signals": payload.get("selected_signals") or [],
            "market_data": payload.get("market_data") or {},
            "analysis_result": payload.get("analysis_result") or {},
        }

        async with httpx.AsyncClient(timeout=20.0) as client:
            response = await client.post(
                self.table_url,
                headers=self.headers,
                json=allowed_payload,
            )

        if response.status_code >= 400:
            raise RuntimeError(
                f"Supabase REST insert failed with status {response.status_code}: {response.text}"
            )

        inserted_records: List[Dict[str, Any]] = response.json()

        if not inserted_records:
            raise RuntimeError("Supabase REST insert succeeded but returned no inserted record.")

        return inserted_records[0]


supabase_service = SupabaseService()
async def save_analysis_record(request, market_data, analysis_result):
    market_data_payload = (
        market_data.model_dump()
        if hasattr(market_data, "model_dump")
        else market_data
    )

    analysis_result_payload = (
        analysis_result.model_dump()
        if hasattr(analysis_result, "model_dump")
        else analysis_result
    )

    payload = {
        "ticker": market_data_payload.get("symbol") or request.ticker,
        "asset_name": request.ticker,
        "risk_profile": request.risk_profile.model_dump()
        if hasattr(request.risk_profile, "model_dump")
        else request.risk_profile,
        "investment_horizon": request.investment_horizon,
        "investment_amount_range": getattr(request, "investment_amount_range", None),
        "selected_signals": getattr(request, "selected_signals", []),
        "market_data": market_data_payload,
        "analysis_result": analysis_result_payload,
    }

    return await supabase_service.save_analysis_record(payload)