const BattleshipShips = {
    CARRIER: {
        name: 'Carrier',
        length: 5,
    },
    BATTLESHIP: {
        name: 'Battleship',
        length: 4,
    },
    DESTROYER: {
        name: 'Destroyer',
        length: 3,
    },
    SUBMARINE: {
        name: 'Submarine',
        length: 3,
    },
    PATROL_BOAT: {
        name: 'Patrol Boat',
        length: 2,
    }
};

function stringToShip(ship) {
    switch (ship) {
        case 'Carrier':
            return BattleshipShips.CARRIER;
        case 'Battleship':
            return BattleshipShips.BATTLESHIP;
        case 'Destroyer':
            return BattleshipShips.DESTROYER;
        case 'Submarine':
            return BattleshipShips.SUBMARINE;
        case 'Patrol Boat':
            return BattleshipShips.PATROL_BOAT;
        default:
            return null;
    }
}

module.exports = BattleshipShips;
module.exports.stringToShip = stringToShip;

