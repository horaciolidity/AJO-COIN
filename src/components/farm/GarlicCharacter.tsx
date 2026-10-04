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
    maxChargeMultiplier,
    lastCritical,
    teethCelebration,
    stats,
    isLastTapPerfectRhythm,
  } = useGame();

  const [isPressed, setIsPressed] = useState(false);
  const [expressionIndex, setExpressionIndex] = useState(3);
  const [wobbleAngle, setWobbleAngle] = useState(0);
  const [isBlinking, setIsBlinking] = useState(false);
  const [showCritFlash, setShowCritFlash] = useState(false);
  const [showSpeechBalloon, setShowSpeechBalloon] = useState(false);
  const [activeSpeechText, setActiveSpeechText] = useState('');

  // Enemy attack state & workout training pose tracking
  const [enemyCount, setEnemyCount] = useState(0);
  const [isHitRecently, setIsHitRecently] = useState(false);
  const [workoutPunchCycle, setWorkoutPunchCycle] = useState(0); // 0: left jab, 1: right hook, 2: flex uppercut

  // AI Garlic Ephemeral Speech Dialogues
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

  // Track active enemies & hits to trigger defensive block
  useEffect(() => {
    const handleEnemyCount = (e: Event) => {
      const customEvt = e as CustomEvent<{ count: number }>;
      if (customEvt.detail && typeof customEvt.detail.count === 'number') {
        setEnemyCount(customEvt.detail.count);
      }
    };

    const handleEnemyHit = () => {
      setIsHitRecently(true);
      setTimeout(() => setIsHitRecently(false), 600);
    };

    window.addEventListener('GARLIC_ENEMY_COUNT_CHANGED', handleEnemyCount);
    window.addEventListener('ENEMY_HIT_GARLIC', handleEnemyHit);

    return () => {
      window.removeEventListener('GARLIC_ENEMY_COUNT_CHANGED', handleEnemyCount);
      window.removeEventListener('ENEMY_HIT_GARLIC', handleEnemyHit);
    };
  }, []);

  // Ephemeral, randomized speech balloon popups ONLY when comboCount >= 220
  const inFrenzy = comboCount >= 220;
  useEffect(() => {
    if (!inFrenzy) {
      setShowSpeechBalloon(false);
      return;
    }

    let hideTimer: NodeJS.Timeout;
    let nextTimer: NodeJS.Timeout;

    const triggerNextDialogue = () => {
      const randomIndex = Math.floor(Math.random() * AI_GARLIC_DIALOGUES.length);
      setActiveSpeechText(AI_GARLIC_DIALOGUES[randomIndex]);
      setShowSpeechBalloon(true);

      hideTimer = setTimeout(() => {
        setShowSpeechBalloon(false);
        nextTimer = setTimeout(() => {
          triggerNextDialogue();
        }, 2000);
      }, 4000);
    };

    triggerNextDialogue();

    return () => {
      clearTimeout(hideTimer);
      clearTimeout(nextTimer);
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [inFrenzy]);

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
    setWorkoutPunchCycle((prev) => (prev + 1) % 3);
    setExpressionIndex(Math.floor(Math.random() * 6));
    setWobbleAngle((Math.random() - 0.5) * 16);
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
    setWorkoutPunchCycle((prev) => (prev + 1) % 3);
    setExpressionIndex(Math.floor(Math.random() * 6));
    setWobbleAngle((Math.random() - 0.5) * 16);
    handleTapStart(e.clientX, e.clientY);
  };

  const handleMouseUp = (e: React.MouseEvent<HTMLDivElement>) => {
    setIsPressed(false);
    handleTapEnd(e.clientX, e.clientY);
  };

  // Determine if under enemy attack (requires defensive cover arms)
  const isUnderAttack = isHitRecently || (enemyCount > 0 && isPressed);

  // Determine effort / strain intensity (>= 600 taps or frenzy mode >= 220)
  const totalTaps = stats.totalTaps || 0;
  const isExtremeEffort = totalTaps >= 600 || comboCount >= 220 || comboCount >= 60;

  // Expression calculation
  const currentExpr = isCharging
    ? 6 // Screaming Super Saiyan mode
    : isExtremeEffort
    ? 7 // ULTIMATE INTENSE EFFORT STRAIN FACE (Gritting teeth, heavy sweat, intense strain)
    : isUnderAttack
    ? 0 // OUCH / Shielding block face
    : isPressed
    ? expressionIndex
    : comboCount >= 50 ? 6
    : comboCount >= 30 ? 4
    : comboCount >= 15 ? 1
    : comboCount >= 8 ? 5
    : 3;

  // Body Muscle Evolution Tier (1 to 4) based on Stage Order
  const stageOrder = currentStage.order || 1;
  const bodyTier = stageOrder >= 7 ? 4 : stageOrder >= 5 ? 3 : stageOrder >= 3 ? 2 : 1;

  // Sizing
  const isSmall = currentStage.size === 'SMALL';
  const sizeClass = isSmall
    ? 'w-44 h-52 sm:w-48 sm:h-56'
    : 'w-56 h-64 sm:w-64 sm:h-72';

  // Tremble/Rumble on Goku SSJ Charge or extreme effort
  const trembleClass = isCharging
    ? 'animate-[ssj-rumble_0.07s_ease-in-out_infinite] scale-105'
    : isExtremeEffort
    ? 'animate-[combo-shake_0.15s_ease-in-out_infinite]'
    : comboCount >= 30
    ? 'animate-[combo-shake_0.25s_ease-in-out_infinite]'
    : '';

  // Charge progress ring color
  const chargeColor = chargeLevel >= 0.8 ? equippedTapStyle.color : chargeLevel >= 0.4 ? '#FDE047' : '#34D399';

  // Aura scale
  const auraScale = isExtremeEffort ? 'scale-150 opacity-90 animate-pulse'
    : comboCount >= 25 ? 'scale-125 opacity-70 animate-pulse'
    : 'scale-100 opacity-50';

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

      {/* AI GARLIC EPHEMERAL SPEECH BALLOON */}
      {showSpeechBalloon && comboCount >= 220 && (
        <div className="absolute -top-24 left-1/2 -translate-x-1/2 z-40 max-w-[260px] w-max pointer-events-none animate-fadeIn">
          <div className="relative bg-gradient-to-r from-amber-950/95 via-purple-950/95 to-emerald-950/95 border-2 border-amber-400/80 rounded-2xl px-3.5 py-2 shadow-[0_0_25px_rgba(245,158,11,0.7)] text-center animate-bounce">
            <div className="text-[10px] font-black text-amber-300 flex items-center justify-center gap-1 uppercase tracking-wider">
              <span>🤖🧄</span>
              <span>AJO IA (FRENZY 220+):</span>
            </div>
            <p className="text-[11px] font-bold text-white leading-tight mt-0.5 drop-shadow-md">
              &ldquo;{activeSpeechText}&rdquo;
            </p>
            <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 w-0 h-0 border-l-[8px] border-l-transparent border-r-[8px] border-r-transparent border-t-[8px] border-t-amber-400" />
          </div>
        </div>
      )}

      {/* Tap Style Indicator Badge */}
      <div
        className="absolute -top-7 left-1/2 -translate-x-1/2 z-20 flex items-center gap-1 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider border"
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
        className={`absolute rounded-full transition-all duration-500 pointer-events-none blur-3xl ${auraScale} ${isSmall ? 'w-52 h-52' : 'w-72 h-72'}`}
      />

      {/* GOKU SUPER SAIYAN CHARGING AURA */}
      {isCharging && (
        <div className="absolute pointer-events-none z-10 inset-0 flex items-center justify-center">
          <div className="absolute -inset-14 rounded-full bg-gradient-to-t from-yellow-500 via-amber-400/80 to-transparent blur-2xl animate-pulse" />
          <div className="absolute -inset-10 rounded-full border-4 border-yellow-300/80 blur-md animate-ping" />
          <div className="absolute -top-16 inset-x-0 flex justify-center gap-4 text-2xl animate-ssj-aura">
            <span>🔥</span>
            <span>⚡</span>
            <span>🔥</span>
          </div>
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

      {/* Extreme Effort Workout Steam Particles */}
      {isExtremeEffort && (
        <div className="absolute -top-6 inset-x-0 flex justify-center gap-6 text-sm pointer-events-none z-30 animate-pulse">
          <span className="animate-bounce" style={{ animationDelay: '0ms' }}>💦</span>
          <span className="animate-bounce" style={{ animationDelay: '150ms' }}>💨</span>
          <span className="animate-bounce" style={{ animationDelay: '300ms' }}>⚡</span>
          <span className="animate-bounce" style={{ animationDelay: '450ms' }}>💦</span>
        </div>
      )}

      {/* DEFENSIVE SHIELD GLOW BADGE WHEN UNDER ATTACK */}
      {isUnderAttack && (
        <div className="absolute -top-12 left-1/2 -translate-x-1/2 bg-red-950/95 border-2 border-red-500 text-red-300 px-3 py-1 rounded-full text-[11px] font-black tracking-wider whitespace-nowrap shadow-[0_0_20px_rgba(239,68,68,0.8)] animate-pulse z-40 flex items-center gap-1">
          <span>🛡️</span>
          <span>¡CUBRIÉNDOSE DEL ATAQUE!</span>
        </div>
      )}

      {/* Charge Progress Ring */}
      {isCharging && chargeLevel > 0 && (
        <div className="absolute pointer-events-none z-20" style={{ width: isSmall ? '220px' : '300px', height: isSmall ? '220px' : '300px' }}>
          <svg viewBox="0 0 100 100" className="w-full h-full -rotate-90">
            <circle cx="50" cy="50" r="46" fill="none" stroke="rgba(255,255,255,0.1)" strokeWidth="4" />
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
            ? `scale(${isCharging ? 0.90 + chargeLevel * 0.1 : 0.88}, ${isCharging ? 1.1 + chargeLevel * 0.1 : 1.12}) rotate(${wobbleAngle}deg)`
            : `scale(1) rotate(0deg)`,
        }}
        className={`relative z-10 flex items-center justify-center transition-all duration-100 ease-out ${sizeClass} ${trembleClass} ${
          isPressed ? '' : 'hover:scale-105 animate-anime-breath'
        }`}
      >
        {/* Ground Shadow */}
        <div
          className={`absolute bottom-0 rounded-full bg-black/50 blur-md pointer-events-none transition-all duration-150 ${
            isPressed ? 'scale-75 opacity-75' : 'scale-100 opacity-40'
          }`}
          style={{ width: isSmall ? '140px' : '210px', height: '26px' }}
        />

        {/* ======== HIGH-FIDELITY MUSCULAR GARLIC HERO SVG ======== */}
        <svg
          viewBox="0 0 240 280"
          className="w-full h-full relative z-10 overflow-visible"
          style={{ filter: `drop-shadow(0 12px 28px ${equippedTapStyle.glowColor})` }}
        >
          <defs>
            {/* Garlic Head Gradients */}
            <radialGradient id={`garlicHeadGrad_${currentStage.id}`} cx="40%" cy="30%" r="70%">
              <stop offset="0%" stopColor={currentStage.garlicBodyStartColor} />
              <stop offset="60%" stopColor={currentStage.garlicBodyStartColor} stopOpacity="0.9" />
              <stop offset="100%" stopColor={currentStage.garlicBodyEndColor} />
            </radialGradient>

            {/* Muscle Skin Body Gradients */}
            <linearGradient id="heroBodySkinGrad" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#F5D0A9" />
              <stop offset="50%" stopColor="#E2A676" />
              <stop offset="100%" stopColor="#B86F43" />
            </linearGradient>

            <linearGradient id="heroMuscleShade" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="rgba(255,255,255,0.4)" />
              <stop offset="50%" stopColor="rgba(180,95,45,0.2)" />
              <stop offset="100%" stopColor="rgba(100,40,10,0.6)" />
            </linearGradient>

            <radialGradient id="glossShineHead" cx="30%" cy="20%" r="60%">
              <stop offset="0%" stopColor="rgba(255,255,255,0.95)" />
              <stop offset="45%" stopColor="rgba(255,255,255,0.3)" />
              <stop offset="100%" stopColor="rgba(255,255,255,0)" />
            </radialGradient>

            <linearGradient id="sproutLeafGrad" x1="0%" y1="100%" x2="0%" y2="0%">
              <stop offset="0%" stopColor="#047857" />
              <stop offset="60%" stopColor="#10B981" />
              <stop offset="100%" stopColor="#6EE7B7" />
            </linearGradient>

            <radialGradient id="irisGradAnime" cx="40%" cy="35%" r="60%">
              <stop offset="0%" stopColor="#A855F7" />
              <stop offset="45%" stopColor="#6B21A8" />
              <stop offset="100%" stopColor="#1E0A3C" />
            </radialGradient>

            {/* Glowing vein color for Tier 4 body */}
            <linearGradient id="veinGlowGrad" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#FDE047" />
              <stop offset="50%" stopColor="#F59E0B" />
              <stop offset="100%" stopColor="#EF4444" />
            </linearGradient>

            {/* Fire Skin Body Gradient */}
            <linearGradient id="fireSkinBodyGrad" x1="0%" y1="100%" x2="0%" y2="0%">
              <stop offset="0%" stopColor="#991B1B" />
              <stop offset="50%" stopColor="#EA580C" />
              <stop offset="100%" stopColor="#FACC15" />
            </linearGradient>
          </defs>

          {/* === AURA EFFECTS === */}
          {isExtremeEffort && (
            <g className="animate-pulse">
              <circle cx="120" cy="140" r="115" fill="none" stroke="#F59E0B" strokeWidth="2" strokeDasharray="6,6" opacity="0.6" />
              <circle cx="120" cy="140" r="105" fill="none" stroke="#EF4444" strokeWidth="1.5" opacity="0.4" />
            </g>
          )}

          {/* Defensive Shield Bubble when Under Attack */}
          {isUnderAttack && (
            <g className="animate-pulse">
              <ellipse cx="120" cy="140" rx="100" ry="115" fill="rgba(239, 68, 68, 0.12)" stroke="#EF4444" strokeWidth="3.5" strokeDasharray="10,5" />
              <ellipse cx="120" cy="140" rx="90" ry="105" fill="none" stroke="#FCA5A5" strokeWidth="2" opacity="0.7" />
            </g>
          )}

          {/* ========================================================================= */}
          {/* === BODY & LEGS (HUMANOID MUSCULAR BODY THAT EVOLVES WITH TIER 1-4) === */}
          {/* ========================================================================= */}

          {/* === LEGS & FEET/BOOTS === */}
          <g id="legs-and-boots">
            {/* Left Leg */}
            <path
              d={bodyTier >= 3
                ? "M 92 205 C 80 225, 75 245, 78 262"
                : "M 95 205 C 86 225, 82 245, 84 262"}
              fill="none"
              stroke={equippedSkin.id === 'NINJA' ? '#18181B' : equippedSkin.id === 'ROBOT' ? '#334155' : '#854D0E'}
              strokeWidth={bodyTier >= 3 ? "24" : "18"}
              strokeLinecap="round"
            />
            {/* Left Boot */}
            <path
              d="M 62 268 C 62 258, 85 258, 92 268 C 92 274, 62 274, 62 268 Z"
              fill={equippedSkin.id === 'NINJA' ? '#09090B' : equippedSkin.id === 'KING' ? '#991B1B' : '#451A03'}
              stroke="#18181B"
              strokeWidth="2"
            />

            {/* Right Leg */}
            <path
              d={bodyTier >= 3
                ? "M 148 205 C 160 225, 165 245, 162 262"
                : "M 145 205 C 154 225, 158 245, 156 262"}
              fill="none"
              stroke={equippedSkin.id === 'NINJA' ? '#18181B' : equippedSkin.id === 'ROBOT' ? '#334155' : '#854D0E'}
              strokeWidth={bodyTier >= 3 ? "24" : "18"}
              strokeLinecap="round"
            />
            {/* Right Boot */}
            <path
              d="M 148 268 C 148 258, 178 258, 178 268 C 178 274, 148 274, 148 268 Z"
              fill={equippedSkin.id === 'NINJA' ? '#09090B' : equippedSkin.id === 'KING' ? '#991B1B' : '#451A03'}
              stroke="#18181B"
              strokeWidth="2"
            />
          </g>

          {/* === MAIN MUSCULAR TORSO (CHEST, ABS & TRAPS) === */}
          <g id="muscular-torso">
            {/* Neck / Traps connecting into Garlic Head base */}
            <path
              d={bodyTier >= 3
                ? "M 70 110 L 88 88 L 152 88 L 170 110 Z"
                : "M 82 110 L 96 90 L 144 90 L 158 110 Z"}
              fill={equippedSkin.id === 'FIRE' ? 'url(#fireSkinBodyGrad)' : 'url(#heroBodySkinGrad)'}
              stroke="#7C2D12" strokeWidth="2"
            />

            {/* Main Upper Body Torso Path */}
            <path
              d={bodyTier === 4
                ? "M 52 112 C 50 145, 80 205, 120 208 C 160 205, 190 145, 188 112 C 165 105, 75 105, 52 112 Z"
                : bodyTier === 3
                ? "M 58 115 C 56 145, 82 205, 120 206 C 158 205, 184 145, 182 115 C 160 108, 80 108, 58 115 Z"
                : bodyTier === 2
                ? "M 64 118 C 62 145, 85 202, 120 204 C 155 202, 178 145, 176 118 C 155 110, 85 110, 64 118 Z"
                : "M 72 120 C 70 145, 90 200, 120 202 C 150 200, 170 145, 168 120 C 150 112, 90 112, 72 120 Z"}
              fill={equippedSkin.id === 'FIRE' ? 'url(#fireSkinBodyGrad)' : equippedSkin.id === 'ROBOT' ? '#1E293B' : 'url(#heroBodySkinGrad)'}
              stroke="#6B21A8" strokeWidth="0"
            />

            {/* Muscle shading & outline */}
            <path
              d={bodyTier >= 3
                ? "M 52 112 C 50 145, 80 205, 120 208 C 160 205, 190 145, 188 112 Z"
                : "M 64 118 C 62 145, 85 202, 120 204 C 155 202, 178 145, 176 118 Z"}
              fill="url(#heroMuscleShade)"
              stroke="#581C87" strokeWidth="2.5" opacity="0.95"
            />

            {/* --- DEFINED CHEST PECS --- */}
            <path d="M 68 126 C 90 120, 118 138, 120 152 C 115 138, 80 120, 68 126 Z" fill="rgba(0,0,0,0.18)" />
            <path d="M 172 126 C 150 120, 122 138, 120 152 C 125 138, 160 120, 172 126 Z" fill="rgba(0,0,0,0.18)" />
            <path d="M 68 126 C 92 152, 118 152, 120 152 M 172 126 C 148 152, 122 152, 120 152" fill="none" stroke="#451A03" strokeWidth="2.5" strokeLinecap="round" />
            <line x1="120" y1="114" x2="120" y2="198" stroke="#451A03" strokeWidth="2" strokeLinecap="round" opacity="0.7" />

            {/* --- ABS DEFINITION (4-pack, 6-pack or 8-pack depending on Tier) --- */}
            {/* Upper Abs Pair */}
            <rect x="92" y="156" width="22" height="12" rx="3" fill="rgba(0,0,0,0.12)" stroke="#451A03" strokeWidth="1.5" />
            <rect x="126" y="156" width="22" height="12" rx="3" fill="rgba(0,0,0,0.12)" stroke="#451A03" strokeWidth="1.5" />

            {/* Mid Abs Pair */}
            {bodyTier >= 2 && (
              <>
                <rect x="94" y="171" width="20" height="12" rx="3" fill="rgba(0,0,0,0.12)" stroke="#451A03" strokeWidth="1.5" />
                <rect x="126" y="171" width="20" height="12" rx="3" fill="rgba(0,0,0,0.12)" stroke="#451A03" strokeWidth="1.5" />
              </>
            )}

            {/* Lower Abs Pair */}
            {bodyTier >= 3 && (
              <>
                <rect x="96" y="186" width="18" height="11" rx="3" fill="rgba(0,0,0,0.12)" stroke="#451A03" strokeWidth="1.5" />
                <rect x="126" y="186" width="18" height="11" rx="3" fill="rgba(0,0,0,0.12)" stroke="#451A03" strokeWidth="1.5" />
              </>
            )}

            {/* Super Titan Glowing Veins (Tier 4) */}
            {bodyTier === 4 && (
              <g opacity="0.85" className="animate-pulse">
                <path d="M 68 132 Q 82 142 90 135" fill="none" stroke="url(#veinGlowGrad)" strokeWidth="2.5" strokeLinecap="round" />
                <path d="M 172 132 Q 158 142 150 135" fill="none" stroke="url(#veinGlowGrad)" strokeWidth="2.5" strokeLinecap="round" />
                <path d="M 88 165 Q 78 178 72 188" fill="none" stroke="url(#veinGlowGrad)" strokeWidth="2" strokeLinecap="round" />
                <path d="M 152 165 Q 162 178 168 188" fill="none" stroke="url(#veinGlowGrad)" strokeWidth="2" strokeLinecap="round" />
              </g>
            )}

            {/* Belt / Waist Wrap */}
            <rect
              x="82" y="196" width="76" height="14" rx="4"
              fill={equippedSkin.id === 'NINJA' ? '#DC2626' : equippedSkin.id === 'KING' ? '#D97706' : '#78350F'}
              stroke="#18181B" strokeWidth="2"
            />
            {/* Belt Buckle */}
            <rect x="110" y="194" width="20" height="18" rx="3" fill="#F59E0B" stroke="#78350F" strokeWidth="1.5" />
            <text x="120" y="207" textAnchor="middle" fontSize="10" fontWeight="bold" fill="#78350F">🧄</text>
          </g>

          {/* ========================================================================= */}
          {/* === ARMS & WORKOUT POSES / DEFENSIVE COVER ARMS === */}
          {/* ========================================================================= */}
          <g id="hero-arms">
            {/* 🛡️ CONDITION A: DEFENSIVE BLOCK / COVER POSTURE (Under Enemy Attack) */}
            {isUnderAttack ? (
              <g key="defensive-block" className="transition-all duration-150">
                {/* Left Arm shielding chest/face */}
                <path
                  d="M 60 120 C 35 125, 65 80, 105 102"
                  fill="none" stroke="url(#heroBodySkinGrad)" strokeWidth={bodyTier >= 3 ? "24" : "18"} strokeLinecap="round"
                />
                <path d="M 60 120 C 35 125, 65 80, 105 102" fill="none" stroke="#451A03" strokeWidth="3" strokeLinecap="round" />
                {/* Left Fist in boxing guard */}
                <circle cx="106" cy="102" r={bodyTier >= 3 ? "14" : "11"} fill="#9A3412" stroke="#18181B" strokeWidth="2" />

                {/* Right Arm shielding chest/face */}
                <path
                  d="M 180 120 C 205 125, 175 80, 135 102"
                  fill="none" stroke="url(#heroBodySkinGrad)" strokeWidth={bodyTier >= 3 ? "24" : "18"} strokeLinecap="round"
                />
                <path d="M 180 120 C 205 125, 175 80, 135 102" fill="none" stroke="#451A03" strokeWidth="3" strokeLinecap="round" />
                {/* Right Fist in boxing guard */}
                <circle cx="134" cy="102" r={bodyTier >= 3 ? "14" : "11"} fill="#9A3412" stroke="#18181B" strokeWidth="2" />

                {/* Defensive Impact Sparkle */}
                <circle cx="120" cy="102" r="18" fill="rgba(239, 68, 68, 0.4)" stroke="#EF4444" strokeWidth="2" className="animate-ping" />
              </g>
            ) : isPressed ? (
              /* 🥊 CONDITION B: WORKOUT TRAINING MOVEMENT (Tapped for XP) */
              workoutPunchCycle === 0 ? (
                /* Pose 1: Left Jab Punch Forward! */
                <g key="workout-left-jab">
                  {/* Left Arm Punching Outward */}
                  <path d="M 65 125 L 15 115" fill="none" stroke="url(#heroBodySkinGrad)" strokeWidth={bodyTier >= 3 ? "24" : "18"} strokeLinecap="round" />
                  <path d="M 65 125 L 15 115" fill="none" stroke="#451A03" strokeWidth="3" strokeLinecap="round" />
                  <circle cx="12" cy="115" r={bodyTier >= 3 ? "15" : "12"} fill="#DC2626" stroke="#18181B" strokeWidth="2" />
                  {/* Punch Wave Effect */}
                  <path d="M 5 100 Q -10 115 5 130" fill="none" stroke="#F59E0B" strokeWidth="4" strokeLinecap="round" className="animate-ping" />

                  {/* Right Arm flexed back at hip */}
                  <path d="M 175 125 C 190 140, 180 165, 160 160" fill="none" stroke="url(#heroBodySkinGrad)" strokeWidth={bodyTier >= 3 ? "24" : "18"} strokeLinecap="round" />
                  <path d="M 175 125 C 190 140, 180 165, 160 160" fill="none" stroke="#451A03" strokeWidth="3" strokeLinecap="round" />
                  <circle cx="160" cy="160" r={bodyTier >= 3 ? "14" : "11"} fill="#DC2626" stroke="#18181B" strokeWidth="2" />
                </g>
              ) : workoutPunchCycle === 1 ? (
                /* Pose 2: Right Cross Punch Forward! */
                <g key="workout-right-cross">
                  {/* Left Arm flexed back at hip */}
                  <path d="M 65 125 C 50 140, 60 165, 80 160" fill="none" stroke="url(#heroBodySkinGrad)" strokeWidth={bodyTier >= 3 ? "24" : "18"} strokeLinecap="round" />
                  <path d="M 65 125 C 50 140, 60 165, 80 160" fill="none" stroke="#451A03" strokeWidth="3" strokeLinecap="round" />
                  <circle cx="80" cy="160" r={bodyTier >= 3 ? "14" : "11"} fill="#DC2626" stroke="#18181B" strokeWidth="2" />

                  {/* Right Arm Punching Outward */}
                  <path d="M 175 125 L 225 115" fill="none" stroke="url(#heroBodySkinGrad)" strokeWidth={bodyTier >= 3 ? "24" : "18"} strokeLinecap="round" />
                  <path d="M 175 125 L 225 115" fill="none" stroke="#451A03" strokeWidth="3" strokeLinecap="round" />
                  <circle cx="228" cy="115" r={bodyTier >= 3 ? "15" : "12"} fill="#DC2626" stroke="#18181B" strokeWidth="2" />
                  {/* Punch Wave Effect */}
                  <path d="M 235 100 Q 250 115 235 130" fill="none" stroke="#F59E0B" strokeWidth="4" strokeLinecap="round" className="animate-ping" />
                </g>
              ) : (
                /* Pose 3: Double Bicep Uppercut Flex! */
                <g key="workout-flex-uppercut">
                  {/* Left Bicep Flex */}
                  <path d="M 65 125 C 35 120, 40 85, 65 92" fill="none" stroke="url(#heroBodySkinGrad)" strokeWidth={bodyTier >= 3 ? "26" : "20"} strokeLinecap="round" />
                  <path d="M 65 125 C 35 120, 40 85, 65 92" fill="none" stroke="#451A03" strokeWidth="3" strokeLinecap="round" />
                  <circle cx="65" cy="88" r={bodyTier >= 3 ? "15" : "12"} fill="#DC2626" stroke="#18181B" strokeWidth="2" />

                  {/* Right Bicep Flex */}
                  <path d="M 175 125 C 205 120, 200 85, 175 92" fill="none" stroke="url(#heroBodySkinGrad)" strokeWidth={bodyTier >= 3 ? "26" : "20"} strokeLinecap="round" />
                  <path d="M 175 125 C 205 120, 200 85, 175 92" fill="none" stroke="#451A03" strokeWidth="3" strokeLinecap="round" />
                  <circle cx="175" cy="88" r={bodyTier >= 3 ? "15" : "12"} fill="#DC2626" stroke="#18181B" strokeWidth="2" />
                </g>
              )
            ) : (
              /* 🏋️ CONDITION C: NORMAL IDLE HEROIC ARMS */
              <g key="hero-arms-idle">
                {/* Left Arm */}
                <path d="M 68 122 C 45 135, 45 165, 58 178" fill="none" stroke="url(#heroBodySkinGrad)" strokeWidth={bodyTier >= 3 ? "22" : "16"} strokeLinecap="round" />
                <path d="M 68 122 C 45 135, 45 165, 58 178" fill="none" stroke="#451A03" strokeWidth="2.5" strokeLinecap="round" />
                <circle cx="58" cy="180" r={bodyTier >= 3 ? "12" : "10"} fill={equippedSkin.id === 'NINJA' ? '#18181B' : '#B45309'} stroke="#18181B" strokeWidth="1.5" />

                {/* Right Arm */}
                <path d="M 172 122 C 195 135, 195 165, 182 178" fill="none" stroke="url(#heroBodySkinGrad)" strokeWidth={bodyTier >= 3 ? "22" : "16"} strokeLinecap="round" />
                <path d="M 172 122 C 195 135, 195 165, 182 178" fill="none" stroke="#451A03" strokeWidth="2.5" strokeLinecap="round" />
                <circle cx="182" cy="180" r={bodyTier >= 3 ? "12" : "10"} fill={equippedSkin.id === 'NINJA' ? '#18181B' : '#B45309'} stroke="#18181B" strokeWidth="1.5" />
              </g>
            )}
          </g>

          {/* ========================================================================= */}
          {/* === GARLIC HEAD (ONLY THE HEAD IS GARLIC) === */}
          {/* ========================================================================= */}
          <g id="garlic-head-assembly">

            {/* === FIRE SKIN BACKGROUND FLAMES === */}
            {equippedSkin.id === 'FIRE' && (
              <g className="animate-pulse">
                <path d="M 55 70 C 35 40, 50 10, 80 -5 C 100 -20, 140 -20, 160 -5 C 190 10, 205 40, 185 70 Z"
                  fill="url(#fireSkinBodyGrad)" opacity="0.45" />
              </g>
            )}

            {/* === MAIN GARLIC BULB HEAD === */}
            <path
              d="M 120 18 C 72 18, 48 48, 48 82 C 48 108, 75 118, 120 118 C 165 118, 192 108, 192 82 C 192 48, 168 18, 120 18 Z"
              fill={`url(#garlicHeadGrad_${currentStage.id})`}
              stroke={currentStage.strokeColor}
              strokeWidth="3.5"
            />

            {/* Garlic Head Clove Segment Curves */}
            <path d="M 120 18 C 95 45, 82 75, 84 116" fill="none" stroke={currentStage.strokeColor} strokeWidth="2" opacity="0.6" />
            <path d="M 120 18 C 145 45, 158 75, 156 116" fill="none" stroke={currentStage.strokeColor} strokeWidth="2" opacity="0.6" />

            {/* 3D Specular Highlight on Head */}
            <ellipse cx="96" cy="48" rx="26" ry="18" fill="url(#glossShineHead)" opacity="0.8" />

            {/* === SKIN OVERLAYS ON HEAD & BODY === */}
            {equippedSkin.id === 'ROBOT' && (
              <g opacity="0.9">
                <rect x="76" y="65" width="88" height="24" rx="6" fill="#0F172A" stroke="#06B6D4" strokeWidth="2" />
                <line x1="82" y1="77" x2="158" y2="77" stroke="#22D3EE" strokeWidth="4" strokeLinecap="round" className="animate-pulse" />
                <circle cx="120" cy="77" r="5" fill="#67E8F9" />
              </g>
            )}

            {equippedSkin.id === 'DEAD' && (
              <g stroke="#27272A" strokeWidth="2.5" strokeLinecap="round">
                <line x1="60" y1="50" x2="180" y2="95" stroke="#18181B" strokeWidth="3" />
                <ellipse cx="95" cy="72" rx="14" ry="14" fill="#18181B" />
                <circle cx="95" cy="70" r="4" fill="#E4E4E7" />
              </g>
            )}

            {equippedSkin.id === 'RICH' && (
              <g>
                {/* Dark Cool Sunglasses */}
                <path d="M 72 62 L 114 62 L 108 82 L 78 82 Z" fill="#09090B" stroke="#F59E0B" strokeWidth="2" />
                <path d="M 126 62 L 168 62 L 162 82 L 132 82 Z" fill="#09090B" stroke="#F59E0B" strokeWidth="2" />
                <line x1="114" y1="68" x2="126" y2="68" stroke="#F59E0B" strokeWidth="3" />
                {/* Big Gold Chain with $ Medallion */}
                <path d="M 85 110 Q 120 135 155 110" fill="none" stroke="#F59E0B" strokeWidth="4" strokeDasharray="4,2" />
                <circle cx="120" cy="132" r="10" fill="#F59E0B" stroke="#B45309" strokeWidth="1.5" />
                <text x="120" y="136" textAnchor="middle" fontSize="11" fontWeight="black" fill="#78350F">$</text>
              </g>
            )}

            {/* Blushing Cheeks */}
            <ellipse cx="78" cy="85" rx="10" ry="6" fill={isPressed ? '#EF4444' : '#F472B6'} opacity={isPressed ? 0.9 : 0.5} />
            <ellipse cx="162" cy="85" rx="10" ry="6" fill={isPressed ? '#EF4444' : '#F472B6'} opacity={isPressed ? 0.9 : 0.5} />

            {/* ========================================================================= */}
            {/* === ANIME EXPRESSIONS & INTENSE EFFORT (> 600 TAPS / STRAIN) === */}
            {/* ========================================================================= */}
            {isBlinking && !isPressed && currentExpr !== 6 && currentExpr !== 7 ? (
              <g key="blink">
                <path d="M 82 72 Q 95 78 108 72" fill="none" stroke="#1E0A3C" strokeWidth="4" strokeLinecap="round" />
                <path d="M 132 72 Q 145 78 158 72" fill="none" stroke="#1E0A3C" strokeWidth="4" strokeLinecap="round" />
                <path d="M 102 92 Q 120 102 138 92" fill="none" stroke="#1E0A3C" strokeWidth="4" strokeLinecap="round" />
              </g>
            ) : (
              <g key={`expr-${currentExpr}`}>

                {/* EXPR 0: OUCH / DEFENSIVE STRAIN */}
                {currentExpr === 0 && (
                  <g>
                    <path d="M 82 68 L 98 76 L 82 82" fill="none" stroke="#1E0A3C" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round" />
                    <path d="M 158 68 L 142 76 L 158 82" fill="none" stroke="#1E0A3C" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round" />
                    <ellipse cx="120" cy="94" rx="14" ry="9" fill="#1E0A3C" />
                    <ellipse cx="120" cy="97" rx="8" ry="4" fill="#EF4444" />
                  </g>
                )}

                {/* EXPR 1: CRAZY / WINK */}
                {currentExpr === 1 && (
                  <g>
                    <circle cx="92" cy="72" r="13" fill="url(#irisGradAnime)" />
                    <circle cx="92" cy="72" r="8" fill="#2E0D70" />
                    <circle cx="95" cy="68" r="4.5" fill="#FFFFFF" />
                    <path d="M 132 72 Q 145 78 158 72" fill="none" stroke="#1E0A3C" strokeWidth="4" strokeLinecap="round" />
                    <path d="M 102 90 Q 120 106 138 90" fill="none" stroke="#1E0A3C" strokeWidth="4" strokeLinecap="round" />
                  </g>
                )}

                {/* EXPR 2: DIZZY / STARS */}
                {currentExpr === 2 && (
                  <g>
                    <path d="M 84 66 L 100 80 M 100 66 L 84 80" stroke="#1E0A3C" strokeWidth="4" strokeLinecap="round" />
                    <path d="M 140 66 L 156 80 M 156 66 L 140 80" stroke="#1E0A3C" strokeWidth="4" strokeLinecap="round" />
                    <path d="M 102 92 Q 111 86 120 92 T 138 92" fill="none" stroke="#1E0A3C" strokeWidth="4" strokeLinecap="round" />
                  </g>
                )}

                {/* EXPR 3: NORMAL HEROIC HAPPY */}
                {currentExpr === 3 && (
                  <g>
                    {/* Left Eye */}
                    <circle cx="92" cy="72" r="13" fill="white" />
                    <circle cx="92" cy="72" r="11" fill="url(#irisGradAnime)" />
                    <circle cx="92" cy="72" r="6" fill="#130636" />
                    <circle cx="95" cy="68" r="4" fill="white" />

                    {/* Right Eye */}
                    <circle cx="148" cy="72" r="13" fill="white" />
                    <circle cx="148" cy="72" r="11" fill="url(#irisGradAnime)" />
                    <circle cx="148" cy="72" r="6" fill="#130636" />
                    <circle cx="151" cy="68" r="4" fill="white" />

                    {/* Eyebrows */}
                    <path d="M 82 56 Q 92 50 102 56" fill="none" stroke="#1E0A3C" strokeWidth="3.5" strokeLinecap="round" />
                    <path d="M 138 56 Q 148 50 158 56" fill="none" stroke="#1E0A3C" strokeWidth="3.5" strokeLinecap="round" />

                    {/* Mouth */}
                    <path d="M 104 90 Q 120 106 136 90" fill="#1E0A3C" stroke="#1E0A3C" strokeWidth="2" />
                    <ellipse cx="120" cy="100" rx="5" ry="3" fill="#DC2626" />
                  </g>
                )}

                {/* EXPR 4: AMAZED / STAR EYES */}
                {currentExpr === 4 && (
                  <g>
                    <polygon points="92,60 95,68 104,68 97,74 100,82 92,77 84,82 87,74 80,68 89,68" fill="#F59E0B" />
                    <polygon points="148,60 151,68 160,68 153,74 156,82 148,77 140,82 143,74 136,68 145,68" fill="#F59E0B" />
                    <path d="M 102 90 Q 120 110 138 90 Z" fill="#1E0A3C" />
                  </g>
                )}

                {/* EXPR 5: SURPRISED */}
                {currentExpr === 5 && (
                  <g>
                    <circle cx="92" cy="72" r="13" fill="white" stroke="#1E0A3C" strokeWidth="2.5" />
                    <circle cx="92" cy="72" r="6" fill="url(#irisGradAnime)" />
                    <circle cx="148" cy="72" r="13" fill="white" stroke="#1E0A3C" strokeWidth="2.5" />
                    <circle cx="148" cy="72" r="6" fill="url(#irisGradAnime)" />
                    <circle cx="120" cy="94" r="10" fill="#1E0A3C" />
                  </g>
                )}

                {/* EXPR 6: FRENZY / PANIC */}
                {currentExpr === 6 && (
                  <g>
                    <circle cx="92" cy="72" r="12" fill="white" stroke="#1E0A3C" strokeWidth="2.5" />
                    <circle cx="92" cy="72" r="3.5" fill="#1E0A3C" className="animate-bounce" />
                    <circle cx="148" cy="72" r="12" fill="white" stroke="#1E0A3C" strokeWidth="2.5" />
                    <circle cx="148" cy="72" r="3.5" fill="#1E0A3C" className="animate-bounce" />
                    <ellipse cx="120" cy="96" rx="16" ry="11" fill="#1E0A3C" />
                  </g>
                )}

                {/* 🔥 EXPR 7: ULTIMATE INTENSE EFFORT STRAIN FACE (> 600 TAPS / HARD EFFORT) */}
                {currentExpr === 7 && (
                  <g key="extreme-effort-strain">
                    {/* Fierce Slanted Locked-In Eyebrows */}
                    <path d="M 78 54 L 104 66" fill="none" stroke="#1E0A3C" strokeWidth="5" strokeLinecap="round" />
                    <path d="M 162 54 L 136 66" fill="none" stroke="#1E0A3C" strokeWidth="5" strokeLinecap="round" />

                    {/* Gritting Teeth Mouth with Teeth Line (😬 Strain Effort) */}
                    <rect x="100" y="86" width="40" height="18" rx="5" fill="#FFFFFF" stroke="#1E0A3C" strokeWidth="3" />
                    <line x1="100" y1="95" x2="140" y2="95" stroke="#1E0A3C" strokeWidth="2" />
                    <line x1="110" y1="86" x2="110" y2="104" stroke="#D1D5DB" strokeWidth="1.5" />
                    <line x1="120" y1="86" x2="120" y2="104" stroke="#D1D5DB" strokeWidth="1.5" />
                    <line x1="130" y1="86" x2="130" y2="104" stroke="#D1D5DB" strokeWidth="1.5" />

                    {/* Intense Focused Eyes */}
                    <ellipse cx="92" cy="72" rx="12" ry="9" fill="white" stroke="#1E0A3C" strokeWidth="2.5" />
                    <circle cx="92" cy="72" r="6" fill="#DC2626" />
                    <circle cx="94" cy="70" r="2" fill="white" />

                    <ellipse cx="148" cy="72" rx="12" ry="9" fill="white" stroke="#1E0A3C" strokeWidth="2.5" />
                    <circle cx="148" cy="72" r="6" fill="#DC2626" />
                    <circle cx="150" cy="70" r="2" fill="white" />

                    {/* Pulsing Stress Vein on Forehead (💢) */}
                    <g className="animate-pulse">
                      <path d="M 115 36 C 118 30, 124 30, 127 36 M 121 30 L 121 42" stroke="#EF4444" strokeWidth="2.5" strokeLinecap="round" />
                    </g>

                    {/* Heavy Sweat Drops Pouring Down Head & Body */}
                    <path d="M 172 58 C 172 52, 178 45, 178 45 C 178 45, 184 52, 184 58 C 184 62, 178 66, 172 58 Z" fill="#38BDF8" className="animate-bounce" />
                    <path d="M 58 64 C 58 58, 64 50, 64 50 C 64 50, 70 58, 70 64 C 70 68, 64 72, 58 64 Z" fill="#38BDF8" className="animate-bounce" style={{ animationDelay: '100ms' }} />
                  </g>
                )}
              </g>
            )}

            {/* === SKIN HEAD ACCESSORIES === */}
            {equippedSkin.id === 'NINJA' && (
              <g id="head-ninja-gear">
                {/* Ninja Headband */}
                <path d="M 50 48 Q 120 38 190 48 L 188 62 Q 120 52 52 62 Z" fill="#18181B" stroke="#09090B" strokeWidth="2" />
                {/* Steel Plate with Leaf/Cross Emblem */}
                <rect x="104" y="42" width="32" height="18" rx="3" fill="#E4E4E7" stroke="#71717A" strokeWidth="1.5" />
                <path d="M 112 51 L 128 51 M 120 45 L 120 57" stroke="#18181B" strokeWidth="2" strokeLinecap="round" />
                {/* Ninja Face Mask covering chin */}
                <path d="M 68 85 C 90 102, 150 102, 172 85 L 168 116 C 145 124, 95 124, 72 116 Z" fill="#18181B" stroke="#09090B" strokeWidth="2" />
              </g>
            )}

            {equippedSkin.id === 'KING' && (
              <g id="head-king-gear">
                {/* Regal Gold Crown with Gems */}
                <polygon points="70,30 84,2 102,22 120,-10 138,22 156,2 170,30" fill="#F59E0B" stroke="#B45309" strokeWidth="2.5" />
                <rect x="70" y="24" width="100" height="12" rx="3" fill="#D97706" stroke="#92400E" strokeWidth="1.5" />
                <circle cx="120" cy="-10" r="6" fill="#EF4444" stroke="#991B1B" strokeWidth="1.5" />
                <circle cx="84" cy="2" r="5" fill="#3B82F6" stroke="#1E40AF" strokeWidth="1" />
                <circle cx="156" cy="2" r="5" fill="#10B981" stroke="#065F46" strokeWidth="1" />
                {/* Regal Shoulder Cape Draped Over Muscular Back */}
                <path d="M 45 115 C 20 150, 15 210, 30 250 L 58 245 C 48 210, 48 150, 68 122 Z" fill="#DC2626" stroke="#991B1B" strokeWidth="2" />
                <path d="M 195 115 C 220 150, 225 210, 210 250 L 182 245 C 192 210, 192 150, 172 122 Z" fill="#DC2626" stroke="#991B1B" strokeWidth="2" />
              </g>
            )}

            {/* Sprout on Garlic Head Top */}
            <g className={`transition-transform duration-200 origin-bottom ${isPressed ? 'scale-110 -rotate-6' : 'animate-leaf-sway'}`}>
              <path d="M 120 20 C 112 0, 94 -12, 82 -6 C 100 12, 110 30, 115 42 Z" fill="url(#sproutLeafGrad)" stroke="#047857" strokeWidth="1.5" />
              <path d="M 120 20 C 128 -2, 150 -12, 162 0 C 144 15, 130 32, 125 42 Z" fill="url(#sproutLeafGrad)" stroke="#047857" strokeWidth="1.5" />
              <path d="M 120 14 C 118 -8, 122 -18, 120 -18 C 118 -8, 120 6, 120 14 Z" fill="#34D399" />
            </g>
          </g>

          {/* DEVASTATING CRITICAL HIT IMPACT BADGE */}
          {lastCritical && (
            <g className="animate-bounce">
              <circle cx="120" cy="140" r="65" fill="rgba(239, 68, 68, 0.4)" stroke="#EF4444" strokeWidth="4" className="animate-ping" />
              <rect x="40" y="125" width="160" height="30" rx="15" fill="rgba(185, 28, 28, 0.95)" stroke="#EF4444" strokeWidth="2" />
              <text x="120" y="145" textAnchor="middle" fontSize="13" fontWeight="900" fill="#FFFFFF" letterSpacing="1">
                💥 ¡GOLPE DEVASTADOR! 💥
              </text>
            </g>
          )}
        </svg>
      </div>

      {/* Evolution size & workout status badge */}
      <div className="mt-2 z-20 flex items-center gap-1.5">
        <div
          className={`text-[10px] font-black uppercase px-3 py-0.5 rounded-full border shadow-md inline-flex items-center gap-1 ${
            isExtremeEffort
              ? 'bg-amber-500/20 text-amber-300 border-amber-500/40 animate-pulse'
              : 'bg-emerald-500/15 text-emerald-300 border-emerald-500/30'
          }`}
        >
          <span>{isExtremeEffort ? '🔥' : isSmall ? '🌱' : '🌿'}</span>
          <span>
            {isExtremeEffort
              ? `ENTRENAMIENTO INTENSO (Tier ${bodyTier})`
              : `Ajo Héroe (Tier ${bodyTier})`}
          </span>
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
