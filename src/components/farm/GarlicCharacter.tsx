import React, { useState } from 'react';
import { useGame } from '../../context/GameContext';
import { SKINS_CATALOG } from '../../config/gameBalance';

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

interface FloatingText {
  id: number;
  text: string;
  x: number;
  y: number;
}

export const GarlicCharacter: React.FC<GarlicCharacterProps> = ({ onTap, comboCount }) => {
  const { currentStage, inventory } = useGame();
  const [isPressed, setIsPressed] = useState(false);
  const [expressionIndex, setExpressionIndex] = useState(0);
  const [floatingTexts, setFloatingTexts] = useState<FloatingText[]>([]);
  const [wobbleAngle, setWobbleAngle] = useState(0);

  // Find equipped skin
  const equippedSkin = SKINS_CATALOG.find((s) => s.id === inventory.equippedSkin) || SKINS_CATALOG[0];

  const triggerTapReaction = (clientX?: number, clientY?: number) => {
    setIsPressed(true);

    const nextExpr = Math.floor(Math.random() * 6);
    setExpressionIndex(nextExpr);

    const randomAngle = (Math.random() - 0.5) * 24;
    setWobbleAngle(randomAngle);

    const randomText = TAP_SOUND_EFFECTS[Math.floor(Math.random() * TAP_SOUND_EFFECTS.length)];
    const newText: FloatingText = {
      id: Date.now() + Math.random(),
      text: randomText,
      x: (Math.random() - 0.5) * 60,
      y: (Math.random() - 0.5) * 40 - 50,
    };

    setFloatingTexts((prev) => [...prev.slice(-4), newText]);

    setTimeout(() => {
      setFloatingTexts((prev) => prev.filter((item) => item.id !== newText.id));
    }, 800);

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
    setTimeout(() => setIsPressed(false), 140);
  };

  const currentExpr = isPressed
    ? expressionIndex
    : comboCount > 30
    ? 4
    : comboCount > 15
    ? 1
    : 3;

  // Scale factor based on Small vs Big evolution size
  const sizeScale = currentStage.size === 'BIG' ? 'scale-110 sm:scale-125' : 'scale-100';

  return (
    <div className="relative flex flex-col items-center justify-center cursor-pointer my-4 select-none">
      {/* Dynamic Evolution Glow Aura */}
      <div
        style={{ backgroundColor: currentStage.auraColor }}
        className={`absolute w-72 h-72 rounded-full transition-all duration-300 pointer-events-none blur-3xl ${
          comboCount > 25 ? 'scale-125 animate-pulse' : 'scale-100'
        }`}
      />

      {/* Floating Comic Sound Effect Popups */}
      <div className="absolute inset-0 pointer-events-none z-30 flex items-center justify-center">
        {floatingTexts.map((item) => (
          <span
            key={item.id}
            style={{ transform: `translate(${item.x}px, ${item.y}px)` }}
            className="absolute font-black text-lg sm:text-xl text-yellow-300 drop-shadow-[0_4px_8px_rgba(0,0,0,0.8)] animate-bounce tracking-wider bg-black/40 px-2.5 py-1 rounded-full border border-yellow-400/50"
          >
            {item.text}
          </span>
        ))}
      </div>

      {/* Main Interactive Garlic Character */}
      <div
        onClick={handleClick}
        onTouchStart={handleTouchStart}
        onTouchEnd={handleTouchEnd}
        style={{
          transform: isPressed
            ? `scale(0.85, 1.15) rotate(${wobbleAngle}deg)`
            : `scale(1) rotate(0deg)`,
        }}
        className={`relative z-10 w-64 h-64 sm:w-72 sm:h-72 flex items-center justify-center transition-all duration-100 ease-out active:scale-90 ${sizeScale} ${
          isPressed ? '' : 'hover:scale-105 animate-float'
        }`}
      >
        {/* Stylized SVG Garlic Character with Dynamic Evolution Colors & Facial Expressions */}
        <svg
          viewBox="0 0 200 200"
          className="w-full h-full drop-shadow-[0_15px_35px_rgba(16,185,129,0.4)]"
        >
          <defs>
            <linearGradient id="garlicBody" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor={currentStage.garlicBodyStartColor} />
              <stop offset="100%" stopColor={currentStage.garlicBodyEndColor} />
            </linearGradient>
            <linearGradient id="leafGrad" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#34D399" />
              <stop offset="100%" stopColor="#059669" />
            </linearGradient>
            <radialGradient id="garlicShine" cx="30%" cy="30%" r="70%">
              <stop offset="0%" stopColor="rgba(255,255,255,0.85)" />
              <stop offset="100%" stopColor="rgba(255,255,255,0)" />
            </radialGradient>
          </defs>

          {/* Green Sprout Leaf Top */}
          <g className={`transition-transform duration-100 origin-bottom ${isPressed ? 'scale-125 -rotate-6' : ''}`}>
            <path d="M 100 35 C 95 15, 80 5, 70 10 C 85 25, 92 40, 95 50 Z" fill="url(#leafGrad)" />
            <path d="M 100 35 C 105 10, 125 5, 135 15 C 120 28, 110 40, 105 50 Z" fill="url(#leafGrad)" />
            <path d="M 100 30 C 98 10, 102 2, 100 0 C 98 10, 100 20, 100 30 Z" fill="#10B981" />
          </g>

          {/* Garlic Clove Ridges & Body */}
          <path
            d="M 100 45 C 50 45, 25 80, 25 125 C 25 170, 60 190, 100 190 C 140 190, 175 170, 175 125 C 175 80, 150 45, 100 45 Z"
            fill="url(#garlicBody)"
            stroke={currentStage.strokeColor}
            strokeWidth="3.5"
          />

          {/* Clove Segments Lines */}
          <path d="M 100 45 C 75 75, 60 110, 60 185" fill="none" stroke={currentStage.strokeColor} strokeWidth="2.5" strokeLinecap="round" opacity="0.7" />
          <path d="M 100 45 C 125 75, 140 110, 140 185" fill="none" stroke={currentStage.strokeColor} strokeWidth="2.5" strokeLinecap="round" opacity="0.7" />

          {/* Highlights */}
          <ellipse cx="80" cy="85" rx="35" ry="25" fill="url(#garlicShine)" opacity="0.65" />

          {/* Blushing Cheeks */}
          <ellipse cx="60" cy="128" rx="9" ry="6" fill={isPressed ? '#EF4444' : '#F472B6'} opacity={isPressed ? '0.85' : '0.6'} />
          <ellipse cx="140" cy="128" rx="9" ry="6" fill={isPressed ? '#EF4444' : '#F472B6'} opacity={isPressed ? '0.85' : '0.6'} />

          {/* Sweat Drop on Tap */}
          {isPressed && (
            <path
              d="M 152 95 C 152 90, 157 85, 157 85 C 157 85, 162 90, 162 95 C 162 98, 157 101, 152 95 Z"
              fill="#60A5FA"
              className="animate-bounce"
            />
          )}

          {/* DYNAMIC FACIAL EXPRESSIONS */}
          {currentExpr === 0 && (
            <g>
              <path d="M 65 110 L 80 117 L 65 124" fill="none" stroke="#2E1065" strokeWidth="4.5" strokeLinecap="round" strokeLinejoin="round" />
              <path d="M 135 110 L 120 117 L 135 124" fill="none" stroke="#2E1065" strokeWidth="4.5" strokeLinecap="round" strokeLinejoin="round" />
              <ellipse cx="100" cy="138" rx="14" ry="10" fill="#2E1065" />
              <ellipse cx="100" cy="142" rx="9" ry="5" fill="#EF4444" />
            </g>
          )}

          {currentExpr === 1 && (
            <g>
              <circle cx="72" cy="113" r="13" fill="#2E1065" />
              <circle cx="75" cy="110" r="5" fill="#FFFFFF" />
              <circle cx="128" cy="115" r="7" fill="#2E1065" />
              <circle cx="129" cy="113" r="2.5" fill="#FFFFFF" />
              <path d="M 85 132 Q 100 145 115 132" fill="none" stroke="#2E1065" strokeWidth="4" strokeLinecap="round" />
              <path d="M 96 136 C 96 148, 108 148, 108 136 Z" fill="#F43F5E" />
            </g>
          )}

          {currentExpr === 2 && (
            <g>
              <path d="M 68 108 L 82 122 M 82 108 L 68 122" stroke="#2E1065" strokeWidth="4" strokeLinecap="round" />
              <path d="M 118 108 L 132 122 M 132 108 L 118 122" stroke="#2E1065" strokeWidth="4" strokeLinecap="round" />
              <path d="M 82 136 Q 90 130 98 136 T 114 136" fill="none" stroke="#2E1065" strokeWidth="4" strokeLinecap="round" />
              <polygon points="65,90 67,95 72,95 68,98 70,103 65,100 60,103 62,98 58,95 63,95" fill="#F59E0B" />
              <polygon points="130,88 132,93 137,93 133,96 135,101 130,98 125,101 127,96 123,93 128,93" fill="#F59E0B" />
            </g>
          )}

          {currentExpr === 3 && (
            <g>
              <circle cx="75" cy="115" r="9" fill="#2E1065" />
              <circle cx="78" cy="112" r="3.5" fill="#FFFFFF" />
              <path d="M 120 115 Q 128 108 135 115" fill="none" stroke="#2E1065" strokeWidth="4" strokeLinecap="round" />
              <path d="M 85 130 Q 100 148 115 130" fill="none" stroke="#2E1065" strokeWidth="4" strokeLinecap="round" />
            </g>
          )}

          {currentExpr === 4 && (
            <g>
              <polygon points="75,105 78,113 86,113 80,118 82,126 75,121 68,126 70,118 64,113 72,113" fill="#F59E0B" />
              <polygon points="125,105 128,113 136,113 130,118 132,126 125,121 118,126 120,118 114,113 122,113" fill="#F59E0B" />
              <path d="M 80 130 Q 100 155 120 130 Z" fill="#2E1065" />
              <path d="M 88 130 L 112 130 L 108 136 L 92 136 Z" fill="#FFFFFF" />
              <ellipse cx="100" cy="144" rx="8" ry="4" fill="#EF4444" />
            </g>
          )}

          {currentExpr === 5 && (
            <g>
              <path d="M 68 100 Q 75 92 82 100" fill="none" stroke="#2E1065" strokeWidth="3" strokeLinecap="round" />
              <path d="M 118 100 Q 125 92 132 100" fill="none" stroke="#2E1065" strokeWidth="3" strokeLinecap="round" />
              <circle cx="75" cy="114" r="11" fill="#FFFFFF" stroke="#2E1065" strokeWidth="3" />
              <circle cx="75" cy="114" r="5" fill="#2E1065" />
              <circle cx="125" cy="114" r="11" fill="#FFFFFF" stroke="#2E1065" strokeWidth="3" />
              <circle cx="125" cy="114" r="5" fill="#2E1065" />
              <circle cx="100" cy="138" r="10" fill="#2E1065" />
            </g>
          )}
        </svg>

        {/* Equipped Skin Headgear Badge */}
        {equippedSkin.headgearEmoji && (
          <div className="absolute -top-6 text-4xl animate-bounce drop-shadow-lg z-20">
            {equippedSkin.headgearEmoji}
          </div>
        )}

        {/* Emoji Reaction Badge on Top Corner */}
        <div className="absolute -top-3 right-2 text-3xl animate-bounce drop-shadow-md">
          {currentExpr === 0 && '💥'}
          {currentExpr === 1 && '🤪'}
          {currentExpr === 2 && '😵'}
          {currentExpr === 3 && '😜'}
          {currentExpr === 4 && '🔥'}
          {currentExpr === 5 && '😱'}
        </div>
      </div>
    </div>
  );
};
