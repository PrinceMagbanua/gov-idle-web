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
