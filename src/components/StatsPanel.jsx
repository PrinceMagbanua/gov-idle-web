import { useMemo } from 'react';
import { formatMoney, formatCPS, formatNumber, calculateGeneratorCPS } from '../utils/calculations';

// ─── Donut Chart ──────────────────────────────────────────────────────────────

const SLICE_COLORS = [
  '#64748b', // slate-500
  '#6366f1', // indigo-500
  '#0ea5e9', // sky-500
  '#14b8a6', // teal-500
  '#22c55e', // green-500
  '#84cc16', // lime-500
  '#eab308', // yellow-500
  '#f97316', // orange-500
  '#ef4444', // red-500
  '#ec4899', // pink-500
  '#a855f7', // purple-500
  '#06b6d4', // cyan-500
];

function DonutChart({ slices }) {
  // slices: [{ label, value, color }]
  const total = slices.reduce((s, x) => s + x.value, 0);
  if (total === 0) return (
    <div className="flex items-center justify-center h-48 text-slate-600 text-sm">
      No CPS yet — hire some generators.
    </div>
  );

  const SIZE = 180;
  const CX = SIZE / 2;
  const CY = SIZE / 2;
  const R_OUTER = 78;
  const R_INNER = 46;

  // Build SVG arcs
  let angle = -Math.PI / 2; // start at top
  const paths = slices
    .filter(s => s.value > 0)
    .map(s => {
      const fraction = s.value / total;
      const sweep = fraction * 2 * Math.PI;
      const startAngle = angle;
      const endAngle = angle + sweep;
      angle = endAngle;

      const x1o = CX + R_OUTER * Math.cos(startAngle);
      const y1o = CY + R_OUTER * Math.sin(startAngle);
      const x2o = CX + R_OUTER * Math.cos(endAngle);
      const y2o = CY + R_OUTER * Math.sin(endAngle);
      const x1i = CX + R_INNER * Math.cos(endAngle);
      const y1i = CY + R_INNER * Math.sin(endAngle);
      const x2i = CX + R_INNER * Math.cos(startAngle);
      const y2i = CY + R_INNER * Math.sin(startAngle);
      const large = sweep > Math.PI ? 1 : 0;

      const d = [
        `M ${x1o} ${y1o}`,
        `A ${R_OUTER} ${R_OUTER} 0 ${large} 1 ${x2o} ${y2o}`,
        `L ${x1i} ${y1i}`,
        `A ${R_INNER} ${R_INNER} 0 ${large} 0 ${x2i} ${y2i}`,
        'Z',
      ].join(' ');

      return { ...s, d, fraction };
    });

  return (
    <svg viewBox={`0 0 ${SIZE} ${SIZE}`} style={{ width: SIZE, height: SIZE }}>
      {paths.map((p, i) => (
        <path key={i} d={p.d} fill={p.color} opacity="0.9" />
      ))}
    </svg>
  );
}

// ─── Stat Row ─────────────────────────────────────────────────────────────────

function StatRow({ label, value }) {
  return (
    <div className="flex justify-between items-baseline py-1.5 border-b border-slate-700/40">
      <span className="text-sm text-slate-400">{label}</span>
      <span className="text-sm text-slate-200 font-medium tabular-nums">{value}</span>
    </div>
  );
}

function StatSection({ title, children }) {
  return (
    <div className="mb-6">
      <div className="text-xs text-slate-600 uppercase tracking-wider mb-2">{title}</div>
      {children}
    </div>
  );
}

// ─── Format playtime ─────────────────────────────────────────────────────────

function formatPlaytime(ms) {
  const s = Math.floor(ms / 1000);
  const m = Math.floor(s / 60);
  const h = Math.floor(m / 60);
  if (h > 0) return `${h}h ${m % 60}m`;
  if (m > 0) return `${m}m ${s % 60}s`;
  return `${s}s`;
}

// ─── Main ─────────────────────────────────────────────────────────────────────

export function StatsPanel({
  money,
  lifetimeEarned,
  currentCPS,
  generators,
  GENERATORS,
  lagayMultiplier,
  prestigeCount,
  totalClicks,
  totalUpgradesPurchased,
  totalUpgradesSpent,
  maxSingleClick,
  offlineCollectionCount,
  totalPlaytimeMs,
}) {
  const slices = useMemo(() => {
    return generators.map((g, i) => {
      const def = GENERATORS[i];
      const cps = calculateGeneratorCPS(def.baseCPS, g.owned, g.modifierLevel);
      return {
        label: def.name,
        value: cps,
        color: SLICE_COLORS[i % SLICE_COLORS.length],
        owned: g.owned,
        cps,
      };
    });
  }, [generators, GENERATORS]);

  const totalRawCPS = slices.reduce((s, x) => s + x.value, 0);
  const activeSlices = slices.filter(s => s.value > 0);

  return (
    <div className="p-4 overflow-y-auto h-full">

      {/* ── General ── */}
      <StatSection title="Corruption Overview">
        <StatRow label="Current Funds"          value={formatMoney(money)} />
        <StatRow label="Lifetime Embezzled"     value={formatMoney(lifetimeEarned)} />
        <StatRow label="Corruption/s"           value={formatCPS(currentCPS)} />
        <StatRow label="Lagay Multiplier"       value={`×${lagayMultiplier.toFixed(2)}`} />
        <StatRow label="Impeachments Survived"  value={prestigeCount} />
        <StatRow label="Session Playtime"       value={formatPlaytime(totalPlaytimeMs)} />
      </StatSection>

      {/* ── Clicks ── */}
      <StatSection title="Bribery Stats">
        <StatRow label="Total Fund Allocations"  value={formatNumber(totalClicks)} />
        <StatRow label="Biggest Single Deal"     value={formatMoney(maxSingleClick)} />
        <StatRow label="Upgrades Purchased"      value={formatNumber(totalUpgradesPurchased)} />
        <StatRow label="Spent on Upgrades"       value={formatMoney(totalUpgradesSpent)} />
        <StatRow label="Offline Collections"     value={offlineCollectionCount} />
      </StatSection>

      {/* ── Pie chart ── */}
      <StatSection title="CPS Breakdown by Generator">
        {totalRawCPS === 0 ? (
          <p className="text-slate-600 text-sm">Hire generators to see their contribution.</p>
        ) : (
          <div className="flex gap-4 items-start">
            <div className="flex-shrink-0">
              <DonutChart slices={slices} />
            </div>
            <div className="flex-1 min-w-0 space-y-1.5">
              {activeSlices.map((s, i) => {
                const pct = totalRawCPS > 0 ? (s.value / totalRawCPS) * 100 : 0;
                return (
                  <div key={i} className="flex items-center gap-2 min-w-0">
                    <span
                      className="flex-shrink-0 inline-block w-2.5 h-2.5 rounded-sm"
                      style={{ backgroundColor: s.color }}
                    />
                    <div className="flex-1 min-w-0">
                      <div className="text-xs text-slate-400 truncate">{s.label}</div>
                      <div className="text-xs text-slate-600">
                        {pct.toFixed(1)}% · {formatCPS(s.cps)} · ×{s.owned}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </StatSection>

    </div>
  );
}
