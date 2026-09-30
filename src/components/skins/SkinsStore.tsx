import React from 'react';
import { useGame } from '../../context/GameContext';
import { SKINS_CATALOG } from '../../config/gameBalance';
import { SkinId } from '../../types';
import { Sparkles, Check, Lock, ShoppingBag, Palette } from 'lucide-react';

export const SkinsStore: React.FC = () => {
  const { inventory, purchaseSkin, equipSkin } = useGame();

  const handleAction = (skinId: SkinId, isUnlocked: boolean, isEquipped: boolean) => {
    if (isEquipped) return;
    if (isUnlocked) {
      equipSkin(skinId);
    } else {
      purchaseSkin(skinId);
    }
  };

  return (
    <div className="p-4 max-w-md mx-auto space-y-4 pb-20">
      {/* Header Banner */}
      <div className="text-center space-y-1">
        <h2 className="text-2xl font-black uppercase text-white tracking-tight flex items-center justify-center gap-2">
          <Palette className="w-6 h-6 text-purple-400" />
          <span>TIENDA DE SKINS</span>
          <Sparkles className="w-5 h-5 text-yellow-400" />
        </h2>
        <p className="text-xs text-gray-300 font-medium">
          Personaliza la apariencia de tu AJO con Garlic Teeth 🧄
        </p>
      </div>

      {/* Balance Pill */}
      <div className="glass-panel p-3 rounded-2xl border border-amber-500/30 flex items-center justify-between shadow-lg">
        <div className="flex items-center gap-2">
          <span className="text-2xl">🧄</span>
          <div>
            <span className="block text-[10px] text-amber-400 font-semibold uppercase">Tus Dientes de Ajo</span>
            <span className="text-lg font-black text-white">{inventory.garlicTeeth.toLocaleString()} Teeth</span>
          </div>
        </div>
        <span className="text-[10px] bg-amber-500/20 text-amber-300 border border-amber-500/30 px-2 py-1 rounded-full font-bold">
          Puramente Cosmético
        </span>
      </div>

      {/* Skins Catalog Grid */}
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
                  : 'border-white/10 opacity-90'
              }`}
            >
              {/* Left Info */}
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

              {/* Action Button */}
              <div className="shrink-0 ml-2">
                {isEquipped ? (
                  <span className="px-3 py-1.5 rounded-xl bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 text-xs font-bold flex items-center gap-1">
                    <Check className="w-3.5 h-3.5" /> Equipado
                  </span>
                ) : isUnlocked ? (
                  <button
                    onClick={() => handleAction(skin.id, true, false)}
                    className="px-3.5 py-1.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white text-xs font-bold shadow-md active:scale-95 transition-all"
                  >
                    Equipar
                  </button>
                ) : (
                  <button
                    onClick={() => handleAction(skin.id, false, false)}
                    disabled={!canAfford}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1 transition-all ${
                      canAfford
                        ? 'bg-gradient-to-r from-amber-400 to-yellow-500 text-black shadow-md hover:scale-105 active:scale-95'
                        : 'bg-gray-800 text-gray-500 cursor-not-allowed border border-white/5'
                    }`}
                  >
                    {!canAfford && <Lock className="w-3 h-3" />}
                    <span>🧄 {skin.priceGarlicTeeth}</span>
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
