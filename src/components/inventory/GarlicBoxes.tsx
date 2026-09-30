import React from 'react';
import { useGame } from '../../context/GameContext';
import { GarlicBoxItem } from '../../types';
import { DEFAULT_GAME_CONFIG } from '../../config/gameConfig';
import { Package, Plus, CheckCircle, Sparkles } from 'lucide-react';

interface GarlicBoxesProps {
  onSelectClaimBox: (box: GarlicBoxItem) => void;
}

export const GarlicBoxes: React.FC<GarlicBoxesProps> = ({ onSelectClaimBox }) => {
  const { boxes, buyBox, inventory, buyEnergyRefill } = useGame();

  const boxCatalog: { type: 'BASIC' | 'FARM' | 'MEGA'; label: string; price: number; capacity: number; icon: string }[] = [
    { type: 'BASIC', label: 'BASIC BOX', price: DEFAULT_GAME_CONFIG.boxPrices.BASIC, capacity: DEFAULT_GAME_CONFIG.boxCapacities.BASIC, icon: '📦' },
    { type: 'FARM', label: 'FARM BOX', price: DEFAULT_GAME_CONFIG.boxPrices.FARM, capacity: DEFAULT_GAME_CONFIG.boxCapacities.FARM, icon: '🪵' },
    { type: 'MEGA', label: 'MEGA BOX', price: DEFAULT_GAME_CONFIG.boxPrices.MEGA, capacity: DEFAULT_GAME_CONFIG.boxCapacities.MEGA, icon: '💼' },
  ];

  return (
    <div className="space-y-4">
      {/* Active Boxes List */}
      <div>
        <h3 className="text-sm font-bold text-gray-300 uppercase tracking-wider mb-2 flex items-center justify-between">
          <span className="flex items-center gap-1.5 text-white">
            <Package className="w-4 h-4 text-amber-400" /> MY GARLIC BOXES ({boxes.length})
          </span>
          <span className="text-xs text-amber-400 font-normal">1 Full Box = 1 AJO</span>
        </h3>

        <div className="space-y-3">
          {boxes.map((box, index) => {
            const fillPct = Math.min(100, Math.floor((box.currentCount / box.capacity) * 100));

            return (
              <div
                key={box.id}
                className={`glass-panel p-4 rounded-2xl border transition-all ${
                  box.isFull && !box.claimedAjo
                    ? 'border-emerald-500/50 bg-emerald-950/20 shadow-lg shadow-emerald-500/10'
                    : 'border-amber-700/30'
                }`}
              >
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <span className="text-3xl">
                      {box.isFull ? '📦✨' : '🪵'}
                    </span>
                    <div>
                      <h4 className="font-extrabold text-sm text-white flex items-center gap-1.5">
                        <span>{box.boxType} BOX #{index + 1}</span>
                        {box.isFull && (
                          <span className="text-[9px] bg-emerald-500/20 text-emerald-400 px-2 py-0.5 rounded-full border border-emerald-500/40 font-bold uppercase">
                            BOX FULL
                          </span>
                        )}
                      </h4>
                      <p className="text-[11px] text-gray-400">Capacity: {box.capacity} Garlic</p>
                    </div>
                  </div>

                  {/* Claim Button if Full */}
                  {box.isFull && !box.claimedAjo ? (
                    <button
                      onClick={() => onSelectClaimBox(box)}
                      className="px-3.5 py-1.5 rounded-xl bg-gradient-to-r from-sprout-500 to-emerald-600 text-white font-black text-xs shadow-md hover:scale-105 active:scale-95 transition-all flex items-center gap-1 animate-pulse"
                    >
                      <Sparkles className="w-3.5 h-3.5" />
                      CLAIM AJO
                    </button>
                  ) : box.claimedAjo ? (
                    <span className="text-xs text-gray-400 flex items-center gap-1 bg-white/5 px-2.5 py-1 rounded-lg">
                      <CheckCircle className="w-3.5 h-3.5 text-emerald-400" /> Claimed
                    </span>
                  ) : (
                    <span className="text-xs font-bold text-amber-300">
                      {box.currentCount} / {box.capacity}
                    </span>
                  )}
                </div>

                {/* Wood Box Filling Progress Bar */}
                <div className="w-full h-3 bg-black/50 rounded-full overflow-hidden p-0.5 border border-white/10">
                  <div
                    className={`h-full rounded-full transition-all duration-300 ${
                      box.isFull
                        ? 'bg-gradient-to-r from-emerald-500 to-sprout-400 shadow-[0_0_10px_rgba(16,185,129,0.6)]'
                        : 'bg-gradient-to-r from-amber-700 via-amber-500 to-yellow-400'
                    }`}
                    style={{ width: `${fillPct}%` }}
                  />
                </div>

                <div className="flex justify-between items-center text-[10px] text-gray-400 mt-1.5 font-medium">
                  <span>Filling status</span>
                  <span>{fillPct}% Complete</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Energy Refill Station */}
      <div className="pt-3 border-t border-amber-500/20">
        <h3 className="text-xs font-black text-amber-400 uppercase tracking-wider mb-2.5 flex items-center justify-between">
          <span className="flex items-center gap-1.5">
            <span className="text-base">⚡</span> ESTACIÓN DE RECARGA DE ENERGÍA
          </span>
          <span className="text-[10px] text-gray-400 font-normal">Usa Ajos Crudos o GC</span>
        </h3>

        <div className="grid grid-cols-2 gap-2.5">
          {/* Option 1: 100% Energy Refill */}
          <div className="glass-card p-3 rounded-2xl border border-amber-500/30 bg-gradient-to-b from-amber-500/10 to-transparent flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-1">
                <span className="text-2xl">⚡</span>
                <span className="text-[9px] bg-amber-500/20 text-amber-300 font-bold px-2 py-0.5 rounded-full border border-amber-500/30">100% REFILL</span>
              </div>
              <h5 className="font-extrabold text-xs text-white">Recarga Instantánea</h5>
              <p className="text-[10px] text-gray-400 mt-0.5">Restaura toda tu energía al máximo inmediatamente.</p>
            </div>
            <div className="mt-3 space-y-1.5">
              <button
                onClick={() => buyEnergyRefill('REFILL_100')}
                className="w-full py-1.5 px-2 rounded-xl text-[10px] font-black bg-gradient-to-r from-emerald-600 to-sprout-500 text-white shadow-md hover:brightness-110 active:scale-95 transition-all flex items-center justify-center gap-1"
              >
                <span>5 Ajos Crudos 🧄</span>
              </button>
              <button
                onClick={() => buyEnergyRefill('REFILL_100')}
                className="w-full py-1 px-2 rounded-xl text-[9px] font-bold bg-amber-500/20 text-amber-300 border border-amber-500/30 hover:bg-amber-500/30 transition-all flex items-center justify-center gap-1"
              >
                <span>o 100 GC 🪙</span>
              </button>
            </div>
          </div>

          {/* Option 2: +500 Max Energy Boost */}
          <div className="glass-card p-3 rounded-2xl border border-emerald-500/30 bg-gradient-to-b from-emerald-500/10 to-transparent flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-1">
                <span className="text-2xl">🔋</span>
                <span className="text-[9px] bg-emerald-500/20 text-emerald-300 font-bold px-2 py-0.5 rounded-full border border-emerald-500/30">+500 MAX</span>
              </div>
              <h5 className="font-extrabold text-xs text-white">Tanque Expandido</h5>
              <p className="text-[10px] text-gray-400 mt-0.5">Aumenta tu capacidad máxima de energía de forma permanente.</p>
            </div>
            <div className="mt-3 space-y-1.5">
              <button
                onClick={() => buyEnergyRefill('BOOST_500')}
                className="w-full py-1.5 px-2 rounded-xl text-[10px] font-black bg-gradient-to-r from-amber-600 to-yellow-500 text-white shadow-md hover:brightness-110 active:scale-95 transition-all flex items-center justify-center gap-1"
              >
                <span>20 Ajos Crudos 🧄</span>
              </button>
              <button
                onClick={() => buyEnergyRefill('BOOST_500')}
                className="w-full py-1 px-2 rounded-xl text-[9px] font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 hover:bg-emerald-500/30 transition-all flex items-center justify-center gap-1"
              >
                <span>o 500 GC 🪙</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Buy Boxes Shop */}
      <div className="pt-2">
        <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2.5">
          COMPRAR CAJAS DE AJO
        </h3>

        <div className="grid grid-cols-3 gap-2">
          {boxCatalog.map((cat) => {
            const canAfford = inventory.gcBalance >= cat.price;

            return (
              <div
                key={cat.type}
                className="glass-card p-3 rounded-2xl border border-amber-700/30 text-center flex flex-col justify-between"
              >
                <div>
                  <span className="text-2xl block mb-1">{cat.icon}</span>
                  <h5 className="font-extrabold text-[11px] text-white truncate">{cat.label}</h5>
                  <p className="text-[9px] text-gray-400 mt-0.5">{cat.capacity} Capacity</p>
                </div>

                <button
                  disabled={!canAfford}
                  onClick={() => buyBox(cat.type)}
                  className={`mt-2 py-1.5 px-1 rounded-xl text-[10px] font-bold transition-all flex items-center justify-center gap-1 ${
                    canAfford
                      ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40 hover:bg-amber-500/30'
                      : 'bg-white/5 text-gray-500 border border-white/5 cursor-not-allowed'
                  }`}
                >
                  <span>{cat.price.toLocaleString()} GC</span>
                </button>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
