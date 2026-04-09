import { useState, useEffect, useCallback, useRef } from 'react';
import { GENERATORS } from '../data/generators';
import { GENERATOR_UPGRADES, GLOBAL_UPGRADES } from '../data/upgrades';
import { ACHIEVEMENTS } from '../data/achievements';
import {
  calculateGeneratorCost,
  calculateUpgradeCost,
  calculateTotalCPS,
  calculateLagayBonus,
  canPrestige,
  calculateOfflineEarnings,
} from '../utils/calculations';

const SAVE_VERSION = 2;
const TICK_MS = 100;

// ─── Initial State ────────────────────────────────────────────────────────────

function buildInitialGenerators() {
  return GENERATORS.map(g => ({ id: g.id, owned: 0, modifierLevel: 0 }));
}

function buildInitialGeneratorUpgrades() {
  return Object.fromEntries(GENERATORS.map(g => [g.id, []])); // [] = list of purchased upgrade indices
}

function buildInitialGlobalUpgrades() {
  return Object.fromEntries(GLOBAL_UPGRADES.map(u => [u.id, false]));
}

function buildInitialAchievements() {
  return Object.fromEntries(ACHIEVEMENTS.map(a => [a.id, false]));
}

const INITIAL_STATE = {
  money: 0,
  generators: buildInitialGenerators(),
  generatorUpgrades: buildInitialGeneratorUpgrades(),
  globalUpgrades: buildInitialGlobalUpgrades(),
  achievements: buildInitialAchievements(),
  // Prestige
  prestigeCount: 0,
  lagayMultiplier: 1,
  lifetimeEarned: 0,
  // Click
  clickMultiplier: 1,
  // Tracking (for achievements)
  totalClicks: 0,
  totalUpgradesPurchased: 0,
  totalUpgradesSpent: 0,
  maxSingleClick: 0,
  offlineCollectionCount: 0,
  totalPlaytimeMs: 0,
  lastSavedTimestamp: Date.now(),
};

// ─── Save / Load ──────────────────────────────────────────────────────────────

const SAVE_KEY = 'govIdleGameState';

function loadState() {
  try {
    const raw = localStorage.getItem(SAVE_KEY);
    if (!raw) return null;
    const saved = JSON.parse(raw);
    if (saved.saveVersion !== SAVE_VERSION) return null; // wipe old saves
    return saved;
  } catch {
    return null;
  }
}

function saveState(state) {
  try {
    localStorage.setItem(SAVE_KEY, JSON.stringify({ ...state, saveVersion: SAVE_VERSION }));
  } catch {
    // Storage full or private mode — fail silently
  }
}

// ─── Achievement Checking ─────────────────────────────────────────────────────

function checkAchievements(state, currentAchievements) {
  let changed = false;
  const updated = { ...currentAchievements };

  for (const def of ACHIEVEMENTS) {
    if (updated[def.id] || !def.condition) continue;
    if (def.condition(state)) {
      updated[def.id] = true;
      changed = true;
    }
  }

  return changed ? updated : currentAchievements;
}

// ─── Hook ─────────────────────────────────────────────────────────────────────

export function useGameState() {
  const loaded = loadState();

  const [money, setMoney] = useState(loaded?.money ?? INITIAL_STATE.money);
  const [generators, setGenerators] = useState(loaded?.generators ?? INITIAL_STATE.generators);
  const [generatorUpgrades, setGeneratorUpgrades] = useState(loaded?.generatorUpgrades ?? INITIAL_STATE.generatorUpgrades);
  const [globalUpgrades, setGlobalUpgrades] = useState(loaded?.globalUpgrades ?? INITIAL_STATE.globalUpgrades);
  const [achievements, setAchievements] = useState(loaded?.achievements ?? INITIAL_STATE.achievements);
  const [prestigeCount, setPrestigeCount] = useState(loaded?.prestigeCount ?? 0);
  const [lagayMultiplier, setLagayMultiplier] = useState(loaded?.lagayMultiplier ?? 1);
  const [lifetimeEarned, setLifetimeEarned] = useState(loaded?.lifetimeEarned ?? 0);
  const [clickMultiplier] = useState(loaded?.clickMultiplier ?? 1);
  const [totalClicks, setTotalClicks] = useState(loaded?.totalClicks ?? 0);
  const [totalUpgradesPurchased, setTotalUpgradesPurchased] = useState(loaded?.totalUpgradesPurchased ?? 0);
  const [totalUpgradesSpent, setTotalUpgradesSpent] = useState(loaded?.totalUpgradesSpent ?? 0);
  const [maxSingleClick, setMaxSingleClick] = useState(loaded?.maxSingleClick ?? 0);
  const [offlineCollectionCount, setOfflineCollectionCount] = useState(loaded?.offlineCollectionCount ?? 0);
  const [totalPlaytimeMs, setTotalPlaytimeMs] = useState(loaded?.totalPlaytimeMs ?? 0);

  // Offline earnings pending display (null = no modal)
  const [pendingOfflineEarnings, setPendingOfflineEarnings] = useState(null);

  // ── Refs for stable interval closures ───────────────────────────────────────
  const moneyRef = useRef(money);
  const generatorsRef = useRef(generators);
  const lagayMultiplierRef = useRef(lagayMultiplier);
  const globalUpgradesRef = useRef(globalUpgrades);
  const lifetimeEarnedRef = useRef(lifetimeEarned);

  useEffect(() => { moneyRef.current = money; }, [money]);
  useEffect(() => { generatorsRef.current = generators; }, [generators]);
  useEffect(() => { lagayMultiplierRef.current = lagayMultiplier; }, [lagayMultiplier]);
  useEffect(() => { globalUpgradesRef.current = globalUpgrades; }, [globalUpgrades]);
  useEffect(() => { lifetimeEarnedRef.current = lifetimeEarned; }, [lifetimeEarned]);

  // ── Offline earnings on mount ────────────────────────────────────────────────
  useEffect(() => {
    if (!loaded) return;
    const elapsed = Date.now() - (loaded.lastSavedTimestamp ?? Date.now());
    if (elapsed < 60000) return; // less than 60s — not worth showing

    const cps = calculateTotalCPS(
      loaded.generators,
      GENERATORS,
      loaded.lagayMultiplier ?? 1,
      getGlobalBonus(loaded.globalUpgrades ?? INITIAL_STATE.globalUpgrades)
    );
    const earned = calculateOfflineEarnings(cps, elapsed);
    if (earned > 0) {
      setMoney(prev => prev + earned);
      setLifetimeEarned(prev => prev + earned);
      setPendingOfflineEarnings(earned);
      setOfflineCollectionCount(prev => prev + 1);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ── Passive income loop ──────────────────────────────────────────────────────
  useEffect(() => {
    const interval = setInterval(() => {
      const bonus = getGlobalBonus(globalUpgradesRef.current);
      const cps = calculateTotalCPS(generatorsRef.current, GENERATORS, lagayMultiplierRef.current, bonus);
      if (cps > 0) {
        const tick = (cps / 1000) * TICK_MS;
        setMoney(prev => prev + tick);
        setLifetimeEarned(prev => prev + tick);
      }
    }, TICK_MS);
    return () => clearInterval(interval);
  }, []);

  // ── Playtime tracking ────────────────────────────────────────────────────────
  useEffect(() => {
    const interval = setInterval(() => {
      setTotalPlaytimeMs(prev => prev + 10000);
    }, 10000);
    return () => clearInterval(interval);
  }, []);

  // ── Auto-save ────────────────────────────────────────────────────────────────
  useEffect(() => {
    const interval = setInterval(() => {
      saveState({
        money: moneyRef.current,
        generators: generatorsRef.current,
        generatorUpgrades,
        globalUpgrades: globalUpgradesRef.current,
        achievements,
        prestigeCount,
        lagayMultiplier: lagayMultiplierRef.current,
        lifetimeEarned: lifetimeEarnedRef.current,
        clickMultiplier,
        totalClicks,
        totalUpgradesPurchased,
        totalUpgradesSpent,
        maxSingleClick,
        offlineCollectionCount,
        totalPlaytimeMs,
        lastSavedTimestamp: Date.now(),
      });
    }, 5000);
    return () => clearInterval(interval);
  }, [
    generatorUpgrades, globalUpgrades, achievements,
    prestigeCount, clickMultiplier, totalClicks,
    totalUpgradesPurchased, totalUpgradesSpent,
    maxSingleClick, offlineCollectionCount, totalPlaytimeMs,
  ]);

  // ── Achievement checking ─────────────────────────────────────────────────────
  useEffect(() => {
    const state = buildAchievementState();
    setAchievements(prev => checkAchievements(state, prev));
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [money, generators, lifetimeEarned, prestigeCount, totalClicks, totalUpgradesPurchased, totalUpgradesSpent, maxSingleClick, offlineCollectionCount, totalPlaytimeMs, lagayMultiplier]);

  // ── Helpers ──────────────────────────────────────────────────────────────────

  function getGlobalBonus(gUpgrades) {
    return GLOBAL_UPGRADES.reduce((sum, u) => {
      return sum + (gUpgrades[u.id] ? u.bonusPercent : 0);
    }, 0);
  }

  function buildAchievementState() {
    return {
      money,
      lifetimeEarned,
      generators,
      prestigeCount,
      totalClicks,
      totalUpgradesPurchased,
      totalUpgradesSpent,
      maxSingleClick,
      offlineCollectionCount,
      totalPlaytimeMs,
      lagayMultiplier,
    };
  }

  function getCurrentCPS() {
    return calculateTotalCPS(generators, GENERATORS, lagayMultiplier, getGlobalBonus(globalUpgrades));
  }

  function canAfford(cost) {
    return money >= cost;
  }

  // ── Actions ──────────────────────────────────────────────────────────────────

  const handleClick = useCallback(() => {
    const gained = Math.max(1, getCurrentCPS() * 0.01) * clickMultiplier;
    setMoney(prev => prev + gained);
    setLifetimeEarned(prev => prev + gained);
    setTotalClicks(prev => prev + 1);
    setMaxSingleClick(prev => Math.max(prev, gained));
    return gained;
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [clickMultiplier, generators, lagayMultiplier, globalUpgrades]);

  const buyGenerator = useCallback((generatorId) => {
    const idx = generators.findIndex(g => g.id === generatorId);
    if (idx === -1) return false;

    const cost = calculateGeneratorCost(GENERATORS[idx].baseCost, generators[idx].owned);
    if (!canAfford(cost)) return false;

    setMoney(prev => prev - cost);
    setGenerators(prev => {
      const updated = [...prev];
      updated[idx] = { ...updated[idx], owned: updated[idx].owned + 1 };
      return updated;
    });
    return true;
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [generators, money]);

  const buyGeneratorUpgrade = useCallback((generatorId, upgradeIndex) => {
    const genIdx = GENERATORS.findIndex(g => g.id === generatorId);
    if (genIdx === -1) return false;

    const alreadyPurchased = (generatorUpgrades[generatorId] ?? []).includes(upgradeIndex);
    if (alreadyPurchased) return false;

    const cost = calculateUpgradeCost(GENERATORS[genIdx].baseCost, upgradeIndex);
    if (!canAfford(cost)) return false;

    setMoney(prev => prev - cost);
    setGeneratorUpgrades(prev => ({
      ...prev,
      [generatorId]: [...(prev[generatorId] ?? []), upgradeIndex],
    }));
    setGenerators(prev => {
      const updated = [...prev];
      updated[genIdx] = { ...updated[genIdx], modifierLevel: updated[genIdx].modifierLevel + 1 };
      return updated;
    });
    setTotalUpgradesPurchased(prev => prev + 1);
    setTotalUpgradesSpent(prev => prev + cost);
    return true;
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [generatorUpgrades, generators, money]);

  const buyGlobalUpgrade = useCallback((upgradeId) => {
    const def = GLOBAL_UPGRADES.find(u => u.id === upgradeId);
    if (!def || globalUpgrades[upgradeId]) return false;
    if (!canAfford(def.cost)) return false;

    setMoney(prev => prev - def.cost);
    setGlobalUpgrades(prev => ({ ...prev, [upgradeId]: true }));
    setTotalUpgradesPurchased(prev => prev + 1);
    setTotalUpgradesSpent(prev => prev + def.cost);
    return true;
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [globalUpgrades, money]);

  const acceptImpeachment = useCallback(() => {
    if (!canPrestige(lifetimeEarned)) return false;

    const bonus = calculateLagayBonus(lifetimeEarned);
    const newMultiplier = lagayMultiplier + bonus;

    // Check prestige-specific achievements before reset
    setAchievements(prev => {
      const next = { ...prev };
      if (bonus >= 5) next['patient_investor'] = true;
      if (bonus === 1) next['went_early'] = true;
      return next;
    });

    // Reset run state
    setMoney(0);
    setGenerators(buildInitialGenerators());
    setGeneratorUpgrades(buildInitialGeneratorUpgrades());
    setGlobalUpgrades(buildInitialGlobalUpgrades());
    setLagayMultiplier(newMultiplier);
    setPrestigeCount(prev => prev + 1);

    return { bonus, newMultiplier };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [lifetimeEarned, lagayMultiplier]);

  const addBonusMoney = useCallback((amount) => {
    setMoney(prev => prev + amount);
    setLifetimeEarned(prev => prev + amount);
    setMaxSingleClick(prev => Math.max(prev, amount));
  }, []);

  const dismissOfflineEarnings = useCallback(() => {
    setPendingOfflineEarnings(null);
  }, []);

  // ── Derived values ───────────────────────────────────────────────────────────

  const currentCPS = getCurrentCPS();
  const globalBonus = getGlobalBonus(globalUpgrades);
  const prestigeReady = canPrestige(lifetimeEarned);
  const nextLagayBonus = calculateLagayBonus(lifetimeEarned);

  return {
    // State
    money,
    generators,
    generatorUpgrades,
    globalUpgrades,
    achievements,
    prestigeCount,
    lagayMultiplier,
    lifetimeEarned,
    clickMultiplier,
    totalClicks,
    totalUpgradesPurchased,
    totalUpgradesSpent,
    maxSingleClick,
    offlineCollectionCount,
    totalPlaytimeMs,
    // Derived
    currentCPS,
    globalBonus,
    prestigeReady,
    nextLagayBonus,
    // UI state
    pendingOfflineEarnings,
    // Actions
    handleClick,
    addBonusMoney,
    buyGenerator,
    buyGeneratorUpgrade,
    buyGlobalUpgrade,
    acceptImpeachment,
    dismissOfflineEarnings,
    // Static data refs (for components to use without re-importing)
    GENERATORS,
    GENERATOR_UPGRADES,
    GLOBAL_UPGRADES,
  };
}
