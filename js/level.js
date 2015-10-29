var Tile = require('./background.js');
var Zombie = require('./zombie.js');
var Block = require('./block.js');

var level = function(options) {
    var renderer = options.renderer;
    var world = options.world;
    var player = options.player;
    var i, j;
    for (i = 0; i < 10; i++) {
        for (j = 0; j < 10; j++) {
            world.push(Tile({pos: {x: i * 512, y: j * 512}, path: './img/background.jpg'}));
        }
    }

    for (i = 0; i < 57; i++) {
        world.push(Block({path: './img/wall.png', pos: {x: i * 90 - 200, y: -200, rot: 0}, width: 100, height: 100}));
    }
    for (i = 0; i < 57; i++) {
        world.push(Block({path: './img/wall.png', pos: {x: i * 90 - 200, y: 4800, rot: 0}, width: 100, height: 100}));
    }
    for (i = 0; i < 57; i++) {
        world.push(Block({path: './img/wall.png', pos: {x: -200, y: i * 90 - 200, rot: 0}, width: 100, height: 100}));
    }

    for (i = 0; i < 57; i++) {
        world.push(Block({path: './img/wall.png', pos: {x: 4800, y: i * 90 - 200, rot: 0}, width: 100, height: 100}));
    }

    world.push(Block({path: './img/car1.png', pos: {x: 300, y: 300, rot: 2}, width: 200, height: 300}));
    world.push(Block({path: './img/car2.png', pos: {x: 800, y: 300, rot: 0}, width: 200, height: 300}));
    world.push(Block({path: './img/car3.png', pos: {x: 1100, y: 300, rot: 0}, width: 200, height: 300}));
    world.push(Block({path: './img/car2.png', pos: {x: 1500, y: 300, rot: 0}, width: 200, height: 300}));
    world.push(Block({path: './img/car1.png', pos: {x: 1900, y: 300, rot: 0}, width: 200, height: 300}));
    world.push(Block({path: './img/car3.png', pos: {x: 300, y: 800, rot: 0}, width: 200, height: 300}));
    world.push(Block({path: './img/car1.png', pos: {x: 300, y: 1100, rot: 0}, width: 200, height: 300}));

    world.push(Zombie({renderer: renderer, img: 2, pos: {x: 1900, y: 1700, rot: 0}}));
    world.push(Zombie({renderer: renderer, img: 0, pos: {x: 3400, y: 1700, rot: 0}}));
    //world.push(Zombie({renderer: renderer, img: 2, pos: {x: 1900, y: 2400, rot: 0}}));
    //world.push(Zombie({renderer: renderer, img: 1, pos: {x: 3700, y: 1700, rot: 0}}));
    //world.push(Zombie({renderer: renderer, img: 2, pos: {x: 1500, y: 2300, rot: 0}}));
    //world.push(Zombie({renderer: renderer, img: 0, pos: {x: 3900, y: 1200, rot: 0}}));

    world.push(player);

    var tick = 0;

    return function(world) {
        if (tick > 200) {
            tick = 0;
            world.push(Zombie({renderer: renderer, img: 2, pos: {x: 3500, y: 3500, rot: 0}}));
            tick = 0;
        }
        tick++;

    };
};


module.exports = level;
