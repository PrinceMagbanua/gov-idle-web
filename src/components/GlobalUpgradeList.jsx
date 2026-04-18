import { formatMoney } from '../utils/calculations';
import { GLOBAL_UPGRADES } from '../data/upgrades';
import { useTilt } from '../hooks/useTilt';

const RAISED = '-3px -3px 8px rgba(255,255,255,0.05), 4px 4px 12px rgba(0,0,0,0.76)';
const INSET  = 'inset -2px -2px 5px rgba(255,255,255,0.04), inset 3px 3px 8px rgba(0,0,0,0.7)';

const UPGRADE_ICONS = ['⬆️', '📈', '🔓', '🗳️', '📊', '🏗️', '💡', '🔑', '⚡', '🌐'];

function UpgradeCard({ def, index, purchased, affordable, onBuy }) {
  const tilt = useTilt({ maxTilt: 2, scale: 1.005 });
  const icon = UPGRADE_ICONS[index % UPGRADE_ICONS.length];

  return (
    <div
      ref={tilt.ref}
      onMouseMove={tilt.onMouseMove}
      onMouseLeave={tilt.onMouseLeave}
      className="rounded-2xl overflow-hidden flex flex-col"
      style={{
        background: 'var(--nb)',
        boxShadow: purchased
          ? INSET
          : affordable
          ? '-3px -3px 8px rgba(255,255,255,0.05), 4px 4px 12px rgba(0,0,0,0.76), 0 0 0 1px rgba(251,191,36,0.2), 0 0 16px rgba(251,191,36,0.06)'
          : RAISED,
        opacity: purchased ? 0.5 : 1,
        transition: 'box-shadow 0.4s ease',
      }}
    >
      {/* Header */}
      <div
        className="h-16 flex items-center justify-center text-3xl flex-shrink-0"
        style={{
          background: purchased
            ? 'linear-gradient(135deg, #1a2f1a, #0a1a0a)'
            : affordable
            ? 'linear-gradient(135deg, #3d2a00, #1a1000)'
            : 'linear-gradient(135deg, #1a1f2e, #0d1526)',
        }}
      >
        {purchased ? '✓' : icon}
      </div>

      {/* Body */}
      <div className="p-3 flex-1 flex flex-col gap-1">
        <div className="text-sm font-semibold text-white leading-tight">{def.name}</div>
        <div className="text-xs text-slate-500 leading-snug">{def.description}</div>
        <div className="text-xs text-amber-500 mt-0.5">+{def.bonusPercent}% all income</div>
      </div>

      {/* Footer */}
      <div className="px-3 pb-3">
        {purchased ? (
          <div
            className="w-full py-2 rounded-xl text-xs text-center text-slate-600 font-medium"
            style={{ background: 'var(--nb)', boxShadow: INSET }}
          >
            Acquired
          </div>
        ) : (
          <button
            onClick={() => onBuy(def.id)}
            disabled={!affordable}
            className={`w-full py-2.5 rounded-xl text-xs font-bold tracking-wide flex items-center justify-between px-3 transition-all ${
              affordable ? 'cursor-pointer' : 'cursor-not-allowed'
            }`}
            style={{
              background: 'var(--nb)',
              boxShadow: affordable
                ? '-2px -2px 6px rgba(255,255,255,0.06), 3px 3px 9px rgba(0,0,0,0.75), 0 0 0 1px rgba(251,191,36,0.3), 0 0 12px rgba(251,191,36,0.1)'
                : INSET,
              color: affordable ? '#fbbf24' : '#334155',
            }}
          >
            <span>BUY</span>
            <span className={`font-normal ${affordable ? 'text-amber-400/80' : 'text-slate-700'}`}>{formatMoney(def.cost)}</span>
          </button>
        )}
      </div>
    </div>
  );
}

export function GlobalUpgradeList({ globalUpgrades, money, onBuyGlobalUpgrade }) {
  return (
    <div className="p-5 grid grid-cols-3 gap-4 auto-rows-min">
      <div className="col-span-3 text-xs text-slate-600 uppercase tracking-wider pb-1">Global Upgrades</div>
      {GLOBAL_UPGRADES.map((def, i) => (
        <UpgradeCard
          key={def.id}
          def={def}
          index={i}
          purchased={!!globalUpgrades[def.id]}
          affordable={money >= def.cost}
          onBuy={onBuyGlobalUpgrade}
        />
      ))}
    </div>
  );
}
