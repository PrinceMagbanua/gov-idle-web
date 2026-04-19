import { useState, useRef, useEffect } from 'react';
import { formatMoney, formatCPS } from '../utils/calculations';

const MAX_HOLD_MS    = 90_000;
const PHASE_DURATION = MAX_HOLD_MS / 3;
const HOLD_THRESHOLD_MS = 400;

const RAISED  = '-5px -5px 13px rgba(255,255,255,0.06), 7px 7px 18px rgba(0,0,0,0.76)';
const PRESSED = 'inset -3px -3px 7px rgba(255,255,255,0.05), inset 4px 4px 12px rgba(0,0,0,0.76)';

const PHASES = [
  { label: 'Allocating',   border: '#94a3b8', glow: 'rgba(148,163,184,0.55)' },
  { label: 'Negotiating',  border: '#f59e0b', glow: 'rgba(245,158,11,0.65)'  },
  { label: 'Closing Deal', border: '#2dd4bf', glow: 'rgba(45,212,191,0.7)'   },
];

function computeHoldPayout(cps, holdMs) {
  const s = holdMs / 1000;
  return cps * s * (1 + 4 * Math.pow(s / 90, 2));
}

export function ClickArea({ onClickFunds, addBonusMoney, currentCPS, activityFeed, compact = false }) {
  const [feedbacks, setFeedbacks] = useState([]);
  const [holdMs, setHoldMs]       = useState(0);
  const [isHolding, setIsHolding] = useState(false);

  const holdStartRef  = useRef(null);
  const rafRef        = useRef(null);
  const onClickRef    = useRef(onClickFunds);
  const addBonusRef   = useRef(addBonusMoney);
  const currentCPSRef = useRef(currentCPS);

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
      if (payout > 0) { addBonusRef.current(payout); spawnFeedback(payout, true); }
    }
  };

  // Derived values
  const showHoldUI    = isHolding && holdMs >= HOLD_THRESHOLD_MS;
  const progress      = Math.min(holdMs / MAX_HOLD_MS, 1);
  const phase         = Math.min(Math.floor(holdMs / PHASE_DURATION), 2);
  const phaseProgress = (holdMs % PHASE_DURATION) / PHASE_DURATION;
  const shakeDuration = Math.max(60, 300 - phaseProgress * 240);
  const phaseConf     = PHASES[phase];
  const previewAmount = computeHoldPayout(currentCPS, holdMs);
  const previewColor  = phase === 2 ? 'text-teal-400' : phase === 1 ? 'text-amber-400' : 'text-slate-300';

  // 3D tilt on idle hover
  const btnRef = useRef(null);

  const handleBtnMouseMove = (e) => {
    if (isHolding) return;
    const el = btnRef.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    const xPct = ((e.clientX - rect.left) / rect.width  - 0.5) * 2;
    const yPct = ((e.clientY - rect.top)  / rect.height - 0.5) * 2;
    el.style.transform = `perspective(700px) rotateX(${-yPct * 8}deg) rotateY(${xPct * 8}deg) scale3d(1.02,1.02,1.02)`;
    el.style.transition = 'transform 0.1s cubic-bezier(.03,.98,.52,.99)';
  };

  const handleBtnMouseLeave = () => {
    const el = btnRef.current;
    if (el) {
      el.style.transform = 'perspective(700px) rotateX(0deg) rotateY(0deg) scale3d(1,1,1)';
      el.style.transition = 'transform 0.5s cubic-bezier(.03,.98,.52,.99)';
    }
    if (isHolding) stopHold();
  };

  const wobbleMaxAngle = phase === 0 ? 3 : phase === 1 ? 6 : 10;
  const wobbleRotY = showHoldUI ? Math.sin((holdMs / shakeDuration) * Math.PI * 2) * wobbleMaxAngle : 0;
  const wobbleRotX = showHoldUI ? Math.cos((holdMs / shakeDuration) * Math.PI * 2) * wobbleMaxAngle * 0.55 : 0;
  const wobbleStyle = showHoldUI
    ? { transform: `perspective(700px) rotateX(${wobbleRotX}deg) rotateY(${wobbleRotY}deg)`, transition: 'none' }
    : {};

  // Neumorphic allocate button
  const holdShadow = showHoldUI
    ? `${PRESSED}, 0 0 32px ${phaseConf.glow}`
    : RAISED;

  const allocateButton = (
    <div
      ref={btnRef}
      onMouseMove={handleBtnMouseMove}
      onMouseLeave={handleBtnMouseLeave}
      onMouseDown={startHold}
      onMouseUp={stopHold}
      onTouchStart={e => { e.preventDefault(); startHold(); }}
      onTouchEnd={stopHold}
      style={{
        ...wobbleStyle,
        width: 200,
        height: 128,
        cursor: 'pointer',
        userSelect: 'none',
        WebkitUserSelect: 'none',
      }}
    >
      <div
        style={{
          width: '100%',
          height: '100%',
          borderRadius: 22,
          background: 'var(--nb)',
          boxShadow: holdShadow,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          position: 'relative',
          overflow: 'hidden',
          animation: showHoldUI ? `shake ${shakeDuration}ms linear infinite` : 'none',
          transition: showHoldUI ? 'box-shadow 0.25s ease' : 'box-shadow 0.4s ease',
        }}
      >
        {/* Progress strip */}
        {showHoldUI && (
          <div style={{
            position: 'absolute',
            bottom: 0,
            left: 0,
            width: `${progress * 100}%`,
            height: 3,
            background: phaseConf.border,
            borderRadius: '0 2px 0 0',
            transition: 'background 0.3s',
          }} />
        )}

        <span style={{
          fontSize: 11, fontWeight: 700, letterSpacing: '0.13em',
          color: showHoldUI ? phaseConf.border : '#94a3b8',
          transition: 'color 0.3s',
        }}>
          {showHoldUI ? phaseConf.label.toUpperCase() : 'ALLOCATE FUNDS'}
        </span>
        <span style={{
          fontSize: 9, letterSpacing: '0.12em', marginTop: 6,
          color: showHoldUI ? phaseConf.border : 'rgba(255,255,255,0.15)',
          fontVariantNumeric: 'tabular-nums',
          fontFamily: 'ui-monospace, monospace',
          transition: 'color 0.3s',
          minWidth: '5ch',
          textAlign: 'center',
        }}>
          {showHoldUI ? (() => {
            const totalSecs = Math.ceil((1 - progress) * MAX_HOLD_MS / 1000);
            const m = Math.floor(totalSecs / 60);
            const s = totalSecs % 60;
            return `${String(m).padStart(2,'0')}:${String(s).padStart(2,'0')}`;
          })() : 'HOLD TO CHARGE'}
        </span>
      </div>
    </div>
  );

  // ── Compact (mobile) ─────────────────────────────────────────────────────
  if (compact) {
    return (
      <div className="flex items-center justify-center py-3 px-4 relative overflow-visible select-none">
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

        {showHoldUI && (
          <div className="absolute left-1/2 -translate-x-1/2 text-center pointer-events-none" style={{ top: -56, zIndex: 40 }}>
            <div className="rounded-xl px-3 py-1.5 border border-white/10" style={{ background: 'var(--nb)', boxShadow: '-2px -2px 6px rgba(255,255,255,0.04), 3px 3px 8px rgba(0,0,0,0.7)' }}>
              <div className={`font-bold text-sm ${previewColor}`}>+{formatMoney(previewAmount)}</div>
              <div className="text-slate-500 text-xs mt-0.5">{phaseConf.label}&hellip;</div>
            </div>
          </div>
        )}

        <p className="text-slate-600 text-xs mr-4 flex-shrink-0">{formatCPS(currentCPS)}</p>
        {allocateButton}
      </div>
    );
  }

  // ── Full (desktop sidebar) ────────────────────────────────────────────────
  return (
    <div className="flex flex-col h-full" style={{ background: 'var(--nb)' }}>
      <div className="flex-1 flex flex-col items-center justify-center relative overflow-hidden select-none">

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

        {showHoldUI && (
          <div className="absolute text-center pointer-events-none" style={{ top: 'calc(50% - 118px)', zIndex: 30 }}>
            <div className="rounded-xl px-3 py-1.5 border border-white/[0.07]" style={{ background: 'var(--nb)', boxShadow: '-2px -2px 6px rgba(255,255,255,0.04), 3px 3px 8px rgba(0,0,0,0.7)' }}>
              <div className={`font-bold text-sm ${previewColor}`}>+{formatMoney(previewAmount)}</div>
              <div className="text-slate-500 text-xs mt-0.5">{phaseConf.label}&hellip;</div>
            </div>
          </div>
        )}

        {allocateButton}

        <p className="text-slate-600 text-xs mt-5">{formatCPS(currentCPS)}</p>
      </div>

      {activityFeed && activityFeed.length > 0 && (
        <div className="border-t border-white/[0.04] px-4 py-3 space-y-1.5">
          <div className="text-xs text-slate-700 uppercase tracking-wider">Recent</div>
          {activityFeed.map(entry => (
            <div key={entry.id} className="text-xs text-slate-600 leading-tight">
              <span className="text-slate-500">{entry.name}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
