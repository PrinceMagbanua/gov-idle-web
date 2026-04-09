import { useState } from 'react';
import { ACHIEVEMENTS, ACHIEVEMENT_CATEGORIES } from '../data/achievements';

export function AchievementsModal({ achievements, onClose }) {
  const [activeCategory, setActiveCategory] = useState('all');

  const categories = ['all', ...Object.keys(ACHIEVEMENT_CATEGORIES)];

  const filtered = ACHIEVEMENTS.filter(def => {
    if (activeCategory !== 'all' && def.category !== activeCategory) return false;
    return true;
  });

  const unlockedCount = ACHIEVEMENTS.filter(def => achievements[def.id]).length;

  return (
    <div
      className="fixed inset-0 bg-black/70 flex items-center justify-center z-50"
      onClick={onClose}
    >
      <div
        className="bg-slate-800 border border-slate-600 rounded-lg w-full max-w-lg mx-4 flex flex-col overflow-hidden"
        style={{ maxHeight: '80vh' }}
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-700 flex-shrink-0">
          <div>
            <h2 className="text-lg font-bold text-white">Achievements</h2>
            <p className="text-xs text-slate-500">{unlockedCount} / {ACHIEVEMENTS.length} unlocked</p>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white transition-colors text-xl leading-none"
          >
            ✕
          </button>
        </div>

        {/* Category tabs */}
        <div className="flex gap-1 px-4 py-2 border-b border-slate-700 flex-shrink-0 overflow-x-auto">
          {categories.map(cat => (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              className={`px-2.5 py-1 rounded text-xs whitespace-nowrap transition-colors ${
                activeCategory === cat
                  ? 'bg-slate-600 text-white'
                  : 'text-slate-400 hover:text-slate-300 hover:bg-slate-700/50'
              }`}
            >
              {cat === 'all' ? 'All' : ACHIEVEMENT_CATEGORIES[cat]}
            </button>
          ))}
        </div>

        {/* List */}
        <div className="overflow-y-auto flex-1 p-4 space-y-2">
          {filtered.map(def => {
            const unlocked = achievements[def.id];
            return (
              <div
                key={def.id}
                className={`rounded px-3 py-2.5 border transition-colors ${
                  unlocked
                    ? 'bg-slate-700/60 border-slate-600'
                    : 'bg-slate-800/40 border-slate-700/40 opacity-60'
                }`}
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="flex-1 min-w-0">
                    <div className={`text-sm font-semibold ${unlocked ? 'text-white' : 'text-slate-500'}`}>
                      {def.name}
                    </div>
                    <div className="text-xs text-slate-500 mt-0.5">{def.description}</div>
                    {unlocked && def.flavorText && (
                      <div className="text-xs text-slate-400 italic mt-1">"{def.flavorText}"</div>
                    )}
                  </div>
                  {unlocked && <span className="text-green-500 text-sm flex-shrink-0">✓</span>}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
