import React, { useState } from 'react';
import { X, Share2, Copy, Check, Sparkles, Trophy, Award, Zap } from 'lucide-react';
import { triggerHaptic } from '../../utils/haptics';

interface SocialShareModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  subtitle: string;
  badgeIcon?: string;
  shareType: 'RANK' | 'EVOLUTION' | 'ACHIEVEMENT';
  rankNumber?: number;
  stageName?: string;
  referralCode: string;
}

export const SocialShareModal: React.FC<SocialShareModalProps> = ({
  isOpen,
  onClose,
  title,
  subtitle,
  badgeIcon = '🧄',
  shareType,
  rankNumber,
  stageName,
  referralCode,
}) => {
  const [copied, setCopied] = useState(false);

  if (!isOpen) return null;

  const referralLink = `https://t.me/ajocoin_bot?start=ref_${referralCode}`;

  let shareText = '';
  if (shareType === 'RANK') {
    shareText = `🏆 ¡Estoy en el PUESTO #${rankNumber || 1} de la Temporada 1 de AJO COIN! 🧄✨\n\n` +
      `🔥 Ven a tapear el ajo, evoluciona tu personaje y compite en el ranking global de AJO Points.\n\n` +
      `👇 ¡Únete con mi enlace y recibe +500 GC gratis de bienvenida!\n${referralLink}`;
  } else if (shareType === 'EVOLUTION') {
    shareText = `⚡ ¡MI AJO HA EVOLUCIONADO A ${stageName || 'ETAPA MÁXIMA'}! 🧄🚀\n\n` +
      `🔥 ¡Tapea la cabeza de Ajo y compite en la Temporada 1 por AJO Points!\n\n` +
      `👇 ¡Entra con mi enlace y reclamos tu bono de inicio gratis!\n${referralLink}`;
  } else {
    shareText = `🌟 ¡He desbloqueado el logro "${title}" en AJO COIN! 🧄👑\n\n` +
      `🔥 ¡Únete a la fiebre de AJO COIN en Telegram!\n${referralLink}`;
  }

  const handleCopy = () => {
    triggerHaptic('light');
    try {
      navigator.clipboard.writeText(shareText);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (e) {}
  };

  const handleShareTelegram = () => {
    triggerHaptic('medium');
    const shareUrl = `https://t.me/share/url?url=${encodeURIComponent(referralLink)}&text=${encodeURIComponent(shareText)}`;
    const tg = (window as any).Telegram?.WebApp;
    if (tg?.openTelegramLink) tg.openTelegramLink(shareUrl);
    else window.open(shareUrl, '_blank');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fadeIn">
      <div className="w-full max-w-sm glass-panel rounded-3xl border border-purple-500/40 p-5 shadow-2xl relative text-center space-y-4 bg-gradient-to-b from-purple-950/60 via-black to-emerald-950/40">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-white p-1.5 rounded-full bg-white/5"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Header Badge */}
        <div className="pt-2 flex flex-col items-center space-y-2">
          <div className="w-16 h-16 rounded-full bg-gradient-to-tr from-amber-500 via-purple-600 to-emerald-400 p-0.5 shadow-lg shadow-purple-500/30">
            <div className="w-full h-full rounded-full bg-black flex items-center justify-center text-3xl">
              {badgeIcon}
            </div>
          </div>
          <span className="text-[10px] font-black uppercase tracking-widest bg-amber-400/20 text-amber-300 px-3 py-1 rounded-full border border-amber-400/30">
            {shareType === 'RANK' ? 'SEASON 1 RANKING' : shareType === 'EVOLUTION' ? 'NUEVA EVOLUCIÓN' : 'LOGRO DESBLOQUEADO'}
          </span>
          <h3 className="text-lg font-black text-white">{title}</h3>
          <p className="text-xs text-gray-300">{subtitle}</p>
        </div>

        {/* Card Preview */}
        <div className="bg-black/60 p-3 rounded-2xl border border-white/10 text-left text-xs font-mono text-gray-300 whitespace-pre-wrap max-h-32 overflow-y-auto">
          {shareText}
        </div>

        {/* Buttons */}
        <div className="space-y-2 pt-1">
          <button
            onClick={handleShareTelegram}
            className="w-full py-3 rounded-2xl bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 text-white font-black text-xs shadow-lg hover:scale-[1.02] active:scale-95 transition-all flex items-center justify-center gap-2"
          >
            <Share2 className="w-4 h-4" />
            <span>COMPARTIR EN TELEGRAM</span>
          </button>

          <button
            onClick={handleCopy}
            className="w-full py-2.5 rounded-xl bg-white/10 hover:bg-white/15 border border-white/20 text-gray-200 text-xs font-bold transition-all flex items-center justify-center gap-1.5"
          >
            {copied ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
            <span>{copied ? '¡TEXTO COPIADO!' : 'COPIAR TEXTO VIRAL'}</span>
          </button>
        </div>
      </div>
    </div>
  );
};
