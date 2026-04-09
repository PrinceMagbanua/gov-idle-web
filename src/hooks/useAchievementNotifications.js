import { useEffect, useRef } from 'react';
import { toast } from 'sonner';

export function useAchievementNotifications(achievements) {
  const notifiedRef = useRef(new Set());

  useEffect(() => {
    achievements.forEach(achievement => {
      if (achievement.unlocked && !notifiedRef.current.has(achievement.id)) {
        toast.success(achievement.description, {
          description: achievement.name,
          duration: 4000,
        });
        notifiedRef.current.add(achievement.id);
      }
    });
  }, [achievements]);
}
