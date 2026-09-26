import React, { useState } from 'react';
import { useGame } from '../../context/GameContext';
import { LeaderboardEntry } from '../../types';
import { Trophy, Crown, ShieldAlert, Star, Zap, Medal, TrendingUp } from 'lucide-react';

// Mock leaderboard data enriched with more fields
interface EnrichedLeaderboardEntry extends LeaderboardEntry {
  stageIcon: string;
  stageName: string;
  xp: number;
  streak: number;
}

const MOCK_LEADERS: EnrichedLeaderboardEntry[] = [
  { rank: 1, userId: 'u1', username: 'PlayerOne', firstName: 'Player', photoUrl: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100&auto=format&fit=crop', totalGarlic: 8400, totalBoxes: 84, totalAjo: 84.0, stageIcon: '👑💎🔥', stageName: 'Diamante Supremo', xp: 310000, streak: 12 },
  { rank: 2, userId: 'u2', username: 'GarlicKing', firstName: 'Garlic', photoUrl: 'https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?w=100&auto=format&fit=crop', totalGarlic: 7100, totalBoxes: 71, totalAjo: 71.0, stageIcon: '💎✨', stageName: 'Diamante Pequeño', xp: 155000, streak: 8 },
  { rank: 3, userId: 'u3', username: 'AJOFarmer', firstName: 'AJO', photoUrl: 'https://images.unsplash.com/photo-1527980965255-d3b416303d12?w=100&auto=format&fit=crop', totalGarlic: 6500, totalBoxes: 65, totalAjo: 65.0, stageIcon: '💎⚡', stageName: 'Platino Grande', xp: 78000, streak: 5 },
  { rank: 4, userId: 'u4', username: 'CryptoBulb', firstName: 'Crypto', photoUrl: 'https://images.unsplash.com/photo-1599566150163-29194dcaad36?w=100&auto=format&fit=crop', totalGarlic: 5200, totalBoxes: 52, totalAjo: 52.0, stageIcon: '💎', stageName: 'Platino Pequeño', xp: 43000, streak: 3 },
  { rank: 5, userId: 'u5', username: 'VampireSlayer', firstName: 'Vampire', photoUrl: 'https://images.unsplash.com/photo-1607746882042-944635dfe10e?w=100&auto=format&fit=crop', totalGarlic: 4800, totalBoxes: 48, totalAjo: 48.0, stageIcon: '🥇👑', stageName: 'Oro Grande', xp: 22000, streak: 7 },
  { rank: 6, userId: 'u6', username: 'GreenThumb', firstName: 'Green', photoUrl: 'https://images.unsplash.com/photo-1544725176-7c40e5a71c5e?w=100&auto=format&fit=crop', totalGarlic: 4100, totalBoxes: 41, totalAjo: 41.0, stageIcon: '🥇', stageName: 'Oro Pequeño', xp: 11500, streak: 2 },
  { rank: 7, userId: 'u7', username: 'FarmMaster', firstName: 'Farm', photoUrl: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=100&auto=format&fit=crop', totalGarlic: 3900, totalBoxes: 39, totalAjo: 39.0, stageIcon: '🥈✨', stageName: 'Plata Grande', xp: 6200, streak: 1 },
];

type LeaderboardFilter = 'global' | 'weekly' | 'xp';

function formatXP(xp: number): string {
  if (xp >= 1000000) return `${(xp / 1000000).toFixed(1)}M`;
  if (xp >= 1000) return `${(xp / 1000).toFixed(1)}K`;
  return String(xp);
}

export const Leaderboard: React.FC = () => {
  const { user, stats, inventory, currentStage } = useGame();
  const [filter, setFilter] = useState<LeaderboardFilter>('global');

  const sorted = [...MOCK_LEADERS].sort((a, b) => {
    if (filter === 'xp') return b.xp - a.xp;
    if (filter === 'weekly') return b.totalBoxes - a.totalBoxes;
    return a.rank - b.rank;
  });

  const top3 = sorted.slice(0, 3);
  const rest = sorted.slice(3);

  const podiumOrder = [top3[1], top3[0], top3[2]]; // Silver, Gold, Bronze display order

  const podiumStyles = [
    { border: 'border-slate-400/50', bg: 'bg-slate-400', imgBorder: 'border-slate-300', height: 'h-16', label: '🥈', textColor: 'text-slate-300' },
    { border: 'border-yellow-400/70', bg: 'bg-yellow-400', imgBorder: 'border-yellow-400', height: 'h-20', label: '🥇', textColor: 'text-amber-300' },
    { border: 'border-amber-700/50', bg: 'bg-amber-700', imgBorder: 'border-amber-600', height: 'h-12', label: '🥉', textColor: 'text-amber-500' },
  ];

  return (
    <div className="space-y-4 p-4 max-w-md mx-auto min-h-[calc(100vh-140px)] pb-20">

      {/* Title */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-extrabold text-white flex items-center gap-2">
            <Trophy className="w-5 h-5 text-amber-400" /> GARLIC LEADERBOARD
          </h2>
          <p className="text-xs text-gray-400 mt-0.5">Los mejores cultivadores de ajo del mundo</p>
        </div>
      </div>

      {/* My Player Card */}
      <div className="glass-panel rounded-2xl p-3 border border-purple-500/40 bg-purple-950/20">
        <div className="flex items-center gap-3">
          <div className="relative">
            <div className="w-12 h-12 rounded-full border-2 border-purple-400 bg-purple-900/60 flex items-center justify-center text-2xl font-black text-white overflow-hidden">
              {user.photoUrl ? (
                <img src={user.photoUrl} alt={user.username} className="w-full h-full object-cover" />
              ) : (
                '🧄'
              )}
            </div>
            <span className="absolute -bottom-1 -right-1 text-base">{currentStage.badgeIcon}</span>
          </div>
          <div className="flex-1 min-w-0">
            <p className="font-extrabold text-sm text-white truncate">@{user.username}</p>
            <p className="text-[10px] text-purple-300">{currentStage.name}</p>
          </div>
          <div className="text-right shrink-0">
            <div className="flex items-center justify-end gap-1 text-xs font-black text-amber-300">
              <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
              {formatXP(stats.xp)} XP
            </div>
            <div className="text-[10px] text-gray-400 font-medium">
              📦 {stats.totalBoxesCompleted} Boxes
            </div>
          </div>
        </div>
        <div className="mt-2 pt-2 border-t border-white/10 grid grid-cols-3 gap-2 text-center text-[10px]">
          <div>
            <span className="block text-gray-400">Total Taps</span>
            <span className="font-bold text-white">{stats.totalTaps.toLocaleString()}</span>
          </div>
          <div>
            <span className="block text-gray-400">Garlic Teeth</span>
            <span className="font-bold text-amber-300">{inventory.garlicTeeth} 🧄</span>
          </div>
          <div>
            <span className="block text-gray-400">AJO Earned</span>
            <span className="font-bold text-emerald-400">{stats.totalAjoEarned.toFixed(1)} AJO</span>
          </div>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex bg-black/40 p-1 rounded-2xl border border-white/10 text-xs font-bold">
        {([['global', '🌍 Global'], ['weekly', '📅 Semanal'], ['xp', '⭐ Por XP']] as const).map(([tab, label]) => (
          <button
            key={tab}
            onClick={() => setFilter(tab as LeaderboardFilter)}
            className={`flex-1 py-2 rounded-xl transition-all text-[11px] ${
              filter === tab
                ? 'bg-gradient-to-r from-sprout-500 to-emerald-600 text-white shadow-md'
                : 'text-gray-400 hover:text-white'
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      {/* Podium */}
      <div className="flex items-end justify-center gap-2 pt-2">
        {podiumOrder.map((player, idx) => {
          if (!player) return null;
          const style = podiumStyles[idx];
          const isFirst = idx === 1;

          return (
            <div key={player.userId} className="flex-1 flex flex-col items-center gap-1">
              {isFirst && <Crown className="w-5 h-5 text-yellow-400 animate-bounce" />}
              <div className="relative">
                <img
                  src={player.photoUrl || 'https://images.unsplash.com/photo-1615485290382-441e4d049cb5?w=100'}
                  alt={player.username}
                  className={`${isFirst ? 'w-16 h-16' : 'w-12 h-12'} rounded-full border-2 ${style.imgBorder} object-cover mx-auto`}
                  onError={(e) => { (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1615485290382-441e4d049cb5?w=100'; }}
                />
                <span className={`absolute -bottom-1 -right-1 ${style.bg} text-black text-[10px] font-black w-5 h-5 rounded-full flex items-center justify-center`}>
                  {player.rank}
                </span>
              </div>
              <p className="font-extrabold text-[11px] text-white text-center truncate w-full px-1">
                {player.username}
              </p>
              <p className={`text-[10px] font-bold ${style.textColor} text-center`}>
                {filter === 'xp' ? `${formatXP(player.xp)} XP` : `${player.totalBoxes} Boxes`}
              </p>
              {/* Podium stand */}
              <div className={`w-full ${style.height} rounded-t-lg border-t-2 border-x-2 ${style.border} bg-white/5 flex items-end justify-center pb-1`}>
                <span className="text-lg">{style.label}</span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Rest of the leaderboard */}
      <div className="glass-panel rounded-3xl border border-purple-500/30 overflow-hidden">
        <div className="p-3 border-b border-white/10 flex justify-between items-center text-[10px] font-extrabold text-gray-400 uppercase tracking-wider">
          <span>JUGADOR</span>
          <span>{filter === 'xp' ? 'XP' : 'BOXES / AJO'}</span>
        </div>

        <div className="divide-y divide-white/5">
          {rest.map((item) => (
            <div
              key={item.userId}
              className="p-3 flex items-center justify-between hover:bg-white/5 transition-colors"
            >
              <div className="flex items-center gap-3">
                <span className="font-mono font-bold text-xs text-gray-400 w-6 text-center">
                  #{item.rank}
                </span>
                <div className="relative">
                  <img
                    src={item.photoUrl || 'https://images.unsplash.com/photo-1615485290382-441e4d049cb5?w=100'}
                    alt={item.username}
                    className="w-8 h-8 rounded-full border border-purple-500/30 object-cover"
                    onError={(e) => { (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1615485290382-441e4d049cb5?w=100'; }}
                  />
                  <span className="absolute -bottom-0.5 -right-0.5 text-xs">{item.stageIcon.charAt(0)}</span>
                </div>
                <div>
                  <span className="font-bold text-xs text-white block truncate max-w-[100px]">
                    {item.username}
                  </span>
                  <span className="text-[9px] text-gray-500">{item.stageName}</span>
                </div>
              </div>

              <div className="text-right">
                {filter === 'xp' ? (
                  <span className="text-xs font-mono font-bold text-amber-300 flex items-center gap-1">
                    <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
                    {formatXP(item.xp)} XP
                  </span>
                ) : (
                  <>
                    <span className="text-xs font-mono font-bold text-amber-300 block">
                      📦 {item.totalBoxes}
                    </span>
                    <span className="text-[10px] text-emerald-400 font-semibold">
                      💰 {item.totalAjo.toFixed(1)} AJO
                    </span>
                  </>
                )}
                {item.streak > 1 && (
                  <span className="text-[9px] text-orange-400 flex items-center justify-end gap-0.5">
                    🔥 {item.streak}d streak
                  </span>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      <p className="text-[10px] text-gray-400 text-center flex items-center justify-center gap-1">
        <ShieldAlert className="w-3.5 h-3.5 text-purple-400" />
        Datos verificados por el sistema anti-bot de AJO COIN
      </p>
    </div>
  );
};
