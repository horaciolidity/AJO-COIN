import React from 'react';

interface SkinBackgroundProps {
  skinId: string;
}

export const SkinBackground: React.FC<SkinBackgroundProps> = ({ skinId }) => {
  switch (skinId) {
    case 'NINJA':
      return (
        <div className="absolute inset-0 pointer-events-none overflow-hidden rounded-3xl z-0 transition-all duration-700 bg-gradient-to-b from-slate-950 via-indigo-950 to-black">
          {/* Glowing Full Moon */}
          <div className="absolute top-4 right-6 w-20 h-20 rounded-full bg-slate-100 shadow-[0_0_40px_rgba(241,245,249,0.8)] opacity-90" />
          <div className="absolute top-6 right-8 w-16 h-16 rounded-full bg-slate-200/40 blur-sm" />
          
          {/* Bamboo Shadows */}
          <div className="absolute bottom-0 left-3 w-4 h-full bg-slate-900/60 rounded-full border-r border-indigo-900/30" />
          <div className="absolute bottom-0 left-9 w-6 h-3/4 bg-slate-900/50 rounded-full border-r border-indigo-900/30" />
          <div className="absolute bottom-0 right-4 w-5 h-full bg-slate-900/60 rounded-full border-l border-indigo-900/30" />

          {/* Floating Sakura / Embers */}
          <div className="absolute inset-0 flex justify-around text-xs pointer-events-none opacity-60 animate-pulse">
            <span className="animate-bounce text-pink-400" style={{ animationDelay: '0ms' }}>🌸</span>
            <span className="animate-bounce text-indigo-400" style={{ animationDelay: '300ms' }}>✨</span>
            <span className="animate-bounce text-pink-400" style={{ animationDelay: '600ms' }}>🌸</span>
          </div>
        </div>
      );

    case 'KING':
      return (
        <div className="absolute inset-0 pointer-events-none overflow-hidden rounded-3xl z-0 transition-all duration-700 bg-gradient-to-b from-amber-950 via-yellow-950/80 to-stone-950">
          {/* Golden Palace Pillars */}
          <div className="absolute inset-y-0 left-2 w-8 bg-gradient-to-r from-amber-600/40 via-yellow-500/20 to-transparent border-r border-amber-500/30" />
          <div className="absolute inset-y-0 right-2 w-8 bg-gradient-to-l from-amber-600/40 via-yellow-500/20 to-transparent border-l border-amber-500/30" />
          
          {/* Red Carpet Glow at bottom */}
          <div className="absolute bottom-0 inset-x-8 h-20 bg-gradient-to-t from-red-900/70 to-transparent rounded-t-full border-t border-red-500/30" />

          {/* Crown Jewels Sparkles */}
          <div className="absolute inset-0 flex justify-around text-sm pointer-events-none opacity-80 animate-pulse">
            <span className="animate-bounce" style={{ animationDelay: '100ms' }}>👑</span>
            <span className="animate-bounce" style={{ animationDelay: '400ms' }}>🪙</span>
            <span className="animate-bounce" style={{ animationDelay: '700ms' }}>✨</span>
          </div>
        </div>
      );

    case 'ROBOT':
      return (
        <div className="absolute inset-0 pointer-events-none overflow-hidden rounded-3xl z-0 transition-all duration-700 bg-gradient-to-b from-slate-950 via-cyan-950/80 to-slate-900">
          {/* Cyber Neon Grid Lines */}
          <div className="absolute inset-0 opacity-20 bg-[radial-gradient(#06b6d4_1px,transparent_1px)] [background-size:16px_16px]" />
          
          {/* Cyan Laser Beam */}
          <div className="absolute top-1/3 inset-x-0 h-0.5 bg-cyan-400 shadow-[0_0_15px_#06b6d4] opacity-70 animate-pulse" />
          <div className="absolute top-2/3 inset-x-0 h-0.5 bg-fuchsia-500 shadow-[0_0_15px_#d946ef] opacity-50 animate-pulse" style={{ animationDelay: '500ms' }} />

          {/* Matrix Data Rain */}
          <div className="absolute inset-0 flex justify-around text-[10px] font-mono text-cyan-400/60 pointer-events-none">
            <span className="animate-pulse">01101</span>
            <span className="animate-pulse" style={{ animationDelay: '200ms' }}>AJO_AI</span>
            <span className="animate-pulse" style={{ animationDelay: '400ms' }}>10110</span>
          </div>
        </div>
      );

    case 'FIRE':
      return (
        <div className="absolute inset-0 pointer-events-none overflow-hidden rounded-3xl z-0 transition-all duration-700 bg-gradient-to-b from-red-950 via-orange-950/90 to-black">
          {/* Lava Reservoir Glow at bottom */}
          <div className="absolute bottom-0 inset-x-0 h-24 bg-gradient-to-t from-orange-600/80 via-red-600/40 to-transparent blur-md animate-pulse" />

          {/* Rising Fiery Embers */}
          <div className="absolute inset-0 flex justify-around text-xs pointer-events-none opacity-80">
            <span className="animate-bounce text-amber-400" style={{ animationDelay: '50ms' }}>🔥</span>
            <span className="animate-bounce text-orange-500" style={{ animationDelay: '350ms' }}>💥</span>
            <span className="animate-bounce text-amber-300" style={{ animationDelay: '650ms' }}>🔥</span>
          </div>
        </div>
      );

    case 'ALIEN':
      return (
        <div className="absolute inset-0 pointer-events-none overflow-hidden rounded-3xl z-0 transition-all duration-700 bg-gradient-to-b from-indigo-950 via-purple-950 to-black">
          {/* Cosmic Galaxy Nebula */}
          <div className="absolute -top-10 -left-10 w-40 h-40 rounded-full bg-purple-600/30 blur-3xl animate-pulse" />
          <div className="absolute -bottom-10 -right-10 w-40 h-40 rounded-full bg-emerald-600/30 blur-3xl animate-pulse" style={{ animationDelay: '400ms' }} />

          {/* Flying UFO */}
          <div className="absolute top-6 left-8 text-base animate-bounce" style={{ animationDuration: '3s' }}>
            🛸
          </div>

          {/* Stars */}
          <div className="absolute inset-0 flex justify-around text-xs pointer-events-none opacity-90">
            <span className="animate-pulse text-purple-300">✨</span>
            <span className="animate-pulse text-cyan-300" style={{ animationDelay: '300ms' }}>🌌</span>
            <span className="animate-pulse text-emerald-300" style={{ animationDelay: '600ms' }}>✨</span>
          </div>
        </div>
      );

    case 'DEAD':
      return (
        <div className="absolute inset-0 pointer-events-none overflow-hidden rounded-3xl z-0 transition-all duration-700 bg-gradient-to-b from-zinc-950 via-emerald-950/60 to-black">
          {/* Spooky Toxic Fog */}
          <div className="absolute bottom-0 inset-x-0 h-28 bg-gradient-to-t from-emerald-900/50 via-zinc-900/70 to-transparent blur-md animate-pulse" />

          {/* Blood Red Moon */}
          <div className="absolute top-5 left-6 w-14 h-14 rounded-full bg-red-800 shadow-[0_0_25px_rgba(220,38,38,0.7)] opacity-80" />

          {/* Tombstones & Skulls */}
          <div className="absolute inset-0 flex justify-around text-xs pointer-events-none opacity-75">
            <span className="animate-bounce" style={{ animationDelay: '100ms' }}>💀</span>
            <span className="animate-bounce" style={{ animationDelay: '450ms' }}>🪦</span>
            <span className="animate-bounce" style={{ animationDelay: '800ms' }}>🦴</span>
          </div>
        </div>
      );

    case 'RICH':
      return (
        <div className="absolute inset-0 pointer-events-none overflow-hidden rounded-3xl z-0 transition-all duration-700 bg-gradient-to-b from-purple-950 via-amber-950/80 to-slate-950">
          {/* Vault Gold Pile Glow */}
          <div className="absolute bottom-0 inset-x-0 h-24 bg-gradient-to-t from-amber-500/40 via-yellow-600/20 to-transparent blur-md" />

          {/* Money & Diamond Rain */}
          <div className="absolute inset-0 flex justify-around text-sm pointer-events-none opacity-90">
            <span className="animate-bounce" style={{ animationDelay: '0ms' }}>💵</span>
            <span className="animate-bounce" style={{ animationDelay: '250ms' }}>💎</span>
            <span className="animate-bounce" style={{ animationDelay: '500ms' }}>💰</span>
            <span className="animate-bounce" style={{ animationDelay: '750ms' }}>💎</span>
          </div>
        </div>
      );

    default:
      // Default Garlic Garden Dojo
      return (
        <div className="absolute inset-0 pointer-events-none overflow-hidden rounded-3xl z-0 transition-all duration-700 bg-gradient-to-b from-emerald-950/70 via-slate-950 to-black">
          <div className="absolute top-0 inset-x-0 h-20 bg-gradient-to-b from-emerald-500/15 to-transparent blur-xl" />
          <div className="absolute inset-0 flex justify-around text-xs pointer-events-none opacity-50">
            <span className="animate-pulse text-emerald-400">🌱</span>
            <span className="animate-pulse text-sprout-400" style={{ animationDelay: '400ms' }}>🍃</span>
            <span className="animate-pulse text-emerald-300" style={{ animationDelay: '800ms' }}>🌿</span>
          </div>
        </div>
      );
  }
};
