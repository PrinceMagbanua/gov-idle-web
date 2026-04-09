export function AchievementsModal({ achievements, onClose }) {
  const claimed = achievements.filter(a => a.unlocked);
  const lockedCount = achievements.length - claimed.length;

  return (
    <div
      className="fixed inset-0 bg-black/70 flex items-center justify-center z-50"
      onClick={onClose}
    >
      <div
        className="bg-slate-800 border border-slate-600 rounded-lg w-full max-w-md mx-4 overflow-hidden"
        onClick={e => e.stopPropagation()}
      >
        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-700">
          <h2 className="text-lg font-bold text-white">Achievements</h2>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white transition-colors text-xl leading-none"
          >
            ✕
          </button>
        </div>

        <div className="p-5 space-y-3 max-h-96 overflow-y-auto">
          {claimed.length === 0 ? (
            <p className="text-slate-400 text-sm text-center py-4">
              No achievements yet. Keep allocating those funds.
            </p>
          ) : (
            claimed.map(a => (
              <div key={a.id} className="flex items-start gap-3 bg-slate-700/50 rounded px-3 py-2">
                <span className="text-xl leading-none mt-0.5">{a.name.split(' ')[0]}</span>
                <div>
                  <div className="font-semibold text-white text-sm">
                    {a.name.split(' ').slice(1).join(' ')}
                  </div>
                  <div className="text-xs text-slate-400">{a.description}</div>
                </div>
              </div>
            ))
          )}
        </div>

        {lockedCount > 0 && (
          <div className="px-5 py-3 border-t border-slate-700 text-xs text-slate-500 text-center">
            {lockedCount} more locked
          </div>
        )}
      </div>
    </div>
  );
}
