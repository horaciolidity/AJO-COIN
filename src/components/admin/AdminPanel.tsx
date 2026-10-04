import React, { useState } from 'react';
import { useGame } from '../../context/GameContext';
import { DEFAULT_GAME_CONFIG } from '../../config/gameConfig';
import { ShieldCheck, Save, Settings, AlertOctagon, Lock, Timer } from 'lucide-react';

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

  const [airdropDateInput, setAirdropDateInput] = useState(() => {
    const saved = localStorage.getItem('ajo_airdrop_target_date');
    if (saved) return saved.slice(0, 16);
    const d = new Date();
    d.setDate(d.getDate() + 30);
    return d.toISOString().slice(0, 16);
  });

  const [banUserId, setBanUserId] = useState('');
  const [banReason, setBanReason] = useState('');

  if (!user.isAdmin) {
    return (
      <div className="p-8 text-center space-y-3">
        <Lock className="w-12 h-12 text-red-500 mx-auto" />
        <h2 className="text-xl font-bold text-white">Acceso Denegado</h2>
        <p className="text-xs text-gray-400">Se requieren permisos de SuperAdmin para acceder a este panel.</p>
      </div>
    );
  }

  const handleSaveConfig = () => {
    showToast('¡Configuración Guardada!', 'Parámetros económicos del juego actualizados.', 'success');
  };

  const handleSaveAirdropDate = () => {
    if (!airdropDateInput) return;
    const isoDate = new Date(airdropDateInput).toISOString();
    localStorage.setItem('ajo_airdrop_target_date', isoDate);
    showToast('¡Fecha de Airdrop Actualizada!', `Nueva fecha objetivo: ${new Date(isoDate).toLocaleString()}`, 'success');
  };

  const handleBanUser = () => {
    if (!banUserId) return;
    showToast('Usuario Suspendido', `Usuario ${banUserId} ha sido suspendido. Razon: ${banReason || 'Infracción'}`, 'warning');
    setBanUserId('');
    setBanReason('');
  };

  return (
    <div className="space-y-4 p-4 max-w-md mx-auto min-h-[calc(100vh-140px)] pb-20">
      {/* Title */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-extrabold text-white flex items-center gap-2">
            <ShieldCheck className="w-6 h-6 text-purple-400" /> SUPERADMIN PANEL
          </h2>
          <p className="text-xs text-purple-300 font-medium">SuperAdmin: {user.email || user.username}</p>
        </div>
      </div>

      {/* Analytics Overview Cards */}
      <div className="grid grid-cols-2 gap-2">
        <div className="glass-panel p-3 rounded-2xl border border-purple-500/30 text-center">
          <span className="text-[10px] text-gray-400 block uppercase">Usuarios Registrados</span>
          <span className="text-lg font-black text-white">12,450 Users</span>
        </div>
        <div className="glass-panel p-3 rounded-2xl border border-purple-500/30 text-center">
          <span className="text-[10px] text-gray-400 block uppercase">Alertas Anti-Cheat</span>
          <span className="text-lg font-black text-amber-400">0 Flags</span>
        </div>
      </div>

      {/* Airdrop Target Date Configuration */}
      <div className="glass-panel p-4 rounded-3xl border border-amber-500/30 space-y-3 bg-gradient-to-br from-amber-950/20 via-black/40 to-purple-950/20">
        <h3 className="font-extrabold text-sm text-amber-300 flex items-center gap-2">
          <Timer className="w-4 h-4 text-amber-400" /> CONFIGURACIÓN DE FECHA AIRDROP
        </h3>

        <div className="space-y-2 text-xs">
          <div>
            <label className="text-gray-300 font-semibold block mb-1">Fecha y Hora de Inicio de Airdrop</label>
            <input
              type="datetime-local"
              value={airdropDateInput}
              onChange={(e) => setAirdropDateInput(e.target.value)}
              className="w-full bg-black/60 border border-amber-500/30 rounded-xl p-2.5 text-white font-mono text-xs focus:border-amber-400 outline-none"
            />
          </div>

          <button
            onClick={handleSaveAirdropDate}
            className="w-full py-2.5 rounded-xl bg-gradient-to-r from-amber-600 to-yellow-500 hover:from-amber-500 hover:to-yellow-400 text-black font-extrabold text-xs shadow-md transition-all flex items-center justify-center gap-1.5 mt-2"
          >
            <Save className="w-4 h-4" /> GUARDAR FECHA OBJETIVO AIRDROP
          </button>
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

      {/* ── Social Media Tasks & Links Admin Configurator ─────────────────── */}
      <AdminSocialTasksConfigurator showToast={showToast} />
    </div>
  );
};

const AdminSocialTasksConfigurator: React.FC<{ showToast: (t: string, m: string, type?: any) => void }> = ({ showToast }) => {
  const [tasks, setTasks] = useState<any[]>(() => {
    const saved = localStorage.getItem('ajo_custom_social_tasks');
    if (saved) {
      try { return JSON.parse(saved); } catch (e) {}
    }
    return [
      { id: 'st_yt_1', platform: 'YOUTUBE', title: 'SUSCRÍBETE EN YOUTUBE', description: 'Sigue el canal oficial de YouTube de AJO COIN', url: 'https://youtube.com/@AjoCoinOfficial', rewardGc: 500, rewardTeeth: 50, rewardAjo: 1.0 },
      { id: 'st_tg_1', platform: 'TELEGRAM', title: 'ÚNETE AL CANAL DE TELEGRAM', description: 'Entra al grupo oficial de anuncios en TG', url: 'https://t.me/AjoCoinCommunity', rewardGc: 500, rewardTeeth: 50, rewardAjo: 1.0 },
      { id: 'st_x_1', platform: 'X', title: 'SIGUE A AJO COIN EN X (TWITTER)', description: 'Sé el primero en ver las noticias en X', url: 'https://x.com/AjoCoinCrypto', rewardGc: 500, rewardTeeth: 50, rewardAjo: 1.0 },
      { id: 'st_ig_1', platform: 'INSTAGRAM', title: 'SIGUE A AJO COIN EN INSTAGRAM', description: 'Entérate de sorteos en Instagram', url: 'https://instagram.com/AjoCoinApp', rewardGc: 500, rewardTeeth: 50, rewardAjo: 1.0 },
    ];
  });

  const [newTitle, setNewTitle] = useState('');
  const [newDesc, setNewDesc] = useState('');
  const [newUrl, setNewUrl] = useState('');
  const [newPlatform, setNewPlatform] = useState<'YOUTUBE' | 'TELEGRAM' | 'X' | 'INSTAGRAM' | 'WEB'>('YOUTUBE');
  const [newGc, setNewGc] = useState(500);
  const [newTeeth, setNewTeeth] = useState(50);

  const handleAddTask = () => {
    if (!newTitle || !newUrl) {
      showToast('Campos Incompletos', 'Ingresa título y URL para crear la tarea.', 'warning');
      return;
    }

    const newTask = {
      id: `task_${Date.now()}`,
      platform: newPlatform,
      title: newTitle,
      description: newDesc || 'Completa esta tarea oficial para recibir recompensa',
      url: newUrl,
      rewardGc: newGc,
      rewardTeeth: newTeeth,
      rewardAjo: 1.0,
    };

    const updated = [newTask, ...tasks];
    setTasks(updated);
    localStorage.setItem('ajo_custom_social_tasks', JSON.stringify(updated));
    window.dispatchEvent(new Event('storage'));

    showToast('¡Tarea Agregada!', `Nueva tarea "${newTitle}" publicada para todos los usuarios.`, 'success');

    setNewTitle('');
    setNewDesc('');
    setNewUrl('');
  };

  const handleDeleteTask = (id: string) => {
    const updated = tasks.filter((t) => t.id !== id);
    setTasks(updated);
    localStorage.setItem('ajo_custom_social_tasks', JSON.stringify(updated));
    window.dispatchEvent(new Event('storage'));
    showToast('Tarea Eliminada', 'Se removió la tarea de la lista.', 'info');
  };

  return (
    <div className="glass-panel p-4 rounded-3xl border border-emerald-500/30 space-y-3 bg-gradient-to-br from-emerald-950/20 via-black/40 to-purple-950/20">
      <h3 className="font-extrabold text-sm text-emerald-400 flex items-center gap-2">
        <span>📲</span> CONFIGURACIÓN DE TAREAS & REDES SOCIALES
      </h3>
      <p className="text-[11px] text-gray-300 leading-tight">
        Agrega o edita misiones de enlaces (YouTube, Telegram, X, Instagram). Los usuarios recibirán recompensas en GC y Dientes al completar las tareas.
      </p>

      {/* Form para agregar tarea */}
      <div className="space-y-2 text-xs pt-1 border-t border-white/10">
        <div className="grid grid-cols-2 gap-2">
          <div>
            <label className="text-[10px] text-gray-300 font-semibold block mb-1">Plataforma</label>
            <select
              value={newPlatform}
              onChange={(e) => setNewPlatform(e.target.value as any)}
              className="w-full bg-black/60 border border-emerald-500/30 rounded-xl p-2 text-white font-mono text-xs outline-none"
            >
              <option value="YOUTUBE">YouTube 📺</option>
              <option value="TELEGRAM">Telegram ✈️</option>
              <option value="X">X (Twitter) 🐦</option>
              <option value="INSTAGRAM">Instagram 📸</option>
              <option value="WEB">Sitio Web 🌐</option>
            </select>
          </div>
          <div>
            <label className="text-[10px] text-gray-300 font-semibold block mb-1">Recompensa GC</label>
            <input
              type="number"
              value={newGc}
              onChange={(e) => setNewGc(Number(e.target.value))}
              className="w-full bg-black/60 border border-emerald-500/30 rounded-xl p-2 text-white font-mono text-xs outline-none"
            />
          </div>
        </div>

        <div>
          <label className="text-[10px] text-gray-300 font-semibold block mb-1">Título de la Tarea</label>
          <input
            type="text"
            placeholder="Ej: SUSCRÍBETE A NUESTRO CANAL"
            value={newTitle}
            onChange={(e) => setNewTitle(e.target.value)}
            className="w-full bg-black/60 border border-emerald-500/30 rounded-xl p-2 text-white text-xs outline-none"
          />
        </div>

        <div>
          <label className="text-[10px] text-gray-300 font-semibold block mb-1">Enlace / URL de la Misión</label>
          <input
            type="text"
            placeholder="https://youtube.com/..."
            value={newUrl}
            onChange={(e) => setNewUrl(e.target.value)}
            className="w-full bg-black/60 border border-emerald-500/30 rounded-xl p-2 text-white font-mono text-xs outline-none"
          />
        </div>

        <div>
          <label className="text-[10px] text-gray-300 font-semibold block mb-1">Descripción Breve</label>
          <input
            type="text"
            placeholder="Ej: Ver video completo y dar me gusta"
            value={newDesc}
            onChange={(e) => setNewDesc(e.target.value)}
            className="w-full bg-black/60 border border-emerald-500/30 rounded-xl p-2 text-white text-xs outline-none"
          />
        </div>

        <button
          onClick={handleAddTask}
          className="w-full py-2.5 rounded-xl bg-gradient-to-r from-emerald-600 to-sprout-500 hover:from-emerald-500 hover:to-sprout-400 text-white font-black text-xs shadow-md transition-all flex items-center justify-center gap-1.5 mt-2"
        >
          <span>➕</span> PUBLICAR TAREA EN EL JUEGO
        </button>
      </div>

      {/* Lista de tareas configuradas */}
      <div className="pt-2 border-t border-white/10 space-y-1.5">
        <span className="text-[10px] font-bold text-gray-400 block uppercase">Tareas Activas ({tasks.length})</span>
        <div className="space-y-1.5 max-h-48 overflow-y-auto pr-1">
          {tasks.map((t) => (
            <div key={t.id} className="p-2 rounded-xl bg-black/40 border border-white/10 flex items-center justify-between text-xs">
              <div className="min-w-0 flex-1 pr-2">
                <span className="font-extrabold text-white block truncate">{t.title}</span>
                <span className="text-[9px] text-emerald-300 font-mono block truncate">{t.url}</span>
              </div>
              <button
                onClick={() => handleDeleteTask(t.id)}
                className="px-2 py-1 bg-red-600/30 border border-red-500/40 text-red-300 text-[10px] font-bold rounded-lg hover:bg-red-600/50 transition-all shrink-0"
              >
                Eliminar
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
