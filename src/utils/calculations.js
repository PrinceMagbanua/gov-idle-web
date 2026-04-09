export function formatNumber(num) {
  // Round to avoid floating point precision issues (39.999999... becomes 40)
  const rounded = Math.round(num * 1000000) / 1000000;
  
  if (rounded < 1000) return Math.floor(rounded).toString();
  if (rounded < 1000000) return (rounded / 1000).toFixed(3).replace(/\.?0+$/, '') + 'K';
  if (rounded < 1000000000) return (rounded / 1000000).toFixed(3).replace(/\.?0+$/, '') + 'M';
  return (rounded / 1000000000).toFixed(3).replace(/\.?0+$/, '') + 'B';
}

export function formatIPSWithDecimals(num) {
  // Round to avoid floating point precision issues
  const rounded = Math.round(num * 1000000) / 1000000;
  
  if (rounded < 0.01) return '0.00';
  if (rounded < 1) return rounded.toFixed(2);
  if (rounded < 1000) {
    const precise = Math.round(rounded * 100) / 100;
    return precise === Math.floor(precise) ? Math.floor(precise).toString() : precise.toString();
  }
  // For 1000+, show 3 decimal places
  if (rounded < 1000000) return (rounded / 1000).toFixed(3).replace(/\.?0+$/, '') + 'K';
  if (rounded < 1000000000) return (rounded / 1000000).toFixed(3).replace(/\.?0+$/, '') + 'M';
  return (rounded / 1000000000).toFixed(3).replace(/\.?0+$/, '') + 'B';
}

export function calculateProjectCost(baseCost, owned, costScaleMultiplier = 1.15) {
  return baseCost * Math.pow(costScaleMultiplier, owned);
}

export function calculateTotalIPS(projects, globalMultiplier) {
  return projects.reduce((total, project) => total + project.incomePerSecond * project.owned, 0) * globalMultiplier;
}

const TITLES = [
  { threshold: 1_000_000_000, title: 'The System Itself' },
  { threshold: 100_000_000,   title: "Ambassador to a Country That Doesn't Exist" },
  { threshold: 20_000_000,    title: 'Congressman with 3 Names' },
  { threshold: 5_000_000,     title: 'Senator Baby' },
  { threshold: 2_000_000,     title: 'POGO-Backed Politician' },
  { threshold: 500_000,       title: 'Artista Mayor' },
  { threshold: 100_000,       title: 'Honest Mayor' },
  { threshold: 50_000,        title: 'Vice Mayor with a Grudge' },
  { threshold: 15_000,        title: 'Brgy. Captain with a Farm' },
  { threshold: 5_000,         title: 'Kagawad with a Sideline' },
  { threshold: 1_000,         title: 'Marites HOA President' },
  { threshold: 100,           title: 'Corrupt HOA Auditor' },
  { threshold: 0,             title: 'Desperate Intern' },
];

export function getTitle(totalEarned) {
  for (const { threshold, title } of TITLES) {
    if (totalEarned >= threshold) return title;
  }
  return 'Desperate Intern';
}

// Returns all titles earned so far, oldest first (excludes current)
export function getPastTitles(totalEarned) {
  return TITLES
    .filter(t => totalEarned >= t.threshold)
    .map(t => t.title)
    .reverse()
    .slice(0, -1); // remove last entry (current title)
}
