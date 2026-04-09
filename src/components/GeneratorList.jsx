import { GeneratorCard } from './GeneratorCard';

export function GeneratorList({ generators, generatorUpgrades, money, onBuyGenerator, onBuyGeneratorUpgrade, GENERATORS }) {
  return (
    <div>
      {GENERATORS.map((genDef, i) => (
        <GeneratorCard
          key={genDef.id}
          genDef={genDef}
          genState={generators[i]}
          purchasedUpgrades={generatorUpgrades[genDef.id]}
          money={money}
          onBuy={onBuyGenerator}
          onBuyUpgrade={onBuyGeneratorUpgrade}
        />
      ))}
    </div>
  );
}
