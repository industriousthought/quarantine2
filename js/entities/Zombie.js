var Character = require('./character.js');
var Weapons = require('../weapons.js');

module.exports = function(options) {

    var zombie = Character({
        outerOptions: options,
        target: undefined,
        renderer: options.renderer,
        health: 100,
        radius: 50,
        type: 'zombie',
        sprites: ['./img/zombie1.png', './img/zombie2.png', './img/zombie3.png'],
        texMap: {
            x: 6,
            y: 4,
            slides: [6, 5, 3, 3]
        },
        mode: 'wandering',
        modes: {
            wandering: function() {
                //console.log('wandering');
                if (Math.random() < 0.05) this.audio = 'growl';
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
                //console.log('searching');
                var goal = {
                    target: this,
                    pos: {
                        x: this.target.pos.x,
                        y: this.target.pos.y
                    },
                    visible: false,
                    geometry: 'circle',
                    radius: 50,
                    type: 'goal',
                    collision: {
                        human: function() {},
                        bullet: function() {},
                        block: function() {},
                        goal: function() {},
                        meelee: function() {},
                        zombie: function(zombie) {
                            console.log('goal hit');
                            if (zombie === this.target) {
                                console.log('zombie match');
                                this.die = true;
                            }
                        }
                    },
                    step: function() {
                        if (!this.die) return true;
                        return false
                    }

                }
                this.renderer.newItems.push(goal);
                this.target = undefined;
                window.g = goal;
            },
            chasing: function() {
                //console.log('chasing');
                this.pose.y = 1;
                this.velocity = 3;
                this.addEffect(function() {
                    if (this.mode !== 'chasing') return false;
                    this.pos.rot = Math.atan2( this.target.pos.y - this.pos.y, this.target.pos.x - this.pos.x);
                    return true;
                });

            },
            running: function() {
            },
            biting: function() {
            },
            staggering: function() {
            },
            dead: function() {
                var drop = Math.floor(Math.random() * 10);
                if (drop <= 2) this.renderer.newItems.push(Weapons.pistol.drop(this, 'pistol'));
                if (drop === 3) this.renderer.newItems.push(Weapons.shotgun.drop(this, 'shotgun'));
                if (drop === 4) this.renderer.newItems.push(Weapons.rifle.drop(this, 'rifle'));
                var start = Date.now();
                this.pose.y = 3;
                this.velocity = 0;
                this.geometry = 'none';
                this.onTop = false;
                this.addEffect(function() {
                    if (this.pose.x === 2) {
                        this.animate = false;
                        return false;
                    }
                    return true;
                });
                this.addEffect(function() {
                    if (Date.now() - start > 5000) this.die = true;
                    return true;
                });
            }
        },
        collision: {
            human: function() {
            },
            zombie: function(zombie) {
                var x = this.pos.x - zombie.pos.x;
                var y = this.pos.y - zombie.pos.y;
                var start = Date.now();

                this.addEffect(function() {
                    var elapsed = Date.now() - start;
                    if (elapsed > 50) return false;
                    this.pos.x -= (100 - x) / 30;
                    this.pos.y -= (100 - y) / 30;
                    return true;
                });
            },
            bullet: function(bullet) {
                var x = Math.cos(bullet.pos.rot) * 30;
                var y = Math.sin(bullet.pos.rot) * 30;
                var start = Date.now();
                this.health -= bullet.power;

                this.addEffect(function() {
                    var elapsed = Date.now() - start;
                    if (elapsed > 75) return false;
                    this.pos.x += x;
                    this.pos.y += y;
                    return true;
                });
            },
            meelee: function(meelee) {
                var x = Math.cos(meelee.pos.rot) * 30;
                var y = Math.sin(meelee.pos.rot) * 30;
                var start = Date.now();
                this.health -= meelee.power;

                this.addEffect(function() {
                    var elapsed = Date.now() - start;
                    if (elapsed > 75) return false;
                    this.pos.x += x;
                    this.pos.y += y;
                    return true;
                });
            },
            goal: function(block) {
                if (block.target === this) {
                    this.target = undefined;
                    this.addMode('wandering');
                }
            },
            weapon: function() {}
        }
    });

    return zombie;
};
