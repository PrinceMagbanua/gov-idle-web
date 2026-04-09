import { useState } from 'react';
import { Toaster } from 'sonner';
import { useGameState } from './hooks/useGameState';
import { useAchievementNotifications } from './hooks/useAchievementNotifications';
import { TopBar } from './components/TopBar';
import { ClickArea } from './components/ClickArea';
import { GeneratorList } from './components/GeneratorList';
import { GlobalUpgradeList } from './components/GlobalUpgradeList';
import { PrestigeBar } from './components/PrestigeBar';
import { PrestigeModal } from './components/PrestigeModal';
import { OfflineEarningsModal } from './components/OfflineEarningsModal';
import { AchievementsModal } from './components/AchievementsModal';

function App() {
  const game = useGameState();

  const [tab, setTab] = useState('generators');
  const [showAchievements, setShowAchievements] = useState(false);
  const [showPrestigeModal, setShowPrestigeModal] = useState(false);
  const [activityFeed, setActivityFeed] = useState([]);

  useAchievementNotifications(game.achievements);

  const handleBuyGenerator = (generatorId) => {
    const success = game.buyGenerator(generatorId);
    if (success) {
      const def = game.GENERATORS.find(g => g.id === generatorId);
      if (def) {
        setActivityFeed(prev => [
          { id: Date.now(), name: def.name },
          ...prev,
        ].slice(0, 5));
      }
    }
  };

  const handleAcceptImpeachment = () => {
    game.acceptImpeachment();
    setShowPrestigeModal(false);
  };

  return (
    <div className="h-screen w-screen flex flex-col bg-slate-900 overflow-hidden">
      <Toaster position="top-right" theme="dark" />

      {/* Modals */}
      {game.pendingOfflineEarnings != null && (
        <OfflineEarningsModal
          amount={game.pendingOfflineEarnings}
          onDismiss={game.dismissOfflineEarnings}
        />
      )}
      {showPrestigeModal && (
        <PrestigeModal
          lifetimeEarned={game.lifetimeEarned}
          nextLagayBonus={game.nextLagayBonus}
          lagayMultiplier={game.lagayMultiplier}
          prestigeCount={game.prestigeCount}
          onConfirm={handleAcceptImpeachment}
          onCancel={() => setShowPrestigeModal(false)}
        />
      )}
      {showAchievements && (
        <AchievementsModal
          achievements={game.achievements}
          onClose={() => setShowAchievements(false)}
        />
      )}

      {/* Top bar */}
      <TopBar
        money={game.money}
        currentCPS={game.currentCPS}
        lifetimeEarned={game.lifetimeEarned}
        lagayMultiplier={game.lagayMultiplier}
        prestigeCount={game.prestigeCount}
        achievements={game.achievements}
        onOpenAchievements={() => setShowAchievements(true)}
      />

      {/* Main layout */}
      <div className="flex flex-1 overflow-hidden">

        {/* Left panel — click area (fixed width) */}
        <div className="w-72 flex-shrink-0 border-r border-slate-700">
          <ClickArea
            onClickFunds={game.handleClick}
            addBonusMoney={game.addBonusMoney}
            currentCPS={game.currentCPS}
            activityFeed={activityFeed}
          />
        </div>

        {/* Right panel — game content */}
        <div className="flex-1 flex flex-col overflow-hidden">

          {/* Tab bar */}
          <div className="flex border-b border-slate-700 flex-shrink-0">
            {['generators', 'upgrades'].map(t => (
              <button
                key={t}
                onClick={() => setTab(t)}
                className={`px-5 py-2.5 text-sm font-medium capitalize transition-colors border-b-2 -mb-px ${
                  tab === t
                    ? 'border-slate-400 text-white'
                    : 'border-transparent text-slate-500 hover:text-slate-300'
                }`}
              >
                {t === 'generators' ? 'Generators' : 'Upgrades'}
              </button>
            ))}
          </div>

          {/* Scrollable content */}
          <div className="flex-1 overflow-y-auto">
            {tab === 'generators' && (
              <GeneratorList
                generators={game.generators}
                generatorUpgrades={game.generatorUpgrades}
                money={game.money}
                onBuyGenerator={handleBuyGenerator}
                onBuyGeneratorUpgrade={game.buyGeneratorUpgrade}
                GENERATORS={game.GENERATORS}
              />
            )}
            {tab === 'upgrades' && (
              <GlobalUpgradeList
                globalUpgrades={game.globalUpgrades}
                money={game.money}
                onBuyGlobalUpgrade={game.buyGlobalUpgrade}
              />
            )}
          </div>

          {/* Prestige bar — fixed at bottom of right panel */}
          <PrestigeBar
            lifetimeEarned={game.lifetimeEarned}
            prestigeReady={game.prestigeReady}
            nextLagayBonus={game.nextLagayBonus}
            lagayMultiplier={game.lagayMultiplier}
            onOpenPrestige={() => setShowPrestigeModal(true)}
          />
        </div>
      </div>
    </div>
  );
}

export default App;
