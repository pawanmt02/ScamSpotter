"""
Safe domain repository for Scam Spotter URL verification.
Only verified, legitimate portals (official banking, government, known safe platforms)
are considered safe.
"""

SAFE_DOMAINS = {
    # Major Indian Banks (SBI, HDFC, ICICI, etc.)
    "sbi.co.in",
    "onlinesbi.sbi",
    "onlinesbi.com",
    "hdfcbank.com",
    "icicibank.com",
    "axisbank.com",
    "kotak.com",
    "bankofbaroda.in",
    "pnbindia.in",
    "canarabank.com",
    "unionbankofindia.co.in",
    "idfcfirstbank.com",
    "indusind.com",
    
    # Official Government & Police Portals
    "gov.in",
    "nic.in",
    "cybercrime.gov.in",
    "uidai.gov.in",
    "incometax.gov.in",
    "rbi.org.in",
    "ceir.gov.in",
    "npci.org.in",
    
    # Global Reputable Services
    "google.com",
    "apple.com",
    "microsoft.com",
    "amazon.in",
    "amazon.com",
    "whatsapp.com",
    "telegram.org",
}

def is_domain_safe(domain: str) -> bool:
    """
    Checks if a normalized hostname matches or is a subdomain of a verified safe domain.
    E.g., netbanking.hdfcbank.com matches hdfcbank.com.
    """
    if not domain:
        return False
        
    domain = domain.lower().strip()
    
    # Direct match
    if domain in SAFE_DOMAINS:
        return True
        
    # Check subdomain match (e.g., portal.gov.in ends with .gov.in)
    for safe in SAFE_DOMAINS:
        if domain.endswith("." + safe):
            return True
            
    return False
