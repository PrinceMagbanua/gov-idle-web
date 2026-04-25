import { useState } from 'react';
import { formatMoney } from '../utils/calculations';
import { GLOBAL_UPGRADES } from '../data/upgrades';
import { useTilt } from '../hooks/useTilt';

const UPGRADE_ICONS = ['⬆️', '📈', '🔓', '🗳️', '📊', '🏗️', '💡', '🔑', '⚡', '🌐', '🏦', '📡', '🛡️', '🔮', '🎯'];

function isUnlocked(def, { lifetimeEarned, generators, prestigeCount }) {
  if (!def.unlockCondition) return true;
  const { type, amount, count } = def.unlockCondition;
  if (type === 'milestone') return lifetimeEarned >= amount;
  if (type === 'prestige') return prestigeCount >= count;
  if (type === 'total_hires') {
    const total = generators.reduce((s, g) => s + g.owned, 0);
    return total >= count;
  }
  return true;
}

function unlockHint(def, { lifetimeEarned, generators, prestigeCount }) {
  if (!def.unlockCondition) return null;
  const { type, amount, count } = def.unlockCondition;
  if (type === 'milestone') return `Earn ${formatMoney(amount)} lifetime to unlock`;
  if (type === 'prestige') return `Survive ${count} impeachment${count > 1 ? 's' : ''} to unlock`;
  if (type === 'total_hires') {
    const total = generators.reduce((s, g) => s + g.owned, 0);
    return `Hire ${count} total employees (${count - total} more needed)`;
  }
  return null;
}

function UpgradeCard({ def, index, purchased, affordable, unlocked, hint, onBuy }) {
  const [infoOpen, setInfoOpen] = useState(false);
  const tilt = useTilt({ maxTilt: 2, scale: 1.005 });
  const icon = UPGRADE_ICONS[index % UPGRADE_ICONS.length];

  const borderColor = purchased
    ? '1px solid rgba(255,255,255,0.06)'
    : !unlocked
    ? '1px solid rgba(255,255,255,0.04)'
    : affordable
    ? '1px solid rgba(251,191,36,0.45)'
    : '1px solid rgba(255,255,255,0.1)';

  const glowShadow = affordable && unlocked && !purchased
    ? '0 0 18px rgba(251,191,36,0.12), 0 0 1px rgba(251,191,36,0.4)'
    : 'none';

  const headerBg = purchased
    ? 'linear-gradient(135deg, #1a2f1a, #0a1a0a)'
    : !unlocked
    ? 'linear-gradient(135deg, #111318, #0a0c10)'
    : affordable
    ? 'linear-gradient(135deg, #3d2a00, #1a1000)'
    : 'linear-gradient(135deg, #1a1f2e, #0d1526)';

  const opacity = purchased ? 0.5 : !unlocked ? 0.3 : 1;

  return (
    <div
      ref={tilt.ref}
      onMouseMove={tilt.onMouseMove}
      onMouseLeave={tilt.onMouseLeave}
      className="rounded-2xl overflow-hidden flex flex-col transition-all duration-300"
      style={{ background: 'var(--nb)', border: borderColor, boxShadow: glowShadow, opacity }}
    >
      {/* ── MOBILE layout (< sm) ── */}
      <div className="sm:hidden">
        <div className="flex items-stretch">
          <div className="w-16 flex-shrink-0 flex items-center justify-center text-2xl" style={{ background: headerBg }}>
            {purchased ? '✓' : !unlocked ? '🔒' : icon}
          </div>
          <div className="flex-1 px-3 py-2.5 flex flex-col gap-1.5 min-w-0">
            <div className="flex items-start justify-between gap-2">
              <div className="text-sm font-semibold text-white leading-tight truncate">{def.name}</div>
              <button
                onClick={() => setInfoOpen(v => !v)}
                className="text-slate-600 hover:text-slate-400 transition-colors text-xs w-5 h-5 flex items-center justify-center flex-shrink-0"
              >
                {infoOpen ? '▲' : 'ℹ'}
              </button>
            </div>
            <div className="text-xs text-amber-500">+{def.bonusPercent}% all income</div>
            {!unlocked ? (
              <div className="text-xs text-slate-700 italic">{hint}</div>
            ) : purchased ? (
              <div className="w-full py-1.5 rounded-xl text-xs text-center text-slate-600 font-medium"
                   style={{ border: '1px solid rgba(255,255,255,0.06)' }}>
                Acquired
              </div>
            ) : (
              <button
                onClick={() => onBuy(def.id)}
                disabled={!affordable}
                className={`w-full py-1.5 rounded-xl text-xs font-bold tracking-wide flex items-center justify-between px-2.5 transition-all ${affordable ? 'cursor-pointer' : 'cursor-not-allowed'}`}
                style={{
                  background: 'transparent',
                  border: affordable ? '1px solid rgba(251,191,36,0.5)' : '1px solid rgba(255,255,255,0.06)',
                  boxShadow: affordable ? '0 0 10px rgba(251,191,36,0.15)' : 'none',
                  color: affordable ? '#fbbf24' : '#334155',
                }}
              >
                <span>BUY</span>
                <span className={`font-normal ${affordable ? 'text-amber-400/80' : 'text-slate-700'}`}>{formatMoney(def.cost)}</span>
              </button>
            )}
          </div>
        </div>
        {infoOpen && (
          <div className="border-t border-white/[0.04] px-4 py-3">
            <p className="text-xs text-slate-500 leading-relaxed">{def.description}</p>
          </div>
        )}
      </div>

      {/* ── DESKTOP layout (sm+) ── */}
      <div className="hidden sm:flex flex-col flex-1">
        <div className="h-16 flex items-center justify-center text-3xl flex-shrink-0" style={{ background: headerBg }}>
          {purchased ? '✓' : !unlocked ? '🔒' : icon}
        </div>
        <div className="p-3 flex-1 flex flex-col gap-1">
          <div className="text-sm font-semibold text-white leading-tight">{def.name}</div>
          <div className="text-xs text-slate-500 leading-snug">
            {!unlocked ? <span className="text-slate-700 italic">{hint}</span> : def.description}
          </div>
          <div className="text-xs text-amber-500 mt-0.5">+{def.bonusPercent}% all income</div>
        </div>
        <div className="px-3 pb-3">
          {!unlocked ? (
            <div className="w-full py-2 rounded-xl text-xs text-center text-slate-700 font-medium"
                 style={{ border: '1px solid rgba(255,255,255,0.04)' }}>
              Locked
            </div>
          ) : purchased ? (
            <div className="w-full py-2 rounded-xl text-xs text-center text-slate-600 font-medium"
                 style={{ border: '1px solid rgba(255,255,255,0.06)' }}>
              Acquired
            </div>
          ) : (
            <button
              onClick={() => onBuy(def.id)}
              disabled={!affordable}
              className={`w-full py-2.5 rounded-xl text-xs font-bold tracking-wide flex items-center justify-between px-3 transition-all ${affordable ? 'cursor-pointer' : 'cursor-not-allowed'}`}
              style={{
                background: 'transparent',
                border: affordable ? '1px solid rgba(251,191,36,0.5)' : '1px solid rgba(255,255,255,0.06)',
                boxShadow: affordable ? '0 0 10px rgba(251,191,36,0.15)' : 'none',
                color: affordable ? '#fbbf24' : '#334155',
              }}
            >
              <span>BUY</span>
              <span className={`font-normal ${affordable ? 'text-amber-400/80' : 'text-slate-700'}`}>{formatMoney(def.cost)}</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

export function GlobalUpgradeList({ globalUpgrades, money, lifetimeEarned, generators, prestigeCount, onBuyGlobalUpgrade }) {
  const gameState = { lifetimeEarned, generators, prestigeCount };

  const available  = GLOBAL_UPGRADES.filter(d => isUnlocked(d, gameState) && !globalUpgrades[d.id]);
  const locked     = GLOBAL_UPGRADES.filter(d => !isUnlocked(d, gameState));
  const purchased  = GLOBAL_UPGRADES.filter(d => globalUpgrades[d.id]);

  const renderGroup = (label, defs, startIndex = 0) => defs.length === 0 ? null : (
    <>
      <div className="col-span-1 sm:col-span-2 text-xs text-slate-600 uppercase tracking-wider pt-2 pb-1">{label}</div>
      {defs.map((def, i) => (
        <UpgradeCard
          key={def.id}
          def={def}
          index={startIndex + i}
          purchased={!!globalUpgrades[def.id]}
          affordable={money >= def.cost}
          unlocked={isUnlocked(def, gameState)}
          hint={unlockHint(def, gameState)}
          onBuy={onBuyGlobalUpgrade}
        />
      ))}
    </>
  );

  return (
    <div className="p-5 grid grid-cols-1 sm:grid-cols-2 gap-4 auto-rows-min">
      <div className="col-span-1 sm:col-span-2 text-xs text-slate-500 pb-1">
        {purchased.length} / {GLOBAL_UPGRADES.length} upgrades acquired
      </div>
      {renderGroup('Available', available, 0)}
      {renderGroup('Locked', locked, available.length)}
      {renderGroup('Acquired', purchased, available.length + locked.length)}
    </div>
  );
}
