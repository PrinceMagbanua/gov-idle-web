import { useEffect, useRef } from 'react';
import { toast } from 'sonner';
import { ACHIEVEMENTS } from '../data/achievements';

// achievements: { [id]: boolean }
export function useAchievementNotifications(achievements) {
  const notifiedRef = useRef(new Set());

  useEffect(() => {
    for (const def of ACHIEVEMENTS) {
      if (achievements[def.id] && !notifiedRef.current.has(def.id)) {
        toast.success(def.name, {
          description: def.description,
          duration: 4000,
        });
        notifiedRef.current.add(def.id);
      }
    }
  }, [achievements]);
}
