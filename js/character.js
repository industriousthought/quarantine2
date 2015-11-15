module.exports = function(options) {
    var spriteMaps = options.sprites.map(function(path) { 
        var img = new Image();
        img.src = path;
        return img;
    });
    var mode = options.mode;
    var texMap = options.texMap;
    var modes = options.modes;
    var collision = options.collision;
    var type = options.type;
    var radius = options.radius;
    var renderer = options.renderer;
    var health = options.health;
    var target = options.target;
    var arsenal = options.arsenal;
    var currentWeapon = options.currentWeapon;
    var aniTick = 0;
    var effects = [];
    var newEffects = [];
    var img = spriteMaps[options.outerOptions.img];
    var character = {
        onTop: true,
        arsenal: arsenal,
        currentWeapon: currentWeapon,
        animate: true,
        visible: true,
        geometry: 'circle',
        target: target,
        id: options.outerOptions.img,
        step: function() {
            if (this.animate) {
                aniTick++;
                if (aniTick > 16 - this.velocity) {
                    aniTick = 0;
                    if (this.pose.x < texMap.slides[this.pose.y] - 1) {
                        this.pose.x++;
                    } else {
                        this.pose.x = 0;
                    }
                } else {
                    aniTick++;
                }
            }
            if (!this.controller) {
                this.pos.x += Math.cos(this.pos.rot) * this.velocity;
                this.pos.y += Math.sin(this.pos.rot) * this.velocity;
            }
            effects = effects.filter((function(item) { return item.call(this); }).bind(this));
            effects = effects.concat(newEffects);
            newEffects = [];
            return !this.die;
        },
        pos: options.outerOptions.pos,
        img: img, 
        move: function(pos) {
            this.pos = pos;
        },
        texMap: texMap,
        addEffect: function(fn) {
            newEffects.push(fn);
        },
        addMode: function(mode) {
            this.mode = mode;
            modes[mode].call(character);
        },
        pose: {x: 0, y: 0},
        velocity: 0,
        mode: mode,
        type: type,
        collision: collision,
        radius: radius,
        renderer: renderer,
        health: health
    };
    character.addEffect(function() {
        this.addMode(this.mode);
        if (this.health) {
            this.addEffect(function() {
                if (this.health <= 0) {
                    this.addMode('dead');
                    return false;
                }
                return true;
            });
        }
        return false;
    });
    return character;
};

