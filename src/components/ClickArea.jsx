import { useState } from 'react';
import { formatNumber } from '../utils/calculations';

export function ClickArea({ money, onClickFunds }) {
  const [feedbacks, setFeedbacks] = useState([]);

  const handleClick = () => {
    onClickFunds();
    
    // Add feedback
    const id = Math.random();
    const feedback = { id, x: Math.random() * 100 - 50 };
    setFeedbacks(prev => [...prev, feedback]);

    // Remove feedback after animation
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

        {/* Floating feedback popups */}
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
    </div>
  );
}
