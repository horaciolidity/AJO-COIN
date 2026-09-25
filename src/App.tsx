import React from 'react';
import { useGame } from './context/GameContext';
import { TopPlayerBar } from './components/common/TopPlayerBar';
import { BottomNav } from './components/common/BottomNav';
import { WalletModal } from './components/common/WalletModal';
import { NotificationToast } from './components/common/NotificationToast';
import { ParticleEffect } from './components/common/ParticleEffect';

import { TapGame } from './components/farm/TapGame';
import { GarlicInventory } from './components/inventory/GarlicInventory';
import { PresaleDashboard } from './components/launch/PresaleDashboard';
import { Leaderboard } from './components/rank/Leaderboard';
import { PlayerProfile } from './components/profile/PlayerProfile';
import { AdminPanel } from './components/admin/AdminPanel';

export const AppContent: React.FC = () => {
  const { activeTab } = useGame();

  const renderTabContent = () => {
    switch (activeTab) {
      case 'farm':
        return <TapGame />;
      case 'inventory':
        return <GarlicInventory />;
      case 'launch':
        return <PresaleDashboard />;
      case 'rank':
        return <Leaderboard />;
      case 'profile':
        return <PlayerProfile />;
      case 'admin':
        return <AdminPanel />;
      default:
        return <TapGame />;
    }
  };

  return (
    <div className="relative min-h-screen bg-[#0F0A1C] text-[#F7F4EB] flex flex-col font-sans overflow-x-hidden">
      {/* Background ambient lighting */}
      <div className="fixed top-0 left-1/4 w-96 h-96 bg-purple-900/20 rounded-full blur-3xl pointer-events-none" />
      <div className="fixed bottom-0 right-1/4 w-96 h-96 bg-emerald-900/20 rounded-full blur-3xl pointer-events-none" />

      {/* Floating particles */}
      <ParticleEffect />

      {/* Toast Notifications */}
      <NotificationToast />

      {/* Permanent Top Stats Header Bar */}
      <TopPlayerBar />

      {/* Main Screen View */}
      <main className="flex-1 w-full relative z-10 animate-fadeIn">
        {renderTabContent()}
      </main>

      {/* Bottom Mobile Navigation */}
      <BottomNav />

      {/* EVM Wallet Modal */}
      <WalletModal />
    </div>
  );
};

export function App() {
  return <AppContent />;
}

export default App;
