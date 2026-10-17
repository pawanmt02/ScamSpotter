// Client-side rule engine matching the FastAPI backend logic with high accuracy
const SAFE_DOMAINS = new Set([
  'sbi.co.in',
  'onlinesbi.sbi',
  'onlinesbi.com',
  'hdfcbank.com',
  'icicibank.com',
  'axisbank.com',
  'kotak.com',
  'bankofbaroda.in',
  'pnbindia.in',
  'canarabank.com',
  'unionbankofindia.co.in',
  'idfcfirstbank.com',
  'indusind.com',
  'gov.in',
  'nic.in',
  'cybercrime.gov.in',
  'uidai.gov.in',
  'incometax.gov.in',
  'rbi.org.in',
  'ceir.gov.in',
  'npci.org.in',
  'google.com',
  'apple.com',
  'microsoft.com',
  'amazon.in',
  'amazon.com',
  'whatsapp.com',
  'telegram.org',
]);

const KNOWN_BRANDS = [
  'sbi', 'yono', 'hdfc', 'icici', 'axis', 'kotak', 'pnb', 'bob', 'baroda',
  'paytm', 'phonepe', 'gpay', 'aadhaar', 'uidai', 'kyc', 'incometax',
  'electricity', 'bsnl', 'jio', 'airtel', 'amazon', 'netflix'
];

const SUSPICIOUS_TLDS = new Set([
  'xyz', 'top', 'tk', 'ml', 'ga', 'cf', 'gq', 'club', 'vip', 'online',
  'site', 'app', 'live', 'cc', 'work', 'click', 'rest', 'cam', 'fit'
]);

function isDomainSafe(domain) {
  if (!domain) return false;
  const clean = domain.toLowerCase().trim();
  if (SAFE_DOMAINS.has(clean)) return true;
  for (const safe of SAFE_DOMAINS) {
    if (clean.endsWith('.' + safe)) return true;
  }
  return false;
}

// 1. Urgency: Explicit panic or contextual urgency
const RE_URGENCY_EXPLICIT = /\b(immediately|urgent(?:ly)?|within\s+\d+\s+(?:hours?|hrs?|minutes?|mins?)|hurry|asap|act\s+now|right\s+now|expire[s|d]?|final\s+notice|last\s+chance|limited\s+time|deadline|instant(?:ly)?|immediate\s+action)\b/gi;
const RE_URGENCY_CONTEXTUAL = /\b(?:blocked|suspended|expires?|due|pay|verify|update|complete|disconnected|action)\s+(?:by\s+)?today\b|\btoday\s+(?:due\s+to|itself|only|before\s+\d+|is\s+the\s+last)\b|\bby\s+today\s+(?:evening|night|\d+\s*(?:am|pm)?)\b/gi;

// 2. Threat: Explicit threat or contextual pressure
const RE_THREAT_EXPLICIT = /\b(blocked|suspended|suspension|legal\s+action|deactivated|penalty|penalties|arrest(?:ed)?|police(?:\s+complaint|\s+case|\s+involvement|\s+action)?|court(?:\s+action|\s+notice|\s+order|\s+case)?|warrant|lawsuit|freeze|frozen|disconnected|disconnection|terminated|fine)\b/gi;
const RE_THREAT_CONTEXTUAL = /\bincomplete\s+(?:kyc|pan|verification|profile|details|documents?|auth|form)\b|\b(?:kyc|pan|profile|account)\s+(?:is\s+)?incomplete\b/gi;

// 3. Credential: Direct secrets or imperative demands
const RE_CREDENTIAL_EXPLICIT = /\b(otp|one\s+time\s+password|passwords?|pin|mpin|cvv|cvc|atm\s*pin|security\s*pin|transaction\s*password|security\s*code|netbanking\s*password)\b/gi;
const RE_CREDENTIAL_IMPERATIVE = /\b(?:enter|share|send|provide|submit|update|verify|confirm)\s+(?:your\s+)?(?:credentials|netbanking|card\s+number|account\s+number|debit\s+card|credit\s+card|bank\s+account|pan\s+card|aadhaar)\b/gi;

// 4. URL
const RE_URL = /\b(?:https?:\/\/|www\.)[^\s<>"'{}|\\^`[\]]+|[a-zA-Z0-9.-]+\.(?:com|org|net|xyz|top|info|biz|site|club|vip|online|app|live|co|in|cc|tk|ml|ga|cf|gq)(?:\/[^\s<>"'{}|\\^`[\]]*)?/gi;

export function evaluateMessageLocally(text) {
  const cleanText = (text || '').trim();
  if (!cleanText) {
    return {
      score: 0,
      risk_tier: 'Low',
      risk_color: 'emerald',
      summary: 'No text provided to analyze.',
      rules_triggered: [],
      highlight_tokens: [],
      action_steps: getDefaultActionSteps([]),
      character_count: 0,
      brand_impersonation: null,
      confidence_level: 'High'
    };
  }

  // 1. Urgency (+20)
  const urgencyMatches = [];
  const urgencySpans = [];
  let m;
  RE_URGENCY_EXPLICIT.lastIndex = 0;
  while ((m = RE_URGENCY_EXPLICIT.exec(cleanText)) !== null) {
    urgencyMatches.push(m[0]);
    urgencySpans.push({
      token: m[0],
      category: 'urgency',
      start: m.index,
      end: m.index + m[0].length,
      color: 'amber'
    });
  }
  RE_URGENCY_CONTEXTUAL.lastIndex = 0;
  while ((m = RE_URGENCY_CONTEXTUAL.exec(cleanText)) !== null) {
    urgencyMatches.push(m[0]);
    urgencySpans.push({
      token: m[0],
      category: 'urgency',
      start: m.index,
      end: m.index + m[0].length,
      color: 'amber'
    });
  }
  const urgencyTriggered = urgencyMatches.length > 0;
  const ruleUrgency = {
    id: 'RULE_URGENCY',
    name: 'Urgency & Artificial Panic',
    category: 'Urgency',
    weight: 20,
    triggered: urgencyTriggered,
    score_awarded: urgencyTriggered ? 20 : 0,
    matches: [...new Set(urgencyMatches)],
    description: "Phrases designed to rush the recipient into acting without thinking (e.g., 'immediately', 'today', 'within 2 hours').",
    recommendation: 'Scammers deliberately create panic deadlines. Genuine institutions grant reasonable timelines.'
  };

  // 2. Threat (+15)
  const threatMatches = [];
  const threatSpans = [];
  RE_THREAT_EXPLICIT.lastIndex = 0;
  while ((m = RE_THREAT_EXPLICIT.exec(cleanText)) !== null) {
    threatMatches.push(m[0]);
    threatSpans.push({
      token: m[0],
      category: 'threat',
      start: m.index,
      end: m.index + m[0].length,
      color: 'rose'
    });
  }
  RE_THREAT_CONTEXTUAL.lastIndex = 0;
  while ((m = RE_THREAT_CONTEXTUAL.exec(cleanText)) !== null) {
    threatMatches.push(m[0]);
    threatSpans.push({
      token: m[0],
      category: 'threat',
      start: m.index,
      end: m.index + m[0].length,
      color: 'rose'
    });
  }
  const threatTriggered = threatMatches.length > 0;
  const ruleThreat = {
    id: 'RULE_THREAT',
    name: 'Coercive Threat & Intimidation',
    category: 'Threats',
    weight: 15,
    triggered: threatTriggered,
    score_awarded: threatTriggered ? 15 : 0,
    matches: [...new Set(threatMatches)],
    description: 'Threats of account suspension, legal action, fines, or police involvement to coerce immediate compliance.',
    recommendation: 'Official organizations and banks do not unilaterally threaten arrest or instant deactivation via text messages.'
  };

  // 3. Links (+25)
  const linkMatches = [];
  const linkSpans = [];
  let linkSuspicious = false;
  let brandSpoof = null;
  RE_URL.lastIndex = 0;
  while ((m = RE_URL.exec(cleanText)) !== null) {
    const rawUrl = m[0];
    let domain = '';
    try {
      const urlToParse = rawUrl.startsWith('http://') || rawUrl.startsWith('https://') ? rawUrl : 'http://' + rawUrl;
      const parsed = new URL(urlToParse);
      domain = parsed.hostname.replace(/^www\./, '');
    } catch {
      domain = rawUrl;
    }
    const isHttp = rawUrl.toLowerCase().startsWith('http://');
    const isSafe = isDomainSafe(domain);

    const parts = domain.replace(/-/g, '.').split('.');
    const tld = parts[parts.length - 1];
    let matchedBrand = null;
    for (const b of KNOWN_BRANDS) {
      if (domain.includes(b)) {
        matchedBrand = b.toUpperCase();
        break;
      }
    }

    if (isHttp || !isSafe) {
      linkSuspicious = true;
      const reasons = [];
      if (isHttp) reasons.push('insecure HTTP');
      if (!isSafe) reasons.push(`unverified domain '${domain}'`);
      if (SUSPICIOUS_TLDS.has(tld)) reasons.push(`high-risk TLD (.${tld})`);
      if (matchedBrand && !isSafe) {
        reasons.push(`spoofing brand '${matchedBrand}'`);
        brandSpoof = `Impersonating ${matchedBrand} on unverified domain '${domain}'`;
      }

      linkMatches.push(`${rawUrl} (${reasons.join(', ')})`);
      linkSpans.push({
        token: rawUrl,
        category: 'link',
        start: m.index,
        end: m.index + rawUrl.length,
        color: 'blue'
      });
    }
  }
  const ruleLink = {
    id: 'RULE_LINK',
    name: 'Suspicious or Insecure Link',
    category: 'Suspicious Links',
    weight: 25,
    triggered: linkSuspicious,
    score_awarded: linkSuspicious ? 25 : 0,
    matches: linkMatches,
    description: 'Links directing to unverified domains, IP addresses, or insecure HTTP connections commonly used in phishing campaigns.',
    recommendation: 'Never tap unverified links. Navigate to official services manually through your web browser or official app.'
  };

  // 4. Credential Grab (+40)
  const credMatches = [];
  const credSpans = [];
  RE_CREDENTIAL_EXPLICIT.lastIndex = 0;
  while ((m = RE_CREDENTIAL_EXPLICIT.exec(cleanText)) !== null) {
    credMatches.push(m[0]);
    credSpans.push({
      token: m[0],
      category: 'credential',
      start: m.index,
      end: m.index + m[0].length,
      color: 'red'
    });
  }
  RE_CREDENTIAL_IMPERATIVE.lastIndex = 0;
  while ((m = RE_CREDENTIAL_IMPERATIVE.exec(cleanText)) !== null) {
    credMatches.push(m[0]);
    credSpans.push({
      token: m[0],
      category: 'credential',
      start: m.index,
      end: m.index + m[0].length,
      color: 'red'
    });
  }
  const credTriggered = credMatches.length > 0;
  const ruleCredential = {
    id: 'RULE_CREDENTIAL',
    name: 'Sensitive Credential Solicitation',
    category: 'Credential Requests',
    weight: 40,
    triggered: credTriggered,
    score_awarded: credTriggered ? 40 : 0,
    matches: [...new Set(credMatches)],
    description: 'Solicitation of high-risk security secrets such as OTP, PIN, CVV, passwords, or banking access codes.',
    recommendation: 'Absolute red flag. Legitimate banks and support teams will NEVER demand OTP or PIN over chat or SMS.'
  };

  const rules = [ruleUrgency, ruleThreat, ruleLink, ruleCredential];
  let totalScore = rules.reduce((acc, r) => acc + r.score_awarded, 0);
  totalScore = Math.min(Math.max(totalScore, 0), 100);

  let riskTier = 'Low';
  let riskColor = 'emerald';
  let summary = 'LOW RISK: No blatant scam indicators detected. The text appears standard, but always exercise basic caution with unknown senders.';

  if (totalScore >= 60) {
    riskTier = 'High';
    riskColor = 'rose';
    summary = 'HIGH RISK: Severe scam indicators detected! This message exhibits classic social engineering tactics designed to steal credentials or money.';
  } else if (totalScore >= 30) {
    riskTier = 'Medium';
    riskColor = 'amber';
    summary = 'MEDIUM RISK: Caution advised. One or more suspicious patterns were identified. Verify sender identity independently before taking any action.';
  }

  // Combine and sort token spans
  const allSpans = [...urgencySpans, ...threatSpans, ...linkSpans, ...credSpans];
  allSpans.sort((a, b) => a.start - b.start || (b.end - b.start) - (a.end - a.start));

  const resolvedSpans = [];
  let lastEnd = -1;
  for (const s of allSpans) {
    if (s.start >= lastEnd) {
      resolvedSpans.push(s);
      lastEnd = s.end;
    }
  }

  return {
    score: totalScore,
    risk_tier: riskTier,
    risk_color: riskColor,
    summary,
    rules_triggered: rules,
    highlight_tokens: resolvedSpans,
    action_steps: getDefaultActionSteps(rules, brandSpoof),
    character_count: cleanText.length,
    brand_impersonation: brandSpoof,
    confidence_level: 'High (Deterministic Match)'
  };
}

function getDefaultActionSteps(rules, brandSpoof = null) {
  const actions = [];
  const hasCredential = rules.some(r => r.id === 'RULE_CREDENTIAL' && r.triggered);
  const hasLink = rules.some(r => r.id === 'RULE_LINK' && r.triggered);
  const hasThreat = rules.some(r => r.id === 'RULE_THREAT' && r.triggered);
  const hasUrgency = rules.some(r => r.id === 'RULE_URGENCY' && r.triggered);

  if (brandSpoof) {
    actions.push({
      title: `Brand Spoofing Warning: ${brandSpoof}`,
      description: 'The sender is impersonating an official institution using an unofficial fake domain. Do not interact with this page.',
      priority: 'critical',
      icon: 'shield-alert'
    });
  }

  if (hasCredential) {
    actions.push({
      title: 'NEVER Disclose OTP, PIN, or Passwords',
      description: 'No legitimate organization, bank manager, or government officer will EVER ask for your OTP or PIN. Never type them into external web forms.',
      priority: 'critical',
      icon: 'lock'
    });
    actions.push({
      title: 'Emergency Banking Lockdown (If already shared)',
      description: 'If you entered your PIN, CVV, or OTP on an external site, immediately open your official banking app and freeze your card/netbanking.',
      priority: 'critical',
      icon: 'shield-alert'
    });
  }

  if (hasLink) {
    actions.push({
      title: 'Do NOT Click or Open the Link',
      description: 'The link in the message does not lead to a recognized secure domain. Phishing sites clone bank login pages down to the pixel.',
      priority: 'warning',
      icon: 'external-link'
    });
  }

  if (hasThreat || hasUrgency) {
    actions.push({
      title: 'Verify Directly via Official Channels',
      description: 'Do not reply to this message. Contact your bank or service provider using the verified phone number printed on the back of your card or official site.',
      priority: 'warning',
      icon: 'phone'
    });
  }

  if (rules.some(r => r.triggered)) {
    actions.push({
      title: 'Report to National Cyber Crime Portal (Helpline 1930)',
      description: 'In India, dial 1930 immediately to report financial cyber fraud, or lodge an online complaint at the official portal.',
      priority: 'info',
      icon: 'phone',
      action_url: 'https://cybercrime.gov.in',
      action_label: 'Visit CyberCrime.gov.in'
    });
    actions.push({
      title: 'Block & Report Sender on Messaging App',
      description: "Use your messaging app's 'Report Spam and Block' option to help carrier algorithms protect other citizens.",
      priority: 'info',
      icon: 'shield-alert'
    });
  } else {
    actions.push({
      title: 'No Suspicious Patterns Detected',
      description: 'This message does not exhibit known phishing indicators (no urgency coercion, threats, unverified URLs, or OTP demands).',
      priority: 'info',
      icon: 'lock'
    });
    actions.push({
      title: 'General Hygiene Reminder',
      description: 'Always remain vigilant when receiving unexpected messages from unfamiliar numbers or unknown contacts.',
      priority: 'info',
      icon: 'shield-alert'
    });
  }

  return actions;
}
