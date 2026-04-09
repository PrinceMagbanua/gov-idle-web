import { formatMoney } from '../utils/calculations';

const IMPEACHMENT_CHARGES = [
  'culpable violation of the Constitution',
  'betrayal of public trust',
  'graft and corruption',
  'other high crimes',
];

const FLAVOR_LINES = [
  'The complaint was filed in the proper office. The proper office is controlled by your people.',
  'You accept the charges with grace and a press conference. Your lawyer is already outside.',
  'The Senate votes. You issue a statement saying you respect the process.',
  'You step down temporarily to spend more time with your family. Your family is in Macau.',
  'The Supreme Court will weigh in. Two justices owe you. This is documented nowhere.',
  'Six months. That\'s how long before you resurface. This has been calculated.',
];

export function PrestigeModal({ lifetimeEarned, nextLagayBonus, lagayMultiplier, prestigeCount, onConfirm, onCancel }) {
  const charge = IMPEACHMENT_CHARGES[prestigeCount % IMPEACHMENT_CHARGES.length];
  const flavor = FLAVOR_LINES[prestigeCount % FLAVOR_LINES.length];
  const newMultiplier = lagayMultiplier + nextLagayBonus;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70">
      <div className="bg-slate-800 border border-slate-600 rounded-lg shadow-2xl max-w-lg w-full mx-4 p-6">
        <h2 className="text-lg font-bold text-white mb-1">The Articles Have Been Filed</h2>
        <p className="text-slate-400 text-sm mb-4">
          Charge: <span className="text-rose-400 italic">{charge}</span>
        </p>

        <div className="bg-slate-900 rounded p-4 mb-4 space-y-2">
          <div className="flex justify-between text-sm">
            <span className="text-slate-400">Lifetime earnings on record</span>
            <span className="text-white font-mono">{formatMoney(lifetimeEarned)}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-slate-400">Lagay bonus earned</span>
            <span className="text-green-400 font-semibold">+{nextLagayBonus}×</span>
          </div>
          <div className="border-t border-slate-700 pt-2 flex justify-between text-sm font-semibold">
            <span className="text-slate-300">New Lagay Multiplier</span>
            <span className="text-amber-400">{newMultiplier.toFixed(1)}×</span>
          </div>
        </div>

        <p className="text-xs text-slate-500 italic mb-5">"{flavor}"</p>

        <div className="grid grid-cols-2 gap-3">
          <button
            onClick={onCancel}
            className="py-2 bg-slate-700 hover:bg-slate-600 text-slate-300 rounded font-medium transition-colors text-sm"
          >
            Not Yet — I Have More To Do
          </button>
          <button
            onClick={onConfirm}
            className="py-2 bg-rose-700 hover:bg-rose-600 text-white rounded font-semibold transition-colors text-sm"
          >
            Accept Impeachment
          </button>
        </div>
      </div>
    </div>
  );
}
