import { formatMoney, PRESTIGE_THRESHOLD } from '../utils/calculations';

export function PrestigeBar({ earnedSincePrestige, prestigeReady, nextLagayBonus, lagayMultiplier, onOpenPrestige }) {
  const progress = Math.min(earnedSincePrestige / PRESTIGE_THRESHOLD, 1);
  const pct = (progress * 100).toFixed(1);

  return (
    <div className="border-t border-white/[0.05] px-4 py-3 flex-shrink-0" style={{ background: 'var(--nb)' }}>
      <div className="flex items-center justify-between mb-1.5">
        <div className="text-xs text-slate-500 uppercase tracking-wider">
          Grounds for Impeachment
          {lagayMultiplier > 1 && (
            <span className="ml-2 text-amber-500">Lagay {lagayMultiplier.toFixed(1)}×</span>
          )}
        </div>
        {prestigeReady ? (
          <button
            onClick={onOpenPrestige}
            className="text-xs font-semibold px-3 py-1 rounded text-white transition-colors"
            style={{ background: '#be123c', boxShadow: '0 0 14px rgba(190,18,60,0.4)' }}
          >
            Accept Impeachment +{nextLagayBonus}×
          </button>
        ) : (
          <span className="text-xs text-slate-600">
            {formatMoney(earnedSincePrestige)} / {formatMoney(PRESTIGE_THRESHOLD)}
          </span>
        )}
      </div>
      <div className="h-1.5 rounded-full overflow-hidden" style={{ background: 'rgba(255,255,255,0.05)' }}>
        <div
          className={`h-full rounded-full transition-all duration-500 ${prestigeReady ? 'bg-rose-500' : 'bg-slate-600'}`}
          style={{ width: `${pct}%`, boxShadow: prestigeReady ? '0 0 8px rgba(244,63,94,0.6)' : 'none' }}
        />
      </div>
    </div>
  );
}
