var Character = require('./character.js');
var Weapons = require('./weapons.js');


module.exports = function(options) {


    var Player = Character({
        currentWeapon: 'pistol',
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
                var tick = Weapons[this.currentWeapon].reload - 1;
                this.addEffect(function() {
                    if (this.mode !== 'shooting') return false;
                    tick++;
                    if (tick > Weapons[this.currentWeapon].reload) { 
                        Weapons[this.currentWeapon].fire.call(this);
                        Weapons.update(this);
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
            meelee: function() {},
            bullet: function() {

            },
            goal: function() {

            },
            weapon: function(weapon) {
                Weapons[weapon.name].ammo += Weapons[weapon.name].pickupAmmo;
                Weapons.update(this);
            }
        }
    });

    var player = Player(options);
    options.controller.controlling = player;
    player.addEffect(options.controller.responseEffect);
    player.nextWeapon = function() {
        player.currentWeapon = Weapons[player.currentWeapon].next;
        if (!Weapons[player.currentWeapon].ammo) player.nextWeapon();
        Weapons.update(player);
    };
    Weapons.update(player);

    return player;
};
