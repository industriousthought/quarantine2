var image = new Image();
image.src = './img/bullet.png';

var Bullet = function(options) {

    var bullet = {
        geometry: 'circle',
        type: 'bullet',
        visible: true,
        radius: 10,
        img: image,
        velocity: 30,
        pos: {
            x: options.x,
            y: options.y,
            rot: options.rot
        },
        step: function() {
            if (this.die) return false;
            this.pos.x += Math.cos(this.pos.rot) * this.velocity;
            this.pos.y += Math.sin(this.pos.rot) * this.velocity;
            return true;
        },
        collision: {
            zombie: function() {
                this.die = true;
            },
            human: function() {

            },
            bullet: function() {

            },
            block: function() {
                this.die = true;
            },
            goal: function() {}
        }
    };

    return bullet;

};

module.exports = Bullet;
