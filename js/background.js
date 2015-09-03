var Background = function(options) {

    var image = new Image();
    image.src = options.path;

    var tile = {
        type: 'tile',
        visible: true,
        img: image,
        pos: {
            x: options.pos.x,
            y: options.pos.y,
            rot: 0
        },
        step: function() {
            return true;
        },

    };

    return tile;
};

module.exports = Background;
