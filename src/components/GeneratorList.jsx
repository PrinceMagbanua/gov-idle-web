import { calculateGeneratorCPS } from '../utils/calculations';
import { GeneratorCard } from './GeneratorCard';

const BUY_RATES = [1, 10, 25, 100, 'max'];

export function GeneratorList({
  generators, generatorUpgrades, money, lifetimeEarned, prestigeCount,
  cpsMultiplier, buyRate, setBuyRate, onBuyGenerator, onBuyGeneratorUpgrade, GENERATORS,
}) {
  const rawTotalCPS = GENERATORS.reduce((sum, genDef, i) => {
    const g = generators[i];
    return sum + calculateGeneratorCPS(genDef.baseCPS, g.owned, g.modifierLevel);
  }, 0);

  const isUnlocked = (i) => {
    if (i === 0) return true;
    if (generators[i].owned > 0) return true;
    return lifetimeEarned >= GENERATORS[i].baseCost * 0.5;
  };

  return (
    <div className="flex flex-col">
      {/* Buy rate selector */}
      <div className="flex items-center gap-2 px-5 pt-4 pb-2">
        <span className="text-xs text-slate-600 uppercase tracking-wider flex-shrink-0">Hire</span>
        <div className="flex gap-1">
          {BUY_RATES.map(rate => (
            <button
              key={rate}
              onClick={() => setBuyRate(rate)}
              className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all ${
                buyRate === rate
                  ? 'text-teal-300'
                  : 'text-slate-600 hover:text-slate-400'
              }`}
              style={{
                border: buyRate === rate
                  ? '1px solid rgba(20,184,166,0.5)'
                  : '1px solid rgba(255,255,255,0.08)',
                boxShadow: buyRate === rate ? '0 0 10px rgba(20,184,166,0.15)' : 'none',
                background: buyRate === rate ? 'rgba(20,184,166,0.08)' : 'transparent',
              }}
            >
              {rate === 'max' ? 'Max' : rate}
            </button>
          ))}
        </div>
      </div>

      {/* Employee cards */}
      <div className="p-5 pt-2 grid grid-cols-1 sm:grid-cols-2 gap-4 auto-rows-min">
        {GENERATORS.map((genDef, i) => (
          <GeneratorCard
            key={genDef.id}
            genDef={genDef}
            genState={generators[i]}
            genIndex={i}
            purchasedUpgrades={generatorUpgrades[genDef.id]}
            money={money}
            rawTotalCPS={rawTotalCPS}
            unlocked={isUnlocked(i)}
            cpsMultiplier={cpsMultiplier}
            buyRate={buyRate}
            prestigeCount={prestigeCount}
            lifetimeEarned={lifetimeEarned}
            onBuy={onBuyGenerator}
            onBuyUpgrade={onBuyGeneratorUpgrade}
          />
        ))}
      </div>
    </div>
  );
}
