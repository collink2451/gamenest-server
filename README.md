# GameNest Server

Node.js/Express backend for the GameNest multi-game platform. Handles GitHub OAuth authentication, game state via WebSockets, and a persistent leaderboard.

## Games

| Game | Transport | Status |
|------|-----------|--------|
| Battleship | WebSockets | Implemented |
| Wordle | REST | Stub |
| Dots and Boxes | REST | Stub |

Battleship is the primary implemented game — full 2-player sessions over WebSockets with ship placement, turn-based firing, hit/miss tracking, sunk detection, and win state.

## API

| Method | Path | Description |
|--------|------|-------------|
| `GET` | `/auth/github/callback` | GitHub OAuth callback |
| `GET` | `/auth/check` | Verify session cookie |
| `GET` | `/auth/logout` | Clear session |
| `GET` | `/ping` | Health check |
| `WebSocket` | `/?username=&lobbyId=` | Battleship game session |

## Tech Stack

- **Runtime:** Node.js
- **Framework:** Express
- **Real-time:** WebSocket (ws)
- **Auth:** GitHub OAuth (cookie-based)
- **Database:** MongoDB (via Mongoose)

## Setup

### Requirements

- Node.js 18+
- MongoDB instance
- GitHub OAuth app ([GitHub Developer Settings](https://github.com/settings/developers))

### Installation

1. Install dependencies:

```bash
npm install
```

2. Create a `.env` file in the root directory:

```env
MONGO_URI=your_mongodb_connection_string
PORT=3000

# GitHub OAuth
GITHUB_CLIENT_ID=your_github_oauth_client_id
GITHUB_CLIENT_SECRET=your_github_oauth_client_secret
```

3. Start the server:

```bash
npm start
```

## Scripts

| Command | Description |
|---------|-------------|
| `npm start` | Start the server |
