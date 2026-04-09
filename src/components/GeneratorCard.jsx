import { useState } from 'react';
import { formatMoney, formatCPS, calculateGeneratorCost, calculateUpgradeCost, calculateGeneratorCPS } from '../utils/calculations';
import { GENERATOR_UPGRADES } from '../data/upgrades';

export function GeneratorCard({ genDef, genState, purchasedUpgrades, money, onBuy, onBuyUpgrade }) {
  const [expanded, setExpanded] = useState(false);

  const owned = genState.owned;
  const modifierLevel = genState.modifierLevel;
  const cost = calculateGeneratorCost(genDef.baseCost, owned);
  const affordable = money >= cost;
  const cpsContribution = calculateGeneratorCPS(genDef.baseCPS, owned, modifierLevel);
  const upgradeDefs = GENERATOR_UPGRADES[genDef.id] ?? [];
  const hasUpgrades = owned > 0 && upgradeDefs.length > 0;
  const purchasedSet = new Set(purchasedUpgrades ?? []);

  return (
    <div className={`border-b border-slate-700/50 transition-colors ${owned > 0 ? 'bg-slate-800/30' : ''}`}>
      {/* Main row */}
      <div className="px-4 py-3 flex items-start gap-3">
        {/* Owned badge */}
        <div className={`flex-shrink-0 w-10 h-10 rounded flex items-center justify-center text-sm font-bold border ${
          owned > 0 ? 'bg-slate-700 border-slate-600 text-white' : 'bg-slate-900 border-slate-700 text-slate-600'
        }`}>
          {owned}
        </div>

        {/* Info */}
        <div className="flex-1 min-w-0">
          <div className="flex items-baseline gap-2">
            <span className="text-sm font-semibold text-white leading-tight">{genDef.name}</span>
            {owned > 0 && modifierLevel > 0 && (
              <span className="text-xs text-amber-600">×{Math.pow(2, modifierLevel).toFixed(0)}</span>
            )}
          </div>
          <div className="text-xs text-slate-500 mt-0.5 leading-tight">{genDef.shortDesc}</div>
          <div className="flex items-center gap-3 mt-1">
            <span className="text-xs text-slate-400">{formatMoney(cost)}</span>
            {owned > 0 && (
              <span className="text-xs text-green-500">{formatCPS(cpsContribution)}</span>
            )}
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-1.5 flex-shrink-0">
          {hasUpgrades && (
            <button
              onClick={() => setExpanded(v => !v)}
              className="w-7 h-7 flex items-center justify-center rounded text-slate-500 hover:text-slate-300 hover:bg-slate-700 transition-colors text-xs"
              title="Show upgrades"
            >
              {expanded ? '▲' : '▼'}
            </button>
          )}
          <button
            onClick={() => onBuy(genDef.id)}
            disabled={!affordable}
            className={`px-3 py-1.5 rounded text-xs font-medium transition-colors ${
              affordable
                ? 'bg-green-700 hover:bg-green-600 text-white'
                : 'bg-slate-700 text-slate-500 cursor-not-allowed'
            }`}
          >
            Buy
          </button>
        </div>
      </div>

      {/* Upgrade panel */}
      {expanded && hasUpgrades && (
        <div className="px-4 pb-3 space-y-1.5 border-t border-slate-700/50 pt-2 bg-slate-900/30">
          <div className="text-xs text-slate-600 uppercase tracking-wider mb-2">Upgrades — {genDef.name}</div>
          {upgradeDefs.map(upg => {
            const isPurchased = purchasedSet.has(upg.index);
            const upgCost = calculateUpgradeCost(genDef.baseCost, upg.index);
            const canAfford = money >= upgCost;

            return (
              <div
                key={upg.index}
                className={`flex items-start gap-2 rounded p-2 transition-colors ${
                  isPurchased ? 'opacity-40' : canAfford ? 'bg-slate-800/60' : 'bg-slate-800/20'
                }`}
              >
                <div className="flex-1 min-w-0">
                  <div className="text-xs font-medium text-slate-300">{upg.name}</div>
                  <div className="text-xs text-slate-600 leading-tight mt-0.5">{upg.description}</div>
                </div>
                <div className="flex-shrink-0 text-right">
                  {isPurchased ? (
                    <span className="text-xs text-slate-600">✓</span>
                  ) : (
                    <>
                      <div className="text-xs text-slate-500 mb-1">{formatMoney(upgCost)}</div>
                      <button
                        onClick={() => onBuyUpgrade(genDef.id, upg.index)}
                        disabled={!canAfford}
                        className={`px-2 py-0.5 rounded text-xs transition-colors ${
                          canAfford
                            ? 'bg-slate-600 hover:bg-slate-500 text-white'
                            : 'bg-slate-800 text-slate-600 cursor-not-allowed'
                        }`}
                      >
                        Buy
                      </button>
                    </>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
