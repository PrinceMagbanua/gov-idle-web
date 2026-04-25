import { useState } from 'react';
import { formatMoney, formatCPS, getTitle, getPastTitles } from '../utils/calculations';

export function TopBar({ money, currentCPS, lifetimeEarned, lagayMultiplier, prestigeCount, achievements, onOpenAchievements }) {
  const [showTitleHistory, setShowTitleHistory] = useState(false);

  const title = getTitle(lifetimeEarned);
  const pastTitles = getPastTitles(lifetimeEarned);
  const unlockedCount = achievements ? Object.values(achievements).filter(Boolean).length : 0;

  return (
    <div className="border-b border-white/[0.05] flex-shrink-0" style={{ background: 'var(--nb)' }}>

      {/* ── Mobile layout ── */}
      <div className="flex md:hidden items-center justify-between px-4 py-2.5 gap-3">
        {/* Left: balance + CPS stacked */}
        <div className="flex flex-col">
          <div
            className="font-black text-teal-400 tabular-nums leading-tight"
            style={{ fontSize: 'clamp(1.4rem, 6vw, 2rem)', textShadow: '0 0 18px rgba(45,212,191,0.45)' }}
          >
            {formatMoney(money)}
          </div>
          <div className="text-xs font-semibold text-amber-400 tabular-nums">{formatCPS(currentCPS)}</div>
        </div>

        {/* Center: title */}
        <div className="flex-1 text-center relative overflow-hidden">
          <button
            onClick={() => setShowTitleHistory(v => !v)}
            className="text-xs font-semibold text-purple-400 italic hover:text-purple-300 transition-colors truncate max-w-full"
          >
            {title}
          </button>
          {showTitleHistory && pastTitles.length > 0 && (
            <>
              <div className="fixed inset-0 z-10" onClick={() => setShowTitleHistory(false)} />
              <div className="absolute top-full left-1/2 -translate-x-1/2 mt-1 bg-slate-800 border border-slate-600 rounded shadow-xl z-20 min-w-max py-1">
                {[...pastTitles].reverse().map((t, i) => (
                  <div key={i} className="px-3 py-1 text-sm text-slate-400 italic">{t}</div>
                ))}
              </div>
            </>
          )}
        </div>

        {/* Right: impeachments badge + achievements */}
        <div className="flex items-center gap-2 flex-shrink-0">
          {prestigeCount > 0 && (
            <div className="flex flex-col items-center leading-none">
              <span className="text-base">👑</span>
              <span className="text-xs font-bold text-rose-400">{lagayMultiplier.toFixed(1)}×</span>
            </div>
          )}
          <button onClick={onOpenAchievements} className="flex flex-col items-center leading-none">
            <span className="text-base">🏆</span>
            <span className="text-xs text-slate-500">{unlockedCount}</span>
          </button>
        </div>
      </div>

      {/* ── Desktop layout ── */}
      <div className="hidden md:flex items-center justify-between px-6 py-3 gap-6">
        {/* Left: money + CPS */}
        <div className="flex items-end gap-8">
          <div>
            <div className="text-xs text-slate-500 uppercase tracking-wider mb-0.5">Balance</div>
            <div
              className="font-black text-teal-400 tabular-nums"
              style={{ fontSize: '2.4rem', lineHeight: 1, textShadow: '0 0 24px rgba(45,212,191,0.5)' }}
            >
              {formatMoney(money)}
            </div>
          </div>
          <div className="pb-1">
            <div className="text-xs text-slate-500 uppercase tracking-wider mb-0.5">Per second</div>
            <div
              className="text-xl font-bold text-amber-400 tabular-nums"
              style={{ textShadow: '0 0 14px rgba(251,191,36,0.4)' }}
            >
              {formatCPS(currentCPS)}
            </div>
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
    </div>
  );
}
