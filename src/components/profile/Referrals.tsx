import React, { useState } from 'react';
import { useGame } from '../../context/GameContext';
import { Users, Copy, Check, Share2, Award, Sparkles, Gift } from 'lucide-react';
import { triggerHaptic } from '../../utils/haptics';

export const Referrals: React.FC = () => {
  const { user, showToast } = useGame();
  const [copied, setCopied] = useState(false);

  const referralCode = user.referralCode || 'AJO-X7K29';
  const referralLink = `https://t.me/ajocoin_bot?start=ref_${referralCode}`;

  const handleCopyLink = () => {
    triggerHaptic('light');
    try {
      navigator.clipboard.writeText(referralLink);
      setCopied(true);
      showToast('¡Enlace Copiado!', 'Tu enlace de referido ha sido copiado al portapapeles.', 'success');
      setTimeout(() => setCopied(false), 2200);
    } catch (e) {
      showToast('Error', 'No se pudo copiar el enlace.', 'error');
    }
  };

  const handleShareTelegram = () => {
    triggerHaptic('medium');
    const viralMessage =
      `🧄 ¡Únete a la Temporada 1 de AJO COIN en Telegram! 🚀\n\n` +
      `🔥 Tapea la cabeza de Ajo, completa cajas, evoluciona tu personaje y acumula AJO Points de Temporada para escalar en el ranking global! 🏆\n\n` +
      `🎁 ¡Entra con mi enlace exclusivo y recibe +500 GC y +50 Dientes de Ajo 🦷 gratis de bienvenida!\n\n` +
      `👇 ¡Haz clic y empieza a cultivar tu Ajo ahora!`;

    const shareUrl = `https://t.me/share/url?url=${encodeURIComponent(referralLink)}&text=${encodeURIComponent(viralMessage)}`;

    // If inside Telegram WebApp
    const tg = (window as any).Telegram?.WebApp;
    if (tg && tg.openTelegramLink) {
      tg.openTelegramLink(shareUrl);
    } else {
      window.open(shareUrl, '_blank');
    }
  };

  return (
    <div className="space-y-4 p-1 max-w-md mx-auto pb-20">
      {/* Banner Principal de Referidos */}
      <div className="glass-card-green p-4 rounded-3xl border border-emerald-500/40 space-y-3 shadow-2xl text-center relative overflow-hidden bg-gradient-to-b from-emerald-950/40 via-black/80 to-purple-950/30">
        <div className="absolute top-0 right-0 bg-amber-400 text-black text-[9px] font-black px-3 py-1 rounded-bl-xl uppercase tracking-wider shadow">
          BONO RECOMPENSA 🎁
        </div>

        <div className="pt-2">
          <span className="text-4xl inline-block animate-bounce">👥🧄</span>
          <h3 className="text-lg font-black text-white mt-1">INVITA AMIGOS Y GANA CRIPTO</h3>
          <p className="text-xs text-gray-300 mt-1">
            Gana <span className="text-amber-300 font-extrabold">+500 GC</span> y <span className="text-emerald-300 font-extrabold">+50 Dientes 🦷</span> por cada amigo que se una con tu enlace.
          </p>
        </div>

        {/* Link Box */}
        <div className="bg-black/60 p-2.5 rounded-2xl border border-white/10 flex items-center justify-between gap-2 shadow-inner">
          <span className="font-mono text-xs text-amber-200 truncate pl-1">
            {referralLink}
          </span>
          <button
            onClick={handleCopyLink}
            className="px-3.5 py-2 rounded-xl bg-gradient-to-r from-sprout-500 to-emerald-600 text-white text-xs font-black hover:brightness-110 active:scale-95 transition-all flex items-center gap-1.5 shrink-0 shadow-md"
          >
            {copied ? <Check className="w-4 h-4 text-white" /> : <Copy className="w-4 h-4" />}
            <span>{copied ? 'COPIADO' : 'COPIAR'}</span>
          </button>
        </div>

        {/* Botón Compartir Telegram */}
        <button
          onClick={handleShareTelegram}
          className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 text-white font-black text-xs shadow-xl hover:scale-[1.02] active:scale-95 transition-all flex items-center justify-center gap-2"
        >
          <Share2 className="w-4 h-4" />
          <span>COMPARTIR EN TELEGRAM A MIS AMIGOS</span>
        </button>
      </div>

      {/* Tarjeta de Recomendación Viral */}
      <div className="glass-panel p-4 rounded-3xl border border-amber-500/30 bg-amber-950/20 space-y-2">
        <h4 className="font-extrabold text-xs text-amber-300 flex items-center gap-1.5 uppercase tracking-wider">
          <Sparkles className="w-4 h-4 text-amber-400" /> Por qué recomendar AJO COIN:
        </h4>
        <ul className="text-[11px] text-gray-300 space-y-1.5 list-disc list-inside">
          <li><strong className="text-white">Temporada 1 Activa:</strong> Acumula AJO Points completando misiones y cajas.</li>
          <li><strong className="text-white">Modo Frenzy & Plagas:</strong> Juego adictivo con jefes plaga y multiplicadores.</li>
          <li><strong className="text-white">Bono de Bienvenida:</strong> Tus referidos reciben 500 GC gratis para empezar.</li>
        </ul>
      </div>

      {/* Hitos de Referencia para Jugadores y Streamers (hasta 20,000+ Referidos) */}
      <div className="glass-panel p-4 rounded-3xl border border-purple-500/30 space-y-3">
        <div className="flex items-center justify-between">
          <h4 className="font-extrabold text-sm text-white flex items-center gap-1.5">
            <Award className="w-4 h-4 text-amber-400" /> HITOS DE RECOMPENSAS STREAMER & CREATIVOS
          </h4>
          <span className="text-[9px] bg-amber-400/20 text-amber-300 px-2 py-0.5 rounded-full font-bold border border-amber-400/40">
            HASTA +20,000 REFERIDOS 🚀
          </span>
        </div>

        <div className="space-y-2 text-xs">
          {[
            { level: 'NIVEL 1', target: '5 Referidos', reward: '+2,500 GC Bonus + 50 🦷', icon: '🥉', count: 1 },
            { level: 'NIVEL 2', target: '25 Referidos', reward: '+15,000 GC + 2 AJO', icon: '🥈', count: 0 },
            { level: 'NIVEL 3', target: '100 Referidos', reward: '+100,000 GC + 10 AJO', icon: '🥇', count: 0 },
            { level: 'STREAMER BRONCE 🎥', target: '500 Referidos', reward: '+500,000 GC + 50 AJO + Skin Creador 🎬', icon: '📹', count: 0 },
            { level: 'STREAMER PLATA 🌟', target: '2,500 Referidos', reward: '+2,500,000 GC + 300 AJO + Insignia Influencer', icon: '🌟', count: 0 },
            { level: 'STREAMER ORO 👑', target: '10,000 Referidos', reward: '+10,000,000 GC + 1,500 AJO + Rol VIP en Telegram', icon: '👑', count: 0 },
            { level: 'STREAMER LEYENDA 🏆', target: '20,000+ Referidos', reward: '+25,000,000 GC + 5,000 AJO + Pool Airdrop Exclusivo 💎', icon: '🏆', count: 0 },
          ].map((tier) => (
            <div
              key={tier.level}
              className="p-3 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-between gap-2"
            >
              <div className="flex items-center gap-2.5 min-w-0">
                <span className="text-2xl shrink-0">{tier.icon}</span>
                <div className="min-w-0">
                  <h5 className="font-extrabold text-white text-xs truncate">{tier.level} ({tier.target})</h5>
                  <p className="text-[10px] text-amber-300 font-semibold truncate">{tier.reward}</p>
                </div>
              </div>
              <span className="text-[10px] bg-purple-500/20 text-purple-300 px-2 py-1 rounded-full font-bold border border-purple-500/30 shrink-0">
                {tier.count} Invitados
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
