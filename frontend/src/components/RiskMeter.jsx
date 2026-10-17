import React from 'react';
import { ShieldAlert, ShieldCheck, AlertTriangle, AlertOctagon, CheckCircle2 } from 'lucide-react';

export default function RiskMeter({ score, riskTier, riskColor, summary, rulesTriggered, brandImpersonation, confidenceLevel }) {
  // Tier info mapping
  const tierConfig = {
    Low: {
      label: 'Low Risk',
      subtext: 'Minimal or No Phishing Triggers Found',
      badgeClass: 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30',
      textClass: 'text-emerald-400',
      gradient: 'from-emerald-500 to-teal-400',
      icon: ShieldCheck,
      ringColor: '#10b981',
    },
    Medium: {
      label: 'Medium Risk',
      subtext: 'Suspicious Indicators Detected - Exercise Caution',
      badgeClass: 'bg-amber-500/15 text-amber-400 border-amber-500/30',
      textClass: 'text-amber-400',
      gradient: 'from-amber-500 to-orange-400',
      icon: AlertTriangle,
      ringColor: '#f59e0b',
    },
    High: {
      label: 'High Risk',
      subtext: 'Critical Threat Vectors Detected - Do Not Comply',
      badgeClass: 'bg-rose-500/15 text-rose-400 border-rose-500/30',
      textClass: 'text-rose-400',
      gradient: 'from-rose-600 to-red-500',
      icon: ShieldAlert,
      ringColor: '#f43f5e',
    },
  };

  const currentTier = tierConfig[riskTier] || tierConfig.Low;
  const TierIcon = currentTier.icon;

  // Circular gauge calculations
  const radius = 64;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (score / 100) * circumference;

  return (
    <div className="bg-slate-900/90 rounded-2xl border border-slate-800 p-6 shadow-xl flex flex-col md:flex-row items-center justify-between gap-6">
      {/* Gauge and Score Display */}
      <div className="flex items-center space-x-6">
        <div className="relative w-36 h-36 flex-shrink-0 flex items-center justify-center">
          <svg className="w-full h-full transform -rotate-90" viewBox="0 0 160 160">
            {/* Background track */}
            <circle
              cx="80"
              cy="80"
              r={radius}
              stroke="currentColor"
              strokeWidth="12"
              fill="transparent"
              className="text-slate-800"
            />
            {/* Animated Risk Meter progress circle */}
            <circle
              cx="80"
              cy="80"
              r={radius}
              stroke={currentTier.ringColor}
              strokeWidth="12"
              strokeDasharray={circumference}
              strokeDashoffset={strokeDashoffset}
              strokeLinecap="round"
              fill="transparent"
              className="transition-all duration-1000 ease-out"
            />
          </svg>

          {/* Center text in gauge */}
          <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
            <span className={`text-4xl font-extrabold tracking-tight ${currentTier.textClass}`}>
              {score}
            </span>
            <span className="text-[11px] font-medium uppercase tracking-wider text-slate-400">
              out of 100
            </span>
          </div>
        </div>

        {/* Risk Tier & High-Level Summary */}
        <div className="space-y-2">
          <div className="flex flex-wrap items-center gap-2">
            <div className={`inline-flex items-center space-x-1.5 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider border ${currentTier.badgeClass}`}>
              <TierIcon className="w-3.5 h-3.5" />
              <span>{currentTier.label} ({score}/100)</span>
            </div>
            <span className="text-xs text-slate-400 font-mono">
              Tier: {score < 30 ? '0-29' : score < 60 ? '30-59' : '60-100'}
            </span>
            <span className="text-[11px] px-2 py-0.5 rounded bg-blue-500/10 text-blue-300 border border-blue-500/20 font-medium">
              High Precision Engine
            </span>
          </div>

          <h3 className="text-lg font-bold text-white tracking-tight">
            {currentTier.subtext}
          </h3>

          <p className="text-xs sm:text-sm text-slate-300 leading-relaxed max-w-xl">
            {summary}
          </p>

          {/* Brand Spoofing Alert Pill */}
          {brandImpersonation && (
            <div className="mt-2 inline-flex items-center space-x-2 px-3 py-1.5 rounded-xl bg-red-950/60 border border-red-500/40 text-red-200 text-xs font-semibold animate-pulse">
              <AlertOctagon className="w-4 h-4 text-red-400 flex-shrink-0" />
              <span>Brand Spoofing: {brandImpersonation}</span>
            </div>
          )}
        </div>
      </div>

      {/* Vector Score Distribution Breakdown */}
      <div className="w-full md:w-72 bg-slate-950/60 rounded-xl p-4 border border-slate-800/80 space-y-2.5">
        <div className="flex items-center justify-between text-xs font-semibold text-slate-300 border-b border-slate-800 pb-1.5">
          <span>Threat Vector Breakdown</span>
          <span>Points</span>
        </div>

        <div className="space-y-2 text-xs">
          {rulesTriggered && rulesTriggered.map((rule) => (
            <div key={rule.id} className="flex items-center justify-between">
              <span className="flex items-center space-x-1.5 text-slate-300">
                <span
                  className={`w-2 h-2 rounded-full ${
                    rule.triggered
                      ? rule.id === 'RULE_CREDENTIAL'
                        ? 'bg-red-500'
                        : rule.id === 'RULE_LINK'
                        ? 'bg-sky-400'
                        : rule.id === 'RULE_THREAT'
                        ? 'bg-rose-500'
                        : 'bg-amber-400'
                      : 'bg-slate-700'
                  }`}
                />
                <span className={rule.triggered ? 'text-slate-100 font-medium' : 'text-slate-400'}>
                  {rule.category}
                </span>
              </span>

              <span
                className={`font-mono text-xs font-semibold px-1.5 py-0.5 rounded ${
                  rule.triggered
                    ? 'bg-slate-800 text-white border border-slate-700'
                    : 'text-slate-500'
                }`}
              >
                +{rule.score_awarded} / {rule.weight}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
