import React, { createContext, useContext, useState, useEffect } from 'react';
import { UserAuthSession, UserState, AuthMethod, TelegramUser } from '../types';
import { getTelegramUser, getTelegramWebApp } from '../utils/telegram';

interface AuthContextType {
  session: UserAuthSession;
  loginWithTelegram: (customTgUser?: TelegramUser) => Promise<boolean>;
  loginWithWeb3: (walletAddress: string) => Promise<boolean>;
  loginWithEmail: (email: string, username: string, password?: string) => Promise<boolean>;
  logout: () => void;
  isAuthModalOpen: boolean;
  setIsAuthModalOpen: (open: boolean) => void;
  updateUserProfile: (updates: Partial<UserState>) => void;
}

const STORAGE_SESSION_KEY = 'ajo_auth_session';

const DEFAULT_GUEST_USER: UserState = {
  id: 'usr_tg_123456789',
  telegramId: '123456789',
  authMethod: 'TELEGRAM',
  username: 'GarlicKing',
  firstName: 'Garlic',
  photoUrl: 'https://images.unsplash.com/photo-1615485290382-441e4d049cb5?w=150&auto=format&fit=crop&q=80',
  referralCode: 'AJO-X7K29',
  isAdmin: true,
  isBanned: false,
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [session, setSession] = useState<UserAuthSession>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_SESSION_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed && parsed.isAuthenticated && parsed.user) {
          return parsed;
        }
      }
    } catch (e) {
      console.warn('Failed to parse saved auth session:', e);
    }

    // Check if running inside Telegram MiniApp automatically
    const tgWebApp = getTelegramWebApp();
    if (tgWebApp?.initDataUnsafe?.user) {
      const tgUser = tgWebApp.initDataUnsafe.user;
      const tgUserState: UserState = {
        id: `usr_tg_${tgUser.id}`,
        telegramId: String(tgUser.id),
        authMethod: 'TELEGRAM',
        username: tgUser.username || tgUser.first_name || `Farmer_${tgUser.id}`,
        firstName: tgUser.first_name || 'Farmer',
        photoUrl: tgUser.photo_url || DEFAULT_GUEST_USER.photoUrl,
        referralCode: `AJO-${Math.random().toString(36).substring(2, 7).toUpperCase()}`,
        isAdmin: false,
        isBanned: false,
      };
      return {
        isAuthenticated: true,
        authMethod: 'TELEGRAM',
        user: tgUserState,
      };
    }

    // Default demo session (DB ready structure)
    return {
      isAuthenticated: true,
      authMethod: 'TELEGRAM',
      user: DEFAULT_GUEST_USER,
    };
  });

  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);

  // Save session to localStorage on change
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_SESSION_KEY, JSON.stringify(session));
    } catch (e) {
      console.error('Error saving auth session:', e);
    }
  }, [session]);

  // Login via Telegram
  const loginWithTelegram = async (customTgUser?: TelegramUser): Promise<boolean> => {
    const tgUser = customTgUser || getTelegramUser();
    const newUserState: UserState = {
      id: `usr_tg_${tgUser.id}`,
      telegramId: String(tgUser.id),
      authMethod: 'TELEGRAM',
      username: tgUser.username || tgUser.first_name || `Farmer_${tgUser.id}`,
      firstName: tgUser.first_name || 'Farmer',
      photoUrl: tgUser.photo_url || DEFAULT_GUEST_USER.photoUrl,
      referralCode: session.user?.referralCode || `AJO-${Math.random().toString(36).substring(2, 7).toUpperCase()}`,
      walletAddress: session.user?.walletAddress || localStorage.getItem('ajo_wallet_address') || undefined,
      isAdmin: tgUser.id === 123456789 || session.user?.isAdmin || false,
      isBanned: false,
    };

    setSession({
      isAuthenticated: true,
      authMethod: 'TELEGRAM',
      user: newUserState,
    });
    setIsAuthModalOpen(false);
    return true;
  };

  // Login via Web3 Wallet
  // IMPORTANT: Automatically connects wallet in user profile with no redundant connections!
  const loginWithWeb3 = async (walletAddress: string): Promise<boolean> => {
    if (!walletAddress) return false;

    // Save wallet address to localStorage for Web3Context sync
    localStorage.setItem('ajo_wallet_address', walletAddress);

    const shortAddr = `${walletAddress.substring(0, 6)}...${walletAddress.substring(walletAddress.length - 4)}`;
    const newUserState: UserState = {
      id: `usr_w3_${walletAddress.toLowerCase()}`,
      walletAddress: walletAddress,
      authMethod: 'WEB3',
      username: session.user?.username && session.user.authMethod === 'WEB3' 
        ? session.user.username 
        : `Web3_${shortAddr}`,
      firstName: `Trader (${shortAddr})`,
      photoUrl: `https://api.dicebear.com/7.x/identicon/svg?seed=${walletAddress}`,
      referralCode: session.user?.referralCode || `AJO-${Math.random().toString(36).substring(2, 7).toUpperCase()}`,
      isAdmin: session.user?.isAdmin || false,
      isBanned: false,
    };

    setSession({
      isAuthenticated: true,
      authMethod: 'WEB3',
      user: newUserState,
    });
    setIsAuthModalOpen(false);
    return true;
  };

  const loginWithEmail = async (email: string, username: string, password?: string): Promise<boolean> => {
    if (!email || !email.includes('@')) return false;

    const cleanEmail = email.trim().toLowerCase();
    const cleanName = username.trim() || cleanEmail.split('@')[0];
    const isSuperAdmin = cleanEmail === 'horaciowalterortiz@gmail.com' || cleanEmail.includes('admin');

    const newUserState: UserState = {
      id: `usr_em_${btoa(cleanEmail).replace(/=/g, '')}`,
      email: cleanEmail,
      authMethod: 'EMAIL',
      username: cleanName,
      firstName: cleanName,
      photoUrl: `https://api.dicebear.com/7.x/bottts/svg?seed=${cleanEmail}`,
      referralCode: session.user?.referralCode || `AJO-${Math.random().toString(36).substring(2, 7).toUpperCase()}`,
      walletAddress: session.user?.walletAddress || localStorage.getItem('ajo_wallet_address') || undefined,
      isAdmin: isSuperAdmin,
      isBanned: false,
    };

    setSession({
      isAuthenticated: true,
      authMethod: 'EMAIL',
      user: newUserState,
    });
    setIsAuthModalOpen(false);
    return true;
  };

  const logout = () => {
    setSession({
      isAuthenticated: false,
      authMethod: null,
      user: null,
    });
    localStorage.removeItem(STORAGE_SESSION_KEY);
    setIsAuthModalOpen(true);
  };

  const updateUserProfile = (updates: Partial<UserState>) => {
    setSession((prev) => {
      if (!prev.user) return prev;
      return {
        ...prev,
        user: { ...prev.user, ...updates },
      };
    });
  };

  return (
    <AuthContext.Provider
      value={{
        session,
        loginWithTelegram,
        loginWithWeb3,
        loginWithEmail,
        logout,
        isAuthModalOpen,
        setIsAuthModalOpen,
        updateUserProfile,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within AuthProvider');
  return context;
};
