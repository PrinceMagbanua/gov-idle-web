import { useState } from 'react';

export function ClickArea({ onClickFunds, activityFeed }) {
  const [feedbacks, setFeedbacks] = useState([]);

  const handleClick = () => {
    onClickFunds();

    const id = Math.random();
    const feedback = { id, x: Math.random() * 100 - 50 };
    setFeedbacks(prev => [...prev, feedback]);

    setTimeout(() => {
      setFeedbacks(prev => prev.filter(f => f.id !== id));
    }, 500);
  };

  return (
    <div className="flex-1 flex h-full flex-col items-center justify-center bg-gradient-to-b from-slate-800 to-slate-900 relative overflow-hidden">
      <div className="relative flex flex-col items-center justify-center">
        <button
          onClick={handleClick}
          className="relative w-32 h-32 bg-gradient-to-b from-red-600 to-red-700 hover:from-red-500 hover:to-red-600 rounded-full shadow-lg font-bold text-lg text-white transition-transform hover:scale-110 active:scale-95 flex items-center justify-center text-center leading-tight"
        >
          Allocate
          <br />
          Funds
        </button>

        {feedbacks.map(feedback => (
          <div
            key={feedback.id}
            className="feedback-pop text-lg font-bold"
            style={{
              left: `calc(50% + ${feedback.x}px)`,
              top: '50%',
              transform: 'translateX(-50%)',
            }}
          >
            +1
          </div>
        ))}
      </div>

      <p className="text-slate-400 mt-12 text-center text-sm px-4">Click to allocate government funds</p>

      {activityFeed && activityFeed.length > 0 && (
        <div className="absolute bottom-0 left-0 right-0 px-4 pb-4 space-y-1">
          <div className="text-xs text-slate-500 uppercase tracking-wider mb-2">Recent Activity</div>
          {activityFeed.map(entry => (
            <div key={entry.id} className="text-xs text-slate-400 leading-tight">
              <span className="text-slate-500">{entry.projectName}:</span>{' '}
              <span className="text-slate-300 italic">"{entry.funnyName}"</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
