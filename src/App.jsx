import { useEffect, useState } from 'react';
import { Toaster } from 'sonner';
import { useGameState } from './hooks/useGameState';
import { useAchievementNotifications } from './hooks/useAchievementNotifications';
import { TopBar } from './components/TopBar';
import { ClickArea } from './components/ClickArea';
import { ProjectList } from './components/ProjectList';
import { UpgradeList } from './components/UpgradeList';
import { ClickUpgradeList } from './components/ClickUpgradeList';

function App() {
  const gameState = useGameState();
  const [ips, setIps] = useState(0);
  const [isMobile, setIsMobile] = useState(window.innerWidth < 1024);
  const [unlockedAchievements, setUnlockedAchievements] = useState(new Set());

  // Track achievements
  useEffect(() => {
    const newUnlocked = new Set(unlockedAchievements);
    let changed = false;

    gameState.achievements.forEach(achievement => {
      if (!achievement.unlocked) {
        // Check if achievement should unlock
        let shouldUnlock = false;

        if (achievement.moneyThreshold && gameState.money >= achievement.moneyThreshold) {
          shouldUnlock = true;
        } else if (achievement.id === 'first_project' && gameState.projects.some(p => p.owned > 0)) {
          shouldUnlock = true;
        } else if (achievement.id === 'ten_projects' && gameState.projects.reduce((sum, p) => sum + p.owned, 0) >= 10) {
          shouldUnlock = true;
        } else if (achievement.id === 'first_upgrade' && gameState.upgrades.some(u => u.purchased)) {
          shouldUnlock = true;
        } else if (achievement.id === 'first_click' && gameState.clickUpgrades.some(u => u.purchased)) {
          shouldUnlock = true;
        }

        if (shouldUnlock && !newUnlocked.has(achievement.id)) {
          newUnlocked.add(achievement.id);
          changed = true;
        }
      }
    });

    if (changed) {
      setUnlockedAchievements(newUnlocked);
      // Update achievements in gameState (trigger toast)
      const updatedAchievements = gameState.achievements.map(a => 
        newUnlocked.has(a.id) ? { ...a, unlocked: true } : a
      );
      // Note: This won't cause infinite loop because we're just showing toasts
      useAchievementNotifications(updatedAchievements);
    }
  }, [gameState.money, gameState.projects, gameState.upgrades, gameState.clickUpgrades]);

  // Call achievement notification hook
  useAchievementNotifications(gameState.achievements);

  // Update IPS display whenever projects or multiplier changes
  useEffect(() => {
    setIps(gameState.getTotalIPS());
  }, [gameState.getTotalIPS, gameState.projects, gameState.globalMultiplier]);

  // Handle window resize for responsive layout
  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 1024);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return (
    <div className="h-screen w-screen flex flex-col bg-slate-900">
      <Toaster position="top-right" theme="dark" />
      <TopBar money={gameState.money} ips={ips} />
      
      <div className="flex flex-1 overflow-hidden gap-0">
        {/* Left side - Click Area */}
        <div className="flex-1 min-w-0 md:min-w-96">
          <ClickArea
            money={gameState.money}
            onClickFunds={gameState.handleClick}
          />
        </div>

        {/* Right side - Shop Panels */}
        <div className={`flex ${isMobile ? 'flex-col' : 'flex-row'} border-l border-slate-700 overflow-hidden`}>
          {/* Projects */}
          <div className={`${isMobile ? 'w-full' : 'w-80'} border-b md:border-b-0 md:border-r border-slate-700 min-w-0`}>
            <ProjectList
              projects={gameState.projects}
              money={gameState.money}
              costScaleMultiplier={gameState.costScaleMultiplier}
              globalMultiplier={gameState.globalMultiplier}
              onBuyProject={gameState.buyProject}
            />
          </div>

          {/* Upgrades */}
          <div className={`${isMobile ? 'w-full' : 'w-80'} border-b md:border-b-0 md:border-r border-slate-700 min-w-0`}>
            <UpgradeList
              upgrades={gameState.upgrades}
              money={gameState.money}
              onBuyUpgrade={gameState.buyUpgrade}
            />
          </div>

          {/* Click Upgrades */}
          <div className={`${isMobile ? 'w-full' : 'w-80'} min-w-0`}>
            <ClickUpgradeList
              clickUpgrades={gameState.clickUpgrades}
              money={gameState.money}
              onBuyClickUpgrade={gameState.buyClickUpgrade}
            />
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;
