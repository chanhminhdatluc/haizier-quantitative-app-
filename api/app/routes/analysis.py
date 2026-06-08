import traceback

from fastapi import APIRouter
from fastapi.responses import JSONResponse

from app.models.analysis import AnalysisRequest
from app.services.scoring_service import generate_haizier_analysis
from app.services.stock_search_service import fetch_market_data_summary
from app.services.supabase_service import save_analysis_record

router = APIRouter(prefix="/analyze", tags=["analysis"])


@router.post("")
async def create_analysis(request: AnalysisRequest):
    try:
        print(f"[analyze] started for ticker={request.ticker}")

        market_data = await fetch_market_data_summary(request.ticker)
        print("[analyze] alpha_vantage_lookup completed")

        analysis_result = generate_haizier_analysis(request, market_data)
        print("[analyze] analysis_generation completed")

        saved_record = await save_analysis_record(request, market_data, analysis_result)
        print("[analyze] supabase_insert completed")

        return saved_record

    except Exception as exc:
        traceback.print_exc()
        return JSONResponse(
            status_code=500,
            content={
                "step": "analysis_route",
                "message": str(exc),
                "error_type": exc.__class__.__name__,
            },
        )