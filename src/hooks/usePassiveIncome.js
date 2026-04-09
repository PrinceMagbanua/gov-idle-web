import { useState, useEffect } from 'react';

export function usePassiveIncome(gameState) {
  const { getTotalIPS, money } = gameState;

  useEffect(() => {
    const interval = setInterval(() => {
      const ips = getTotalIPS();
      if (ips > 0) {
        // Tick every 100ms, so divide IPS by 10
        const tickAmount = ips / 10;
        // We need to access the latest money value, so we'll update through a callback
        gameState.setMoneyDirect?.(prev => prev + tickAmount);
      }
    }, 100);

    return () => clearInterval(interval);
  }, [getTotalIPS, gameState]);
}
