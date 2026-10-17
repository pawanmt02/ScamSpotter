import React from 'react';
import { Sparkles, ShieldAlert, CheckCircle2, Zap, Gift, PackageCheck } from 'lucide-react';

export const SAMPLE_DATA = {
  sbi_kyc: {
    title: 'Official SBI KYC Scam (100/100)',
    category: 'Banking / Phishing',
    expectedScore: 100,
    expectedTier: 'High',
    text: 'Dear Customer, your SBI Bank account has been blocked today due to incomplete KYC. Update immediately to avoid suspension: http://sbi-kyc-verification.xyz or your account will face legal action. Enter your OTP and PIN.',
    description: 'Triggers all 4 threat vectors: Urgency (+20) + Threats (+15) + Suspicious Link (+25) + Credential Grab (+40) = 100/100.',
    icon: ShieldAlert,
    tagClass: 'bg-red-500/15 text-red-300 border-red-500/30'
  },
  safe_friend: {
    title: 'Safe Message from Friend (0/100)',
    category: 'Legitimate / Casual',
    expectedScore: 0,
    expectedTier: 'Low',
    text: 'Hey are we still meeting for lunch tomorrow at 1pm? Let me know!',
    description: 'Clean personal message. Zero coercive words, no credential requests, no links. Expected score: 0.',
    icon: CheckCircle2,
    tagClass: 'bg-emerald-500/15 text-emerald-300 border-emerald-500/30'
  },
  electricity: {
    title: 'Electricity Power Disconnection (75/100)',
    category: 'Utility Scam',
    expectedScore: 60,
    expectedTier: 'High',
    text: 'Dear Consumer, your electricity power will be disconnected today at 9:30 PM because your previous bill was incomplete. Call immediately: 9876543210 or update bill at http://bill-payment-update.live to avoid penalty.',
    description: 'Common utility scam exploiting panic of impending power cutoff and demanding immediate phone call or malicious site visit.',
    icon: Zap,
    tagClass: 'bg-amber-500/15 text-amber-300 border-amber-500/30'
  },
  lottery: {
    title: 'Lottery Prize / Lucky Draw (65/100)',
    category: 'Advance Fee Scam',
    expectedScore: 65,
    expectedTier: 'High',
    text: 'Congratulations! You have won 25,00,000 cash in KBC Lucky Draw! Claim immediately within 24 hours. Click http://kbc-winner-claim.top and submit your bank account details and password to transfer funds.',
    description: 'Classic prize bait coercing urgent credential disclosure on an untrusted .top domain.',
    icon: Gift,
    tagClass: 'bg-purple-500/15 text-purple-300 border-purple-500/30'
  }
};

export default function SampleMessages({ onSelect }) {
  return (
    <div className="bg-slate-900/60 rounded-2xl border border-slate-800/80 p-5 shadow-lg">
      <div className="flex items-center space-x-2 mb-3.5">
        <Sparkles className="w-4 h-4 text-blue-400" />
        <h4 className="text-sm font-bold text-white tracking-tight">
          Preset Benchmark Test Cases
        </h4>
        <span className="text-xs text-slate-400 hidden sm:inline">
          (Click any case to test against the rule engine)
        </span>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
        {Object.entries(SAMPLE_DATA).map(([key, item]) => {
          const Icon = item.icon;
          return (
            <button
              key={key}
              type="button"
              onClick={() => onSelect(key)}
              className="text-left bg-slate-950/70 hover:bg-slate-950 border border-slate-800 hover:border-blue-500/50 rounded-xl p-3.5 transition-all group flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between gap-1 mb-2">
                  <div className="flex items-center space-x-1.5 text-xs font-semibold text-white group-hover:text-blue-400 transition">
                    <Icon className="w-3.5 h-3.5 flex-shrink-0" />
                    <span className="truncate">{item.title.split('(')[0]}</span>
                  </div>
                  <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded border ${item.tagClass}`}>
                    {item.expectedScore}/100
                  </span>
                </div>

                <p className="text-[11px] text-slate-400 line-clamp-2 leading-relaxed">
                  "{item.text}"
                </p>
              </div>

              <div className="mt-2.5 pt-2 border-t border-slate-800/60 flex items-center justify-between text-[10px] text-slate-500">
                <span>{item.category}</span>
                <span className="text-blue-400 group-hover:underline font-medium">Load & Scan →</span>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}
