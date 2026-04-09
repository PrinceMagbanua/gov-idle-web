import { formatNumber, formatIPSWithDecimals } from '../utils/calculations';

export function TopBar({ money, ips }) {
  return (
    <div className="bg-slate-900 border-b border-slate-700 px-6 py-4 flex justify-between items-center">
      <div className="flex items-center gap-8">
        <div>
          <div className="text-sm text-slate-400">Money</div>
          <div className="text-3xl font-bold text-green-400">${formatNumber(money)}</div>
        </div>
        <div className="group relative cursor-help">
          <div className="text-sm text-slate-400">Income/sec</div>
          <div className="text-2xl font-bold text-amber-400">{formatIPSWithDecimals(ips)}/s</div>
          {/* Tooltip */}
          <div className="absolute left-0 bottom-full mb-2 hidden group-hover:block bg-slate-800 text-white text-xs px-2 py-1 rounded whitespace-nowrap border border-slate-600">
            {ips.toFixed(4)}/s
          </div>
        </div>
      </div>
    </div>
  );
}
