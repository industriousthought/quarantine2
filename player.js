var Character = require('./character.js');

module.exports = function(options) {
    

    var Zombie = new Character({
        sprites: ['./img/zombie1.png', './img/zombie2.png', './img/zombie3.png'],
        texMap: {
            x: 6,
            y: 3,
            slides: [6, 5, 3]
        },
        mode: 'wandering',
        modes: {
            wandering: function() {
                var timeLength = 1 + parseInt(Math.random() * 3 * 1000);
                var startTime = Date.now();
                this.velocity = 1 + Math.random() * 2;
                this.pos.rot = Math.random() * Math.PI * 2;
                this.pose.y = 1;

                this.addEffect(function() {
                    var ellapsedTime = now - startTime;
                    var now = Date.now();
                    if (this.mode !== 'wandering') {
                        return false;
                    }
                    if (startTime + timeLength  < now) {
                        this.addMode('wandering');
                        return false; 
                    }
                    return true;
                });
            },
            searching: function() {
            },
            chasing: function() {
            },
            running: function() {
            },
            biting: function() {
            },
            staggering: function() {
            },
            dead: function() {
            }
        }
    });

    return new Zombie(options);
};
