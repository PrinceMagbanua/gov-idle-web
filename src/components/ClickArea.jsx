import { useState } from 'react';
import { formatMoney, formatCPS } from '../utils/calculations';

export function ClickArea({ onClickFunds, currentCPS, activityFeed }) {
  const [feedbacks, setFeedbacks] = useState([]);

  const handleClick = () => {
    const gained = onClickFunds();

    const id = Math.random();
    const x = (Math.random() - 0.5) * 80;
    const y = (Math.random() - 0.5) * 40;
    setFeedbacks(prev => [...prev, { id, x, y, amount: gained }]);
    setTimeout(() => setFeedbacks(prev => prev.filter(f => f.id !== id)), 700);
  };

  return (
    <div className="flex flex-col h-full bg-slate-800/50">
      {/* Click zone */}
      <div className="flex-1 flex flex-col items-center justify-center relative overflow-hidden select-none">
        {/* Feedback pops */}
        {feedbacks.map(f => (
          <div
            key={f.id}
            className="feedback-pop absolute text-sm font-bold text-green-400 pointer-events-none"
            style={{
              left: `calc(50% + ${f.x}px)`,
              top: `calc(50% + ${f.y}px)`,
            }}
          >
            +{formatMoney(f.amount)}
          </div>
        ))}

        <button
          onClick={handleClick}
          className="w-44 h-44 rounded-full bg-slate-700 hover:bg-slate-600 active:scale-95 border-2 border-slate-600 hover:border-slate-500 font-semibold text-white transition-all text-sm tracking-wide shadow-lg flex flex-col items-center justify-center gap-1"
        >
          <span className="text-lg">₱</span>
          <span>Allocate Funds</span>
        </button>

        <p className="text-slate-500 text-xs mt-4">{formatCPS(currentCPS)}</p>
      </div>

      {/* Activity feed */}
      {activityFeed && activityFeed.length > 0 && (
        <div className="border-t border-slate-700 px-3 py-3 space-y-1.5">
          <div className="text-xs text-slate-600 uppercase tracking-wider">Recent</div>
          {activityFeed.map(entry => (
            <div key={entry.id} className="text-xs text-slate-500 leading-tight">
              <span className="text-slate-400">{entry.name}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
