import { formatMoney } from '../utils/calculations';

function formatOfflineTime(ms) {
  const totalSeconds = Math.floor(ms / 1000);
  const totalMinutes = Math.floor(totalSeconds / 60);
  const hours = Math.floor(totalMinutes / 60);
  const minutes = totalMinutes % 60;
  if (hours > 0 && minutes > 0) return `${hours} hour${hours > 1 ? 's' : ''} ${minutes} minute${minutes > 1 ? 's' : ''}`;
  if (hours > 0) return `${hours} hour${hours > 1 ? 's' : ''}`;
  return `${totalMinutes} minute${totalMinutes !== 1 ? 's' : ''}`;
}

export function OfflineEarningsModal({ amount, elapsedMs, onDismiss }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70">
      <div className="bg-slate-800 border border-slate-600 rounded-xl shadow-2xl max-w-sm w-full mx-4">

        {/* Header */}
        <div className="px-6 pt-6 pb-4 border-b border-slate-700">
          <div className="flex items-center gap-3 mb-1">
            <span className="text-2xl">🏛️</span>
            <h2 className="text-lg font-bold text-white">Embezzled While Away</h2>
          </div>
        </div>

        {/* Time away */}
        <div className="px-6 py-4 border-b border-slate-700/50 text-center">
          <div className="text-xs text-slate-500 uppercase tracking-wider mb-0.5">Time Spent Away</div>
          <div className="text-slate-200 font-medium">{elapsedMs != null ? formatOfflineTime(elapsedMs) : '—'}</div>
        </div>

        {/* Earnings card */}
        <div className="px-6 py-5">
          <div className="grid grid-cols-1 gap-3">
            <div className="bg-slate-900 border border-slate-700 rounded-lg p-4 text-center">
              <div className="text-xs text-slate-500 uppercase tracking-wider mb-2">Funds Collected</div>
              <div className="text-2xl font-bold text-green-400">{formatMoney(amount)}</div>
              <div className="text-xs text-slate-600 mt-1">at 15% offline efficiency</div>
            </div>
          </div>

          <p className="text-xs text-slate-600 italic text-center mt-4">
            "The system continued without you. This is the point."
          </p>
        </div>

        {/* Footer */}
        <div className="px-6 pb-6">
          <button
            onClick={onDismiss}
            className="w-full py-2.5 bg-slate-600 hover:bg-slate-500 text-white rounded-lg font-semibold transition-colors"
          >
            OK
          </button>
        </div>
      </div>
    </div>
  );
}
