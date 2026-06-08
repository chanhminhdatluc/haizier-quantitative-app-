from fastapi import APIRouter

from app.models.analysis import AnalysisRequest
from app.services.scoring_service import generate_haizier_analysis
from app.services.stock_search_service import fetch_market_data_summary
from app.services.supabase_service import save_analysis_record


router = APIRouter(prefix="/analyze", tags=["analysis"])


@router.post("")
async def create_analysis(request: AnalysisRequest):
    market_data = await fetch_market_data_summary(request.ticker)
    analysis_result = generate_haizier_analysis(request, market_data)
    saved_record = save_analysis_record(request, market_data, analysis_result)

    return saved_record