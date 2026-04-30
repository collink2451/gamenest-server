# GameNest Server

Node.js/Express backend for the GameNest multi-game platform. Handles Battleship game sessions over WebSockets with in-memory state management.

## Games

| Game | Transport | Status |
|------|-----------|--------|
| Battleship | WebSocket | Implemented |

Battleship supports full 2-player sessions — ship placement, turn-based firing, hit/miss tracking, sunk detection, and win state. Game state is held in memory and does not persist across server restarts.

## API

| Method | Path | Description |
|--------|------|-------------|
| `GET` | `/api/battleship/:gameId` | Get game by ID |
| `GET` | `/api/battleship/:gameId/shoot` | Fire at coordinates |
| `WebSocket` | `/?username=&lobbyId=` | Battleship game session |

## Tech Stack

- **Runtime:** Node.js
- **Framework:** Express
- **Real-time:** WebSocket (ws)
- **State:** In-memory

## Setup

### Requirements

- Node.js 18+

### Installation

1. Install dependencies:

```bash
npm install
```

2. Create a `.env` file in the root directory:

```env
PORT=5003
```

3. Start the server:

```bash
npm start
```

## Scripts

| Command | Description |
|---------|-------------|
| `npm start` | Start the server |
