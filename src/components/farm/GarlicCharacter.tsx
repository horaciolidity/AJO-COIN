import React, { useState, useEffect } from 'react';
import { useGame } from '../../context/GameContext';
import { SKINS_CATALOG, TAP_STYLES_CATALOG } from '../../config/gameBalance';

interface GarlicCharacterProps {
  onTap?: (clientX?: number, clientY?: number) => void;
  comboCount: number;
}

export const GarlicCharacter: React.FC<GarlicCharacterProps> = ({ comboCount }) => {
  const {
    currentStage,
    inventory,
    handleTapStart,
    handleTapEnd,
    chargeLevel,
    isCharging,
    isChargeUnlocked,
    maxChargeMultiplier,
    lastCritical,
    teethCelebration,
    stats,
    rhythmStreak,
    isLastTapPerfectRhythm,
  } = useGame();

  const [isPressed, setIsPressed] = useState(false);
  const [expressionIndex, setExpressionIndex] = useState(3);
  const [wobbleAngle, setWobbleAngle] = useState(0);
  const [isBlinking, setIsBlinking] = useState(false);
  const [showCritFlash, setShowCritFlash] = useState(false);
  const [showSpeechBalloon, setShowSpeechBalloon] = useState(false);
  const [activeSpeechText, setActiveSpeechText] = useState('');

  const AI_GARLIC_DIALOGUES = [
    "¿Te imaginas AJO COIN a 0.0001 USDC en el Airdrop? 🚀",
    "¡Comparte tu enlace de referido para ganar +50 Dientes 🦷 gratis!",
    "¡Invita a tus amigos para ganar +500 GC por cada uno! 💰",
    "¡Aumenta tu Poder de Golpe en la sección Cajas para destrozar plagas! 💥",
    "¡Personaliza tus skins en el Perfil para multiplicar tus recompensas! 🧄✨",
    "¡Mantén el ritmo perfecto 🎯 para hacer un 75% más de daño!",
    "¡Completa las Cajas de Ajo para reclamar tokens AJO reales! 📦",
    "¡Sube en el Ranking Real y sé el Rey Ajo del ecosistema! 👑",
    "¡Recarga energía en la Estación de Recarga cuando estés agotado! ⚡",
    "¡Acumula Frenzy Combo para ganar 1 Diente de Ajo cada 100 frenzies! 🔥🦷",
    "¡Los streamers ganan hasta 25,000,000 GC y 5,000 AJO por invitar seguidores! 🎥🔥",
    "¡Revisa las Tareas Diarias y Redes Sociales para reclamar tus premios diarios! 📲",
  ];

  // Ephemeral, randomized speech balloon popups ONLY when comboCount >= 220
  useEffect(() => {
    if (comboCount < 220) {
      setShowSpeechBalloon(false);
      return;
    }

    let hideTimer: NodeJS.Timeout;
    let nextTimer: NodeJS.Timeout;

    const triggerNextDialogue = () => {
      const randomIndex = Math.floor(Math.random() * AI_GARLIC_DIALOGUES.length);
      setActiveSpeechText(AI_GARLIC_DIALOGUES[randomIndex]);
      setShowSpeechBalloon(true);

      // Duration: 2.5s visible, then closes automatically
      hideTimer = setTimeout(() => {
        setShowSpeechBalloon(false);

        // Pause 1.2s before popping up next random dialogue if still >= 220 combo
        nextTimer = setTimeout(() => {
          if (comboCount >= 220) {
            triggerNextDialogue();
          }
        }, 1200);
      }, 2500);
    };

    if (!showSpeechBalloon) {
      triggerNextDialogue();
    }

    return () => {
      clearTimeout(hideTimer);
      clearTimeout(nextTimer);
    };
  }, [comboCount >= 220]);

  // Find equipped skin & tap style
  const equippedSkin = SKINS_CATALOG.find((s) => s.id === inventory.equippedSkin) || SKINS_CATALOG[0];
  const equippedTapStyle = TAP_STYLES_CATALOG.find((s) => s.id === (inventory.equippedTapStyle || 'NORMAL')) || TAP_STYLES_CATALOG[0];

  // Natural eye blinking
  useEffect(() => {
    const blinkInterval = setInterval(() => {
      setIsBlinking(true);
      setTimeout(() => setIsBlinking(false), 160);
    }, 3500);
    return () => clearInterval(blinkInterval);
  }, []);

  // Show critical flash
  useEffect(() => {
    if (lastCritical) {
      setShowCritFlash(true);
      setTimeout(() => setShowCritFlash(false), 400);
    }
  }, [lastCritical]);


  const handleTouchStart = (e: React.TouchEvent<HTMLDivElement>) => {
    e.preventDefault();
    const touch = e.touches[0];
    setIsPressed(true);
    setExpressionIndex(Math.floor(Math.random() * 6));
    setWobbleAngle((Math.random() - 0.5) * 22);
    handleTapStart(touch.clientX, touch.clientY);
  };

  const handleTouchEnd = (e: React.TouchEvent<HTMLDivElement>) => {
    e.preventDefault();
    const touch = e.changedTouches[0];
    setIsPressed(false);
    handleTapEnd(touch?.clientX, touch?.clientY);
  };

  const handleMouseDown = (e: React.MouseEvent<HTMLDivElement>) => {
    setIsPressed(true);
    setExpressionIndex(Math.floor(Math.random() * 6));
    setWobbleAngle((Math.random() - 0.5) * 22);
    handleTapStart(e.clientX, e.clientY);
  };

  const handleMouseUp = (e: React.MouseEvent<HTMLDivElement>) => {
    setIsPressed(false);
    handleTapEnd(e.clientX, e.clientY);
  };

  // Expression based on combo or Goku SSJ charging
  const currentExpr = isCharging
    ? 6 // Screaming Super Saiyan mode while charging
    : isPressed
    ? expressionIndex
    : comboCount >= 50 ? 6
    : comboCount >= 30 ? 4
    : comboCount >= 15 ? 1
    : comboCount >= 8 ? 5
    : 3;

  // Size based on evolution
  const isSmall = currentStage.size === 'SMALL';
  const sizeClass = isSmall
    ? 'w-32 h-32 sm:w-36 sm:h-36'
    : 'w-48 h-48 sm:w-56 sm:h-56';

  // Tremble/Rumble on Goku SSJ Charge or high combos
  const trembleClass = isCharging
    ? 'animate-[ssj-rumble_0.07s_ease-in-out_infinite] scale-105'
    : comboCount >= 50
    ? 'animate-[combo-shake_0.15s_ease-in-out_infinite]'
    : comboCount >= 30
    ? 'animate-[combo-shake_0.3s_ease-in-out_infinite]'
    : '';

  // Charge progress ring color
  const chargeColor = chargeLevel >= 0.8 ? equippedTapStyle.color : chargeLevel >= 0.4 ? '#FDE047' : '#34D399';
  const chargeStroke = `conic-gradient(${chargeColor} ${chargeLevel * 360}deg, transparent 0deg)`;

  // Aura scale
  const auraScale = comboCount >= 50 ? 'scale-150 opacity-90'
    : comboCount >= 25 ? 'scale-125 animate-pulse'
    : 'scale-100 opacity-50';

  // Energy percentage for display
  const energyPct = Math.round((stats.energy / stats.maxEnergy) * 100);

  return (
    <div className="relative flex flex-col items-center justify-center cursor-pointer my-2 select-none">

      {/* Teeth Celebration Overlay */}
      {teethCelebration.active && (
        <div className="absolute inset-0 flex items-center justify-center z-50 pointer-events-none">
          <div className="relative animate-bounce">
            <div
              className="absolute -inset-4 rounded-full blur-2xl animate-pulse"
              style={{ backgroundColor: 'rgba(250,204,21,0.4)' }}
            />
            <div className="relative bg-black/80 border-2 border-amber-400 rounded-2xl px-5 py-3 shadow-2xl text-center">
              <div className="text-2xl font-black text-amber-400 tracking-wider">
                +{teethCelebration.amount} 🦷
              </div>
              <div className="text-xs font-bold text-amber-300/80 uppercase tracking-widest">
                DIENTES DE AJO
              </div>
              <div className="flex justify-center gap-0.5 mt-1">
                {Array.from({ length: Math.min(5, teethCelebration.amount) }).map((_, i) => (
                  <span key={i} className="text-base animate-bounce" style={{ animationDelay: `${i * 80}ms` }}>🧄</span>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Critical hit screen flash */}
      {showCritFlash && (
        <div
          className="fixed inset-0 pointer-events-none z-40 animate-ping"
          style={{ backgroundColor: `${equippedTapStyle.glowColor}`, opacity: 0.25 }}
        />
      )}

      {/* AI GARLIC EPHEMERAL SPEECH BALLOON ONLY WHEN FRENZY COMBO >= 220 */}
      {showSpeechBalloon && comboCount >= 220 && (
        <div className="absolute -top-24 left-1/2 -translate-x-1/2 z-40 max-w-[260px] w-max pointer-events-none animate-fadeIn">
          <div className="relative bg-gradient-to-r from-amber-950/95 via-purple-950/95 to-emerald-950/95 border-2 border-amber-400/80 rounded-2xl px-3.5 py-2 shadow-[0_0_25px_rgba(245,158,11,0.7)] text-center animate-bounce">
            <div className="text-[10px] font-black text-amber-300 flex items-center justify-center gap-1 uppercase tracking-wider">
              <span>🤖🧄</span>
              <span>AJO IA (FRENZY 220+):</span>
            </div>
            <p className="text-[11px] font-bold text-white leading-tight mt-0.5 drop-shadow-md">
              "{activeSpeechText}"
            </p>
            {/* Speech bubble tail pointer */}
            <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 w-0 h-0 border-l-[8px] border-l-transparent border-r-[8px] border-r-transparent border-t-[8px] border-t-amber-400" />
          </div>
        </div>
      )}

      {/* Tap Style Indicator Badge */}
      <div
        className="absolute -top-8 left-1/2 -translate-x-1/2 z-20 flex items-center gap-1 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider border"
        style={{
          backgroundColor: `${equippedTapStyle.color}22`,
          borderColor: `${equippedTapStyle.color}66`,
          color: equippedTapStyle.color,
        }}
      >
        <span>{equippedTapStyle.particleEmoji}</span>
        <span>{equippedTapStyle.name.split(' ')[0]}</span>
      </div>

      {/* Dynamic Evolution Glow Aura */}
      <div
        style={{ backgroundColor: currentStage.auraColor }}
        className={`absolute rounded-full transition-all duration-500 pointer-events-none blur-3xl ${auraScale} ${isSmall ? 'w-48 h-48' : 'w-72 h-72'}`}
      />

      {/* GOKU SUPER SAIYAN CHARGING FLAME AURA */}
      {isCharging && (
        <div className="absolute pointer-events-none z-10 inset-0 flex items-center justify-center">
          {/* Outer glowing plasma aura */}
          <div className="absolute -inset-14 rounded-full bg-gradient-to-t from-yellow-500 via-amber-400/80 to-transparent blur-2xl animate-pulse" />
          {/* Ascending energy rays */}
          <div className="absolute -inset-10 rounded-full border-4 border-yellow-300/80 blur-md animate-ping" />
          {/* Rising Goku energy flame particles */}
          <div className="absolute -top-16 inset-x-0 flex justify-center gap-4 text-2xl animate-ssj-aura">
            <span>🔥</span>
            <span>⚡</span>
            <span>🔥</span>
          </div>
          {/* Charging Banner */}
          <div className="absolute -top-14 left-1/2 -translate-x-1/2 bg-black/90 border-2 border-yellow-400 text-yellow-300 px-3 py-1 rounded-full text-xs font-black tracking-widest whitespace-nowrap shadow-2xl animate-bounce">
            🔥 ¡CARGANDO PODER SAYAYIN! ({maxChargeMultiplier}x CRÍTICO) 🔥
          </div>
        </div>
      )}

      {/* RHYTHM PRECISION BADGE */}
      {isLastTapPerfectRhythm && !isCharging && (
        <div className="absolute -bottom-8 left-1/2 -translate-x-1/2 bg-emerald-950/90 border-2 border-emerald-400 text-emerald-300 px-3 py-1 rounded-full text-[11px] font-black tracking-wider whitespace-nowrap shadow-xl animate-bounce z-30 flex items-center gap-1">
          <span>🎯</span>
          <span>¡RITMO PERFECTO! (+75% PODER)</span>
        </div>
      )}

      {/* Tap Style Colored Aura Ring */}
      {(isCharging || comboCount > 5) && (
        <div
          className="absolute rounded-full pointer-events-none transition-all duration-300"
          style={{
            width: isSmall ? '200px' : '290px',
            height: isSmall ? '200px' : '290px',
            boxShadow: `0 0 ${40 + chargeLevel * 60}px ${equippedTapStyle.glowColor}`,
            opacity: 0.3 + chargeLevel * 0.6,
          }}
        />
      )}

      {/* Ping ring at max combo */}
      {comboCount >= 50 && (
        <div
          className="absolute rounded-full pointer-events-none border-2 animate-ping"
          style={{
            width: isSmall ? '240px' : '340px',
            height: isSmall ? '240px' : '340px',
            borderColor: equippedTapStyle.color,
          }}
        />
      )}

      {/* Charge Progress Ring */}
      {isCharging && chargeLevel > 0 && (
        <div className="absolute pointer-events-none z-20" style={{ width: isSmall ? '200px' : '300px', height: isSmall ? '200px' : '300px' }}>
          <svg viewBox="0 0 100 100" className="w-full h-full -rotate-90">
            <circle
              cx="50" cy="50" r="46"
              fill="none"
              stroke="rgba(255,255,255,0.1)"
              strokeWidth="4"
            />
            <circle
              cx="50" cy="50" r="46"
              fill="none"
              stroke={chargeColor}
              strokeWidth="5"
              strokeLinecap="round"
              strokeDasharray={`${chargeLevel * 289} 289`}
              className="transition-all duration-75"
              style={{ filter: `drop-shadow(0 0 6px ${chargeColor})` }}
            />
          </svg>
          {chargeLevel >= 0.8 && (
            <div className="absolute inset-0 flex items-center justify-center">
              <span
                className="text-xs font-black animate-pulse"
                style={{ color: chargeColor }}
              >
                {chargeLevel >= 1 ? '¡MAX!' : `${Math.floor(chargeLevel * 100)}%`}
              </span>
            </div>
          )}
        </div>
      )}

      {/* Main Character Container */}
      <div
        onMouseDown={handleMouseDown}
        onMouseUp={handleMouseUp}
        onMouseLeave={() => { if (isPressed) { setIsPressed(false); handleTapEnd(); } }}
        onTouchStart={handleTouchStart}
        onTouchEnd={handleTouchEnd}
        style={{
          transform: isPressed
            ? `scale(${isCharging ? 0.90 + chargeLevel * 0.1 : 0.85}, ${isCharging ? 1.1 + chargeLevel * 0.1 : 1.15}) rotate(${wobbleAngle}deg)`
            : `scale(1) rotate(0deg)`,
        }}
        className={`relative z-10 flex items-center justify-center transition-all duration-100 ease-out ${sizeClass} ${trembleClass} ${
          isPressed ? '' : 'hover:scale-105 animate-anime-breath'
        }`}
      >
        {/* Drop shadow */}
        <div
          className={`absolute bottom-1 rounded-full bg-black/40 blur-md pointer-events-none transition-all duration-150 ${
            isPressed ? 'scale-75 opacity-70' : 'scale-100 opacity-35'
          }`}
          style={{ width: isSmall ? '120px' : '200px', height: isSmall ? '20px' : '32px' }}
        />

        {/* ======== ANIME-STYLE GARLIC CHARACTER SVG ======== */}
        <svg
          viewBox="0 0 200 220"
          className="w-full h-full relative z-10"
          style={{ filter: `drop-shadow(0 12px 30px ${equippedTapStyle.glowColor})` }}
        >
          <defs>
            <radialGradient id={`bodyGrad_${currentStage.id}`} cx="40%" cy="30%" r="70%">
              <stop offset="0%" stopColor={currentStage.garlicBodyStartColor} />
              <stop offset="55%" stopColor={currentStage.garlicBodyStartColor} stopOpacity="0.9" />
              <stop offset="100%" stopColor={currentStage.garlicBodyEndColor} />
            </radialGradient>

            <radialGradient id="glossShine" cx="30%" cy="20%" r="60%">
              <stop offset="0%" stopColor="rgba(255,255,255,0.95)" />
              <stop offset="45%" stopColor="rgba(255,255,255,0.35)" />
              <stop offset="100%" stopColor="rgba(255,255,255,0)" />
            </radialGradient>

            <linearGradient id="sproutLeafGrad" x1="0%" y1="100%" x2="0%" y2="0%">
              <stop offset="0%" stopColor="#059669" />
              <stop offset="60%" stopColor="#10B981" />
              <stop offset="100%" stopColor="#6EE7B7" />
            </linearGradient>

            <linearGradient id="fireSkinGrad2" x1="0%" y1="100%" x2="0%" y2="0%">
              <stop offset="0%" stopColor="#DC2626" />
              <stop offset="50%" stopColor="#F97316" />
              <stop offset="100%" stopColor="#FDE047" />
            </linearGradient>

            <radialGradient id="irisGradAnime" cx="40%" cy="35%" r="60%">
              <stop offset="0%" stopColor="#7C3AED" />
              <stop offset="45%" stopColor="#4C1D95" />
              <stop offset="100%" stopColor="#1E0A3C" />
            </radialGradient>

            <filter id="glowFilter">
              <feGaussianBlur stdDeviation="3" result="blur" />
              <feComposite in="SourceGraphic" in2="blur" operator="over" />
            </filter>

            {/* Charge glow filter */}
            <filter id="chargeGlow">
              <feGaussianBlur stdDeviation={2 + chargeLevel * 6} result="blur" />
              <feMerge>
                <feMergeNode in="blur" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>
          </defs>

          {/* === ARMS (Anime style short arms) === */}
          {/* Left arm */}
          <path
            d={isPressed
              ? "M 48 130 C 25 115, 15 95, 22 80"
              : "M 48 130 C 28 118, 20 105, 28 90"
            }
            fill="none"
            stroke={currentStage.garlicBodyEndColor}
            strokeWidth="14"
            strokeLinecap="round"
            className="transition-all duration-100"
          />
          <circle cx={isPressed ? 22 : 28} cy={isPressed ? 80 : 90} r="9"
            fill={currentStage.garlicBodyStartColor}
            stroke={currentStage.strokeColor}
            strokeWidth="2"
            className="transition-all duration-100"
          />

          {/* Right arm */}
          <path
            d={isPressed
              ? "M 152 130 C 175 115, 185 95, 178 80"
              : "M 152 130 C 172 118, 180 105, 172 90"
            }
            fill="none"
            stroke={currentStage.garlicBodyEndColor}
            strokeWidth="14"
            strokeLinecap="round"
            className="transition-all duration-100"
          />
          <circle cx={isPressed ? 178 : 172} cy={isPressed ? 80 : 90} r="9"
            fill={currentStage.garlicBodyStartColor}
            stroke={currentStage.strokeColor}
            strokeWidth="2"
            className="transition-all duration-100"
          />

          {/* === LEGS (tiny cute anime feet) === */}
          <path d="M 78 192 C 70 200, 62 205, 58 210" fill="none" stroke={currentStage.garlicBodyEndColor} strokeWidth="12" strokeLinecap="round" />
          <ellipse cx="55" cy="213" rx="14" ry="6" fill={currentStage.garlicBodyEndColor} stroke={currentStage.strokeColor} strokeWidth="1.5" />

          <path d="M 122 192 C 130 200, 138 205, 142 210" fill="none" stroke={currentStage.garlicBodyEndColor} strokeWidth="12" strokeLinecap="round" />
          <ellipse cx="145" cy="213" rx="14" ry="6" fill={currentStage.garlicBodyEndColor} stroke={currentStage.strokeColor} strokeWidth="1.5" />

          {/* === FIRE SKIN behind body === */}
          {equippedSkin.id === 'FIRE' && (
            <g className="animate-pulse">
              <path d="M 25 115 C 8 90, 18 60, 48 38 C 65 20, 88 5, 100 28 C 112 5, 135 20, 152 38 C 182 60, 192 90, 175 115 C 195 148, 178 188, 145 200 C 120 212, 80 212, 55 200 C 22 188, 5 148, 25 115 Z"
                fill="url(#fireSkinGrad2)" opacity="0.35" />
            </g>
          )}

          {/* === MAIN GARLIC BODY === */}
          <path
            d="M 100 42 C 48 42, 22 80, 22 128 C 22 175, 60 200, 100 200 C 140 200, 178 175, 178 128 C 178 80, 152 42, 100 42 Z"
            fill={`url(#bodyGrad_${currentStage.id})`}
            stroke={currentStage.strokeColor}
            strokeWidth="3"
          />

          {/* Clove segment lines */}
          <path d="M 100 42 C 72 78, 58 118, 60 196" fill="none" stroke={currentStage.strokeColor} strokeWidth="2" strokeLinecap="round" opacity="0.6" />
          <path d="M 100 42 C 128 78, 142 118, 140 196" fill="none" stroke={currentStage.strokeColor} strokeWidth="2" strokeLinecap="round" opacity="0.6" />

          {/* 3D Specular highlight */}
          <ellipse cx="78" cy="82" rx="32" ry="22" fill="url(#glossShine)" opacity="0.75" />

          {/* === SKIN OVERLAYS === */}
          {equippedSkin.id === 'ROBOT' && (
            <g stroke="#06B6D4" strokeWidth="2" fill="none" opacity="0.85">
              <path d="M 44 135 L 65 135 L 76 155 L 92 155" />
              <path d="M 156 135 L 135 135 L 124 155 L 108 155" />
              <circle cx="92" cy="155" r="3.5" fill="#22D3EE" />
              <circle cx="108" cy="155" r="3.5" fill="#22D3EE" />
            </g>
          )}

          {equippedSkin.id === 'DEAD' && (
            <g stroke="#27272A" strokeWidth="2.5" strokeLinecap="round">
              <path d="M 128 148 L 155 164" />
              <path d="M 133 160 L 143 149" />
              <path d="M 142 167 L 152 156" />
              <path d="M 45 143 L 65 153" />
              <path d="M 48 153 L 58 143" />
            </g>
          )}

          {/* Blushing Cheeks */}
          <ellipse cx="56" cy="132" rx="11" ry="7" fill={isPressed ? '#EF4444' : '#F472B6'} opacity={isPressed ? 0.9 : 0.6} className="transition-all" />
          <ellipse cx="144" cy="132" rx="11" ry="7" fill={isPressed ? '#EF4444' : '#F472B6'} opacity={isPressed ? 0.9 : 0.6} className="transition-all" />

          {/* Sweat drop on tap */}
          {isPressed && (
            <path d="M 156 98 C 156 93, 162 87, 162 87 C 162 87, 168 93, 168 98 C 168 102, 162 106, 156 98 Z"
              fill="#60A5FA" className="animate-bounce" />
          )}

          {/* Charge energy aura lines */}
          {isCharging && chargeLevel > 0.3 && (
            <g opacity={chargeLevel}>
              <line x1="100" y1="42" x2="100" y2="10" stroke={equippedTapStyle.color} strokeWidth="3" strokeLinecap="round" className="animate-pulse" />
              <line x1="22" y1="128" x2="5" y2="115" stroke={equippedTapStyle.color} strokeWidth="2.5" strokeLinecap="round" className="animate-pulse" />
              <line x1="178" y1="128" x2="195" y2="115" stroke={equippedTapStyle.color} strokeWidth="2.5" strokeLinecap="round" className="animate-pulse" />
            </g>
          )}

          {/* ========= ANIME FACIAL EXPRESSIONS ========= */}

          {/* BLINK OVERRIDE */}
          {isBlinking && !isPressed && currentExpr !== 6 ? (
            <g key="blink">
              <path d="M 62 116 Q 73 122 84 116" fill="none" stroke="#1E0A3C" strokeWidth="4" strokeLinecap="round" />
              <path d="M 116 116 Q 127 122 138 116" fill="none" stroke="#1E0A3C" strokeWidth="4" strokeLinecap="round" />
              <path d="M 83 136 Q 100 148 117 136" fill="none" stroke="#1E0A3C" strokeWidth="4" strokeLinecap="round" />
            </g>
          ) : (
            <g key={`expr-${currentExpr}`}>
              {/* EXPR 0: OUCH / SQUINT */}
              {currentExpr === 0 && (
                <g>
                  <path d="M 62 112 L 78 120 L 62 127" fill="none" stroke="#1E0A3C" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round" />
                  <path d="M 138 112 L 122 120 L 138 127" fill="none" stroke="#1E0A3C" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round" />
                  <ellipse cx="100" cy="142" rx="15" ry="10" fill="#1E0A3C" />
                  <ellipse cx="100" cy="146" rx="9" ry="5" fill="#EF4444" />
                </g>
              )}

              {/* EXPR 1: CRAZY / WINK */}
              {currentExpr === 1 && (
                <g>
                  {/* Big left eye */}
                  <circle cx="73" cy="116" r="15" fill="url(#irisGradAnime)" />
                  <circle cx="73" cy="116" r="10" fill="#2E0D70" />
                  <circle cx="77" cy="111" r="5.5" fill="#FFFFFF" />
                  <circle cx="71" cy="119" r="2.5" fill="#FFFFFF" />
                  {/* Wink right */}
                  <path d="M 116 116 Q 127 122 138 116" fill="none" stroke="#1E0A3C" strokeWidth="4" strokeLinecap="round" />
                  <path d="M 84 136 Q 100 150 116 136" fill="none" stroke="#1E0A3C" strokeWidth="4" strokeLinecap="round" />
                  <path d="M 95 140 C 95 152, 108 152, 108 140 Z" fill="#F43F5E" />
                </g>
              )}

              {/* EXPR 2: DIZZY / STARS */}
              {currentExpr === 2 && (
                <g>
                  <path d="M 65 110 L 82 126 M 82 110 L 65 126" stroke="#1E0A3C" strokeWidth="4.5" strokeLinecap="round" />
                  <path d="M 118 110 L 135 126 M 135 110 L 118 126" stroke="#1E0A3C" strokeWidth="4.5" strokeLinecap="round" />
                  <path d="M 82 138 Q 91 132 100 138 T 118 138" fill="none" stroke="#1E0A3C" strokeWidth="4" strokeLinecap="round" />
                  <polygon points="63,92 66,98 72,98 67,102 70,108 63,104 56,108 59,102 54,98 60,98" fill="#F59E0B" />
                  <polygon points="132,90 135,96 141,96 136,100 138,106 132,102 126,106 128,100 123,96 129,96" fill="#F59E0B" />
                </g>
              )}

              {/* EXPR 3: NORMAL HAPPY — Full anime eye */}
              {currentExpr === 3 && (
                <g>
                  {/* Left eye */}
                  <circle cx="73" cy="117" r="14" fill="white" />
                  <circle cx="73" cy="117" r="12" fill="url(#irisGradAnime)" />
                  <circle cx="73" cy="117" r="7" fill="#130636" />
                  <circle cx="77" cy="112" r="4.5" fill="white" />
                  <circle cx="70" cy="120" r="2" fill="white" />
                  {/* Right eye */}
                  <circle cx="127" cy="117" r="14" fill="white" />
                  <circle cx="127" cy="117" r="12" fill="url(#irisGradAnime)" />
                  <circle cx="127" cy="117" r="7" fill="#130636" />
                  <circle cx="131" cy="112" r="4.5" fill="white" />
                  <circle cx="124" cy="120" r="2" fill="white" />
                  {/* Eyebrows */}
                  <path d="M 62 100 Q 73 93 84 100" fill="none" stroke="#1E0A3C" strokeWidth="3.5" strokeLinecap="round" />
                  <path d="M 116 100 Q 127 93 138 100" fill="none" stroke="#1E0A3C" strokeWidth="3.5" strokeLinecap="round" />
                  {/* Smiling mouth */}
                  <path d="M 83 136 Q 100 154 117 136" fill="#1E0A3C" stroke="#1E0A3C" strokeWidth="2" />
                  <path d="M 92 144 Q 100 152 108 144" fill="#EF4444" />
                  {/* Tongue tip */}
                  <ellipse cx="100" cy="149" rx="6" ry="3.5" fill="#DC2626" />
                </g>
              )}

              {/* EXPR 4: AMAZED / STAR EYES */}
              {currentExpr === 4 && (
                <g>
                  <polygon points="73,103 76,113 87,113 79,120 82,130 73,124 64,130 67,120 59,113 70,113" fill="#F59E0B" />
                  <polygon points="127,103 130,113 141,113 133,120 136,130 127,124 118,130 121,120 113,113 124,113" fill="#F59E0B" />
                  <path d="M 80 136 Q 100 158 120 136 Z" fill="#1E0A3C" />
                  <path d="M 88 136 L 112 136 L 108 142 L 92 142 Z" fill="white" />
                  <ellipse cx="100" cy="149" rx="9" ry="5" fill="#EF4444" />
                </g>
              )}

              {/* EXPR 5: SURPRISED / WIDE EYES */}
              {currentExpr === 5 && (
                <g>
                  <circle cx="73" cy="117" r="14" fill="white" stroke="#1E0A3C" strokeWidth="3" />
                  <circle cx="73" cy="117" r="7" fill="url(#irisGradAnime)" />
                  <circle cx="76" cy="114" r="3" fill="white" />
                  <circle cx="127" cy="117" r="14" fill="white" stroke="#1E0A3C" strokeWidth="3" />
                  <circle cx="127" cy="117" r="7" fill="url(#irisGradAnime)" />
                  <circle cx="130" cy="114" r="3" fill="white" />
                  <circle cx="100" cy="142" r="12" fill="#1E0A3C" />
                </g>
              )}

              {/* EXPR 6: PANIC / FRENZY */}
              {currentExpr === 6 && (
                <g>
                  <circle cx="73" cy="116" r="14" fill="white" stroke="#1E0A3C" strokeWidth="2.5" />
                  <circle cx="73" cy="116" r="4" fill="#1E0A3C" className="animate-bounce" />
                  <circle cx="127" cy="116" r="14" fill="white" stroke="#1E0A3C" strokeWidth="2.5" />
                  <circle cx="127" cy="116" r="4" fill="#1E0A3C" className="animate-bounce" />
                  <ellipse cx="100" cy="147" rx="20" ry="14" fill="#1E0A3C" />
                  <ellipse cx="100" cy="151" rx="14" ry="9" fill="#EF4444" />
                  <ellipse cx="100" cy="155" rx="8" ry="4.5" fill="#B91C1C" />
                  {/* Stress marks */}
                  <path d="M 50 90 C 54 82, 60 82, 64 90" fill="none" stroke="#EF4444" strokeWidth="2" strokeLinecap="round" />
                  <path d="M 150 90 C 146 82, 140 82, 136 90" fill="none" stroke="#EF4444" strokeWidth="2" strokeLinecap="round" />
                  {/* Sweat drops */}
                  <path d="M 155 95 C 155 90, 160 84, 160 84 C 160 84, 165 90, 165 95 C 165 98, 160 101, 155 95 Z" fill="#60A5FA" opacity="0.9" />
                  <path d="M 38 88 C 38 85, 41 82, 41 82 C 41 82, 44 85, 44 88 C 44 90, 41 92, 38 88 Z" fill="#60A5FA" opacity="0.8" />
                </g>
              )}
            </g>
          )}

          {/* ===== SKIN ACCESORIES ===== */}

          {/* NINJA */}
          {equippedSkin.id === 'NINJA' && (
            <g>
              <path d="M 32 75 Q 12 92 18 118" fill="none" stroke="#18181B" strokeWidth="7" strokeLinecap="round" />
              <path d="M 32 75 Q 8 108 8 135" fill="none" stroke="#27272A" strokeWidth="5" strokeLinecap="round" />
              <path d="M 32 68 C 58 52, 142 52, 168 68 L 165 87 C 140 70, 60 70, 35 87 Z" fill="#18181B" />
              <rect x="85" y="60" width="30" height="18" rx="4" fill="#E4E4E7" stroke="#71717A" strokeWidth="1.5" />
              <path d="M 94 70 L 106 70 M 100 64 L 100 76" stroke="#18181B" strokeWidth="2" strokeLinecap="round" />
              <path d="M 32 125 C 60 148, 140 148, 168 125 L 165 185 C 138 198, 62 198, 35 185 Z" fill="#18181B" stroke="#09090B" strokeWidth="2" />
              <path d="M 60 148 Q 100 163 140 148" fill="none" stroke="#27272A" strokeWidth="2" />
            </g>
          )}

          {/* KING */}
          {equippedSkin.id === 'KING' && (
            <g>
              <polygon points="52,52 64,18 82,40 100,8 118,40 136,18 148,52" fill="#F59E0B" stroke="#B45309" strokeWidth="2.5" />
              <rect x="52" y="45" width="96" height="13" rx="4" fill="#D97706" stroke="#92400E" strokeWidth="2" />
              <circle cx="100" cy="8" r="6" fill="#EF4444" stroke="#991B1B" strokeWidth="1.5" />
              <circle cx="64" cy="18" r="5" fill="#3B82F6" stroke="#1E40AF" strokeWidth="1" />
              <circle cx="136" cy="18" r="5" fill="#10B981" stroke="#065F46" strokeWidth="1" />
              <circle cx="73" cy="52" r="3.5" fill="#EF4444" />
              <circle cx="100" cy="52" r="4" fill="#3B82F6" />
              <circle cx="127" cy="52" r="3.5" fill="#10B981" />
              <path d="M 28 178 C 60 202, 140 202, 172 178 C 155 208, 45 208, 28 178 Z" fill="#DC2626" stroke="#991B1B" strokeWidth="2" />
              <circle cx="100" cy="190" r="5" fill="#F59E0B" />
            </g>
          )}

          {/* ROBOT */}
          {equippedSkin.id === 'ROBOT' && (
            <g>
              <rect x="52" y="103" width="96" height="28" rx="9" fill="#0F172A" stroke="#06B6D4" strokeWidth="2.5" />
              <line x1="58" y1="117" x2="142" y2="117" stroke="#22D3EE" strokeWidth="5" strokeLinecap="round" className="animate-pulse" />
              <circle cx="100" cy="117" r="6" fill="#67E8F9" />
              <rect x="18" y="118" width="11" height="22" rx="3" fill="#64748B" stroke="#334155" strokeWidth="2" />
              <rect x="171" y="118" width="11" height="22" rx="3" fill="#64748B" stroke="#334155" strokeWidth="2" />
              <line x1="100" y1="42" x2="100" y2="14" stroke="#64748B" strokeWidth="4" />
              <circle cx="100" cy="10" r="7" fill="#EF4444" className="animate-ping" />
              <circle cx="100" cy="10" r="7" fill="#EF4444" />
            </g>
          )}

          {/* FIRE accesory */}
          {equippedSkin.id === 'FIRE' && (
            <g>
              <path d="M 58 50 C 48 28, 64 13, 74 34 C 84 14, 100 0, 116 24 C 132 5, 148 28, 142 50 Z" fill="#F97316" />
              <path d="M 68 50 C 63 33, 74 23, 80 40 C 90 24, 100 10, 111 30 C 122 14, 136 33, 130 50 Z" fill="#FACC15" />
            </g>
          )}

          {/* ALIEN */}
          {equippedSkin.id === 'ALIEN' && (
            <g>
              <path d="M 78 42 Q 62 20 52 7" fill="none" stroke="#22C55E" strokeWidth="4" strokeLinecap="round" />
              <circle cx="52" cy="7" r="8" fill="#4ADE80" stroke="#15803D" strokeWidth="2" className="animate-bounce" />
              <path d="M 122 42 Q 138 20 148 7" fill="none" stroke="#22C55E" strokeWidth="4" strokeLinecap="round" />
              <circle cx="148" cy="7" r="8" fill="#4ADE80" stroke="#15803D" strokeWidth="2" className="animate-bounce" />
              <ellipse cx="100" cy="117" rx="90" ry="82" fill="rgba(34,197,94,0.07)" stroke="rgba(74,222,128,0.4)" strokeWidth="3" />
            </g>
          )}

          {/* DEAD */}
          {equippedSkin.id === 'DEAD' && (
            <g>
              <line x1="28" y1="92" x2="122" y2="134" stroke="#18181B" strokeWidth="3" />
              <ellipse cx="73" cy="116" rx="16" ry="16" fill="#18181B" stroke="#27272A" strokeWidth="2" />
              <circle cx="73" cy="114" r="5" fill="#E4E4E7" />
              <path d="M 70 121 L 76 121" stroke="#E4E4E7" strokeWidth="2" />
            </g>
          )}

          {/* RICH */}
          {equippedSkin.id === 'RICH' && (
            <g>
              <ellipse cx="100" cy="48" rx="48" ry="10" fill="#18181B" stroke="#09090B" strokeWidth="2" />
              <rect x="66" y="8" width="68" height="42" rx="4" fill="#18181B" stroke="#09090B" strokeWidth="2" />
              <rect x="66" y="37" width="68" height="11" fill="#9333EA" />
              <rect x="93" y="36" width="14" height="13" rx="2" fill="#F59E0B" />
              <circle cx="127" cy="117" r="14" fill="rgba(255,255,255,0.18)" stroke="#F59E0B" strokeWidth="2.5" />
              <path d="M 139 124 Q 150 148, 144 168" fill="none" stroke="#F59E0B" strokeWidth="2" strokeDasharray="2,2" />
              <polygon points="84,183 100,190 84,197" fill="#EF4444" stroke="#991B1B" strokeWidth="1" />
              <polygon points="116,183 100,190 116,197" fill="#EF4444" stroke="#991B1B" strokeWidth="1" />
              <circle cx="100" cy="190" r="4" fill="#B91C1C" />
            </g>
          )}

          {/* GOKU SUPER SAIYAN SPIKY GOLDEN HAIR ON CHARGE */}
          {isCharging && (
            <g className="animate-pulse">
              <path d="M 45 45 C 20 15, 50 -15, 72 25 Z" fill="#FDE047" stroke="#CA8A04" strokeWidth="2" />
              <path d="M 68 28 C 55 -20, 85 -35, 100 12 Z" fill="#FACC15" stroke="#CA8A04" strokeWidth="2" />
              <path d="M 95 15 C 108 -38, 138 -18, 128 28 Z" fill="#FDE047" stroke="#CA8A04" strokeWidth="2" />
              <path d="M 122 30 C 145 -10, 172 15, 152 48 Z" fill="#FACC15" stroke="#CA8A04" strokeWidth="2" />
            </g>
          )}

          {/* Sprout at top with leaf sway animation */}
          <g className={`transition-transform duration-200 origin-bottom ${isPressed ? 'scale-110 -rotate-8' : 'animate-leaf-sway'}`}>
            <path d="M 100 34 C 94 13, 78 3, 68 8 C 84 23, 93 38, 96 50 Z" fill="url(#sproutLeafGrad)" stroke="#047857" strokeWidth="1.5" />
            <path d="M 100 34 C 106 9, 128 3, 138 14 C 122 26, 110 40, 104 50 Z" fill="url(#sproutLeafGrad)" stroke="#047857" strokeWidth="1.5" />
            <path d="M 100 28 C 98 8, 102 0, 100 0 C 98 8, 100 20, 100 28 Z" fill="#34D399" />
          </g>
        </svg>

        {/* DEVASTATING CRITICAL HIT MANGA SPEEDLINES & BADGE */}
        {lastCritical && (
          <div className="absolute inset-0 pointer-events-none z-40 flex items-center justify-center">
            {/* Manga speedlines impact circle */}
            <div className="absolute -inset-10 rounded-full border-4 border-red-500/80 animate-ping" />
            <div className="absolute -inset-16 rounded-full bg-red-500/20 blur-xl animate-pulse" />
            
            {/* Critical Banner */}
            <div
              className="relative px-4 py-1.5 rounded-full text-xs font-black tracking-widest uppercase shadow-2xl border-2 animate-bounce z-50 flex items-center gap-1.5"
              style={{
                color: '#FFFFFF',
                borderColor: '#EF4444',
                backgroundColor: 'rgba(185, 28, 28, 0.95)',
                boxShadow: '0 0 25px rgba(239, 68, 68, 0.9)',
              }}
            >
              <span>💥</span>
              <span>¡GOLPE DEVASTADOR!</span>
              <span>💥</span>
            </div>
          </div>
        )}
      </div>

      {/* Evolution size badge */}
      <div className="mt-2 z-20 flex items-center gap-1.5">
        <div
          className={`text-[10px] font-black uppercase px-3 py-0.5 rounded-full border shadow-md inline-flex items-center gap-1 ${
            isSmall
              ? 'bg-amber-500/15 text-amber-300 border-amber-500/30'
              : 'bg-purple-500/15 text-purple-300 border-purple-500/30 animate-pulse'
          }`}
        >
          <span>{isSmall ? '🌱' : '🌿'}</span>
          <span>{isSmall ? 'Pequeño' : 'Grande (Evolucionado)'}</span>
        </div>

        {/* Energy mini bar */}
        <div className="flex items-center gap-1 text-[10px] font-bold text-emerald-300 bg-black/30 px-2 py-0.5 rounded-full border border-emerald-500/20">
          <span>⚡</span>
          <span>{stats.energy}/{stats.maxEnergy}</span>
        </div>
      </div>
    </div>
  );
};
