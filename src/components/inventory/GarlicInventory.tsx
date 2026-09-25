import React, { useState } from 'react';
import { useGame } from '../../context/GameContext';
import { GarlicBoxes } from './GarlicBoxes';
import { ClaimAjoModal } from './ClaimAjoModal';
import { GarlicBoxItem } from '../../types';
import { DEFAULT_GAME_CONFIG } from '../../config/gameConfig';
import { Coins, ArrowRightLeft, Sparkles } from 'lucide-react';

export const GarlicInventory: React.FC = () => {
  const { inventory, sellGarlic } = useGame();
  const [selectedBox, setSelectedBox] = useState<GarlicBoxItem | null>(null);
  const [sellAmount, setSellAmount] = useState<number>(10);

  const gcPricePerGarlic = DEFAULT_GAME_CONFIG.garlicSellPrice;
  const estimatedGc = sellAmount * gcPricePerGarlic;

  const handleSell = () => {
    if (sellAmount > 0 && sellAmount <= inventory.rawGarlic) {
      sellGarlic(sellAmount);
    }
  };

  const handleSellAll = () => {
    if (inventory.rawGarlic > 0) {
      sellGarlic(inventory.rawGarlic);
    }
  };

  return (
    <div className="space-y-5 p-4 max-w-md mx-auto min-h-[calc(100vh-140px)] pb-20">
      {/* Title Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-extrabold text-white flex items-center gap-2">
            <span>📦</span> MY GARLIC INVENTORY
          </h2>
          <p className="text-xs text-gray-400">Manage raw garlic, sell for GC coins & fill boxes</p>
        </div>
      </div>

      {/* Raw Garlic & Sell Card */}
      <div className="glass-panel p-4 rounded-3xl border border-sprout-500/30 space-y-3 shadow-xl">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-garlic-100/10 border border-garlic-200/30 flex items-center justify-center text-3xl shadow-sm">
              🧄
            </div>
            <div>
              <span className="text-xs text-gray-400 uppercase font-semibold block">Raw Garlic Harvested</span>
              <span className="text-2xl font-black text-white">{inventory.rawGarlic.toLocaleString()} 🧄</span>
            </div>
          </div>

          <button
            onClick={handleSellAll}
            disabled={inventory.rawGarlic <= 0}
            className="px-3 py-1.5 rounded-xl bg-amber-500/20 text-amber-300 border border-amber-500/40 text-xs font-bold hover:bg-amber-500/30 disabled:opacity-40 transition-all"
          >
            SELL ALL
          </button>
        </div>

        {/* Sell Converter Control */}
        {inventory.rawGarlic > 0 && (
          <div className="pt-2 border-t border-white/10 space-y-2">
            <div className="flex justify-between items-center text-xs">
              <span className="text-gray-300 font-semibold">Sell Garlic for GC Coins</span>
              <span className="text-amber-400 font-bold">1 Garlic = {gcPricePerGarlic} GC</span>
            </div>

            <div className="flex items-center gap-2">
              <input
                type="range"
                min="1"
                max={inventory.rawGarlic || 1}
                value={sellAmount}
                onChange={(e) => setSellAmount(Number(e.target.value))}
                className="w-full accent-sprout-500"
              />
              <span className="text-xs font-mono font-bold text-white w-12 text-right">{sellAmount}</span>
            </div>

            <button
              onClick={handleSell}
              className="w-full py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-white font-extrabold text-xs shadow-md transition-all flex items-center justify-center gap-2"
            >
              <Coins className="w-4 h-4" />
              <span>SELL {sellAmount} GARLIC FOR +{estimatedGc.toLocaleString()} GC</span>
            </button>
          </div>
        )}
      </div>

      {/* Garlic Boxes Inventory & Shop */}
      <GarlicBoxes onSelectClaimBox={(box) => setSelectedBox(box)} />

      {/* Claim Modal */}
      {selectedBox && (
        <ClaimAjoModal box={selectedBox} onClose={() => setSelectedBox(null)} />
      )}
    </div>
  );
};
