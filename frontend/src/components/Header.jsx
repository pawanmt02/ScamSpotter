import React from 'react';
import { ShieldAlert, CheckCircle2, Server, HelpCircle, Sparkles } from 'lucide-react';

export default function Header({ backendConnected, onOpenExplainer }) {
  return (
    <header className="border-b border-slate-800 bg-slate-900/80 backdrop-blur-md sticky top-0 z-40">
      <div className="max-w-6xl mx-auto px-4 py-3.5 flex flex-wrap items-center justify-between gap-3">
        {/* Logo and title */}
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-blue-600 via-indigo-600 to-cyan-400 p-0.5 shadow-lg shadow-blue-500/20 flex items-center justify-center">
            <div className="w-full h-full bg-slate-950 rounded-[10px] flex items-center justify-center">
              <ShieldAlert className="w-5 h-5 text-blue-400" />
            </div>
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <h1 className="text-xl font-bold tracking-tight text-white m-0">Scam Spotter</h1>
              <span className="text-[10px] font-semibold tracking-wider uppercase px-2 py-0.5 rounded-full bg-blue-500/10 text-blue-400 border border-blue-500/20">
                SETU MVP
              </span>
            </div>
            <p className="text-xs text-slate-400 m-0">
              Explainable Rule Engine for SMS & WhatsApp Phishing Detection • <span className="text-slate-300 font-medium">Team P K</span>
            </p>
          </div>
        </div>

        {/* Status badges & Help */}
        <div className="flex items-center space-x-3">
          {/* Backend Status indicator */}
          <div
            className={`flex items-center space-x-1.5 px-2.5 py-1 rounded-full text-xs font-medium border ${
              backendConnected
                ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
                : 'bg-amber-500/10 text-amber-300 border-amber-500/20'
            }`}
            title={backendConnected ? 'Connected to FastAPI Python Backend' : 'Using Local Deterministic Engine Fallback'}
          >
            <span className={`w-2 h-2 rounded-full ${backendConnected ? 'bg-emerald-400 animate-pulse' : 'bg-amber-400'}`}></span>
            <span className="hidden sm:inline">Backend:</span>
            <span>{backendConnected ? 'FastAPI Online' : 'Local Rule Engine'}</span>
          </div>

          {/* Rule Architecture Guide Button */}
          <button
            onClick={onOpenExplainer}
            className="flex items-center space-x-1.5 px-3 py-1.5 text-xs font-medium text-slate-300 bg-slate-800 hover:bg-slate-700 hover:text-white rounded-lg border border-slate-700 transition"
            aria-label="How the rule engine works"
          >
            <HelpCircle className="w-3.5 h-3.5 text-blue-400" />
            <span className="hidden sm:inline">How It Works</span>
          </button>
        </div>
      </div>
    </header>
  );
}
