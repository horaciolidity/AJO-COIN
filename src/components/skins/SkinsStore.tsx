import React, { useState } from 'react';
import { useGame } from '../../context/GameContext';
import { SKINS_CATALOG, TAP_STYLES_CATALOG, getSkinLevel } from '../../config/gameBalance';
import { SkinId, TapStyleId } from '../../types';
import { Sparkles, Check, Lock, Palette, Swords, Zap, Shield, Star, TrendingUp } from 'lucide-react';

type StoreTab = 'skins' | 'attacks';

// ── Inline SVG skin illustrations ──────────────────────────────────────────
// Each one depicts the garlic character wearing the skin costume.
const SkinIllustration: React.FC<{ skinId: SkinId; size?: number }> = ({ skinId, size = 56 }) => {
  const s = size;
  // Common garlic body base
  const body = (
    <>
      <defs>
        <radialGradient id={`bg_${skinId}`} cx="38%" cy="28%" r="68%">
          <stop offset="0%" stopColor="#FFFDE7" />
          <stop offset="60%" stopColor="#F5F0E0" />
          <stop offset="100%" stopColor="#D6C5A8" />
        </radialGradient>
        <radialGradient id={`shine_${skinId}`} cx="30%" cy="22%" r="55%">
          <stop offset="0%" stopColor="rgba(255,255,255,0.95)" />
          <stop offset="100%" stopColor="rgba(255,255,255,0)" />
        </radialGradient>
      </defs>
      {/* Legs */}
      <path d="M38 82 C35 88, 32 91, 30 94" fill="none" stroke="#D6C5A8" strokeWidth="5" strokeLinecap="round"/>
      <ellipse cx="29" cy="95" rx="7" ry="3" fill="#D6C5A8"/>
      <path d="M62 82 C65 88, 68 91, 70 94" fill="none" stroke="#D6C5A8" strokeWidth="5" strokeLinecap="round"/>
      <ellipse cx="71" cy="95" rx="7" ry="3" fill="#D6C5A8"/>
      {/* Body */}
      <path d="M50 17 C26 17, 14 36, 14 57 C14 76, 30 88, 50 88 C70 88, 86 76, 86 57 C86 36, 74 17, 50 17 Z"
        fill={`url(#bg_${skinId})`} stroke="#C4B18E" strokeWidth="1.5"/>
      {/* Clove lines */}
      <path d="M50 17 C38 34, 32 54, 33 86" fill="none" stroke="#C4B18E" strokeWidth="1" strokeLinecap="round" opacity="0.6"/>
      <path d="M50 17 C62 34, 68 54, 67 86" fill="none" stroke="#C4B18E" strokeWidth="1" strokeLinecap="round" opacity="0.6"/>
      {/* Shine */}
      <ellipse cx="38" cy="38" rx="16" ry="11" fill={`url(#shine_${skinId})`} opacity="0.7"/>
      {/* Cheeks */}
      <ellipse cx="28" cy="60" rx="6" ry="4" fill="#F472B6" opacity="0.5"/>
      <ellipse cx="72" cy="60" rx="6" ry="4" fill="#F472B6" opacity="0.5"/>
      {/* Eyes */}
      <circle cx="37" cy="52" r="6" fill="white"/>
      <circle cx="37" cy="52" r="5" fill="#4C1D95"/>
      <circle cx="37" cy="52" r="3" fill="#130636"/>
      <circle cx="39" cy="50" r="2" fill="white"/>
      <circle cx="63" cy="52" r="6" fill="white"/>
      <circle cx="63" cy="52" r="5" fill="#4C1D95"/>
      <circle cx="63" cy="52" r="3" fill="#130636"/>
      <circle cx="65" cy="50" r="2" fill="white"/>
      {/* Mouth smile */}
      <path d="M42 65 Q50 72 58 65" fill="#1E0A3C" stroke="#1E0A3C" strokeWidth="1.5"/>
      {/* Sprout */}
      <path d="M50 15 C46 5, 39 1, 35 4 C42 11, 47 17, 48 22 Z" fill="#10B981" stroke="#047857" strokeWidth="1"/>
      <path d="M50 15 C54 3, 63 1, 67 6 C60 12, 53 18, 52 22 Z" fill="#10B981" stroke="#047857" strokeWidth="1"/>
      {/* Arms */}
      <path d="M24 58 C16 50, 12 44, 16 38" fill="none" stroke="#D6C5A8" strokeWidth="6" strokeLinecap="round"/>
      <circle cx="16" cy="37" r="4" fill="#E2D7C2" stroke="#C4B18E" strokeWidth="1"/>
      <path d="M76 58 C84 50, 88 44, 84 38" fill="none" stroke="#D6C5A8" strokeWidth="6" strokeLinecap="round"/>
      <circle cx="84" cy="37" r="4" fill="#E2D7C2" stroke="#C4B18E" strokeWidth="1"/>
    </>
  );

  const overlays: Record<SkinId, React.ReactNode> = {
    DEFAULT: null,
    NINJA: (
      <>
        {/* Black headband */}
        <rect x="22" y="14" width="56" height="10" rx="4" fill="#18181B"/>
        {/* Metal plate on headband */}
        <rect x="43" y="15" width="14" height="8" rx="2" fill="#6366F1"/>
        <line x1="50" y1="16" x2="50" y2="22" stroke="#818CF8" strokeWidth="1.5"/>
        <line x1="46" y1="19" x2="54" y2="19" stroke="#818CF8" strokeWidth="1.5"/>
        {/* Scarf/mask covering lower face */}
        <path d="M22 62 C30 74, 70 74, 78 62 L76 80 C60 90, 40 90, 24 80 Z" fill="#1E1B4B" stroke="#3730A3" strokeWidth="1"/>
        {/* Left rope */}
        <path d="M22 14 C10 22, 8 38, 10 50" fill="none" stroke="#18181B" strokeWidth="4" strokeLinecap="round"/>
        {/* Katana on back */}
        <rect x="80" y="20" width="3" height="52" rx="1.5" fill="#94A3B8" stroke="#64748B" strokeWidth="0.5"/>
        <rect x="78" y="20" width="7" height="7" rx="1" fill="#F59E0B"/>
        <rect x="80" y="70" width="3" height="4" rx="1" fill="#D97706"/>
      </>
    ),
    KING: (
      <>
        {/* Crown */}
        <polygon points="26,14 33,2 42,12 50,0 58,12 67,2 74,14" fill="#F59E0B" stroke="#D97706" strokeWidth="1.5"/>
        <rect x="26" y="12" width="48" height="7" rx="3" fill="#D97706"/>
        {/* Crown gems */}
        <circle cx="50" cy="2" r="3" fill="#EF4444"/>
        <circle cx="33" cy="4" r="2.5" fill="#3B82F6"/>
        <circle cx="67" cy="4" r="2.5" fill="#10B981"/>
        <circle cx="35" cy="14" r="2" fill="#EF4444"/>
        <circle cx="50" cy="14" r="2.5" fill="#3B82F6"/>
        <circle cx="65" cy="14" r="2" fill="#10B981"/>
        {/* Royal cape at bottom */}
        <path d="M20 78 C34 92, 66 92, 80 78 L78 86 C62 98, 38 98, 22 86 Z" fill="#DC2626" stroke="#991B1B" strokeWidth="1"/>
        {/* Ermine dots */}
        <circle cx="35" cy="84" r="2" fill="white" opacity="0.6"/>
        <circle cx="50" cy="88" r="2" fill="white" opacity="0.6"/>
        <circle cx="65" cy="84" r="2" fill="white" opacity="0.6"/>
      </>
    ),
    ROBOT: (
      <>
        {/* Cyber visor */}
        <rect x="22" y="44" width="56" height="18" rx="6" fill="#0F172A" stroke="#06B6D4" strokeWidth="2"/>
        <line x1="28" y1="53" x2="72" y2="53" stroke="#22D3EE" strokeWidth="4" strokeLinecap="round"/>
        <circle cx="50" cy="53" r="4" fill="#67E8F9"/>
        {/* Antenna */}
        <line x1="50" y1="16" x2="50" y2="4" stroke="#64748B" strokeWidth="2.5"/>
        <circle cx="50" cy="3" r="3.5" fill="#EF4444"/>
        <circle cx="50" cy="3" r="3.5" fill="#EF4444" opacity="0.5" className="animate-ping"/>
        {/* Side bolts */}
        <rect x="10" y="50" width="6" height="12" rx="2" fill="#64748B" stroke="#334155" strokeWidth="1"/>
        <rect x="84" y="50" width="6" height="12" rx="2" fill="#64748B" stroke="#334155" strokeWidth="1"/>
        {/* Circuit lines on body */}
        <path d="M24 65 L34 65 L40 72 L46 72" fill="none" stroke="#06B6D4" strokeWidth="1.5" opacity="0.7"/>
        <path d="M76 65 L66 65 L60 72 L54 72" fill="none" stroke="#06B6D4" strokeWidth="1.5" opacity="0.7"/>
        <circle cx="46" cy="72" r="2" fill="#22D3EE"/>
        <circle cx="54" cy="72" r="2" fill="#22D3EE"/>
      </>
    ),
    FIRE: (
      <>
        {/* Flame aura behind */}
        <path d="M30 18 C20 5, 34 -5, 40 16 C48 -2, 52 -8, 58 14 C66 -2, 80 8, 70 18 Z" fill="#F97316" opacity="0.85"/>
        <path d="M34 18 C28 8, 38 2, 42 16 C48 4, 52 -2, 58 14 C62 4, 70 10, 66 18 Z" fill="#FDE047" opacity="0.9"/>
        {/* Fire crown/hair on top */}
        <path d="M36 20 C30 10, 36 4, 42 18 Z" fill="#EF4444"/>
        <path d="M50 15 C47 3, 53 3, 50 15 Z" fill="#F97316"/>
        <path d="M64 20 C70 10, 64 4, 58 18 Z" fill="#EF4444"/>
        {/* Ember particles */}
        <circle cx="20" cy="30" r="2" fill="#FDE047" opacity="0.7"/>
        <circle cx="80" cy="25" r="1.5" fill="#F97316" opacity="0.8"/>
        <circle cx="15" cy="55" r="1.5" fill="#EF4444" opacity="0.6"/>
        <circle cx="85" cy="50" r="2" fill="#FDE047" opacity="0.6"/>
      </>
    ),
    ALIEN: (
      <>
        {/* Alien antennae */}
        <path d="M36 17 C30 6, 22 2, 18 6" fill="none" stroke="#22C55E" strokeWidth="3" strokeLinecap="round"/>
        <circle cx="17" cy="5" r="4.5" fill="#4ADE80" stroke="#15803D" strokeWidth="1.5"/>
        <path d="M64 17 C70 6, 78 2, 82 6" fill="none" stroke="#22C55E" strokeWidth="3" strokeLinecap="round"/>
        <circle cx="83" cy="5" r="4.5" fill="#4ADE80" stroke="#15803D" strokeWidth="1.5"/>
        {/* Alien force field ring */}
        <ellipse cx="50" cy="57" rx="44" ry="38" fill="none" stroke="rgba(34,197,94,0.35)" strokeWidth="3"/>
        {/* Green eyes override */}
        <circle cx="37" cy="52" r="6" fill="#052E16"/>
        <ellipse cx="37" cy="52" rx="4" ry="6" fill="#22C55E"/>
        <circle cx="37" cy="50" r="2" fill="#86EFAC"/>
        <circle cx="63" cy="52" r="6" fill="#052E16"/>
        <ellipse cx="63" cy="52" rx="4" ry="6" fill="#22C55E"/>
        <circle cx="63" cy="50" r="2" fill="#86EFAC"/>
      </>
    ),
    DEAD: (
      <>
        {/* X eyes */}
        <line x1="33" y1="48" x2="41" y2="56" stroke="#18181B" strokeWidth="3" strokeLinecap="round"/>
        <line x1="41" y1="48" x2="33" y2="56" stroke="#18181B" strokeWidth="3" strokeLinecap="round"/>
        <line x1="59" y1="48" x2="67" y2="56" stroke="#18181B" strokeWidth="3" strokeLinecap="round"/>
        <line x1="67" y1="48" x2="59" y2="56" stroke="#18181B" strokeWidth="3" strokeLinecap="round"/>
        {/* Cracked skull halo */}
        <ellipse cx="50" cy="12" rx="20" ry="7" fill="none" stroke="#71717A" strokeWidth="2" strokeDasharray="4 3"/>
        {/* Stitched mouth */}
        <path d="M38 66 L44 62 L50 66 L56 62 L62 66" fill="none" stroke="#18181B" strokeWidth="2.5" strokeLinecap="round"/>
        {/* Skull cross marks on body */}
        <path d="M23 73 L30 80 M30 73 L23 80" stroke="#27272A" strokeWidth="2" strokeLinecap="round"/>
        <path d="M70 73 L77 80 M77 73 L70 80" stroke="#27272A" strokeWidth="2" strokeLinecap="round"/>
        {/* Green decay tint */}
        <ellipse cx="50" cy="57" rx="35" ry="30" fill="rgba(74,222,128,0.06)"/>
      </>
    ),
    RICH: (
      <>
        {/* Top hat */}
        <ellipse cx="50" cy="20" rx="26" ry="6" fill="#18181B" stroke="#09090B" strokeWidth="1.5"/>
        <rect x="36" y="2" width="28" height="19" rx="3" fill="#18181B" stroke="#09090B" strokeWidth="1.5"/>
        {/* Hat band */}
        <rect x="36" y="17" width="28" height="5" fill="#9333EA"/>
        <rect x="47" y="16" width="6" height="7" rx="1.5" fill="#F59E0B"/>
        {/* Monocle */}
        <circle cx="63" cy="52" r="8" fill="none" stroke="#F59E0B" strokeWidth="2.5"/>
        <path d="M71" cy="52" to="M75 55 C78 60, 76 68, 72 72" fill="none" stroke="#F59E0B" strokeWidth="1.5"/>
        <line x1="70" y1="55" x2="74" y2="70" stroke="#F59E0B" strokeWidth="1.5"/>
        {/* Bow tie */}
        <polygon points="44,74 50,70 56,74 50,78" fill="#EF4444" stroke="#991B1B" strokeWidth="1"/>
        <circle cx="50" cy="74" r="2.5" fill="#B91C1C"/>
        {/* Money bag in hand */}
        <circle cx="84" cy="38" r="6" fill="#F59E0B" stroke="#D97706" strokeWidth="1.5"/>
        <text x="81" y="41" fontSize="7" fill="#92400E" fontWeight="bold">$</text>
      </>
    ),
  };

  return (
    <svg viewBox="0 0 100 100" width={s} height={s} style={{ display: 'block' }}>
      {body}
      {overlays[skinId]}
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

                  {/* SVG Skin illustration */}
                  <div
                    className="rounded-xl p-1.5 mb-2"
                    style={{ backgroundColor: 'rgba(0,0,0,0.3)', border: `1px solid ${accent}44` }}
                  >
                    <SkinIllustration skinId={skin.id} size={72} />
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
