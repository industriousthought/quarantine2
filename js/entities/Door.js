var Block = require('./Block.js');

module.exports = function(options) {


    var door = Block({path: options.path, pos: {x: options.pos.x, y: options.pos.y, rot: options.pos.rot}, width: options.width, height: options.height});
    var oldStep = door.step;

    door.open = false;
    door.onTop = true;
    door.pattern = false;

    door.type = 'door';

    door.step = function () {
        if (door.open && (door.pos.x !== door.openPos.x || door.pos.y !== door.openPos.y)) {
            door.pos.x -= (door.pos.x - door.openPos.x) / 15;
            door.pos.y -= (door.pos.y - door.openPos.y) / 15;
            door.resetVerts.call(door);
        }
        if (!door.open && (door.pos.x !== door.closedPos.x || door.pos.y !== door.closedPos.y)) {
            door.pos.x -= (door.pos.x - door.closedPos.x) / 15;
            door.pos.y -= (door.pos.y - door.closedPos.y) / 15;
            door.resetVerts.call(door);
        }
        return oldStep();
    };


    door.closedPos = {x: options.pos.x, y: options.pos.y, rot: options.pos.rot};
    door.openPos = {x: options.openPos.x, y: options.openPos.y, rot: options.openPos.rot};

    return door;
};


