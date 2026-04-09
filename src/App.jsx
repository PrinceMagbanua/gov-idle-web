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
