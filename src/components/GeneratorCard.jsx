import { useState, useRef, useEffect } from 'react';
import { useTilt } from '../hooks/useTilt';
import {
  formatMoney,
  formatCPS,
  calculateGeneratorCost,
  calculateUpgradeCost,
  calculateMultiBuyCost,
  calculateMaxAffordable,
  calculateFatigueMultiplier,
  calculateGeneratorCPS,
} from '../utils/calculations';
import { GENERATOR_UPGRADES } from '../data/upgrades';
import { Tooltip } from './Tooltip';

const CARD_BORDER        = '1px solid rgba(20,184,166,0.12)';
const CARD_BORDER_GLOW   = '1px solid rgba(20,184,166,0.45)';
const CARD_SHADOW_GLOW   = '0 0 22px rgba(20,184,166,0.12), 0 0 1px rgba(20,184,166,0.4)';
const BTN_BORDER         = '1px solid rgba(20,184,166,0.5)';
const BTN_SHADOW         = '0 0 12px rgba(20,184,166,0.2)';
const BTN_BORDER_DIM     = '1px solid rgba(255,255,255,0.06)';

const GEN_CONFIG = {
  barangay_tanod:             { emoji: '🪖', from: '#1e3a5f', to: '#0a1829' },
  ghost_employee:             { emoji: '👻', from: '#3b1d63', to: '#160a2a' },
  overpriced_consultant:      { emoji: '💼', from: '#065f46', to: '#021f17' },
  deputy_asst_undersecretary: { emoji: '📋', from: '#78350f', to: '#2d1204' },
  bureau_director:            { emoji: '🚗', from: '#7f1d1d', to: '#2d0a0a' },
  political_dynasty:          { emoji: '👑', from: '#713f12', to: '#2a1605' },
  hired_goons:                { emoji: '🪓', from: '#7c2d12', to: '#2d0f05' },
  artista_senator:            { emoji: '🎭', from: '#701a75', to: '#280a2a' },
  private_army:               { emoji: '⚔️',  from: '#1e3a5f', to: '#080f1a' },
  family_province:            { emoji: '🏛️',  from: '#065f46', to: '#021f17' },
  shadow_power:               { emoji: '🕶️',  from: '#1e293b', to: '#060d18' },
  trillionaire_family:        { emoji: '💰', from: '#854d0e', to: '#2a1802' },
};

const EMOJI_SIZE = 38;
const DVD_BASE_SPEED = 0.045;
const DVD_FRICTION = 0.982;
const DVD_KICK_SPEED = 0.7;

function makeDVDState() {
  return {
    x: 10 + Math.random() * 20,
    y: 5 + Math.random() * 20,
    vx: (Math.random() > 0.5 ? 1 : -1) * DVD_BASE_SPEED,
    vy: (Math.random() > 0.5 ? 1 : -1) * DVD_BASE_SPEED * 0.75,
  };
}

function useDVDEmojis(count) {
  const headerRef = useRef(null);
  const emojiRefs = useRef([]);
  const stateRef = useRef([]);
  const rafRef = useRef(null);

  useEffect(() => {
    while (stateRef.current.length < count) stateRef.current.push(makeDVDState());
    stateRef.current = stateRef.current.slice(0, count);

    const tick = () => {
      const header = headerRef.current;
      if (header) {
        const { width, height } = header.getBoundingClientRect();
        if (width && height) {
          const maxX = Math.max(0, width - EMOJI_SIZE);
          const maxY = Math.max(0, height - EMOJI_SIZE);
          for (let i = 0; i < count; i++) {
            const el = emojiRefs.current[i];
            const s = stateRef.current[i];
            if (!el || !s) continue;
            let { x, y, vx, vy } = s;
            x += vx; y += vy;
            if (x <= 0)         { x = 0;    vx =  Math.abs(vx); }
            else if (x >= maxX) { x = maxX; vx = -Math.abs(vx); }
            if (y <= 0)         { y = 0;    vy =  Math.abs(vy); }
            else if (y >= maxY) { y = maxY; vy = -Math.abs(vy); }
            const mag = Math.sqrt(vx * vx + vy * vy);
            if (mag > DVD_BASE_SPEED + 0.01) {
              const nm = Math.max(DVD_BASE_SPEED, mag * DVD_FRICTION);
              vx = (vx / mag) * nm;
              vy = (vy / mag) * nm;
            }
            stateRef.current[i] = { x, y, vx, vy };
            el.style.transform = `translate(${x}px, ${y}px)`;
          }
        }
      }
      rafRef.current = requestAnimationFrame(tick);
    };

    rafRef.current = requestAnimationFrame(tick);
    return () => { if (rafRef.current) cancelAnimationFrame(rafRef.current); };
  }, [count]);

  const kick = (e) => {
    const header = headerRef.current;
    for (let i = 0; i < stateRef.current.length; i++) {
      const s = stateRef.current[i];
      if (!s) continue;
      let dx, dy;
      if (header && e) {
        const rect = header.getBoundingClientRect();
        const cx = e.clientX - rect.left;
        const cy = e.clientY - rect.top;
        dx = (s.x + EMOJI_SIZE / 2) - cx;
        dy = (s.y + EMOJI_SIZE / 2) - cy;
        const dist = Math.sqrt(dx * dx + dy * dy) || 1;
        dx /= dist; dy /= dist;
        const spread = (Math.random() - 0.5) * 0.8;
        const angle = Math.atan2(dy, dx) + spread;
        dx = Math.cos(angle); dy = Math.sin(angle);
      } else {
        const a = Math.random() * Math.PI * 2;
        dx = Math.cos(a); dy = Math.sin(a);
      }
      s.vx = dx * DVD_KICK_SPEED;
      s.vy = dy * DVD_KICK_SPEED;
    }
  };

  return { headerRef, emojiRefs, stateRef, kick };
}

function GeneratorTooltip({ genDef, genState, cpsContribution, rawTotalCPS, genIndex, prestigeCount, lifetimeEarned }) {
  const cpsPerOne = genDef.baseCPS * Math.pow(2, genState.modifierLevel);
  const sharePercent = rawTotalCPS > 0 ? (cpsContribution / rawTotalCPS) * 100 : 0;
  const fatigue = calculateFatigueMultiplier(genIndex, prestigeCount, lifetimeEarned);

  return (
    <div>
      <p className="font-semibold text-white text-sm mb-2">{genDef.name}</p>
      <p className="text-slate-400 text-xs leading-relaxed mb-3">{genDef.flavorText}</p>
      <div className="border-t border-white/10 pt-2 space-y-1 text-xs">
        <div className="flex justify-between">
          <span className="text-slate-500">Share of Total</span>
          <span className="text-slate-300">{sharePercent.toFixed(1)}%</span>
        </div>
        <div className="flex justify-between">
          <span className="text-slate-500">CPS (one)</span>
          <span className="text-slate-300">{formatCPS(cpsPerOne)}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-slate-500">Next cost</span>
          <span className="text-slate-300">{formatMoney(Math.ceil(calculateGeneratorCost(genDef.baseCost, genState.owned) * fatigue))}</span>
        </div>
        {fatigue > 1 && (
          <div className="flex justify-between text-amber-600">
            <span>Corruption fatigue</span>
            <span>×{fatigue.toFixed(2)}</span>
          </div>
        )}
      </div>
      <p className="text-slate-600 italic text-xs mt-3">"{genDef.shortDesc}"</p>
    </div>
  );
}

function UpgradeTooltip({ upg, genDef, cost }) {
  return (
    <div>
      <p className="font-semibold text-white text-sm mb-2">{upg.name}</p>
      <p className="text-slate-400 text-xs leading-relaxed mb-3">{upg.description}</p>
      <div className="border-t border-white/10 pt-2 space-y-1 text-xs">
        <div className="flex justify-between">
          <span className="text-slate-500">Effect</span>
          <span className="text-slate-300">×2 CPS for this tier</span>
        </div>
        <div className="flex justify-between">
          <span className="text-slate-500">Cost</span>
          <span className="text-slate-300">{formatMoney(cost)}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-slate-500">Unlocks at</span>
          <span className="text-slate-300">{upg.unlockAt} employees</span>
        </div>
      </div>
    </div>
  );
}

function getBuyLabel(buyRate) {
  if (buyRate === 'max') return 'MAX';
  if (buyRate === 1) return null;
  return `×${buyRate}`;
}

export function GeneratorCard({
  genDef, genState, genIndex, purchasedUpgrades, money, rawTotalCPS,
  unlocked, cpsMultiplier = 1, buyRate = 1, prestigeCount = 0, lifetimeEarned = 0,
  onBuy, onBuyUpgrade,
}) {
  const [expanded, setExpanded] = useState(false);
  const [infoOpen, setInfoOpen] = useState(false);
  const [pops, setPops] = useState([]);
  const tilt = useTilt({ maxTilt: 2, scale: 1.005 });

  const owned = genState.owned;
  const modifierLevel = genState.modifierLevel;
  const fatigue = calculateFatigueMultiplier(genIndex, prestigeCount, lifetimeEarned);

  // Cost for current buy rate
  const buyQty = buyRate === 'max'
    ? calculateMaxAffordable(genDef.baseCost, owned, money, fatigue).qty
    : Math.min(buyRate, 10000);
  const cost = buyQty > 0
    ? calculateMultiBuyCost(genDef.baseCost, owned, buyQty, fatigue)
    : Math.ceil(calculateGeneratorCost(genDef.baseCost, owned) * fatigue);

  const affordable = money >= cost && (buyRate !== 'max' ? true : buyQty > 0);
  const cpsContribution = calculateGeneratorCPS(genDef.baseCPS, owned, modifierLevel);
  const cpsPerUnit = genDef.baseCPS * Math.pow(2, modifierLevel);
  const upgradeDefs = GENERATOR_UPGRADES[genDef.id] ?? [];
  const hasUpgrades = owned > 0 && upgradeDefs.length > 0;
  const purchasedSet = new Set(purchasedUpgrades ?? []);
  const cfg = GEN_CONFIG[genDef.id] ?? { emoji: '🏛️', from: '#1e3a5f', to: '#0a1829' };

  const emojiCount = owned > 0 ? Math.min(modifierLevel + 1, 5) : 1;
  const dvd = useDVDEmojis(emojiCount);

  useEffect(() => {
    if (owned === 0) return;
    const effectiveIncome = cpsContribution * cpsMultiplier;
    if (effectiveIncome <= 0) return;
    const interval = setInterval(() => {
      const states = dvd.stateRef.current;
      if (!states.length) return;
      const s = states[Math.floor(Math.random() * states.length)];
      const id = Math.random();
      setPops(prev => [...prev, { id, x: s.x + EMOJI_SIZE / 2, y: s.y + EMOJI_SIZE / 2 }]);
      setTimeout(() => setPops(prev => prev.filter(p => p.id !== id)), 600);
    }, 1000);
    return () => clearInterval(interval);
  }, [owned, cpsContribution, cpsMultiplier]);

  const buyLabel = getBuyLabel(buyQty > 1 || buyRate === 'max' ? (buyRate === 'max' ? 'max' : buyQty) : 1);

  const hireButtonStyle = (aff) => ({
    background: 'transparent',
    border: aff ? BTN_BORDER : BTN_BORDER_DIM,
    boxShadow: aff ? BTN_SHADOW : 'none',
    color: aff ? '#2dd4bf' : '#334155',
  });

  if (!unlocked) {
    return (
      <div className="rounded-2xl overflow-hidden opacity-25 select-none"
           style={{ background: 'var(--nb)', border: CARD_BORDER }}>
        <div className="sm:hidden flex items-center">
          <div className="w-16 h-14 flex-shrink-0 flex items-center justify-center text-2xl"
               style={{ background: 'linear-gradient(135deg, #111827, #0d1526)' }}>🔒</div>
          <div className="px-3 py-2">
            <div className="text-sm font-semibold text-slate-600">Locked</div>
            <div className="text-xs text-slate-700">Reach {formatMoney(genDef.baseCost * 0.5)}</div>
          </div>
        </div>
        <div className="hidden sm:flex flex-col">
          <div className="h-20 flex items-center justify-center text-3xl"
               style={{ background: 'linear-gradient(135deg, #111827, #0d1526)' }}>🔒</div>
          <div className="p-4 flex-1 flex flex-col gap-1">
            <div className="text-sm font-semibold text-slate-600">Locked</div>
            <div className="text-xs text-slate-700">Reach {formatMoney(genDef.baseCost * 0.5)}</div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div
      ref={tilt.ref}
      onMouseMove={tilt.onMouseMove}
      onMouseLeave={tilt.onMouseLeave}
      onClick={dvd.kick}
      className="rounded-2xl overflow-hidden flex flex-col transition-all duration-300"
      style={{
        background: 'var(--nb)',
        border: affordable ? CARD_BORDER_GLOW : CARD_BORDER,
        boxShadow: affordable ? CARD_SHADOW_GLOW : 'none',
        cursor: 'default',
      }}
    >
      {/* ── MOBILE layout (< sm) ── */}
      <div className="sm:hidden">
        <div className="flex items-stretch">
          <div
            className="w-16 flex-shrink-0 flex items-center justify-center text-3xl relative"
            style={{ background: `linear-gradient(135deg, ${cfg.from}, ${cfg.to})` }}
          >
            <span style={{ pointerEvents: 'none', userSelect: 'none' }}>{cfg.emoji}</span>
            {owned > 0 && modifierLevel > 0 && (
              <div className="absolute top-1 left-1 px-1 h-4 rounded flex items-center text-amber-400 font-bold"
                   style={{ background: 'rgba(0,0,0,0.6)', fontSize: 9 }}>
                ×{Math.pow(2, modifierLevel).toFixed(0)}
              </div>
            )}
          </div>
          <div className="flex-1 px-3 py-2.5 flex flex-col gap-1.5 min-w-0">
            <div className="flex items-start justify-between gap-2">
              <div className="text-sm font-semibold text-white leading-tight truncate">{genDef.name}</div>
              <div className="flex items-center gap-1.5 flex-shrink-0">
                <span
                  className={`text-xs font-bold px-1 py-0.5 rounded ${owned > 0 ? 'text-white' : 'text-slate-600'}`}
                  style={{
                    background: owned > 0 ? 'rgba(20,184,166,0.25)' : 'rgba(0,0,0,0.3)',
                    border: owned > 0 ? '1px solid rgba(20,184,166,0.35)' : '1px solid rgba(255,255,255,0.06)',
                  }}
                >
                  {owned}
                </span>
                <button
                  onClick={e => { e.stopPropagation(); setInfoOpen(v => !v); }}
                  className="text-slate-600 hover:text-slate-400 transition-colors text-xs w-5 h-5 flex items-center justify-center flex-shrink-0"
                >
                  {infoOpen ? '▲' : 'ℹ'}
                </button>
              </div>
            </div>
            {owned > 0 && (
              <div className="text-xs text-teal-500">{formatCPS(cpsContribution)}</div>
            )}
            <button
              onClick={e => { e.stopPropagation(); onBuy(genDef.id); }}
              disabled={!affordable}
              className={`w-full py-1.5 rounded-xl font-bold text-xs tracking-wide flex items-center justify-between px-2.5 transition-all ${affordable ? 'cursor-pointer' : 'cursor-not-allowed'}`}
              style={hireButtonStyle(affordable)}
            >
              <span>HIRE{buyLabel ? ` ${buyLabel}` : ''}</span>
              <span className={`font-normal ${affordable ? 'text-teal-400/80' : 'text-slate-700'}`}>{formatMoney(cost)}</span>
            </button>
          </div>
        </div>

        {infoOpen && (
          <div className="border-t border-white/[0.04] px-4 py-3 space-y-2">
            <p className="text-xs text-slate-500 leading-relaxed">{genDef.flavorText ?? genDef.shortDesc}</p>
            {owned > 0 && (
              <p className="text-xs text-slate-600">
                +{formatCPS(cpsPerUnit)} each · {rawTotalCPS > 0 ? ((cpsContribution / rawTotalCPS) * 100).toFixed(1) : '0'}% of total
              </p>
            )}
            {fatigue > 1 && (
              <p className="text-xs text-amber-700">⚠ Corruption fatigue ×{fatigue.toFixed(2)} — impeach to reset</p>
            )}
            {hasUpgrades && (
              <div className="space-y-1.5 pt-1 border-t border-white/[0.04]">
                {upgradeDefs.map(upg => {
                  const isPurchased = purchasedSet.has(upg.index);
                  const isLocked = owned < upg.unlockAt;
                  const upgCost = calculateUpgradeCost(genDef.baseCost, upg.index);
                  const canAfford = money >= upgCost;
                  return (
                    <div
                      key={upg.index}
                      className="rounded-xl p-2.5 flex items-center gap-2"
                      style={{
                        border: isPurchased ? '1px solid rgba(255,255,255,0.06)'
                              : isLocked    ? '1px solid rgba(255,255,255,0.04)'
                              : '1px solid rgba(20,184,166,0.14)',
                        opacity: isPurchased ? 0.4 : isLocked ? 0.35 : 1,
                      }}
                    >
                      <div className="flex-1 min-w-0">
                        <div className={`text-xs font-medium leading-tight ${isLocked ? 'text-slate-600' : 'text-slate-300'}`}>{upg.name}</div>
                      </div>
                      {isPurchased ? (
                        <span className="text-teal-700 text-sm flex-shrink-0">✓</span>
                      ) : isLocked ? (
                        <span className="text-xs text-slate-700 flex-shrink-0 whitespace-nowrap">🔒 {upg.unlockAt - owned} more</span>
                      ) : (
                        <button
                          onClick={e => { e.stopPropagation(); onBuyUpgrade(genDef.id, upg.index); }}
                          disabled={!canAfford}
                          className={`flex-shrink-0 px-2 py-1 rounded-lg text-xs font-bold ${canAfford ? 'text-teal-400 cursor-pointer' : 'text-slate-700 cursor-not-allowed'}`}
                          style={{
                            background: 'transparent',
                            border: canAfford ? '1px solid rgba(20,184,166,0.35)' : BTN_BORDER_DIM,
                          }}
                        >
                          {formatMoney(upgCost)}
                        </button>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}
      </div>

      {/* ── DESKTOP layout (sm+) ── */}
      <Tooltip content={
        <GeneratorTooltip
          genDef={genDef}
          genState={genState}
          cpsContribution={cpsContribution}
          rawTotalCPS={rawTotalCPS}
          genIndex={genIndex}
          prestigeCount={prestigeCount}
          lifetimeEarned={lifetimeEarned}
        />
      }>
        <div className="hidden sm:flex flex-col flex-1">
          <div
            ref={dvd.headerRef}
            className="relative h-20 flex-shrink-0 overflow-hidden"
            style={{ background: `linear-gradient(135deg, ${cfg.from}, ${cfg.to})` }}
          >
            {Array.from({ length: emojiCount }, (_, i) => (
              <span
                key={i}
                ref={el => { dvd.emojiRefs.current[i] = el; }}
                style={{
                  position: 'absolute', top: 0, left: 0,
                  width: EMOJI_SIZE, height: EMOJI_SIZE,
                  fontSize: '1.85rem',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  pointerEvents: 'none', userSelect: 'none',
                }}
              >
                {cfg.emoji}
              </span>
            ))}
            {pops.map(p => (
              <div key={p.id} style={{ position: 'absolute', left: p.x, top: p.y, transform: 'translateX(-50%)', zIndex: 10, pointerEvents: 'none' }}>
                <span style={{ display: 'block', animation: 'popUp 0.5s ease-out forwards', fontWeight: 700, color: '#2dd4bf', fontSize: 9, whiteSpace: 'nowrap' }}>
                  +{formatMoney(cpsContribution * cpsMultiplier)}
                </span>
              </div>
            ))}
            <div
              className={`absolute top-2 right-2 min-w-[24px] h-6 px-1.5 rounded-lg flex items-center justify-center text-xs font-bold ${owned > 0 ? 'text-white' : 'text-slate-600'}`}
              style={{
                background: owned > 0 ? 'rgba(20,184,166,0.25)' : 'rgba(0,0,0,0.4)',
                border: owned > 0 ? '1px solid rgba(20,184,166,0.4)' : '1px solid rgba(255,255,255,0.08)',
                backdropFilter: 'blur(4px)',
              }}
            >
              {owned}
            </div>
            {owned > 0 && modifierLevel > 0 && (
              <div
                className="absolute top-2 left-2 px-1.5 h-6 rounded-lg flex items-center text-xs font-bold text-amber-400"
                style={{ background: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(4px)', border: '1px solid rgba(245,158,11,0.3)' }}
              >
                ×{Math.pow(2, modifierLevel).toFixed(0)}
              </div>
            )}
          </div>

          <div className="p-4 flex-1 flex flex-col gap-1.5">
            <div className="text-sm font-semibold text-white leading-tight">{genDef.name}</div>
            <div className="text-xs text-slate-500 leading-snug">{genDef.shortDesc}</div>
            {owned > 0 && (
              <div className="text-xs text-teal-500 mt-0.5">{formatCPS(cpsContribution)}</div>
            )}
            {fatigue > 1 && (
              <div className="text-xs text-amber-700 mt-0.5">⚠ Fatigue ×{fatigue.toFixed(2)}</div>
            )}
          </div>

          <div className="px-4 pb-4 flex flex-col gap-2">
            <button
              onClick={() => onBuy(genDef.id)}
              disabled={!affordable}
              className={`w-full py-2.5 rounded-xl font-bold text-xs tracking-wide transition-all flex items-center justify-between px-3 ${affordable ? 'cursor-pointer' : 'cursor-not-allowed'}`}
              style={hireButtonStyle(affordable)}
            >
              <span>HIRE{buyLabel ? ` ${buyLabel}` : ''}</span>
              <span className="flex items-center gap-2 font-normal">
                <span className={affordable ? 'text-teal-400/80' : 'text-slate-700'}>{formatMoney(cost)}</span>
                <span className={affordable ? 'text-teal-300/50' : 'text-slate-800'}>+{formatCPS(cpsPerUnit)}</span>
              </span>
            </button>

            {hasUpgrades && (
              <button
                onClick={() => setExpanded(v => !v)}
                className="w-full py-1.5 rounded-xl text-xs transition-all flex items-center justify-center gap-1.5"
                style={{
                  background: 'transparent',
                  border: expanded ? '1px solid rgba(20,184,166,0.35)' : '1px solid rgba(255,255,255,0.08)',
                  color: expanded ? '#2dd4bf' : '#475569',
                }}
              >
                {expanded ? '▲' : '▼'} Upgrades ({purchasedSet.size}/{upgradeDefs.length})
              </button>
            )}
          </div>

          {expanded && hasUpgrades && (
            <div className="border-t border-white/[0.04] px-4 pb-4 pt-3 space-y-2">
              {upgradeDefs.map(upg => {
                const isPurchased = purchasedSet.has(upg.index);
                const isLocked = owned < upg.unlockAt;
                const upgCost = calculateUpgradeCost(genDef.baseCost, upg.index);
                const canAfford = money >= upgCost;
                return (
                  <Tooltip key={upg.index} content={!isPurchased && !isLocked ? <UpgradeTooltip upg={upg} genDef={genDef} cost={upgCost} /> : null}>
                    <div
                      className="rounded-xl p-3 flex items-center gap-2 transition-all"
                      style={{
                        border: isPurchased ? '1px solid rgba(255,255,255,0.06)'
                              : isLocked    ? '1px solid rgba(255,255,255,0.04)'
                              : '1px solid rgba(20,184,166,0.14)',
                        opacity: isPurchased ? 0.4 : isLocked ? 0.35 : 1,
                      }}
                    >
                      <div className="flex-1 min-w-0">
                        <div className={`text-xs font-medium leading-tight ${isLocked ? 'text-slate-600 italic' : 'text-slate-300'}`}>{upg.name}</div>
                        {!isLocked && !isPurchased && (
                          <div className="text-xs text-slate-600 mt-0.5">{upg.description}</div>
                        )}
                        {isLocked && (
                          <div className="text-xs text-slate-700 mt-0.5">Need {upg.unlockAt} employees · {upg.unlockAt - owned} more to unlock</div>
                        )}
                      </div>
                      {isPurchased ? (
                        <span className="text-teal-700 text-sm flex-shrink-0">✓</span>
                      ) : isLocked ? (
                        <span className="text-slate-700 text-sm flex-shrink-0">🔒</span>
                      ) : (
                        <button
                          onClick={() => onBuyUpgrade(genDef.id, upg.index)}
                          disabled={!canAfford}
                          className={`flex-shrink-0 px-2.5 py-1 rounded-lg text-xs font-bold transition-all ${canAfford ? 'text-teal-400 cursor-pointer' : 'text-slate-700 cursor-not-allowed'}`}
                          style={{
                            background: 'transparent',
                            border: canAfford ? '1px solid rgba(20,184,166,0.35)' : BTN_BORDER_DIM,
                            boxShadow: canAfford ? '0 0 8px rgba(20,184,166,0.15)' : 'none',
                          }}
                        >
                          {formatMoney(upgCost)}
                        </button>
                      )}
                    </div>
                  </Tooltip>
                );
              })}
            </div>
          )}
        </div>
      </Tooltip>
    </div>
  );
}
