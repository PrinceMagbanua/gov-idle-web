import { useState, useRef, useEffect } from 'react';
import { formatMoney, formatCPS } from '../utils/calculations';

const MAX_HOLD_MS = 90_000;
const PHASE_DURATION = MAX_HOLD_MS / 3; // 30s per phase
const HOLD_THRESHOLD_MS = 400; // below this = single click
const CIRCUMFERENCE = 2 * Math.PI * 82; // SVG circle r=82 inside 176px button

function computeHoldPayout(cps, holdMs) {
  const s = holdMs / 1000;
  return cps * s * (1 + 4 * Math.pow(s / 90, 2));
}

const PHASES = [
  { bg: 'bg-slate-600',  border: 'border-slate-500',  ring: '#94a3b8', label: 'Allocating'   },
  { bg: 'bg-amber-800',  border: 'border-amber-600',  ring: '#f59e0b', label: 'Negotiating'  },
  { bg: 'bg-green-800',  border: 'border-green-600',  ring: '#22c55e', label: 'Closing Deal' },
];

export function ClickArea({ onClickFunds, addBonusMoney, currentCPS, activityFeed, compact = false }) {
  const [feedbacks, setFeedbacks]   = useState([]);
  const [holdMs, setHoldMs]         = useState(0);
  const [isHolding, setIsHolding]   = useState(false);

  const holdStartRef    = useRef(null);
  const rafRef          = useRef(null);
  const onClickRef      = useRef(onClickFunds);
  const addBonusRef     = useRef(addBonusMoney);
  const currentCPSRef   = useRef(currentCPS);

  useEffect(() => { onClickRef.current    = onClickFunds;  }, [onClickFunds]);
  useEffect(() => { addBonusRef.current   = addBonusMoney; }, [addBonusMoney]);
  useEffect(() => { currentCPSRef.current = currentCPS;    }, [currentCPS]);

  useEffect(() => () => { if (rafRef.current) cancelAnimationFrame(rafRef.current); }, []);

  const spawnFeedback = (gained, big = false) => {
    const id = Math.random();
    setFeedbacks(prev => [...prev, {
      id,
      x: big ? 0 : (Math.random() - 0.5) * 80,
      y: big ? 0 : (Math.random() - 0.5) * 40,
      amount: gained,
      big,
    }]);
    setTimeout(() => setFeedbacks(prev => prev.filter(f => f.id !== id)), big ? 1400 : 700);
  };

  const startHold = () => {
    if (holdStartRef.current !== null) return;
    holdStartRef.current = performance.now();
    setIsHolding(true);

    const tick = () => {
      if (holdStartRef.current === null) return;
      const elapsed = Math.min(performance.now() - holdStartRef.current, MAX_HOLD_MS);
      setHoldMs(elapsed);
      if (elapsed < MAX_HOLD_MS) rafRef.current = requestAnimationFrame(tick);
    };
    rafRef.current = requestAnimationFrame(tick);
  };

  const stopHold = () => {
    if (holdStartRef.current === null) return;
    if (rafRef.current) { cancelAnimationFrame(rafRef.current); rafRef.current = null; }

    const elapsed = Math.min(performance.now() - holdStartRef.current, MAX_HOLD_MS);
    holdStartRef.current = null;
    setIsHolding(false);
    setHoldMs(0);

    if (elapsed < HOLD_THRESHOLD_MS) {
      const gained = onClickRef.current();
      spawnFeedback(gained);
    } else {
      const payout = computeHoldPayout(currentCPSRef.current, elapsed);
      if (payout > 0) {
        addBonusRef.current(payout);
        spawnFeedback(payout, true);
      }
    }
  };

  // Derived display values
  const showHoldUI    = isHolding && holdMs >= HOLD_THRESHOLD_MS;
  const progress      = Math.min(holdMs / MAX_HOLD_MS, 1);
  const phase         = Math.min(Math.floor(holdMs / PHASE_DURATION), 2);
  const phaseProgress = (holdMs % PHASE_DURATION) / PHASE_DURATION;
  const shakeDuration = Math.max(60, 300 - phaseProgress * 240);
  const strokeOffset  = CIRCUMFERENCE * (1 - progress);
  const phaseConf     = PHASES[phase];
  const previewAmount = computeHoldPayout(currentCPS, holdMs);

  const previewColor =
    phase === 2 ? 'text-green-400' :
    phase === 1 ? 'text-amber-400' : 'text-slate-300';

  // ── Compact (mobile bottom bar) layout ────────────────────────────────────
  if (compact) {
    return (
      <div className="flex items-center justify-center py-3 px-4 relative overflow-visible select-none bg-slate-800/50">
        {/* Feedback pops */}
        {feedbacks.map(f => (
          <div
            key={f.id}
            className={f.big ? 'feedback-pop-big' : 'feedback-pop'}
            style={{
              zIndex: 40,
              left: f.big ? '50%' : `calc(50% + ${f.x}px)`,
              top:  f.big ? '-48px' : `calc(50% + ${f.y * 0.4}px)`,
            }}
          >
            +{formatMoney(f.amount)}
          </div>
        ))}

        {/* Payout preview */}
        {showHoldUI && (
          <div
            className="absolute left-1/2 -translate-x-1/2 text-center pointer-events-none"
            style={{ top: -56, zIndex: 40 }}
          >
            <div className="bg-slate-900/90 border border-slate-700 rounded px-3 py-1.5">
              <div className={`font-bold text-sm ${previewColor}`}>+{formatMoney(previewAmount)}</div>
              <div className="text-slate-500 text-xs mt-0.5">{phaseConf.label}&hellip;</div>
            </div>
          </div>
        )}

        {/* CPS — left side */}
        <p className="text-slate-500 text-xs mr-4 flex-shrink-0">{formatCPS(currentCPS)}</p>

        {/* Button + ring */}
        <div className="relative w-44 h-44 flex-shrink-0">
          {showHoldUI && (
            <svg
              className="absolute inset-0 pointer-events-none"
              viewBox="0 0 176 176"
              style={{ width: 176, height: 176, transform: 'rotate(-90deg)' }}
            >
              <circle cx="88" cy="88" r="82" fill="none" stroke="#1e293b" strokeWidth="5" />
              <circle
                cx="88" cy="88" r="82"
                fill="none"
                stroke={phaseConf.ring}
                strokeWidth="5"
                strokeLinecap="round"
                strokeDasharray={CIRCUMFERENCE}
                strokeDashoffset={strokeOffset}
                style={{ transition: 'stroke 0.4s ease, stroke-dashoffset 0.05s linear' }}
              />
            </svg>
          )}
          <button
            onMouseDown={startHold}
            onMouseUp={stopHold}
            onMouseLeave={() => { if (isHolding) stopHold(); }}
            onTouchStart={e => { e.preventDefault(); startHold(); }}
            onTouchEnd={stopHold}
            className={`w-44 h-44 rounded-full border-2 font-semibold text-white text-sm tracking-wide shadow-lg flex flex-col items-center justify-center gap-1 transition-colors duration-300 ${
              showHoldUI
                ? `${phaseConf.bg} ${phaseConf.border}`
                : 'bg-slate-700 hover:bg-slate-600 active:scale-95 border-slate-600 hover:border-slate-500'
            }`}
            style={showHoldUI ? { animation: `shake ${shakeDuration}ms linear infinite` } : {}}
          >
            <span className="text-lg">₱</span>
            <span>{showHoldUI ? phaseConf.label : 'Allocate Funds'}</span>
            {showHoldUI && (
              <span className="text-xs text-white/50 mt-0.5">
                {Math.floor((1 - progress) * MAX_HOLD_MS / 1000)}s max
              </span>
            )}
          </button>
        </div>
      </div>
    );
  }

  // ── Full (desktop sidebar) layout ─────────────────────────────────────────
  return (
    <div className="flex flex-col h-full bg-slate-800/50">
      {/* Click zone */}
      <div className="flex-1 flex flex-col items-center justify-center relative overflow-hidden select-none">

        {/* Feedback pops */}
        {feedbacks.map(f => (
          <div
            key={f.id}
            className={f.big ? 'feedback-pop-big' : 'feedback-pop'}
            style={{
              zIndex: 20,
              left: f.big ? '50%' : `calc(50% + ${f.x}px)`,
              top:  f.big ? 'calc(50% - 110px)' : `calc(50% + ${f.y}px)`,
            }}
          >
            +{formatMoney(f.amount)}
          </div>
        ))}

        {/* Payout preview — only while holding */}
        {showHoldUI && (
          <div
            className="absolute text-center pointer-events-none"
            style={{ top: 'calc(50% - 118px)', zIndex: 30 }}
          >
            <div className="bg-slate-900/90 border border-slate-700 rounded px-3 py-1.5">
              <div className={`font-bold text-sm ${previewColor}`}>
                +{formatMoney(previewAmount)}
              </div>
              <div className="text-slate-500 text-xs mt-0.5">
                {phaseConf.label}&hellip;
              </div>
            </div>
          </div>
        )}

        {/* Button + progress ring */}
        <div className="relative w-44 h-44">
          {showHoldUI && (
            <svg
              className="absolute inset-0 pointer-events-none"
              viewBox="0 0 176 176"
              style={{ width: 176, height: 176, transform: 'rotate(-90deg)' }}
            >
              <circle cx="88" cy="88" r="82" fill="none" stroke="#1e293b" strokeWidth="5" />
              <circle
                cx="88" cy="88" r="82"
                fill="none"
                stroke={phaseConf.ring}
                strokeWidth="5"
                strokeLinecap="round"
                strokeDasharray={CIRCUMFERENCE}
                strokeDashoffset={strokeOffset}
                style={{ transition: 'stroke 0.4s ease, stroke-dashoffset 0.05s linear' }}
              />
            </svg>
          )}

          <button
            onMouseDown={startHold}
            onMouseUp={stopHold}
            onMouseLeave={() => { if (isHolding) stopHold(); }}
            onTouchStart={e => { e.preventDefault(); startHold(); }}
            onTouchEnd={stopHold}
            className={`w-44 h-44 rounded-full border-2 font-semibold text-white text-sm tracking-wide shadow-lg flex flex-col items-center justify-center gap-1 transition-colors duration-300 ${
              showHoldUI
                ? `${phaseConf.bg} ${phaseConf.border}`
                : 'bg-slate-700 hover:bg-slate-600 active:scale-95 border-slate-600 hover:border-slate-500'
            }`}
            style={showHoldUI ? { animation: `shake ${shakeDuration}ms linear infinite` } : {}}
          >
            <span className="text-lg">₱</span>
            <span>{showHoldUI ? phaseConf.label : 'Allocate Funds'}</span>
            {showHoldUI && (
              <span className="text-xs text-white/50 mt-0.5">
                {Math.floor((1 - progress) * MAX_HOLD_MS / 1000)}s max
              </span>
            )}
          </button>
        </div>

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
