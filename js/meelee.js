var image = new Image();
//image.src = './img/batswing.png';
image.src = './img/baseballbat.png';

var Meelee = function(options) {

    var start = Date.now();

    var meelee = {
        power: options.power,
        onTop: true,
        geometry: 'circle',
        type: 'meelee',
        visible: true,
        radius: 100,
        img: image,
        pos: {
            x: options.parent.pos.x + Math.cos(options.rot) * 50,
            y: options.parent.pos.y + Math.sin(options.rot) * 50,
            rot: options.rot
        },
        step: function() {
            if (this.die || Date.now() - 250 > start) return false;

            this.pos.x = options.parent.pos.x + Math.cos(this.pos.rot) * 50;
            this.pos.y = options.parent.pos.y + Math.sin(this.pos.rot) * 50;
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
            meelee: function() {

            },
            goal: function() {},
            weapon: function() {},
            activation: function() {}

        }
    };

    return meelee;

};

module.exports = Meelee;
