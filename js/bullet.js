var image = new Image();
image.src = './img/bullet.png';

var Bullet = function(options) {

    /*
    image.onload = function() { 
        bullet.width = image.width;
        bullet.height = image.height;
        console.log('bullet image loaded');
    };
    */

    var range = options.range;
    var velocity = options.velocity;

    var distance = 0;

    var bullet = {
        onTop: true,
        power: options.power,
        geometry: 'circle',
        type: 'bullet',
        visible: true,
        radius: 10,
        width: 50,
        height: 50,
        img: image,
        pos: {
            x: options.x,
            y: options.y,
            rot: options.rot
        },
        step: function() {
            if (this.die || distance > range) return false;
            distance++;
            this.pos.x += Math.cos(this.pos.rot) * velocity;
            this.pos.y += Math.sin(this.pos.rot) * velocity;
            return true;
        },
        collision: {
            zombie: function() {
                this.die = true;
            },
            meelee: function() {

            },
            human: function() {

            },
            bullet: function() {

            },
            block: function() {
                this.die = true;
            },
            goal: function() {},
            weapon: function() {},
            activation: function() {}

        }
    };


    return bullet;

};

module.exports = Bullet;
