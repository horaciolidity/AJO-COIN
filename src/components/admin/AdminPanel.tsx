import React, { useState } from 'react';
import { useGame } from '../../context/GameContext';
import { DEFAULT_GAME_CONFIG } from '../../config/gameConfig';
import { ShieldCheck, Save, Users, Settings, AlertOctagon, Activity, Lock } from 'lucide-react';

export const AdminPanel: React.FC = () => {
  const { user, showToast } = useGame();
  const [config, setConfig] = useState({
    tapsPerGarlic: DEFAULT_GAME_CONFIG.tapsPerGarlic,
    garlicSellPrice: DEFAULT_GAME_CONFIG.garlicSellPrice,
    energyMax: DEFAULT_GAME_CONFIG.energyMax,
    basicBoxPrice: DEFAULT_GAME_CONFIG.boxPrices.BASIC,
    farmBoxPrice: DEFAULT_GAME_CONFIG.boxPrices.FARM,
    megaBoxPrice: DEFAULT_GAME_CONFIG.boxPrices.MEGA,
  });

  const [banUserId, setBanUserId] = useState('');
  const [banReason, setBanReason] = useState('');

  if (!user.isAdmin) {
    return (
      <div className="p-8 text-center space-y-3">
        <Lock className="w-12 h-12 text-red-500 mx-auto" />
        <h2 className="text-xl font-bold text-white">Access Denied</h2>
        <p className="text-xs text-gray-400">Admin privileges required to access this panel.</p>
      </div>
    );
  }

  const handleSaveConfig = () => {
    showToast('Admin Config Saved!', 'Game economic parameters updated successfully.', 'success');
  };

  const handleBanUser = () => {
    if (!banUserId) return;
    showToast('User Suspended', `User ${banUserId} has been banned. Reason: ${banReason || 'Rule violation'}`, 'warning');
    setBanUserId('');
    setBanReason('');
  };

  return (
    <div className="space-y-4 p-4 max-w-md mx-auto min-h-[calc(100vh-140px)] pb-20">
      {/* Title */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-extrabold text-white flex items-center gap-2">
            <ShieldCheck className="w-6 h-6 text-purple-400" /> ADMIN CONTROL PANEL
          </h2>
          <p className="text-xs text-gray-400">Configure game economics, user bans & anti-cheat settings</p>
        </div>
      </div>

      {/* Analytics Overview Cards */}
      <div className="grid grid-cols-2 gap-2">
        <div className="glass-panel p-3 rounded-2xl border border-purple-500/30 text-center">
          <span className="text-[10px] text-gray-400 block uppercase">Total Registered DAU</span>
          <span className="text-lg font-black text-white">12,450 Users</span>
        </div>
        <div className="glass-panel p-3 rounded-2xl border border-purple-500/30 text-center">
          <span className="text-[10px] text-gray-400 block uppercase">Anti-Cheat Flags</span>
          <span className="text-lg font-black text-amber-400">3 Flags</span>
        </div>
      </div>

      {/* Economic Parameters Form */}
      <div className="glass-panel p-4 rounded-3xl border border-purple-500/30 space-y-3">
        <h3 className="font-extrabold text-sm text-white flex items-center gap-2">
          <Settings className="w-4 h-4 text-purple-400" /> GAME ECONOMY CONFIGURATION
        </h3>

        <div className="space-y-2 text-xs">
          <div>
            <label className="text-gray-300 font-semibold block mb-1">Taps Per Garlic Unit</label>
            <input
              type="number"
              value={config.tapsPerGarlic}
              onChange={(e) => setConfig({ ...config, tapsPerGarlic: Number(e.target.value) })}
              className="w-full bg-black/40 border border-white/10 rounded-xl p-2 text-white font-mono"
            />
          </div>

          <div>
            <label className="text-gray-300 font-semibold block mb-1">Garlic Sell Price (GC Coins)</label>
            <input
              type="number"
              value={config.garlicSellPrice}
              onChange={(e) => setConfig({ ...config, garlicSellPrice: Number(e.target.value) })}
              className="w-full bg-black/40 border border-white/10 rounded-xl p-2 text-white font-mono"
            />
          </div>

          <div className="grid grid-cols-3 gap-2">
            <div>
              <label className="text-[10px] text-gray-400 block mb-1">Basic Box (GC)</label>
              <input
                type="number"
                value={config.basicBoxPrice}
                onChange={(e) => setConfig({ ...config, basicBoxPrice: Number(e.target.value) })}
                className="w-full bg-black/40 border border-white/10 rounded-xl p-2 text-white font-mono text-xs"
              />
            </div>
            <div>
              <label className="text-[10px] text-gray-400 block mb-1">Farm Box (GC)</label>
              <input
                type="number"
                value={config.farmBoxPrice}
                onChange={(e) => setConfig({ ...config, farmBoxPrice: Number(e.target.value) })}
                className="w-full bg-black/40 border border-white/10 rounded-xl p-2 text-white font-mono text-xs"
              />
            </div>
            <div>
              <label className="text-[10px] text-gray-400 block mb-1">Mega Box (GC)</label>
              <input
                type="number"
                value={config.megaBoxPrice}
                onChange={(e) => setConfig({ ...config, megaBoxPrice: Number(e.target.value) })}
                className="w-full bg-black/40 border border-white/10 rounded-xl p-2 text-white font-mono text-xs"
              />
            </div>
          </div>

          <button
            onClick={handleSaveConfig}
            className="w-full py-2.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs shadow-md transition-all flex items-center justify-center gap-1.5 mt-2"
          >
            <Save className="w-4 h-4" /> SAVE CONFIG PARAMETERS
          </button>
        </div>
      </div>

      {/* User Ban / Anti-Cheat Action */}
      <div className="glass-panel p-4 rounded-3xl border border-red-500/30 space-y-3">
        <h3 className="font-extrabold text-sm text-red-400 flex items-center gap-2">
          <AlertOctagon className="w-4 h-4 text-red-400" /> USER SUSPENSION & ANTI-CHEAT
        </h3>

        <div className="space-y-2 text-xs">
          <input
            type="text"
            placeholder="User ID or Telegram ID"
            value={banUserId}
            onChange={(e) => setBanUserId(e.target.value)}
            className="w-full bg-black/40 border border-white/10 rounded-xl p-2 text-white"
          />
          <input
            type="text"
            placeholder="Reason for suspension"
            value={banReason}
            onChange={(e) => setBanReason(e.target.value)}
            className="w-full bg-black/40 border border-white/10 rounded-xl p-2 text-white"
          />

          <button
            onClick={handleBanUser}
            className="w-full py-2.5 rounded-xl bg-red-600/80 hover:bg-red-600 text-white font-bold text-xs shadow-md transition-all"
          >
            BAN / SUSPEND USER
          </button>
        </div>
      </div>
    </div>
  );
};
