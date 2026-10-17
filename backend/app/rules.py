import re
from urllib.parse import urlparse
from typing import List, Tuple, Dict, Any, Optional
from app.models import RuleResult, TokenSpan, ActionStep, ScanResponse
from app.data.safe_domains import is_domain_safe

# ==============================================================================
# HIGH-ACCURACY PRE-COMPILED REGEX PATTERNS
# ==============================================================================

# 1. URGENCY: Explicit panic verbs or contextual temporal pressure
RE_URGENCY_EXPLICIT = re.compile(
    r'(?i)\b(immediately|urgent(?:ly)?|within\s+\d+\s+(?:hours?|hrs?|minutes?|mins?)|'
    r'hurry|asap|act\s+now|right\s+now|expire[s|d]?|final\s+notice|last\s+chance|'
    r'limited\s+time|deadline|instant(?:ly)?|immediate\s+action)\b'
)

# Contextual urgency: "today" used with action/threat/deadline, not mere conversational mention
RE_URGENCY_CONTEXTUAL = re.compile(
    r'(?i)\b(?:blocked|suspended|expires?|due|pay|verify|update|complete|disconnected|action)\s+(?:by\s+)?today\b|'
    r'\btoday\s+(?:due\s+to|itself|only|before\s+\d+|is\s+the\s+last)\b|'
    r'\bby\s+today\s+(?:evening|night|\d+\s*(?:am|pm)?)\b'
)

# 2. THREAT: Coercive intimidation, punitive consequences, or incomplete status pressure
RE_THREAT_EXPLICIT = re.compile(
    r'(?i)\b(blocked|suspended|suspension|legal\s+action|deactivated|penalty|penalties|'
    r'arrest(?:ed)?|police\s+(?:complaint|case|involvement|action)?|court\s+(?:action|notice|order|case)?|'
    r'warrant|lawsuit|freeze|frozen|disconnected|disconnection|terminated|fine)\b'
)

# Contextual threat for "incomplete": specifically KYC / profile / documentation pressure
RE_THREAT_CONTEXTUAL = re.compile(
    r'(?i)\bincomplete\s+(?:kyc|pan|verification|profile|details|documents?|auth|form)\b|'
    r'\b(?:kyc|pan|profile|account)\s+(?:is\s+)?incomplete\b'
)

# 3. CREDENTIAL: Direct secrets solicitation or imperatives requesting banking data
RE_CREDENTIAL_EXPLICIT = re.compile(
    r'(?i)\b(otp|one\s+time\s+password|passwords?|pin|mpin|cvv|cvc|atm\s*pin|'
    r'security\s*pin|transaction\s*password|security\s*code|netbanking\s*password)\b'
)

# Imperative demand to provide sensitive identity/financial information
RE_CREDENTIAL_IMPERATIVE = re.compile(
    r'(?i)\b(?:enter|share|send|provide|submit|update|verify|confirm)\s+(?:your\s+)?'
    r'(?:credentials|netbanking|card\s+number|account\s+number|debit\s+card|credit\s+card|bank\s+account|pan\s+card|aadhaar)\b'
)

# 4. URL PATTERN: Comprehensive parser for http, https, and standalone domains
RE_URL = re.compile(
    r'(?i)\b(?:https?://|www\.)[^\s<>"\'{}|\\^`\[\]]+|[a-zA-Z0-9.-]+\.(?:com|org|net|xyz|top|info|biz|site|club|vip|online|app|live|co|in|cc|tk|ml|ga|cf|gq)(?:/[^\s<>"\'{}|\\^`\[\]]*)?'
)

# Known targets frequently impersonated in spoofed domains
KNOWN_BRANDS = [
    "sbi", "yono", "hdfc", "icici", "axis", "kotak", "pnb", "bob", "baroda",
    "paytm", "phonepe", "gpay", "aadhaar", "uidai", "kyc", "incometax",
    "electricity", "bsnl", "jio", "airtel", "amazon", "netflix"
]

SUSPICIOUS_TLDS = {
    "xyz", "top", "tk", "ml", "ga", "cf", "gq", "club", "vip", "online",
    "site", "app", "live", "cc", "work", "click", "rest", "cam", "fit"
}


def evaluate_urgency(text: str) -> Tuple[RuleResult, List[TokenSpan]]:
    """
    Evaluates urgency triggers with high contextual accuracy.
    Award: +20 points if urgency phrases are verified.
    """
    matches = []
    spans = []
    
    # 1. Explicit panic keywords
    for match in RE_URGENCY_EXPLICIT.finditer(text):
        matched_str = match.group(0)
        matches.append(matched_str)
        spans.append(TokenSpan(
            token=matched_str,
            category="urgency",
            start=match.start(),
            end=match.end(),
            color="amber"
        ))
        
    # 2. Contextual urgency with "today"
    for match in RE_URGENCY_CONTEXTUAL.finditer(text):
        matched_str = match.group(0)
        matches.append(matched_str)
        spans.append(TokenSpan(
            token=matched_str,
            category="urgency",
            start=match.start(),
            end=match.end(),
            color="amber"
        ))
        
    triggered = len(matches) > 0
    rule = RuleResult(
        id="RULE_URGENCY",
        name="Urgency & Artificial Panic",
        category="Urgency",
        weight=20,
        triggered=triggered,
        score_awarded=20 if triggered else 0,
        matches=list(set(matches)),
        description="Phrases designed to rush the recipient into acting without thinking (e.g., 'immediately', 'today', 'within 2 hours').",
        recommendation="Scammers intentionally fabricate deadlines to provoke fear. Legitimate institutions provide reasonable notice."
    )
    return rule, spans


def evaluate_threat(text: str) -> Tuple[RuleResult, List[TokenSpan]]:
    """
    Evaluates coercive threat triggers with contextual disambiguation.
    Award: +15 points if threat phrases are verified.
    """
    matches = []
    spans = []
    
    # 1. Explicit threat terms
    for match in RE_THREAT_EXPLICIT.finditer(text):
        matched_str = match.group(0)
        matches.append(matched_str)
        spans.append(TokenSpan(
            token=matched_str,
            category="threat",
            start=match.start(),
            end=match.end(),
            color="rose"
        ))
        
    # 2. Contextual threats (e.g. "incomplete KYC")
    for match in RE_THREAT_CONTEXTUAL.finditer(text):
        matched_str = match.group(0)
        matches.append(matched_str)
        spans.append(TokenSpan(
            token=matched_str,
            category="threat",
            start=match.start(),
            end=match.end(),
            color="rose"
        ))
        
    triggered = len(matches) > 0
    rule = RuleResult(
        id="RULE_THREAT",
        name="Coercive Threat & Intimidation",
        category="Threats",
        weight=15,
        triggered=triggered,
        score_awarded=15 if triggered else 0,
        matches=list(set(matches)),
        description="Threats of account suspension, legal action, fines, or police involvement to coerce immediate compliance.",
        recommendation="Official organizations and banks do not unilaterally threaten arrest or instant deactivation via text messages."
    )
    return rule, spans


def evaluate_links(text: str) -> Tuple[RuleResult, List[TokenSpan], Optional[str]]:
    """
    Evaluates URLs, domains, protocol security, and brand impersonation.
    Award: +25 points if link is unverified, uses insecure HTTP, or points to untrusted domains.
    Returns: (rule, spans, detected_brand_spoof)
    """
    matches = []
    spans = []
    suspicious_found = False
    detected_brand_spoof = None
    
    for match in RE_URL.finditer(text):
        raw_url = match.group(0)
        normalized_url = raw_url
        if not normalized_url.startswith(("http://", "https://")):
            normalized_url = "http://" + normalized_url
            
        parsed = urlparse(normalized_url)
        domain = parsed.netloc.split(":")[0].lower() if parsed.netloc else ""
        if domain.startswith("www."):
            domain = domain[4:]
            
        is_http = raw_url.lower().startswith("http://")
        is_safe = is_domain_safe(domain)
        
        # Check brand impersonation / typosquatting
        domain_parts = domain.replace("-", ".").split(".")
        tld = domain_parts[-1] if domain_parts else ""
        
        brand_matched = None
        for brand in KNOWN_BRANDS:
            if brand in domain:
                brand_matched = brand.upper()
                break
                
        # Flag if: insecure HTTP, or domain not on verified whitelist
        if is_http or not is_safe:
            suspicious_found = True
            reasons = []
            if is_http:
                reasons.append("insecure HTTP")
            if not is_safe:
                reasons.append(f"unverified domain '{domain or raw_url}'")
            if tld in SUSPICIOUS_TLDS:
                reasons.append(f"high-risk TLD (.{tld})")
            if brand_matched and not is_safe:
                reasons.append(f"spoofing brand '{brand_matched}'")
                detected_brand_spoof = f"Impersonating {brand_matched} on unverified domain '{domain}'"
                
            matches.append(f"{raw_url} ({', '.join(reasons)})")
            spans.append(TokenSpan(
                token=raw_url,
                category="link",
                start=match.start(),
                end=match.end(),
                color="blue"
            ))
            
    triggered = suspicious_found
    rule = RuleResult(
        id="RULE_LINK",
        name="Suspicious or Insecure Link",
        category="Suspicious Links",
        weight=25,
        triggered=triggered,
        score_awarded=25 if triggered else 0,
        matches=matches,
        description="Links directing to unverified domains, IP addresses, or insecure HTTP connections commonly used in phishing campaigns.",
        recommendation="Never tap unverified links. Navigate to official services manually through your web browser or official app."
    )
    return rule, spans, detected_brand_spoof


def evaluate_credential_grab(text: str) -> Tuple[RuleResult, List[TokenSpan]]:
    """
    Evaluates requests for sensitive credentials (OTP, PIN, passwords, CVV)
    without falsely flagging passive mentions of 'bank account'.
    Award: +40 points if credential grab keywords or imperatives are present.
    """
    matches = []
    spans = []
    
    # 1. Direct secret requests (OTP, PIN, CVV, password)
    for match in RE_CREDENTIAL_EXPLICIT.finditer(text):
        matched_str = match.group(0)
        matches.append(matched_str)
        spans.append(TokenSpan(
            token=matched_str,
            category="credential",
            start=match.start(),
            end=match.end(),
            color="red"
        ))
        
    # 2. Imperative disclosure demands ("enter your card number", "share your credentials")
    for match in RE_CREDENTIAL_IMPERATIVE.finditer(text):
        matched_str = match.group(0)
        matches.append(matched_str)
        spans.append(TokenSpan(
            token=matched_str,
            category="credential",
            start=match.start(),
            end=match.end(),
            color="red"
        ))
        
    triggered = len(matches) > 0
    rule = RuleResult(
        id="RULE_CREDENTIAL",
        name="Sensitive Credential Solicitation",
        category="Credential Requests",
        weight=40,
        triggered=triggered,
        score_awarded=40 if triggered else 0,
        matches=list(set(matches)),
        description="Solicitation of high-risk security secrets such as OTP, PIN, CVV, passwords, or banking access codes.",
        recommendation="Absolute red flag. Legitimate banks and support teams will NEVER demand OTP or PIN over chat or SMS."
    )
    return rule, spans


def generate_action_steps(rules: List[RuleResult], brand_spoof: Optional[str] = None) -> List[ActionStep]:
    """
    Generates actionable, contextual resolution guidance based on triggered rules.
    """
    actions = []
    has_credential = any(r.id == "RULE_CREDENTIAL" and r.triggered for r in rules)
    has_link = any(r.id == "RULE_LINK" and r.triggered for r in rules)
    has_threat = any(r.id == "RULE_THREAT" and r.triggered for r in rules)
    has_urgency = any(r.id == "RULE_URGENCY" and r.triggered for r in rules)
    
    if brand_spoof:
        actions.append(ActionStep(
            title=f"Brand Spoofing Warning: {brand_spoof}",
            description="The sender is impersonating an official institution using an unofficial fake domain. Do not interact with this page.",
            priority="critical",
            icon="shield-alert"
        ))
        
    if has_credential:
        actions.append(ActionStep(
            title="NEVER Disclose OTP, PIN, or Passwords",
            description="No legitimate organization, bank manager, or government officer will EVER ask for your OTP or PIN. Never type them into external web forms.",
            priority="critical",
            icon="lock"
        ))
        actions.append(ActionStep(
            title="Emergency Banking Lockdown (If already shared)",
            description="If you entered your PIN, CVV, or OTP on an external site, immediately open your official banking app and freeze your card/netbanking.",
            priority="critical",
            icon="shield-alert"
        ))
        
    if has_link:
        actions.append(ActionStep(
            title="Do NOT Click or Open the Link",
            description="The link in the message does not lead to a recognized secure domain. Phishing sites clone bank login pages down to the pixel.",
            priority="warning",
            icon="external-link"
        ))
        
    if has_threat or has_urgency:
        actions.append(ActionStep(
            title="Verify Directly via Official Channels",
            description="Do not reply to this message. Contact your bank or service provider using the verified phone number printed on the back of your card or official site.",
            priority="warning",
            icon="phone"
        ))
        
    # National Helpline & Reporting (Universal safety steps)
    if any(r.triggered for r in rules):
        actions.append(ActionStep(
            title="Report to National Cyber Crime Portal (Helpline 1930)",
            description="In India, dial 1930 immediately to report financial cyber fraud, or lodge an online complaint at the official portal.",
            priority="info",
            icon="phone",
            action_url="https://cybercrime.gov.in",
            action_label="Visit CyberCrime.gov.in"
        ))
        actions.append(ActionStep(
            title="Block & Report Sender on Messaging App",
            description="Use your messaging app's 'Report Spam and Block' option to help carrier algorithms protect other citizens.",
            priority="info",
            icon="shield-alert"
        ))
    else:
        # Safe message case
        actions.append(ActionStep(
            title="No Suspicious Patterns Detected",
            description="This message does not exhibit known phishing indicators (no urgency coercion, threats, unverified URLs, or OTP demands).",
            priority="info",
            icon="lock"
        ))
        actions.append(ActionStep(
            title="General Hygiene Reminder",
            description="Always remain vigilant when receiving unexpected messages from unfamiliar numbers or unknown contacts.",
            priority="info",
            icon="shield-alert"
        ))
        
    return actions


def scan_message(text: str) -> ScanResponse:
    """
    Main evaluation pipeline.
    Runs all 4 deterministic rule functions, calculates aggregate risk score (0-100),
    maps to risk tier, deduplicates highlighted token spans, and builds response.
    """
    clean_text = text.strip() if text else ""
    
    if not clean_text:
        return ScanResponse(
            score=0,
            risk_tier="Low",
            risk_color="emerald",
            summary="No text provided to analyze.",
            rules_triggered=[],
            highlight_tokens=[],
            action_steps=generate_action_steps([]),
            character_count=0,
            brand_impersonation=None,
            confidence_level="High"
        )
        
    # Execute deterministic rule functions in order
    r_urgency, spans_urgency = evaluate_urgency(clean_text)
    r_threat, spans_threat = evaluate_threat(clean_text)
    r_link, spans_link, brand_spoof = evaluate_links(clean_text)
    r_credential, spans_credential = evaluate_credential_grab(clean_text)
    
    rules = [r_urgency, r_threat, r_link, r_credential]
    
    # Calculate deterministic total score
    total_score = sum(r.score_awarded for r in rules)
    total_score = min(max(total_score, 0), 100)  # Clamp between 0 and 100
    
    # Determine Risk Tier based on PRD:
    # Low (0-29), Medium (30-59), High (60-100)
    if total_score >= 60:
        risk_tier = "High"
        risk_color = "rose"
        summary = "HIGH RISK: Severe scam indicators detected! This message exhibits classic social engineering tactics designed to steal credentials or money."
    elif total_score >= 30:
        risk_tier = "Medium"
        risk_color = "amber"
        summary = "MEDIUM RISK: Caution advised. One or more suspicious patterns were identified. Verify sender identity independently before taking any action."
    else:
        risk_tier = "Low"
        risk_color = "emerald"
        summary = "LOW RISK: No blatant scam indicators detected. The text appears standard, but always exercise basic caution with unknown senders."
        
    # Combine and sort token spans by start index
    all_spans = spans_urgency + spans_threat + spans_link + spans_credential
    
    # Filter overlapping spans (keep higher priority or earlier start)
    all_spans.sort(key=lambda s: (s.start, -(s.end - s.start)))
    
    resolved_spans: List[TokenSpan] = []
    last_end = -1
    for s in all_spans:
        if s.start >= last_end:
            resolved_spans.append(s)
            last_end = s.end
            
    # Generate tailored resolution action steps
    action_steps = generate_action_steps(rules, brand_spoof)
    
    return ScanResponse(
        score=total_score,
        risk_tier=risk_tier,
        risk_color=risk_color,
        summary=summary,
        rules_triggered=rules,
        highlight_tokens=resolved_spans,
        action_steps=action_steps,
        character_count=len(clean_text),
        brand_impersonation=brand_spoof,
        confidence_level="High (Deterministic Match)"
    )
