import { useEffect, useRef, useCallback } from 'react';

export function useMotionNotifications(enabled: boolean) {
  const permissionRef = useRef<NotificationPermission>('default');

  useEffect(() => {
    if ('Notification' in window) {
      permissionRef.current = Notification.permission;
    }
  }, []);

  const requestPermission = useCallback(async () => {
    if (!('Notification' in window)) return false;
    if (Notification.permission === 'granted') return true;
    const result = await Notification.requestPermission();
    permissionRef.current = result;
    return result === 'granted';
  }, []);

  const notify = useCallback((room: string, variance: number, confidence: number) => {
    if (!enabled || !('Notification' in window) || Notification.permission !== 'granted') return;

    new Notification('⚠ Motion Detected', {
      body: `Movement in ${room}\nVariance: ${variance.toFixed(2)} | Confidence: ${confidence}%`,
      icon: '/favicon.ico',
      tag: `motion-${room}`, // prevents duplicate notifications per room
      silent: false,
    });
  }, [enabled]);

  return { requestPermission, notify };
}
