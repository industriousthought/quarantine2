var collision = require('./collision.js');
var audio = require('./audio.js');

var step = function() {

    renderer.newItems = [];
    renderer.level(renderer.world);
    collision(renderer.world);
    audio.updatePov(pov.pos);
    renderer.world.sort(function(a, b) {
        return a.onTop;
    });

    renderer.canvas.width = renderer.canvas.width;
    renderer.world = renderer.world.filter(function(item) { 
        var width, height, sx, sy, i;
        if (item.audio) {
            audio[item.type][item.audio](item.pos);
            item.audio = null;
        }
        if (item.visible) {
            if (item.pos.rot > Math.PI * 2) item.pos.rot -= Math.PI * 2;
            if (item.pos.rot < 0) item.pos.rot += Math.PI * 2;
            if (item.texMap) {
                width = item.img.width / item.texMap.x;
                height = item.img.height / item.texMap.y;
                sx = width * item.pose.x;
                sy = height * item.pose.y;
            } else {
                width = item.img.width;
                height = item.img.height;
                sx = 0;
                sy = 0;
            }
            var ctx = renderer.canvas.getContext('2d');
            var pos = {};
            pos.x = 2250 + (item.pos.x - pov.pos.x) - width / 2;
            pos.y = 1900 + (item.pos.y - pov.pos.y) - height / 2;
            ctx.save(); 

            ctx.translate(2250 , 1900 );
            ctx.rotate(- pov.pos.rot - Math.PI / 2);
            ctx.translate( - (2250 ), - (1900 ));
            ctx.translate( pos.x + width / 2, pos.y + height / 2);
            ctx.rotate( item.pos.rot );
            ctx.drawImage(item.img, sx, sy, width, height, - width / 2, - height / 2, width, height);

            ctx.restore(); 
        }
        return item.step.call(item); 
    });
    renderer.world = renderer.world.concat(renderer.newItems);

};
var playing = false;
var pov;
var renderer = {
    init: function(options) {
        renderer.level = options.level;
        renderer.world = options.world;
        renderer.canvas = document.getElementById(options.canvas);
        pov = options.pov;
    },
    start: function() {
        var animate = function() {
            step();
            if (playing) window.requestAnimationFrame(animate);
        };
        if (!playing) {
            playing = true;
            animate();
        }

    },
    stop: function() {
        playing = false;
    },
    step: function() {
        step();
    },
    newItems: []
};


module.exports = renderer;
