// Router for battleship game

const express = require('express');
const router = express.Router();

router.get('/battleship/:gameId', (req, res) => {
    res.send('Battleship game');
});

router.get('/battleship/:gameId/shoot', (req, res) => {
    // Get the query string from the URL
    let query = req.query;
    let x = query.x;
    let y = query.y;
    let gameId = req.params.gameId;
    res.send(`Shooting at ${x}, ${y} in game ${gameId}`);
});

module.exports = router;