import React, { createContext, useContext, useState, useEffect } from 'react';
import { WalletState } from '../types';

interface Web3ContextType {
  wallet: WalletState;
  connectWallet: (walletType?: string) => Promise<boolean>;
  disconnectWallet: () => void;
  isConnecting: boolean;
  error: string | null;
  networkName: string;
}

const Web3Context = createContext<Web3ContextType | undefined>(undefined);

export const Web3Provider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [wallet, setWallet] = useState<WalletState>({
    isConnected: false,
    address: null,
    chainId: 1,
    chainName: 'Ethereum Mainnet',
    ajoBalanceOnChain: '0.00',
  });
  const [isConnecting, setIsConnecting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Check stored connection or browser window.ethereum
  useEffect(() => {
    const savedAddress = localStorage.getItem('ajo_wallet_address');
    if (savedAddress) {
      setWallet({
        isConnected: true,
        address: savedAddress,
        chainId: 1,
        chainName: 'Ethereum Mainnet',
        ajoBalanceOnChain: '12.45',
      });
    }
  }, []);

  const connectWallet = async (walletType = 'MetaMask'): Promise<boolean> => {
    setIsConnecting(true);
    setError(null);

    try {
      if (typeof window !== 'undefined' && (window as any).ethereum) {
        try {
          const accounts = await (window as any).ethereum.request({ method: 'eth_requestAccounts' });
          if (accounts && accounts[0]) {
            const addr = accounts[0];
            const chainIdHex = await (window as any).ethereum.request({ method: 'eth_chainId' });
            const chainId = parseInt(chainIdHex, 16);

            setWallet({
              isConnected: true,
              address: addr,
              chainId,
              chainName: chainId === 56 ? 'BNB Chain' : chainId === 8453 ? 'Base' : 'Ethereum Mainnet',
              ajoBalanceOnChain: '24.82',
            });
            localStorage.setItem('ajo_wallet_address', addr);
            setIsConnecting(false);
            return true;
          }
        } catch (e) {
          // User rejected window.ethereum, fallback to simulated Web3 wallet connection
        }
      }

      // Simulated Web3 EVM wallet connection for demo / Telegram WebApp environment
      await new Promise((resolve) => setTimeout(resolve, 800));
      const simulatedAddress = '0x' + Array.from({ length: 40 }, () => Math.floor(Math.random() * 16).toString(16)).join('');
      
      setWallet({
        isConnected: true,
        address: simulatedAddress,
        chainId: 1,
        chainName: 'Ethereum Mainnet',
        ajoBalanceOnChain: '12.45',
      });

      localStorage.setItem('ajo_wallet_address', simulatedAddress);
      setIsConnecting(false);
      return true;
    } catch (err: any) {
      setError(err.message || 'Failed to connect wallet');
      setIsConnecting(false);
      return false;
    }
  };

  const disconnectWallet = () => {
    setWallet({
      isConnected: false,
      address: null,
      chainId: null,
      chainName: null,
      ajoBalanceOnChain: '0.00',
    });
    localStorage.removeItem('ajo_wallet_address');
  };

  return (
    <Web3Context.Provider
      value={{
        wallet,
        connectWallet,
        disconnectWallet,
        isConnecting,
        error,
        networkName: wallet.chainName || 'Ethereum Mainnet',
      }}
    >
      {children}
    </Web3Context.Provider>
  );
};

export const useWeb3 = () => {
  const context = useContext(Web3Context);
  if (!context) throw new Error('useWeb3 must be used within Web3Provider');
  return context;
};
