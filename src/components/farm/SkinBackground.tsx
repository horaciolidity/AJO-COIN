import React from 'react';

interface SkinBackgroundProps {
  skinId: string;
}

const BG_IMAGES: Record<string, string> = {
  NINJA: '/assets/backgrounds/ninja.jpg',
  ROBOT: '/assets/backgrounds/robot.jpg',
  KING: '/assets/backgrounds/king.jpg',
  FIRE: '/assets/backgrounds/fire.jpg',
  ALIEN: '/assets/backgrounds/alien.jpg',
  DEAD: '/assets/backgrounds/dead.jpg',
  RICH: '/assets/backgrounds/rich.jpg',
  DEFAULT: '/assets/backgrounds/ninja.jpg',
};

export const SkinBackground: React.FC<SkinBackgroundProps> = ({ skinId }) => {
  const bgPath = BG_IMAGES[skinId] || BG_IMAGES.DEFAULT;

  return (
    <div className="absolute inset-0 pointer-events-none overflow-hidden rounded-3xl z-0 transition-all duration-700">
      {/* Photographic High-Resolution Wallpaper */}
      <img
        src={bgPath}
        alt={`${skinId} Background`}
        className="w-full h-full object-cover object-center transform scale-105 transition-all duration-1000 opacity-80"
        style={{ filter: 'brightness(0.75) contrast(1.1)' }}
      />

      {/* Vignette & Gradient Overlays for readable text & contrast */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-black/60" />
      <div className="absolute inset-0 bg-radial-gradient from-transparent via-black/30 to-black/70" />

      {/* Skin-specific atmospheric ambient light glow */}
      {skinId === 'NINJA' && (
        <div className="absolute inset-0 bg-indigo-950/30 mix-blend-color-dodge pointer-events-none" />
      )}
      {skinId === 'ROBOT' && (
        <div className="absolute inset-0 bg-cyan-950/30 mix-blend-screen pointer-events-none" />
      )}
      {skinId === 'KING' && (
        <div className="absolute inset-0 bg-amber-950/30 mix-blend-color-dodge pointer-events-none" />
      )}
      {skinId === 'FIRE' && (
        <div className="absolute inset-0 bg-orange-950/40 mix-blend-color-dodge pointer-events-none" />
      )}
      {skinId === 'ALIEN' && (
        <div className="absolute inset-0 bg-purple-950/35 mix-blend-color-dodge pointer-events-none" />
      )}
      {skinId === 'DEAD' && (
        <div className="absolute inset-0 bg-emerald-950/35 mix-blend-color-dodge pointer-events-none" />
      )}
      {skinId === 'RICH' && (
        <div className="absolute inset-0 bg-yellow-950/35 mix-blend-color-dodge pointer-events-none" />
      )}
    </div>
  );
};
