import React from 'react';
import { useGame } from '../../context/GameContext';
import { useWeb3 } from '../../context/Web3Context';
import { formatAddress } from '../../utils/format';
import { X, Wallet, CheckCircle, ExternalLink, RefreshCw, AlertTriangle } from 'lucide-react';
import { triggerHaptic } from '../../utils/haptics';

export const WalletModal: React.FC = () => {
  const { isWalletModalOpen, setIsWalletModalOpen, showToast } = useGame();
  const { wallet, connectWallet, disconnectWallet, isConnecting, error, networkName } = useWeb3();

  if (!isWalletModalOpen) return null;

  const handleConnect = async (walletName: string) => {
    triggerHaptic('medium');
    const success = await connectWallet(walletName);
    if (success) {
      triggerHaptic('success');
      showToast('Wallet Connected!', 'EVM wallet linked successfully.', 'success');
      setIsWalletModalOpen(false);
    }
  };

  const handleDisconnect = () => {
    triggerHaptic('warning');
    disconnectWallet();
    showToast('Wallet Disconnected', 'Your wallet has been unlinked.', 'info');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fadeIn">
      <div className="w-full max-w-sm glass-panel rounded-3xl border border-purple-500/30 p-5 shadow-2xl relative">
        {/* Close button */}
        <button
          onClick={() => setIsWalletModalOpen(false)}
          className="absolute top-4 right-4 text-gray-400 hover:text-white p-1 rounded-full bg-white/5 hover:bg-white/10"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Modal Title */}
        <div className="flex items-center gap-2 mb-4">
          <div className="p-2.5 rounded-2xl bg-purple-900/50 border border-purple-500/30">
            <Wallet className="w-6 h-6 text-purple-300" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-white">EVM Web3 Wallet</h3>
            <p className="text-xs text-gray-400">Connect to claim on-chain AJO tokens</p>
          </div>
        </div>

        {/* Status display */}
        {wallet.isConnected ? (
          <div className="space-y-4">
            <div className="glass-card rounded-2xl p-4 border border-emerald-500/30 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs text-gray-400">Status</span>
                <span className="flex items-center gap-1 text-xs font-semibold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/30">
                  <CheckCircle className="w-3 h-3" /> Connected
                </span>
              </div>

              <div>
                <span className="text-xs text-gray-400">Address</span>
                <p className="font-mono text-sm font-bold text-white truncate">{wallet.address}</p>
              </div>

              <div className="flex justify-between items-center pt-2 border-t border-white/10">
                <div>
                  <span className="text-[10px] text-gray-400 block uppercase">Network</span>
                  <span className="text-xs font-semibold text-purple-300">{networkName}</span>
                </div>
                <div className="text-right">
                  <span className="text-[10px] text-gray-400 block uppercase">On-Chain AJO Balance</span>
                  <span className="text-xs font-bold text-emerald-300">{wallet.ajoBalanceOnChain} AJO</span>
                </div>
              </div>
            </div>

            <button
              onClick={handleDisconnect}
              className="w-full py-2.5 rounded-xl bg-red-500/20 hover:bg-red-500/30 text-red-300 border border-red-500/30 font-semibold text-xs transition-colors"
            >
              Disconnect Wallet
            </button>
          </div>
        ) : (
          <div className="space-y-3">
            <p className="text-xs text-gray-300 leading-relaxed bg-purple-900/20 p-3 rounded-xl border border-purple-500/20">
              ⚡ Connect your Web3 wallet to verify ownership, purchase presale tokens, and claim on-chain AJO token rewards.
            </p>

            {error && (
              <div className="flex items-center gap-2 text-xs text-red-400 bg-red-500/10 p-2.5 rounded-xl border border-red-500/30">
                <AlertTriangle className="w-4 h-4 shrink-0" />
                <span>{error}</span>
              </div>
            )}

            <div className="space-y-2">
              {[
                { name: 'MetaMask', icon: '🦊', color: 'from-orange-500/20 to-amber-600/20 border-orange-500/30' },
                { name: 'OKX Wallet', icon: '🖤', color: 'from-blue-500/20 to-indigo-600/20 border-blue-500/30' },
                { name: 'WalletConnect', icon: '🔷', color: 'from-sky-500/20 to-cyan-600/20 border-sky-500/30' },
                { name: 'Coinbase Wallet', icon: '🔵', color: 'from-blue-600/20 to-indigo-800/20 border-blue-600/30' },
              ].map((w) => (
                <button
                  key={w.name}
                  disabled={isConnecting}
                  onClick={() => handleConnect(w.name)}
                  className={`w-full flex items-center justify-between p-3 rounded-2xl bg-gradient-to-r ${w.color} border hover:scale-[1.02] active:scale-[0.98] transition-all disabled:opacity-50`}
                >
                  <div className="flex items-center gap-3">
                    <span className="text-2xl">{w.icon}</span>
                    <span className="font-semibold text-sm text-white">{w.name}</span>
                  </div>
                  {isConnecting ? (
                    <RefreshCw className="w-4 h-4 animate-spin text-purple-300" />
                  ) : (
                    <ExternalLink className="w-4 h-4 text-gray-400" />
                  )}
                </button>
              ))}
            </div>

            <p className="text-[10px] text-center text-gray-400 pt-2">
              🔒 No private keys required. All actions require explicit wallet confirmation.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};
