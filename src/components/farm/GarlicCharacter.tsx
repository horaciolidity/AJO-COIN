import React, { useState, useEffect } from 'react';
import { useGame } from '../../context/GameContext';
import { SKINS_CATALOG } from '../../config/gameBalance';
import { spawnCanvasParticle } from '../../utils/particleSystem';

interface GarlicCharacterProps {
  onTap: (clientX?: number, clientY?: number) => void;
  comboCount: number;
}

const TAP_SOUND_EFFECTS = [
  '¡OUCH! 🧄',
  '¡ZAS! 💥',
  '¡MAS AJO! 🧄',
  '¡BOING! ✨',
  '¡CRAZY! 🤪',
  '¡AJOLOTE! 🚀',
  '¡AAAH! 😵',
  '¡SPICY! 🌶️',
  '¡AJO POWER! 💪',
  '¡OOF! 🥴',
];

export const GarlicCharacter: React.FC<GarlicCharacterProps> = ({ onTap, comboCount }) => {
  const { currentStage, inventory } = useGame();
  const [isPressed, setIsPressed] = useState(false);
  const [expressionIndex, setExpressionIndex] = useState(0);
  const [wobbleAngle, setWobbleAngle] = useState(0);
  const [isBlinking, setIsBlinking] = useState(false);

  // Find equipped skin
  const equippedSkin = SKINS_CATALOG.find((s) => s.id === inventory.equippedSkin) || SKINS_CATALOG[0];

  // Natural eye blinking timer loop
  useEffect(() => {
    const blinkInterval = setInterval(() => {
      setIsBlinking(true);
      setTimeout(() => setIsBlinking(false), 160);
    }, 4000);

    return () => clearInterval(blinkInterval);
  }, []);

  const triggerTapReaction = (clientX?: number, clientY?: number) => {
    setIsPressed(true);

    const nextExpr = Math.floor(Math.random() * 6);
    setExpressionIndex(nextExpr);

    const randomAngle = (Math.random() - 0.5) * 26;
    setWobbleAngle(randomAngle);

    // Spawn comic text popup on Canvas
    const randomText = TAP_SOUND_EFFECTS[Math.floor(Math.random() * TAP_SOUND_EFFECTS.length)];
    if (clientX && clientY) {
      spawnCanvasParticle(clientX, clientY - 40, randomText, '#FDE047');
    }

    onTap(clientX, clientY);
  };

  const handleTouchStart = (e: React.TouchEvent<HTMLDivElement>) => {
    const touch = e.touches[0];
    triggerTapReaction(touch.clientX, touch.clientY);
  };

  const handleTouchEnd = () => {
    setIsPressed(false);
  };

  const handleClick = (e: React.MouseEvent<HTMLDivElement>) => {
    triggerTapReaction(e.clientX, e.clientY);
    setTimeout(() => setIsPressed(false), 150);
  };

  // Expression index logic
  const currentExpr = isPressed
    ? expressionIndex
    : comboCount >= 50
    ? 6  // PANIC / FRENZY
    : comboCount >= 30
    ? 4  // Amazed
    : comboCount >= 15
    ? 1  // Crazy face
    : comboCount >= 8
    ? 5  // Surprised
    : 3; // Happy / Normal

  // Size scale difference between Small and Big evolutions
  const isSmall = currentStage.size === 'SMALL';
  const sizeContainerClass = isSmall
    ? 'w-48 h-48 sm:w-52 sm:h-52 scale-75 sm:scale-80'
    : 'w-72 h-72 sm:w-80 sm:h-80 scale-115 sm:scale-125';

  // Trembling intensity
  const trembleClass = comboCount >= 50
    ? 'animate-[combo-shake_0.15s_ease-in-out_infinite]'
    : comboCount >= 30
    ? 'animate-[combo-shake_0.3s_ease-in-out_infinite]'
    : '';

  // Aura intensity
  const auraScale = comboCount >= 50
    ? 'scale-150 opacity-80'
    : comboCount >= 25
    ? 'scale-125 animate-pulse'
    : 'scale-100 opacity-60';

  return (
    <div className="relative flex flex-col items-center justify-center cursor-pointer my-4 select-none">
      {/* Dynamic Evolution Glow Aura */}
      <div
        style={{ backgroundColor: currentStage.auraColor }}
        className={`absolute w-72 h-72 rounded-full transition-all duration-500 pointer-events-none blur-3xl ${auraScale}`}
      />
      {comboCount >= 50 && (
        <div className="absolute w-80 h-80 rounded-full pointer-events-none border-2 border-purple-400/40 animate-ping" />
      )}

      {/* Floating Magic Dust Particles */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-1/4 left-1/4 w-2 h-2 rounded-full bg-emerald-400/60 animate-ping" />
        <div className="absolute bottom-1/3 right-1/4 w-1.5 h-1.5 rounded-full bg-yellow-300/70 animate-pulse" />
        <div className="absolute top-1/2 right-1/3 w-2.5 h-2.5 rounded-full bg-purple-400/50 animate-bounce" />
      </div>

      {/* Main Interactive Animated Character */}
      <div
        onClick={handleClick}
        onTouchStart={handleTouchStart}
        onTouchEnd={handleTouchEnd}
        style={{
          transform: isPressed
            ? `scale(0.82, 1.18) rotate(${wobbleAngle}deg)`
            : `scale(1) rotate(0deg)`,
        }}
        className={`relative z-10 flex items-center justify-center transition-all duration-150 ease-out active:scale-90 ${sizeContainerClass} ${trembleClass} ${
          isPressed ? '' : 'hover:scale-105 animate-float'
        }`}
      >
        {/* Animated Drop Shadow beneath Character */}
        <div
          className={`absolute bottom-2 w-44 h-8 rounded-full bg-black/40 blur-md pointer-events-none transition-transform duration-150 ${
            isPressed ? 'scale-75 opacity-70' : 'scale-100 opacity-40'
          }`}
        />

        {/* High Quality Vector Garlic Character SVG */}
        <svg
          viewBox="0 0 200 200"
          className="w-full h-full drop-shadow-[0_15px_35px_rgba(16,185,129,0.4)] relative z-10"
        >
          <defs>
            {/* Body 3D Gradients */}
            <linearGradient id="garlicBodyGrad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor={currentStage.garlicBodyStartColor} />
              <stop offset="60%" stopColor={currentStage.garlicBodyStartColor} />
              <stop offset="100%" stopColor={currentStage.garlicBodyEndColor} />
            </linearGradient>

            {/* Glossy 3D Highlight */}
            <radialGradient id="garlicHighlight" cx="35%" cy="30%" r="65%">
              <stop offset="0%" stopColor="rgba(255,255,255,0.9)" />
              <stop offset="40%" stopColor="rgba(255,255,255,0.4)" />
              <stop offset="100%" stopColor="rgba(255,255,255,0)" />
            </radialGradient>

            {/* Sprout Leaf Gradient */}
            <linearGradient id="sproutGrad" x1="0%" y1="100%" x2="0%" y2="0%">
              <stop offset="0%" stopColor="#059669" />
              <stop offset="60%" stopColor="#10B981" />
              <stop offset="100%" stopColor="#34D399" />
            </linearGradient>

            {/* Fire Skin Gradient */}
            <linearGradient id="fireSkinGrad" x1="0%" y1="100%" x2="0%" y2="0%">
              <stop offset="0%" stopColor="#EF4444" />
              <stop offset="50%" stopColor="#F97316" />
              <stop offset="100%" stopColor="#FACC15" />
            </linearGradient>

            {/* Eye Iris Gradient */}
            <radialGradient id="irisGrad" cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor="#4C1D95" />
              <stop offset="70%" stopColor="#2E1065" />
              <stop offset="100%" stopColor="#0F172A" />
            </radialGradient>
          </defs>

          {/* SKIN OVERLAY: FIRE AURA (Behind Garlic Body) */}
          {equippedSkin.id === 'FIRE' && (
            <g className="animate-pulse">
              <path d="M 30 110 C 10 90, 20 60, 45 40 C 60 20, 85 5, 100 25 C 115 5, 140 20, 155 40 C 180 60, 190 90, 170 110 C 190 140, 175 180, 145 195 C 120 205, 80 205, 55 195 C 25 180, 10 140, 30 110 Z" fill="url(#fireSkinGrad)" opacity="0.45" />
              <path d="M 45 120 C 35 100, 45 75, 60 55 C 75 35, 95 20, 100 35 C 105 20, 125 35, 140 55 C 155 75, 165 100, 155 120 C 165 150, 150 175, 130 185 C 110 195, 90 195, 70 185 C 50 175, 35 150, 45 120 Z" fill="url(#fireSkinGrad)" opacity="0.65" />
            </g>
          )}

          {/* Animated Green Sprout Leaf Top */}
          <g className={`transition-transform duration-200 origin-bottom ${isPressed ? 'scale-125 -rotate-12' : 'animate-[wiggle_3s_ease-in-out_infinite]'}`}>
            <path d="M 100 35 C 95 15, 80 5, 70 10 C 85 25, 92 40, 95 50 Z" fill="url(#sproutGrad)" stroke="#047857" strokeWidth="1" />
            <path d="M 100 35 C 105 10, 125 5, 135 15 C 120 28, 110 40, 105 50 Z" fill="url(#sproutGrad)" stroke="#047857" strokeWidth="1" />
            <path d="M 100 30 C 98 10, 102 2, 100 0 C 98 10, 100 20, 100 30 Z" fill="#34D399" />
          </g>

          {/* Garlic Clove Ridges & Main Body */}
          <path
            d="M 100 45 C 50 45, 25 80, 25 125 C 25 170, 60 190, 100 190 C 140 190, 175 170, 175 125 C 175 80, 150 45, 100 45 Z"
            fill="url(#garlicBodyGrad)"
            stroke={currentStage.strokeColor}
            strokeWidth="3.5"
          />

          {/* Curved 3D Clove Segment Lines */}
          <path d="M 100 45 C 75 75, 60 110, 60 185" fill="none" stroke={currentStage.strokeColor} strokeWidth="2.5" strokeLinecap="round" opacity="0.7" />
          <path d="M 100 45 C 125 75, 140 110, 140 185" fill="none" stroke={currentStage.strokeColor} strokeWidth="2.5" strokeLinecap="round" opacity="0.7" />

          {/* 3D Glossy Specular Highlight */}
          <ellipse cx="80" cy="85" rx="35" ry="25" fill="url(#garlicHighlight)" opacity="0.7" />

          {/* SKIN OVERLAY: ROBOT CIRCUITS */}
          {equippedSkin.id === 'ROBOT' && (
            <g stroke="#06B6D4" strokeWidth="2" fill="none" opacity="0.8">
              <path d="M 45 130 L 65 130 L 75 150 L 90 150" />
              <path d="M 155 130 L 135 130 L 125 150 L 110 150" />
              <circle cx="90" cy="150" r="3" fill="#22D3EE" />
              <circle cx="110" cy="150" r="3" fill="#22D3EE" />
            </g>
          )}

          {/* SKIN OVERLAY: ZOMBIE STITCHES */}
          {equippedSkin.id === 'DEAD' && (
            <g stroke="#27272A" strokeWidth="2.5" strokeLinecap="round">
              <path d="M 130 145 L 155 160" />
              <path d="M 134 157 L 144 146" />
              <path d="M 142 163 L 152 152" />
              <path d="M 45 140 L 65 150" />
              <path d="M 48 150 L 58 140" />
            </g>
          )}

          {/* Glowing Blushing Cheeks */}
          <ellipse cx="58" cy="128" rx="10" ry="6" fill={isPressed ? '#EF4444' : '#F472B6'} opacity={isPressed ? '0.9' : '0.65'} className="transition-all" />
          <ellipse cx="142" cy="128" rx="10" ry="6" fill={isPressed ? '#EF4444' : '#F472B6'} opacity={isPressed ? '0.9' : '0.65'} className="transition-all" />

          {/* Sweat Drop on Tap */}
          {isPressed && (
            <path
              d="M 152 95 C 152 90, 157 85, 157 85 C 157 85, 162 90, 162 95 C 162 98, 157 101, 152 95 Z"
              fill="#60A5FA"
              className="animate-bounce"
            />
          )}

          {/* ========================================================================= */}
          {/* HIGH-QUALITY ANIMATED FACIAL EXPRESSIONS WITH NATURAL BLINKING & GLOSS */}
          {/* ========================================================================= */}

          {/* NATURAL EYE BLINK OVERRIDE */}
          {isBlinking && !isPressed && currentExpr !== 6 ? (
            <g>
              <path d="M 65 113 Q 75 118 85 113" fill="none" stroke="#2E1065" strokeWidth="4" strokeLinecap="round" />
              <path d="M 115 113 Q 125 118 135 113" fill="none" stroke="#2E1065" strokeWidth="4" strokeLinecap="round" />
              <path d="M 85 130 Q 100 142 115 130" fill="none" stroke="#2E1065" strokeWidth="4" strokeLinecap="round" />
            </g>
          ) : (
            <>
              {/* EXPR 0: OUCH / SQUINT */}
              {currentExpr === 0 && (
                <g>
                  <path d="M 65 110 L 80 117 L 65 124" fill="none" stroke="#2E1065" strokeWidth="4.5" strokeLinecap="round" strokeLinejoin="round" />
                  <path d="M 135 110 L 120 117 L 135 124" fill="none" stroke="#2E1065" strokeWidth="4.5" strokeLinecap="round" strokeLinejoin="round" />
                  <ellipse cx="100" cy="138" rx="14" ry="10" fill="#2E1065" />
                  <ellipse cx="100" cy="142" rx="9" ry="5" fill="#EF4444" />
                </g>
              )}

              {/* EXPR 1: CRAZY / WINK */}
              {currentExpr === 1 && (
                <g>
                  <circle cx="72" cy="113" r="14" fill="url(#irisGrad)" />
                  <circle cx="75" cy="109" r="5" fill="#FFFFFF" />
                  <circle cx="70" cy="116" r="2" fill="#FFFFFF" />
                  <circle cx="128" cy="115" r="8" fill="url(#irisGrad)" />
                  <circle cx="129" cy="113" r="3" fill="#FFFFFF" />
                  <path d="M 85 132 Q 100 148 115 132" fill="none" stroke="#2E1065" strokeWidth="4" strokeLinecap="round" />
                  <path d="M 96 136 C 96 148, 108 148, 108 136 Z" fill="#F43F5E" />
                </g>
              )}

              {/* EXPR 2: DIZZY / STARS */}
              {currentExpr === 2 && (
                <g>
                  <path d="M 68 108 L 82 122 M 82 108 L 68 122" stroke="#2E1065" strokeWidth="4.5" strokeLinecap="round" />
                  <path d="M 118 108 L 132 122 M 132 108 L 118 122" stroke="#2E1065" strokeWidth="4.5" strokeLinecap="round" />
                  <path d="M 82 136 Q 90 130 98 136 T 114 136" fill="none" stroke="#2E1065" strokeWidth="4" strokeLinecap="round" />
                  <polygon points="65,90 67,95 72,95 68,98 70,103 65,100 60,103 62,98 58,95 63,95" fill="#F59E0B" />
                  <polygon points="130,88 132,93 137,93 133,96 135,101 130,98 125,101 127,96 123,93 128,93" fill="#F59E0B" />
                </g>
              )}

              {/* EXPR 3: NORMAL HAPPY (Default Anime Eyes with Catchlights) */}
              {currentExpr === 3 && (
                <g>
                  {/* Left Eye */}
                  <circle cx="75" cy="114" r="12" fill="url(#irisGrad)" />
                  <circle cx="78" cy="110" r="4.5" fill="#FFFFFF" />
                  <circle cx="72" cy="117" r="1.8" fill="#FFFFFF" />
                  {/* Right Eye */}
                  <circle cx="125" cy="114" r="12" fill="url(#irisGrad)" />
                  <circle cx="128" cy="110" r="4.5" fill="#FFFFFF" />
                  <circle cx="122" cy="117" r="1.8" fill="#FFFFFF" />
                  {/* Eyebrows */}
                  <path d="M 66 98 Q 75 92 84 98" fill="none" stroke="#2E1065" strokeWidth="3" strokeLinecap="round" />
                  <path d="M 116 98 Q 125 92 134 98" fill="none" stroke="#2E1065" strokeWidth="3" strokeLinecap="round" />
                  {/* Smiling Mouth */}
                  <path d="M 84 130 Q 100 148 116 130" fill="#2E1065" stroke="#2E1065" strokeWidth="2" />
                  <path d="M 92 138 Q 100 146 108 138" fill="#EF4444" />
                </g>
              )}

              {/* EXPR 4: AMAZED / STAR EYES */}
              {currentExpr === 4 && (
                <g>
                  <polygon points="75,103 78,112 87,112 80,117 82,126 75,121 68,126 70,117 63,112 72,112" fill="#F59E0B" />
                  <polygon points="125,103 128,112 137,112 130,117 132,126 125,121 118,126 120,117 113,112 122,112" fill="#F59E0B" />
                  <path d="M 80 130 Q 100 155 120 130 Z" fill="#2E1065" />
                  <path d="M 88 130 L 112 130 L 108 136 L 92 136 Z" fill="#FFFFFF" />
                  <ellipse cx="100" cy="144" rx="8" ry="4" fill="#EF4444" />
                </g>
              )}

              {/* EXPR 5: SURPRISED / WIDE EYES */}
              {currentExpr === 5 && (
                <g>
                  <circle cx="75" cy="114" r="13" fill="#FFFFFF" stroke="#2E1065" strokeWidth="3" />
                  <circle cx="75" cy="114" r="6" fill="url(#irisGrad)" />
                  <circle cx="77" cy="112" r="2.5" fill="#FFFFFF" />

                  <circle cx="125" cy="114" r="13" fill="#FFFFFF" stroke="#2E1065" strokeWidth="3" />
                  <circle cx="125" cy="114" r="6" fill="url(#irisGrad)" />
                  <circle cx="127" cy="112" r="2.5" fill="#FFFFFF" />

                  <circle cx="100" cy="138" r="11" fill="#2E1065" />
                </g>
              )}

              {/* EXPR 6: PANIC / FRENZY MODE */}
              {currentExpr === 6 && (
                <g>
                  <circle cx="75" cy="113" r="13" fill="#FFFFFF" stroke="#2E1065" strokeWidth="2.5" />
                  <path d="M 75 113 m 0 -6 a 6 6 0 1 1 -0.01 0" fill="none" stroke="#2E1065" strokeWidth="2" />
                  <path d="M 75 113 m 0 -4 a 4 4 0 1 1 -0.01 0" fill="none" stroke="#7C3AED" strokeWidth="1.5" />
                  <circle cx="75" cy="113" r="2" fill="#2E1065" />

                  <circle cx="125" cy="113" r="13" fill="#FFFFFF" stroke="#2E1065" strokeWidth="2.5" />
                  <path d="M 125 113 m 0 -6 a 6 6 0 1 0 0.01 0" fill="none" stroke="#2E1065" strokeWidth="2" />
                  <path d="M 125 113 m 0 -4 a 4 4 0 1 0 0.01 0" fill="none" stroke="#7C3AED" strokeWidth="1.5" />
                  <circle cx="125" cy="113" r="2" fill="#2E1065" />

                  <ellipse cx="100" cy="142" rx="18" ry="13" fill="#2E1065" />
                  <ellipse cx="100" cy="146" rx="13" ry="8" fill="#EF4444" />
                  <ellipse cx="100" cy="150" rx="7" ry="4" fill="#B91C1C" />

                  <path d="M 152 88 C 152 83, 157 78, 157 78 C 157 78, 162 83, 162 88 C 162 91, 157 94, 152 88 Z" fill="#60A5FA" opacity="0.9" />
                  <path d="M 160 100 C 160 97, 163 94, 163 94 C 163 94, 166 97, 166 100 C 166 102, 163 104, 160 100 Z" fill="#60A5FA" opacity="0.7" />
                  <path d="M 40 85 C 40 82, 43 79, 43 79 C 43 79, 46 82, 46 85 C 46 87, 43 89, 40 85 Z" fill="#60A5FA" opacity="0.8" />
                </g>
              )}
            </>
          )}

          {/* ========================================================================= */}
          {/* HIGH-PRECISION SVG SKIN ACCESORIES & HEADGEAR RENDERED DIRECTLY ON GARLIC */}
          {/* ========================================================================= */}

          {/* SKIN 1: NINJA (🥷) */}
          {equippedSkin.id === 'NINJA' && (
            <g id="skin-ninja">
              <path d="M 35 75 Q 15 90 20 115" fill="none" stroke="#18181B" strokeWidth="7" strokeLinecap="round" />
              <path d="M 35 75 Q 10 105 10 130" fill="none" stroke="#27272A" strokeWidth="5" strokeLinecap="round" />
              <path d="M 35 70 C 60 55, 140 55, 165 70 L 163 88 C 140 73, 60 73, 37 88 Z" fill="#18181B" />
              <rect x="86" y="62" width="28" height="16" rx="4" fill="#E4E4E7" stroke="#71717A" strokeWidth="1.5" />
              <path d="M 94 70 L 106 70 M 100 65 L 100 75" stroke="#18181B" strokeWidth="2" strokeLinecap="round" />
              <path d="M 35 122 C 60 145, 140 145, 165 122 L 162 178 C 135 192, 65 192, 38 178 Z" fill="#18181B" stroke="#09090B" strokeWidth="2" />
              <path d="M 60 145 Q 100 160 140 145" fill="none" stroke="#27272A" strokeWidth="2" />
            </g>
          )}

          {/* SKIN 2: KING (👑) */}
          {equippedSkin.id === 'KING' && (
            <g id="skin-king">
              <polygon points="55,55 65,22 82,42 100,12 118,42 135,22 145,55" fill="#F59E0B" stroke="#B45309" strokeWidth="2.5" />
              <rect x="55" y="48" width="90" height="12" rx="3" fill="#D97706" stroke="#92400E" strokeWidth="2" />
              <circle cx="100" cy="12" r="5" fill="#EF4444" stroke="#991B1B" strokeWidth="1" />
              <circle cx="65" cy="22" r="4" fill="#3B82F6" stroke="#1E40AF" strokeWidth="1" />
              <circle cx="135" cy="22" r="4" fill="#10B981" stroke="#065F46" strokeWidth="1" />
              <circle cx="75" cy="54" r="3" fill="#EF4444" />
              <circle cx="100" cy="54" r="3.5" fill="#3B82F6" />
              <circle cx="125" cy="54" r="3" fill="#10B981" />
              <path d="M 30 170 C 60 195, 140 195, 170 170 C 155 200, 45 200, 30 170 Z" fill="#DC2626" stroke="#991B1B" strokeWidth="2" />
              <circle cx="100" cy="180" r="4" fill="#F59E0B" />
            </g>
          )}

          {/* SKIN 3: ROBOT (🤖) */}
          {equippedSkin.id === 'ROBOT' && (
            <g id="skin-robot">
              <rect x="55" y="100" width="90" height="26" rx="8" fill="#0F172A" stroke="#06B6D4" strokeWidth="2.5" />
              <line x1="60" y1="113" x2="140" y2="113" stroke="#22D3EE" strokeWidth="4" strokeLinecap="round" className="animate-pulse" />
              <circle cx="100" cy="113" r="5" fill="#67E8F9" />
              <rect x="20" y="115" width="10" height="20" rx="3" fill="#64748B" stroke="#334155" strokeWidth="2" />
              <rect x="170" y="115" width="10" height="20" rx="3" fill="#64748B" stroke="#334155" strokeWidth="2" />
              <line x1="100" y1="35" x2="100" y2="10" stroke="#64748B" strokeWidth="4" />
              <circle cx="100" cy="8" r="6" fill="#EF4444" className="animate-ping" />
              <circle cx="100" cy="8" r="6" fill="#EF4444" />
            </g>
          )}

          {/* SKIN 4: FIRE (🔥) */}
          {equippedSkin.id === 'FIRE' && (
            <g id="skin-fire">
              <path d="M 60 50 C 50 30, 65 15, 75 35 C 85 15, 100 0, 115 25 C 130 5, 145 30, 140 50 Z" fill="#F97316" />
              <path d="M 70 50 C 65 35, 75 25, 80 40 C 90 25, 100 10, 110 30 C 120 15, 135 35, 130 50 Z" fill="#FACC15" />
            </g>
          )}

          {/* SKIN 5: ALIEN (👽) */}
          {equippedSkin.id === 'ALIEN' && (
            <g id="skin-alien">
              <path d="M 80 40 Q 65 20 55 8" fill="none" stroke="#22C55E" strokeWidth="4" strokeLinecap="round" />
              <circle cx="55" cy="8" r="7" fill="#4ADE80" stroke="#15803D" strokeWidth="2" className="animate-bounce" />

              <path d="M 120 40 Q 135 20 145 8" fill="none" stroke="#22C55E" strokeWidth="4" strokeLinecap="round" />
              <circle cx="145" cy="8" r="7" fill="#4ADE80" stroke="#15803D" strokeWidth="2" className="animate-bounce" />

              <ellipse cx="100" cy="80" rx="10" ry="7" fill="#FFFFFF" stroke="#A855F7" strokeWidth="2" />
              <circle cx="100" cy="80" r="4" fill="#A855F7" />
              <circle cx="101" cy="79" r="1.5" fill="#FFFFFF" />
              <ellipse cx="100" cy="115" rx="86" ry="80" fill="rgba(34, 197, 94, 0.08)" stroke="rgba(74, 222, 128, 0.5)" strokeWidth="3" />
            </g>
          )}

          {/* SKIN 6: DEAD / ZOMBIE (💀) */}
          {equippedSkin.id === 'DEAD' && (
            <g id="skin-dead">
              <line x1="30" y1="90" x2="120" y2="130" stroke="#18181B" strokeWidth="3" />
              <ellipse cx="75" cy="113" rx="15" ry="15" fill="#18181B" stroke="#27272A" strokeWidth="2" />
              <circle cx="75" cy="111" r="4" fill="#E4E4E7" />
              <path d="M 72 118 L 78 118" stroke="#E4E4E7" strokeWidth="2" />
            </g>
          )}

          {/* SKIN 7: RICH (🎩) */}
          {equippedSkin.id === 'RICH' && (
            <g id="skin-rich">
              <ellipse cx="100" cy="50" rx="45" ry="9" fill="#18181B" stroke="#09090B" strokeWidth="2" />
              <rect x="68" y="10" width="64" height="40" rx="3" fill="#18181B" stroke="#09090B" strokeWidth="2" />
              <rect x="68" y="38" width="64" height="10" fill="#9333EA" />
              <rect x="94" y="37" width="12" height="12" rx="2" fill="#F59E0B" />

              <circle cx="125" cy="114" r="13" fill="rgba(255,255,255,0.2)" stroke="#F59E0B" strokeWidth="2.5" />
              <path d="M 137 121 Q 148 145 142 165" fill="none" stroke="#F59E0B" strokeWidth="2" strokeDasharray="2,2" />

              <polygon points="85,178 100,185 85,192" fill="#EF4444" stroke="#991B1B" strokeWidth="1" />
              <polygon points="115,178 100,185 115,192" fill="#EF4444" stroke="#991B1B" strokeWidth="1" />
              <circle cx="100" cy="185" r="3.5" fill="#B91C1C" />
            </g>
          )}
        </svg>

        {/* Emoji Reaction Badge on Top Corner */}
        <div className={`absolute -top-3 right-2 text-3xl drop-shadow-md ${currentExpr === 6 ? 'animate-spin' : 'animate-bounce'}`}>
          {currentExpr === 0 && '💥'}
          {currentExpr === 1 && '🤪'}
          {currentExpr === 2 && '😵'}
          {currentExpr === 3 && '😜'}
          {currentExpr === 4 && '🔥'}
          {currentExpr === 5 && '😱'}
          {currentExpr === 6 && '🌪️'}
        </div>

        {/* Dynamic Size Badge under character */}
        <div className="absolute -bottom-7 left-1/2 -translate-x-1/2 whitespace-nowrap z-20">
          <span className={`text-[10px] font-black uppercase px-3 py-0.5 rounded-full border shadow-md inline-flex items-center gap-1 ${
            isSmall
              ? 'bg-amber-500/20 text-amber-300 border-amber-500/40'
              : 'bg-purple-500/20 text-purple-300 border-purple-500/40 animate-pulse'
          }`}>
            <span>{isSmall ? '🤏' : '🐘'}</span>
            <span>{isSmall ? 'Ajo Pequeño' : 'Ajo Grande (Evolución)'}</span>
          </span>
        </div>
      </div>
    </div>
  );
};
