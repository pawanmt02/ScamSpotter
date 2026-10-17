import React, { useState, useEffect } from 'react';
import Header from './components/Header';
import TextInput from './components/TextInput';
import RiskMeter from './components/RiskMeter';
import HighlightedText from './components/HighlightedText';
import RuleBreakdown from './components/RuleBreakdown';
import ActionPanel from './components/ActionPanel';
import SampleMessages, { SAMPLE_DATA } from './components/SampleMessages';
import EducationModal from './components/EducationModal';
import { evaluateMessageLocally } from './utils/ruleEngine';
import { ShieldAlert, ShieldCheck, Sparkles, Search, ArrowDown } from 'lucide-react';

export default function App() {
  const [inputText, setInputText] = useState('');
  const [isScanning, setIsScanning] = useState(false);
  const [scanResult, setScanResult] = useState(null);
  const [lastScannedText, setLastScannedText] = useState(null);
  const [backendConnected, setBackendConnected] = useState(false);
  const [showExplainer, setShowExplainer] = useState(false);
  const [errorMessage, setErrorMessage] = useState(null);

  // Check backend health on initial mount
  useEffect(() => {
    checkBackendHealth();
  }, []);

  const checkBackendHealth = async () => {
    try {
      const res = await fetch('/api/health');
      if (res.ok) {
        setBackendConnected(true);
      } else {
        setBackendConnected(false);
      }
    } catch (err) {
      setBackendConnected(false);
    }
  };

  // Perform single scan execution (called ONLY when user initiates scan)
  const executeScan = async (textToScan = inputText) => {
    const text = (textToScan || '').trim();
    if (!text) {
      setErrorMessage('Please paste or type a message before scanning.');
      return;
    }

    if (isScanning) return; // Prevent concurrent duplicate scans

    setIsScanning(true);
    setErrorMessage(null);

    try {
      let result = null;
      // Primary backend attempt
      try {
        const response = await fetch('/api/scan', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ text }),
        });

        if (response.ok) {
          result = await response.json();
          setBackendConnected(true);
        } else {
          throw new Error(`Backend returned status ${response.status}`);
        }
      } catch (backendErr) {
        // High-accuracy client fallback
        console.warn('Backend offline, running high-accuracy client rule engine:', backendErr);
        setBackendConnected(false);
        result = evaluateMessageLocally(text);
      }

      setScanResult(result);
      setLastScannedText(text);

      // Smooth scroll to results on mobile/desktop
      setTimeout(() => {
        const resultsEl = document.getElementById('scan-results');
        if (resultsEl) {
          resultsEl.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
      }, 100);
    } catch (err) {
      setErrorMessage('Failed to complete scan. Please try again.');
      console.error(err);
    } finally {
      setIsScanning(false);
    }
  };

  const handleSelectSample = (sampleKey) => {
    const sample = SAMPLE_DATA[sampleKey];
    if (sample) {
      setInputText(sample.text);
      // Execute scan once for the chosen sample
      executeScan(sample.text);
    }
  };

  const isStale = lastScannedText !== null && inputText.trim() !== lastScannedText.trim();

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans">
      {/* App Header */}
      <Header
        backendConnected={backendConnected}
        onOpenExplainer={() => setShowExplainer(true)}
      />

      {/* Main Content Area */}
      <main className="flex-1 max-w-6xl w-full mx-auto px-4 py-6 sm:py-8 space-y-6">
        {/* Hackathon Banner */}
        <div className="bg-gradient-to-r from-blue-900/30 via-indigo-900/20 to-slate-900 border border-blue-500/20 rounded-2xl p-4 sm:p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center space-x-2">
              <span className="px-2 py-0.5 rounded-full bg-blue-500/20 text-blue-300 text-[10px] font-bold uppercase tracking-wider border border-blue-500/30">
                SETU Hackathon Phase: Build & Test
              </span>
              <span className="text-xs text-slate-400 font-medium">
                Team P K
              </span>
            </div>
            <h2 className="text-base sm:text-lg font-bold text-white tracking-tight m-0">
              High-Accuracy Phishing & Scam Risk Evaluator
            </h2>
            <p className="text-xs sm:text-sm text-slate-300 leading-relaxed max-w-3xl m-0">
              Evaluates suspicious messages against calibrated threat vectors with context-aware disambiguation.
              Flags Urgency (+20), Coercive Threats (+15), Unverified / Spoofed Links (+25), and Credential Requests (+40) with 0% black-box opacity.
            </p>
          </div>

          <button
            onClick={() => setShowExplainer(true)}
            className="flex-shrink-0 px-3.5 py-2 rounded-xl bg-blue-600/20 hover:bg-blue-600/30 text-blue-300 border border-blue-500/30 text-xs font-semibold transition"
          >
            Inspect PRD Rules Matrix →
          </button>
        </div>

        {/* Error Notification */}
        {errorMessage && (
          <div className="bg-rose-950/40 border border-rose-500/40 text-rose-200 p-3.5 rounded-xl text-xs flex items-center justify-between">
            <span>{errorMessage}</span>
            <button
              onClick={() => setErrorMessage(null)}
              className="text-rose-400 font-bold hover:underline"
            >
              Dismiss
            </button>
          </div>
        )}

        {/* Feature 1: Text Ingestion Engine (Do Once Scan on trigger) */}
        <TextInput
          text={inputText}
          setText={setInputText}
          onScan={() => executeScan(inputText)}
          isScanning={isScanning}
          onSelectSample={handleSelectSample}
          hasScanned={lastScannedText !== null}
          isStale={isStale}
        />

        {/* Preset Sample Benchmarks */}
        <SampleMessages onSelect={handleSelectSample} />

        {/* Empty state prompt if not scanned yet */}
        {!scanResult && (
          <div className="bg-slate-900/40 border border-slate-800/80 rounded-2xl p-8 text-center space-y-3">
            <div className="w-12 h-12 mx-auto rounded-full bg-slate-800 flex items-center justify-center text-slate-400">
              <Search className="w-6 h-6" />
            </div>
            <h3 className="text-base font-bold text-slate-200">
              Ready to Analyze
            </h3>
            <p className="text-xs sm:text-sm text-slate-400 max-w-md mx-auto">
              Paste an unverified message above or click one of the preset benchmark cases, then press <strong>"Scan for Risk"</strong> to run a single evaluation.
            </p>
          </div>
        )}

        {/* Scanned Results Section (Features 2, 3, 4) */}
        {scanResult && (
          <div id="scan-results" className="space-y-6 animate-fade-in pt-2">
            {/* Feature 3: Visual Output & Risk Scoring (Risk Meter) */}
            <RiskMeter
              score={scanResult.score}
              riskTier={scanResult.risk_tier}
              riskColor={scanResult.risk_color}
              summary={scanResult.summary}
              rulesTriggered={scanResult.rules_triggered}
              brandImpersonation={scanResult.brand_impersonation}
              confidenceLevel={scanResult.confidence_level}
            />

            {/* Feature 3: In-Text Token Highlighting */}
            <HighlightedText
              text={lastScannedText || inputText}
              highlightTokens={scanResult.highlight_tokens}
            />

            {/* Feature 2: Deterministic Rule Analysis Breakdown */}
            <RuleBreakdown rules={scanResult.rules_triggered} />

            {/* Feature 4: Actionable Resolution Panel */}
            <ActionPanel
              actionSteps={scanResult.action_steps}
              score={scanResult.score}
              riskTier={scanResult.risk_tier}
              summary={scanResult.summary}
            />
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-800 bg-slate-950/80 py-6 text-center text-xs text-slate-500">
        <div className="max-w-6xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-3">
          <p className="m-0">
            Scam Spotter • Developed by <strong className="text-slate-300">Team P K</strong> for SETU Hackathon
          </p>
          <div className="flex items-center space-x-4">
            <span className="text-slate-400">Emergency Cyber Helpline: <strong>1930</strong></span>
            <span>•</span>
            <a
              href="https://cybercrime.gov.in"
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-400 hover:underline"
            >
              cybercrime.gov.in
            </a>
          </div>
        </div>
      </footer>

      {/* Rule Engine & Architecture Explainer Modal */}
      <EducationModal
        isOpen={showExplainer}
        onClose={() => setShowExplainer(false)}
      />
    </div>
  );
}
