import { formatMoney } from '../utils/calculations';
import { GLOBAL_UPGRADES } from '../data/upgrades';

export function GlobalUpgradeList({ globalUpgrades, money, onBuyGlobalUpgrade }) {
  return (
    <div className="p-4 space-y-3">
      <div className="text-xs text-slate-500 uppercase tracking-wider mb-3">Global Upgrades</div>
      {GLOBAL_UPGRADES.map(def => {
        const purchased = globalUpgrades[def.id];
        const affordable = money >= def.cost;

        return (
          <div
            key={def.id}
            className={`border rounded p-3 flex items-start justify-between gap-3 transition-colors ${
              purchased
                ? 'bg-slate-900 border-slate-700 opacity-50'
                : affordable
                ? 'bg-slate-800 border-slate-600 hover:border-slate-500'
                : 'bg-slate-800/50 border-slate-700/50'
            }`}
          >
            <div className="flex-1 min-w-0">
              <div className="text-sm font-semibold text-white">{def.name}</div>
              <div className="text-xs text-slate-500 mt-0.5">{def.description}</div>
              <div className="text-xs text-amber-400 mt-1">+{def.bonusPercent}% all CPS</div>
            </div>
            {purchased ? (
              <span className="text-xs text-slate-500 flex-shrink-0 mt-0.5">Acquired</span>
            ) : (
              <div className="flex-shrink-0 text-right">
                <div className="text-xs text-slate-400 mb-1">{formatMoney(def.cost)}</div>
                <button
                  onClick={() => onBuyGlobalUpgrade(def.id)}
                  disabled={!affordable}
                  className={`px-3 py-1 rounded text-xs font-medium transition-colors ${
                    affordable
                      ? 'bg-amber-700 hover:bg-amber-600 text-white'
                      : 'bg-slate-700 text-slate-500 cursor-not-allowed'
                  }`}
                >
                  Buy
                </button>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
