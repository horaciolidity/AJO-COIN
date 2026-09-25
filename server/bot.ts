import { Bot, InlineKeyboard } from 'grammy';
import dotenv from 'dotenv';

dotenv.config();

const token = process.env.TELEGRAM_BOT_TOKEN;
const appUrl = process.env.WEBAPP_URL || 'http://localhost:5173';

if (!token || token.includes('EXAMPLE')) {
  console.log('⚠️ TELEGRAM_BOT_TOKEN no configurado en .env. El bot de Telegram no se ejecutará.');
} else {
  const bot = new Bot(token);

  bot.command('start', async (ctx) => {
    const keyboard = new InlineKeyboard().webApp(
      '🧄 Jugar AJO COIN',
      appUrl
    );

    await ctx.reply(
      `🧄 *¡Bienvenido a AJO COIN!* 🧄\n\n` +
      `¡Conviértete en el mayor cultivador de ajos Web3 del ecosistema!\n\n` +
      `• *Taps*: Produce ajos gigantes.\n` +
      `• *Cajas*: Almacena tu cosecha.\n` +
      `• *Tokens*: 1 Caja Llena = 1 AJO Token on-chain.\n` +
      `• *Mejoras & Referidos*: Multiplica tu producción pasiva.\n\n` +
      `Haz clic abajo para abrir la Mini App:`,
      {
        parse_mode: 'Markdown',
        reply_markup: keyboard,
      }
    );
  });

  bot.command('help', (ctx) => {
    ctx.reply('Usa el botón "🧄 Jugar AJO COIN" para abrir el juego dentro de Telegram.');
  });

  bot.start({
    onStart: (botInfo) => {
      console.log(`🤖 Bot de Telegram activo: @${botInfo.username}`);
      console.log(`🔗 WebApp URL configurada: ${appUrl}`);
    },
  });
}
