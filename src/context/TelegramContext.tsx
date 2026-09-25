import React, { createContext, useContext, useEffect, useState } from 'react';
import { TelegramUser } from '../types';
import { getTelegramUser, initTelegramSDK } from '../utils/telegram';

interface TelegramContextType {
  user: TelegramUser;
  isTelegram: boolean;
}

const TelegramContext = createContext<TelegramContextType | undefined>(undefined);

export const TelegramProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<TelegramUser>(getTelegramUser());
  const [isTelegram, setIsTelegram] = useState<boolean>(false);

  useEffect(() => {
    initTelegramSDK();
    const tgUser = getTelegramUser();
    setUser(tgUser);
    setIsTelegram(typeof window !== 'undefined' && Boolean((window as any).Telegram?.WebApp?.initData));
  }, []);

  return (
    <TelegramContext.Provider value={{ user, isTelegram }}>
      {children}
    </TelegramContext.Provider>
  );
};

export const useTelegram = () => {
  const context = useContext(TelegramContext);
  if (!context) throw new Error('useTelegram must be used within TelegramProvider');
  return context;
};
