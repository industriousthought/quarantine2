var Block = require('./Block.js');

module.exports = function(options) {


    var sensor = Block({path: '', pos: {x: options.pos.x, y: options.pos.y, rot: options.pos.rot}, width: options.width, height: options.height});


    sensor.type = 'sensor';
    sensor.visible = false;
    sensor.solid = false;


    var activation = function() {
        options.door.open = !options.door.open;
    };

    sensor.collision.activation = activation;
    sensor.collision.bullet = activation;
    sensor.collision.meelee = activation;

    return sensor;
    
};


