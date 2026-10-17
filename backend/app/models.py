from typing import List, Optional
from pydantic import BaseModel, Field


class ScanRequest(BaseModel):
    text: str = Field(..., max_length=2000, description="Raw text of the suspicious message up to 2000 chars")


class TokenSpan(BaseModel):
    token: str
    category: str  # "urgency", "threat", "link", "credential"
    start: int
    end: int
    color: str     # visual indicator theme e.g. "amber", "purple", "blue", "red"


class RuleResult(BaseModel):
    id: str
    name: str
    category: str
    weight: int
    triggered: bool
    score_awarded: int
    matches: List[str]
    description: str
    recommendation: str


class ActionStep(BaseModel):
    title: str
    description: str
    priority: str  # "critical", "warning", "info"
    icon: str
    action_url: Optional[str] = None
    action_label: Optional[str] = None


class ScanResponse(BaseModel):
    score: int
    risk_tier: str  # "Low", "Medium", "High"
    risk_color: str  # "emerald", "amber", "rose"
    summary: str
    rules_triggered: List[RuleResult]
    highlight_tokens: List[TokenSpan]
    action_steps: List[ActionStep]
    character_count: int
