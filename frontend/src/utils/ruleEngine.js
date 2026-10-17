// Client-side rule engine matching the FastAPI backend logic
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

function isDomainSafe(domain) {
  if (!domain) return false;
  const clean = domain.toLowerCase().trim();
  if (SAFE_DOMAINS.has(clean)) return true;
  for (const safe of SAFE_DOMAINS) {
    if (clean.endsWith('.' + safe)) return true;
  }
  return false;
}

const RE_URGENCY = /\b(today|immediately|urgent(?:ly)?|within\s+\d+\s+(?:hours?|hrs?|minutes?|mins?)|hurry|asap|act\s+now|right\s+now|expire[s|d]?|final\s+notice|last\s+chance|limited\s+time|deadline|instant(?:ly)?)\b/gi;
const RE_THREAT = /\b(blocked|suspended|suspension|legal\s+action|incomplete|deactivated|penalty|penalties|arrest(?:ed)?|police|court|terminated|fine|warrant|lawsuit|frozen|freeze|closed|disabled)\b/gi;
const RE_CREDENTIAL = /\b(otp|one\s+time\s+password|passwords?|pin|mpin|cvv|cvc|card\s+number|debit\s+card|credit\s+card|bank\s+account|pan\s+card|aadhaar|aadhar|credentials?|login\s+details|security\s+code)\b/gi;
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
      character_count: 0
    };
  }

  // 1. Urgency (+20)
  const urgencyMatches = [];
  const urgencySpans = [];
  let m;
  RE_URGENCY.lastIndex = 0;
  while ((m = RE_URGENCY.exec(cleanText)) !== null) {
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
  RE_THREAT.lastIndex = 0;
  while ((m = RE_THREAT.exec(cleanText)) !== null) {
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

    if (isHttp || !isSafe) {
      linkSuspicious = true;
      const reasons = [];
      if (isHttp) reasons.push('insecure HTTP');
      if (!isSafe) reasons.push(`unverified domain '${domain}'`);
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
  RE_CREDENTIAL.lastIndex = 0;
  while ((m = RE_CREDENTIAL.exec(cleanText)) !== null) {
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
    action_steps: getDefaultActionSteps(rules),
    character_count: cleanText.length
  };
}

function getDefaultActionSteps(rules) {
  const actions = [];
  const hasCredential = rules.some(r => r.id === 'RULE_CREDENTIAL' && r.triggered);
  const hasLink = rules.some(r => r.id === 'RULE_LINK' && r.triggered);
  const hasThreat = rules.some(r => r.id === 'RULE_THREAT' && r.triggered);
  const hasUrgency = rules.some(r => r.id === 'RULE_URGENCY' && r.triggered);

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
