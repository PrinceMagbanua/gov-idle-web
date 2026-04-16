import { calculateGeneratorCPS } from '../utils/calculations';
import { GeneratorCard } from './GeneratorCard';

export function GeneratorList({ generators, generatorUpgrades, money, lifetimeEarned, onBuyGenerator, onBuyGeneratorUpgrade, GENERATORS }) {
  const rawTotalCPS = GENERATORS.reduce((sum, genDef, i) => {
    const g = generators[i];
    return sum + calculateGeneratorCPS(genDef.baseCPS, g.owned, g.modifierLevel);
  }, 0);

  // A tier unlocks when the player has ever earned at least half its base cost,
  // or already owns any of it. Tier 0 is always unlocked.
  const isUnlocked = (i) => {
    if (i === 0) return true;
    if (generators[i].owned > 0) return true;
    return lifetimeEarned >= GENERATORS[i].baseCost * 0.5;
  };

  return (
    <div>
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
