class BattleshipBoard {
    ships = [];

    board = new Array(10).fill(null).map(() => new Array(10).fill(null));

    constructor() {

    }
}

module.exports = BattleshipBoard;