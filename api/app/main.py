from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.config import settings
from app.routes.analysis import router as analysis_router
from app.routes.health import router as health_router


app = FastAPI(
    title="Haizier API",
    description="Python backend scaffold for the Haizier educational decision-support MVP.",
    version="0.1.0",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.allowed_origins_list,
    allow_credentials=True,
    allow_methods=["GET", "POST", "OPTIONS"],
    allow_headers=["*"],
)

app.include_router(health_router, prefix="/api")
app.include_router(analysis_router, prefix="/api")


@app.on_event("startup")
def log_environment_status() -> None:
    print(
        "Haizier env status: "
        f"ALPHA_VANTAGE_API_KEY loaded={bool(settings.alpha_vantage_api_key)}, "
        f"SUPABASE_URL loaded={bool(settings.supabase_url)}, "
        f"SUPABASE_SERVICE_ROLE_KEY loaded={bool(settings.supabase_service_role_key)}"
    )


@app.get("/")
def root() -> dict[str, str]:
    return {"message": "Haizier API is running. Use /api/health for status checks."}