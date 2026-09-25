import React, { useState } from 'react';
import { useGame } from '../../context/GameContext';
import { LeaderboardEntry } from '../../types';
import { Trophy, Medal, Crown, ShieldAlert } from 'lucide-react';

export const Leaderboard: React.FC = () => {
  const { user } = useGame();
  const [filter, setFilter] = useState<'global' | 'weekly' | 'daily'>('global');

  // Sample Leaderboard Data
  const leaderboardData: LeaderboardEntry[] = [
    { rank: 1, userId: 'u1', username: 'PlayerOne', firstName: 'Player', photoUrl: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100', totalGarlic: 8400, totalBoxes: 84, totalAjo: 84.0 },
    { rank: 2, userId: 'u2', username: 'GarlicKing', firstName: 'Garlic', photoUrl: 'https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?w=100', totalGarlic: 7100, totalBoxes: 71, totalAjo: 71.0 },
    { rank: 3, userId: 'u3', username: 'AJOFarmer', firstName: 'AJO', photoUrl: 'https://images.unsplash.com/photo-1527980965255-d3b416303d12?w=100', totalGarlic: 6500, totalBoxes: 65, totalAjo: 65.0 },
    { rank: 4, userId: 'u4', username: 'CryptoBulb', firstName: 'Crypto', totalGarlic: 5200, totalBoxes: 52, totalAjo: 52.0 },
    { rank: 5, userId: 'u5', username: 'VampireSlayer', firstName: 'Vampire', totalGarlic: 4800, totalBoxes: 48, totalAjo: 48.0 },
    { rank: 6, userId: 'u6', username: 'GreenThumb', firstName: 'Green', totalGarlic: 4100, totalBoxes: 41, totalAjo: 41.0 },
    { rank: 7, userId: 'u7', username: 'FarmMaster', firstName: 'Farm', totalGarlic: 3900, totalBoxes: 39, totalAjo: 39.0 },
  ];

  return (
    <div className="space-y-4 p-4 max-w-md mx-auto min-h-[calc(100vh-140px)] pb-20">
      {/* Title */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-extrabold text-white flex items-center gap-2">
            <span>🏆</span> GARLIC LEADERBOARD
          </h2>
          <p className="text-xs text-gray-400">Top garlic farmers ranked by completed boxes & AJO tokens</p>
        </div>
      </div>

      {/* Category Tabs */}
      <div className="flex bg-black/40 p-1 rounded-2xl border border-white/10 text-xs font-bold">
        {(['global', 'weekly', 'daily'] as const).map((tab) => (
          <button
            key={tab}
            onClick={() => setFilter(tab)}
            className={`flex-1 py-2 rounded-xl uppercase transition-all ${
              filter === tab
                ? 'bg-gradient-to-r from-sprout-500 to-emerald-600 text-white shadow-md'
                : 'text-gray-400 hover:text-white'
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* Top 3 Podium */}
      <div className="grid grid-cols-3 gap-2 pt-2 items-end">
        {/* Rank 2 (Silver) */}
        <div className="glass-panel p-3 rounded-2xl border border-slate-400/40 text-center space-y-1 transform hover:scale-105 transition-all">
          <div className="relative inline-block">
            <img
              src={leaderboardData[1].photoUrl}
              alt={leaderboardData[1].username}
              className="w-12 h-12 rounded-full border-2 border-slate-300 mx-auto object-cover"
            />
            <span className="absolute -bottom-1 -right-1 bg-slate-400 text-black text-[10px] font-black w-5 h-5 rounded-full flex items-center justify-center">
              2
            </span>
          </div>
          <h4 className="font-extrabold text-xs text-white truncate">{leaderboardData[1].username}</h4>
          <p className="text-[10px] text-slate-300 font-mono font-bold">{leaderboardData[1].totalBoxes} Boxes</p>
        </div>

        {/* Rank 1 (Gold) */}
        <div className="glass-card-gold p-3 rounded-2xl border border-yellow-400/60 text-center space-y-1 -translate-y-2 transform hover:scale-105 transition-all">
          <Crown className="w-5 h-5 text-yellow-400 mx-auto animate-bounce" />
          <div className="relative inline-block">
            <img
              src={leaderboardData[0].photoUrl}
              alt={leaderboardData[0].username}
              className="w-14 h-14 rounded-full border-2 border-yellow-400 mx-auto object-cover"
            />
            <span className="absolute -bottom-1 -right-1 bg-yellow-400 text-black text-[10px] font-black w-5 h-5 rounded-full flex items-center justify-center">
              1
            </span>
          </div>
          <h4 className="font-extrabold text-xs text-white truncate">{leaderboardData[0].username}</h4>
          <p className="text-[10px] text-amber-300 font-mono font-bold">{leaderboardData[0].totalBoxes} Boxes</p>
        </div>

        {/* Rank 3 (Bronze) */}
        <div className="glass-panel p-3 rounded-2xl border border-amber-700/40 text-center space-y-1 transform hover:scale-105 transition-all">
          <div className="relative inline-block">
            <img
              src={leaderboardData[2].photoUrl}
              alt={leaderboardData[2].username}
              className="w-12 h-12 rounded-full border-2 border-amber-600 mx-auto object-cover"
            />
            <span className="absolute -bottom-1 -right-1 bg-amber-700 text-white text-[10px] font-black w-5 h-5 rounded-full flex items-center justify-center">
              3
            </span>
          </div>
          <h4 className="font-extrabold text-xs text-white truncate">{leaderboardData[2].username}</h4>
          <p className="text-[10px] text-amber-500 font-mono font-bold">{leaderboardData[2].totalBoxes} Boxes</p>
        </div>
      </div>

      {/* Leaderboard List Table */}
      <div className="glass-panel rounded-3xl border border-purple-500/30 overflow-hidden">
        <div className="p-3 border-b border-white/10 flex justify-between items-center text-[10px] font-extrabold text-gray-400 uppercase tracking-wider">
          <span>RANK & PLAYER</span>
          <span>BOXES / AJO</span>
        </div>

        <div className="divide-y divide-white/5">
          {leaderboardData.map((item) => (
            <div
              key={item.userId}
              className="p-3 flex items-center justify-between hover:bg-white/5 transition-colors"
            >
              <div className="flex items-center gap-3">
                <span className="font-mono font-bold text-xs text-gray-400 w-6 text-center">
                  #{item.rank}
                </span>
                <img
                  src={item.photoUrl || 'https://images.unsplash.com/photo-1615485290382-441e4d049cb5?w=100'}
                  alt={item.username}
                  className="w-8 h-8 rounded-full border border-purple-500/30 object-cover"
                />
                <span className="font-bold text-xs text-white truncate max-w-[120px]">
                  {item.username}
                </span>
              </div>

              <div className="text-right">
                <span className="text-xs font-mono font-bold text-amber-300 block">
                  📦 {item.totalBoxes} Boxes
                </span>
                <span className="text-[10px] text-emerald-400 font-semibold">
                  💰 {item.totalAjo.toFixed(1)} AJO
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>

      <p className="text-[10px] text-gray-400 text-center flex items-center justify-center gap-1">
        <ShieldAlert className="w-3.5 h-3.5 text-purple-400" /> Protected by backend anti-bot and tap frequency verification.
      </p>
    </div>
  );
};
