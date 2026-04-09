import { useState } from 'react';
import { formatMoney, formatCPS } from '../utils/calculations';

export function ClickArea({ onClickFunds, currentCPS, activityFeed }) {
  const [feedbacks, setFeedbacks] = useState([]);

  const handleClick = () => {
    const gained = onClickFunds();

    const id = Math.random();
    const x = Math.random() * 80 - 40;
    setFeedbacks(prev => [...prev, { id, x, amount: gained }]);
    setTimeout(() => setFeedbacks(prev => prev.filter(f => f.id !== id)), 600);
  };

  return (
    <div className="flex flex-col h-full bg-slate-800/50">
      {/* Click zone */}
      <div className="flex-1 flex flex-col items-center justify-center relative overflow-hidden">
        {/* Placeholder frame for future pixel art */}
        <div className="w-56 h-56 border border-slate-700 rounded-lg bg-slate-900/60 flex items-center justify-center mb-6 relative">
          <div className="text-slate-700 text-xs text-center px-4 select-none">
            [ pixel art goes here ]
          </div>

          {feedbacks.map(f => (
            <div
              key={f.id}
              className="feedback-pop text-sm font-bold text-green-400 pointer-events-none"
              style={{ left: `calc(50% + ${f.x}px)`, top: '40%' }}
            >
              +{formatMoney(f.amount)}
            </div>
          ))}
        </div>

        <button
          onClick={handleClick}
          className="w-40 py-3 bg-slate-700 hover:bg-slate-600 active:scale-95 border border-slate-600 hover:border-slate-500 rounded font-semibold text-white transition-all text-sm tracking-wide"
        >
          Allocate Funds
        </button>

        <p className="text-slate-600 text-xs mt-3">{formatCPS(currentCPS)}</p>
      </div>

      {/* Activity feed */}
      {activityFeed && activityFeed.length > 0 && (
        <div className="border-t border-slate-700 px-3 py-3 space-y-1.5">
          <div className="text-xs text-slate-600 uppercase tracking-wider">Recent</div>
          {activityFeed.map(entry => (
            <div key={entry.id} className="text-xs text-slate-500 leading-tight">
              <span className="text-slate-400">{entry.name}</span>
              {entry.funnyName && (
                <span className="text-slate-600 italic"> &ldquo;{entry.funnyName}&rdquo;</span>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
