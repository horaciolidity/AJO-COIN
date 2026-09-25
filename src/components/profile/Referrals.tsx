import React, { useState } from 'react';
import { useGame } from '../../context/GameContext';
import { Users, Copy, Check, Share2, Award } from 'lucide-react';
import { triggerHaptic } from '../../utils/haptics';

export const Referrals: React.FC = () => {
  const { user, showToast } = useGame();
  const [copied, setCopied] = useState(false);

  const referralLink = `https://t.me/AJOCOINbot?start=ref_${user.referralCode}`;

  const handleCopyLink = () => {
    triggerHaptic('light');
    navigator.clipboard.writeText(referralLink);
    setCopied(true);
    showToast('Link Copied!', 'Referral link copied to clipboard.', 'success');
    setTimeout(() => setCopied(false), 2000);
  };

  const handleShareTelegram = () => {
    triggerHaptic('medium');
    const text = encodeURIComponent('🧄 Join me in AJO COIN Garlic Farming! Tap garlics, fill boxes and earn $AJO tokens!');
    const shareUrl = `https://t.me/share/url?url=${encodeURIComponent(referralLink)}&text=${text}`;
    window.open(shareUrl, '_blank');
  };

  return (
    <div className="space-y-4">
      {/* Invite Card */}
      <div className="glass-card-green p-4 rounded-3xl border border-emerald-500/40 space-y-3 shadow-xl text-center">
        <span className="text-4xl block">👥</span>
        <h3 className="text-lg font-black text-white">REFER & EARN GARLIC COINS</h3>
        <p className="text-xs text-gray-300">
          Invite friends to AJO COIN and earn <span className="text-amber-300 font-bold">+500 GC</span> for every friend who joins!
        </p>

        {/* Link box */}
        <div className="bg-black/50 p-2.5 rounded-2xl border border-white/10 flex items-center justify-between gap-2">
          <span className="font-mono text-xs text-purple-200 truncate pl-1">
            {referralLink}
          </span>
          <button
            onClick={handleCopyLink}
            className="px-3 py-1.5 rounded-xl bg-sprout-500/20 text-sprout-300 border border-sprout-500/40 text-xs font-bold hover:bg-sprout-500/30 transition-all flex items-center gap-1 shrink-0"
          >
            {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
            <span>{copied ? 'COPIED' : 'COPY'}</span>
          </button>
        </div>

        <button
          onClick={handleShareTelegram}
          className="w-full py-3 rounded-2xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-extrabold text-xs shadow-lg transition-all flex items-center justify-center gap-2"
        >
          <Share2 className="w-4 h-4" />
          <span>SHARE TO TELEGRAM FRIENDS</span>
        </button>
      </div>

      {/* Referral Tier Levels */}
      <div className="glass-panel p-4 rounded-3xl border border-purple-500/30 space-y-3">
        <h4 className="font-extrabold text-sm text-white flex items-center gap-1.5">
          <Award className="w-4 h-4 text-amber-400" /> REFERRAL MILESTONES
        </h4>

        <div className="space-y-2 text-xs">
          {[
            { level: 'LEVEL 1', target: '5 Referrals', reward: '+2,500 GC Bonus', icon: '🥉', count: 1 },
            { level: 'LEVEL 2', target: '25 Referrals', reward: '+15,000 GC + 2 AJO', icon: '🥈', count: 0 },
            { level: 'LEVEL 3', target: '100 Referrals', reward: '+100,000 GC + 10 AJO', icon: '🥇', count: 0 },
          ].map((tier) => (
            <div
              key={tier.level}
              className="p-3 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-between"
            >
              <div className="flex items-center gap-2.5">
                <span className="text-xl">{tier.icon}</span>
                <div>
                  <h5 className="font-extrabold text-white text-xs">{tier.level} ({tier.target})</h5>
                  <p className="text-[10px] text-amber-300 font-semibold">{tier.reward}</p>
                </div>
              </div>
              <span className="text-[10px] bg-purple-500/20 text-purple-300 px-2 py-0.5 rounded-full font-bold">
                {tier.count} Invited
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
