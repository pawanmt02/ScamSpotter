"""
End-to-end verification script for Scam Spotter rule engine & API.
Team P K | SETU Hackathon Framework
"""
import os
import sys

# Ensure backend directory is in sys.path
backend_path = os.path.abspath(os.path.join(os.path.dirname(__file__), "backend"))
if backend_path not in sys.path:
    sys.path.insert(0, backend_path)

from app.rules import scan_message
from app.data.safe_domains import is_domain_safe

def run_tests():
    print("=" * 60)
    print("SCAM SPOTTER - HIGH-ACCURACY VALIDATION SUITE (Team P K)")
    print("=" * 60)
    
    passed = 0
    total = 0

    # Test 1: Official SBI KYC Baseline (Must score 100/100)
    total += 1
    sbi_text = (
        "Dear Customer, your SBI Bank account has been blocked today due to incomplete KYC. "
        "Update immediately to avoid suspension: http://sbi-kyc-verification.xyz "
        "or your account will face legal action. Enter your OTP and PIN."
    )
    res1 = scan_message(sbi_text)
    print(f"\n[Test 1] Official SBI KYC Baseline Test Case:")
    print(f"  Input: {sbi_text[:60]}...")
    print(f"  Score: {res1.score} / 100  | Risk Tier: {res1.risk_tier}")
    print(f"  Brand Spoof Detected: {res1.brand_impersonation}")
    print(f"  Rules Triggered: {[r.category for r in res1.rules_triggered if r.triggered]}")
    print(f"  Extracted Tokens: {[s.token for s in res1.highlight_tokens]}")
    
    if res1.score == 100 and res1.risk_tier == "High" and len([r for r in res1.rules_triggered if r.triggered]) == 4:
        print("  --> PASS: Hits exactly 100/100 with all 4 threat vectors active.")
        passed += 1
    else:
        print("  --> FAIL: Expected 100/100 High Risk.")

    # Test 2: Safe Friend Message (Must score 0/100)
    total += 1
    safe_text = "Hey are we still meeting for lunch tomorrow at 1pm? Let me know!"
    res2 = scan_message(safe_text)
    print(f"\n[Test 2] Safe Edge Case (Casual Message):")
    print(f"  Input: \"{safe_text}\"")
    print(f"  Score: {res2.score} / 100 | Risk Tier: {res2.risk_tier}")
    if res2.score == 0 and res2.risk_tier == "Low" and len(res2.highlight_tokens) == 0:
        print("  --> PASS: Clean 0/100 score, no false positives.")
        passed += 1
    else:
        print("  --> FAIL: Expected 0/100 Low Risk.")

    # Test 3: Neutral Mention of 'today' (False positive prevention)
    total += 1
    today_text = "Are you available today afternoon for an informal catchup?"
    res3 = scan_message(today_text)
    print(f"\n[Test 3] False Positive Prevention: Neutral 'today':")
    print(f"  Score: {res3.score} / 100")
    if res3.score == 0:
        print("  --> PASS: Neutral 'today' not falsely flagged as urgency.")
        passed += 1
    else:
        print("  --> FAIL: Neutral 'today' triggered false positive.")

    # Test 4: Neutral Mention of 'bank account' (False positive prevention)
    total += 1
    bank_text = "I checked my bank account balance and everything is in order."
    res4 = scan_message(bank_text)
    print(f"\n[Test 4] False Positive Prevention: Neutral 'bank account':")
    print(f"  Score: {res4.score} / 100")
    if res4.score == 0:
        print("  --> PASS: Passive 'bank account' mention not flagged as credential grab.")
        passed += 1
    else:
        print("  --> FAIL: Passive bank account triggered false positive.")

    # Test 5: Safe Domain URL (Should NOT trigger suspicious link)
    total += 1
    safe_link_text = "Please log into https://sbi.co.in to view your official interest statement."
    res5 = scan_message(safe_link_text)
    link_rule = next(r for r in res5.rules_triggered if r.id == "RULE_LINK")
    print(f"\n[Test 5] Verified Safe Domain Check (sbi.co.in):")
    print(f"  Link Rule Triggered: {link_rule.triggered} (Points: {link_rule.score_awarded})")
    if not link_rule.triggered:
        print("  --> PASS: Official domain properly whitelisted.")
        passed += 1
    else:
        print("  --> FAIL: Safe domain false positive.")

    # Test 6: Insecure HTTP & Untrusted TLD (.xyz):
    total += 1
    http_link_text = "Claim your package at http://tracking-courier-post.xyz"
    res6 = scan_message(http_link_text)
    link_rule2 = next(r for r in res6.rules_triggered if r.id == "RULE_LINK")
    print(f"\n[Test 6] Insecure HTTP & Untrusted TLD (.xyz):")
    print(f"  Score: {res6.score} (Link Rule: +{link_rule2.score_awarded})")
    if link_rule2.triggered and link_rule2.score_awarded == 25:
        print("  --> PASS: Untrusted/HTTP link flagged (+25).")
        passed += 1
    else:
        print("  --> FAIL: Insecure link missed.")

    # Test 7: Sensitive Credential Grab
    total += 1
    cred_text = "Please provide your debit card PIN and login password to continue."
    res7 = scan_message(cred_text)
    cred_rule = next(r for r in res7.rules_triggered if r.id == "RULE_CREDENTIAL")
    print(f"\n[Test 7] Sensitive Credential Grab:")
    print(f"  Score: {res7.score} (Credential Rule: +{cred_rule.score_awarded})")
    if cred_rule.triggered and cred_rule.score_awarded == 40:
        print("  --> PASS: Credential solicitation flagged (+40).")
        passed += 1
    else:
        print("  --> FAIL: Credential solicitation missed.")

    print("\n" + "=" * 60)
    print(f"RESULTS: {passed}/{total} Tests Passed ({int(passed/total*100)}%)")
    print("=" * 60)
    return passed == total

if __name__ == "__main__":
    success = run_tests()
    sys.exit(0 if success else 1)
