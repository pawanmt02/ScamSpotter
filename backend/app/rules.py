import re
from urllib.parse import urlparse
from typing import List, Tuple, Dict, Any
from app.models import RuleResult, TokenSpan, ActionStep, ScanResponse
from app.data.safe_domains import is_domain_safe

# Pre-compiled Regex Patterns for Performance and Determinism
RE_URGENCY = re.compile(
    r'(?i)\b(today|immediately|urgent(?:ly)?|within\s+\d+\s+(?:hours?|hrs?|minutes?|mins?)|'
    r'hurry|asap|act\s+now|right\s+now|expire[s|d]?|final\s+notice|last\s+chance|'
    r'limited\s+time|deadline|instant(?:ly)?)\b'
)

RE_THREAT = re.compile(
    r'(?i)\b(blocked|suspended|suspension|legal\s+action|incomplete|deactivated|'
    r'penalty|penalties|arrest(?:ed)?|police|court|terminated|fine|warrant|'
    r'lawsuit|frozen|freeze|closed|disabled)\b'
)

RE_CREDENTIAL = re.compile(
    r'(?i)\b(otp|one\s+time\s+password|passwords?|pin|mpin|cvv|cvc|'
    r'card\s+number|debit\s+card|credit\s+card|bank\s+account|'
    r'pan\s+card|aadhaar|aadhar|credentials?|login\s+details|security\s+code)\b'
)

# URL Pattern matching http, https, and standalone domain-like URLs
RE_URL = re.compile(
    r'(?i)\b(?:https?://|www\.)[^\s<>"\'{}|\\^`\[\]]+|[a-zA-Z0-9.-]+\.(?:com|org|net|xyz|top|info|biz|site|club|vip|online|app|live|co|in|cc|tk|ml|ga|cf|gq)(?:/[^\s<>"\'{}|\\^`\[\]]*)?'
)


def evaluate_urgency(text: str) -> Tuple[RuleResult, List[TokenSpan]]:
    """
    Evaluates urgency triggers in text.
    Award: +20 points if urgency phrases are present.
    """
    matches = []
    spans = []
    
    for match in RE_URGENCY.finditer(text):
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
    Evaluates coercive threat triggers in text.
    Award: +15 points if threat phrases are present.
    """
    matches = []
    spans = []
    
    for match in RE_THREAT.finditer(text):
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


def evaluate_links(text: str) -> Tuple[RuleResult, List[TokenSpan]]:
    """
    Evaluates URLs and domains in text.
    Award: +25 points if link is unverified, uses insecure HTTP, or points to untrusted domains.
    """
    matches = []
    spans = []
    suspicious_found = False
    details = []
    
    for match in RE_URL.finditer(text):
        raw_url = match.group(0)
        # Normalize URL for parsing
        normalized_url = raw_url
        if not normalized_url.startswith(("http://", "https://")):
            normalized_url = "http://" + normalized_url
            
        parsed = urlparse(normalized_url)
        domain = parsed.netloc.split(":")[0].lower() if parsed.netloc else ""
        if domain.startswith("www."):
            domain = domain[4:]
            
        is_http = raw_url.lower().startswith("http://")
        is_safe = is_domain_safe(domain)
        
        # If it's HTTP, or not a verified safe domain, it's flagged as suspicious
        if is_http or not is_safe:
            suspicious_found = True
            reason = []
            if is_http:
                reason.append("insecure HTTP")
            if not is_safe:
                reason.append(f"unverified domain '{domain or raw_url}'")
                
            matches.append(f"{raw_url} ({', '.join(reason)})")
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
    return rule, spans


def evaluate_credential_grab(text: str) -> Tuple[RuleResult, List[TokenSpan]]:
    """
    Evaluates requests for sensitive credentials, OTPs, PINs, CVVs.
    Award: +40 points if credential grab keywords are present.
    """
    matches = []
    spans = []
    
    for match in RE_CREDENTIAL.finditer(text):
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


def generate_action_steps(rules: List[RuleResult]) -> List[ActionStep]:
    """
    Generates actionable, contextual resolution guidance based on triggered rules.
    """
    actions = []
    has_credential = any(r.id == "RULE_CREDENTIAL" and r.triggered for r in rules)
    has_link = any(r.id == "RULE_LINK" and r.triggered for r in rules)
    has_threat = any(r.id == "RULE_THREAT" and r.triggered for r in rules)
    has_urgency = any(r.id == "RULE_URGENCY" and r.triggered for r in rules)
    
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
            character_count=0
        )
        
    # Execute deterministic rule functions in order
    r_urgency, spans_urgency = evaluate_urgency(clean_text)
    r_threat, spans_threat = evaluate_threat(clean_text)
    r_link, spans_link = evaluate_links(clean_text)
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
    # Sort by start ascending, then length descending
    all_spans.sort(key=lambda s: (s.start, -(s.end - s.start)))
    
    resolved_spans: List[TokenSpan] = []
    last_end = -1
    for s in all_spans:
        if s.start >= last_end:
            resolved_spans.append(s)
            last_end = s.end
            
    # Generate tailored resolution action steps
    action_steps = generate_action_steps(rules)
    
    return ScanResponse(
        score=total_score,
        risk_tier=risk_tier,
        risk_color=risk_color,
        summary=summary,
        rules_triggered=rules,
        highlight_tokens=resolved_spans,
        action_steps=action_steps,
        character_count=len(clean_text)
    )
