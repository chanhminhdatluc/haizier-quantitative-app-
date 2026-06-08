from pydantic import BaseModel


class RiskProfile(BaseModel):
    experience: str
    risk_tolerance: str
    goal: str
    consent: bool