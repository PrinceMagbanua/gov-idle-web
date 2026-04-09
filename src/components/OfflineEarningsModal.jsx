import { formatMoney } from '../utils/calculations';

export function OfflineEarningsModal({ amount, onDismiss }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60">
      <div className="bg-slate-800 border border-slate-600 rounded-lg shadow-2xl max-w-md w-full mx-4 p-6">
        <h2 className="text-lg font-bold text-white mb-1">While You Were Gone</h2>
        <p className="text-slate-400 text-sm mb-4">
          Your ghost employees kept working. Or didn't work, but were paid anyway. Either way:
        </p>
        <div className="bg-slate-900 rounded p-4 text-center mb-4">
          <div className="text-xs text-slate-500 uppercase tracking-wider mb-1">Embezzled on your behalf</div>
          <div className="text-3xl font-bold text-green-400">{formatMoney(amount)}</div>
          <div className="text-xs text-slate-600 mt-1">at 15% offline efficiency</div>
        </div>
        <p className="text-xs text-slate-600 italic mb-4">
          "The system continued without you. This is the point."
        </p>
        <button
          onClick={onDismiss}
          className="w-full py-2 bg-slate-700 hover:bg-slate-600 text-white rounded font-medium transition-colors"
        >
          Collect and Continue
        </button>
      </div>
    </div>
  );
}
