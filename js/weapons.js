var Bullet = require('./bullet.js');
var Meelee = require('./meelee.js');
var pistolImg = new Image();
pistolImg.src = './img/pistol.png';
var machineImg = new Image();
machineImg.src = './img/machinegun.png';
var shotgunImg = new Image();
shotgunImg.src = './img/shotgun.png';
var baseballImg = new Image();
baseballImg.src = './img/baseballbat.png';

var weaponStats = {
    ammo: document.getElementById('ammo'),
    baseballBat: document.getElementById('baseballbat'),
    pistol: document.getElementById('pistol'),
    shotgun: document.getElementById('shotgun'),
    rifle: document.getElementById('rifle')
}




var drop = function(dropper, weapon) {
    var start = Date.now();
    return {
        onTop: true,
        name: weapons[weapon].name,
        img: weapons[weapon].img,
        pos: {
            x: dropper.pos.x,
            y: dropper.pos.y,
            rot: 0
        },
        visible: true,
        geometry: 'circle',
        radius: 50,
        type: 'weapon',
        collision: {
            human: function() {
                this.die = true;
            },
            bullet: function() {},
            block: function() {},
            goal: function() {},
            meelee: function() {},
            zombie: function(zombie) {},
            weapon: function() {}
        },
        step: function() {
            if (Date.now() - start > 20000) return false;
            this.pos.rot += .05;
            if (!this.die) return true;
            return false;
        }
    }
};


var weapons = {
    baseballBat: {
        ammo: 1,
        reload: 10,
        type: 'meelee',
        name: 'baseballBat',
        fire: function() {
            this.renderer.newItems.push(Meelee({name: 'bat', parent: this, x: this.pos.x, y: this.pos.y, rot: this.pos.rot, power: 10}));
            this.audio = 'bat';
        },
        next: 'pistol'
    },
    pistol: {
        fire: function() {
            this.renderer.newItems.push(Bullet({name: 'pistol', x: this.pos.x, y: this.pos.y, rot: this.pos.rot, velocity: 30, range: 50, power: 20}));
            this.audio = 'pistol';
            weapons[this.currentWeapon].ammo--;
        },
        img: pistolImg,
        ammo: 20,
        pickupAmmo: 20,
        power: 20,
        range: 4000,
        reload: 10,
        type: 'projectile',
        name: 'pistol',
        fail: 'baseballBat',
        drop: drop,
        next: 'shotgun'
    },
    shotgun: {
        img: shotgunImg,
        fire: function() {
            var deviation, i;
            for (i = 0; i < 5; i++) {
                deviation = (Math.random() - 0.5) / 3;
                this.renderer.newItems.push(Bullet({name: 'shotgun', x: this.pos.x, y: this.pos.y, rot: this.pos.rot + deviation, velocity: 20, range: 30, power: 7}));
            }
            weapons[this.currentWeapon].ammo--;
            this.audio = 'shotgun';
        },
        ammo: 10,
        pickupAmmo: 20,
        power: 5,
        range: 1500,
        reload: 40,
        type: 'projectile',
        name: 'shotgun',
        fail: 'pistol',
        drop: drop,
        next: 'rifle'

    },
    rifle: {
        img: machineImg,
        fire: function() {
            this.renderer.newItems.push(Bullet({name: 'rifle', x: this.pos.x, y: this.pos.y, rot: this.pos.rot, velocity: 50, range: 80, power: 30}));
            weapons[this.currentWeapon].ammo--;
            this.audio = 'rifle';
        },
        ammo: 20,
        pickupAmmo: 20,
        power: 25,
        range: 4000,
        reload: 5,
        type: 'projectile',
        fail: 'shotgun',
        name: 'rifle',
        drop: drop,
        next: 'baseballBat'

    },
    update: function(player) {
        var weapon = weapons[player.currentWeapon];
        var i;
        for (i in weapons) {
            if (weapons[i].ammo) {
                weaponStats[i].style.border = '';
                weaponStats[i].style.display = 'inherit';
            } else {
                if (weaponStats[i]) weaponStats[i].style.display = '';
            }

        }

        weaponStats[player.currentWeapon].style.border = '1px solid white';

        if (weapon.name !== 'baseballBat') {
            weaponStats.ammo.innerText = weapon.ammo;
        } else {
            weaponStats.ammo.innerText = '';
        }
        if (!weapon.ammo) {
            player.currentWeapon = weapon.fail;
            weapons.update(player);
        }

    }
};

module.exports = weapons;
