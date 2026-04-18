import { useRef, useCallback } from 'react';

export function useTilt({ maxTilt = 12, perspective = 1500, scale = 1.02 } = {}) {
  const ref = useRef(null);

  const handleMouseMove = useCallback((e) => {
    const el = ref.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    const xPct = ((e.clientX - rect.left) / rect.width - 0.5) * 2;
    const yPct = ((e.clientY - rect.top) / rect.height - 0.5) * 2;
    el.style.transform = `perspective(${perspective}px) rotateX(${-yPct * maxTilt}deg) rotateY(${xPct * maxTilt}deg) scale3d(${scale},${scale},${scale})`;
    el.style.transition = 'transform 0.1s cubic-bezier(.03,.98,.52,.99)';
  }, [maxTilt, perspective, scale]);

  const handleMouseLeave = useCallback(() => {
    const el = ref.current;
    if (!el) return;
    el.style.transform = `perspective(${perspective}px) rotateX(0deg) rotateY(0deg) scale3d(1,1,1)`;
    el.style.transition = 'transform 0.5s cubic-bezier(.03,.98,.52,.99)';
  }, [perspective]);

  return { ref, onMouseMove: handleMouseMove, onMouseLeave: handleMouseLeave };
}
