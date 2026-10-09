import React, { useEffect, useState, useRef } from 'react';
import { preloadFighterAssets } from '../../utils/assetPreloader';
import { getTransparentSpriteDataUrl } from '../../utils/transparentSprite';

export type FighterPose =
  | 'IDLE'
  | 'WALK'
  | 'PUNCH'
  | 'KICK'
  | 'SPECIAL'
  | 'HIT'
  | 'VICTORY'
  | 'DEFEAT'
  | 'WINDUP';

interface AnimatedFighterSpriteProps {
  pose: FighterPose;
  facing?: 'right' | 'left';
  isEnemy?: boolean;
  isHit?: boolean;
  isLowHp?: boolean;
  customSpriteUrl?: string;
  size?: 'sm' | 'md' | 'lg';
}

export const AnimatedFighterSprite: React.FC<AnimatedFighterSpriteProps> = React.memo(({
  pose,
  facing = 'right',
  isEnemy = false,
  isHit = false,
  isLowHp = false,
  customSpriteUrl,
  size = 'md',
}) => {
  const [imagesLoaded, setImagesLoaded] = useState(false);
  const [processedSpriteUrl, setProcessedSpriteUrl] = useState<string>('');
  const imgRef = useRef<HTMLImageElement | null>(null);

  useEffect(() => {
    preloadFighterAssets().then(() => {
      setImagesLoaded(true);
    });
  }, []);

  // Determine image asset path based on character state & pose
  const getSpriteSrc = (): string => {
    if (customSpriteUrl === 'BAG') {
      return ''; // Render vector Punching Bag
    }

    if (!isEnemy) {
      if (customSpriteUrl) return customSpriteUrl;
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
        case 'WALK':
        case 'IDLE':
        default:
          return '/assets/fighter/ajo_idle.png';
      }
    } else {
      // Dynamic Enemy sprite selection
      const baseSprite = customSpriteUrl || '/assets/fighter/enemy_brawler_idle.png';
      const isAttacking = pose === 'PUNCH' || pose === 'KICK' || pose === 'SPECIAL';

      if (baseSprite.includes('ninja')) {
        return isAttacking ? '/assets/fighter/enemy_ninja_attack.png' : '/assets/fighter/enemy_ninja_idle.png';
      }
      if (baseSprite.includes('samurai')) {
        return isAttacking ? '/assets/fighter/enemy_samurai_attack.png' : '/assets/fighter/enemy_samurai_idle.png';
      }
      if (baseSprite.includes('brawler')) {
        return isAttacking ? '/assets/fighter/enemy_brawler_attack.png' : '/assets/fighter/enemy_brawler_idle.png';
      }
      if (baseSprite.includes('beast')) {
        return '/assets/fighter/enemy_beast_idle.png';
      }

      return baseSprite;
    }
  };

  const rawSrc = getSpriteSrc();

  // Process image on load to strip out checkerboard/box background for enemy
  const handleImageLoad = (e: React.SyntheticEvent<HTMLImageElement, Event>) => {
    const img = e.currentTarget;
    if (isEnemy && img) {
      const transparentDataUrl = getTransparentSpriteDataUrl(img);
      if (transparentDataUrl && transparentDataUrl !== processedSpriteUrl) {
        setProcessedSpriteUrl(transparentDataUrl);
      }
    }
  };

  const currentDisplaySrc = isEnemy && processedSpriteUrl ? processedSpriteUrl : rawSrc;

  const dimensions =
    size === 'lg' ? 'w-48 h-48' : size === 'sm' ? 'w-32 h-32' : 'w-44 h-44';

  const transformFlip = facing === 'left' ? 'scale-x-[-1]' : '';

  // Arena Physics: Lunging towards center during attacks
  const animationClass = isEnemy
    ? pose === 'WINDUP'
      ? 'scale-110 -translate-x-4 rotate-6 drop-shadow-[0_0_20px_rgba(239,68,68,1)] filter saturate-200 animate-pulse transition-transform duration-100'
      : pose === 'PUNCH' || pose === 'SPECIAL' || pose === 'KICK'
      ? '-translate-x-20 scale-135 -rotate-12 z-30 drop-shadow-[0_0_25px_rgba(239,68,68,1)] transition-transform duration-100 ease-out'
      : pose === 'HIT'
      ? 'translate-x-10 rotate-12 brightness-200 contrast-150 transition-transform duration-75'
      : pose === 'DEFEAT'
      ? 'translate-x-16 rotate-45 opacity-40 grayscale blur-[1px] transition-all duration-300'
      : 'animate-stance'
    : pose === 'IDLE'
    ? 'animate-stance'
    : pose === 'WALK'
    ? 'translate-x-4 animate-stance'
    : pose === 'PUNCH'
    ? 'translate-x-16 scale-130 rotate-6 z-30 transition-transform duration-100 ease-out'
    : pose === 'KICK'
    ? 'translate-x-20 scale-135 -rotate-12 z-30 transition-transform duration-100 ease-out'
    : pose === 'SPECIAL'
    ? 'scale-140 translate-x-16 animate-pulse z-30 drop-shadow-[0_0_30px_rgba(245,158,11,1)]'
    : pose === 'HIT'
    ? '-translate-x-10 rotate-[-12deg] brightness-200 contrast-150 transition-transform duration-75'
    : pose === 'VICTORY'
    ? 'scale-120 -translate-y-4 transition-transform duration-200 drop-shadow-[0_0_20px_rgba(16,185,129,0.8)]'
    : pose === 'DEFEAT'
    ? 'rotate-90 opacity-50 grayscale transition-all duration-300'
    : '';

  return (
    <div className={`relative flex flex-col items-center justify-end select-none ${dimensions} will-change-transform`}>
      {/* 2D Fighter Ground Contact Shadow */}
      <div className={`absolute bottom-1 w-24 h-4 rounded-full bg-black/60 blur-xs transform scale-x-125 transition-transform duration-100 ${
        pose === 'PUNCH' || pose === 'KICK' || pose === 'SPECIAL' ? 'scale-x-175 opacity-80' : ''
      }`} />

      {/* Main Fighter Sprite Container - 100% Solid Opacity */}
      <div
        className={`relative z-10 w-full h-full flex items-center justify-center transition-transform duration-100 ${transformFlip} ${animationClass} ${
          isHit ? 'filter drop-shadow-[0_0_25px_rgba(239,68,68,1)]' : ''
        }`}
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
              <div className="w-full h-3 bg-black/40 border-y border-white/20" />
              <div className="w-12 h-12 rounded-full border-2 border-amber-400/80 bg-black/40 flex items-center justify-center text-xl font-black text-amber-300 shadow-inner">
                🥊
              </div>
              <div className="w-full h-3 bg-black/40 border-y border-white/20" />
            </div>
          </div>
        ) : (
          <div className="relative w-full h-full flex items-center justify-center">
            <img
              ref={imgRef}
              src={currentDisplaySrc}
              alt={isEnemy ? 'Enemy Fighter' : 'AJO Fighter'}
              onLoad={handleImageLoad}
              crossOrigin="anonymous"
              className="w-full h-full object-contain drop-shadow-[0_8px_16px_rgba(0,0,0,0.8)] opacity-100"
              style={{
                pointerEvents: 'none',
                userSelect: 'none',
              }}
              onError={(e) => {
                (e.target as HTMLImageElement).src = isEnemy
                  ? '/assets/fighter/enemy_brawler_idle.png'
                  : '/assets/fighter/ajo_idle.png';
              }}
            />
          </div>
        )}
      </div>
    </div>
  );
});
