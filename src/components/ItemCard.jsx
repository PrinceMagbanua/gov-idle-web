import { formatNumber, calculateProjectCost, formatIPSWithDecimals } from '../utils/calculations';

export function ItemCard({ item, isProject, isClickUpgrade = false, money, costScaleMultiplier, globalMultiplier = 1, onBuy, canAfford }) {
  if (isProject) {
    const cost = calculateProjectCost(item.baseCost, item.owned, costScaleMultiplier);
    const baseIncome = item.incomePerSecond * item.owned;
    const totalIncome = baseIncome * globalMultiplier;
    
    return (
      <div className="bg-slate-800 border border-slate-700 rounded px-4 py-3 flex items-start justify-between hover:border-slate-600 transition-colors gap-2">
        <div className="flex-1 min-w-0">
          <div className="font-semibold text-white">{item.name}</div>
          <div className="text-xs text-slate-500 mb-1">{item.description}</div>
          <div className="text-sm text-slate-400">Cost: ${formatNumber(cost)}</div>
          {item.owned > 0 ? (
            <div className="text-xs text-green-400 group relative cursor-help">
              <span>Total: {formatIPSWithDecimals(totalIncome)}/s</span>
              <div className="absolute left-0 bottom-full mb-1 hidden group-hover:block bg-slate-900 text-white text-xs px-2 py-1 rounded whitespace-nowrap border border-slate-600 z-10">
                {totalIncome.toFixed(4)}/s
              </div>
            </div>
          ) : (
            <div className="text-xs text-green-400 group relative cursor-help">
              <span>+{formatIPSWithDecimals(item.incomePerSecond)}/s each</span>
              <div className="absolute left-0 bottom-full mb-1 hidden group-hover:block bg-slate-900 text-white text-xs px-2 py-1 rounded whitespace-nowrap border border-slate-600 z-10">
                {item.incomePerSecond.toFixed(4)}/s each
              </div>
            </div>
          )}
          <div className="text-xs text-amber-300">Owned: {item.owned}</div>
          {item.prerequisite && (
            <div className="text-xs text-purple-400 mt-1">
              🔓 Unlocked by owning: {item.prerequisite}
            </div>
          )}
        </div>
        <button
          onClick={() => onBuy(item.id)}
          disabled={!canAfford}
          className={`px-3 py-2 rounded font-medium transition-all text-sm flex-shrink-0 ${
            canAfford
              ? 'bg-green-600 hover:bg-green-500 text-white'
              : 'bg-slate-700 text-slate-500 cursor-not-allowed'
          }`}
        >
          Buy
        </button>
      </div>
    );
  }

  // Upgrade card (including click upgrades)
  return (
    <div className="bg-slate-800 border border-slate-700 rounded px-4 py-3 flex items-start justify-between hover:border-slate-600 transition-colors gap-2">
      <div className="flex-1 min-w-0">
        <div className="font-semibold text-white">{item.name}</div>
        <div className="text-xs text-slate-500 mb-1">{item.description}</div>
        <div className="text-sm text-slate-400">Cost: ${formatNumber(item.cost)}</div>
        <div className="text-xs text-amber-300">
          {isClickUpgrade 
            ? `Click power ×${(item.effect).toFixed(1)}` 
            : item.type === 'multiplier' 
              ? `+${Math.round((item.effect - 1) * 100)}% global income` 
              : `Cost scaling: 1.15x → ${item.effect}x`
          }
        </div>
        {item.prerequisite && (
          <div className="text-xs text-purple-400 mt-1">
            🔓 Unlocked by: {item.prerequisite}
          </div>
        )}
      </div>
      <button
        onClick={() => onBuy(item.id)}
        disabled={item.purchased || money < item.cost}
        className={`px-3 py-2 rounded font-medium transition-all text-sm flex-shrink-0 ${
          item.purchased
            ? 'bg-slate-700 text-slate-500 cursor-not-allowed'
            : money >= item.cost
            ? 'bg-blue-600 hover:bg-blue-500 text-white'
            : 'bg-slate-700 text-slate-500 cursor-not-allowed'
        }`}
      >
        {item.purchased ? '✓ Bought' : 'Buy'}
      </button>
    </div>
  );
}
