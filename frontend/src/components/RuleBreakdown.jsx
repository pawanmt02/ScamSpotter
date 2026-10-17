import React from 'react';
import { AlertCircle, CheckCircle, ShieldAlert, Clock, Link as LinkIcon, KeyRound, ChevronRight } from 'lucide-react';

export default function RuleBreakdown({ rules }) {
  const getCategoryIcon = (categoryId) => {
    switch (categoryId) {
      case 'RULE_URGENCY':
        return Clock;
      case 'RULE_THREAT':
        return ShieldAlert;
      case 'RULE_LINK':
        return LinkIcon;
      case 'RULE_CREDENTIAL':
        return KeyRound;
      default:
        return AlertCircle;
    }
  };

  return (
    <div className="bg-slate-900/90 rounded-2xl border border-slate-800 p-5 sm:p-6 shadow-xl space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-800/80 pb-3">
        <div>
          <h4 className="text-base font-bold text-white tracking-tight flex items-center space-x-2">
            <span>Deterministic Rule Engine Breakdown</span>
            <span className="text-xs font-normal text-slate-400">(100% Explainable • 0% Black Box)</span>
          </h4>
          <p className="text-xs text-slate-400 mt-0.5">
            Transparent breakdown of each threat vector evaluated against the message.
          </p>
        </div>
      </div>

      {/* Rules Grid / Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {rules && rules.map((rule) => {
          const Icon = getCategoryIcon(rule.id);
          const isTriggered = rule.triggered;

          return (
            <div
              key={rule.id}
              className={`rounded-xl p-4 border transition-all ${
                isTriggered
                  ? 'bg-slate-950/90 border-slate-700 shadow-md ring-1 ring-slate-700/50'
                  : 'bg-slate-950/40 border-slate-800/60 opacity-75'
              }`}
            >
              {/* Card Header: Icon, Category Name, Score Badge */}
              <div className="flex items-start justify-between gap-3 mb-2.5">
                <div className="flex items-center space-x-2.5">
                  <div
                    className={`p-2 rounded-lg ${
                      isTriggered
                        ? rule.id === 'RULE_CREDENTIAL'
                          ? 'bg-red-500/20 text-red-400'
                          : rule.id === 'RULE_LINK'
                          ? 'bg-sky-500/20 text-sky-400'
                          : rule.id === 'RULE_THREAT'
                          ? 'bg-rose-500/20 text-rose-400'
                          : 'bg-amber-500/20 text-amber-400'
                        : 'bg-slate-800 text-slate-500'
                    }`}
                  >
                    <Icon className="w-4 h-4" />
                  </div>
                  <div>
                    <h5 className="text-sm font-bold text-white tracking-tight leading-tight">
                      {rule.name}
                    </h5>
                    <span className="text-[11px] font-mono text-slate-400">
                      {rule.category}
                    </span>
                  </div>
                </div>

                <div className="flex flex-col items-end">
                  <span
                    className={`text-xs font-mono font-bold px-2 py-0.5 rounded-full border ${
                      isTriggered
                        ? 'bg-rose-500/15 text-rose-300 border-rose-500/30'
                        : 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
                    }`}
                  >
                    {isTriggered ? `+${rule.score_awarded} pts` : '0 pts (Passed)'}
                  </span>
                  <span className="text-[10px] text-slate-500 mt-0.5">
                    Weight: {rule.weight}
                  </span>
                </div>
              </div>

              {/* Description */}
              <p className="text-xs text-slate-300 leading-relaxed mb-3">
                {rule.description}
              </p>

              {/* Matched Tokens Pill or Safe Status */}
              <div className="border-t border-slate-800/80 pt-2.5 space-y-1.5 text-xs">
                {isTriggered ? (
                  <div>
                    <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block mb-1">
                      Matched Triggers:
                    </span>
                    <div className="flex flex-wrap gap-1.5">
                      {rule.matches && rule.matches.length > 0 ? (
                        rule.matches.map((item, i) => (
                          <span
                            key={i}
                            className="inline-flex items-center px-2 py-0.5 rounded bg-slate-800 text-slate-200 border border-slate-700 font-mono text-[11px]"
                          >
                            "{item}"
                          </span>
                        ))
                      ) : (
                        <span className="text-slate-400 italic text-[11px]">Pattern matched</span>
                      )}
                    </div>
                  </div>
                ) : (
                  <div className="flex items-center space-x-1.5 text-emerald-400 text-xs">
                    <CheckCircle className="w-3.5 h-3.5" />
                    <span>No offending keywords detected for this vector.</span>
                  </div>
                )}

                {/* Educational recommendation */}
                {isTriggered && (
                  <p className="text-[11px] text-slate-400 bg-slate-900/80 rounded-lg p-2 border border-slate-800/80 mt-2">
                    💡 <span className="font-semibold text-slate-300">Why it matters:</span> {rule.recommendation}
                  </p>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
