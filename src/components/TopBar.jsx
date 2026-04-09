import { useState } from 'react';
import { formatMoney, formatCPS, getTitle, getPastTitles } from '../utils/calculations';

export function TopBar({ money, currentCPS, lifetimeEarned, lagayMultiplier, prestigeCount, achievements, onOpenAchievements }) {
  const [showTitleHistory, setShowTitleHistory] = useState(false);

  const title = getTitle(lifetimeEarned);
  const pastTitles = getPastTitles(lifetimeEarned);
  const unlockedCount = achievements ? Object.values(achievements).filter(Boolean).length : 0;

  return (
    <div className="bg-slate-900 border-b border-slate-700 px-6 py-3 flex items-center justify-between gap-6 flex-shrink-0">

      {/* Left: money + CPS */}
      <div className="flex items-end gap-6">
        <div>
          <div className="text-xs text-slate-500 uppercase tracking-wider">Balance</div>
          <div className="text-2xl font-bold text-green-400 tabular-nums">{formatMoney(money)}</div>
        </div>
        <div>
          <div className="text-xs text-slate-500 uppercase tracking-wider">Per second</div>
          <div className="text-lg font-semibold text-amber-400 tabular-nums">{formatCPS(currentCPS)}</div>
        </div>
      </div>

      {/* Center: title */}
      <div className="flex-1 text-center relative">
        <div className="text-xs text-slate-500 uppercase tracking-wider mb-0.5">Current Title</div>
        <button
          onClick={() => setShowTitleHistory(v => !v)}
          className="text-sm font-semibold text-purple-400 italic hover:text-purple-300 transition-colors"
        >
          {title}
          {pastTitles.length > 0 && <span className="text-purple-600 not-italic text-xs ml-1">▾</span>}
        </button>

        {showTitleHistory && pastTitles.length > 0 && (
          <>
            <div className="fixed inset-0 z-10" onClick={() => setShowTitleHistory(false)} />
            <div className="absolute top-full left-1/2 -translate-x-1/2 mt-1 bg-slate-800 border border-slate-600 rounded shadow-xl z-20 min-w-max py-1">
              <div className="px-3 py-1 text-xs text-slate-500 uppercase tracking-wider border-b border-slate-700 mb-1">
                Previous Titles
              </div>
              {[...pastTitles].reverse().map((t, i) => (
                <div key={i} className="px-3 py-1 text-sm text-slate-400 italic">{t}</div>
              ))}
            </div>
          </>
        )}
      </div>

      {/* Right: prestige info + achievements */}
      <div className="flex items-center gap-4">
        {prestigeCount > 0 && (
          <div className="text-right">
            <div className="text-xs text-slate-500 uppercase tracking-wider">Impeachments</div>
            <div className="text-sm font-semibold text-rose-400">{prestigeCount}× &mdash; Lagay {lagayMultiplier.toFixed(1)}×</div>
          </div>
        )}
        <button
          onClick={onOpenAchievements}
          className="flex flex-col items-center gap-0.5 hover:scale-110 transition-transform"
          title="Achievements"
        >
          <span className="text-xl">🏆</span>
          <span className="text-xs text-slate-500">{unlockedCount}</span>
        </button>
      </div>
    </div>
  );
}
