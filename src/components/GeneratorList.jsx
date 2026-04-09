import { calculateGeneratorCPS } from '../utils/calculations';
import { GeneratorCard } from './GeneratorCard';

export function GeneratorList({ generators, generatorUpgrades, money, onBuyGenerator, onBuyGeneratorUpgrade, GENERATORS }) {
  const rawTotalCPS = GENERATORS.reduce((sum, genDef, i) => {
    const g = generators[i];
    return sum + calculateGeneratorCPS(genDef.baseCPS, g.owned, g.modifierLevel);
  }, 0);

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
          onBuy={onBuyGenerator}
          onBuyUpgrade={onBuyGeneratorUpgrade}
        />
      ))}
    </div>
  );
}
