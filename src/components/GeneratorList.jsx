import { calculateGeneratorCPS } from '../utils/calculations';
import { GeneratorCard } from './GeneratorCard';

export function GeneratorList({ generators, generatorUpgrades, money, lifetimeEarned, onBuyGenerator, onBuyGeneratorUpgrade, GENERATORS }) {
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
    <div className="p-5 grid grid-cols-3 gap-4 auto-rows-min">
      {GENERATORS.map((genDef, i) => (
        <GeneratorCard
          key={genDef.id}
          genDef={genDef}
          genState={generators[i]}
          purchasedUpgrades={generatorUpgrades[genDef.id]}
          money={money}
          rawTotalCPS={rawTotalCPS}
          unlocked={isUnlocked(i)}
          onBuy={onBuyGenerator}
          onBuyUpgrade={onBuyGeneratorUpgrade}
        />
      ))}
    </div>
  );
}
