import React, { useState } from 'react';
import { ShieldAlert, Lock, PhoneCall, ExternalLink, AlertOctagon, CheckCheck, Share2, Copy } from 'lucide-react';

export default function ActionPanel({ actionSteps, score, riskTier, summary }) {
  const [copied, setCopied] = useState(false);

  const getStepIcon = (iconName) => {
    switch (iconName) {
      case 'lock':
        return Lock;
      case 'shield-alert':
        return ShieldAlert;
      case 'phone':
        return PhoneCall;
      case 'external-link':
        return ExternalLink;
      default:
        return AlertOctagon;
    }
  };

  const handleCopyReport = () => {
    const reportText = `🛡️ [Scam Spotter Analysis Report]\nRisk Tier: ${riskTier} (${score}/100)\n\nSummary:\n${summary}\n\nRecommended Safe Next Steps:\n${actionSteps
      .map((s, i) => `${i + 1}. ${s.title}: ${s.description}`)
      .join('\n\n')}\n\nEmergency Helpline (India): 1930\nCyber Crime Portal: https://cybercrime.gov.in`;

    navigator.clipboard.writeText(reportText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  return (
    <div className="bg-slate-900/90 rounded-2xl border border-slate-800 p-5 sm:p-6 shadow-xl space-y-5">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800/80 pb-3">
        <div>
          <h4 className="text-base font-bold text-white tracking-tight flex items-center space-x-2">
            <span>Actionable Resolution Guidance</span>
            <span className="text-xs font-normal text-slate-400">
              (Tailored specifically to detected threats)
            </span>
          </h4>
          <p className="text-xs text-slate-400 mt-0.5">
            Follow these verified safe protocols to protect your accounts and identity.
          </p>
        </div>

        {/* Copy Report Button */}
        <button
          type="button"
          onClick={handleCopyReport}
          className="inline-flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs font-medium text-slate-300 hover:text-white bg-slate-800 hover:bg-slate-700 border border-slate-700 transition"
        >
          {copied ? (
            <>
              <CheckCheck className="w-3.5 h-3.5 text-emerald-400" />
              <span className="text-emerald-400 font-semibold">Report Copied!</span>
            </>
          ) : (
            <>
              <Copy className="w-3.5 h-3.5 text-blue-400" />
              <span>Copy Safety Report</span>
            </>
          )}
        </button>
      </div>

      {/* Emergency Cybercrime Helpline Banner if High or Medium */}
      {score >= 30 && (
        <div className="bg-gradient-to-r from-red-950/60 via-slate-900 to-slate-900 border border-red-500/30 rounded-xl p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 shadow-lg">
          <div className="flex items-center space-x-3">
            <div className="p-2.5 rounded-xl bg-red-500/20 text-red-400 border border-red-500/30">
              <PhoneCall className="w-5 h-5 animate-pulse" />
            </div>
            <div>
              <h5 className="text-sm font-bold text-white flex items-center space-x-2">
                <span>National Cyber Fraud Helpline: 1930</span>
                <span className="text-[10px] uppercase font-bold px-1.5 py-0.5 rounded bg-red-500/20 text-red-300">
                  Toll Free 24x7
                </span>
              </h5>
              <p className="text-xs text-slate-300 mt-0.5">
                If you have shared bank credentials or lost money, dial <strong className="text-white">1930</strong> immediately within the "Golden Hour" to freeze fund transfers.
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-2 w-full sm:w-auto">
            <a
              href="tel:1930"
              className="flex-1 sm:flex-none text-center px-3.5 py-2 rounded-lg bg-red-600 hover:bg-red-500 text-white font-semibold text-xs transition shadow-md shadow-red-600/30"
            >
              Dial 1930
            </a>
            <a
              href="https://cybercrime.gov.in"
              target="_blank"
              rel="noopener noreferrer"
              className="flex-1 sm:flex-none text-center px-3.5 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 font-medium text-xs border border-slate-700 transition inline-flex items-center justify-center space-x-1"
            >
              <span>cybercrime.gov.in</span>
              <ExternalLink className="w-3 h-3 ml-1" />
            </a>
          </div>
        </div>
      )}

      {/* Action Steps List */}
      <div className="space-y-3">
        {actionSteps && actionSteps.map((step, idx) => {
          const StepIcon = getStepIcon(step.icon);
          const isCritical = step.priority === 'critical';
          const isWarning = step.priority === 'warning';

          return (
            <div
              key={idx}
              className={`rounded-xl p-4 border flex items-start space-x-3.5 transition-all ${
                isCritical
                  ? 'bg-red-950/20 border-red-500/30 text-red-200'
                  : isWarning
                  ? 'bg-amber-950/20 border-amber-500/30 text-amber-200'
                  : 'bg-slate-950/50 border-slate-800 text-slate-300'
              }`}
            >
              <div
                className={`p-2 rounded-lg flex-shrink-0 mt-0.5 ${
                  isCritical
                    ? 'bg-red-500/20 text-red-400'
                    : isWarning
                    ? 'bg-amber-500/20 text-amber-400'
                    : 'bg-blue-500/20 text-blue-400'
                }`}
              >
                <StepIcon className="w-4 h-4" />
              </div>

              <div className="flex-1">
                <div className="flex items-center justify-between gap-2">
                  <h5 className="text-sm font-bold text-white tracking-tight">
                    {step.title}
                  </h5>
                  <span
                    className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full border ${
                      isCritical
                        ? 'bg-red-500/20 text-red-300 border-red-500/40'
                        : isWarning
                        ? 'bg-amber-500/20 text-amber-300 border-amber-500/40'
                        : 'bg-blue-500/10 text-blue-300 border-blue-500/20'
                    }`}
                  >
                    {step.priority}
                  </span>
                </div>

                <p className="text-xs text-slate-300 leading-relaxed mt-1">
                  {step.description}
                </p>

                {step.action_url && (
                  <a
                    href={step.action_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center space-x-1 text-xs font-semibold text-blue-400 hover:text-blue-300 mt-2 hover:underline"
                  >
                    <span>{step.action_label || 'Learn More'}</span>
                    <ExternalLink className="w-3 h-3" />
                  </a>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
