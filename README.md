# 🎵 Clash Music Bot v2.0

> **A high-performance, visually stunning Telegram Voice Chat streamer.**

[![GitHub Stars](https://img.shields.io/github/stars/ajisth/clash-music?style=for-the-badge&color=ffd700)](https://github.com/ajisth/clash-music)
[![Node.js Version](https://img.shields.io/badge/node.js-v20%2B-green?style=for-the-badge&logo=node.js)](https://nodejs.org)
[![Telegram](https://img.shields.io/badge/Telegram-Bot%20API-blue?style=for-the-badge&logo=telegram)](https://t.me/BotFather)

Clash Music is a state-of-the-art Telegram music bot built for speed, aesthetics, and high-quality audio. It streams directly into Group Voice Chats using the Userbot API, providing a seamless "Radio" experience for your community.

---

## ✨ Key Features

*   🎧 **Native VC Streaming**: Streams audio directly into Telegram Voice/Video calls (no audio file spam).
*   🖼️ **Visual UI**: Beautiful photo-based interface for every command (`/play`, `/np`, `/skip`).
*   🔘 **Dynamic Progress Bar**: Live-updating progress indicator in message captions.
*   ⚡ **Zero-Lag Engine**: Optimized with pre-buffered disk streaming and a custom thread-pool for buttery smooth playback.
*   🔍 **Instant Search**: Powered by a high-speed JioSaavn private API.
*   🛡️ **Sudo Controls**: Multi-admin support for large groups.

---

## 🚀 Quick Start

### 1. Requirements
*   **Node.js v20+**
*   **FFmpeg** (installed and added to PATH)
*   **API ID & Hash** from [my.telegram.org](https://my.telegram.org)
*   **Bot Token** from [@BotFather](https://t.me/BotFather)

### 2. Installation
```bash
git clone https://github.com/ajisth/clash-music.git
cd clash-music
npm install
```

### 3. Session Generation
You need a `STRING_SESSION` to allow the bot to join voice calls. Run the generator:
```bash
npm run session
```

### 4. Configuration
Create a `.env` file from the example:
```bash
cp .env.example .env
```
Fill in your credentials:
```env
API_ID=12345
API_HASH=your_hash
BOT_TOKEN=your_token
OWNER_ID=your_id
STRING_SESSION=your_generated_session
```

### 5. Run
```bash
npm start
```

---

## 🎮 Commands

| Command | Action |
| :--- | :--- |
| `/play <name>` | Search and play a song in Voice Chat |
| `/pause` | Pause the current stream |
| `/resume` | Resume the stream |
| `/skip` | Skip to the next song in queue |
| `/stop` | Stop the bot and clear the queue |
| `/np` | Show the current song and progress |
| `/queue` | View the upcoming tracks |
| `/ping` | Check bot and API latency |

---

## 🛠️ Advanced Tech Stack

*   **Logic**: [grammY](https://grammy.dev/) (Bot API 7.x)
*   **MTProto**: [GramJS](https://gram.js.org/)
*   **Voice**: [tgcallsjs](https://github.com/gram-tgcalls/tgcallsjs) + [wrtc](https://github.com/node-webrtc/node-webrtc)
*   **Audio Processing**: FFmpeg with Real-Time (`-re`) rate limiting.

---

## 🤝 Credits

*   Built with ❤️ by [Ajisth](https://github.com/ajisth)
*   Special thanks to the [grammY](https://t.me/grammyjs) community.

---

> **Note**: This bot is for educational purposes. Please respect copyrights when streaming music.
