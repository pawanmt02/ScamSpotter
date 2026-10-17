import pytest
from fastapi.testclient import TestClient
from app.main import app
from app.rules import scan_message

client = TestClient(app)

OFFICIAL_SBI_KYC_TEST_CASE = (
    "Dear Customer, your SBI Bank account has been blocked today due to incomplete KYC. "
    "Update immediately to avoid suspension: http://sbi-kyc-verification.xyz "
    "or your account will face legal action. Enter your OTP and PIN."
)

SAFE_MESSAGE_TEST_CASE = "Hey are we still meeting for lunch tomorrow at 1pm? Let me know!"


def test_official_sbi_kyc_baseline():
    """
    PRD Phase 4 Baseline Test:
    Official SBI KYC test case hits exactly 100/100 and highlights correct phrases.
    - Urgency (+20)
    - Threat (+15)
    - Suspicious Link (+25)
    - Credential Grab (+40)
    Total = 100
    """
    result = scan_message(OFFICIAL_SBI_KYC_TEST_CASE)
    assert result.score == 100
    assert result.risk_tier == "High"
    assert result.risk_color == "rose"
    assert result.brand_impersonation is not None
    assert "SBI" in result.brand_impersonation
    
    # Check all 4 rules triggered
    rules_dict = {r.id: r for r in result.rules_triggered}
    assert rules_dict["RULE_URGENCY"].triggered is True
    assert rules_dict["RULE_URGENCY"].score_awarded == 20
    
    assert rules_dict["RULE_THREAT"].triggered is True
    assert rules_dict["RULE_THREAT"].score_awarded == 15
    
    assert rules_dict["RULE_LINK"].triggered is True
    assert rules_dict["RULE_LINK"].score_awarded == 25
    
    assert rules_dict["RULE_CREDENTIAL"].triggered is True
    assert rules_dict["RULE_CREDENTIAL"].score_awarded == 40
    
    # Check highlighted tokens
    categories_found = {span.category for span in result.highlight_tokens}
    assert "urgency" in categories_found
    assert "threat" in categories_found
    assert "link" in categories_found
    assert "credential" in categories_found


def test_safe_message_edge_case():
    """
    PRD Phase 4 Edge Case:
    Normal safe text must score 0 (Low Risk) and not throw false positives.
    """
    result = scan_message(SAFE_MESSAGE_TEST_CASE)
    assert result.score == 0
    assert result.risk_tier == "Low"
    assert result.risk_color == "emerald"
    assert all(not r.triggered for r in result.rules_triggered)
    assert len(result.highlight_tokens) == 0


def test_neutral_today_not_penalized():
    """Contextual accuracy: Casual mention of 'today' without urgency should not trigger urgency."""
    result = scan_message("Are you free today for an informal coffee catch-up?")
    assert result.score == 0
    rules_dict = {r.id: r for r in result.rules_triggered}
    assert rules_dict["RULE_URGENCY"].triggered is False


def test_neutral_bank_account_not_penalized():
    """Contextual accuracy: Merely mentioning 'bank account' without OTP/credential demand is safe."""
    result = scan_message("I verified that my bank account balance is sufficient.")
    assert result.score == 0
    rules_dict = {r.id: r for r in result.rules_triggered}
    assert rules_dict["RULE_CREDENTIAL"].triggered is False


def test_empty_string():
    """Empty input should score 0 gracefully."""
    result = scan_message("")
    assert result.score == 0
    assert result.risk_tier == "Low"


def test_urgency_only():
    text = "Please send the report immediately."
    result = scan_message(text)
    assert result.score == 20
    assert result.risk_tier == "Low"
    rules_dict = {r.id: r for r in result.rules_triggered}
    assert rules_dict["RULE_URGENCY"].triggered is True
    assert rules_dict["RULE_THREAT"].triggered is False


def test_threat_only():
    text = "Your membership has been suspended due to an incomplete KYC profile."
    result = scan_message(text)
    assert result.score == 15
    rules_dict = {r.id: r for r in result.rules_triggered}
    assert rules_dict["RULE_THREAT"].triggered is True
    assert rules_dict["RULE_CREDENTIAL"].triggered is False


def test_credential_only():
    text = "Kindly confirm your secret PIN and OTP code."
    result = scan_message(text)
    assert result.score == 40
    assert result.risk_tier == "Medium"
    rules_dict = {r.id: r for r in result.rules_triggered}
    assert rules_dict["RULE_CREDENTIAL"].triggered is True


def test_verified_safe_domain_not_penalized():
    """Legitimate HTTPS links to verified domains shouldn't trigger the suspicious link rule."""
    text = "Please log in at https://sbi.co.in to view your monthly account statement."
    result = scan_message(text)
    rules_dict = {r.id: r for r in result.rules_triggered}
    # https://sbi.co.in is in SAFE_DOMAINS and uses HTTPS
    assert rules_dict["RULE_LINK"].triggered is False


def test_api_endpoint_scan():
    """Test the POST /api/scan endpoint with FastAPI TestClient."""
    response = client.post("/api/scan", json={"text": OFFICIAL_SBI_KYC_TEST_CASE})
    assert response.status_code == 200
    data = response.json()
    assert data["score"] == 100
    assert data["risk_tier"] == "High"
    assert len(data["rules_triggered"]) == 4
    assert len(data["action_steps"]) > 0


def test_api_health():
    """Test the GET /api/health endpoint."""
    response = client.get("/api/health")
    assert response.status_code == 200
    assert response.json()["status"] == "healthy"
