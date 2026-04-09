import { formatMoney } from '../utils/calculations';

const THRESHOLD = 1e12; // ₱1T

export function PrestigeBar({ lifetimeEarned, prestigeReady, nextLagayBonus, lagayMultiplier, onOpenPrestige }) {
  const progress = Math.min(lifetimeEarned / THRESHOLD, 1);
  const pct = (progress * 100).toFixed(1);

  return (
    <div className="border-t border-slate-700 bg-slate-900 px-4 py-3 flex-shrink-0">
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
            className="text-xs font-semibold px-3 py-1 rounded bg-rose-700 hover:bg-rose-600 text-white transition-colors"
          >
            Accept Impeachment +{nextLagayBonus}×
          </button>
        ) : (
          <span className="text-xs text-slate-600">
            {formatMoney(lifetimeEarned)} / {formatMoney(THRESHOLD)}
          </span>
        )}
      </div>
      <div className="h-1.5 bg-slate-800 rounded-full overflow-hidden">
        <div
          className={`h-full rounded-full transition-all duration-500 ${prestigeReady ? 'bg-rose-500' : 'bg-slate-600'}`}
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  );
}
