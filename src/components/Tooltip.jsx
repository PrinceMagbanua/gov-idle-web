import { useState, useRef } from 'react';

/**
 * Rich hover tooltip that floats to the left of the trigger element.
 * Uses fixed positioning so it escapes overflow:hidden/auto containers.
 */
export function Tooltip({ content, children }) {
  const [pos, setPos] = useState(null);
  const ref = useRef(null);

  const handleEnter = () => {
    if (!ref.current) return;
    const rect = ref.current.getBoundingClientRect();
    setPos({
      top: Math.max(8, Math.min(rect.top, window.innerHeight - 320)),
      right: window.innerWidth - rect.left + 10,
    });
  };

  const handleLeave = () => setPos(null);

  return (
    <div ref={ref} onMouseEnter={handleEnter} onMouseLeave={handleLeave}>
      {children}
      {pos && content && (
        <div
          className="fixed z-50 w-72 bg-slate-800 border border-slate-700 text-slate-300 rounded-lg shadow-2xl p-4 pointer-events-none"
          style={{ top: pos.top, right: pos.right }}
        >
          {content}
        </div>
      )}
    </div>
  );
}
