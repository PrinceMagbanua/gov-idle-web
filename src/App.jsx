import { useState, useEffect, useRef } from 'react';
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
import { StatsPanel } from './components/StatsPanel';

function App() {
  const game = useGameState();
  const gradientRef = useRef(null);

  useEffect(() => {
    let mouseX = window.innerWidth / 2;
    let mouseY = window.innerHeight / 2;
    let cursorX = mouseX;
    let cursorY = mouseY;
    let rafId;

    const onMouseMove = (e) => {
      mouseX = e.clientX;
      mouseY = e.clientY;
    };

    const animate = () => {
      cursorX += (mouseX - cursorX) * 0.06;
      cursorY += (mouseY - cursorY) * 0.06;
      if (gradientRef.current) {
        gradientRef.current.style.left = cursorX + 'px';
        gradientRef.current.style.top = cursorY + 'px';
      }
      rafId = requestAnimationFrame(animate);
    };

    window.addEventListener('mousemove', onMouseMove);
    rafId = requestAnimationFrame(animate);
    return () => {
      window.removeEventListener('mousemove', onMouseMove);
      cancelAnimationFrame(rafId);
    };
  }, []);

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

  const clickAreaProps = {
    onClickFunds: game.handleClick,
    addBonusMoney: game.addBonusMoney,
    currentCPS: game.currentCPS,
    activityFeed,
  };

  const rightContent = (
    <>
      {/* Tab bar */}
      <div className="flex border-b border-white/[0.05] flex-shrink-0">
        {['generators', 'upgrades', 'stats'].map(t => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`px-5 py-3 text-sm font-medium capitalize transition-colors border-b-2 -mb-px ${
              tab === t
                ? 'border-teal-400 text-teal-300'
                : 'border-transparent text-slate-500 hover:text-slate-300'
            }`}
          >
            {t === 'generators' ? 'Generators' : t === 'upgrades' ? 'Upgrades' : 'Stats'}
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
            lifetimeEarned={game.lifetimeEarned}
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
        {tab === 'stats' && (
          <StatsPanel
            money={game.money}
            lifetimeEarned={game.lifetimeEarned}
            currentCPS={game.currentCPS}
            generators={game.generators}
            GENERATORS={game.GENERATORS}
            lagayMultiplier={game.lagayMultiplier}
            prestigeCount={game.prestigeCount}
            totalClicks={game.totalClicks}
            totalUpgradesPurchased={game.totalUpgradesPurchased}
            totalUpgradesSpent={game.totalUpgradesSpent}
            maxSingleClick={game.maxSingleClick}
            offlineCollectionCount={game.offlineCollectionCount}
            totalPlaytimeMs={game.totalPlaytimeMs}
          />
        )}
      </div>

      {/* Prestige bar */}
      <PrestigeBar
        earnedSincePrestige={game.earnedSincePrestige}
        prestigeReady={game.prestigeReady}
        nextLagayBonus={game.nextLagayBonus}
        lagayMultiplier={game.lagayMultiplier}
        onOpenPrestige={() => setShowPrestigeModal(true)}
      />
    </>
  );

  return (
    <div className="h-screen w-screen flex flex-col overflow-hidden" style={{ background: 'var(--nb)' }}>
      {/* Mouse-trailing gradient glow */}
      <div
        ref={gradientRef}
        className="fixed pointer-events-none"
        style={{
          width: 700,
          height: 700,
          borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(99,102,241,0.13) 0%, rgba(139,92,246,0.07) 45%, transparent 70%)',
          transform: 'translate(-50%, -50%)',
          zIndex: 0,
        }}
      />

      <Toaster position="top-right" theme="dark" />

      {/* Modals */}
      {game.pendingOfflineEarnings != null && (
        <OfflineEarningsModal
          amount={game.pendingOfflineEarnings.amount}
          elapsedMs={game.pendingOfflineEarnings.elapsedMs}
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

      {/* ── Desktop layout (md+) ── */}
      <div className="hidden md:flex flex-1 overflow-hidden">
        {/* Left panel — click area */}
        <div className="w-80 flex-shrink-0 border-r border-white/[0.05]">
          <ClickArea {...clickAreaProps} />
        </div>
        {/* Right panel */}
        <div className="flex-1 flex flex-col overflow-hidden">
          {rightContent}
        </div>
      </div>

      {/* ── Mobile layout (< md) ── */}
      <div className="flex md:hidden flex-1 flex-col overflow-hidden">
        {/* Content fills the middle */}
        <div className="flex-1 flex flex-col overflow-hidden">
          {rightContent}
        </div>
        {/* Button strip pinned at bottom — comfortable thumb zone */}
        <div className="flex-shrink-0 border-t border-white/[0.05]" style={{ background: 'var(--nb)' }}>
          <ClickArea {...clickAreaProps} compact />
        </div>
      </div>
    </div>
  );
}

export default App;
