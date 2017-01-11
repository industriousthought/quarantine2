var collision = require('./collision.js');
var audio = require('./audio.js');
var levelReader = require('./levelReader');
var editor = require('./editor');
var currentLevel;
var pov;
var player;

var step = function() {

    collision(renderer.world);
    if (pov) audio.updatePov(pov.pos);
    renderer.world.sort(function(a, b) {
        return a.onTop;
    });

    if (edit) editor.step();
    renderer.canvas.width = renderer.canvas.width;
    renderer.world = renderer.world.filter(function(item) { 
        var width, height, sx, sy, i, imgWidth, imgHeight, pattern;
        item.edit = edit;
        if (item.player) {
            player = item;
            item.renderer = renderer;
        }
        
        if (item.audio) {
            audio[item.type][item.audio](item.pos);
            item.audio = null;
        }
        if (item.visible && pov) {
            if (item.pos.rot > Math.PI * 2) item.pos.rot -= Math.PI * 2;
            if (item.pos.rot < 0) item.pos.rot += Math.PI * 2;
            if (item.texMap) {
                imgWidth = width = item.img.width / item.texMap.x;
                imgHeight = height = item.img.height / item.texMap.y;
                sx = width * item.pose.x;
                sy = height * item.pose.y;
            } else {
                if (item.img) {
                    width = item.width;
                    height = item.height;
                    imgWidth = item.img.width;
                    imgHeight = item.img.height;
                    sx = 0;
                    sy = 0;
                }
            }
            var ctx = renderer.canvas.getContext('2d');
            var pos = {};
            pos.x = 2250 + (item.pos.x - pov.pos.x) - width / 2;
            pos.y = 1900 + (item.pos.y - pov.pos.y) - height / 2;
            ctx.save(); 

            ctx.globalAlpha = item.opacity || 1;
            ctx.translate(2250 , 1900 );
            ctx.rotate(- pov.pos.rot - Math.PI / 2);
            ctx.translate( - (2250 ), - (1900 ));
            ctx.translate( pos.x + width / 2, pos.y + height / 2);
            ctx.rotate( item.pos.rot );
            ctx.strokeStyle = '#FF0000';
            ctx.lineWidth = 20;
            if (item.pattern) {
                pattern = ctx.createPattern(item.img, 'repeat');
                if (item.highlight || item.editing) ctx.strokeRect(-width / 2, - height / 2, width, height);
                if (item.editing) {
                    ctx.beginPath()
                    ctx.arc(-width / 2, -height / 2, 50, 0, Math.PI * 2);
                    ctx.stroke();
                    ctx.beginPath()
                    ctx.arc(-width / 2, height / 2, 50, 0, Math.PI * 2);
                    ctx.stroke();
                    ctx.beginPath()
                    ctx.arc(width / 2, -height / 2, 50, 0, Math.PI * 2);
                    ctx.stroke();
                    ctx.beginPath()
                    ctx.arc(width / 2, height / 2, 50, 0, Math.PI * 2);
                    ctx.stroke();
                }
                ctx.fillStyle = pattern;
                ctx.fillRect(-width / 2, - height / 2, width, height);
            } else {
                if (item.img) ctx.drawImage(item.img, sx, sy, imgWidth, imgHeight, - width / 2, - height / 2, width, height);
                if (item.highlight || item.editing) {
                    ctx.beginPath()
                    ctx.arc(0, 0, 50, 0, Math.PI * 2);
                    ctx.stroke();
                }

            }

            ctx.restore(); 
        }
        return item.step.call(item); 
    });
    renderer.world = renderer.world.concat(renderer.newItems);
    renderer.newItems = [];
    if (renderer.clear) {
        renderer.world = [];
        renderer.clear = false;
    }

    if (edit) {
        pov = editor;
    } else {
        pov = player;
    }


};
var playing = false;
var edit = false;
var renderer = {
    init: function(options) {
        renderer.level = options.level;
        renderer.world = [];
        renderer.canvas = document.getElementById(options.canvas);
        if (options.edit) window.setTimeout(function() { renderer.edit(true); }, 500);
    },
    edit: function(state) {
        if (!edit && state) {
            player.controller.stop();
            editor.controller.start();
        }
        if (edit && !state) {
            player.controller.start();
            editor.controller.stop();
        }
        edit = state;

    },
    start: function() {
        if (pov) pov.controller.start();
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
    loadLevel: function(id) {
        
        if (currentLevel) {
            renderer.world.forEach(function(item) {
                var startTime = Date.now();
                if (item.level && item.level === currentLevel) {
                    item.addEffect(function() {
                        var elapsed = Date.now() - startTime;
                        if (elapsed > 250) return false;
                        this.opacity = 1 - (elapsed / 250);
                        return true;
                    });
                }
            });
        }
        var items = levelReader(id);
        items.forEach(function(item) { 
            item.renderer = renderer;
        });
        renderer.newItems = renderer.newItems.concat(items);
        currentLevel = id;
    },
    newItems: []
};

editor.renderer = renderer;

module.exports = renderer;
