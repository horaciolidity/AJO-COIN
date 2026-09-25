import React, { useState } from 'react';

interface GarlicCharacterProps {
  onTap: (clientX?: number, clientY?: number) => void;
  comboCount: number;
}

export const GarlicCharacter: React.FC<GarlicCharacterProps> = ({ onTap, comboCount }) => {
  const [isPressed, setIsPressed] = useState(false);

  const handleTouchStart = (e: React.TouchEvent<HTMLDivElement>) => {
    setIsPressed(true);
    const touch = e.touches[0];
    onTap(touch.clientX, touch.clientY);
  };

  const handleTouchEnd = () => {
    setIsPressed(false);
  };

  const handleClick = (e: React.MouseEvent<HTMLDivElement>) => {
    setIsPressed(true);
    onTap(e.clientX, e.clientY);
    setTimeout(() => setIsPressed(false), 120);
  };

  // Determine expressive eyes based on combo level
  const getEyeExpression = () => {
    if (comboCount > 30) return '🤩'; // Frenzy face
    if (comboCount > 15) return '🔥'; // Hype face
    if (isPressed) return '😜'; // Winking tap face
    return '😃'; // Happy AJO
  };

  return (
    <div className="relative flex flex-col items-center justify-center cursor-pointer my-4">
      {/* Dynamic Glow Aura */}
      <div
        className={`absolute w-72 h-72 rounded-full transition-all duration-300 pointer-events-none ${
          comboCount > 25
            ? 'bg-gradient-to-r from-sprout-500/50 via-emerald-400/40 to-yellow-500/50 blur-3xl animate-pulse'
            : 'bg-sprout-500/20 blur-2xl'
        }`}
      />

      {/* Main Interactive Garlic Character */}
      <div
        onClick={handleClick}
        onTouchStart={handleTouchStart}
        onTouchEnd={handleTouchEnd}
        className={`relative z-10 w-64 h-64 sm:w-72 sm:h-72 flex items-center justify-center transition-transform duration-100 ease-out select-none active:scale-90 ${
          isPressed ? 'scale-90 rotate-1' : 'hover:scale-105 animate-float'
        }`}
      >
        {/* Stylized SVG Premium Garlic Character */}
        <svg
          viewBox="0 0 200 200"
          className="w-full h-full drop-shadow-[0_15px_35px_rgba(16,185,129,0.35)]"
        >
          <defs>
            <linearGradient id="garlicBody" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#FFFFFF" />
              <stop offset="60%" stopColor="#F5F1E8" />
              <stop offset="100%" stopColor="#E0D5BE" />
            </linearGradient>
            <linearGradient id="leafGrad" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#34D399" />
              <stop offset="100%" stopColor="#059669" />
            </linearGradient>
            <radialGradient id="garlicShine" cx="30%" cy="30%" r="70%">
              <stop offset="0%" stopColor="rgba(255,255,255,0.8)" />
              <stop offset="100%" stopColor="rgba(255,255,255,0)" />
            </radialGradient>
          </defs>

          {/* Green Sprout Leaf Top */}
          <path
            d="M 100 35 C 95 15, 80 5, 70 10 C 85 25, 92 40, 95 50 Z"
            fill="url(#leafGrad)"
          />
          <path
            d="M 100 35 C 105 10, 125 5, 135 15 C 120 28, 110 40, 105 50 Z"
            fill="url(#leafGrad)"
          />
          <path
            d="M 100 30 C 98 10, 102 2, 100 0 C 98 10, 100 20, 100 30 Z"
            fill="#10B981"
          />

          {/* Garlic Clove Ridges & Body */}
          <path
            d="M 100 45 C 50 45, 25 80, 25 125 C 25 170, 60 190, 100 190 C 140 190, 175 170, 175 125 C 175 80, 150 45, 100 45 Z"
            fill="url(#garlicBody)"
            stroke="#D6C5A8"
            strokeWidth="3"
          />

          {/* Clove Segments Lines */}
          <path
            d="M 100 45 C 75 75, 60 110, 60 185"
            fill="none"
            stroke="#D0C2A5"
            strokeWidth="2.5"
            strokeLinecap="round"
          />
          <path
            d="M 100 45 C 125 75, 140 110, 140 185"
            fill="none"
            stroke="#D0C2A5"
            strokeWidth="2.5"
            strokeLinecap="round"
          />

          {/* Highlights */}
          <ellipse cx="80" cy="85" rx="35" ry="25" fill="url(#garlicShine)" opacity="0.6" />

          {/* Face Features */}
          {/* Eyes */}
          <circle cx="75" cy="115" r="9" fill="#2E1065" />
          <circle cx="125" cy="115" r="9" fill="#2E1065" />
          <circle cx="78" cy="112" r="3" fill="#FFFFFF" />
          <circle cx="128" cy="112" r="3" fill="#FFFFFF" />

          {/* Cheeks */}
          <ellipse cx="62" cy="125" rx="7" ry="4" fill="#F472B6" opacity="0.6" />
          <ellipse cx="138" cy="125" rx="7" ry="4" fill="#F472B6" opacity="0.6" />

          {/* Smile / Mouth */}
          <path
            d="M 85 130 Q 100 148 115 130"
            fill="none"
            stroke="#2E1065"
            strokeWidth="4"
            strokeLinecap="round"
          />
        </svg>

        {/* Emoji Expression Overlay */}
        <div className="absolute -top-2 right-4 text-3xl animate-bounce">
          {getEyeExpression()}
        </div>
      </div>
    </div>
  );
};
