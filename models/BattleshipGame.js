const BattleshipBoard = require('./BattleshipBoard');

const games = {};

class BattleshipGame {
    constructor(data) {
        Object.assign(this, data);
    }

    save() {
        games[this.lobbyId] = this;
        return Promise.resolve(this);
    }

    static findOne({ lobbyId }) {
        return Promise.resolve(games[lobbyId] || null);
    }

    static findOneAndReplace({ lobbyId }, game) {
        games[lobbyId] = game;
        return Promise.resolve(game);
    }
}

const getRedactedGameState = (game, username) => {
    const isPlayer1 = game.player1 === username;

    const redactedGameState = {
        lobbyId: game.lobbyId,
        state: game.state,
        player1: game.player1,
        player2: game.player2,
        player1Turn: game.player1Turn,
        gameover: game.gameover,
        winner: game.winner
    };

    if (isPlayer1) {
        redactedGameState.player1Board = game.player1Board;
        const redactedBoard = new BattleshipBoard();
        redactedBoard.ships = game.player2Board.ships.filter((ship) => ship.sunk);
        redactedBoard.board = game.player2Board.board;
        redactedGameState.player2Board = redactedBoard;
    } else {
        redactedGameState.player2Board = game.player2Board;
        const redactedBoard = new BattleshipBoard();
        redactedBoard.ships = game.player1Board.ships.filter((ship) => ship.sunk);
        redactedBoard.board = game.player1Board.board;
        redactedGameState.player1Board = redactedBoard;
    }

    return redactedGameState;
};

module.exports = BattleshipGame;
module.exports.getRedactedGameState = getRedactedGameState;
