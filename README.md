# 🧄 AJO COIN — Telegram Mini App Web3

**AJO COIN** is a Web3 Telegram Mini App combining **tap game + idle game + farming + Web3 dashboard** aesthetics around the concept of garlic ("AJO").

---

## 🌟 Key Features

1. **Telegram Mini App Native SDK**: Automatically detects user ID, username, photo, theme params, and provides native Haptic Feedback (`impactOccurred`, `notificationOccurred`).
2. **Interactive AJO Character**: Giant animated Garlic character with energetic mood expressions (happy, winking, hype face, frenzy mode), floating +1 particles, Web Audio API synthesized SFX sound effects, and combo meters (GARLIC COMBO x10, FRENZY x50).
3. **Farming & Economy Mechanics**:
   - **Taps → Raw Garlic**: Every 100 taps = 1 Raw Garlic harvested.
   - **Raw Garlic → GC (Garlic Coins)**: Sell raw garlic for internal GC currency (`1 Garlic = 50 GC`).
   - **GC → Garlic Boxes**: Buy Basic (100 cap), Farm (500 cap), or Mega (2,500 cap) boxes.
   - **Wood Box Progress**: Wooden boxes fill up as garlic is harvested.
   - **1 Full Box = 1 AJO**: Full garlic boxes convert into **1 AJO Token**.
4. **EVM Web3 Wallet Integration**: Connect MetaMask, OKX Wallet, WalletConnect, or Coinbase Wallet to verify ownership, view on-chain AJO balances, participate in the presale, and claim on-chain AJO tokens.
5. **Garlic Lab Upgrades**: Upgrade finger power (+power per tap), max energy (+25 energy), fast energy regeneration, double garlic multipliers, and box storage capacity using GC.
6. **Quests & Achievements**: Daily and lifetime quests (Tap 100 times, Harvest 10 garlic, Fill 1 box, Invite 3 friends, Connect Wallet) with claimable GC & AJO rewards.
7. **Fair Launch / Presale Dashboard**: Countdown timer, ETH raised progress bar (`42.8 ETH / 100 ETH`), tokenomics, contract address copy, and EVM contribution interface.
8. **Referral System**: Generates custom Telegram start link (`https://t.me/AJOCOINbot?start=ref_AJO-X7K29`) with multi-tier rewards.
9. **Leaderboard**: Global, Weekly, and Daily rankings with Top 3 podium display.
10. **Admin Panel**: Protected dashboard to adjust game parameters (`GAME_CONFIG`) dynamically without restarting the server, view metrics, ban users, and monitor anti-cheat events.
11. **Anti-Cheat & Rate Limiting**: Server-side tap frequency validation (max 15-25 taps/sec limit), timestamp checks, anti-autoclicker protection.

---

## 🏗️ Project Architecture

```
telegram miniapp/
├── prisma/
│   └── schema.prisma         # Prisma ORM schema with User, GameStats, Boxes, Web3 models
├── server/
│   ├── index.ts              # Express API server entry point
│   ├── config.ts             # Server environment & dynamic game economy config
│   ├── db.ts                 # Prisma singleton instance
│   ├── seed.ts               # Database seeder (upgrades, quests, achievements)
│   ├── middleware/
│   │   ├── auth.ts           # JWT & Admin authorization middleware
│   │   └── antiCheat.ts      # Server-side tap speed anti-cheat validator
│   └── routes/
│       ├── auth.ts           # Telegram login & JWT issuance
│       ├── game.ts           # Energy calculation & tap batch sync
│       ├── inventory.ts      # Garlic selling, box purchasing & AJO claiming
│       ├── upgrades.ts       # Garlic Lab upgrade system
│       ├── quests.ts         # Quests progress & reward claiming
│       ├── referrals.ts      # Referral link & tier statistics
│       ├── leaderboard.ts    # Global leaderboard rankings
│       ├── presale.ts        # Fair Launch presale dashboard
│       ├── web3.ts           # Nonce generation, wallet binding & claim verification
│       └── admin.ts          # Admin panel configuration & user suspension
├── src/
│   ├── components/
│   │   ├── common/           # TopPlayerBar, BottomNav, WalletModal, NotificationToast
│   │   ├── farm/             # TapGame, GarlicCharacter, EnergyBar, ComboMeter
│   │   ├── inventory/        # GarlicInventory, GarlicBoxes, ClaimAjoModal
│   │   ├── upgrades/         # GarlicLab
│   │   ├── quests/           # QuestsList
│   │   ├── launch/           # PresaleDashboard
│   │   ├── rank/             # Leaderboard
│   │   ├── profile/          # PlayerProfile, Referrals
│   │   └── admin/            # AdminPanel
│   ├── context/
│   │   ├── GameContext.tsx   # Centralized game state, taps, boxes, upgrades
│   │   ├── Web3Context.tsx   # Web3 EVM wallet state & network connector
│   │   └── TelegramContext.tsx # Telegram WebApp SDK wrapper
│   ├── config/
│   │   └── gameConfig.ts     # Game economy default configuration
│   ├── utils/
│   │   ├── haptics.ts        # Telegram WebApp HapticFeedback + HTML5 vibrate
│   │   ├── audio.ts          # Web Audio API synthesizer for instant SFX
│   │   ├── format.ts         # Number, address & timer formatting
│   │   └── telegram.ts       # Telegram WebApp SDK helper
│   ├── App.tsx               # Main layout
│   └── index.css             # Glassmorphic styles & animations
├── package.json
├── vite.config.ts
├── tailwind.config.js
└── .env
```

---

## ⚡ Quick Start

### 1. Requirements
- Node.js v18+
- npm

### 2. Environment Variables (.env)
Copy `.env.example` to `.env` and set your variables:
```env
PORT=3001
JWT_SECRET=super_secret_garlic_key_ajo_coin_2026
DATABASE_URL="file:./dev.db"

TELEGRAM_BOT_TOKEN="7890123456:AAFFxx_EXAMPLE_BOT_TOKEN"
TELEGRAM_BOT_USERNAME="AJOCOINbot"

AJO_CONTRACT_ADDRESS="0x1234567890abcdef1234567890abcdef12345678"
CHAIN_ID=1
CHAIN_NAME="Ethereum Mainnet"
```

### 3. Database Initialization & Seeding
Push schema and seed initial database content:
```bash
npx prisma db push
npx tsx server/seed.ts
```

### 4. Development Run
Run both frontend and backend concurrently:
```bash
cmd /c npm run dev
```
- Frontend: `http://localhost:5173`
- Backend API: `http://localhost:3001`

---

## 📱 Telegram Bot & Mini App Setup Instructions

1. Open Telegram and search for `@BotFather`.
2. Send `/newbot` to create your bot (e.g. `AJO COIN Bot`).
3. Send `/newapp` to create a Mini App associated with your bot.
4. Set the WebApp URL to your deployed frontend HTTPS URL (e.g., `https://your-domain.com` or ngrok tunnel `https://xxxx.ngrok-free.app`).
5. Open your bot in Telegram and start tapping!

---

## 🛡️ Anti-Cheat & Security

- **No Client Authority**: Client never sends `giveMeGarlic: 1000`. All tap counts are processed server-side against energy limits and regen timestamps.
- **Speed Validation**: Maximum human tap speed cap (15-25 taps/sec). Anomalous requests automatically register an `AntiCheatEvent` and reject the tap payload.
- **Web3 Nonce Signature**: Wallets are linked via SIWE message signatures to protect against identity spoofing.

---

## 📄 License
MIT © AJO COIN Team
# AJO-COIN
