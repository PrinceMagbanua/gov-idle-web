// ─── Number Formatting ────────────────────────────────────────────────────────

const SUFFIXES = [
  { value: 1e33, label: 'D' },
  { value: 1e30, label: 'N' },
  { value: 1e27, label: 'O' },
  { value: 1e24, label: 'Sp' },
  { value: 1e21, label: 'Sx' },
  { value: 1e18, label: 'Qt' },
  { value: 1e15, label: 'Q' },
  { value: 1e12, label: 'T' },
  { value: 1e9,  label: 'B' },
  { value: 1e6,  label: 'M' },
  { value: 1e3,  label: 'K' },
];

export function formatNumber(num) {
  const rounded = Math.round(num * 1e6) / 1e6;
  for (const { value, label } of SUFFIXES) {
    if (rounded >= value) {
      return (rounded / value).toFixed(3).replace(/\.?0+$/, '') + label;
    }
  }
  return Math.floor(rounded).toString();
}

export function formatMoney(num) {
  return '₱' + formatNumber(num);
}

export function formatCPS(num) {
  const rounded = Math.round(num * 1e6) / 1e6;
  if (rounded < 0.01) return '₱0.00/s';
  if (rounded < 1) return `₱${rounded.toFixed(2)}/s`;
  return `${formatMoney(rounded)}/s`;
}

// ─── Generator Cost Scaling ───────────────────────────────────────────────────

const PRICE_GROWTH = 1.15;

export function calculateGeneratorCost(baseCost, owned) {
  return Math.ceil(baseCost * Math.pow(PRICE_GROWTH, owned));
}

export function calculateUpgradeCost(baseCost, upgradeIndex) {
  return Math.floor(baseCost * 25 * Math.pow(PRICE_GROWTH, upgradeIndex));
}

export function calculateMultiBuyCost(baseCost, owned, qty, fatigueMultiplier = 1) {
  let total = 0;
  for (let i = 0; i < qty; i++) {
    total += Math.ceil(baseCost * Math.pow(PRICE_GROWTH, owned + i) * fatigueMultiplier);
  }
  return total;
}

export function calculateMaxAffordable(baseCost, owned, money, fatigueMultiplier = 1) {
  let total = 0;
  let qty = 0;
  while (qty < 10000) {
    const next = Math.ceil(baseCost * Math.pow(PRICE_GROWTH, owned + qty) * fatigueMultiplier);
    if (total + next > money) break;
    total += next;
    qty++;
  }
  return { qty, cost: total };
}

// ─── Corruption Fatigue ────────────────────────────────────────────────────────
// Generators index 6–11 become progressively more expensive after ₱100B
// lifetime earned when the player has never prestiged.

const FATIGUE_THRESHOLD = 1e11; // ₱100 Billion

export function calculateFatigueMultiplier(generatorIndex, prestigeCount, lifetimeEarned) {
  if (generatorIndex < 6) return 1;
  if (prestigeCount > 0) return 1;
  if (lifetimeEarned <= FATIGUE_THRESHOLD) return 1;
  const overage = lifetimeEarned / FATIGUE_THRESHOLD - 1;
  return 1 + overage * 0.5;
}

// ─── CPS Calculation ──────────────────────────────────────────────────────────

export function calculateGeneratorCPS(baseCPS, owned, modifierLevel) {
  return baseCPS * Math.pow(2, modifierLevel) * owned;
}

export function calculateTotalCPS(generators, GENERATORS, lagayMultiplier = 1, globalBonus = 0) {
  const baseCPS = generators.reduce((total, g, i) => {
    return total + calculateGeneratorCPS(GENERATORS[i].baseCPS, g.owned, g.modifierLevel);
  }, 0);
  return baseCPS * lagayMultiplier * (1 + globalBonus / 100);
}

// ─── Prestige / Lagay Multiplier ──────────────────────────────────────────────

export const PRESTIGE_THRESHOLD = 1e11; // ₱100 Billion per run

export function canPrestige(earnedSincePrestige) {
  return earnedSincePrestige >= PRESTIGE_THRESHOLD;
}

// +1× per ₱25B earned. Minimum +4× at threshold.
export function calculateLagayBonus(earnedSincePrestige) {
  if (earnedSincePrestige < PRESTIGE_THRESHOLD) return 0;
  return Math.max(4, Math.floor(earnedSincePrestige / 25_000_000_000));
}

// ─── Offline Earnings ─────────────────────────────────────────────────────────

const OFFLINE_RATE = 0.15;
const OFFLINE_MAX_SECONDS = 36000;

export function calculateOfflineEarnings(currentCPS, elapsedMs) {
  const seconds = Math.min(elapsedMs / 1000, OFFLINE_MAX_SECONDS);
  return currentCPS * seconds * OFFLINE_RATE;
}

// ─── Title System ─────────────────────────────────────────────────────────────

const TITLES = [
  { threshold: 1e15, title: 'The Architecture' },
  { threshold: 1e12, title: 'The System Itself' },
  { threshold: 1e9,  title: 'The Untouchable' },
  { threshold: 1e8,  title: "Ambassador to a Country That Doesn't Exist" },
  { threshold: 2e7,  title: 'Congressman with 3 Names' },
  { threshold: 5e6,  title: 'Senator Baby' },
  { threshold: 2e6,  title: 'POGO-Backed Politician' },
  { threshold: 5e5,  title: 'Artista Mayor' },
  { threshold: 1e5,  title: 'Honest Mayor' },
  { threshold: 5e4,  title: 'Vice Mayor with a Grudge' },
  { threshold: 1.5e4, title: 'Brgy. Captain with a Farm' },
  { threshold: 5e3,  title: 'Kagawad with a Sideline' },
  { threshold: 1e3,  title: 'Marites HOA President' },
  { threshold: 100,  title: 'Corrupt HOA Auditor' },
  { threshold: 0,    title: 'Desperate Intern' },
];

export function getTitle(lifetimeEarned) {
  for (const { threshold, title } of TITLES) {
    if (lifetimeEarned >= threshold) return title;
  }
  return 'Desperate Intern';
}

export function getPastTitles(lifetimeEarned) {
  return TITLES
    .filter(t => lifetimeEarned >= t.threshold)
    .map(t => t.title)
    .reverse()
    .slice(0, -1);
}
