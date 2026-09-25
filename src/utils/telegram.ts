import { TelegramUser } from '../types';

export const getTelegramWebApp = () => {
  if (typeof window !== 'undefined' && (window as any).Telegram?.WebApp) {
    return (window as any).Telegram.WebApp;
  }
  return null;
};

export const initTelegramSDK = () => {
  const tg = getTelegramWebApp();
  if (tg) {
    tg.ready();
    tg.expand();
    try {
      tg.enableClosingConfirmation();
    } catch (e) {
      // Not supported in older WebApp versions
    }
  }
};

export const getTelegramUser = (): TelegramUser => {
  const tg = getTelegramWebApp();
  if (tg?.initDataUnsafe?.user) {
    return tg.initDataUnsafe.user;
  }

  // Fallback demo user for local web browser development
  return {
    id: 123456789,
    first_name: 'GarlicFarmer',
    last_name: 'AJO',
    username: 'GarlicKing',
    language_code: 'es',
    is_premium: true,
    photo_url: 'https://images.unsplash.com/photo-1615485290382-441e4d049cb5?w=150&auto=format&fit=crop&q=80',
  };
};

export const getTelegramStartParam = (): string | null => {
  const tg = getTelegramWebApp();
  return tg?.initDataUnsafe?.start_param || null;
};
