const { WebSocketServer } = require("ws")
const uuidv4 = require("uuid").v4
const url = require("url");
const BattleshipGame = require("./models/BattleshipGame");
const BattleshipBoard = require("./models/BattleshipBoard");
const { stringToShip } = require("./enums/BattleshipShips");

const connect = async (server) => {
    console.log("Configuring websockets");
    const wsServer = new WebSocketServer({ server })

    const connections = {}
    const users = {}

    const handleMessage = (bytes, uuid) => {
        const message = JSON.parse(bytes.toString())
        const user = users[uuid]
        const connection = connections[uuid]
        switch (message.type) {
            case "initialBoard":
                BattleshipGame.findOne({ lobbyId: user.lobbyId }).then((game) => {
                    if (game.player1 === user.username) {
                        game.player1Board.ships = message.ships;
                    } else if (game.player2 === user.username) {
                        game.player2Board.ships = message.ships;
                    }
                    if (game.player1Board.ships.length > 0 && game.player2Board.ships.length > 0) {
                        game.state = "PLAYING";
                    }
                    BattleshipGame.findOneAndReplace({ lobbyId: user.lobbyId }, game).then(() => {

                    }).catch((err) => {
                        console.log("Error submitting board");
                        sendError(connection, "Error submitting board");
                    });

                    const otherPlayer = game.player1 === user.username ? game.player2 : game.player1;
                    const otherPlayerUuid = Object.keys(users).find((key) => users[key].username === otherPlayer);
                    const otherPlayerConnection = connections[otherPlayerUuid];
                    otherPlayerConnection.send(
                        JSON.stringify({
                            type: "boardSubmitted",
                            player: user.username,
                        }),
                    );
                    if (game.state === "PLAYING") {
                        connection.send(
                            JSON.stringify({
                                type: "setGameInProgress"
                            }),
                        );
                        otherPlayerConnection.send(
                            JSON.stringify({
                                type: "setGameInProgress"
                            }),
                        );
                        connection.send(
                            JSON.stringify({
                                type: "gameState",
                                data: BattleshipGame.getRedactedGameState(game, user.username),
                            }),
                        );
                        otherPlayerConnection.send(
                            JSON.stringify({
                                type: "gameState",
                                data: BattleshipGame.getRedactedGameState(game, otherPlayer),
                            }),
                        );
                    }
                });
                break;
            case "fire":
                BattleshipGame.findOne({ lobbyId: user.lobbyId }).then((game) => {
                    if (game.gameover) {
                        console.log("Game over");
                        sendError(connection, "Game over");
                    } else {
                        // Check if it's the player's turn
                        if ((game.player1 === user.username && !game.player1Turn) || (game.player2 === user.username && game.player1Turn)) {
                            sendError(connection, "Not your turn");
                            return;
                        }

                        const isPlayer1 = game.player1 === user.username;
                        const otherPlayer = isPlayer1 ? game.player2 : game.player1;
                        const otherPlayerUuid = Object.keys(users).find((key) => users[key].username === otherPlayer);
                        const otherPlayerConnection = connections[otherPlayerUuid];
                        const otherPlayerBoard = isPlayer1 ? game.player2Board : game.player1Board;

                        // Calculate if a hit occured using the ships on the other player's board
                        const [y, x] = message.coordinates;
                        let hit = false;
                        otherPlayerBoard.ships.forEach((ship) => {
                            const shipInfo = stringToShip(ship.type);
                            const [shipY, shipX] = ship.location;
                            if (ship.rotated) {
                                if (x === shipX && y >= shipY && y < shipY + shipInfo.length) {
                                    hit = true;
                                    return;
                                }
                            } else {
                                if (y === shipY && x >= shipX && x < shipX + shipInfo.length) {
                                    hit = true;
                                    return;
                                }
                            }
                        });

                        otherPlayerBoard.board[y][x] = hit ? "hit" : "miss";


                        const newShips = [];
                        // Update the ship's sunk status
                        otherPlayerBoard.ships.forEach((ship) => {
                            const shipInfo = stringToShip(ship.type);
                            const [shipY, shipX] = ship.location;
                            let sunk = true;
                            if (ship.rotated) {
                                for (let i = shipY; i < shipY + shipInfo.length; i++) {
                                    if (otherPlayerBoard.board[i][shipX] !== "hit") {
                                        sunk = false;
                                        break;
                                    }
                                }
                            } else {
                                for (let i = shipX; i < shipX + shipInfo.length; i++) {
                                    if (otherPlayerBoard.board[shipY][i] !== "hit") {
                                        sunk = false;
                                        break;
                                    }
                                }
                            }

                            ship.sunk = sunk;
                            newShips.push(ship);
                        });

                        otherPlayerBoard.ships = newShips;

                        // Check if all are sunk
                        let allSunk = otherPlayerBoard.ships.every((ship) => ship.sunk);
                        if (allSunk) {
                            game.gameover = true;
                            game.winner = user.username;
                            game.state = "GAME_OVER";
                        }

                        if (isPlayer1) {
                            game.player1Turn = false;
                            game.player2Board = otherPlayerBoard;
                        } else {
                            game.player1Turn = true;
                            game.player1Board = otherPlayerBoard;
                        }
                        BattleshipGame.findOneAndReplace({ lobbyId: user.lobbyId }, game).then(() => {

                        }).catch((err) => {
                            console.log("Error submitting fire");
                            sendError(connection, "Error submitting fire");
                        });
                        connection.send(
                            JSON.stringify({
                                type: "gameState",
                                data: BattleshipGame.getRedactedGameState(game, (isPlayer1 ? game.player1 : game.player2)),
                            }),
                        );
                        otherPlayerConnection.send(
                            JSON.stringify({
                                type: "gameState",
                                data: BattleshipGame.getRedactedGameState(game, (isPlayer1 ? game.player2 : game.player1)),
                            }),
                        );
                    }
                });
                break;
            default:
                console.log(`Unknown message type: ${message.type}`);
                console.log(message);
                break;
        }
    }

    const handleClose = (uuid) => {
        delete connections[uuid]
        delete users[uuid]
        broadcast()
    }

    const broadcast = () => {
        Object.keys(connections).forEach((uuid) => {
            const connection = connections[uuid]
            const message = JSON.stringify(users)
            connection.send(message)
        })
    }

    wsServer.on("connection", (connection, request) => {
        const { username, lobbyId } = url.parse(request.url, true).query
        const uuid = uuidv4()
        connections[uuid] = connection
        users[uuid] = {
            username,
            lobbyId,
            state: {},
        }

        BattleshipGame.findOne({ lobbyId: lobbyId }).then((game) => {
            if (!game) {
                const player1 = username;
                const player1Board = new BattleshipBoard();
                const player1Turn = true;
                const gameover = false;
                const state = "SETUP";
                const winner = "";
                const newBattleshipGame = new BattleshipGame({
                    lobbyId,
                    state,
                    player1,
                    player1Board,
                    player1Turn,
                    gameover,
                    winner,
                });
                newBattleshipGame.save().then(() => {

                }).catch((err) => {
                    console.log("Error saving game");
                    sendError(connection, "Error saving game");
                });
            } else {
                if (game.player1 === username) {
                    users[uuid].state = game;
                    if (game.state === "SETUP" && game.player2Board.ships && game.player2Board.ships != 0) {
                        connection.send(
                            JSON.stringify({
                                type: "boardSubmitted",
                                player: game.player2,
                            }),
                        );
                    }
                } else if (game.player2 === username) {
                    users[uuid].state = game;
                    if (game.state === "SETUP" && game.player1Board.ships && game.player1Board.ships != 0) {
                        connection.send(
                            JSON.stringify({
                                type: "boardSubmitted",
                                player: game.player1,
                            }),
                        );
                    }
                } else {
                    if (!game.player2) {
                        game.player2 = username;
                        game.player2Board = new BattleshipBoard();
                        BattleshipGame.findOneAndReplace({ lobbyId: lobbyId }, game).then(() => {
                            const player1Uuid = Object.keys(users).find((key) => users[key].username === game.player1);
                            const player1Connection = connections[player1Uuid];
                            player1Connection.send(
                                JSON.stringify({
                                    type: "playerJoined",
                                    player: game.player2,
                                    data: BattleshipGame.getRedactedGameState(game, game.player1),
                                }),
                            );
                            if (game.state === "SETUP" && game.player1Board.ships && game.player1Board.ships != 0) {
                                connection.send(
                                    JSON.stringify({
                                        type: "boardSubmitted",
                                        player: game.player1,
                                    }),
                                );
                            }
                        }).catch((err) => {
                            console.log("Error adding player 2");
                            sendError(connection, "Error adding player 2");
                        });
                    } else {
                        console.log("Game full");
                        sendError(connection, "Game full");
                    }
                }

                connection.send(
                    JSON.stringify({
                        type: "gameState",
                        data: BattleshipGame.getRedactedGameState(game, username),
                    }),
                );
            }
        }).catch((err) => {
            console.log("Error finding game", err);
            sendError(connection, "Error finding game");
        });

        connection.on("message", (message) => handleMessage(message, uuid))
        connection.on("close", () => handleClose(uuid))
    })

    const sendError = (connection, message) => {
        connection.send(
            JSON.stringify({
                type: "error",
                message,
            }),
        )
    }
};
module.exports = { connect };
