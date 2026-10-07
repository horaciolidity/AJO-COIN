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

  const animationClass =
    pose === 'IDLE'
      ? 'animate-[floatUp_2.5s_ease-in-out_infinite]'
      : pose === 'PUNCH'
      ? 'scale-110 translate-x-2 transition-transform duration-75'
      : pose === 'KICK'
      ? 'scale-110 translate-x-4 -rotate-6 transition-transform duration-75'
      : pose === 'SPECIAL'
      ? 'scale-125 transition-transform duration-100'
      : pose === 'HIT'
      ? '-translate-x-4 scale-95 brightness-200 contrast-200 transition-transform duration-75'
      : pose === 'VICTORY'
      ? 'scale-115 -translate-y-2 transition-transform duration-200'
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
        <img
          src={getSpriteSrc()}
          alt={isEnemy ? 'Enemy Fighter' : 'AJO Fighter'}
          className="w-full h-full object-contain drop-shadow-[0_8px_16px_rgba(0,0,0,0.7)]"
          onError={(e) => {
            // Graceful fallback to default idle sprite if pose fail
            (e.target as HTMLImageElement).src = isEnemy
              ? '/assets/fighter/enemy_brawler_idle.png'
              : '/assets/fighter/ajo_idle.png';
          }}
        />
      </div>
    </div>
  );
};
