from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from app.models import ScanRequest, ScanResponse
from app.rules import scan_message

app = FastAPI(
    title="Scam Spotter API",
    description="Deterministic, explainable rule engine for detecting SMS & WhatsApp scam triggers",
    version="1.0.0"
)

# Enable CORS for local Vite dev server and production deployments
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/")
def root():
    return {
        "app": "Scam Spotter API",
        "team": "Team P K",
        "framework": "SETU Hackathon",
        "status": "online",
        "documentation": "/docs"
    }


@app.get("/api/health")
def health_check():
    return {"status": "healthy", "service": "scam-spotter-rule-engine"}


@app.post("/api/scan", response_model=ScanResponse)
def scan_endpoint(payload: ScanRequest):
    if len(payload.text) > 2000:
        raise HTTPException(status_code=400, detail="Message exceeds 2000 character limit.")
        
    result = scan_message(payload.text)
    return result
