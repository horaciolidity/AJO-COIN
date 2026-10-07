import React from 'react';

export type FighterPose = 'IDLE' | 'PUNCH' | 'KICK' | 'SPECIAL' | 'HIT' | 'VICTORY' | 'DEFEAT';

interface AnimatedFighterSpriteProps {
  pose: FighterPose;
  facing?: 'right' | 'left';
  isEnemy?: boolean;
  isHit?: boolean;
  isLowHp?: boolean;
  customSpriteUrl?: string;
  size?: 'sm' | 'md' | 'lg';
}

export const AnimatedFighterSprite: React.FC<AnimatedFighterSpriteProps> = ({
  pose,
  facing = 'right',
  isEnemy = false,
  isHit = false,
  isLowHp = false,
  customSpriteUrl,
  size = 'md',
}) => {
  // Determine image asset path based on character state & pose
  const getSpriteSrc = (): string => {
    if (customSpriteUrl === 'BAG') {
      return ''; // Render vector Punching Bag
    }
    if (customSpriteUrl) return customSpriteUrl;

    if (!isEnemy) {
      switch (pose) {
        case 'PUNCH':
          return '/assets/fighter/ajo_punch.png';
        case 'KICK':
          return '/assets/fighter/ajo_kick.png';
        case 'SPECIAL':
          return '/assets/fighter/ajo_special.png';
        case 'HIT':
          return '/assets/fighter/ajo_hit.png';
        case 'VICTORY':
          return '/assets/fighter/ajo_victory.png';
        case 'DEFEAT':
          return '/assets/fighter/ajo_hit.png';
        case 'IDLE':
        default:
          return '/assets/fighter/ajo_idle.png';
      }
    } else {
      // Enemy sprite poses
      switch (pose) {
        case 'HIT':
        case 'DEFEAT':
          return '/assets/fighter/enemy_brawler_idle.png';
        case 'PUNCH':
        case 'KICK':
        case 'SPECIAL':
        case 'IDLE':
        default:
          return '/assets/fighter/enemy_brawler_idle.png';
      }
    }
  };

  const dimensions =
    size === 'lg' ? 'w-48 h-48' : size === 'sm' ? 'w-32 h-32' : 'w-40 h-40';

  const transformFlip = facing === 'left' ? 'scale-x-[-1]' : '';

  const animationClass = isEnemy
    ? pose === 'PUNCH' || pose === 'SPECIAL'
      ? '-translate-x-8 scale-125 -rotate-12 z-30 drop-shadow-[0_0_25px_rgba(239,68,68,1)] transition-transform duration-75'
      : pose === 'HIT'
      ? 'translate-x-6 rotate-12 brightness-150 transition-transform duration-75'
      : 'animate-stance'
    : pose === 'IDLE'
    ? 'animate-stance'
    : pose === 'PUNCH'
    ? 'translate-x-6 scale-125 rotate-6 z-30 transition-transform duration-75'
    : pose === 'KICK'
    ? 'translate-x-8 scale-125 -rotate-12 z-30 transition-transform duration-75'
    : pose === 'SPECIAL'
    ? 'scale-135 animate-pulse z-30 drop-shadow-[0_0_30px_rgba(245,158,11,1)]'
    : pose === 'HIT'
    ? '-translate-x-6 rotate-[-12deg] brightness-200 transition-transform duration-75'
    : pose === 'VICTORY'
    ? 'scale-115 -translate-y-3 transition-transform duration-200'
    : '';

  return (
    <div className={`relative flex flex-col items-center justify-end select-none ${dimensions}`}>
      {/* 2D Fighter Ground Contact Shadow */}
      <div className="absolute bottom-1 w-24 h-4 rounded-full bg-black/60 blur-xs transform scale-x-125" />

      {/* Main Fighter Sprite Container */}
      <div
        className={`relative z-10 w-full h-full flex items-center justify-center transition-all duration-100 ${transformFlip} ${animationClass} ${
          isHit ? 'filter drop-shadow-[0_0_15px_rgba(239,68,68,0.9)]' : ''
        } ${isLowHp ? 'opacity-75' : ''}`}
      >
        {customSpriteUrl === 'BAG' ? (
          <div className="flex flex-col items-center justify-center relative w-full h-full">
            {/* Hanging Chain */}
            <div className="w-1 h-8 bg-gradient-to-b from-gray-500 via-gray-300 to-gray-600 border-x border-black/40 shadow" />
            {/* Leather Punching Bag Body */}
            <div
              className={`w-24 h-36 rounded-3xl bg-gradient-to-r from-red-800 via-red-600 to-red-900 border-2 border-red-400 shadow-[0_10px_25px_rgba(0,0,0,0.8)] flex flex-col items-center justify-between py-4 relative overflow-hidden ${
                isHit ? 'animate-hit scale-105 border-yellow-400' : 'animate-stance'
              }`}
            >
              {/* Target Stripes */}
              <div className="w-full h-3 bg-black/40 border-y border-white/20" />
              <div className="w-12 h-12 rounded-full border-2 border-amber-400/80 bg-black/40 flex items-center justify-center text-xl font-black text-amber-300 shadow-inner">
                🥊
              </div>
              <div className="w-full h-3 bg-black/40 border-y border-white/20" />
            </div>
          </div>
        ) : (
          <img
            src={getSpriteSrc()}
            alt={isEnemy ? 'Enemy Fighter' : 'AJO Fighter'}
            className="w-full h-full object-contain drop-shadow-[0_8px_16px_rgba(0,0,0,0.7)]"
            onError={(e) => {
              (e.target as HTMLImageElement).src = isEnemy
                ? '/assets/fighter/enemy_brawler_idle.png'
                : '/assets/fighter/ajo_idle.png';
            }}
          />
        )}
      </div>
    </div>
  );
};
