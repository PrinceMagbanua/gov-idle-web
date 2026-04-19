import { useState, useRef, useEffect } from 'react';
import { useTilt } from '../hooks/useTilt';
import {
  formatMoney,
  formatCPS,
  calculateGeneratorCost,
  calculateUpgradeCost,
  calculateGeneratorCPS,
} from '../utils/calculations';
import { GENERATOR_UPGRADES } from '../data/upgrades';
import { Tooltip } from './Tooltip';

const RAISED = '-3px -3px 8px rgba(255,255,255,0.05), 4px 4px 12px rgba(0,0,0,0.76)';
const RAISED_GLOW = '-3px -3px 8px rgba(255,255,255,0.05), 4px 4px 12px rgba(0,0,0,0.76), 0 0 0 1px rgba(20,184,166,0.22), 0 0 18px rgba(20,184,166,0.07)';
const INSET = 'inset -2px -2px 5px rgba(255,255,255,0.04), inset 3px 3px 8px rgba(0,0,0,0.7)';

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

function useDVDEmoji() {
  const headerRef = useRef(null);
  const emojiRef = useRef(null);
  const stateRef = useRef(null);
  const rafRef = useRef(null);

  useEffect(() => {
    stateRef.current = {
      x: 10 + Math.random() * 20,
      y: 5 + Math.random() * 20,
      vx: (Math.random() > 0.5 ? 1 : -1) * DVD_BASE_SPEED,
      vy: (Math.random() > 0.5 ? 1 : -1) * DVD_BASE_SPEED * 0.75,
    };

    const tick = () => {
      const header = headerRef.current;
      const emoji = emojiRef.current;
      if (header && emoji && stateRef.current) {
        const { width, height } = header.getBoundingClientRect();
        if (width && height) {
          const maxX = Math.max(0, width - EMOJI_SIZE);
          const maxY = Math.max(0, height - EMOJI_SIZE);
          let { x, y, vx, vy } = stateRef.current;
          x += vx; y += vy;
          if (x <= 0)      { x = 0;    vx =  Math.abs(vx); }
          else if (x >= maxX) { x = maxX; vx = -Math.abs(vx); }
          if (y <= 0)      { y = 0;    vy =  Math.abs(vy); }
          else if (y >= maxY) { y = maxY; vy = -Math.abs(vy); }
          const mag = Math.sqrt(vx * vx + vy * vy);
          if (mag > DVD_BASE_SPEED + 0.01) {
            const nm = Math.max(DVD_BASE_SPEED, mag * DVD_FRICTION);
            vx = (vx / mag) * nm;
            vy = (vy / mag) * nm;
          }
          stateRef.current = { x, y, vx, vy };
          emoji.style.transform = `translate(${x}px, ${y}px)`;
        }
      }
      rafRef.current = requestAnimationFrame(tick);
    };

    rafRef.current = requestAnimationFrame(tick);
    return () => { if (rafRef.current) cancelAnimationFrame(rafRef.current); };
  }, []);

  const kick = (e) => {
    if (!stateRef.current) return;
    const header = headerRef.current;
    let dx, dy;
    if (header && e) {
      const rect = header.getBoundingClientRect();
      const cx = e.clientX - rect.left;
      const cy = e.clientY - rect.top;
      const { x, y } = stateRef.current;
      dx = (x + EMOJI_SIZE / 2) - cx;
      dy = (y + EMOJI_SIZE / 2) - cy;
      const dist = Math.sqrt(dx * dx + dy * dy) || 1;
      dx /= dist; dy /= dist;
    } else {
      const a = Math.random() * Math.PI * 2;
      dx = Math.cos(a); dy = Math.sin(a);
    }
    stateRef.current.vx = dx * DVD_KICK_SPEED;
    stateRef.current.vy = dy * DVD_KICK_SPEED;
  };

  return { headerRef, emojiRef, kick };
}

function GeneratorTooltip({ genDef, genState, cpsContribution, rawTotalCPS }) {
  const cpsPerOne = genDef.baseCPS * Math.pow(2, genState.modifierLevel);
  const sharePercent = rawTotalCPS > 0 ? (cpsContribution / rawTotalCPS) * 100 : 0;

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
          <span className="text-slate-300">{formatMoney(calculateGeneratorCost(genDef.baseCost, genState.owned))}</span>
        </div>
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
      </div>
    </div>
  );
}

export function GeneratorCard({ genDef, genState, purchasedUpgrades, money, rawTotalCPS, unlocked, onBuy, onBuyUpgrade }) {
  const [expanded, setExpanded] = useState(false);
  const [infoOpen, setInfoOpen] = useState(false);
  const tilt = useTilt({ maxTilt: 2, scale: 1.005 });
  const dvd = useDVDEmoji();

  const owned = genState.owned;
  const modifierLevel = genState.modifierLevel;
  const cost = calculateGeneratorCost(genDef.baseCost, owned);
  const affordable = money >= cost;
  const cpsContribution = calculateGeneratorCPS(genDef.baseCPS, owned, modifierLevel);
  const cpsPerUnit = genDef.baseCPS * Math.pow(2, modifierLevel);
  const upgradeDefs = GENERATOR_UPGRADES[genDef.id] ?? [];
  const hasUpgrades = owned > 0 && upgradeDefs.length > 0;
  const purchasedSet = new Set(purchasedUpgrades ?? []);
  const cfg = GEN_CONFIG[genDef.id] ?? { emoji: '🏛️', from: '#1e3a5f', to: '#0a1829' };

  if (!unlocked) {
    return (
      <div className="rounded-2xl overflow-hidden opacity-25 select-none" style={{ background: 'var(--nb)', boxShadow: RAISED }}>
        {/* Mobile locked */}
        <div className="sm:hidden flex items-center">
          <div className="w-16 h-14 flex-shrink-0 flex items-center justify-center text-2xl"
               style={{ background: 'linear-gradient(135deg, #111827, #0d1526)' }}>🔒</div>
          <div className="px-3 py-2">
            <div className="text-sm font-semibold text-slate-600">Locked</div>
            <div className="text-xs text-slate-700">Reach {formatMoney(genDef.baseCost * 0.5)}</div>
          </div>
        </div>
        {/* Desktop locked */}
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
      className="rounded-2xl overflow-hidden flex flex-col"
      style={{
        background: 'var(--nb)',
        boxShadow: affordable ? RAISED_GLOW : RAISED,
        transition: 'box-shadow 0.4s ease',
        cursor: 'default',
      }}
    >
      {/* ── MOBILE layout (< sm) ── */}
      <div className="sm:hidden">
        <div className="flex items-stretch">
          {/* Left: gradient square with static emoji */}
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
          {/* Right: content */}
          <div className="flex-1 px-3 py-2.5 flex flex-col gap-1.5 min-w-0">
            <div className="flex items-start justify-between gap-2">
              <div className="text-sm font-semibold text-white leading-tight truncate">{genDef.name}</div>
              <div className="flex items-center gap-1.5 flex-shrink-0">
                <span
                  className={`text-xs font-bold px-1 py-0.5 rounded ${owned > 0 ? 'text-white' : 'text-slate-600'}`}
                  style={{
                    background: owned > 0 ? 'rgba(20,184,166,0.3)' : 'rgba(0,0,0,0.3)',
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
              <div className="text-xs text-teal-500">{formatCPS(cpsContribution)}/s</div>
            )}
            <button
              onClick={e => { e.stopPropagation(); onBuy(genDef.id); }}
              disabled={!affordable}
              className={`w-full py-1.5 rounded-xl font-bold text-xs tracking-wide flex items-center justify-between px-2.5 transition-all ${affordable ? 'cursor-pointer' : 'cursor-not-allowed'}`}
              style={{
                background: 'var(--nb)',
                boxShadow: affordable
                  ? '-2px -2px 6px rgba(255,255,255,0.06), 3px 3px 9px rgba(0,0,0,0.75), 0 0 0 1px rgba(20,184,166,0.3), 0 0 12px rgba(20,184,166,0.1)'
                  : INSET,
                color: affordable ? '#2dd4bf' : '#334155',
              }}
            >
              <span>HIRE</span>
              <span className={`font-normal ${affordable ? 'text-teal-400/80' : 'text-slate-700'}`}>{formatMoney(cost)}</span>
            </button>
          </div>
        </div>

        {/* Mobile info expand */}
        {infoOpen && (
          <div className="border-t border-white/[0.04] px-4 py-3 space-y-2">
            <p className="text-xs text-slate-500 leading-relaxed">{genDef.flavorText ?? genDef.shortDesc}</p>
            {owned > 0 && (
              <p className="text-xs text-slate-600">
                +{formatCPS(cpsPerUnit)}/s each · {rawTotalCPS > 0 ? ((cpsContribution / rawTotalCPS) * 100).toFixed(1) : '0'}% of total
              </p>
            )}
            {hasUpgrades && (
              <div className="space-y-1.5 pt-1 border-t border-white/[0.04]">
                {upgradeDefs.map(upg => {
                  const isPurchased = purchasedSet.has(upg.index);
                  const upgCost = calculateUpgradeCost(genDef.baseCost, upg.index);
                  const canAfford = money >= upgCost;
                  return (
                    <div
                      key={upg.index}
                      className="rounded-xl p-2.5 flex items-center gap-2"
                      style={{ background: 'var(--nb)', boxShadow: isPurchased ? INSET : RAISED, opacity: isPurchased ? 0.4 : 1 }}
                    >
                      <div className="flex-1 min-w-0">
                        <div className="text-xs font-medium text-slate-300">{upg.name}</div>
                      </div>
                      {isPurchased ? (
                        <span className="text-teal-700 text-sm">✓</span>
                      ) : (
                        <button
                          onClick={e => { e.stopPropagation(); onBuyUpgrade(genDef.id, upg.index); }}
                          disabled={!canAfford}
                          className={`flex-shrink-0 px-2 py-1 rounded-lg text-xs font-bold ${canAfford ? 'text-teal-300 cursor-pointer' : 'text-slate-700 cursor-not-allowed'}`}
                          style={{ background: 'var(--nb)', boxShadow: canAfford ? '-2px -2px 5px rgba(255,255,255,0.05), 2px 2px 7px rgba(0,0,0,0.7), 0 0 0 1px rgba(20,184,166,0.25)' : INSET }}
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
        />
      }>
        <div className="hidden sm:flex flex-col flex-1">
          {/* Card header — DVD bouncing emoji */}
          <div
            ref={dvd.headerRef}
            className="relative h-20 flex-shrink-0 overflow-hidden"
            style={{ background: `linear-gradient(135deg, ${cfg.from}, ${cfg.to})` }}
          >
            <span
              ref={dvd.emojiRef}
              style={{
                position: 'absolute',
                top: 0,
                left: 0,
                width: EMOJI_SIZE,
                height: EMOJI_SIZE,
                fontSize: '1.85rem',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                pointerEvents: 'none',
                userSelect: 'none',
              }}
            >
              {cfg.emoji}
            </span>
            <div
              className={`absolute top-2 right-2 min-w-[24px] h-6 px-1.5 rounded-lg flex items-center justify-center text-xs font-bold ${owned > 0 ? 'text-white' : 'text-slate-600'}`}
              style={{
                background: owned > 0 ? 'rgba(20,184,166,0.3)' : 'rgba(0,0,0,0.4)',
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

          {/* Body */}
          <div className="p-4 flex-1 flex flex-col gap-1.5">
            <div className="text-sm font-semibold text-white leading-tight">{genDef.name}</div>
            <div className="text-xs text-slate-500 leading-snug">{genDef.shortDesc}</div>
            {owned > 0 && (
              <div className="text-xs text-teal-500 mt-0.5">{formatCPS(cpsContribution)}/s total</div>
            )}
          </div>

          {/* Footer */}
          <div className="px-4 pb-4 flex flex-col gap-2">
            <button
              onClick={() => onBuy(genDef.id)}
              disabled={!affordable}
              className={`w-full py-2.5 rounded-xl font-bold text-xs tracking-wide transition-all flex items-center justify-between px-3 ${affordable ? 'cursor-pointer' : 'cursor-not-allowed'}`}
              style={{
                background: 'var(--nb)',
                boxShadow: affordable
                  ? '-2px -2px 6px rgba(255,255,255,0.06), 3px 3px 9px rgba(0,0,0,0.75), 0 0 0 1px rgba(20,184,166,0.3), 0 0 12px rgba(20,184,166,0.1)'
                  : INSET,
                color: affordable ? '#2dd4bf' : '#334155',
              }}
            >
              <span>HIRE</span>
              <span className="flex items-center gap-2 font-normal">
                <span className={affordable ? 'text-teal-400/80' : 'text-slate-700'}>{formatMoney(cost)}</span>
                <span className={affordable ? 'text-teal-300/50' : 'text-slate-800'}>+{formatCPS(cpsPerUnit)}/s</span>
              </span>
            </button>

            {hasUpgrades && (
              <button
                onClick={() => setExpanded(v => !v)}
                className="w-full py-1.5 rounded-xl text-xs transition-all flex items-center justify-center gap-1.5"
                style={{
                  background: 'var(--nb)',
                  boxShadow: expanded ? INSET : RAISED,
                  color: expanded ? '#2dd4bf' : '#475569',
                }}
              >
                {expanded ? '▲' : '▼'} Upgrades
              </button>
            )}
          </div>

          {/* Upgrade panel */}
          {expanded && hasUpgrades && (
            <div className="border-t border-white/[0.04] px-4 pb-4 pt-3 space-y-2">
              {upgradeDefs.map(upg => {
                const isPurchased = purchasedSet.has(upg.index);
                const upgCost = calculateUpgradeCost(genDef.baseCost, upg.index);
                const canAfford = money >= upgCost;
                return (
                  <Tooltip key={upg.index} content={!isPurchased ? <UpgradeTooltip upg={upg} genDef={genDef} cost={upgCost} /> : null}>
                    <div
                      className="rounded-xl p-3 flex items-center gap-2 transition-all"
                      style={{ background: 'var(--nb)', boxShadow: isPurchased ? INSET : RAISED, opacity: isPurchased ? 0.4 : 1 }}
                    >
                      <div className="flex-1 min-w-0">
                        <div className="text-xs font-medium text-slate-300 leading-tight">{upg.name}</div>
                        <div className="text-xs text-slate-600 mt-0.5">{upg.description}</div>
                      </div>
                      {isPurchased ? (
                        <span className="text-teal-700 text-sm">✓</span>
                      ) : (
                        <button
                          onClick={() => onBuyUpgrade(genDef.id, upg.index)}
                          disabled={!canAfford}
                          className={`flex-shrink-0 px-2.5 py-1 rounded-lg text-xs font-bold transition-all ${canAfford ? 'text-teal-300 cursor-pointer' : 'text-slate-700 cursor-not-allowed'}`}
                          style={{
                            background: 'var(--nb)',
                            boxShadow: canAfford
                              ? '-2px -2px 5px rgba(255,255,255,0.05), 2px 2px 7px rgba(0,0,0,0.7), 0 0 0 1px rgba(20,184,166,0.25)'
                              : INSET,
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
