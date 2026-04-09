import { ItemCard } from './ItemCard';

export function UpgradeList({ upgrades, money, onBuyUpgrade }) {
  // Filter upgrades: show all without prerequisites, and show prerequisite upgrades only if requirement is met
  const visibleUpgrades = upgrades.filter(upgrade => {
    if (!upgrade.prerequisite) return true;
    // Show upgrade if the prerequisite upgrade has been purchased
    return upgrades.find(u => u.id === upgrade.prerequisite)?.purchased;
  });

  return (
    <div className="bg-slate-900 flex flex-col h-full">
      {/* Header */}
      <div className="border-b border-slate-700 px-4 py-3">
        <h2 className="text-lg font-bold text-white">Upgrades</h2>
      </div>

      {/* Upgrades list */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3">
        {visibleUpgrades.map(upgrade => (
          <ItemCard
            key={upgrade.id}
            item={upgrade}
            isProject={false}
            money={money}
            onBuy={onBuyUpgrade}
            canAfford={money >= upgrade.cost}
          />
        ))}
      </div>
    </div>
  );
}
