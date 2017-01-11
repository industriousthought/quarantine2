var Block = require('./Block.js');

var effects = [];
var newEffects = [];
var Background = function(options) {

    var image = new Image();
    image.src = options.path;

    var tile = Block({
        path: '../img/background.jpg',
        width: options.width,
        height: options.height,
        pos: {
            x: options.pos.x,
            y: options.pos.y,
            rot: 0
        },
    });

    tile.type = 'tile';
    tile.solid = false;

    return tile;
};

module.exports = Background;
