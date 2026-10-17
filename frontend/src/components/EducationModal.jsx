import React from 'react';
import { X, ShieldCheck, Cpu, CheckCircle2, Lock, Scale, AlertTriangle } from 'lucide-react';

export default function EducationModal({ isOpen, onClose }) {
  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-fade-in"
      role="dialog"
      aria-modal="true"
      aria-labelledby="modal-title"
    >
      <div className="bg-slate-900 border border-slate-700 rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-2xl p-6 relative text-slate-100">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition"
          aria-label="Close dialog"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Modal Header */}
        <div className="flex items-center space-x-3 mb-4">
          <div className="p-2.5 rounded-xl bg-blue-500/20 text-blue-400 border border-blue-500/30">
            <Cpu className="w-6 h-6" />
          </div>
          <div>
            <h3 id="modal-title" className="text-xl font-bold tracking-tight text-white">
              Scam Spotter Architecture & Rule Engine
            </h3>
            <p className="text-xs text-slate-400">
              Team P K • SETU Hackathon "Understand → Ideate → Build → Test → Submit" Framework
            </p>
          </div>
        </div>

        {/* Content */}
        <div className="space-y-4 text-xs sm:text-sm text-slate-300 leading-relaxed">
          {/* Why Explainable Rule Engine */}
          <div className="bg-slate-950/70 p-4 rounded-xl border border-slate-800 space-y-2">
            <h4 className="font-bold text-white flex items-center space-x-2">
              <Scale className="w-4 h-4 text-blue-400" />
              <span>Why Deterministic Rules Instead of AI Black Boxes?</span>
            </h4>
            <p>
              Traditional AI spam classifiers output opaque "Spam / Not Spam" probabilities. When an elderly or non-technical user receives a scary message, a black-box label doesn't teach them <em>why</em> it is deceptive.
            </p>
            <p>
              Scam Spotter employs a <strong>100% deterministic, explainable rule engine</strong> using regex heuristics and verified domain trees. Every point awarded maps directly to visible psychological manipulation triggers.
            </p>
          </div>

          {/* Mathematical Weight Matrix */}
          <div className="space-y-2">
            <h4 className="font-bold text-white">Threat Vector Scoring Matrix (Max: 100 Points)</h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
              <div className="p-3 rounded-lg bg-slate-950 border border-amber-500/30">
                <div className="flex justify-between font-bold text-amber-300 mb-1">
                  <span>1. Urgency & Panic</span>
                  <span className="font-mono">+20 Points</span>
                </div>
                <p className="text-slate-400 text-[11px]">
                  Matches keywords like <em>today, immediately, urgent, within 24 hours</em> that attempt to bypass critical thinking.
                </p>
              </div>

              <div className="p-3 rounded-lg bg-slate-950 border border-rose-500/30">
                <div className="flex justify-between font-bold text-rose-300 mb-1">
                  <span>2. Threats & Coercion</span>
                  <span className="font-mono">+15 Points</span>
                </div>
                <p className="text-slate-400 text-[11px]">
                  Matches threats of <em>blocked account, suspension, police, legal action, incomplete KYC</em> designed to induce panic.
                </p>
              </div>

              <div className="p-3 rounded-lg bg-slate-950 border border-sky-500/30">
                <div className="flex justify-between font-bold text-sky-300 mb-1">
                  <span>3. Suspicious Links</span>
                  <span className="font-mono">+25 Points</span>
                </div>
                <p className="text-slate-400 text-[11px]">
                  Extracts URLs and verifies against a whitelist of official bank and government domains. Insecure HTTP or unknown domains get flagged.
                </p>
              </div>

              <div className="p-3 rounded-lg bg-slate-950 border border-red-500/30">
                <div className="flex justify-between font-bold text-red-300 mb-1">
                  <span>4. Credential Grab</span>
                  <span className="font-mono">+40 Points</span>
                </div>
                <p className="text-slate-400 text-[11px]">
                  Matches requests for <em>OTP, PIN, CVV, passwords, netbanking</em>. The ultimate phishing goal.
                </p>
              </div>
            </div>
          </div>

          {/* Risk Tiers */}
          <div className="bg-slate-950/70 p-4 rounded-xl border border-slate-800 space-y-2">
            <h4 className="font-bold text-white">Risk Tiers Classification</h4>
            <div className="flex flex-wrap gap-2 text-xs">
              <span className="px-2.5 py-1 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 font-semibold">
                Low: 0 - 29 (Safe)
              </span>
              <span className="px-2.5 py-1 rounded bg-amber-500/20 text-amber-300 border border-amber-500/30 font-semibold">
                Medium: 30 - 59 (Suspicious)
              </span>
              <span className="px-2.5 py-1 rounded bg-rose-500/20 text-rose-300 border border-rose-500/30 font-semibold">
                High: 60 - 100 (Immediate Danger)
              </span>
            </div>
          </div>

          {/* Baseline Validation */}
          <div className="border-t border-slate-800 pt-3 flex items-center justify-between">
            <span className="text-xs text-slate-400">
              Verified against official SBI KYC scam test case (100/100).
            </span>
            <button
              onClick={onClose}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white font-medium text-xs rounded-lg transition"
            >
              Got it
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
