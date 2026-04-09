import { useState, useEffect, useCallback, useRef } from 'react';
import { calculateTotalIPS, calculateProjectCost } from '../utils/calculations';

const INITIAL_PROJECTS = [
  { id: 'public', name: 'Small Claims Bureau', baseCost: 15, incomePerSecond: 0.1, owned: 0, description: 'Where legal disputes go to die slowly' },
  { id: 'infrastructure', name: 'Reconstruct the Highway', baseCost: 100, incomePerSecond: 1, owned: 0, description: 'The same road, broken and rebuilt infinitely' },
  { id: 'ghost', name: 'Ghost Project', baseCost: 1200, incomePerSecond: 15, owned: 0, description: 'Exists only in spreadsheets and offshore accounts' },
  { id: 'ghostemployee', name: 'Ghost Employee', baseCost: 800, incomePerSecond: 8, owned: 0, description: 'Phantom assistant with excellent productivity' },
  { id: 'luxury', name: 'Luxury Office Complex', baseCost: 3000, incomePerSecond: 5, owned: 0, description: 'Gold toilets aren\'t cheap, but they impress no one' },
  { id: 'committee', name: 'Committee Study Initiative', baseCost: 150, incomePerSecond: 0.2, owned: 0, description: 'Pay experts to debate if anything should happen' },
  { id: 'auditdelay', name: 'Equipment Audit Delay', baseCost: 4500, incomePerSecond: 2, owned: 0, description: 'Paperwork so thick, nobody finds the money trail' },
  { id: 'bidding', name: 'Contractor Bidding Loop', baseCost: 7000, incomePerSecond: 4.2, owned: 0, description: 'Release tenders, extend deadlines, repeat forever' },
  { id: 'feasibility', name: 'Feasibility Report Farm', baseCost: 600, incomePerSecond: 1.2, owned: 0, description: 'Hire consultants to study whether studying is feasible' },
  { id: 'compliance', name: 'Compliance Task Force', baseCost: 1800, incomePerSecond: 2.8, owned: 0, description: 'An agency that audits other agencies auditing agencies' },
  { id: 'road', name: 'Build a New Road', baseCost: 5000, incomePerSecond: 1.8, owned: 0, description: 'Build a road that conveniently passes through your subdivision', prerequisite: 'subdivisions' },
];

const INITIAL_CLICK_UPGRADES = [
  { id: 'aggressive', name: 'Aggressive Negotiation', cost: 200, type: 'click', effect: 1.3, purchased: false, description: 'Shout louder and faster at keyboards' },
  { id: 'speedprocessing', name: 'Speed Processing', cost: 150, type: 'click', effect: 1.2, purchased: false, description: 'Skip reading emails, just approve everything' },
  { id: 'rubstamp', name: 'Rubber Stamp Authority', cost: 450, type: 'click', effect: 2, purchased: false, description: 'Your signature means nothing, but it works' },
  { id: 'panic', name: 'Panic Decision Making', cost: 800, type: 'click', effect: 2.5, purchased: false, description: 'Hasty decisions get things done... somewhere' },
];

const INITIAL_UPGRADES = [
  { id: 'consultancy', name: 'Endless Study', cost: 100, type: 'multiplier', effect: 1.5, purchased: false, description: 'Hire consultants to investigate for the next 5 years' },
  { id: 'nepotism', name: 'Appoint a Relative', cost: 350, type: 'multiplier', effect: 1.4, purchased: false, description: 'Give a cushy position to your family' },
  { id: 'overpriced', name: 'Contractor Markup Scheme', cost: 500, type: 'multiplier', effect: 2, purchased: false, description: 'Inflate costs when nobody\'s looking' },
  { id: 'fastapproval', name: 'Jump the Queue', cost: 250, type: 'scale', effect: 1.1, purchased: false, description: 'Pay someone to skip the bureaucratic line' },
  { id: 'subdivisions', name: 'Create a Subdivision', cost: 8000, type: 'multiplier', effect: 2.5, purchased: false, description: 'Carve out new territory to exploit' },
  { id: 'audit', name: 'Bribe the Bureau', cost: 1500, type: 'multiplier', effect: 3, purchased: false, description: 'Auditors somehow forget to check your paperwork' },
  { id: 'optimize', name: 'Process Optimization Board', cost: 50000, type: 'scale', effect: 1.12, purchased: false, description: 'Streamline chaos into slightly less chaotic chaos' },
];

const INITIAL_ACHIEVEMENTS = [
  { id: 'first_thousand', name: '💰 First Grand', description: 'Earned your first $1,000', moneyThreshold: 1000, unlocked: false },
  { id: 'first_tenmk', name: '💵 Big Spender', description: 'Earned $10,000', moneyThreshold: 10000, unlocked: false },
  { id: 'first_million', name: '💎 Millionaire', description: 'Reached $1,000,000', moneyThreshold: 1000000, unlocked: false },
  { id: 'first_billion', name: '🤑 Billionaire', description: 'Reached $1,000,000,000', moneyThreshold: 1000000000, unlocked: false },
  { id: 'first_project', name: '🏗️ Project Starter', description: 'Bought your first project', type: 'first_project', unlocked: false },
  { id: 'ten_projects', name: '🏢 Builder', description: 'Bought 10 projects total', type: 'projects_total', threshold: 10, unlocked: false },
  { id: 'first_upgrade', name: '⚡ Enhanced', description: 'Bought your first multiplier upgrade', type: 'first_upgrade', unlocked: false },
  { id: 'first_click', name: '🖱️ Power User', description: 'Bought your first click upgrade', type: 'first_click', unlocked: false },
];

export function useGameState() {
  const [money, setMoney] = useState(0);
  const [projects, setProjects] = useState(INITIAL_PROJECTS);
  const [upgrades, setUpgrades] = useState(INITIAL_UPGRADES);
  const [clickUpgrades, setClickUpgrades] = useState(INITIAL_CLICK_UPGRADES);
  const [achievements, setAchievements] = useState(INITIAL_ACHIEVEMENTS);
  const [globalMultiplier, setGlobalMultiplier] = useState(1);
  const [costScaleMultiplier, setCostScaleMultiplier] = useState(1.15);
  const [clickMultiplier, setClickMultiplier] = useState(1);

  // Refs to maintain current values for the interval
  const moneyRef = useRef(money);
  const projectsRef = useRef(projects);
  const globalMultiplierRef = useRef(globalMultiplier);

  // Keep refs in sync
  useEffect(() => {
    moneyRef.current = money;
  }, [money]);

  useEffect(() => {
    projectsRef.current = projects;
  }, [projects]);

  useEffect(() => {
    globalMultiplierRef.current = globalMultiplier;
  }, [globalMultiplier]);

  // Load from localStorage on mount
  useEffect(() => {
    const saved = localStorage.getItem('govIdleGameState');
    if (saved) {
      try {
        const state = JSON.parse(saved);
        setMoney(state.money || 0);
        setProjects(state.projects || INITIAL_PROJECTS);
        setUpgrades(state.upgrades || INITIAL_UPGRADES);
        setClickUpgrades(state.clickUpgrades || INITIAL_CLICK_UPGRADES);
        setGlobalMultiplier(state.globalMultiplier || 1);
        setCostScaleMultiplier(state.costScaleMultiplier || 1.15);
        setClickMultiplier(state.clickMultiplier || 1);
      } catch (e) {
        console.error('Failed to load state from localStorage', e);
      }
    }
  }, []);

  // Save to localStorage whenever state changes
  useEffect(() => {
    localStorage.setItem('govIdleGameState', JSON.stringify({
      money,
      projects,
      upgrades,
      clickUpgrades,
      globalMultiplier,
      costScaleMultiplier,
      clickMultiplier,
    }));
  }, [money, projects, upgrades, clickUpgrades, globalMultiplier, costScaleMultiplier, clickMultiplier]);

  // Passive income loop
  useEffect(() => {
    const interval = setInterval(() => {
      const ips = calculateTotalIPS(projectsRef.current, globalMultiplierRef.current);
      if (ips > 0) {
        const tickAmount = ips / 10; // 100ms ticks
        setMoney(prev => prev + tickAmount);
      }
    }, 100);

    return () => clearInterval(interval);
  }, []);

  const getTotalIPS = useCallback(() => {
    return calculateTotalIPS(projects, globalMultiplier);
  }, [projects, globalMultiplier]);

  const handleClick = useCallback((amount = 1) => {
    setMoney(prev => prev + (amount * clickMultiplier));
  }, [clickMultiplier]);

  const buyProject = useCallback((projectId) => {
    const projectIndex = projects.findIndex(p => p.id === projectId);
    if (projectIndex === -1) return false;

    const project = projects[projectIndex];
    const cost = calculateProjectCost(project.baseCost, project.owned, costScaleMultiplier);

    if (money < cost) return false;

    setMoney(prev => prev - cost);
    setProjects(prev => {
      const updated = [...prev];
      updated[projectIndex] = { ...updated[projectIndex], owned: updated[projectIndex].owned + 1 };
      return updated;
    });

    return true;
  }, [projects, money, costScaleMultiplier]);

  const buyUpgrade = useCallback((upgradeId) => {
    const upgradeIndex = upgrades.findIndex(u => u.id === upgradeId);
    if (upgradeIndex === -1) return false;

    const upgrade = upgrades[upgradeIndex];
    if (upgrade.purchased || money < upgrade.cost) return false;

    setMoney(prev => prev - upgrade.cost);
    setUpgrades(prev => {
      const updated = [...prev];
      updated[upgradeIndex] = { ...updated[upgradeIndex], purchased: true };
      return updated;
    });

    if (upgrade.type === 'multiplier') {
      setGlobalMultiplier(prev => prev * upgrade.effect);
    } else if (upgrade.type === 'scale') {
      setCostScaleMultiplier(upgrade.effect);
    }

    return true;
  }, [upgrades, money]);

  const buyClickUpgrade = useCallback((upgradeId) => {
    const upgradeIndex = clickUpgrades.findIndex(u => u.id === upgradeId);
    if (upgradeIndex === -1) return false;

    const upgrade = clickUpgrades[upgradeIndex];
    if (upgrade.purchased || money < upgrade.cost) return false;

    setMoney(prev => prev - upgrade.cost);
    setClickUpgrades(prev => {
      const updated = [...prev];
      updated[upgradeIndex] = { ...updated[upgradeIndex], purchased: true };
      return updated;
    });

    setClickMultiplier(prev => prev * upgrade.effect);
    return true;
  }, [clickUpgrades, money]);

  return {
    money,
    projects,
    upgrades,
    clickUpgrades,
    clickMultiplier,
    achievements,
    globalMultiplier,
    costScaleMultiplier,
    getTotalIPS,
    handleClick,
    buyProject,
    buyUpgrade,
    buyClickUpgrade,
  };
}
