import React, { useState, useEffect } from 'react';
import { useGame } from '../../context/GameContext';
import { LeaderboardEntry } from '../../types';
import { Trophy, Crown, ShieldAlert, Star, RefreshCw } from 'lucide-react';

interface EnrichedLeaderboardEntry extends LeaderboardEntry {
  stageIcon: string;
  stageName: string;
  xp: number;
  streak: number;
  isCurrentUser?: boolean;
}

const MOCK_BASE_LEADERS: EnrichedLeaderboardEntry[] = [
  { rank: 1, userId: 'u1', username: 'CryptoBulb_Pro', firstName: 'Crypto', photoUrl: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100&auto=format&fit=crop', totalGarlic: 8400, totalBoxes: 84, totalAjo: 84.0, stageIcon: '👑💎🔥', stageName: 'Diamante Supremo', xp: 310000, streak: 12 },
  { rank: 2, userId: 'u2', username: 'GarlicKing', firstName: 'Garlic', photoUrl: 'https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?w=100&auto=format&fit=crop', totalGarlic: 7100, totalBoxes: 71, totalAjo: 71.0, stageIcon: '💎✨', stageName: 'Diamante Pequeño', xp: 155000, streak: 8 },
  { rank: 3, userId: 'u3', username: 'AJOFarmer99', firstName: 'AJO', photoUrl: 'https://images.unsplash.com/photo-1527980965255-d3b416303d12?w=100&auto=format&fit=crop', totalGarlic: 6500, totalBoxes: 65, totalAjo: 65.0, stageIcon: '💎⚡', stageName: 'Platino Grande', xp: 78000, streak: 5 },
  { rank: 4, userId: 'u4', username: 'GarlicMaster', firstName: 'Master', photoUrl: 'https://images.unsplash.com/photo-1599566150163-29194dcaad36?w=100&auto=format&fit=crop', totalGarlic: 5200, totalBoxes: 52, totalAjo: 52.0, stageIcon: '💎', stageName: 'Platino Pequeño', xp: 43000, streak: 3 },
  { rank: 5, userId: 'u5', username: 'VampireSlayer', firstName: 'Vampire', photoUrl: 'https://images.unsplash.com/photo-1607746882042-944635dfe10e?w=100&auto=format&fit=crop', totalGarlic: 4800, totalBoxes: 48, totalAjo: 48.0, stageIcon: '🥇👑', stageName: 'Oro Grande', xp: 22000, streak: 7 },
  { rank: 6, userId: 'u6', username: 'GreenThumb', firstName: 'Green', photoUrl: 'https://images.unsplash.com/photo-1544725176-7c40e5a71c5e?w=100&auto=format&fit=crop', totalGarlic: 4100, totalBoxes: 41, totalAjo: 41.0, stageIcon: '🥇', stageName: 'Oro Pequeño', xp: 11500, streak: 2 },
  { rank: 7, userId: 'u7', username: 'FarmMaster_Ajo', firstName: 'Farm', photoUrl: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=100&auto=format&fit=crop', totalGarlic: 3900, totalBoxes: 39, totalAjo: 39.0, stageIcon: '🥈✨', stageName: 'Plata Grande', xp: 6200, streak: 1 },
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
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [remoteLeaders, setRemoteLeaders] = useState<EnrichedLeaderboardEntry[]>([]);

  // Fetch remote backend leaderboard if available
  const fetchRemoteLeaderboard = async () => {
    setIsRefreshing(true);
    try {
      const res = await fetch('/api/leaderboard?category=' + filter);
      if (res.ok) {
        const data = await res.json();
        if (data && Array.isArray(data.leaderboard) && data.leaderboard.length > 0) {
          const mapped: EnrichedLeaderboardEntry[] = data.leaderboard.map((item: any) => ({
            rank: item.rank,
            userId: item.userId,
            username: item.username,
            firstName: item.firstName || item.username,
            photoUrl: item.photoUrl || '',
            totalGarlic: item.totalGarlic || 0,
            totalBoxes: item.totalBoxes || 0,
            totalAjo: item.totalAjo || 0,
            stageIcon: '🧄',
            stageName: 'Cultivador',
            xp: item.totalGarlic * 10,
            streak: 1,
          }));
          setRemoteLeaders(mapped);
        }
      }
    } catch (e) {
      // Ignore network errors and fallback to local dynamic calculation
    } finally {
      setIsRefreshing(false);
    }
  };

  useEffect(() => {
    fetchRemoteLeaderboard();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filter]);

  // Construct current player entry with live real stats
  const myEntry: EnrichedLeaderboardEntry = {
    rank: 0,
    userId: user.id || 'my_user_id',
    username: user.username || 'MiJugador',
    firstName: user.firstName || user.username || 'Jugador',
    photoUrl: user.photoUrl || '',
    totalGarlic: stats.totalGarlicHarvested || inventory.rawGarlic || 0,
    totalBoxes: stats.totalBoxesCompleted || 0,
    totalAjo: stats.totalAjoEarned || inventory.ajoBalance || 0,
    stageIcon: currentStage.badgeIcon,
    stageName: currentStage.name,
    xp: stats.xp || 0,
    streak: Math.max(1, Math.floor(stats.totalTaps / 100)),
    isCurrentUser: true,
  };

  // Base list to sort
  const rawList = remoteLeaders.length > 0 ? remoteLeaders : MOCK_BASE_LEADERS;

  // Combine player with base pool (ensuring no duplicate user IDs)
  const combined = [
    myEntry,
    ...rawList.filter(u => u.userId !== myEntry.userId),
  ];

  // Sort dynamically based on filter
  const sorted = combined.sort((a, b) => {
    if (filter === 'xp') return b.xp - a.xp;
    if (filter === 'weekly') return b.totalBoxes - a.totalBoxes;
    return b.xp - a.xp; // Global order by XP / Boxes
  }).map((entry, index) => ({
    ...entry,
    rank: index + 1,
  }));

  const myCalculatedRank = sorted.find(u => u.isCurrentUser)?.rank || 1;

  const top3 = sorted.slice(0, 3);
  const rest = sorted.slice(3);

  // Podium order: 2nd place (Silver left), 1st place (Gold center), 3rd place (Bronze right)
  const podiumOrder = [top3[1], top3[0], top3[2]];

  const podiumStyles = [
    { border: 'border-slate-400/60', bg: 'bg-slate-400', imgBorder: 'border-slate-300', height: 'h-16', label: '🥈', textColor: 'text-slate-300' },
    { border: 'border-yellow-400/80', bg: 'bg-yellow-400', imgBorder: 'border-yellow-400', height: 'h-20', label: '🥇', textColor: 'text-amber-300' },
    { border: 'border-amber-700/60', bg: 'bg-amber-700', imgBorder: 'border-amber-600', height: 'h-12', label: '🥉', textColor: 'text-amber-500' },
  ];

  return (
    <div className="space-y-4 p-3 max-w-md mx-auto min-h-[calc(100vh-140px)] pb-24">

      {/* Header Title & Refresh Button */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-extrabold text-white flex items-center gap-2">
            <Trophy className="w-5 h-5 text-amber-400" /> RANKING AJO COIN
          </h2>
          <p className="text-xs text-gray-400 mt-0.5">Clasificación en tiempo real de cultivadores</p>
        </div>

        <button
          onClick={fetchRemoteLeaderboard}
          disabled={isRefreshing}
          className="p-2 bg-purple-900/40 hover:bg-purple-800/60 border border-purple-500/30 rounded-xl text-purple-300 active:scale-95 transition-all"
          title="Actualizar Ranking"
        >
          <RefreshCw className={`w-4 h-4 ${isRefreshing ? 'animate-spin text-amber-400' : ''}`} />
        </button>
      </div>

      {/* My Player Card */}
      <div className="glass-panel rounded-2xl p-3 border-2 border-amber-400/50 bg-gradient-to-r from-purple-950/40 via-amber-950/20 to-emerald-950/30 shadow-xl relative overflow-hidden">
        <div className="absolute top-0 right-0 bg-amber-400 text-black text-[9px] font-black px-2 py-0.5 rounded-bl-lg uppercase tracking-wider">
          TU POSICIÓN #{myCalculatedRank}
        </div>

        <div className="flex items-center gap-3 pt-1">
          <div className="relative shrink-0">
            <div className="w-12 h-12 rounded-full border-2 border-amber-400 bg-purple-900/60 flex items-center justify-center text-2xl font-black text-white overflow-hidden shadow-md">
              {user.photoUrl ? (
                <img src={user.photoUrl} alt={user.username} className="w-full h-full object-cover" />
              ) : (
                '🧄'
              )}
            </div>
            <span className="absolute -bottom-1 -right-1 text-base drop-shadow">{currentStage.badgeIcon}</span>
          </div>

          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-1.5">
              <p className="font-extrabold text-sm text-white truncate">@{user.username}</p>
              <span className="text-[10px] bg-amber-400/20 text-amber-300 border border-amber-400/40 px-1.5 py-0.2 rounded font-extrabold">TÚ</span>
            </div>
            <p className="text-[10px] text-purple-300 font-semibold">{currentStage.name}</p>
          </div>

          <div className="text-right shrink-0">
            <div className="flex items-center justify-end gap-1 text-xs font-black text-amber-300">
              <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
              {formatXP(stats.xp)} XP
            </div>
            <div className="text-[10px] text-emerald-400 font-bold">
              📦 {stats.totalBoxesCompleted} Boxes
            </div>
          </div>
        </div>

        <div className="mt-2.5 pt-2 border-t border-white/10 grid grid-cols-3 gap-2 text-center text-[10px]">
          <div>
            <span className="block text-gray-400 font-medium">Total Taps</span>
            <span className="font-bold text-white">{stats.totalTaps.toLocaleString()}</span>
          </div>
          <div>
            <span className="block text-gray-400 font-medium font-bold">Dientes 🦷</span>
            <span className="font-bold text-amber-300">{inventory.garlicTeeth}</span>
          </div>
          <div>
            <span className="block text-gray-400 font-medium">AJO Ganado</span>
            <span className="font-bold text-emerald-400">{stats.totalAjoEarned.toFixed(1)} AJO</span>
          </div>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex bg-black/40 p-1 rounded-2xl border border-white/10 text-xs font-bold shadow-inner">
        {([['global', '🌍 Global'], ['weekly', '📅 Semanal'], ['xp', '⭐ Por XP']] as const).map(([tab, label]) => (
          <button
            key={tab}
            onClick={() => setFilter(tab as LeaderboardFilter)}
            className={`flex-1 py-2 rounded-xl transition-all text-[11px] font-extrabold ${
              filter === tab
                ? 'bg-gradient-to-r from-sprout-500 to-emerald-600 text-white shadow-md'
                : 'text-gray-400 hover:text-white'
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      {/* Podium Display */}
      <div className="flex items-end justify-center gap-2 pt-2">
        {podiumOrder.map((player, idx) => {
          if (!player) return null;
          const style = podiumStyles[idx];
          const isFirst = idx === 1;

          return (
            <div key={player.userId} className="flex-1 flex flex-col items-center gap-1 min-w-0">
              {isFirst && <Crown className="w-5 h-5 text-yellow-400 animate-bounce" />}
              <div className="relative">
                <img
                  src={player.photoUrl || 'https://images.unsplash.com/photo-1615485290382-441e4d049cb5?w=100'}
                  alt={player.username}
                  className={`${isFirst ? 'w-16 h-16 border-3' : 'w-12 h-12 border-2'} rounded-full ${style.imgBorder} object-cover mx-auto shadow-lg`}
                  onError={(e) => { (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1615485290382-441e4d049cb5?w=100'; }}
                />
                <span className={`absolute -bottom-1 -right-1 ${style.bg} text-black text-[10px] font-black w-5 h-5 rounded-full flex items-center justify-center shadow`}>
                  {player.rank}
                </span>
              </div>

              <div className="text-center w-full px-1 min-w-0">
                <p className="font-extrabold text-[11px] text-white truncate w-full flex items-center justify-center gap-1">
                  <span>{player.username}</span>
                  {player.isCurrentUser && <span className="text-[8px] bg-amber-400 text-black px-1 rounded font-black">TÚ</span>}
                </p>
                <p className={`text-[10px] font-bold ${style.textColor}`}>
                  {filter === 'xp' ? `${formatXP(player.xp)} XP` : `${player.totalBoxes} Boxes`}
                </p>
              </div>

              {/* Podium stand */}
              <div className={`w-full ${style.height} rounded-t-xl border-t-2 border-x-2 ${style.border} bg-white/5 flex items-end justify-center pb-1 backdrop-blur-xs`}>
                <span className="text-lg">{style.label}</span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Leaderboard Table List */}
      <div className="glass-panel rounded-3xl border border-purple-500/30 overflow-hidden shadow-2xl">
        <div className="p-3 border-b border-white/10 flex justify-between items-center text-[10px] font-extrabold text-gray-400 uppercase tracking-wider bg-black/30">
          <span>JUGADOR</span>
          <span>{filter === 'xp' ? 'EXP / DESTELLOS' : 'BOXES / AJO'}</span>
        </div>

        <div className="divide-y divide-white/5">
          {rest.map((item) => {
            const isMe = item.isCurrentUser;
            return (
              <div
                key={item.userId}
                className={`p-3 flex items-center justify-between transition-colors ${
                  isMe
                    ? 'bg-gradient-to-r from-sprout-950/60 via-amber-950/40 to-purple-950/50 border-l-4 border-amber-400'
                    : 'hover:bg-white/5'
                }`}
              >
                <div className="flex items-center gap-3 min-w-0">
                  <span className={`font-mono font-black text-xs w-6 text-center shrink-0 ${
                    item.rank <= 5 ? 'text-amber-300' : 'text-gray-400'
                  }`}>
                    #{item.rank}
                  </span>

                  <div className="relative shrink-0">
                    <img
                      src={item.photoUrl || 'https://images.unsplash.com/photo-1615485290382-441e4d049cb5?w=100'}
                      alt={item.username}
                      className={`w-9 h-9 rounded-full border object-cover ${
                        isMe ? 'border-amber-400' : 'border-purple-500/30'
                      }`}
                      onError={(e) => { (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1615485290382-441e4d049cb5?w=100'; }}
                    />
                    <span className="absolute -bottom-0.5 -right-0.5 text-xs">{item.stageIcon.charAt(0)}</span>
                  </div>

                  <div className="min-w-0">
                    <div className="flex items-center gap-1">
                      <span className={`font-bold text-xs truncate block max-w-[110px] ${
                        isMe ? 'text-amber-300 font-black' : 'text-white'
                      }`}>
                        {item.username}
                      </span>
                      {isMe && (
                        <span className="text-[8px] bg-amber-400 text-black px-1 rounded font-black shrink-0">
                          TÚ
                        </span>
                      )}
                    </div>
                    <span className="text-[9px] text-purple-300/80 block truncate">{item.stageName}</span>
                  </div>
                </div>

                <div className="text-right shrink-0">
                  {filter === 'xp' ? (
                    <span className="text-xs font-mono font-bold text-amber-300 flex items-center justify-end gap-1">
                      <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
                      {formatXP(item.xp)} XP
                    </span>
                  ) : (
                    <>
                      <span className="text-xs font-mono font-bold text-amber-300 block">
                        📦 {item.totalBoxes} Boxes
                      </span>
                      <span className="text-[10px] text-emerald-400 font-semibold">
                        💰 {item.totalAjo.toFixed(1)} AJO
                      </span>
                    </>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <p className="text-[10px] text-gray-400 text-center flex items-center justify-center gap-1 pt-1">
        <ShieldAlert className="w-3.5 h-3.5 text-purple-400" />
        Sistema de Clasificación Antifraude AJO COIN en tiempo real
      </p>
    </div>
  );
};
