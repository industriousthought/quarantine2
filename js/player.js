var Bullet = require('./bullet.js');
var Character = require('./character.js');

module.exports = function(options) {

    

    var Player = Character({
        velocity: 0,
        renderer: options.renderer,
        radius: 50,
        type: 'human',
        sprites: ['./img/player.png'],
        texMap: {
            x: 6,
            y: 2,
            slides: [6, 5]
        },
        mode: 'loading',
        modes: {
            loading: function() {
                this.addEffect(function() {
                    this.addMode('standing');
                    return false;
                });
                return false;
            },
            standing: function() {
                this.pose.y = 0;

            },
            running: function() {

            },
            walking: function() {

            },
            shooting: function() {
                this.pose.y = 1;
                var tick = 11;
                this.addEffect(function() {
                    if (this.mode !== 'shooting') return false;
                    tick++;
                    if (tick > 5) { 
                        this.renderer.newItems.push(Bullet({x: this.pos.x, y: this.pos.y, rot: this.pos.rot}));
                        tick = 0;
                    }
                    return true;
                });
            }
        },
        collision: {
            zombie: function() {
                gameOver();
            },
            bullet: function() {

            },
            goal: function() {

            }
        }
    });

    var player = Player(options);
    options.controller.controlling = player;
    player.addEffect(options.controller.responseEffect);

    return player;
};
