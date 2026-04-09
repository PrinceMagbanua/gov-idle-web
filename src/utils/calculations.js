// ─── Number Formatting ────────────────────────────────────────────────────────

const SUFFIXES = [
  { value: 1e33, label: 'D' },   // Decillion
  { value: 1e30, label: 'N' },   // Nonillion
  { value: 1e27, label: 'O' },   // Octillion
  { value: 1e24, label: 'Sp' },  // Septillion
  { value: 1e21, label: 'Sx' },  // Sextillion
  { value: 1e18, label: 'Qt' },  // Quintillion
  { value: 1e15, label: 'Q' },   // Quadrillion
  { value: 1e12, label: 'T' },   // Trillion
  { value: 1e9,  label: 'B' },   // Billion
  { value: 1e6,  label: 'M' },   // Million
  { value: 1e3,  label: 'K' },   // Thousand
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

/** Cost to buy the next unit of a generator tier.
 *  @param {number} baseCost - base cost from GENERATORS data
 *  @param {number} owned    - how many of this tier the player currently owns
 */
export function calculateGeneratorCost(baseCost, owned) {
  return Math.ceil(baseCost * Math.pow(PRICE_GROWTH, owned));
}

/** Cost of the nth upgrade for a given tier (0-indexed).
 *  @param {number} baseCost      - base cost of the generator tier
 *  @param {number} upgradeIndex  - 0 = first upgrade, 7 = last
 */
export function calculateUpgradeCost(baseCost, upgradeIndex) {
  return Math.floor(baseCost * 25 * Math.pow(PRICE_GROWTH, upgradeIndex));
}

// ─── CPS Calculation ──────────────────────────────────────────────────────────

/**
 * CPS for a single generator tier.
 *  baseCPS × (2 ^ modifierLevel) × owned
 *
 * @param {number} baseCPS       - base CPS from GENERATORS data
 * @param {number} owned         - units owned
 * @param {number} modifierLevel - how many upgrades purchased for this tier
 */
export function calculateGeneratorCPS(baseCPS, owned, modifierLevel) {
  return baseCPS * Math.pow(2, modifierLevel) * owned;
}

/**
 * Total CPS across all generators.
 *
 * @param {Array}  generators      - array of { id, owned, modifierLevel } matching GENERATORS order
 * @param {Array}  GENERATORS      - static generator definitions
 * @param {number} lagayMultiplier - prestige multiplier (starts at 1)
 * @param {number} globalBonus     - additive % from global upgrades (e.g. 35 = +35%)
 */
export function calculateTotalCPS(generators, GENERATORS, lagayMultiplier = 1, globalBonus = 0) {
  const baseCPS = generators.reduce((total, g, i) => {
    return total + calculateGeneratorCPS(GENERATORS[i].baseCPS, g.owned, g.modifierLevel);
  }, 0);
  return baseCPS * lagayMultiplier * (1 + globalBonus / 100);
}

// ─── Prestige / Lagay Multiplier ──────────────────────────────────────────────

const PRESTIGE_THRESHOLD = 1e12; // ₱1 Trillion lifetime earned

export function canPrestige(lifetimeEarned) {
  return lifetimeEarned >= PRESTIGE_THRESHOLD;
}

/**
 * Lagay bonus earned at prestige.
 * bonus = floor(log10(lifetimeEarned)) - 11
 * Min of +1, so pressing the button at exactly ₱1T gives +1.
 */
export function calculateLagayBonus(lifetimeEarned) {
  if (lifetimeEarned < PRESTIGE_THRESHOLD) return 0;
  return Math.max(1, Math.floor(Math.log10(lifetimeEarned)) - 11);
}

// ─── Offline Earnings ─────────────────────────────────────────────────────────

const OFFLINE_RATE = 0.15; // 15% of CPS while offline
const OFFLINE_MAX_SECONDS = 86400; // cap at 24 hours

/**
 * @param {number} currentCPS       - CPS at time of last save
 * @param {number} elapsedMs        - milliseconds since last save
 */
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
