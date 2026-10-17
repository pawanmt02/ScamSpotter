# 🛡️ Scam Spotter

> **Explainable SMS & WhatsApp Phishing Risk Detector**  
> Developed for **Team P K** under the **SETU Hackathon Framework** ("Understand → Ideate → Build → Test → Submit").

[![FastAPI](https://img.shields.io/badge/FastAPI-0.115+-009688?logo=fastapi&logoColor=white)](https://fastapi.tiangolo.com)
[![React](https://img.shields.io/badge/React-18+-61DAFB?logo=react&logoColor=black)](https://reactjs.org)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-v4-38B2AC?logo=tailwind-css&logoColor=white)](https://tailwindcss.com)
[![Python](https://img.shields.io/badge/Python-3.11+-3776AB?logo=python&logoColor=white)](https://python.org)
[![Tests](https://img.shields.io/badge/Tests-100%25_Passing-brightgreen)](#-validation--test-results)

---

## 📌 1. Product Overview & Objectives

- **Product Name**: Scam Spotter
- **Team**: Team P K
- **Framework**: SETU Hackathon Framework (*Understand → Ideate → Build → Test → Submit*)
- **Target Audience**: General internet users, students, senior citizens, and mobile users who receive unverified SMS, WhatsApp, Telegram, or email messages.
- **Customer Problem**: Citizens are frequently victimized by coercive, urgent phishing messages. Existing spam filters operate as opaque "black-box" binary flags (Spam vs. Not Spam) without explaining *why* a message is deceptive or what specific actions the user must take to safeguard their assets.
- **Objective**: Provide an accessible, single-screen web application that ingests a suspicious text, evaluates it against a 100% transparent and deterministic rule engine, directly highlights deception triggers inside the text, generates a calibrated risk score (0–100), and outputs actionable resolution steps (including direct access to India's National Cyber Fraud Helpline **1930** and **cybercrime.gov.in**).

---

## ⚙️ 2. Core Features & Capabilities

### Feature 1: Text Ingestion Engine
- **Single-Screen Interface**: Minimalist, distraction-free input area accepting messages up to 2,000 characters.
- **Real-Time Character Counter**: Live count indicator (`X / 2,000`) with visual threshold warnings.
- **Activation Logic**: The "Scan for Risk" trigger button automatically activates when text is detected and disables when empty.
- **Preset Scenarios**: 1-click test cases for judges and users (e.g., Official SBI KYC scam, Safe friend chat, Electricity bill threat, Lottery prize trap).

### Feature 2: Deterministic Rule Analysis (The Core Logic)
Rather than relying on opaque machine learning classifiers, Scam Spotter enforces a strictly explainable rule engine with predefined, calibrated weights across four threat vectors:

| Threat Vector | Weight | Trigger Criteria & Logic | Examples |
|---|:---:|---|---|
| **1. Urgency Check** | **+20 pts** | Artificial panic deadlines that suppress critical thinking: `(?i)\b(today\|immediately\|urgent\|within \d+ hours\|hurry\|asap\|deadline)\b` | *"Update immediately today to avoid deactivation"* |
| **2. Coercive Threats** | **+15 pts** | Intimidation involving penalties, police, or account disruption: `(?i)\b(blocked\|suspended\|legal action\|incomplete\|penalty\|arrest\|police)\b` | *"Your bank account has been blocked due to incomplete KYC"* |
| **3. Suspicious Links** | **+25 pts** | Regex URL extraction with protocol inspection (HTTP vs. HTTPS) and domain verification against safe whitelist (`sbi.co.in`, `gov.in`, `hdfcbank.com`, etc.). | `http://sbi-kyc-verification.xyz` (Insecure HTTP + unverified TLD) |
| **4. Credential Grab** | **+40 pts** | Solicitation of high-risk authentication secrets: `(?i)\b(otp\|password\|pin\|cvv\|debit card\|bank account\|credentials)\b` | *"Enter your OTP and PIN to unblock"* |
| **Total Aggregation** | **100 pts** | Calibrated score mapped directly into standardized Risk Tiers: **Low** (0–29), **Medium** (30–59), **High** (60–100). | Baseline test case hits **exactly 100/100**. |

### Feature 3: Visual Output & Risk Scoring
- **Dynamic Risk Meter**: An animated circular gauge displaying the aggregated score (0–100) and risk tier badge (**Low**, **Medium**, or **High**).
- **In-Text Token Highlighting**: Automatically parses the raw text and wraps offending tokens directly inside color-coded `<mark>` elements:
  - 🟡 **Urgency**: Amber badge
  - 🟣 **Threats**: Rose badge
  - 🔵 **Suspicious Links**: Sky blue badge
  - 🔴 **Credential Grab**: Bold Red badge
- **Interactive Inspection**: Hovering or tapping any highlighted token displays its trigger category and awarded points.

### Feature 4: Actionable Resolution Panel
- **Emergency Helpline Banner**: Highlights India's National Cyber Fraud Helpline **1930** (24x7 toll-free) and direct link to [cybercrime.gov.in](https://cybercrime.gov.in).
- **Contextual Guidance**: Dynamically adapts resolution instructions based on triggered rules:
  - *"NEVER disclose OTP or PIN to anyone."*
  - *"Emergency Lockdown: Freeze card or netbanking if credentials were typed."*
  - *"Do not tap the link: Legitimate institutions do not use insecure HTTP or random TLDs."*
- **Report Export**: 1-click "Copy Safety Report" to share warnings with family and friends.

---

## 🧪 3. Validation & Test Results

The suite includes both automated backend unit tests (`pytest`) and end-to-end evaluation scripts (`test_all.py`):

```bash
python test_all.py
```

### Test Suite Output
```text
============================================================
SCAM SPOTTER - END-TO-END VALIDATION SUITE (Team P K)
============================================================

[Test 1] Official SBI KYC Baseline Test Case:
  Input: Dear Customer, your SBI Bank account has been blocked today ...
  Score: 100 / 100  | Risk Tier: High
  Rules Triggered: ['Urgency', 'Threats', 'Suspicious Links', 'Credential Requests']
  Extracted Tokens: ['Bank account', 'blocked', 'today', 'incomplete', 'immediately', 'suspension', 'http://sbi-kyc-verification.xyz', 'legal action', 'OTP', 'PIN']
  --> PASS: Hits exactly 100/100 with all 4 threat vectors active.

[Test 2] Safe Edge Case (Casual Message):
  Input: "Hey are we still meeting for lunch tomorrow at 1pm? Let me know!"
  Score: 0 / 100 | Risk Tier: Low
  --> PASS: Clean 0/100 score, no false positives.

[Test 3] Verified Safe Domain Check (sbi.co.in):
  Link Rule Triggered: False (Points: 0)
  --> PASS: Official domain properly whitelisted.

[Test 4] Insecure HTTP & Untrusted TLD (.xyz):
  Score: 25 (Link Rule: +25)
  --> PASS: Untrusted/HTTP link flagged (+25).

[Test 5] Sensitive Credential Grab:
  Score: 40 (Credential Rule: +40)
  --> PASS: Credential solicitation flagged (+40).

[Test 6] Threat & Intimidation Vector:
  Score: 15 (Threat Rule: +15)
  --> PASS: Threat flagged (+15).

[Test 7] Urgency & Artificial Panic Vector:
  Score: 20 (Urgency Rule: +20)
  --> PASS: Urgency flagged (+20).

============================================================
RESULTS: 7/7 Tests Passed (100%)
============================================================
```

---

## 🏗️ 4. Project Structure

```
ScamSpotter/
├── backend/
│   ├── app/
│   │   ├── __init__.py
│   │   ├── main.py              # FastAPI app & /api/scan endpoint
│   │   ├── rules.py             # Core deterministic rule engine
│   │   ├── models.py            # Pydantic schemas (Request, Response, TokenSpans)
│   │   └── data/
│   │       ├── __init__.py
│   │       └── safe_domains.py  # Verified domain repository (banks, gov.in)
│   ├── tests/
│   │   ├── __init__.py
│   │   └── test_rules.py        # Pytest test cases
│   ├── Dockerfile               # Container deployment
│   ├── requirements.txt         # FastAPI, Uvicorn, Pydantic, Pytest
│   └── run.py                   # Local backend runner
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   ├── Header.jsx       # Branding, status indicator & help modal
│   │   │   ├── TextInput.jsx    # Accessible 2000-char input & controls
│   │   │   ├── RiskMeter.jsx    # SVG circular gauge & vector score breakdown
│   │   │   ├── HighlightedText.jsx # Interactive in-text trigger annotations
│   │   │   ├── RuleBreakdown.jsx# Transparent 4-vector rule cards
│   │   │   ├── ActionPanel.jsx  # Emergency 1930 guidance & safety steps
│   │   │   ├── SampleMessages.jsx # 1-click benchmark test cases
│   │   │   └── EducationModal.jsx # Rule engine architecture explainer
│   │   ├── utils/
│   │   │   └── ruleEngine.js    # Client-side deterministic sync engine
│   │   ├── App.jsx              # Main React state container
│   │   ├── index.css            # Tailwind CSS styling & highlights
│   │   └── main.jsx
│   ├── package.json
│   ├── vite.config.js           # Vite config with backend proxy
│   └── vercel.json              # Vercel deployment config
├── render.yaml                  # 1-click cloud deployment specification
├── test_all.py                  # End-to-end validation test runner
├── start.ps1                    # PowerShell 1-click launcher
├── start.bat                    # Windows batch launcher
└── README.md
```

---

## 🚀 5. Getting Started

### Prerequisites
- **Python**: 3.10+
- **Node.js**: 18+ (Node 20+ recommended)
- **npm**: 9+

### Quick Start (1-Click Launchers)

**Windows (PowerShell)**:
```powershell
.\start.ps1
```

**Windows (Command Prompt)**:
```cmd
start.bat
```

---

### Manual Launch

#### 1. Backend (FastAPI)
```bash
cd backend
pip install -r requirements.txt
python -m uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload
```
- Interactive API Docs: [http://localhost:8000/docs](http://localhost:8000/docs)
- Health Check: [http://localhost:8000/api/health](http://localhost:8000/api/health)

#### 2. Frontend (React + Vite)
```bash
cd frontend
npm install
npm run dev
```
- Open [http://localhost:5173](http://localhost:5173) in your browser.

---

## 🌐 6. API Reference

### `POST /api/scan`
Ingests raw message text (up to 2,000 characters) and returns the full explainable risk breakdown.

**Request**:
```json
{
  "text": "Dear Customer, your SBI Bank account has been blocked today due to incomplete KYC. Update immediately to avoid suspension: http://sbi-kyc-verification.xyz or your account will face legal action. Enter your OTP and PIN."
}
```

**Response**:
```json
{
  "score": 100,
  "risk_tier": "High",
  "risk_color": "rose",
  "summary": "HIGH RISK: Severe scam indicators detected! This message exhibits classic social engineering tactics designed to steal credentials or money.",
  "rules_triggered": [
    {
      "id": "RULE_URGENCY",
      "name": "Urgency & Artificial Panic",
      "category": "Urgency",
      "weight": 20,
      "triggered": true,
      "score_awarded": 20,
      "matches": ["today", "immediately"],
      "description": "Phrases designed to rush the recipient into acting without thinking...",
      "recommendation": "Scammers intentionally fabricate deadlines to provoke fear."
    },
    {
      "id": "RULE_THREAT",
      "name": "Coercive Threat & Intimidation",
      "category": "Threats",
      "weight": 15,
      "triggered": true,
      "score_awarded": 15,
      "matches": ["blocked", "incomplete", "suspension", "legal action"]
    },
    {
      "id": "RULE_LINK",
      "name": "Suspicious or Insecure Link",
      "category": "Suspicious Links",
      "weight": 25,
      "triggered": true,
      "score_awarded": 25,
      "matches": ["http://sbi-kyc-verification.xyz (insecure HTTP, unverified domain 'sbi-kyc-verification.xyz')"]
    },
    {
      "id": "RULE_CREDENTIAL",
      "name": "Sensitive Credential Solicitation",
      "category": "Credential Requests",
      "weight": 40,
      "triggered": true,
      "score_awarded": 40,
      "matches": ["OTP", "PIN"]
    }
  ],
  "highlight_tokens": [
    {
      "token": "blocked",
      "category": "threat",
      "start": 44,
      "end": 51,
      "color": "rose"
    },
    {
      "token": "today",
      "category": "urgency",
      "start": 52,
      "end": 57,
      "color": "amber"
    }
  ],
  "action_steps": [
    {
      "title": "NEVER Disclose OTP, PIN, or Passwords",
      "description": "No legitimate organization or bank manager will EVER ask for your OTP or PIN.",
      "priority": "critical",
      "icon": "lock"
    },
    {
      "title": "Report to National Cyber Crime Portal (Helpline 1930)",
      "description": "In India, dial 1930 immediately to report financial cyber fraud.",
      "priority": "info",
      "icon": "phone",
      "action_url": "https://cybercrime.gov.in"
    }
  ],
  "character_count": 218
}
```

---

## ☁️ 7. Deployment Instructions (For Unstop Portal Submission)

### Frontend Deployment (Vercel / Netlify)
1. Push this repository to GitHub.
2. In Vercel or Netlify, import the repository and set root directory to `frontend`.
3. Build Command: `npm run build`
4. Output Directory: `dist`
5. The included `frontend/vercel.json` automatically handles single-page client routing.

### Backend Deployment (Render / Railway)
1. In Render, select **New Web Service** and connect your repository.
2. The included `render.yaml` automatically sets up the Python service with `uvicorn app.main:app`.
3. Set environment variable `PORT` (assigned automatically by Render/Railway).
4. In the frontend, set the API endpoint to your live backend URL (or let the built-in offline engine provide seamless zero-downtime reliability).

---

## 👥 8. Hackathon Credits
- **Team**: Team P K
- **Framework**: SETU Hackathon Framework
- **Category**: Cybersecurity & Public Digital Safety
