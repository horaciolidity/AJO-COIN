// Telegram WebApp Haptic & Fallback Haptics

export const triggerHaptic = (type: 'light' | 'medium' | 'heavy' | 'success' | 'warning' | 'error' = 'light') => {
  try {
    const tg = (window as any).Telegram?.WebApp;
    // HapticFeedback was introduced in Telegram WebApp API version 6.1
    if (tg && tg.isVersionAtLeast && tg.isVersionAtLeast('6.1') && tg.HapticFeedback) {
      if (['light', 'medium', 'heavy', 'rigid', 'soft'].includes(type)) {
        tg.HapticFeedback.impactOccurred(type);
      } else if (['success', 'warning', 'error'].includes(type)) {
        tg.HapticFeedback.notificationOccurred(type);
      }
      return;
    }
  } catch (e) {
    // Ignore error
  }

  // Fallback to HTML5 Vibrate API
  if (typeof navigator !== 'undefined' && 'vibrate' in navigator) {
    // Prevent browser intervention warning if user has not interacted with document yet
    if ('userActivation' in navigator && (navigator as any).userActivation && !(navigator as any).userActivation.hasBeenActive) {
      return;
    }
    try {
      if (type === 'light') navigator.vibrate(10);
      else if (type === 'medium') navigator.vibrate(25);
      else if (type === 'heavy') navigator.vibrate(50);
      else if (type === 'success') navigator.vibrate([30, 50, 30]);
      else if (type === 'error') navigator.vibrate([100, 50, 100]);
    } catch (e) {
      // Browser blocked vibration
    }
  }
};
