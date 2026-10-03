import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useWeb3 } from '../../context/Web3Context';
import { useGame } from '../../context/GameContext';
import { X, Send, Wallet, Mail, CheckCircle, RefreshCw, Sparkles, ShieldCheck, ArrowRight, Lock } from 'lucide-react';
import { triggerHaptic } from '../../utils/haptics';

export const AuthModal: React.FC = () => {
  const { isAuthModalOpen, setIsAuthModalOpen, loginWithTelegram, loginWithWeb3, loginWithEmail, session } = useAuth();
  const { connectWallet, isConnecting } = useWeb3();
  const { showToast } = useGame();

  const [activeTab, setActiveTab] = useState<'telegram' | 'web3' | 'email'>('telegram');

  // Email form state
  const [emailInput, setEmailInput] = useState('');
  const [passwordInput, setPasswordInput] = useState('');
  const [usernameInput, setUsernameInput] = useState('');
  const [emailError, setEmailError] = useState('');

  if (!isAuthModalOpen) return null;

  const handleTelegramAuth = async () => {
    triggerHaptic('medium');
    const success = await loginWithTelegram();
    if (success) {
      triggerHaptic('success');
      showToast('¡Bienvenido!', 'Has iniciado sesión con Telegram correctamente.', 'success');
    }
  };

  const handleWeb3Auth = async (walletType: string) => {
    triggerHaptic('medium');
    const connected = await connectWallet(walletType);
    if (connected) {
      const savedAddress = localStorage.getItem('ajo_wallet_address');
      if (savedAddress) {
        await loginWithWeb3(savedAddress);
        triggerHaptic('success');
        showToast('¡Wallet Conectada & Sesión Iniciada!', 'Tu billetera Web3 quedó vinculada en tu perfil.', 'success');
      }
    } else {
      showToast('Error de Conexión', 'No se pudo conectar la wallet Web3.', 'error');
    }
  };

  const handleEmailAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setEmailError('');

    if (!emailInput || !emailInput.includes('@')) {
      setEmailError('Por favor ingresa un correo electrónico válido');
      return;
    }

    if (!passwordInput || passwordInput.trim().length < 3) {
      setEmailError('Ingresa tu contraseña pre-establecida para continuar');
      return;
    }

    triggerHaptic('medium');
    const success = await loginWithEmail(emailInput, usernameInput, passwordInput);
    if (success) {
      triggerHaptic('success');
      const isSuper = emailInput.trim().toLowerCase() === 'horaciowalterortiz@gmail.com';
      showToast(
        isSuper ? '👑 SuperAdmin Autenticado' : '¡Sesión Iniciada!',
        `Bienvenido ${usernameInput || emailInput.split('@')[0]}`,
        'success'
      );
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-fadeIn">
      <div className="w-full max-w-md glass-panel rounded-3xl border border-purple-500/40 p-6 shadow-2xl relative overflow-hidden">
        {/* Background light glow */}
        <div className="absolute top-0 right-0 w-48 h-48 bg-purple-600/20 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-48 h-48 bg-emerald-500/20 rounded-full blur-3xl pointer-events-none" />

        {/* Close Button if user is already authenticated */}
        {session.isAuthenticated && (
          <button
            onClick={() => setIsAuthModalOpen(false)}
            className="absolute top-4 right-4 text-gray-400 hover:text-white p-1.5 rounded-full bg-white/5 hover:bg-white/10 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        )}

        {/* Modal Header */}
        <div className="text-center space-y-2 mb-6 relative z-10">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-gradient-to-r from-purple-500/20 to-emerald-500/20 border border-purple-500/30 text-xs font-bold text-sprout-300">
            <Sparkles className="w-3.5 h-3.5 text-yellow-400" />
            <span>AJO COIN AUTENTICACIÓN</span>
          </div>
          <h2 className="text-2xl font-black text-white tracking-wide">Selecciona tu método de Login</h2>
          <p className="text-xs text-gray-400">Accede a tu perfil, tus ajo-boxes y saldo on-chain</p>
        </div>

        {/* Auth Method Selector Tabs */}
        <div className="grid grid-cols-3 gap-1.5 p-1 bg-black/50 rounded-2xl border border-white/10 mb-5 relative z-10">
          <button
            onClick={() => setActiveTab('telegram')}
            className={`flex flex-col items-center justify-center py-2.5 px-1 rounded-xl text-xs font-bold transition-all ${
              activeTab === 'telegram'
                ? 'bg-gradient-to-r from-sky-600 to-blue-600 text-white shadow-lg shadow-sky-900/40'
                : 'text-gray-400 hover:text-white'
            }`}
          >
            <Send className="w-4 h-4 mb-1" />
            <span>Telegram</span>
          </button>

          <button
            onClick={() => setActiveTab('web3')}
            className={`flex flex-col items-center justify-center py-2.5 px-1 rounded-xl text-xs font-bold transition-all ${
              activeTab === 'web3'
                ? 'bg-gradient-to-r from-purple-600 to-indigo-600 text-white shadow-lg shadow-purple-900/40'
                : 'text-gray-400 hover:text-white'
            }`}
          >
            <Wallet className="w-4 h-4 mb-1" />
            <span>Web3</span>
          </button>

          <button
            onClick={() => setActiveTab('email')}
            className={`flex flex-col items-center justify-center py-2.5 px-1 rounded-xl text-xs font-bold transition-all ${
              activeTab === 'email'
                ? 'bg-gradient-to-r from-emerald-600 to-teal-600 text-white shadow-lg shadow-emerald-900/40'
                : 'text-gray-400 hover:text-white'
            }`}
          >
            <Mail className="w-4 h-4 mb-1" />
            <span>Correo</span>
          </button>
        </div>

        {/* Tab 1: TELEGRAM LOGIN */}
        {activeTab === 'telegram' && (
          <div className="space-y-4 relative z-10 animate-fadeIn">
            <div className="p-4 rounded-2xl bg-sky-950/40 border border-sky-500/30 text-center space-y-2">
              <div className="w-12 h-12 mx-auto rounded-full bg-sky-500/20 flex items-center justify-center border border-sky-400/40 text-sky-400">
                <Send className="w-6 h-6" />
              </div>
              <h4 className="font-bold text-sm text-white">Inicio Rápido con Telegram</h4>
              <p className="text-xs text-sky-200/80 leading-relaxed">
                Ingresa directamente usando tus credenciales de Telegram WebApp sin contraseña.
              </p>
            </div>

            <button
              onClick={handleTelegramAuth}
              className="w-full py-3.5 px-4 rounded-2xl bg-gradient-to-r from-sky-500 to-blue-600 hover:from-sky-400 hover:to-blue-500 text-white font-black text-sm shadow-xl hover:shadow-sky-500/20 active:scale-[0.98] transition-all flex items-center justify-center gap-2"
            >
              <Send className="w-4 h-4" />
              <span>Continuar con Telegram</span>
              <ArrowRight className="w-4 h-4 ml-auto" />
            </button>
          </div>
        )}

        {/* Tab 2: WEB3 WALLET LOGIN */}
        {activeTab === 'web3' && (
          <div className="space-y-3 relative z-10 animate-fadeIn">
            <div className="p-3 rounded-2xl bg-purple-950/50 border border-purple-500/30 space-y-1">
              <div className="flex items-center gap-1.5 text-emerald-400 text-xs font-bold">
                <ShieldCheck className="w-4 h-4 shrink-0" />
                <span>Vinculación Directa sin Redundancias</span>
              </div>
              <p className="text-[11px] text-purple-200/80 leading-snug">
                Al conectarte con Web3, la billetera queda guardada automáticamente en tu perfil de usuario para reclamos de AJO on-chain.
              </p>
            </div>

            <div className="space-y-2 max-h-56 overflow-y-auto pr-1">
              {[
                { name: 'MetaMask', icon: '🦊', badge: 'Popular' },
                { name: 'OKX Wallet', icon: '🖤', badge: 'EVM' },
                { name: 'WalletConnect', icon: '🔷', badge: 'Mobile' },
                { name: 'Coinbase Wallet', icon: '🔵', badge: 'EVM' },
              ].map((w) => (
                <button
                  key={w.name}
                  disabled={isConnecting}
                  onClick={() => handleWeb3Auth(w.name)}
                  className="w-full flex items-center justify-between p-3 rounded-2xl bg-white/5 hover:bg-purple-900/30 border border-white/10 hover:border-purple-500/40 active:scale-[0.98] transition-all disabled:opacity-50"
                >
                  <div className="flex items-center gap-3">
                    <span className="text-2xl">{w.icon}</span>
                    <div className="text-left">
                      <span className="font-bold text-sm text-white block">{w.name}</span>
                      <span className="text-[10px] text-purple-300 font-mono">Conexión Segura Web3</span>
                    </div>
                  </div>
                  {isConnecting ? (
                    <RefreshCw className="w-4 h-4 animate-spin text-purple-300" />
                  ) : (
                    <span className="text-[10px] px-2 py-0.5 rounded-full bg-purple-500/20 text-purple-300 border border-purple-500/30 font-bold uppercase">
                      {w.badge}
                    </span>
                  )}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Tab 3: CORREO ELECTRÓNICO (EMAIL) LOGIN */}
        {activeTab === 'email' && (
          <form onSubmit={handleEmailAuth} className="space-y-3.5 relative z-10 animate-fadeIn">
            <div>
              <label className="text-xs font-bold text-gray-300 mb-1 block">Correo Electrónico</label>
              <div className="relative">
                <Mail className="w-4 h-4 text-gray-400 absolute left-3 top-3.5" />
                <input
                  type="email"
                  required
                  placeholder="usuario@ejemplo.com"
                  value={emailInput}
                  onChange={(e) => setEmailInput(e.target.value)}
                  className="w-full pl-9 pr-4 py-2.5 rounded-xl bg-black/60 border border-white/15 text-white placeholder-gray-500 text-xs focus:outline-none focus:border-emerald-500 transition-colors"
                />
              </div>
            </div>

            <div>
              <label className="text-xs font-bold text-gray-300 mb-1 block">Contraseña Pre-establecida</label>
              <div className="relative">
                <Lock className="w-4 h-4 text-gray-400 absolute left-3 top-3.5" />
                <input
                  type="password"
                  required
                  placeholder="••••••••"
                  value={passwordInput}
                  onChange={(e) => setPasswordInput(e.target.value)}
                  className="w-full pl-9 pr-4 py-2.5 rounded-xl bg-black/60 border border-white/15 text-white placeholder-gray-500 text-xs focus:outline-none focus:border-emerald-500 transition-colors"
                />
              </div>
            </div>

            <div>
              <label className="text-xs font-bold text-gray-300 mb-1 block">Nombre de Usuario (Opcional)</label>
              <input
                type="text"
                placeholder="Ej. AjoFarmer99"
                value={usernameInput}
                onChange={(e) => setUsernameInput(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl bg-black/60 border border-white/15 text-white placeholder-gray-500 text-xs focus:outline-none focus:border-emerald-500 transition-colors"
              />
            </div>

            {emailError && <p className="text-xs text-red-400 font-medium">{emailError}</p>}

            <button
              type="submit"
              className="w-full py-3.5 px-4 rounded-2xl bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-400 hover:to-teal-500 text-white font-black text-sm shadow-xl hover:shadow-emerald-500/20 active:scale-[0.98] transition-all flex items-center justify-center gap-2"
            >
              <CheckCircle className="w-4 h-4" />
              <span>Iniciar Sesión / Registrarse</span>
            </button>
          </form>
        )}

        {/* Database Ready Footer Note */}
        <div className="mt-5 pt-3 border-t border-white/10 text-center relative z-10">
          <p className="text-[10px] text-gray-400">
            💾 Datos sincronizados localmente (LocalStorage) • Preparado para backend PostgreSQL / SQLite
          </p>
        </div>
      </div>
    </div>
  );
};
