import { useState } from 'react';
import { formatNumber, formatIPSWithDecimals, getTitle, getPastTitles } from '../utils/calculations';

export function TopBar({ money, ips, totalEarned, onOpenAchievements }) {
  const [showTitleHistory, setShowTitleHistory] = useState(false);
  const title = getTitle(totalEarned);
  const pastTitles = getPastTitles(totalEarned);

  return (
    <div className="bg-slate-900 border-b border-slate-700 px-6 py-4 flex justify-between items-center">
      <div className="flex items-center gap-8">
        <div>
          <div className="text-sm text-slate-400">Money</div>
          <div className="text-3xl font-bold text-green-400">${formatNumber(money)}</div>
        </div>
        <div className="group relative cursor-help">
          <div className="text-sm text-slate-400">Income/sec</div>
          <div className="text-2xl font-bold text-amber-400">{formatIPSWithDecimals(ips)}/s</div>
          <div className="absolute left-0 bottom-full mb-2 hidden group-hover:block bg-slate-800 text-white text-xs px-2 py-1 rounded whitespace-nowrap border border-slate-600">
            {ips.toFixed(4)}/s
          </div>
        </div>
        <div className="relative">
          <div className="text-sm text-slate-400">Title</div>
          <button
            onClick={() => setShowTitleHistory(v => !v)}
            className="text-sm font-semibold text-purple-400 italic hover:text-purple-300 transition-colors"
            title={pastTitles.length > 0 ? 'Click to see title history' : undefined}
          >
            {title} {pastTitles.length > 0 && <span className="text-purple-600 not-italic text-xs">▾</span>}
          </button>

          {showTitleHistory && pastTitles.length > 0 && (
            <>
              <div className="fixed inset-0 z-10" onClick={() => setShowTitleHistory(false)} />
              <div className="absolute top-full left-0 mt-1 bg-slate-800 border border-slate-600 rounded shadow-lg z-20 min-w-max py-1">
                <div className="px-3 py-1 text-xs text-slate-500 uppercase tracking-wider border-b border-slate-700 mb-1">
                  Previous Titles
                </div>
                {[...pastTitles].reverse().map((t, i) => (
                  <div key={i} className="px-3 py-1 text-sm text-slate-400 italic">
                    {t}
                  </div>
                ))}
              </div>
            </>
          )}
        </div>
      </div>
      <button
        onClick={onOpenAchievements}
        className="text-2xl hover:scale-110 transition-transform"
        title="Achievements"
      >
        🏆
      </button>
    </div>
  );
}
