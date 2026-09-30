import React, { useState } from 'react';
import { useGame } from '../../context/GameContext';
import { SKINS_CATALOG, TAP_STYLES_CATALOG } from '../../config/gameBalance';
import { SkinId, TapStyleId } from '../../types';
import { Sparkles, Check, Lock, Palette, Swords, Zap, Shield, Star } from 'lucide-react';

type StoreTab = 'skins' | 'attacks';

export const SkinsStore: React.FC = () => {
  const { inventory, purchaseSkin, equipSkin, purchaseTapStyle, equipTapStyle, currentStage } = useGame();
  const [activeTab, setActiveTab] = useState<StoreTab>('skins');

  const handleSkinAction = (skinId: SkinId, isUnlocked: boolean, isEquipped: boolean) => {
    if (isEquipped) return;
    if (isUnlocked) {
      equipSkin(skinId);
    } else {
      purchaseSkin(skinId);
    }
  };

  const handleAttackAction = (styleId: TapStyleId, isUnlocked: boolean, isEquipped: boolean) => {
    if (isEquipped) return;
    if (isUnlocked) {
      equipTapStyle(styleId);
    } else {
      purchaseTapStyle(styleId);
    }
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
          Skins cosméticos y ataques especiales con Garlic Teeth 🦷
        </p>
      </div>

      {/* Balance Pill */}
      <div className="glass-panel p-3 rounded-2xl border border-amber-500/30 flex items-center justify-between shadow-lg">
        <div className="flex items-center gap-2">
          <span className="text-2xl">🦷</span>
          <div>
            <span className="block text-[10px] text-amber-400 font-semibold uppercase">Dientes de Ajo</span>
            <span className="text-xl font-black text-white">{inventory.garlicTeeth.toLocaleString()}</span>
          </div>
        </div>
        <div className="text-right">
          <span className="text-[10px] text-gray-400 block">Etapa actual</span>
          <span className="text-xs font-bold text-amber-300">{currentStage.name}</span>
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
          Skins
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
          Ataques
        </button>
      </div>

      {/* === SKINS TAB === */}
      {activeTab === 'skins' && (
        <div className="grid grid-cols-1 gap-3">
          {SKINS_CATALOG.map((skin) => {
            const isUnlocked = inventory.unlockedSkins.includes(skin.id);
            const isEquipped = inventory.equippedSkin === skin.id;
            const canAfford = inventory.garlicTeeth >= skin.priceGarlicTeeth;

            return (
              <div
                key={skin.id}
                className={`glass-panel p-3.5 rounded-2xl border transition-all relative overflow-hidden flex items-center justify-between ${
                  isEquipped
                    ? 'border-emerald-400/60 bg-emerald-950/20 shadow-[0_0_15px_rgba(16,185,129,0.2)]'
                    : isUnlocked
                    ? 'border-purple-500/30 bg-purple-950/10'
                    : 'border-white/10'
                }`}
              >
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-2xl bg-black/40 border border-white/10 flex items-center justify-center text-2xl relative shrink-0">
                    <span>{skin.icon}</span>
                    {skin.headgearEmoji && (
                      <span className="absolute -top-2 -right-1 text-sm">{skin.headgearEmoji}</span>
                    )}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h4 className="font-extrabold text-sm text-white">{skin.name}</h4>
                      <span className="text-[9px] px-1.5 py-0.5 rounded bg-white/10 text-gray-300 font-semibold">
                        {skin.tag}
                      </span>
                    </div>
                    <p className="text-[11px] text-gray-400 leading-tight mt-0.5">{skin.description}</p>
                  </div>
                </div>

                <div className="shrink-0 ml-2">
                  {isEquipped ? (
                    <span className="px-3 py-1.5 rounded-xl bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 text-xs font-bold flex items-center gap-1">
                      <Check className="w-3.5 h-3.5" /> Equipado
                    </span>
                  ) : isUnlocked ? (
                    <button
                      onClick={() => handleSkinAction(skin.id, true, false)}
                      className="px-3.5 py-1.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white text-xs font-bold shadow-md active:scale-95 transition-all"
                    >
                      Equipar
                    </button>
                  ) : (
                    <button
                      onClick={() => handleSkinAction(skin.id, false, false)}
                      disabled={!canAfford}
                      className={`px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1 transition-all ${
                        canAfford
                          ? 'bg-gradient-to-r from-amber-400 to-yellow-500 text-black shadow-md hover:scale-105 active:scale-95'
                          : 'bg-gray-800 text-gray-500 cursor-not-allowed border border-white/5'
                      }`}
                    >
                      {!canAfford && <Lock className="w-3 h-3" />}
                      <span>🦷 {skin.priceGarlicTeeth}</span>
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
                {/* Attack Card Header */}
                <div className="p-3.5 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    {/* Style Icon - big emoji in colored circle */}
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
                      <div className="flex items-center gap-1.5">
                        <h4 className="font-extrabold text-sm" style={{ color: isEquipped ? style.color : 'white' }}>
                          {style.name}
                        </h4>
                      </div>
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
                          canAfford
                            ? 'hover:scale-105 active:scale-95'
                            : 'opacity-40 cursor-not-allowed'
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
                  <div className="text-center py-1.5 px-1" style={{ backgroundColor: `${style.color}0d` }}>
                    <Star className="w-3 h-3 mx-auto mb-0.5" style={{ color: style.color }} />
                    <div style={{ color: style.color }}>{style.criticalMultiplier}x</div>
                    <div className="text-gray-500 text-[8px]">CRIT</div>
                  </div>
                  <div className="text-center py-1.5 px-1" style={{ backgroundColor: `${style.color}0d` }}>
                    <Zap className="w-3 h-3 mx-auto mb-0.5" style={{ color: style.color }} />
                    <div style={{ color: style.color }}>{Math.round(style.criticalChance * 100)}%</div>
                    <div className="text-gray-500 text-[8px]">CHANCE</div>
                  </div>
                  <div className="text-center py-1.5 px-1" style={{ backgroundColor: `${style.color}0d` }}>
                    <Shield className="w-3 h-3 mx-auto mb-0.5" style={{ color: style.color }} />
                    <div style={{ color: style.color }}>{style.chargeMultiplier}x</div>
                    <div className="text-gray-500 text-[8px]">CARGA</div>
                  </div>
                  <div className="text-center py-1.5 px-1" style={{ backgroundColor: `${style.color}0d` }}>
                    <Sparkles className="w-3 h-3 mx-auto mb-0.5" style={{ color: style.color }} />
                    <div style={{ color: style.color }}>{style.comboMultiplier}x</div>
                    <div className="text-gray-500 text-[8px]">COMBO</div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
