import React, { useEffect } from 'react';
import { EvolutionStage } from '../../types';
import confetti from 'canvas-confetti';
import { Sparkles, Trophy, ArrowUpRight, CheckCircle2 } from 'lucide-react';

interface EvolutionCelebrationModalProps {
  stage: EvolutionStage;
  onClose: () => void;
}

export const EvolutionCelebrationModal: React.FC<EvolutionCelebrationModalProps> = ({
  stage,
  onClose,
}) => {
  useEffect(() => {
    // Launch celebratory confetti bursts!
    const duration = 2.5 * 1000;
    const end = Date.now() + duration;

    const frame = () => {
      confetti({
        particleCount: 5,
        angle: 60,
        spread: 55,
        origin: { x: 0 },
        colors: ['#34D399', '#F59E0B', '#EAB308', '#A855F7'],
      });
      confetti({
        particleCount: 5,
        angle: 120,
        spread: 55,
        origin: { x: 1 },
        colors: ['#34D399', '#F59E0B', '#EAB308', '#A855F7'],
      });

      if (Date.now() < end) {
        requestAnimationFrame(frame);
      }
    };
    frame();
  }, [stage]);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fadeIn">
      <div className="relative w-full max-w-sm glass-panel p-6 rounded-3xl border border-yellow-500/40 text-center space-y-5 shadow-2xl overflow-hidden">
        {/* Ambient background glow */}
        <div
          style={{ backgroundColor: stage.auraColor }}
          className="absolute -top-12 left-1/2 -translate-x-1/2 w-64 h-64 rounded-full blur-3xl pointer-events-none"
        />

        {/* Badge / Title */}
        <div className="relative z-10 space-y-1">
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-black bg-yellow-500/20 text-yellow-300 border border-yellow-500/40 uppercase tracking-widest animate-bounce">
            <Sparkles className="w-3.5 h-3.5" /> ¡NUEVA EVOLUCIÓN!
          </span>
          <h2 className="text-3xl font-black text-white tracking-tight drop-shadow-md pt-2">
            {stage.badgeIcon} {stage.name}
          </h2>
          <p className="text-xs text-amber-200/90 font-medium px-2 italic">
            "{stage.celebrationMessage}"
          </p>
        </div>

        {/* Visual Showcase Card */}
        <div className="relative z-10 glass-card p-5 rounded-2xl border border-white/10 space-y-3 bg-gradient-to-b from-white/5 to-black/40">
          <div className="text-6xl animate-pulse flex justify-center py-2">
            {stage.badgeIcon}
          </div>
          <p className="text-xs text-gray-300 leading-relaxed font-sans">
            {stage.description}
          </p>
        </div>

        {/* Stats & Unlocks */}
        <div className="relative z-10 grid grid-cols-2 gap-2 text-left text-xs">
          <div className="glass-panel p-2.5 rounded-xl border border-emerald-500/20 flex items-center gap-2">
            <Trophy className="w-4 h-4 text-emerald-400 shrink-0" />
            <div>
              <span className="block text-[10px] text-gray-400 font-semibold">NIVEL DE RANGO</span>
              <span className="font-extrabold text-emerald-300">Rango {stage.rank}</span>
            </div>
          </div>

          <div className="glass-panel p-2.5 rounded-xl border border-purple-500/20 flex items-center gap-2">
            <ArrowUpRight className="w-4 h-4 text-purple-400 shrink-0" />
            <div>
              <span className="block text-[10px] text-gray-400 font-semibold">TAMAÑO</span>
              <span className="font-extrabold text-purple-300">{stage.size === 'BIG' ? 'Grande' : 'Normal'}</span>
            </div>
          </div>
        </div>

        {/* Action Button */}
        <button
          onClick={onClose}
          className="relative z-10 w-full py-3.5 rounded-2xl font-black text-sm text-black bg-gradient-to-r from-yellow-400 via-amber-300 to-yellow-500 shadow-[0_0_20px_rgba(245,158,11,0.5)] hover:scale-[1.02] active:scale-95 transition-all flex items-center justify-center gap-2 uppercase tracking-wider"
        >
          <CheckCircle2 className="w-5 h-5" />
          <span>¡CONTINUAR JUGANDO!</span>
        </button>
      </div>
    </div>
  );
};
