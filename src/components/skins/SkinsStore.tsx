import React, { useState } from 'react';
import { useGame } from '../../context/GameContext';
import { SKINS_CATALOG, TAP_STYLES_CATALOG, getSkinLevel } from '../../config/gameBalance';
import { SkinId, TapStyleId } from '../../types';
import { SkinBackground } from '../farm/SkinBackground';
import { Sparkles, Check, Lock, Palette, Swords, Zap, Shield, Star, TrendingUp } from 'lucide-react';

type StoreTab = 'skins' | 'attacks';

// ── Inline SVG skin illustrations ──────────────────────────────────────────
// Each one depicts the garlic character wearing the skin costume.
const SkinIllustration: React.FC<{ skinId: SkinId; size?: number }> = ({ skinId, size = 56 }) => {
  const s = size;
  return (
    <svg viewBox="0 0 100 115" width={s} height={s * 1.15} style={{ display: 'block' }}>
      <defs>
        <radialGradient id={`skHeadGrad_${skinId}`} cx="40%" cy="30%" r="70%">
          <stop offset="0%" stopColor="#FFFFFF" />
          <stop offset="60%" stopColor="#F5F0E0" />
          <stop offset="100%" stopColor="#D6C5A8" />
        </radialGradient>
        <linearGradient id={`skBodyGrad_${skinId}`} x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="#F5D0A9" />
          <stop offset="50%" stopColor="#E2A676" />
          <stop offset="100%" stopColor="#B86F43" />
        </linearGradient>
        <linearGradient id="skSproutGrad" x1="0%" y1="100%" x2="0%" y2="0%">
          <stop offset="0%" stopColor="#047857" />
          <stop offset="100%" stopColor="#34D399" />
        </linearGradient>
        <radialGradient id="skEyeIris" cx="40%" cy="35%" r="60%">
          <stop offset="0%" stopColor="#A855F7" />
          <stop offset="100%" stopColor="#1E0A3C" />
        </radialGradient>
      </defs>

      <g key="legs">
        <path d="M 38 88 L 32 108" stroke={skinId === 'NINJA' ? '#18181B' : skinId === 'ROBOT' ? '#334155' : '#78350F'} strokeWidth="8" strokeLinecap="round" />
        <ellipse cx="30" cy="110" rx="6" ry="3" fill={skinId === 'NINJA' ? '#09090B' : skinId === 'KING' ? '#991B1B' : '#451A03'} />
        <path d="M 62 88 L 68 108" stroke={skinId === 'NINJA' ? '#18181B' : skinId === 'ROBOT' ? '#334155' : '#78350F'} strokeWidth="8" strokeLinecap="round" />
        <ellipse cx="70" cy="110" rx="6" ry="3" fill={skinId === 'NINJA' ? '#09090B' : skinId === 'KING' ? '#991B1B' : '#451A03'} />
      </g>

      <g key="torso">
        <path
          d="M 26 52 C 24 64, 34 90, 50 90 C 66 90, 76 64, 74 52 C 64 48, 36 48, 26 52 Z"
          fill={skinId === 'FIRE' ? '#C2410C' : skinId === 'ROBOT' ? '#1E293B' : `url(#skBodyGrad_${skinId})`}
          stroke="#451A03" strokeWidth="1.5"
        />
        <path d="M 32 58 C 42 55, 49 62, 50 68 M 68 58 C 58 55, 51 62, 50 68" fill="none" stroke="#451A03" strokeWidth="1.2" />
        <rect x="39" y="70" width="9" height="5" rx="1.5" fill="rgba(0,0,0,0.15)" stroke="#451A03" strokeWidth="0.8" />
        <rect x="52" y="70" width="9" height="5" rx="1.5" fill="rgba(0,0,0,0.15)" stroke="#451A03" strokeWidth="0.8" />
        <rect x="34" y="84" width="32" height="6" rx="2" fill={skinId === 'NINJA' ? '#DC2626' : skinId === 'KING' ? '#D97706' : '#78350F'} />
        <rect x="46" y="83" width="8" height="8" rx="1" fill="#F59E0B" />
      </g>

      <g key="arms">
        <path d="M 28 54 C 18 60, 18 72, 24 80" fill="none" stroke={`url(#skBodyGrad_${skinId})`} strokeWidth="8" strokeLinecap="round" />
        <circle cx="24" cy="80" r="4.5" fill={skinId === 'NINJA' ? '#18181B' : '#B45309'} />
        <path d="M 72 54 C 82 60, 82 72, 76 80" fill="none" stroke={`url(#skBodyGrad_${skinId})`} strokeWidth="8" strokeLinecap="round" />
        <circle cx="76" cy="80" r="4.5" fill={skinId === 'NINJA' ? '#18181B' : '#B45309'} />
      </g>

      <g key="head">
        <path
          d="M 50 8 C 30 8, 20 20, 20 34 C 20 45, 30 50, 50 50 C 70 50, 80 45, 80 34 C 80 20, 70 8, 50 8 Z"
          fill={`url(#skHeadGrad_${skinId})`} stroke="#C4B18E" strokeWidth="1.8"
        />
        <path d="M 50 8 C 40 20, 35 32, 36 49" fill="none" stroke="#C4B18E" strokeWidth="1" opacity="0.6" />
        <path d="M 50 8 C 60 20, 65 32, 64 49" fill="none" stroke="#C4B18E" strokeWidth="1" opacity="0.6" />

        <circle cx="38" cy="28" r="5" fill="white" />
        <circle cx="38" cy="28" r="4" fill="url(#skEyeIris)" />
        <circle cx="39" cy="26" r="1.5" fill="white" />
        <circle cx="62" cy="28" r="5" fill="white" />
        <circle cx="62" cy="28" r="4" fill="url(#skEyeIris)" />
        <circle cx="63" cy="26" r="1.5" fill="white" />

        <path d="M 44 36 Q 50 42 56 36" fill="none" stroke="#1E0A3C" strokeWidth="1.5" strokeLinecap="round" />

        <path d="M 50 8 C 46 0, 38 -4, 34 0 C 42 6, 46 11, 48 14 Z" fill="url(#skSproutGrad)" stroke="#047857" strokeWidth="1" />
        <path d="M 50 8 C 54 0, 62 -4, 66 0 C 58 6, 54 11, 52 14 Z" fill="url(#skSproutGrad)" stroke="#047857" strokeWidth="1" />
      </g>

      {skinId === 'NINJA' && (
        <g key="ninja">
          <rect x="22" y="16" width="56" height="7" rx="2" fill="#18181B" />
          <rect x="44" y="17" width="12" height="5" rx="1" fill="#E4E4E7" />
          <path d="M 28 35 C 38 42, 62 42, 72 35 L 70 50 C 60 54, 40 54, 30 50 Z" fill="#18181B" />
          <line x1="72" y1="12" x2="84" y2="70" stroke="#94A3B8" strokeWidth="2.5" />
        </g>
      )}

      {skinId === 'KING' && (
        <g key="king">
          <polygon points="32,10 38,0 44,7 50,-3 56,7 62,0 68,10" fill="#F59E0B" stroke="#B45309" strokeWidth="1" />
          <rect x="32" y="8" width="36" height="4" rx="1" fill="#D97706" />
          <circle cx="50" cy="-3" r="2" fill="#EF4444" />
          <path d="M 22 50 C 10 65, 8 95, 14 112 L 25 110 C 20 95, 20 65, 28 52 Z" fill="#DC2626" />
          <path d="M 78 50 C 90 65, 92 95, 86 112 L 75 110 C 80 95, 80 65, 72 52 Z" fill="#DC2626" />
        </g>
      )}

      {skinId === 'ROBOT' && (
        <g key="robot">
          <rect x="30" y="24" width="40" height="10" rx="3" fill="#0F172A" stroke="#06B6D4" strokeWidth="1" />
          <line x1="34" y1="29" x2="66" y2="29" stroke="#22D3EE" strokeWidth="2" />
          <circle cx="50" cy="8" r="3" fill="#EF4444" />
        </g>
      )}

      {skinId === 'FIRE' && (
        <g key="fire" opacity="0.85">
          <path d="M 24 16 C 14 4, 28 -4, 34 12 C 42 -2, 50 -6, 56 10 C 64 -2, 76 6, 68 16 Z" fill="#F97316" />
          <path d="M 28 16 C 22 8, 32 3, 36 14 C 42 4, 48 -1, 54 10 Z" fill="#FACC15" />
        </g>
      )}

      {skinId === 'ALIEN' && (
        <g key="alien">
          <path d="M 34 10 Q 24 0 18 3" fill="none" stroke="#22C55E" strokeWidth="2" />
          <circle cx="17" cy="3" r="3" fill="#4ADE80" />
          <path d="M 66 10 Q 76 0 82 3" fill="none" stroke="#22C55E" strokeWidth="2" />
          <circle cx="83" cy="3" r="3" fill="#4ADE80" />
        </g>
      )}

      {skinId === 'DEAD' && (
        <g key="dead">
          <line x1="26" y1="22" x2="74" y2="40" stroke="#18181B" strokeWidth="2" />
          <ellipse cx="38" cy="28" rx="5" ry="5" fill="#18181B" />
          <ellipse cx="62" cy="28" rx="5" ry="5" fill="#18181B" />
        </g>
      )}

      {skinId === 'RICH' && (
        <g key="rich">
          <path d="M 32 23 L 48 23 L 45 31 L 34 31 Z" fill="#09090B" stroke="#F59E0B" strokeWidth="1" />
          <path d="M 52 23 L 68 23 L 65 31 L 54 31 Z" fill="#09090B" stroke="#F59E0B" strokeWidth="1" />
          <path d="M 38 48 Q 50 60 62 48" fill="none" stroke="#F59E0B" strokeWidth="2" strokeDasharray="2,1" />
          <circle cx="50" cy="57" r="4.5" fill="#F59E0B" />
        </g>
      )}
    </svg>
  );
};

// ── Level progress bar ─────────────────────────────────────────────────────
const SkinLevelBadge: React.FC<{ level: number; color: string }> = ({ level, color }) => {
  const pct = ((level - 1) / 49) * 100;
  const tier = level >= 40 ? 'LEGENDARIO' : level >= 25 ? 'ÉPICO' : level >= 10 ? 'RARO' : 'COMÚN';
  const tierColor = level >= 40 ? '#F59E0B' : level >= 25 ? '#A855F7' : level >= 10 ? '#3B82F6' : '#6B7280';
  return (
    <div className="w-full mt-2 space-y-1">
      <div className="flex items-center justify-between text-[10px]">
        <span className="font-black" style={{ color }}>Nivel {level}/50</span>
        <span className="font-bold px-1.5 py-0.5 rounded text-[9px]" style={{ backgroundColor: `${tierColor}22`, color: tierColor }}>
          {tier}
        </span>
      </div>
      <div className="w-full h-1.5 bg-black/40 rounded-full overflow-hidden">
        <div
          className="h-full rounded-full transition-all duration-500"
          style={{ width: `${pct}%`, background: `linear-gradient(90deg, ${color}, ${color}aa)` }}
        />
      </div>
    </div>
  );
};

// ── Main Component ─────────────────────────────────────────────────────────
export const SkinsStore: React.FC = () => {
  const { inventory, stats, purchaseSkin, equipSkin, purchaseTapStyle, equipTapStyle, currentStage } = useGame();
  const [activeTab, setActiveTab] = useState<StoreTab>('skins');

  const skinLevel = getSkinLevel(stats.xp, stats.totalTaps);

  const handleSkinAction = (skinId: SkinId, isUnlocked: boolean, isEquipped: boolean) => {
    if (isEquipped) return;
    if (isUnlocked) equipSkin(skinId);
    else purchaseSkin(skinId);
  };

  const handleAttackAction = (styleId: TapStyleId, isUnlocked: boolean, isEquipped: boolean) => {
    if (isEquipped) return;
    if (isUnlocked) equipTapStyle(styleId);
    else purchaseTapStyle(styleId);
  };

  return (
    <div className="p-4 max-w-md mx-auto space-y-4 pb-24">
      {/* Header */}
      <div className="text-center space-y-1">
        <h2 className="text-2xl font-black uppercase text-white tracking-tight flex items-center justify-center gap-2">
          <Palette className="w-6 h-6 text-purple-400" />
          <span>TIENDA DE PODER</span>
          <Sparkles className="w-5 h-5 text-yellow-400" />
        </h2>
        <p className="text-xs text-gray-300 font-medium">
          Skins cosméticos y ataques especiales • Paga con Garlic Teeth 🦷
        </p>
      </div>

      {/* Balances + Skin Level */}
      <div className="glass-panel p-3 rounded-2xl border border-amber-500/30 flex items-center justify-between shadow-lg gap-3">
        <div className="flex items-center gap-2">
          <span className="text-2xl">🦷</span>
          <div>
            <span className="block text-[10px] text-amber-400 font-semibold uppercase">Dientes</span>
            <span className="text-xl font-black text-white">{inventory.garlicTeeth.toLocaleString()}</span>
          </div>
        </div>
        <div className="flex-1">
          <div className="flex items-center gap-1 text-[10px] text-purple-300 font-bold mb-1">
            <TrendingUp className="w-3 h-3" />
            <span>Nivel Global de Skin</span>
          </div>
          <SkinLevelBadge level={skinLevel} color="#A855F7" />
        </div>
      </div>

      {/* Tab Switch */}
      <div className="grid grid-cols-2 gap-2 bg-black/30 p-1.5 rounded-2xl border border-white/10">
        <button
          onClick={() => setActiveTab('skins')}
          className={`flex items-center justify-center gap-1.5 py-2.5 rounded-xl text-xs font-black uppercase transition-all ${
            activeTab === 'skins'
              ? 'bg-purple-600 text-white shadow-lg shadow-purple-500/30'
              : 'text-gray-400 hover:text-white'
          }`}
        >
          <Palette className="w-3.5 h-3.5" />
          Skins ({SKINS_CATALOG.length})
        </button>
        <button
          onClick={() => setActiveTab('attacks')}
          className={`flex items-center justify-center gap-1.5 py-2.5 rounded-xl text-xs font-black uppercase transition-all ${
            activeTab === 'attacks'
              ? 'bg-gradient-to-r from-red-600 to-orange-500 text-white shadow-lg shadow-red-500/30'
              : 'text-gray-400 hover:text-white'
          }`}
        >
          <Swords className="w-3.5 h-3.5" />
          Ataques ({TAP_STYLES_CATALOG.length})
        </button>
      </div>

      {/* === SKINS TAB === */}
      {activeTab === 'skins' && (
        <div className="grid grid-cols-2 gap-3">
          {SKINS_CATALOG.map((skin) => {
            const isUnlocked = inventory.unlockedSkins.includes(skin.id);
            const isEquipped = inventory.equippedSkin === skin.id;
            const canAfford = inventory.garlicTeeth >= skin.priceGarlicTeeth;
            const accent = skin.color || '#A855F7';
            const grad = skin.gradient || `linear-gradient(135deg, #1a1a2e, ${accent})`;

            return (
              <div
                key={skin.id}
                className={`relative rounded-2xl overflow-hidden border-2 transition-all flex flex-col ${
                  isEquipped
                    ? 'shadow-lg'
                    : isUnlocked
                    ? 'border-white/20'
                    : 'border-white/8 opacity-90'
                }`}
                style={{
                  borderColor: isEquipped ? accent : undefined,
                  boxShadow: isEquipped ? `0 0 18px ${accent}55` : undefined,
                }}
              >
                {/* Card background with gradient */}
                <div
                  className="relative flex flex-col items-center pt-4 pb-2 px-3"
                  style={{ background: grad }}
                >
                  {/* Equipped badge */}
                  {isEquipped && (
                    <div
                      className="absolute top-2 right-2 flex items-center gap-0.5 px-1.5 py-0.5 rounded-full text-[9px] font-black"
                      style={{ backgroundColor: accent, color: '#fff' }}
                    >
                      <Check className="w-2.5 h-2.5" />
                      ACTIVO
                    </div>
                  )}
                  {/* Locked overlay */}
                  {!isUnlocked && (
                    <div className="absolute top-2 left-2 bg-black/60 rounded-full p-1">
                      <Lock className="w-3 h-3 text-gray-400" />
                    </div>
                  )}

                  {/* SVG Skin illustration with dynamic backdrop */}
                  <div
                    className="relative rounded-xl p-1.5 mb-2 overflow-hidden w-24 h-24 flex items-center justify-center border shadow-inner"
                    style={{ backgroundColor: 'rgba(0,0,0,0.4)', borderColor: `${accent}44` }}
                  >
                    <SkinBackground skinId={skin.id} />
                    <div className="relative z-10">
                      <SkinIllustration skinId={skin.id} size={70} />
                    </div>
                  </div>

                  {/* Name + tag */}
                  <h4 className="font-black text-sm text-white leading-tight text-center">{skin.name}</h4>
                  <span
                    className="text-[9px] font-bold px-2 py-0.5 rounded-full mt-1 uppercase tracking-wider"
                    style={{ backgroundColor: `${accent}33`, color: accent }}
                  >
                    {skin.tag}
                  </span>
                </div>

                {/* Description + action */}
                <div className="bg-black/60 px-3 py-2 flex flex-col gap-2 flex-1">
                  <p className="text-[10px] text-gray-400 leading-snug">{skin.description}</p>

                  {/* Skin level bar (only shown when unlocked) */}
                  {isUnlocked && (
                    <SkinLevelBadge level={skinLevel} color={accent} />
                  )}

                  {/* Action button */}
                  {isEquipped ? (
                    <div
                      className="w-full text-center py-1.5 rounded-xl text-xs font-black"
                      style={{ backgroundColor: `${accent}22`, color: accent }}
                    >
                      ✓ Equipado
                    </div>
                  ) : isUnlocked ? (
                    <button
                      onClick={() => handleSkinAction(skin.id, true, false)}
                      className="w-full py-1.5 rounded-xl text-xs font-black transition-all active:scale-95"
                      style={{ backgroundColor: accent, color: '#fff' }}
                    >
                      Equipar
                    </button>
                  ) : (
                    <button
                      onClick={() => handleSkinAction(skin.id, false, false)}
                      disabled={!canAfford}
                      className={`w-full py-1.5 rounded-xl text-xs font-black flex items-center justify-center gap-1 transition-all ${
                        canAfford ? 'active:scale-95' : 'opacity-40 cursor-not-allowed'
                      }`}
                      style={canAfford
                        ? { background: `linear-gradient(135deg, #F59E0B, #D97706)`, color: '#000' }
                        : { backgroundColor: '#27272A', color: '#71717A' }
                      }
                    >
                      <span>🦷</span>
                      <span>{skin.priceGarlicTeeth.toLocaleString()}</span>
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* === ATTACKS TAB === */}
      {activeTab === 'attacks' && (
        <div className="space-y-3">
          <p className="text-[11px] text-gray-400 text-center pb-1">
            Los ataques mejoran tus taps: críticos, carga, y combos más poderosos.
          </p>

          {TAP_STYLES_CATALOG.map((style) => {
            const isUnlocked = (inventory.unlockedTapStyles || []).includes(style.id);
            const isEquipped = (inventory.equippedTapStyle || 'NORMAL') === style.id;
            const canAfford = inventory.garlicTeeth >= style.priceGarlicTeeth;

            return (
              <div
                key={style.id}
                className="glass-panel rounded-2xl border overflow-hidden transition-all"
                style={{
                  borderColor: isEquipped ? style.color : isUnlocked ? `${style.color}55` : 'rgba(255,255,255,0.08)',
                  boxShadow: isEquipped ? `0 0 16px ${style.glowColor}` : 'none',
                }}
              >
                <div className="p-3.5 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div
                      className="w-12 h-12 rounded-2xl flex items-center justify-center text-2xl border shrink-0 font-black"
                      style={{
                        backgroundColor: `${style.color}22`,
                        borderColor: `${style.color}55`,
                      }}
                    >
                      {style.particleEmoji}
                    </div>
                    <div>
                      <h4 className="font-extrabold text-sm" style={{ color: isEquipped ? style.color : 'white' }}>
                        {style.name}
                      </h4>
                      <p className="text-[10px] text-gray-400 leading-tight mt-0.5 max-w-[170px]">
                        {style.description}
                      </p>
                    </div>
                  </div>

                  <div className="shrink-0 ml-2">
                    {isEquipped ? (
                      <span
                        className="px-2.5 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1 border"
                        style={{
                          backgroundColor: `${style.color}22`,
                          borderColor: `${style.color}66`,
                          color: style.color,
                        }}
                      >
                        <Zap className="w-3 h-3" /> ACTIVO
                      </span>
                    ) : isUnlocked ? (
                      <button
                        onClick={() => handleAttackAction(style.id, true, false)}
                        className="px-3 py-1.5 rounded-xl text-xs font-bold transition-all active:scale-95 border"
                        style={{
                          backgroundColor: `${style.color}22`,
                          borderColor: `${style.color}55`,
                          color: style.color,
                        }}
                      >
                        Equipar
                      </button>
                    ) : (
                      <button
                        onClick={() => handleAttackAction(style.id, false, false)}
                        disabled={!canAfford}
                        className={`px-2.5 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1 transition-all ${
                          canAfford ? 'hover:scale-105 active:scale-95' : 'opacity-40 cursor-not-allowed'
                        }`}
                        style={canAfford ? {
                          background: `linear-gradient(135deg, ${style.color}, ${style.glowColor})`,
                          color: 'white',
                        } : {
                          backgroundColor: '#1f2937',
                          color: '#6b7280',
                        }}
                      >
                        {!canAfford && <Lock className="w-3 h-3" />}
                        <span>🦷 {style.priceGarlicTeeth}</span>
                      </button>
                    )}
                  </div>
                </div>

                {/* Stats bar */}
                <div
                  className="grid grid-cols-4 gap-px text-[10px] font-bold border-t"
                  style={{ borderColor: `${style.color}22` }}
                >
                  {[
                    { icon: <Star className="w-3 h-3 mx-auto mb-0.5"/>, val: `${style.criticalMultiplier}x`, label: 'CRIT' },
                    { icon: <Zap className="w-3 h-3 mx-auto mb-0.5"/>, val: `${Math.round(style.criticalChance * 100)}%`, label: 'CHANCE' },
                    { icon: <Shield className="w-3 h-3 mx-auto mb-0.5"/>, val: `${style.chargeMultiplier}x`, label: 'CARGA' },
                    { icon: <Sparkles className="w-3 h-3 mx-auto mb-0.5"/>, val: `${style.comboMultiplier}x`, label: 'COMBO' },
                  ].map((stat, i) => (
                    <div key={i} className="text-center py-1.5 px-1" style={{ backgroundColor: `${style.color}0d` }}>
                      <div style={{ color: style.color }}>{stat.icon}</div>
                      <div style={{ color: style.color }}>{stat.val}</div>
                      <div className="text-gray-500 text-[8px]">{stat.label}</div>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
