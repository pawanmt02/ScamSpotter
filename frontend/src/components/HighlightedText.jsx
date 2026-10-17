import React, { useState } from 'react';
import { Tag, Eye, Info } from 'lucide-react';

export default function HighlightedText({ text, highlightTokens }) {
  const [activeCategory, setActiveCategory] = useState(null);

  if (!text) return null;

  // Render tokens safely by slicing text according to start and end offsets
  const renderHighlightedContent = () => {
    if (!highlightTokens || highlightTokens.length === 0) {
      return (
        <p className="text-slate-200 text-sm sm:text-base leading-relaxed whitespace-pre-wrap font-sans">
          {text}
        </p>
      );
    }

    const elements = [];
    let lastIndex = 0;

    // Ensure tokens are sorted by start index
    const sortedTokens = [...highlightTokens].sort((a, b) => a.start - b.start);

    sortedTokens.forEach((item, idx) => {
      // Add safe text before this token
      if (item.start > lastIndex) {
        elements.push(
          <span key={`text-${lastIndex}-${item.start}`}>
            {text.slice(lastIndex, item.start)}
          </span>
        );
      }

      // Determine style based on category
      let badgeStyle = 'bg-amber-500/25 text-amber-200 border-b-2 border-amber-400';
      let categoryLabel = 'Urgency (+20)';

      if (item.category === 'threat') {
        badgeStyle = 'bg-rose-500/25 text-rose-200 border-b-2 border-rose-500';
        categoryLabel = 'Threat (+15)';
      } else if (item.category === 'link') {
        badgeStyle = 'bg-sky-500/25 text-sky-200 border-b-2 border-sky-400';
        categoryLabel = 'Suspicious Link (+25)';
      } else if (item.category === 'credential') {
        badgeStyle = 'bg-red-600/35 text-red-100 border-b-2 border-red-500 font-bold';
        categoryLabel = 'Credential Grab (+40)';
      }

      const isFiltered = activeCategory && activeCategory !== item.category;

      elements.push(
        <mark
          key={`mark-${idx}-${item.start}`}
          className={`inline-block px-1.5 py-0.5 rounded font-semibold text-sm transition-all cursor-pointer relative group ${
            isFiltered ? 'opacity-30' : 'opacity-100'
          } ${badgeStyle}`}
          title={`${categoryLabel}: "${item.token}"`}
        >
          {text.slice(item.start, item.end)}
          <span className="sr-only">({categoryLabel})</span>
          {/* Micro tooltip badge */}
          <span className="hidden group-hover:block absolute -top-7 left-1/2 -translate-x-1/2 bg-slate-900 text-slate-100 text-[10px] font-bold px-2 py-0.5 rounded shadow-lg border border-slate-700 whitespace-nowrap z-30 pointer-events-none">
            {categoryLabel}
          </span>
        </mark>
      );

      lastIndex = item.end;
    });

    // Add trailing text after the last highlighted token
    if (lastIndex < text.length) {
      elements.push(
        <span key={`text-end-${lastIndex}`}>
          {text.slice(lastIndex)}
        </span>
      );
    }

    return (
      <div className="text-slate-200 text-sm sm:text-base leading-relaxed whitespace-pre-wrap font-sans">
        {elements}
      </div>
    );
  };

  return (
    <div className="bg-slate-900/90 rounded-2xl border border-slate-800 p-5 sm:p-6 shadow-xl space-y-4">
      {/* Header and Filter Legend */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800/80 pb-3">
        <div className="flex items-center space-x-2">
          <Eye className="w-4 h-4 text-blue-400" />
          <h4 className="text-sm font-bold text-white tracking-tight">
            Offending Trigger Inspection
          </h4>
          <span className="text-xs text-slate-400">
            ({highlightTokens?.length || 0} trigger{highlightTokens?.length === 1 ? '' : 's'} identified)
          </span>
        </div>

        {/* Category color legend tags */}
        <div className="flex items-center flex-wrap gap-1.5 text-xs">
          <button
            type="button"
            onClick={() => setActiveCategory(activeCategory === 'urgency' ? null : 'urgency')}
            className={`px-2 py-0.5 rounded-full border text-[11px] font-medium transition ${
              activeCategory === 'urgency'
                ? 'bg-amber-500 text-slate-950 border-amber-400'
                : 'bg-amber-500/10 text-amber-300 border-amber-500/30 hover:bg-amber-500/20'
            }`}
          >
            ● Urgency (+20)
          </button>
          <button
            type="button"
            onClick={() => setActiveCategory(activeCategory === 'threat' ? null : 'threat')}
            className={`px-2 py-0.5 rounded-full border text-[11px] font-medium transition ${
              activeCategory === 'threat'
                ? 'bg-rose-500 text-slate-950 border-rose-400'
                : 'bg-rose-500/10 text-rose-300 border-rose-500/30 hover:bg-rose-500/20'
            }`}
          >
            ● Threat (+15)
          </button>
          <button
            type="button"
            onClick={() => setActiveCategory(activeCategory === 'link' ? null : 'link')}
            className={`px-2 py-0.5 rounded-full border text-[11px] font-medium transition ${
              activeCategory === 'link'
                ? 'bg-sky-500 text-slate-950 border-sky-400'
                : 'bg-sky-500/10 text-sky-300 border-sky-500/30 hover:bg-sky-500/20'
            }`}
          >
            ● Suspicious Link (+25)
          </button>
          <button
            type="button"
            onClick={() => setActiveCategory(activeCategory === 'credential' ? null : 'credential')}
            className={`px-2 py-0.5 rounded-full border text-[11px] font-medium transition ${
              activeCategory === 'credential'
                ? 'bg-red-600 text-white border-red-500'
                : 'bg-red-500/10 text-red-300 border-red-500/30 hover:bg-red-500/20'
            }`}
          >
            ● Credential Grab (+40)
          </button>
        </div>
      </div>

      {/* Rendered Text Box with Highlights */}
      <div className="bg-slate-950/80 rounded-xl p-4 sm:p-5 border border-slate-800/80 max-h-72 overflow-y-auto">
        {renderHighlightedContent()}
      </div>

      <div className="text-xs text-slate-400 flex items-center space-x-1.5">
        <Info className="w-3.5 h-3.5 text-blue-400 flex-shrink-0" />
        <span>
          Hover or tap on highlighted words to view the specific threat category and points awarded.
        </span>
      </div>
    </div>
  );
}
