import React, { useRef } from 'react';
import { Search, Clipboard, Trash2, ShieldCheck, AlertCircle, RefreshCw } from 'lucide-react';

const MAX_CHARS = 2000;

export default function TextInput({
  text,
  setText,
  onScan,
  isScanning,
  onSelectSample,
  hasScanned,
  isStale
}) {
  const textareaRef = useRef(null);
  const charCount = text.length;
  const isOverLimit = charCount > MAX_CHARS;
  const canScan = charCount > 0 && !isOverLimit && !isScanning;

  const handlePaste = async () => {
    try {
      const clipboardText = await navigator.clipboard.readText();
      if (clipboardText) {
        setText(clipboardText.slice(0, MAX_CHARS));
        if (textareaRef.current) {
          textareaRef.current.focus();
        }
      }
    } catch (err) {
      if (textareaRef.current) {
        textareaRef.current.focus();
      }
    }
  };

  const handleClear = () => {
    setText('');
    if (textareaRef.current) {
      textareaRef.current.focus();
    }
  };

  const handleKeyDown = (e) => {
    if ((e.ctrlKey || e.metaKey) && e.key === 'Enter' && canScan) {
      e.preventDefault();
      onScan();
    }
  };

  return (
    <section className="bg-slate-900/90 rounded-2xl border border-slate-800 shadow-xl p-5 sm:p-6 transition-all">
      <div className="flex flex-wrap items-center justify-between gap-2 mb-3">
        <label htmlFor="message-input" className="text-sm font-semibold text-slate-200 flex items-center space-x-2">
          <span>Paste Suspicious Message</span>
          <span className="text-xs font-normal text-slate-400">(SMS, WhatsApp, Email, or Social DM)</span>
        </label>

        {/* Quick action controls */}
        <div className="flex items-center space-x-2">
          <button
            type="button"
            onClick={handlePaste}
            className="inline-flex items-center space-x-1 px-2.5 py-1 text-xs font-medium text-slate-300 hover:text-white bg-slate-800 hover:bg-slate-700/80 rounded-lg border border-slate-700 transition"
            title="Paste text from clipboard"
          >
            <Clipboard className="w-3.5 h-3.5 text-blue-400" />
            <span>Paste</span>
          </button>

          {charCount > 0 && (
            <button
              type="button"
              onClick={handleClear}
              className="inline-flex items-center space-x-1 px-2.5 py-1 text-xs font-medium text-slate-400 hover:text-rose-400 bg-slate-800/80 hover:bg-rose-950/40 rounded-lg border border-slate-700 transition"
              title="Clear input"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>Clear</span>
            </button>
          )}
        </div>
      </div>

      {/* Main Textarea */}
      <div className="relative">
        <textarea
          ref={textareaRef}
          id="message-input"
          value={text}
          onChange={(e) => setText(e.target.value)}
          onKeyDown={handleKeyDown}
          rows={5}
          placeholder="Paste an SMS or WhatsApp message here... (e.g. 'Dear Customer, your SBI Bank account has been blocked today due to incomplete KYC...')"
          className={`w-full rounded-xl bg-slate-950/70 text-slate-100 placeholder-slate-500 border p-4 text-sm sm:text-base leading-relaxed resize-y focus:ring-2 focus:ring-blue-500 transition-colors ${
            isOverLimit ? 'border-rose-500/80 focus:border-rose-500' : 'border-slate-800 focus:border-blue-500'
          }`}
          maxLength={MAX_CHARS + 100}
        />

        {/* Floating status & character counter */}
        <div className="flex items-center justify-between mt-2 px-1 text-xs">
          <div className="flex items-center space-x-2">
            {isStale && hasScanned ? (
              <span className="text-amber-400 font-medium flex items-center space-x-1">
                <RefreshCw className="w-3 h-3 animate-spin" style={{ animationDuration: '4s' }} />
                <span>Text modified — Click "Scan for Risk" to analyze</span>
              </span>
            ) : (
              <span className="text-slate-500 hidden sm:inline">
                Press <kbd className="px-1.5 py-0.5 rounded bg-slate-800 border border-slate-700 text-[10px] text-slate-300">Ctrl</kbd> + <kbd className="px-1.5 py-0.5 rounded bg-slate-800 border border-slate-700 text-[10px] text-slate-300">Enter</kbd> to run scan
              </span>
            )}
          </div>

          <div className="ml-auto flex items-center space-x-2">
            {isOverLimit && (
              <span className="text-rose-400 font-medium flex items-center space-x-1">
                <AlertCircle className="w-3.5 h-3.5" />
                <span>Exceeds limit</span>
              </span>
            )}
            <span
              className={`font-mono text-xs ${
                isOverLimit
                  ? 'text-rose-400 font-bold'
                  : charCount > 1800
                  ? 'text-amber-400'
                  : 'text-slate-400'
              }`}
            >
              {charCount.toLocaleString()} / {MAX_CHARS.toLocaleString()}
            </span>
          </div>
        </div>
      </div>

      {/* Action Button & Preset samples trigger */}
      <div className="mt-4 pt-3 border-t border-slate-800/80 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        {/* Quick sample chips */}
        <div className="flex items-center flex-wrap gap-1.5">
          <span className="text-xs text-slate-400 font-medium mr-1">Try Samples:</span>
          <button
            type="button"
            onClick={() => onSelectSample('sbi_kyc')}
            className="px-2.5 py-1 text-xs rounded-lg bg-rose-500/10 hover:bg-rose-500/20 text-rose-300 border border-rose-500/30 transition font-medium"
          >
            🚨 SBI KYC (100/100)
          </button>
          <button
            type="button"
            onClick={() => onSelectSample('safe_friend')}
            className="px-2.5 py-1 text-xs rounded-lg bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 transition font-medium"
          >
            ✅ Safe Friend (0/100)
          </button>
          <button
            type="button"
            onClick={() => onSelectSample('electricity')}
            className="px-2.5 py-1 text-xs rounded-lg bg-amber-500/10 hover:bg-amber-500/20 text-amber-300 border border-amber-500/30 transition font-medium hidden md:inline-block"
          >
            ⚡ Electricity Disconnection
          </button>
        </div>

        {/* Scan Trigger Button - Executes scan once on click */}
        <button
          type="button"
          onClick={onScan}
          disabled={!canScan}
          className={`inline-flex items-center justify-center space-x-2 px-6 py-3 rounded-xl font-semibold text-sm shadow-lg transition-all ${
            canScan
              ? 'bg-gradient-to-r from-blue-600 via-indigo-600 to-blue-500 hover:from-blue-500 hover:to-indigo-500 text-white shadow-blue-500/25 cursor-pointer active:scale-[0.98]'
              : 'bg-slate-800 text-slate-500 border border-slate-700/60 cursor-not-allowed shadow-none'
          }`}
        >
          {isScanning ? (
            <>
              <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              <span>Scanning Threat Vectors...</span>
            </>
          ) : (
            <>
              <Search className="w-4 h-4" />
              <span>{hasScanned && isStale ? 'Re-Scan for Risk' : 'Scan for Risk'}</span>
            </>
          )}
        </button>
      </div>
    </section>
  );
}
