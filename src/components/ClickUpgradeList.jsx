import { ItemCard } from './ItemCard';

export function ClickUpgradeList({ clickUpgrades, money, onBuyClickUpgrade }) {
  return (
    <div className="bg-slate-900 flex flex-col h-full">
      {/* Header */}
      <div className="border-b border-slate-700 px-4 py-3">
        <h2 className="text-lg font-bold text-white">Direct Actions</h2>
      </div>

      {/* Click upgrades list */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3">
        {clickUpgrades.map(upgrade => (
          <ItemCard
            key={upgrade.id}
            item={upgrade}
            isProject={false}
            isClickUpgrade={true}
            money={money}
            onBuy={onBuyClickUpgrade}
            canAfford={money >= upgrade.cost && !upgrade.purchased}
          />
        ))}
      </div>
    </div>
  );
}
