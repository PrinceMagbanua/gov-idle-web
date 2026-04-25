import { useState, useEffect, useRef } from 'react';
import { Toaster } from 'sonner';
import { useGameState } from './hooks/useGameState';
import { useAchievementNotifications } from './hooks/useAchievementNotifications';
import { PRESTIGE_THRESHOLD } from './utils/calculations';
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

  const [tab, setTab] = useState('employees');
  const [buyRate, setBuyRate] = useState(1);
  const [showAchievements, setShowAchievements] = useState(false);
  const [showPrestigeModal, setShowPrestigeModal] = useState(false);
  const [activityFeed, setActivityFeed] = useState([]);

  useAchievementNotifications(game.achievements);

  const handleBuyGenerator = (generatorId) => {
    const result = game.buyGenerator(generatorId, buyRate);
    if (result) {
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

  const TAB_LABELS = { employees: 'Employees', upgrades: 'Upgrades', stats: 'Stats' };

  const rightContent = (
    <>
      {/* Tab bar */}
      <div className="flex border-b border-white/[0.05] flex-shrink-0">
        {Object.entries(TAB_LABELS).map(([key, label]) => (
          <button
            key={key}
            onClick={() => setTab(key)}
            className={`px-5 py-3 text-sm font-medium capitalize transition-colors border-b-2 -mb-px ${
              tab === key
                ? 'border-teal-400 text-teal-300'
                : 'border-transparent text-slate-500 hover:text-slate-300'
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      {/* Scrollable content */}
      <div className="flex-1 overflow-y-auto">
        {tab === 'employees' && (
          <GeneratorList
            generators={game.generators}
            generatorUpgrades={game.generatorUpgrades}
            money={game.money}
            lifetimeEarned={game.lifetimeEarned}
            prestigeCount={game.prestigeCount}
            cpsMultiplier={game.lagayMultiplier * (1 + game.globalBonus / 100)}
            buyRate={buyRate}
            setBuyRate={setBuyRate}
            onBuyGenerator={handleBuyGenerator}
            onBuyGeneratorUpgrade={game.buyGeneratorUpgrade}
            GENERATORS={game.GENERATORS}
          />
        )}
        {tab === 'upgrades' && (
          <GlobalUpgradeList
            globalUpgrades={game.globalUpgrades}
            money={game.money}
            lifetimeEarned={game.lifetimeEarned}
            generators={game.generators}
            prestigeCount={game.prestigeCount}
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

      {/* Prestige bar — desktop only */}
      <div className="hidden md:block">
        <PrestigeBar
          earnedSincePrestige={game.earnedSincePrestige}
          prestigeReady={game.prestigeReady}
          nextLagayBonus={game.nextLagayBonus}
          lagayMultiplier={game.lagayMultiplier}
          onOpenPrestige={() => setShowPrestigeModal(true)}
        />
      </div>
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
        <div className="w-80 flex-shrink-0 border-r border-white/[0.05]">
          <ClickArea {...clickAreaProps} />
        </div>
        <div className="flex-1 flex flex-col overflow-hidden">
          {rightContent}
        </div>
      </div>

      {/* ── Mobile layout (< md) ── */}
      <div className="flex md:hidden flex-1 flex-col overflow-hidden relative">
        <div className="flex-1 flex flex-col overflow-hidden">
          {rightContent}
        </div>

        {/* Mobile prestige FAB */}
        {(() => {
          const pct = Math.min((game.earnedSincePrestige / PRESTIGE_THRESHOLD) * 100, 100).toFixed(0);
          return game.prestigeReady ? (
            <button
              onClick={() => setShowPrestigeModal(true)}
              className="absolute right-3 bottom-20 z-20 px-3 py-1.5 rounded-full text-xs font-bold text-white"
              style={{
                background: '#be123c',
                boxShadow: '0 0 18px rgba(190,18,60,0.55)',
                animation: 'pulse 1.5s ease-in-out infinite',
              }}
            >
              ⚖️ Impeach +{game.nextLagayBonus}×
            </button>
          ) : pct > 0 ? (
            <div
              className="absolute right-3 bottom-20 z-20 px-2.5 py-1 rounded-full text-xs text-slate-500"
              style={{ background: 'var(--nb)', border: '1px solid rgba(255,255,255,0.06)' }}
            >
              ⚖️ {pct}%
            </div>
          ) : null;
        })()}

        {/* Button strip pinned at bottom */}
        <div className="flex-shrink-0 border-t border-white/[0.05]" style={{ background: 'var(--nb)' }}>
          <ClickArea {...clickAreaProps} compact />
        </div>
      </div>
    </div>
  );
}

export default App;
