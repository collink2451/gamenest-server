const mongoose = require('mongoose')
const Schema = mongoose.Schema
const BattleshipBoard = require('./BattleshipBoard')

const BattleshipGameSchema = new Schema({
    lobbyId: {
        type: String,
        required: true
    },
    state: {
        type: String,
        required: true
    },
    player1: {
        type: String,
        required: true
    },
    player2: {
        type: String
    },
    player1Board: {
        type: Schema.Types.Mixed,
        required: true
    },
    player2Board: {
        type: Schema.Types.Mixed
    },
    player1Turn: {
        type: Boolean,
        required: true
    },
    winner: {
        type: String
    },
    gameover: {
        type: Boolean,
        required: true
    }
});

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
}

module.exports = mongoose.model('BattleshipGame', BattleshipGameSchema);
module.exports.getRedactedGameState = getRedactedGameState;