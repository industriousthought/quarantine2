(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
(function() {
    var lastTime = 0;
    var vendors = ['ms', 'moz', 'webkit', 'o'];
    for(var x = 0; x < vendors.length && !window.requestAnimationFrame; ++x) {
        window.requestAnimationFrame = window[vendors[x]+'RequestAnimationFrame'];
        window.cancelAnimationFrame = window[vendors[x]+'CancelAnimationFrame'] 
            || window[vendors[x]+'CancelRequestAnimationFrame'];
    }

    if (!window.requestAnimationFrame)
        window.requestAnimationFrame = function(callback, element) {
            var currTime = new Date().getTime();
            var timeToCall = Math.max(0, 16 - (currTime - lastTime));
            var id = window.setTimeout(function() { callback(currTime + timeToCall); }, 
                                       timeToCall);
                                       lastTime = currTime + timeToCall;
                                       return id;
        };

        if (!window.cancelAnimationFrame)
            window.cancelAnimationFrame = function(id) {
                clearTimeout(id);
            };
}());

},{}],2:[function(require,module,exports){
window.AudioContext = window.AudioContext||window.webkitAudioContext;
var context = new AudioContext();

/*panner.panningModel = 'HRTF';
panner.distanceModel = 'inverse';
panner.refDistance = 1;
panner.maxDistance = 10000;
panner.rolloffFactor = 1;
panner.coneInnerAngle = 360;
panner.coneOuterAngle = 0;
panner.coneOuterGain = 0;*/

var loaded = 0;

var onError = function() {
    console.log('Audio failed to load.');
};

var sounds = [
    './audio/pistol.mp3',
    './audio/shotgun.mp3',
    './audio/machinegun.mp3',
    './audio/bat.mp3',
    './audio/zombiegrowl.mp3'
];

var i;

var done = function() {
};

for (i = 0; i < sounds.length; i++) {
    (function(i) {
        var request = new XMLHttpRequest();
        request.open('GET', sounds[i], true);
        request.responseType = 'arraybuffer';

        //Decode asynchronously
        request.onload = function() {
            context.decodeAudioData(request.response, function(buffer) {
                sounds[i] = buffer;
                loaded++;
                if (loaded === sounds.length) done();
            }, onError);
        }
        request.send();
    })(i)
}

var localSound = function(i) {
    var source = context.createBufferSource(); // creates a sound source
    source.buffer = sounds[i];                    // tell the source which sound to play
    source.connect(context.destination);       // connect the source to the context's destination (the speakers)
    source.playbackRate.value = 0.9 + Math.random() / 5;
    source.start(Math.random() * 2);
};

distantSound = function(pos, i) {
    var panner = context.createPanner();
    panner.setPosition(pos.x / 150, 0, pos.y / 150);
    var source = context.createBufferSource(); // creates a sound source
    source.buffer = sounds[i];                    // tell the source which sound to play
    source.connect(panner);
    panner.connect(context.destination);       // connect the source to the context's destination (the speakers)
    source.playbackRate.value = 0.9 + Math.random() / 5;
    source.start(Math.random() * 2);
};

var events = {
    human: {
        bat: function() {
            localSound(3);
        },
        shotgun: function() {
            localSound(1);
        },
        rifle: function() {
            localSound(2);
        },
        pistol: function() {
            localSound(0);
        }
    },
    zombie: {
        growl: function(pos) {
            distantSound(pos, 4);
        }
    },
    updatePov: function(pov) {
        context.listener.setPosition(pov.x / 150, 0, pov.y / 150);
        context.listener.setOrientation(Math.cos(pov.rot), 0, Math.sin(pov.rot), 0, 1, 0);
    }
};

module.exports = events;

},{}],3:[function(require,module,exports){
var Background = function(options) {

    var image = new Image();
    image.src = options.path;

    var tile = {
        type: 'tile',
        visible: true,
        img: image,
        pos: {
            x: options.pos.x,
            y: options.pos.y,
            rot: 0
        },
        step: function() {
            return true;
        },

    };

    return tile;
};

module.exports = Background;

},{}],4:[function(require,module,exports){
var lineIntersect = function(a,b,c,d,p,q,r,s) {
    var det, gamma, lambda;
    det = (c - a) * (s - q) - (r - p) * (d - b);
    if (det === 0) {
        return false;
    } else {
        lambda = ((s - q) * (r - a) + (p - r) * (s - b)) / det;
        gamma = ((b - d) * (r - a) + (c - a) * (s - b)) / det;
        return (0 < lambda && lambda < 1) && (0 < gamma && gamma < 1);
    }
};

var polyIntersect = function(verts, point1, point2) {
    var j = verts.length - 1;
    return verts.reduce(function(prev, curr, index, array) {
        if (prev) return true;
        if (lineIntersect(point1.x, point1.y, point2.x, point2.y, curr.x, curr.y, array[j].x, array[j].y)) return true;
        j = index;
    }, false);

};

var perpPoint = function(v, p) {
    var k = ((v[1].y - v[0].y) * (p.x - v[0].x) - (v[1].x - v[0].x) * (p.y - v[0].y)) / (Math.pow(v[1].y - v[0].y, 2) + Math.pow(v[1].x - v[0].x, 2))
    return {x: p.x - k * (v[1].y - v[0].y), y: p.y + k * (v[1].x - v[0].x)};
};

var closestVertices = function(vertices, point) {
    var output = [];
    var i, dis, x, y, j;
    for (i = 0; i < vertices.length; i++) {
        x = point.x - vertices[i].x;
        y = point.y - vertices[i].y;
        dis = Math.sqrt(Math.pow(x, 2) + Math.pow(y, 2));
        output.push({x: vertices[i].x, y: vertices[i].y, dis: dis});

    }

    return output.sort(function(a, b) {
        return a.dis - b.dis;
    }).slice(0, 2);

};

var pointInPolygon = function(vertices, point) {
    var c = false;
    var i, j;

    j = vertices.length - 1;

    for (i = 0; i < vertices.length; i++) {

        if ( ((vertices[i].y > point.y) !== (vertices[j].y > point.y)) &&
        (point.x < (vertices[j].x - vertices[i].x) * (point.y - vertices[i].y) / (vertices[j].y - vertices[i].y) + vertices[i].x) ) {
            c = !c;
        }

        j = i;
    }

    return c;
};

var Block = function(options) {

    var i;
    var image = new Image();
    image.src = options.path;

    var verts = [
        {x: options.pos.x - options.width / 2, y: options.pos.y - options.height / 2}, 
        {x: options.pos.x + options.width / 2, y: options.pos.y - options.height / 2}, 
        {x: options.pos.x + options.width / 2, y: options.pos.y + options.height / 2}, 
        {x: options.pos.x - options.width / 2, y: options.pos.y + options.height / 2}, 
    ];

    var rot = options.pos.rot;
    var vx, vy, ox, oy;
    ox = options.pos.x;
    oy = options.pos.y;

    for (i = 0; i < verts.length; i++) {
        vx = verts[i].x;
        vy = verts[i].y;
        verts[i].x = Math.cos(rot) * (vx - ox) - Math.sin(rot) * (vy - oy) + ox;
        verts[i].y = Math.sin(rot) * (vx - ox) + Math.cos(rot) * (vy - oy) + oy;
    }

    var block = {
        geometry: 'block',
        type: 'block',
        visible: true,
        img: image,
        pos: options.pos,
        width: options.width,
        height: options.height,
        vertices: verts,
        testPoint: function(point) {
            var result = false;
            if (pointInPolygon(verts, point)) {
                result = perpPoint(closestVertices(verts, point), point);
            }
            return result;
        },
        collision: {},
        step: function() {
            return true;
        },
        oclude: function(point1, point2) {
            return polyIntersect(verts, point1, point2);
        }
    };

    return block;
};

module.exports = Block;


},{}],5:[function(require,module,exports){
var image = new Image();
image.src = './img/bullet.png';

var Bullet = function(options) {

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
            human: function() {

            },
            bullet: function() {

            },
            block: function() {
                this.die = true;
            },
            goal: function() {},
            weapon: function() {}

        }
    };

    return bullet;

};

module.exports = Bullet;

},{}],6:[function(require,module,exports){
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
    return function(options) {
        var aniTick = 0;
        var effects = [];
        var newEffects = [];
        var img = spriteMaps[options.img];
        var character = {
            onTop: true,
            arsenal: arsenal,
            currentWeapon: currentWeapon,
            animate: true,
            visible: true,
            geometry: 'circle',
            target: target,
            id: options.img,
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
            pos: options.pos,
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
};


},{}],7:[function(require,module,exports){
var collision = function(world) {
    world.forEach(function(collider, index, array) {
        array.slice(index + 1).forEach(function(collidee) {
            var x, y, dis, radius, ang, zombie, human, ang2, block, circle, point, oclude;
            if (collider.collision && collidee.collision) {
                if (collider.geometry === 'circle' && collidee.geometry === 'circle') {
                    x = collider.pos.x - collidee.pos.x;
                    y = collider.pos.y - collidee.pos.y;
                    dis = Math.sqrt(Math.pow(x, 2) + Math.pow(y, 2));
                    radius = collider.radius + collidee.radius;

                    if ((collider.type === 'zombie' && collidee.type === 'human') || (collidee.type === 'zombie' && collider.type === 'human')) {
                        if (collider.type === 'zombie') {
                            zombie = collider;
                            human = collidee;
                        } else {
                            zombie = collidee;
                            human = collider;
                        }

                        oclude = world.filter(function(curr) {
                            if (curr.type === 'block') return true;
                            return false;
                        }).reduce(function(prev, curr) { 
                            if (prev) return true;
                            return curr.oclude(collider.pos, collidee.pos);
                        }, false);

                        if (zombie.target === human && oclude && dis > 1000) {
                            zombie.addMode('searching');
                        } else {
                        
                            ang2 = Math.abs(Math.atan2(human.pos.y - zombie.pos.y, human.pos.x - zombie.pos.x));

                            ang =  zombie.pos.rot - ang2;
                            if (!oclude && (Math.abs(ang) < Math.PI * 0.45 || dis < 500)) {
                                zombie.addMode('chasing');
                                zombie.target = human;
                            }
                        }
                    }

                    if (dis < radius) {
                        collider.collision[collidee.type].call(collider, collidee);
                        collidee.collision[collider.type].call(collidee, collider);

                    }
                }

                if ((collider.geometry === 'block' && collidee.geometry === 'circle') || (collider.geometry === 'circle' && collidee.geometry === 'block')) {
                    if (collider.geometry === 'block') {
                        block = collider;
                        circle = collidee;
                    }
                    if (collidee.geometry === 'block') {
                        block = collidee;
                        circle = collider;
                    }

                    if (circle.type !== 'goal') {
                        point = block.testPoint(circle.pos);
                        if (point) {
                            if (circle.type === 'bullet') circle.die = true;
                            if (circle.type === 'activation' || block.type === 'door') block.collision.activation();
                            circle.pos.x = point.x;
                            circle.pos.y = point.y;
                        }
                    }

                }
            }
        });
    });
};

module.exports = collision;

},{}],8:[function(require,module,exports){
var Tile = require('./background.js');
var Zombie = require('./zombie.js');
var Block = require('./block.js');

var level = function(options) {
    var renderer = options.renderer;
    var world = options.world;
    var player = options.player;
    var i, j;
    for (i = 0; i < 10; i++) {
        for (j = 0; j < 10; j++) {
            world.push(Tile({pos: {x: i * 512, y: j * 512}, path: './img/background.jpg'}));
        }
    }

    for (i = 0; i < 57; i++) {
        world.push(Block({path: './img/wall.png', pos: {x: i * 90 - 200, y: -200, rot: 0}, width: 100, height: 100}));
    }
    for (i = 0; i < 57; i++) {
        world.push(Block({path: './img/wall.png', pos: {x: i * 90 - 200, y: 4800, rot: 0}, width: 100, height: 100}));
    }
    for (i = 0; i < 57; i++) {
        world.push(Block({path: './img/wall.png', pos: {x: -200, y: i * 90 - 200, rot: 0}, width: 100, height: 100}));
    }

    for (i = 0; i < 57; i++) {
        world.push(Block({path: './img/wall.png', pos: {x: 4800, y: i * 90 - 200, rot: 0}, width: 100, height: 100}));
    }

    world.push(Block({path: './img/car1.png', pos: {x: 300, y: 300, rot: 2}, width: 200, height: 300}));
    world.push(Block({path: './img/car2.png', pos: {x: 800, y: 300, rot: 0}, width: 200, height: 300}));
    world.push(Block({path: './img/car3.png', pos: {x: 1100, y: 300, rot: 0}, width: 200, height: 300}));
    world.push(Block({path: './img/car2.png', pos: {x: 1500, y: 300, rot: 0}, width: 200, height: 300}));
    world.push(Block({path: './img/car1.png', pos: {x: 1900, y: 300, rot: 0}, width: 200, height: 300}));
    world.push(Block({path: './img/car3.png', pos: {x: 300, y: 800, rot: 0}, width: 200, height: 300}));
    world.push(Block({path: './img/car1.png', pos: {x: 300, y: 1100, rot: 0}, width: 200, height: 300}));

    world.push(Zombie({renderer: renderer, img: 2, pos: {x: 1900, y: 1700, rot: 0}}));
    world.push(Zombie({renderer: renderer, img: 0, pos: {x: 3400, y: 1700, rot: 0}}));
    //world.push(Zombie({renderer: renderer, img: 2, pos: {x: 1900, y: 2400, rot: 0}}));
    //world.push(Zombie({renderer: renderer, img: 1, pos: {x: 3700, y: 1700, rot: 0}}));
    //world.push(Zombie({renderer: renderer, img: 2, pos: {x: 1500, y: 2300, rot: 0}}));
    //world.push(Zombie({renderer: renderer, img: 0, pos: {x: 3900, y: 1200, rot: 0}}));

    world.push(player);

    var tick = 0;

    return function(world) {
        if (tick > 200) {
            tick = 0;
            world.push(Zombie({renderer: renderer, img: 2, pos: {x: 3500, y: 3500, rot: 0}}));
            tick = 0;
        }
        tick++;

    };
};


module.exports = level;

},{"./background.js":3,"./block.js":4,"./zombie.js":15}],9:[function(require,module,exports){
require('./animationShim.js');
var renderer = require('./renderer.js');
var Player = require('./player.js');
var wasd = require('./wasd.js');
var level = require('./level.js');

var world = [];

window.onload = function() {
    window.ondragstart = function() { return false; };
    var stats = document.getElementById('stats');
    var newGame = document.getElementById('newgame');
    var canvas = document.getElementById('gameView');
    var opening = document.getElementById('opening');
    new Array().slice.call(document.getElementsByClassName('weapon')).forEach(function(item) {
        item.width = 100;
    });
    var startGame = function() {
        newGame.removeEventListener('click',  startGame);
        world = [];
        var player = Player({controller: wasd, renderer: renderer, img: 0, pos: {x: 0, y: 0, rot: 0}});
        renderer.init({level: level({player: player, world: world, renderer: renderer}), canvas: 'gameView', world: world, pov: player});

        canvas.style.opacity = 1;
        opening.style.opacity = 0;
        renderer.start();
        wasd.start();
    };

    splash.width = window.innerWidth;
    splash.style.top = ((window.innerHeight - splash.height) / 2) + 'px';
    newGame.style.top = ((window.innerHeight / 2) ) + 'px';
    newGame.style.left = ((window.innerWidth / 2) -  newGame.width / 2 ) + 'px';
    splash.style.opacity = 1;
    newGame.style.opacity = 0.5;
    canvas.setAttribute('width', 4500);//splash.width);
    canvas.setAttribute('height', 2100);//splash.height);
    canvas.style.width = splash.width + 'px';
    canvas.style.height = splash.height + 'px';
    canvas.style.top = ((window.innerHeight - splash.height) / 2) + 'px';
    stats.style.top = canvas.style.top;

    window.gameOver = function() {
        wasd.stop();
        var t = setTimeout(function() {
            opening.style.opacity = 1;
            newGame.style.opacity = 0.5;
            canvas.style.opacity = 0;
            newGame.addEventListener('click',  startGame);
            var t = setTimeout(function() {
                renderer.stop();
            }, 500);

        }, 500);

    }
    newGame.addEventListener('click',  startGame);
    newGame.addEventListener('mouseout',  function(e) {
        newGame.style.opacity = .5;
    });
    newGame.addEventListener('mouseover',  function(e) {
        newGame.style.opacity = .75;
    });
};



//renderer.step();
//renderer.step();




},{"./animationShim.js":1,"./level.js":8,"./player.js":11,"./renderer.js":12,"./wasd.js":13}],10:[function(require,module,exports){
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
            x: options.x,
            y: options.y,
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
            weapon: function() {}

        }
    };

    return meelee;

};

module.exports = Meelee;

},{}],11:[function(require,module,exports){
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

},{"./character.js":6,"./weapons.js":14}],12:[function(require,module,exports){
var collision = require('./collision.js');
var audio = require('./audio.js');

var step = function() {

    renderer.newItems = [];
    renderer.level(renderer.world);
    collision(renderer.world);
    audio.updatePov(pov.pos);
    renderer.world.sort(function(a, b) {
        return a.onTop;
    });

    renderer.canvas.width = renderer.canvas.width;
    renderer.world = renderer.world.filter(function(item) { 
        var width, height, sx, sy, i;
        if (item.audio) {
            audio[item.type][item.audio](item.pos);
            item.audio = null;
        }
        if (item.visible) {
            if (item.pos.rot > Math.PI * 2) item.pos.rot -= Math.PI * 2;
            if (item.pos.rot < 0) item.pos.rot += Math.PI * 2;
            if (item.texMap) {
                width = item.img.width / item.texMap.x;
                height = item.img.height / item.texMap.y;
                sx = width * item.pose.x;
                sy = height * item.pose.y;
            } else {
                width = item.img.width;
                height = item.img.height;
                sx = 0;
                sy = 0;
            }
            var ctx = renderer.canvas.getContext('2d');
            var pos = {};
            pos.x = 2250 + (item.pos.x - pov.pos.x) - width / 2;
            pos.y = 1900 + (item.pos.y - pov.pos.y) - height / 2;
            ctx.save(); 

            ctx.translate(2250 , 1900 );
            ctx.rotate(- pov.pos.rot - Math.PI / 2);
            ctx.translate( - (2250 ), - (1900 ));
            ctx.translate( pos.x + width / 2, pos.y + height / 2);
            ctx.rotate( item.pos.rot );
            ctx.drawImage(item.img, sx, sy, width, height, - width / 2, - height / 2, width, height);

            ctx.restore(); 
        }
        return item.step.call(item); 
    });
    renderer.world = renderer.world.concat(renderer.newItems);

};
var playing = false;
var pov;
var renderer = {
    init: function(options) {
        renderer.level = options.level;
        renderer.world = options.world;
        renderer.canvas = document.getElementById(options.canvas);
        pov = options.pov;
    },
    start: function() {
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
    newItems: []
};


module.exports = renderer;

},{"./audio.js":2,"./collision.js":7}],13:[function(require,module,exports){
window.keysPressed = [];
var switchWeapon;

var wasd = {
    x: 0,
    responseEffect: function() {
        if (this.running) {
            this.velocity = 12;
        } else {
            this.velocity = 8;
        }
        if (this.left || this.right) this.velocity *= 0.8;
        if (!this.left && !this.right && !this.up && !this.down) {
            this.animate = false;
        } else {
            this.animate = true;
        }

        if (this.up) { 
            this.pos.x += Math.cos(this.pos.rot) * this.velocity;
            this.pos.y += Math.sin(this.pos.rot) * this.velocity;
        } else {
            this.velocity = 0;
        }
        if (this.left) { 
            this.pos.x += Math.cos(this.pos.rot - Math.PI / 2) * 4;
            this.pos.y += Math.sin(this.pos.rot - Math.PI / 2) * 4;
        }
        if (this.down) { 
            this.pos.x += Math.cos(this.pos.rot - Math.PI) * 4;
            this.pos.y += Math.sin(this.pos.rot - Math.PI) * 4;
        }
        if (this.right) { 
            this.pos.x += Math.cos(this.pos.rot - Math.PI * 1.5) * 4;
            this.pos.y += Math.sin(this.pos.rot - Math.PI * 1.5) * 4;
        }
        if (switchWeapon) {
            console.log('ttab');
            switchWeapon = false;
            this.nextWeapon();
        }
        return true;
    },
    rightClick: function(e) {
        e = e || window.event;
        if (e.which === 3 || e.button === 2) {
            wasd.x = e.clientX;
            window.addEventListener('mousemove', wasd.followMouse);
            window.addEventListener('mouseup', wasd.rightUp);
        }
    },
    leftClick: function(e) {
        if (e.which === 1 || e.button === 1) {
            wasd.controlling.addMode('shooting');
            window.addEventListener('mouseup', wasd.leftUp);
        }
    },
    followMouse: function(e) {
        e = e || window.event;
        wasd.controlling.pos.rot += (e.clientX - wasd.x) / 150;
        wasd.x = e.clientX;
    },
    rightUp: function(e) {
        e = e || window.event;
        if (e.which === 3 || e.button === 2) {
            window.removeEventListener('mousemove', wasd.followMouse);
            window.removeEventListener('mouseup', wasd.rightUp);
        }
    },
    leftUp: function(e) {
        if (e.which === 1 || e.button === 1) {
            window.removeEventListener('mouseup', wasd.leftUp);
            wasd.controlling.addMode('standing');
        }
    },
    keyPress: function(e) {
        if (e.keyCode === 9) {
            e.preventDefault();
            switchWeapon = true;
        }

    },

    keyDown: function(e) {
        if (keysPressed.indexOf(e.keyCode) === -1) {
            keysPressed.push(e.keyCode)
            switch (e.keyCode) {
                case 16:
                    wasd.controlling.running = true;
                    break;
                case 87: 
                    wasd.controlling.up = true;
                    wasd.controlling.down = false;
                    break;
                case 65: 
                    wasd.controlling.left = true;
                    wasd.controlling.right = false;
                    break;
                case 83: 
                    wasd.controlling.down = true;
                    wasd.controlling.up = false;
                    break;
                case 68: 
                    wasd.controlling.right = true;
                    wasd.controlling.left = false;
                    break;
            }
        }
    },
    keyUp: function(e) {
        keysPressed.splice(keysPressed.indexOf(e.keyCode), 1);
        switch (e.keyCode) {
            case 16:
                wasd.controlling.running = false;
                break;
            case 87: 
                wasd.controlling.up = false;
                if (keysPressed.indexOf(83) !== -1) wasd.controlling.down = true;
                break;
            case 65: 
                wasd.controlling.left = false;
                if (keysPressed.indexOf(68) !== -1) wasd.controlling.right = true;
                break;
            case 83: 
                wasd.controlling.down = false;
                if (keysPressed.indexOf(87) !== -1) wasd.controlling.up = true;
                break;
            case 68: 
                wasd.controlling.right = false;
                if (keysPressed.indexOf(65) !== -1) wasd.controlling.left = true;
                break;
        }

    },
    start: function() {
        window.addEventListener('mousedown', wasd.rightClick);
        window.addEventListener('mousedown', wasd.leftClick);

        window.addEventListener('keydown', wasd.keyDown);
        window.addEventListener('keydown', wasd.keyPress);

        window.addEventListener('keyup', wasd.keyUp);

    },
    stop: function() {
        window.removeEventListener('mousedown', wasd.rightClick);
        window.removeEventListener('mousedown', wasd.leftClick);

        window.removeEventListener('keydown', wasd.keyDown);
        window.removeEventListener('keydown', wasd.keyPress);

        window.removeEventListener('keyup', wasd.keyUp);

    },

    controlling: null

};

window.oncontextmenu = function(e) {
    e.preventDefault();
};


module.exports = wasd;

},{}],14:[function(require,module,exports){
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

},{"./bullet.js":5,"./meelee.js":10}],15:[function(require,module,exports){
var Character = require('./character.js');
var Weapons = require('./weapons.js');

module.exports = function(options) {

    var Zombie = Character({
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

    return Zombie(options);
};

},{"./character.js":6,"./weapons.js":14}]},{},[9])
//# sourceMappingURL=data:application/json;charset:utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uL3Vzci9sb2NhbC9saWIvbm9kZV9tb2R1bGVzL2Jyb3dzZXJpZnkvbm9kZV9tb2R1bGVzL2Jyb3dzZXItcGFjay9fcHJlbHVkZS5qcyIsImFuaW1hdGlvblNoaW0uanMiLCJhdWRpby5qcyIsImJhY2tncm91bmQuanMiLCJibG9jay5qcyIsImJ1bGxldC5qcyIsImNoYXJhY3Rlci5qcyIsImNvbGxpc2lvbi5qcyIsImxldmVsLmpzIiwibWFpbi5qcyIsIm1lZWxlZS5qcyIsInBsYXllci5qcyIsInJlbmRlcmVyLmpzIiwid2FzZC5qcyIsIndlYXBvbnMuanMiLCJ6b21iaWUuanMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7QUNBQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUN4QkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQy9GQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUN4QkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUN0SEE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDdERBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQzdGQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQzVFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQzdEQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUN4RUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUN2REE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ25GQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3JGQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNyS0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDL0pBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSIsImZpbGUiOiJnZW5lcmF0ZWQuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlc0NvbnRlbnQiOlsiKGZ1bmN0aW9uIGUodCxuLHIpe2Z1bmN0aW9uIHMobyx1KXtpZighbltvXSl7aWYoIXRbb10pe3ZhciBhPXR5cGVvZiByZXF1aXJlPT1cImZ1bmN0aW9uXCImJnJlcXVpcmU7aWYoIXUmJmEpcmV0dXJuIGEobywhMCk7aWYoaSlyZXR1cm4gaShvLCEwKTt2YXIgZj1uZXcgRXJyb3IoXCJDYW5ub3QgZmluZCBtb2R1bGUgJ1wiK28rXCInXCIpO3Rocm93IGYuY29kZT1cIk1PRFVMRV9OT1RfRk9VTkRcIixmfXZhciBsPW5bb109e2V4cG9ydHM6e319O3Rbb11bMF0uY2FsbChsLmV4cG9ydHMsZnVuY3Rpb24oZSl7dmFyIG49dFtvXVsxXVtlXTtyZXR1cm4gcyhuP246ZSl9LGwsbC5leHBvcnRzLGUsdCxuLHIpfXJldHVybiBuW29dLmV4cG9ydHN9dmFyIGk9dHlwZW9mIHJlcXVpcmU9PVwiZnVuY3Rpb25cIiYmcmVxdWlyZTtmb3IodmFyIG89MDtvPHIubGVuZ3RoO28rKylzKHJbb10pO3JldHVybiBzfSkiLCIoZnVuY3Rpb24oKSB7XG4gICAgdmFyIGxhc3RUaW1lID0gMDtcbiAgICB2YXIgdmVuZG9ycyA9IFsnbXMnLCAnbW96JywgJ3dlYmtpdCcsICdvJ107XG4gICAgZm9yKHZhciB4ID0gMDsgeCA8IHZlbmRvcnMubGVuZ3RoICYmICF3aW5kb3cucmVxdWVzdEFuaW1hdGlvbkZyYW1lOyArK3gpIHtcbiAgICAgICAgd2luZG93LnJlcXVlc3RBbmltYXRpb25GcmFtZSA9IHdpbmRvd1t2ZW5kb3JzW3hdKydSZXF1ZXN0QW5pbWF0aW9uRnJhbWUnXTtcbiAgICAgICAgd2luZG93LmNhbmNlbEFuaW1hdGlvbkZyYW1lID0gd2luZG93W3ZlbmRvcnNbeF0rJ0NhbmNlbEFuaW1hdGlvbkZyYW1lJ10gXG4gICAgICAgICAgICB8fCB3aW5kb3dbdmVuZG9yc1t4XSsnQ2FuY2VsUmVxdWVzdEFuaW1hdGlvbkZyYW1lJ107XG4gICAgfVxuXG4gICAgaWYgKCF3aW5kb3cucmVxdWVzdEFuaW1hdGlvbkZyYW1lKVxuICAgICAgICB3aW5kb3cucmVxdWVzdEFuaW1hdGlvbkZyYW1lID0gZnVuY3Rpb24oY2FsbGJhY2ssIGVsZW1lbnQpIHtcbiAgICAgICAgICAgIHZhciBjdXJyVGltZSA9IG5ldyBEYXRlKCkuZ2V0VGltZSgpO1xuICAgICAgICAgICAgdmFyIHRpbWVUb0NhbGwgPSBNYXRoLm1heCgwLCAxNiAtIChjdXJyVGltZSAtIGxhc3RUaW1lKSk7XG4gICAgICAgICAgICB2YXIgaWQgPSB3aW5kb3cuc2V0VGltZW91dChmdW5jdGlvbigpIHsgY2FsbGJhY2soY3VyclRpbWUgKyB0aW1lVG9DYWxsKTsgfSwgXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB0aW1lVG9DYWxsKTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGxhc3RUaW1lID0gY3VyclRpbWUgKyB0aW1lVG9DYWxsO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgcmV0dXJuIGlkO1xuICAgICAgICB9O1xuXG4gICAgICAgIGlmICghd2luZG93LmNhbmNlbEFuaW1hdGlvbkZyYW1lKVxuICAgICAgICAgICAgd2luZG93LmNhbmNlbEFuaW1hdGlvbkZyYW1lID0gZnVuY3Rpb24oaWQpIHtcbiAgICAgICAgICAgICAgICBjbGVhclRpbWVvdXQoaWQpO1xuICAgICAgICAgICAgfTtcbn0oKSk7XG4iLCJ3aW5kb3cuQXVkaW9Db250ZXh0ID0gd2luZG93LkF1ZGlvQ29udGV4dHx8d2luZG93LndlYmtpdEF1ZGlvQ29udGV4dDtcbnZhciBjb250ZXh0ID0gbmV3IEF1ZGlvQ29udGV4dCgpO1xuXG4vKnBhbm5lci5wYW5uaW5nTW9kZWwgPSAnSFJURic7XG5wYW5uZXIuZGlzdGFuY2VNb2RlbCA9ICdpbnZlcnNlJztcbnBhbm5lci5yZWZEaXN0YW5jZSA9IDE7XG5wYW5uZXIubWF4RGlzdGFuY2UgPSAxMDAwMDtcbnBhbm5lci5yb2xsb2ZmRmFjdG9yID0gMTtcbnBhbm5lci5jb25lSW5uZXJBbmdsZSA9IDM2MDtcbnBhbm5lci5jb25lT3V0ZXJBbmdsZSA9IDA7XG5wYW5uZXIuY29uZU91dGVyR2FpbiA9IDA7Ki9cblxudmFyIGxvYWRlZCA9IDA7XG5cbnZhciBvbkVycm9yID0gZnVuY3Rpb24oKSB7XG4gICAgY29uc29sZS5sb2coJ0F1ZGlvIGZhaWxlZCB0byBsb2FkLicpO1xufTtcblxudmFyIHNvdW5kcyA9IFtcbiAgICAnLi9hdWRpby9waXN0b2wubXAzJyxcbiAgICAnLi9hdWRpby9zaG90Z3VuLm1wMycsXG4gICAgJy4vYXVkaW8vbWFjaGluZWd1bi5tcDMnLFxuICAgICcuL2F1ZGlvL2JhdC5tcDMnLFxuICAgICcuL2F1ZGlvL3pvbWJpZWdyb3dsLm1wMydcbl07XG5cbnZhciBpO1xuXG52YXIgZG9uZSA9IGZ1bmN0aW9uKCkge1xufTtcblxuZm9yIChpID0gMDsgaSA8IHNvdW5kcy5sZW5ndGg7IGkrKykge1xuICAgIChmdW5jdGlvbihpKSB7XG4gICAgICAgIHZhciByZXF1ZXN0ID0gbmV3IFhNTEh0dHBSZXF1ZXN0KCk7XG4gICAgICAgIHJlcXVlc3Qub3BlbignR0VUJywgc291bmRzW2ldLCB0cnVlKTtcbiAgICAgICAgcmVxdWVzdC5yZXNwb25zZVR5cGUgPSAnYXJyYXlidWZmZXInO1xuXG4gICAgICAgIC8vRGVjb2RlIGFzeW5jaHJvbm91c2x5XG4gICAgICAgIHJlcXVlc3Qub25sb2FkID0gZnVuY3Rpb24oKSB7XG4gICAgICAgICAgICBjb250ZXh0LmRlY29kZUF1ZGlvRGF0YShyZXF1ZXN0LnJlc3BvbnNlLCBmdW5jdGlvbihidWZmZXIpIHtcbiAgICAgICAgICAgICAgICBzb3VuZHNbaV0gPSBidWZmZXI7XG4gICAgICAgICAgICAgICAgbG9hZGVkKys7XG4gICAgICAgICAgICAgICAgaWYgKGxvYWRlZCA9PT0gc291bmRzLmxlbmd0aCkgZG9uZSgpO1xuICAgICAgICAgICAgfSwgb25FcnJvcik7XG4gICAgICAgIH1cbiAgICAgICAgcmVxdWVzdC5zZW5kKCk7XG4gICAgfSkoaSlcbn1cblxudmFyIGxvY2FsU291bmQgPSBmdW5jdGlvbihpKSB7XG4gICAgdmFyIHNvdXJjZSA9IGNvbnRleHQuY3JlYXRlQnVmZmVyU291cmNlKCk7IC8vIGNyZWF0ZXMgYSBzb3VuZCBzb3VyY2VcbiAgICBzb3VyY2UuYnVmZmVyID0gc291bmRzW2ldOyAgICAgICAgICAgICAgICAgICAgLy8gdGVsbCB0aGUgc291cmNlIHdoaWNoIHNvdW5kIHRvIHBsYXlcbiAgICBzb3VyY2UuY29ubmVjdChjb250ZXh0LmRlc3RpbmF0aW9uKTsgICAgICAgLy8gY29ubmVjdCB0aGUgc291cmNlIHRvIHRoZSBjb250ZXh0J3MgZGVzdGluYXRpb24gKHRoZSBzcGVha2VycylcbiAgICBzb3VyY2UucGxheWJhY2tSYXRlLnZhbHVlID0gMC45ICsgTWF0aC5yYW5kb20oKSAvIDU7XG4gICAgc291cmNlLnN0YXJ0KE1hdGgucmFuZG9tKCkgKiAyKTtcbn07XG5cbmRpc3RhbnRTb3VuZCA9IGZ1bmN0aW9uKHBvcywgaSkge1xuICAgIHZhciBwYW5uZXIgPSBjb250ZXh0LmNyZWF0ZVBhbm5lcigpO1xuICAgIHBhbm5lci5zZXRQb3NpdGlvbihwb3MueCAvIDE1MCwgMCwgcG9zLnkgLyAxNTApO1xuICAgIHZhciBzb3VyY2UgPSBjb250ZXh0LmNyZWF0ZUJ1ZmZlclNvdXJjZSgpOyAvLyBjcmVhdGVzIGEgc291bmQgc291cmNlXG4gICAgc291cmNlLmJ1ZmZlciA9IHNvdW5kc1tpXTsgICAgICAgICAgICAgICAgICAgIC8vIHRlbGwgdGhlIHNvdXJjZSB3aGljaCBzb3VuZCB0byBwbGF5XG4gICAgc291cmNlLmNvbm5lY3QocGFubmVyKTtcbiAgICBwYW5uZXIuY29ubmVjdChjb250ZXh0LmRlc3RpbmF0aW9uKTsgICAgICAgLy8gY29ubmVjdCB0aGUgc291cmNlIHRvIHRoZSBjb250ZXh0J3MgZGVzdGluYXRpb24gKHRoZSBzcGVha2VycylcbiAgICBzb3VyY2UucGxheWJhY2tSYXRlLnZhbHVlID0gMC45ICsgTWF0aC5yYW5kb20oKSAvIDU7XG4gICAgc291cmNlLnN0YXJ0KE1hdGgucmFuZG9tKCkgKiAyKTtcbn07XG5cbnZhciBldmVudHMgPSB7XG4gICAgaHVtYW46IHtcbiAgICAgICAgYmF0OiBmdW5jdGlvbigpIHtcbiAgICAgICAgICAgIGxvY2FsU291bmQoMyk7XG4gICAgICAgIH0sXG4gICAgICAgIHNob3RndW46IGZ1bmN0aW9uKCkge1xuICAgICAgICAgICAgbG9jYWxTb3VuZCgxKTtcbiAgICAgICAgfSxcbiAgICAgICAgcmlmbGU6IGZ1bmN0aW9uKCkge1xuICAgICAgICAgICAgbG9jYWxTb3VuZCgyKTtcbiAgICAgICAgfSxcbiAgICAgICAgcGlzdG9sOiBmdW5jdGlvbigpIHtcbiAgICAgICAgICAgIGxvY2FsU291bmQoMCk7XG4gICAgICAgIH1cbiAgICB9LFxuICAgIHpvbWJpZToge1xuICAgICAgICBncm93bDogZnVuY3Rpb24ocG9zKSB7XG4gICAgICAgICAgICBkaXN0YW50U291bmQocG9zLCA0KTtcbiAgICAgICAgfVxuICAgIH0sXG4gICAgdXBkYXRlUG92OiBmdW5jdGlvbihwb3YpIHtcbiAgICAgICAgY29udGV4dC5saXN0ZW5lci5zZXRQb3NpdGlvbihwb3YueCAvIDE1MCwgMCwgcG92LnkgLyAxNTApO1xuICAgICAgICBjb250ZXh0Lmxpc3RlbmVyLnNldE9yaWVudGF0aW9uKE1hdGguY29zKHBvdi5yb3QpLCAwLCBNYXRoLnNpbihwb3Yucm90KSwgMCwgMSwgMCk7XG4gICAgfVxufTtcblxubW9kdWxlLmV4cG9ydHMgPSBldmVudHM7XG4iLCJ2YXIgQmFja2dyb3VuZCA9IGZ1bmN0aW9uKG9wdGlvbnMpIHtcblxuICAgIHZhciBpbWFnZSA9IG5ldyBJbWFnZSgpO1xuICAgIGltYWdlLnNyYyA9IG9wdGlvbnMucGF0aDtcblxuICAgIHZhciB0aWxlID0ge1xuICAgICAgICB0eXBlOiAndGlsZScsXG4gICAgICAgIHZpc2libGU6IHRydWUsXG4gICAgICAgIGltZzogaW1hZ2UsXG4gICAgICAgIHBvczoge1xuICAgICAgICAgICAgeDogb3B0aW9ucy5wb3MueCxcbiAgICAgICAgICAgIHk6IG9wdGlvbnMucG9zLnksXG4gICAgICAgICAgICByb3Q6IDBcbiAgICAgICAgfSxcbiAgICAgICAgc3RlcDogZnVuY3Rpb24oKSB7XG4gICAgICAgICAgICByZXR1cm4gdHJ1ZTtcbiAgICAgICAgfSxcblxuICAgIH07XG5cbiAgICByZXR1cm4gdGlsZTtcbn07XG5cbm1vZHVsZS5leHBvcnRzID0gQmFja2dyb3VuZDtcbiIsInZhciBsaW5lSW50ZXJzZWN0ID0gZnVuY3Rpb24oYSxiLGMsZCxwLHEscixzKSB7XG4gICAgdmFyIGRldCwgZ2FtbWEsIGxhbWJkYTtcbiAgICBkZXQgPSAoYyAtIGEpICogKHMgLSBxKSAtIChyIC0gcCkgKiAoZCAtIGIpO1xuICAgIGlmIChkZXQgPT09IDApIHtcbiAgICAgICAgcmV0dXJuIGZhbHNlO1xuICAgIH0gZWxzZSB7XG4gICAgICAgIGxhbWJkYSA9ICgocyAtIHEpICogKHIgLSBhKSArIChwIC0gcikgKiAocyAtIGIpKSAvIGRldDtcbiAgICAgICAgZ2FtbWEgPSAoKGIgLSBkKSAqIChyIC0gYSkgKyAoYyAtIGEpICogKHMgLSBiKSkgLyBkZXQ7XG4gICAgICAgIHJldHVybiAoMCA8IGxhbWJkYSAmJiBsYW1iZGEgPCAxKSAmJiAoMCA8IGdhbW1hICYmIGdhbW1hIDwgMSk7XG4gICAgfVxufTtcblxudmFyIHBvbHlJbnRlcnNlY3QgPSBmdW5jdGlvbih2ZXJ0cywgcG9pbnQxLCBwb2ludDIpIHtcbiAgICB2YXIgaiA9IHZlcnRzLmxlbmd0aCAtIDE7XG4gICAgcmV0dXJuIHZlcnRzLnJlZHVjZShmdW5jdGlvbihwcmV2LCBjdXJyLCBpbmRleCwgYXJyYXkpIHtcbiAgICAgICAgaWYgKHByZXYpIHJldHVybiB0cnVlO1xuICAgICAgICBpZiAobGluZUludGVyc2VjdChwb2ludDEueCwgcG9pbnQxLnksIHBvaW50Mi54LCBwb2ludDIueSwgY3Vyci54LCBjdXJyLnksIGFycmF5W2pdLngsIGFycmF5W2pdLnkpKSByZXR1cm4gdHJ1ZTtcbiAgICAgICAgaiA9IGluZGV4O1xuICAgIH0sIGZhbHNlKTtcblxufTtcblxudmFyIHBlcnBQb2ludCA9IGZ1bmN0aW9uKHYsIHApIHtcbiAgICB2YXIgayA9ICgodlsxXS55IC0gdlswXS55KSAqIChwLnggLSB2WzBdLngpIC0gKHZbMV0ueCAtIHZbMF0ueCkgKiAocC55IC0gdlswXS55KSkgLyAoTWF0aC5wb3codlsxXS55IC0gdlswXS55LCAyKSArIE1hdGgucG93KHZbMV0ueCAtIHZbMF0ueCwgMikpXG4gICAgcmV0dXJuIHt4OiBwLnggLSBrICogKHZbMV0ueSAtIHZbMF0ueSksIHk6IHAueSArIGsgKiAodlsxXS54IC0gdlswXS54KX07XG59O1xuXG52YXIgY2xvc2VzdFZlcnRpY2VzID0gZnVuY3Rpb24odmVydGljZXMsIHBvaW50KSB7XG4gICAgdmFyIG91dHB1dCA9IFtdO1xuICAgIHZhciBpLCBkaXMsIHgsIHksIGo7XG4gICAgZm9yIChpID0gMDsgaSA8IHZlcnRpY2VzLmxlbmd0aDsgaSsrKSB7XG4gICAgICAgIHggPSBwb2ludC54IC0gdmVydGljZXNbaV0ueDtcbiAgICAgICAgeSA9IHBvaW50LnkgLSB2ZXJ0aWNlc1tpXS55O1xuICAgICAgICBkaXMgPSBNYXRoLnNxcnQoTWF0aC5wb3coeCwgMikgKyBNYXRoLnBvdyh5LCAyKSk7XG4gICAgICAgIG91dHB1dC5wdXNoKHt4OiB2ZXJ0aWNlc1tpXS54LCB5OiB2ZXJ0aWNlc1tpXS55LCBkaXM6IGRpc30pO1xuXG4gICAgfVxuXG4gICAgcmV0dXJuIG91dHB1dC5zb3J0KGZ1bmN0aW9uKGEsIGIpIHtcbiAgICAgICAgcmV0dXJuIGEuZGlzIC0gYi5kaXM7XG4gICAgfSkuc2xpY2UoMCwgMik7XG5cbn07XG5cbnZhciBwb2ludEluUG9seWdvbiA9IGZ1bmN0aW9uKHZlcnRpY2VzLCBwb2ludCkge1xuICAgIHZhciBjID0gZmFsc2U7XG4gICAgdmFyIGksIGo7XG5cbiAgICBqID0gdmVydGljZXMubGVuZ3RoIC0gMTtcblxuICAgIGZvciAoaSA9IDA7IGkgPCB2ZXJ0aWNlcy5sZW5ndGg7IGkrKykge1xuXG4gICAgICAgIGlmICggKCh2ZXJ0aWNlc1tpXS55ID4gcG9pbnQueSkgIT09ICh2ZXJ0aWNlc1tqXS55ID4gcG9pbnQueSkpICYmXG4gICAgICAgIChwb2ludC54IDwgKHZlcnRpY2VzW2pdLnggLSB2ZXJ0aWNlc1tpXS54KSAqIChwb2ludC55IC0gdmVydGljZXNbaV0ueSkgLyAodmVydGljZXNbal0ueSAtIHZlcnRpY2VzW2ldLnkpICsgdmVydGljZXNbaV0ueCkgKSB7XG4gICAgICAgICAgICBjID0gIWM7XG4gICAgICAgIH1cblxuICAgICAgICBqID0gaTtcbiAgICB9XG5cbiAgICByZXR1cm4gYztcbn07XG5cbnZhciBCbG9jayA9IGZ1bmN0aW9uKG9wdGlvbnMpIHtcblxuICAgIHZhciBpO1xuICAgIHZhciBpbWFnZSA9IG5ldyBJbWFnZSgpO1xuICAgIGltYWdlLnNyYyA9IG9wdGlvbnMucGF0aDtcblxuICAgIHZhciB2ZXJ0cyA9IFtcbiAgICAgICAge3g6IG9wdGlvbnMucG9zLnggLSBvcHRpb25zLndpZHRoIC8gMiwgeTogb3B0aW9ucy5wb3MueSAtIG9wdGlvbnMuaGVpZ2h0IC8gMn0sIFxuICAgICAgICB7eDogb3B0aW9ucy5wb3MueCArIG9wdGlvbnMud2lkdGggLyAyLCB5OiBvcHRpb25zLnBvcy55IC0gb3B0aW9ucy5oZWlnaHQgLyAyfSwgXG4gICAgICAgIHt4OiBvcHRpb25zLnBvcy54ICsgb3B0aW9ucy53aWR0aCAvIDIsIHk6IG9wdGlvbnMucG9zLnkgKyBvcHRpb25zLmhlaWdodCAvIDJ9LCBcbiAgICAgICAge3g6IG9wdGlvbnMucG9zLnggLSBvcHRpb25zLndpZHRoIC8gMiwgeTogb3B0aW9ucy5wb3MueSArIG9wdGlvbnMuaGVpZ2h0IC8gMn0sIFxuICAgIF07XG5cbiAgICB2YXIgcm90ID0gb3B0aW9ucy5wb3Mucm90O1xuICAgIHZhciB2eCwgdnksIG94LCBveTtcbiAgICBveCA9IG9wdGlvbnMucG9zLng7XG4gICAgb3kgPSBvcHRpb25zLnBvcy55O1xuXG4gICAgZm9yIChpID0gMDsgaSA8IHZlcnRzLmxlbmd0aDsgaSsrKSB7XG4gICAgICAgIHZ4ID0gdmVydHNbaV0ueDtcbiAgICAgICAgdnkgPSB2ZXJ0c1tpXS55O1xuICAgICAgICB2ZXJ0c1tpXS54ID0gTWF0aC5jb3Mocm90KSAqICh2eCAtIG94KSAtIE1hdGguc2luKHJvdCkgKiAodnkgLSBveSkgKyBveDtcbiAgICAgICAgdmVydHNbaV0ueSA9IE1hdGguc2luKHJvdCkgKiAodnggLSBveCkgKyBNYXRoLmNvcyhyb3QpICogKHZ5IC0gb3kpICsgb3k7XG4gICAgfVxuXG4gICAgdmFyIGJsb2NrID0ge1xuICAgICAgICBnZW9tZXRyeTogJ2Jsb2NrJyxcbiAgICAgICAgdHlwZTogJ2Jsb2NrJyxcbiAgICAgICAgdmlzaWJsZTogdHJ1ZSxcbiAgICAgICAgaW1nOiBpbWFnZSxcbiAgICAgICAgcG9zOiBvcHRpb25zLnBvcyxcbiAgICAgICAgd2lkdGg6IG9wdGlvbnMud2lkdGgsXG4gICAgICAgIGhlaWdodDogb3B0aW9ucy5oZWlnaHQsXG4gICAgICAgIHZlcnRpY2VzOiB2ZXJ0cyxcbiAgICAgICAgdGVzdFBvaW50OiBmdW5jdGlvbihwb2ludCkge1xuICAgICAgICAgICAgdmFyIHJlc3VsdCA9IGZhbHNlO1xuICAgICAgICAgICAgaWYgKHBvaW50SW5Qb2x5Z29uKHZlcnRzLCBwb2ludCkpIHtcbiAgICAgICAgICAgICAgICByZXN1bHQgPSBwZXJwUG9pbnQoY2xvc2VzdFZlcnRpY2VzKHZlcnRzLCBwb2ludCksIHBvaW50KTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIHJldHVybiByZXN1bHQ7XG4gICAgICAgIH0sXG4gICAgICAgIGNvbGxpc2lvbjoge30sXG4gICAgICAgIHN0ZXA6IGZ1bmN0aW9uKCkge1xuICAgICAgICAgICAgcmV0dXJuIHRydWU7XG4gICAgICAgIH0sXG4gICAgICAgIG9jbHVkZTogZnVuY3Rpb24ocG9pbnQxLCBwb2ludDIpIHtcbiAgICAgICAgICAgIHJldHVybiBwb2x5SW50ZXJzZWN0KHZlcnRzLCBwb2ludDEsIHBvaW50Mik7XG4gICAgICAgIH1cbiAgICB9O1xuXG4gICAgcmV0dXJuIGJsb2NrO1xufTtcblxubW9kdWxlLmV4cG9ydHMgPSBCbG9jaztcblxuIiwidmFyIGltYWdlID0gbmV3IEltYWdlKCk7XG5pbWFnZS5zcmMgPSAnLi9pbWcvYnVsbGV0LnBuZyc7XG5cbnZhciBCdWxsZXQgPSBmdW5jdGlvbihvcHRpb25zKSB7XG5cbiAgICB2YXIgcmFuZ2UgPSBvcHRpb25zLnJhbmdlO1xuICAgIHZhciB2ZWxvY2l0eSA9IG9wdGlvbnMudmVsb2NpdHk7XG5cbiAgICB2YXIgZGlzdGFuY2UgPSAwO1xuXG4gICAgdmFyIGJ1bGxldCA9IHtcbiAgICAgICAgb25Ub3A6IHRydWUsXG4gICAgICAgIHBvd2VyOiBvcHRpb25zLnBvd2VyLFxuICAgICAgICBnZW9tZXRyeTogJ2NpcmNsZScsXG4gICAgICAgIHR5cGU6ICdidWxsZXQnLFxuICAgICAgICB2aXNpYmxlOiB0cnVlLFxuICAgICAgICByYWRpdXM6IDEwLFxuICAgICAgICBpbWc6IGltYWdlLFxuICAgICAgICBwb3M6IHtcbiAgICAgICAgICAgIHg6IG9wdGlvbnMueCxcbiAgICAgICAgICAgIHk6IG9wdGlvbnMueSxcbiAgICAgICAgICAgIHJvdDogb3B0aW9ucy5yb3RcbiAgICAgICAgfSxcbiAgICAgICAgc3RlcDogZnVuY3Rpb24oKSB7XG4gICAgICAgICAgICBpZiAodGhpcy5kaWUgfHwgZGlzdGFuY2UgPiByYW5nZSkgcmV0dXJuIGZhbHNlO1xuICAgICAgICAgICAgZGlzdGFuY2UrKztcbiAgICAgICAgICAgIHRoaXMucG9zLnggKz0gTWF0aC5jb3ModGhpcy5wb3Mucm90KSAqIHZlbG9jaXR5O1xuICAgICAgICAgICAgdGhpcy5wb3MueSArPSBNYXRoLnNpbih0aGlzLnBvcy5yb3QpICogdmVsb2NpdHk7XG4gICAgICAgICAgICByZXR1cm4gdHJ1ZTtcbiAgICAgICAgfSxcbiAgICAgICAgY29sbGlzaW9uOiB7XG4gICAgICAgICAgICB6b21iaWU6IGZ1bmN0aW9uKCkge1xuICAgICAgICAgICAgICAgIHRoaXMuZGllID0gdHJ1ZTtcbiAgICAgICAgICAgIH0sXG4gICAgICAgICAgICBodW1hbjogZnVuY3Rpb24oKSB7XG5cbiAgICAgICAgICAgIH0sXG4gICAgICAgICAgICBidWxsZXQ6IGZ1bmN0aW9uKCkge1xuXG4gICAgICAgICAgICB9LFxuICAgICAgICAgICAgYmxvY2s6IGZ1bmN0aW9uKCkge1xuICAgICAgICAgICAgICAgIHRoaXMuZGllID0gdHJ1ZTtcbiAgICAgICAgICAgIH0sXG4gICAgICAgICAgICBnb2FsOiBmdW5jdGlvbigpIHt9LFxuICAgICAgICAgICAgd2VhcG9uOiBmdW5jdGlvbigpIHt9XG5cbiAgICAgICAgfVxuICAgIH07XG5cbiAgICByZXR1cm4gYnVsbGV0O1xuXG59O1xuXG5tb2R1bGUuZXhwb3J0cyA9IEJ1bGxldDtcbiIsIm1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24ob3B0aW9ucykge1xuICAgIHZhciBzcHJpdGVNYXBzID0gb3B0aW9ucy5zcHJpdGVzLm1hcChmdW5jdGlvbihwYXRoKSB7IFxuICAgICAgICB2YXIgaW1nID0gbmV3IEltYWdlKCk7XG4gICAgICAgIGltZy5zcmMgPSBwYXRoO1xuICAgICAgICByZXR1cm4gaW1nO1xuICAgIH0pO1xuICAgIHZhciBtb2RlID0gb3B0aW9ucy5tb2RlO1xuICAgIHZhciB0ZXhNYXAgPSBvcHRpb25zLnRleE1hcDtcbiAgICB2YXIgbW9kZXMgPSBvcHRpb25zLm1vZGVzO1xuICAgIHZhciBjb2xsaXNpb24gPSBvcHRpb25zLmNvbGxpc2lvbjtcbiAgICB2YXIgdHlwZSA9IG9wdGlvbnMudHlwZTtcbiAgICB2YXIgcmFkaXVzID0gb3B0aW9ucy5yYWRpdXM7XG4gICAgdmFyIHJlbmRlcmVyID0gb3B0aW9ucy5yZW5kZXJlcjtcbiAgICB2YXIgaGVhbHRoID0gb3B0aW9ucy5oZWFsdGg7XG4gICAgdmFyIHRhcmdldCA9IG9wdGlvbnMudGFyZ2V0O1xuICAgIHZhciBhcnNlbmFsID0gb3B0aW9ucy5hcnNlbmFsO1xuICAgIHZhciBjdXJyZW50V2VhcG9uID0gb3B0aW9ucy5jdXJyZW50V2VhcG9uO1xuICAgIHJldHVybiBmdW5jdGlvbihvcHRpb25zKSB7XG4gICAgICAgIHZhciBhbmlUaWNrID0gMDtcbiAgICAgICAgdmFyIGVmZmVjdHMgPSBbXTtcbiAgICAgICAgdmFyIG5ld0VmZmVjdHMgPSBbXTtcbiAgICAgICAgdmFyIGltZyA9IHNwcml0ZU1hcHNbb3B0aW9ucy5pbWddO1xuICAgICAgICB2YXIgY2hhcmFjdGVyID0ge1xuICAgICAgICAgICAgb25Ub3A6IHRydWUsXG4gICAgICAgICAgICBhcnNlbmFsOiBhcnNlbmFsLFxuICAgICAgICAgICAgY3VycmVudFdlYXBvbjogY3VycmVudFdlYXBvbixcbiAgICAgICAgICAgIGFuaW1hdGU6IHRydWUsXG4gICAgICAgICAgICB2aXNpYmxlOiB0cnVlLFxuICAgICAgICAgICAgZ2VvbWV0cnk6ICdjaXJjbGUnLFxuICAgICAgICAgICAgdGFyZ2V0OiB0YXJnZXQsXG4gICAgICAgICAgICBpZDogb3B0aW9ucy5pbWcsXG4gICAgICAgICAgICBzdGVwOiBmdW5jdGlvbigpIHtcbiAgICAgICAgICAgICAgICBpZiAodGhpcy5hbmltYXRlKSB7XG4gICAgICAgICAgICAgICAgICAgIGFuaVRpY2srKztcbiAgICAgICAgICAgICAgICAgICAgaWYgKGFuaVRpY2sgPiAxNiAtIHRoaXMudmVsb2NpdHkpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGFuaVRpY2sgPSAwO1xuICAgICAgICAgICAgICAgICAgICAgICAgaWYgKHRoaXMucG9zZS54IDwgdGV4TWFwLnNsaWRlc1t0aGlzLnBvc2UueV0gLSAxKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgdGhpcy5wb3NlLngrKztcbiAgICAgICAgICAgICAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgdGhpcy5wb3NlLnggPSAwO1xuICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgICAgICAgICAgYW5pVGljaysrO1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIGlmICghdGhpcy5jb250cm9sbGVyKSB7XG4gICAgICAgICAgICAgICAgICAgIHRoaXMucG9zLnggKz0gTWF0aC5jb3ModGhpcy5wb3Mucm90KSAqIHRoaXMudmVsb2NpdHk7XG4gICAgICAgICAgICAgICAgICAgIHRoaXMucG9zLnkgKz0gTWF0aC5zaW4odGhpcy5wb3Mucm90KSAqIHRoaXMudmVsb2NpdHk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIGVmZmVjdHMgPSBlZmZlY3RzLmZpbHRlcigoZnVuY3Rpb24oaXRlbSkgeyByZXR1cm4gaXRlbS5jYWxsKHRoaXMpOyB9KS5iaW5kKHRoaXMpKTtcbiAgICAgICAgICAgICAgICBlZmZlY3RzID0gZWZmZWN0cy5jb25jYXQobmV3RWZmZWN0cyk7XG4gICAgICAgICAgICAgICAgbmV3RWZmZWN0cyA9IFtdO1xuICAgICAgICAgICAgICAgIHJldHVybiAhdGhpcy5kaWU7XG4gICAgICAgICAgICB9LFxuICAgICAgICAgICAgcG9zOiBvcHRpb25zLnBvcyxcbiAgICAgICAgICAgIGltZzogaW1nLCBcbiAgICAgICAgICAgIG1vdmU6IGZ1bmN0aW9uKHBvcykge1xuICAgICAgICAgICAgICAgIHRoaXMucG9zID0gcG9zO1xuICAgICAgICAgICAgfSxcbiAgICAgICAgICAgIHRleE1hcDogdGV4TWFwLFxuICAgICAgICAgICAgYWRkRWZmZWN0OiBmdW5jdGlvbihmbikge1xuICAgICAgICAgICAgICAgIG5ld0VmZmVjdHMucHVzaChmbik7XG4gICAgICAgICAgICB9LFxuICAgICAgICAgICAgYWRkTW9kZTogZnVuY3Rpb24obW9kZSkge1xuICAgICAgICAgICAgICAgIHRoaXMubW9kZSA9IG1vZGU7XG4gICAgICAgICAgICAgICAgbW9kZXNbbW9kZV0uY2FsbChjaGFyYWN0ZXIpO1xuICAgICAgICAgICAgfSxcbiAgICAgICAgICAgIHBvc2U6IHt4OiAwLCB5OiAwfSxcbiAgICAgICAgICAgIHZlbG9jaXR5OiAwLFxuICAgICAgICAgICAgbW9kZTogbW9kZSxcbiAgICAgICAgICAgIHR5cGU6IHR5cGUsXG4gICAgICAgICAgICBjb2xsaXNpb246IGNvbGxpc2lvbixcbiAgICAgICAgICAgIHJhZGl1czogcmFkaXVzLFxuICAgICAgICAgICAgcmVuZGVyZXI6IHJlbmRlcmVyLFxuICAgICAgICAgICAgaGVhbHRoOiBoZWFsdGhcbiAgICAgICAgfTtcbiAgICAgICAgY2hhcmFjdGVyLmFkZEVmZmVjdChmdW5jdGlvbigpIHtcbiAgICAgICAgICAgIHRoaXMuYWRkTW9kZSh0aGlzLm1vZGUpO1xuICAgICAgICAgICAgaWYgKHRoaXMuaGVhbHRoKSB7XG4gICAgICAgICAgICAgICAgdGhpcy5hZGRFZmZlY3QoZnVuY3Rpb24oKSB7XG4gICAgICAgICAgICAgICAgICAgIGlmICh0aGlzLmhlYWx0aCA8PSAwKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICB0aGlzLmFkZE1vZGUoJ2RlYWQnKTtcbiAgICAgICAgICAgICAgICAgICAgICAgIHJldHVybiBmYWxzZTtcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICByZXR1cm4gdHJ1ZTtcbiAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIHJldHVybiBmYWxzZTtcbiAgICAgICAgfSk7XG4gICAgICAgIHJldHVybiBjaGFyYWN0ZXI7XG4gICAgfTtcbn07XG5cbiIsInZhciBjb2xsaXNpb24gPSBmdW5jdGlvbih3b3JsZCkge1xuICAgIHdvcmxkLmZvckVhY2goZnVuY3Rpb24oY29sbGlkZXIsIGluZGV4LCBhcnJheSkge1xuICAgICAgICBhcnJheS5zbGljZShpbmRleCArIDEpLmZvckVhY2goZnVuY3Rpb24oY29sbGlkZWUpIHtcbiAgICAgICAgICAgIHZhciB4LCB5LCBkaXMsIHJhZGl1cywgYW5nLCB6b21iaWUsIGh1bWFuLCBhbmcyLCBibG9jaywgY2lyY2xlLCBwb2ludCwgb2NsdWRlO1xuICAgICAgICAgICAgaWYgKGNvbGxpZGVyLmNvbGxpc2lvbiAmJiBjb2xsaWRlZS5jb2xsaXNpb24pIHtcbiAgICAgICAgICAgICAgICBpZiAoY29sbGlkZXIuZ2VvbWV0cnkgPT09ICdjaXJjbGUnICYmIGNvbGxpZGVlLmdlb21ldHJ5ID09PSAnY2lyY2xlJykge1xuICAgICAgICAgICAgICAgICAgICB4ID0gY29sbGlkZXIucG9zLnggLSBjb2xsaWRlZS5wb3MueDtcbiAgICAgICAgICAgICAgICAgICAgeSA9IGNvbGxpZGVyLnBvcy55IC0gY29sbGlkZWUucG9zLnk7XG4gICAgICAgICAgICAgICAgICAgIGRpcyA9IE1hdGguc3FydChNYXRoLnBvdyh4LCAyKSArIE1hdGgucG93KHksIDIpKTtcbiAgICAgICAgICAgICAgICAgICAgcmFkaXVzID0gY29sbGlkZXIucmFkaXVzICsgY29sbGlkZWUucmFkaXVzO1xuXG4gICAgICAgICAgICAgICAgICAgIGlmICgoY29sbGlkZXIudHlwZSA9PT0gJ3pvbWJpZScgJiYgY29sbGlkZWUudHlwZSA9PT0gJ2h1bWFuJykgfHwgKGNvbGxpZGVlLnR5cGUgPT09ICd6b21iaWUnICYmIGNvbGxpZGVyLnR5cGUgPT09ICdodW1hbicpKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBpZiAoY29sbGlkZXIudHlwZSA9PT0gJ3pvbWJpZScpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB6b21iaWUgPSBjb2xsaWRlcjtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBodW1hbiA9IGNvbGxpZGVlO1xuICAgICAgICAgICAgICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB6b21iaWUgPSBjb2xsaWRlZTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBodW1hbiA9IGNvbGxpZGVyO1xuICAgICAgICAgICAgICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAgICAgICAgICAgICBvY2x1ZGUgPSB3b3JsZC5maWx0ZXIoZnVuY3Rpb24oY3Vycikge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGlmIChjdXJyLnR5cGUgPT09ICdibG9jaycpIHJldHVybiB0cnVlO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHJldHVybiBmYWxzZTtcbiAgICAgICAgICAgICAgICAgICAgICAgIH0pLnJlZHVjZShmdW5jdGlvbihwcmV2LCBjdXJyKSB7IFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGlmIChwcmV2KSByZXR1cm4gdHJ1ZTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICByZXR1cm4gY3Vyci5vY2x1ZGUoY29sbGlkZXIucG9zLCBjb2xsaWRlZS5wb3MpO1xuICAgICAgICAgICAgICAgICAgICAgICAgfSwgZmFsc2UpO1xuXG4gICAgICAgICAgICAgICAgICAgICAgICBpZiAoem9tYmllLnRhcmdldCA9PT0gaHVtYW4gJiYgb2NsdWRlICYmIGRpcyA+IDEwMDApIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB6b21iaWUuYWRkTW9kZSgnc2VhcmNoaW5nJyk7XG4gICAgICAgICAgICAgICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgICAgICAgICAgXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgYW5nMiA9IE1hdGguYWJzKE1hdGguYXRhbjIoaHVtYW4ucG9zLnkgLSB6b21iaWUucG9zLnksIGh1bWFuLnBvcy54IC0gem9tYmllLnBvcy54KSk7XG5cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBhbmcgPSAgem9tYmllLnBvcy5yb3QgLSBhbmcyO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGlmICghb2NsdWRlICYmIChNYXRoLmFicyhhbmcpIDwgTWF0aC5QSSAqIDAuNDUgfHwgZGlzIDwgNTAwKSkge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB6b21iaWUuYWRkTW9kZSgnY2hhc2luZycpO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB6b21iaWUudGFyZ2V0ID0gaHVtYW47XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICB9XG5cbiAgICAgICAgICAgICAgICAgICAgaWYgKGRpcyA8IHJhZGl1cykge1xuICAgICAgICAgICAgICAgICAgICAgICAgY29sbGlkZXIuY29sbGlzaW9uW2NvbGxpZGVlLnR5cGVdLmNhbGwoY29sbGlkZXIsIGNvbGxpZGVlKTtcbiAgICAgICAgICAgICAgICAgICAgICAgIGNvbGxpZGVlLmNvbGxpc2lvbltjb2xsaWRlci50eXBlXS5jYWxsKGNvbGxpZGVlLCBjb2xsaWRlcik7XG5cbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgICAgIGlmICgoY29sbGlkZXIuZ2VvbWV0cnkgPT09ICdibG9jaycgJiYgY29sbGlkZWUuZ2VvbWV0cnkgPT09ICdjaXJjbGUnKSB8fCAoY29sbGlkZXIuZ2VvbWV0cnkgPT09ICdjaXJjbGUnICYmIGNvbGxpZGVlLmdlb21ldHJ5ID09PSAnYmxvY2snKSkge1xuICAgICAgICAgICAgICAgICAgICBpZiAoY29sbGlkZXIuZ2VvbWV0cnkgPT09ICdibG9jaycpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGJsb2NrID0gY29sbGlkZXI7XG4gICAgICAgICAgICAgICAgICAgICAgICBjaXJjbGUgPSBjb2xsaWRlZTtcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICBpZiAoY29sbGlkZWUuZ2VvbWV0cnkgPT09ICdibG9jaycpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGJsb2NrID0gY29sbGlkZWU7XG4gICAgICAgICAgICAgICAgICAgICAgICBjaXJjbGUgPSBjb2xsaWRlcjtcbiAgICAgICAgICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAgICAgICAgIGlmIChjaXJjbGUudHlwZSAhPT0gJ2dvYWwnKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBwb2ludCA9IGJsb2NrLnRlc3RQb2ludChjaXJjbGUucG9zKTtcbiAgICAgICAgICAgICAgICAgICAgICAgIGlmIChwb2ludCkge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGlmIChjaXJjbGUudHlwZSA9PT0gJ2J1bGxldCcpIGNpcmNsZS5kaWUgPSB0cnVlO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGlmIChjaXJjbGUudHlwZSA9PT0gJ2FjdGl2YXRpb24nIHx8IGJsb2NrLnR5cGUgPT09ICdkb29yJykgYmxvY2suY29sbGlzaW9uLmFjdGl2YXRpb24oKTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBjaXJjbGUucG9zLnggPSBwb2ludC54O1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNpcmNsZS5wb3MueSA9IHBvaW50Lnk7XG4gICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cbiAgICAgICAgfSk7XG4gICAgfSk7XG59O1xuXG5tb2R1bGUuZXhwb3J0cyA9IGNvbGxpc2lvbjtcbiIsInZhciBUaWxlID0gcmVxdWlyZSgnLi9iYWNrZ3JvdW5kLmpzJyk7XG52YXIgWm9tYmllID0gcmVxdWlyZSgnLi96b21iaWUuanMnKTtcbnZhciBCbG9jayA9IHJlcXVpcmUoJy4vYmxvY2suanMnKTtcblxudmFyIGxldmVsID0gZnVuY3Rpb24ob3B0aW9ucykge1xuICAgIHZhciByZW5kZXJlciA9IG9wdGlvbnMucmVuZGVyZXI7XG4gICAgdmFyIHdvcmxkID0gb3B0aW9ucy53b3JsZDtcbiAgICB2YXIgcGxheWVyID0gb3B0aW9ucy5wbGF5ZXI7XG4gICAgdmFyIGksIGo7XG4gICAgZm9yIChpID0gMDsgaSA8IDEwOyBpKyspIHtcbiAgICAgICAgZm9yIChqID0gMDsgaiA8IDEwOyBqKyspIHtcbiAgICAgICAgICAgIHdvcmxkLnB1c2goVGlsZSh7cG9zOiB7eDogaSAqIDUxMiwgeTogaiAqIDUxMn0sIHBhdGg6ICcuL2ltZy9iYWNrZ3JvdW5kLmpwZyd9KSk7XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICBmb3IgKGkgPSAwOyBpIDwgNTc7IGkrKykge1xuICAgICAgICB3b3JsZC5wdXNoKEJsb2NrKHtwYXRoOiAnLi9pbWcvd2FsbC5wbmcnLCBwb3M6IHt4OiBpICogOTAgLSAyMDAsIHk6IC0yMDAsIHJvdDogMH0sIHdpZHRoOiAxMDAsIGhlaWdodDogMTAwfSkpO1xuICAgIH1cbiAgICBmb3IgKGkgPSAwOyBpIDwgNTc7IGkrKykge1xuICAgICAgICB3b3JsZC5wdXNoKEJsb2NrKHtwYXRoOiAnLi9pbWcvd2FsbC5wbmcnLCBwb3M6IHt4OiBpICogOTAgLSAyMDAsIHk6IDQ4MDAsIHJvdDogMH0sIHdpZHRoOiAxMDAsIGhlaWdodDogMTAwfSkpO1xuICAgIH1cbiAgICBmb3IgKGkgPSAwOyBpIDwgNTc7IGkrKykge1xuICAgICAgICB3b3JsZC5wdXNoKEJsb2NrKHtwYXRoOiAnLi9pbWcvd2FsbC5wbmcnLCBwb3M6IHt4OiAtMjAwLCB5OiBpICogOTAgLSAyMDAsIHJvdDogMH0sIHdpZHRoOiAxMDAsIGhlaWdodDogMTAwfSkpO1xuICAgIH1cblxuICAgIGZvciAoaSA9IDA7IGkgPCA1NzsgaSsrKSB7XG4gICAgICAgIHdvcmxkLnB1c2goQmxvY2soe3BhdGg6ICcuL2ltZy93YWxsLnBuZycsIHBvczoge3g6IDQ4MDAsIHk6IGkgKiA5MCAtIDIwMCwgcm90OiAwfSwgd2lkdGg6IDEwMCwgaGVpZ2h0OiAxMDB9KSk7XG4gICAgfVxuXG4gICAgd29ybGQucHVzaChCbG9jayh7cGF0aDogJy4vaW1nL2NhcjEucG5nJywgcG9zOiB7eDogMzAwLCB5OiAzMDAsIHJvdDogMn0sIHdpZHRoOiAyMDAsIGhlaWdodDogMzAwfSkpO1xuICAgIHdvcmxkLnB1c2goQmxvY2soe3BhdGg6ICcuL2ltZy9jYXIyLnBuZycsIHBvczoge3g6IDgwMCwgeTogMzAwLCByb3Q6IDB9LCB3aWR0aDogMjAwLCBoZWlnaHQ6IDMwMH0pKTtcbiAgICB3b3JsZC5wdXNoKEJsb2NrKHtwYXRoOiAnLi9pbWcvY2FyMy5wbmcnLCBwb3M6IHt4OiAxMTAwLCB5OiAzMDAsIHJvdDogMH0sIHdpZHRoOiAyMDAsIGhlaWdodDogMzAwfSkpO1xuICAgIHdvcmxkLnB1c2goQmxvY2soe3BhdGg6ICcuL2ltZy9jYXIyLnBuZycsIHBvczoge3g6IDE1MDAsIHk6IDMwMCwgcm90OiAwfSwgd2lkdGg6IDIwMCwgaGVpZ2h0OiAzMDB9KSk7XG4gICAgd29ybGQucHVzaChCbG9jayh7cGF0aDogJy4vaW1nL2NhcjEucG5nJywgcG9zOiB7eDogMTkwMCwgeTogMzAwLCByb3Q6IDB9LCB3aWR0aDogMjAwLCBoZWlnaHQ6IDMwMH0pKTtcbiAgICB3b3JsZC5wdXNoKEJsb2NrKHtwYXRoOiAnLi9pbWcvY2FyMy5wbmcnLCBwb3M6IHt4OiAzMDAsIHk6IDgwMCwgcm90OiAwfSwgd2lkdGg6IDIwMCwgaGVpZ2h0OiAzMDB9KSk7XG4gICAgd29ybGQucHVzaChCbG9jayh7cGF0aDogJy4vaW1nL2NhcjEucG5nJywgcG9zOiB7eDogMzAwLCB5OiAxMTAwLCByb3Q6IDB9LCB3aWR0aDogMjAwLCBoZWlnaHQ6IDMwMH0pKTtcblxuICAgIHdvcmxkLnB1c2goWm9tYmllKHtyZW5kZXJlcjogcmVuZGVyZXIsIGltZzogMiwgcG9zOiB7eDogMTkwMCwgeTogMTcwMCwgcm90OiAwfX0pKTtcbiAgICB3b3JsZC5wdXNoKFpvbWJpZSh7cmVuZGVyZXI6IHJlbmRlcmVyLCBpbWc6IDAsIHBvczoge3g6IDM0MDAsIHk6IDE3MDAsIHJvdDogMH19KSk7XG4gICAgLy93b3JsZC5wdXNoKFpvbWJpZSh7cmVuZGVyZXI6IHJlbmRlcmVyLCBpbWc6IDIsIHBvczoge3g6IDE5MDAsIHk6IDI0MDAsIHJvdDogMH19KSk7XG4gICAgLy93b3JsZC5wdXNoKFpvbWJpZSh7cmVuZGVyZXI6IHJlbmRlcmVyLCBpbWc6IDEsIHBvczoge3g6IDM3MDAsIHk6IDE3MDAsIHJvdDogMH19KSk7XG4gICAgLy93b3JsZC5wdXNoKFpvbWJpZSh7cmVuZGVyZXI6IHJlbmRlcmVyLCBpbWc6IDIsIHBvczoge3g6IDE1MDAsIHk6IDIzMDAsIHJvdDogMH19KSk7XG4gICAgLy93b3JsZC5wdXNoKFpvbWJpZSh7cmVuZGVyZXI6IHJlbmRlcmVyLCBpbWc6IDAsIHBvczoge3g6IDM5MDAsIHk6IDEyMDAsIHJvdDogMH19KSk7XG5cbiAgICB3b3JsZC5wdXNoKHBsYXllcik7XG5cbiAgICB2YXIgdGljayA9IDA7XG5cbiAgICByZXR1cm4gZnVuY3Rpb24od29ybGQpIHtcbiAgICAgICAgaWYgKHRpY2sgPiAyMDApIHtcbiAgICAgICAgICAgIHRpY2sgPSAwO1xuICAgICAgICAgICAgd29ybGQucHVzaChab21iaWUoe3JlbmRlcmVyOiByZW5kZXJlciwgaW1nOiAyLCBwb3M6IHt4OiAzNTAwLCB5OiAzNTAwLCByb3Q6IDB9fSkpO1xuICAgICAgICAgICAgdGljayA9IDA7XG4gICAgICAgIH1cbiAgICAgICAgdGljaysrO1xuXG4gICAgfTtcbn07XG5cblxubW9kdWxlLmV4cG9ydHMgPSBsZXZlbDtcbiIsInJlcXVpcmUoJy4vYW5pbWF0aW9uU2hpbS5qcycpO1xudmFyIHJlbmRlcmVyID0gcmVxdWlyZSgnLi9yZW5kZXJlci5qcycpO1xudmFyIFBsYXllciA9IHJlcXVpcmUoJy4vcGxheWVyLmpzJyk7XG52YXIgd2FzZCA9IHJlcXVpcmUoJy4vd2FzZC5qcycpO1xudmFyIGxldmVsID0gcmVxdWlyZSgnLi9sZXZlbC5qcycpO1xuXG52YXIgd29ybGQgPSBbXTtcblxud2luZG93Lm9ubG9hZCA9IGZ1bmN0aW9uKCkge1xuICAgIHdpbmRvdy5vbmRyYWdzdGFydCA9IGZ1bmN0aW9uKCkgeyByZXR1cm4gZmFsc2U7IH07XG4gICAgdmFyIHN0YXRzID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ3N0YXRzJyk7XG4gICAgdmFyIG5ld0dhbWUgPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgnbmV3Z2FtZScpO1xuICAgIHZhciBjYW52YXMgPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgnZ2FtZVZpZXcnKTtcbiAgICB2YXIgb3BlbmluZyA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCdvcGVuaW5nJyk7XG4gICAgbmV3IEFycmF5KCkuc2xpY2UuY2FsbChkb2N1bWVudC5nZXRFbGVtZW50c0J5Q2xhc3NOYW1lKCd3ZWFwb24nKSkuZm9yRWFjaChmdW5jdGlvbihpdGVtKSB7XG4gICAgICAgIGl0ZW0ud2lkdGggPSAxMDA7XG4gICAgfSk7XG4gICAgdmFyIHN0YXJ0R2FtZSA9IGZ1bmN0aW9uKCkge1xuICAgICAgICBuZXdHYW1lLnJlbW92ZUV2ZW50TGlzdGVuZXIoJ2NsaWNrJywgIHN0YXJ0R2FtZSk7XG4gICAgICAgIHdvcmxkID0gW107XG4gICAgICAgIHZhciBwbGF5ZXIgPSBQbGF5ZXIoe2NvbnRyb2xsZXI6IHdhc2QsIHJlbmRlcmVyOiByZW5kZXJlciwgaW1nOiAwLCBwb3M6IHt4OiAwLCB5OiAwLCByb3Q6IDB9fSk7XG4gICAgICAgIHJlbmRlcmVyLmluaXQoe2xldmVsOiBsZXZlbCh7cGxheWVyOiBwbGF5ZXIsIHdvcmxkOiB3b3JsZCwgcmVuZGVyZXI6IHJlbmRlcmVyfSksIGNhbnZhczogJ2dhbWVWaWV3Jywgd29ybGQ6IHdvcmxkLCBwb3Y6IHBsYXllcn0pO1xuXG4gICAgICAgIGNhbnZhcy5zdHlsZS5vcGFjaXR5ID0gMTtcbiAgICAgICAgb3BlbmluZy5zdHlsZS5vcGFjaXR5ID0gMDtcbiAgICAgICAgcmVuZGVyZXIuc3RhcnQoKTtcbiAgICAgICAgd2FzZC5zdGFydCgpO1xuICAgIH07XG5cbiAgICBzcGxhc2gud2lkdGggPSB3aW5kb3cuaW5uZXJXaWR0aDtcbiAgICBzcGxhc2guc3R5bGUudG9wID0gKCh3aW5kb3cuaW5uZXJIZWlnaHQgLSBzcGxhc2guaGVpZ2h0KSAvIDIpICsgJ3B4JztcbiAgICBuZXdHYW1lLnN0eWxlLnRvcCA9ICgod2luZG93LmlubmVySGVpZ2h0IC8gMikgKSArICdweCc7XG4gICAgbmV3R2FtZS5zdHlsZS5sZWZ0ID0gKCh3aW5kb3cuaW5uZXJXaWR0aCAvIDIpIC0gIG5ld0dhbWUud2lkdGggLyAyICkgKyAncHgnO1xuICAgIHNwbGFzaC5zdHlsZS5vcGFjaXR5ID0gMTtcbiAgICBuZXdHYW1lLnN0eWxlLm9wYWNpdHkgPSAwLjU7XG4gICAgY2FudmFzLnNldEF0dHJpYnV0ZSgnd2lkdGgnLCA0NTAwKTsvL3NwbGFzaC53aWR0aCk7XG4gICAgY2FudmFzLnNldEF0dHJpYnV0ZSgnaGVpZ2h0JywgMjEwMCk7Ly9zcGxhc2guaGVpZ2h0KTtcbiAgICBjYW52YXMuc3R5bGUud2lkdGggPSBzcGxhc2gud2lkdGggKyAncHgnO1xuICAgIGNhbnZhcy5zdHlsZS5oZWlnaHQgPSBzcGxhc2guaGVpZ2h0ICsgJ3B4JztcbiAgICBjYW52YXMuc3R5bGUudG9wID0gKCh3aW5kb3cuaW5uZXJIZWlnaHQgLSBzcGxhc2guaGVpZ2h0KSAvIDIpICsgJ3B4JztcbiAgICBzdGF0cy5zdHlsZS50b3AgPSBjYW52YXMuc3R5bGUudG9wO1xuXG4gICAgd2luZG93LmdhbWVPdmVyID0gZnVuY3Rpb24oKSB7XG4gICAgICAgIHdhc2Quc3RvcCgpO1xuICAgICAgICB2YXIgdCA9IHNldFRpbWVvdXQoZnVuY3Rpb24oKSB7XG4gICAgICAgICAgICBvcGVuaW5nLnN0eWxlLm9wYWNpdHkgPSAxO1xuICAgICAgICAgICAgbmV3R2FtZS5zdHlsZS5vcGFjaXR5ID0gMC41O1xuICAgICAgICAgICAgY2FudmFzLnN0eWxlLm9wYWNpdHkgPSAwO1xuICAgICAgICAgICAgbmV3R2FtZS5hZGRFdmVudExpc3RlbmVyKCdjbGljaycsICBzdGFydEdhbWUpO1xuICAgICAgICAgICAgdmFyIHQgPSBzZXRUaW1lb3V0KGZ1bmN0aW9uKCkge1xuICAgICAgICAgICAgICAgIHJlbmRlcmVyLnN0b3AoKTtcbiAgICAgICAgICAgIH0sIDUwMCk7XG5cbiAgICAgICAgfSwgNTAwKTtcblxuICAgIH1cbiAgICBuZXdHYW1lLmFkZEV2ZW50TGlzdGVuZXIoJ2NsaWNrJywgIHN0YXJ0R2FtZSk7XG4gICAgbmV3R2FtZS5hZGRFdmVudExpc3RlbmVyKCdtb3VzZW91dCcsICBmdW5jdGlvbihlKSB7XG4gICAgICAgIG5ld0dhbWUuc3R5bGUub3BhY2l0eSA9IC41O1xuICAgIH0pO1xuICAgIG5ld0dhbWUuYWRkRXZlbnRMaXN0ZW5lcignbW91c2VvdmVyJywgIGZ1bmN0aW9uKGUpIHtcbiAgICAgICAgbmV3R2FtZS5zdHlsZS5vcGFjaXR5ID0gLjc1O1xuICAgIH0pO1xufTtcblxuXG5cbi8vcmVuZGVyZXIuc3RlcCgpO1xuLy9yZW5kZXJlci5zdGVwKCk7XG5cblxuXG4iLCJ2YXIgaW1hZ2UgPSBuZXcgSW1hZ2UoKTtcbi8vaW1hZ2Uuc3JjID0gJy4vaW1nL2JhdHN3aW5nLnBuZyc7XG5pbWFnZS5zcmMgPSAnLi9pbWcvYmFzZWJhbGxiYXQucG5nJztcblxudmFyIE1lZWxlZSA9IGZ1bmN0aW9uKG9wdGlvbnMpIHtcblxuICAgIHZhciBzdGFydCA9IERhdGUubm93KCk7XG5cbiAgICB2YXIgbWVlbGVlID0ge1xuICAgICAgICBwb3dlcjogb3B0aW9ucy5wb3dlcixcbiAgICAgICAgb25Ub3A6IHRydWUsXG4gICAgICAgIGdlb21ldHJ5OiAnY2lyY2xlJyxcbiAgICAgICAgdHlwZTogJ21lZWxlZScsXG4gICAgICAgIHZpc2libGU6IHRydWUsXG4gICAgICAgIHJhZGl1czogMTAwLFxuICAgICAgICBpbWc6IGltYWdlLFxuICAgICAgICBwb3M6IHtcbiAgICAgICAgICAgIHg6IG9wdGlvbnMueCxcbiAgICAgICAgICAgIHk6IG9wdGlvbnMueSxcbiAgICAgICAgICAgIHJvdDogb3B0aW9ucy5yb3RcbiAgICAgICAgfSxcbiAgICAgICAgc3RlcDogZnVuY3Rpb24oKSB7XG4gICAgICAgICAgICBpZiAodGhpcy5kaWUgfHwgRGF0ZS5ub3coKSAtIDI1MCA+IHN0YXJ0KSByZXR1cm4gZmFsc2U7XG5cbiAgICAgICAgICAgIHRoaXMucG9zLnggPSBvcHRpb25zLnBhcmVudC5wb3MueCArIE1hdGguY29zKHRoaXMucG9zLnJvdCkgKiA1MDtcbiAgICAgICAgICAgIHRoaXMucG9zLnkgPSBvcHRpb25zLnBhcmVudC5wb3MueSArIE1hdGguc2luKHRoaXMucG9zLnJvdCkgKiA1MDtcbiAgICAgICAgICAgIHJldHVybiB0cnVlO1xuICAgICAgICB9LFxuICAgICAgICBjb2xsaXNpb246IHtcbiAgICAgICAgICAgIHpvbWJpZTogZnVuY3Rpb24oKSB7XG4gICAgICAgICAgICAgICAgdGhpcy5kaWUgPSB0cnVlO1xuICAgICAgICAgICAgfSxcbiAgICAgICAgICAgIGh1bWFuOiBmdW5jdGlvbigpIHtcblxuICAgICAgICAgICAgfSxcbiAgICAgICAgICAgIGJ1bGxldDogZnVuY3Rpb24oKSB7XG5cbiAgICAgICAgICAgIH0sXG4gICAgICAgICAgICBibG9jazogZnVuY3Rpb24oKSB7XG4gICAgICAgICAgICAgICAgdGhpcy5kaWUgPSB0cnVlO1xuICAgICAgICAgICAgfSxcbiAgICAgICAgICAgIG1lZWxlZTogZnVuY3Rpb24oKSB7XG5cbiAgICAgICAgICAgIH0sXG4gICAgICAgICAgICBnb2FsOiBmdW5jdGlvbigpIHt9LFxuICAgICAgICAgICAgd2VhcG9uOiBmdW5jdGlvbigpIHt9XG5cbiAgICAgICAgfVxuICAgIH07XG5cbiAgICByZXR1cm4gbWVlbGVlO1xuXG59O1xuXG5tb2R1bGUuZXhwb3J0cyA9IE1lZWxlZTtcbiIsInZhciBDaGFyYWN0ZXIgPSByZXF1aXJlKCcuL2NoYXJhY3Rlci5qcycpO1xudmFyIFdlYXBvbnMgPSByZXF1aXJlKCcuL3dlYXBvbnMuanMnKTtcblxuXG5tb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uKG9wdGlvbnMpIHtcblxuXG4gICAgdmFyIFBsYXllciA9IENoYXJhY3Rlcih7XG4gICAgICAgIGN1cnJlbnRXZWFwb246ICdwaXN0b2wnLFxuICAgICAgICB2ZWxvY2l0eTogMCxcbiAgICAgICAgcmVuZGVyZXI6IG9wdGlvbnMucmVuZGVyZXIsXG4gICAgICAgIHJhZGl1czogNTAsXG4gICAgICAgIHR5cGU6ICdodW1hbicsXG4gICAgICAgIHNwcml0ZXM6IFsnLi9pbWcvcGxheWVyLnBuZyddLFxuICAgICAgICB0ZXhNYXA6IHtcbiAgICAgICAgICAgIHg6IDYsXG4gICAgICAgICAgICB5OiAyLFxuICAgICAgICAgICAgc2xpZGVzOiBbNiwgNV1cbiAgICAgICAgfSxcbiAgICAgICAgbW9kZTogJ2xvYWRpbmcnLFxuICAgICAgICBtb2Rlczoge1xuICAgICAgICAgICAgbG9hZGluZzogZnVuY3Rpb24oKSB7XG4gICAgICAgICAgICAgICAgdGhpcy5hZGRFZmZlY3QoZnVuY3Rpb24oKSB7XG4gICAgICAgICAgICAgICAgICAgIHRoaXMuYWRkTW9kZSgnc3RhbmRpbmcnKTtcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIGZhbHNlO1xuICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgICAgIHJldHVybiBmYWxzZTtcbiAgICAgICAgICAgIH0sXG4gICAgICAgICAgICBzdGFuZGluZzogZnVuY3Rpb24oKSB7XG4gICAgICAgICAgICAgICAgdGhpcy5wb3NlLnkgPSAwO1xuXG4gICAgICAgICAgICB9LFxuICAgICAgICAgICAgcnVubmluZzogZnVuY3Rpb24oKSB7XG5cbiAgICAgICAgICAgIH0sXG4gICAgICAgICAgICB3YWxraW5nOiBmdW5jdGlvbigpIHtcblxuICAgICAgICAgICAgfSxcbiAgICAgICAgICAgIHNob290aW5nOiBmdW5jdGlvbigpIHtcbiAgICAgICAgICAgICAgICB0aGlzLnBvc2UueSA9IDE7XG4gICAgICAgICAgICAgICAgdmFyIHRpY2sgPSBXZWFwb25zW3RoaXMuY3VycmVudFdlYXBvbl0ucmVsb2FkIC0gMTtcbiAgICAgICAgICAgICAgICB0aGlzLmFkZEVmZmVjdChmdW5jdGlvbigpIHtcbiAgICAgICAgICAgICAgICAgICAgaWYgKHRoaXMubW9kZSAhPT0gJ3Nob290aW5nJykgcmV0dXJuIGZhbHNlO1xuICAgICAgICAgICAgICAgICAgICB0aWNrKys7XG4gICAgICAgICAgICAgICAgICAgIGlmICh0aWNrID4gV2VhcG9uc1t0aGlzLmN1cnJlbnRXZWFwb25dLnJlbG9hZCkgeyBcbiAgICAgICAgICAgICAgICAgICAgICAgIFdlYXBvbnNbdGhpcy5jdXJyZW50V2VhcG9uXS5maXJlLmNhbGwodGhpcyk7XG4gICAgICAgICAgICAgICAgICAgICAgICBXZWFwb25zLnVwZGF0ZSh0aGlzKTtcbiAgICAgICAgICAgICAgICAgICAgICAgIHRpY2sgPSAwO1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgIHJldHVybiB0cnVlO1xuICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgfVxuICAgICAgICB9LFxuICAgICAgICBjb2xsaXNpb246IHtcbiAgICAgICAgICAgIHpvbWJpZTogZnVuY3Rpb24oKSB7XG4gICAgICAgICAgICAgICAgZ2FtZU92ZXIoKTtcbiAgICAgICAgICAgIH0sXG4gICAgICAgICAgICBtZWVsZWU6IGZ1bmN0aW9uKCkge30sXG4gICAgICAgICAgICBidWxsZXQ6IGZ1bmN0aW9uKCkge1xuXG4gICAgICAgICAgICB9LFxuICAgICAgICAgICAgZ29hbDogZnVuY3Rpb24oKSB7XG5cbiAgICAgICAgICAgIH0sXG4gICAgICAgICAgICB3ZWFwb246IGZ1bmN0aW9uKHdlYXBvbikge1xuICAgICAgICAgICAgICAgIFdlYXBvbnNbd2VhcG9uLm5hbWVdLmFtbW8gKz0gV2VhcG9uc1t3ZWFwb24ubmFtZV0ucGlja3VwQW1tbztcbiAgICAgICAgICAgICAgICBXZWFwb25zLnVwZGF0ZSh0aGlzKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgIH0pO1xuXG4gICAgdmFyIHBsYXllciA9IFBsYXllcihvcHRpb25zKTtcbiAgICBvcHRpb25zLmNvbnRyb2xsZXIuY29udHJvbGxpbmcgPSBwbGF5ZXI7XG4gICAgcGxheWVyLmFkZEVmZmVjdChvcHRpb25zLmNvbnRyb2xsZXIucmVzcG9uc2VFZmZlY3QpO1xuICAgIHBsYXllci5uZXh0V2VhcG9uID0gZnVuY3Rpb24oKSB7XG4gICAgICAgIHBsYXllci5jdXJyZW50V2VhcG9uID0gV2VhcG9uc1twbGF5ZXIuY3VycmVudFdlYXBvbl0ubmV4dDtcbiAgICAgICAgaWYgKCFXZWFwb25zW3BsYXllci5jdXJyZW50V2VhcG9uXS5hbW1vKSBwbGF5ZXIubmV4dFdlYXBvbigpO1xuICAgICAgICBXZWFwb25zLnVwZGF0ZShwbGF5ZXIpO1xuICAgIH07XG4gICAgV2VhcG9ucy51cGRhdGUocGxheWVyKTtcblxuICAgIHJldHVybiBwbGF5ZXI7XG59O1xuIiwidmFyIGNvbGxpc2lvbiA9IHJlcXVpcmUoJy4vY29sbGlzaW9uLmpzJyk7XG52YXIgYXVkaW8gPSByZXF1aXJlKCcuL2F1ZGlvLmpzJyk7XG5cbnZhciBzdGVwID0gZnVuY3Rpb24oKSB7XG5cbiAgICByZW5kZXJlci5uZXdJdGVtcyA9IFtdO1xuICAgIHJlbmRlcmVyLmxldmVsKHJlbmRlcmVyLndvcmxkKTtcbiAgICBjb2xsaXNpb24ocmVuZGVyZXIud29ybGQpO1xuICAgIGF1ZGlvLnVwZGF0ZVBvdihwb3YucG9zKTtcbiAgICByZW5kZXJlci53b3JsZC5zb3J0KGZ1bmN0aW9uKGEsIGIpIHtcbiAgICAgICAgcmV0dXJuIGEub25Ub3A7XG4gICAgfSk7XG5cbiAgICByZW5kZXJlci5jYW52YXMud2lkdGggPSByZW5kZXJlci5jYW52YXMud2lkdGg7XG4gICAgcmVuZGVyZXIud29ybGQgPSByZW5kZXJlci53b3JsZC5maWx0ZXIoZnVuY3Rpb24oaXRlbSkgeyBcbiAgICAgICAgdmFyIHdpZHRoLCBoZWlnaHQsIHN4LCBzeSwgaTtcbiAgICAgICAgaWYgKGl0ZW0uYXVkaW8pIHtcbiAgICAgICAgICAgIGF1ZGlvW2l0ZW0udHlwZV1baXRlbS5hdWRpb10oaXRlbS5wb3MpO1xuICAgICAgICAgICAgaXRlbS5hdWRpbyA9IG51bGw7XG4gICAgICAgIH1cbiAgICAgICAgaWYgKGl0ZW0udmlzaWJsZSkge1xuICAgICAgICAgICAgaWYgKGl0ZW0ucG9zLnJvdCA+IE1hdGguUEkgKiAyKSBpdGVtLnBvcy5yb3QgLT0gTWF0aC5QSSAqIDI7XG4gICAgICAgICAgICBpZiAoaXRlbS5wb3Mucm90IDwgMCkgaXRlbS5wb3Mucm90ICs9IE1hdGguUEkgKiAyO1xuICAgICAgICAgICAgaWYgKGl0ZW0udGV4TWFwKSB7XG4gICAgICAgICAgICAgICAgd2lkdGggPSBpdGVtLmltZy53aWR0aCAvIGl0ZW0udGV4TWFwLng7XG4gICAgICAgICAgICAgICAgaGVpZ2h0ID0gaXRlbS5pbWcuaGVpZ2h0IC8gaXRlbS50ZXhNYXAueTtcbiAgICAgICAgICAgICAgICBzeCA9IHdpZHRoICogaXRlbS5wb3NlLng7XG4gICAgICAgICAgICAgICAgc3kgPSBoZWlnaHQgKiBpdGVtLnBvc2UueTtcbiAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgd2lkdGggPSBpdGVtLmltZy53aWR0aDtcbiAgICAgICAgICAgICAgICBoZWlnaHQgPSBpdGVtLmltZy5oZWlnaHQ7XG4gICAgICAgICAgICAgICAgc3ggPSAwO1xuICAgICAgICAgICAgICAgIHN5ID0gMDtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIHZhciBjdHggPSByZW5kZXJlci5jYW52YXMuZ2V0Q29udGV4dCgnMmQnKTtcbiAgICAgICAgICAgIHZhciBwb3MgPSB7fTtcbiAgICAgICAgICAgIHBvcy54ID0gMjI1MCArIChpdGVtLnBvcy54IC0gcG92LnBvcy54KSAtIHdpZHRoIC8gMjtcbiAgICAgICAgICAgIHBvcy55ID0gMTkwMCArIChpdGVtLnBvcy55IC0gcG92LnBvcy55KSAtIGhlaWdodCAvIDI7XG4gICAgICAgICAgICBjdHguc2F2ZSgpOyBcblxuICAgICAgICAgICAgY3R4LnRyYW5zbGF0ZSgyMjUwICwgMTkwMCApO1xuICAgICAgICAgICAgY3R4LnJvdGF0ZSgtIHBvdi5wb3Mucm90IC0gTWF0aC5QSSAvIDIpO1xuICAgICAgICAgICAgY3R4LnRyYW5zbGF0ZSggLSAoMjI1MCApLCAtICgxOTAwICkpO1xuICAgICAgICAgICAgY3R4LnRyYW5zbGF0ZSggcG9zLnggKyB3aWR0aCAvIDIsIHBvcy55ICsgaGVpZ2h0IC8gMik7XG4gICAgICAgICAgICBjdHgucm90YXRlKCBpdGVtLnBvcy5yb3QgKTtcbiAgICAgICAgICAgIGN0eC5kcmF3SW1hZ2UoaXRlbS5pbWcsIHN4LCBzeSwgd2lkdGgsIGhlaWdodCwgLSB3aWR0aCAvIDIsIC0gaGVpZ2h0IC8gMiwgd2lkdGgsIGhlaWdodCk7XG5cbiAgICAgICAgICAgIGN0eC5yZXN0b3JlKCk7IFxuICAgICAgICB9XG4gICAgICAgIHJldHVybiBpdGVtLnN0ZXAuY2FsbChpdGVtKTsgXG4gICAgfSk7XG4gICAgcmVuZGVyZXIud29ybGQgPSByZW5kZXJlci53b3JsZC5jb25jYXQocmVuZGVyZXIubmV3SXRlbXMpO1xuXG59O1xudmFyIHBsYXlpbmcgPSBmYWxzZTtcbnZhciBwb3Y7XG52YXIgcmVuZGVyZXIgPSB7XG4gICAgaW5pdDogZnVuY3Rpb24ob3B0aW9ucykge1xuICAgICAgICByZW5kZXJlci5sZXZlbCA9IG9wdGlvbnMubGV2ZWw7XG4gICAgICAgIHJlbmRlcmVyLndvcmxkID0gb3B0aW9ucy53b3JsZDtcbiAgICAgICAgcmVuZGVyZXIuY2FudmFzID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQob3B0aW9ucy5jYW52YXMpO1xuICAgICAgICBwb3YgPSBvcHRpb25zLnBvdjtcbiAgICB9LFxuICAgIHN0YXJ0OiBmdW5jdGlvbigpIHtcbiAgICAgICAgdmFyIGFuaW1hdGUgPSBmdW5jdGlvbigpIHtcbiAgICAgICAgICAgIHN0ZXAoKTtcbiAgICAgICAgICAgIGlmIChwbGF5aW5nKSB3aW5kb3cucmVxdWVzdEFuaW1hdGlvbkZyYW1lKGFuaW1hdGUpO1xuICAgICAgICB9O1xuICAgICAgICBpZiAoIXBsYXlpbmcpIHtcbiAgICAgICAgICAgIHBsYXlpbmcgPSB0cnVlO1xuICAgICAgICAgICAgYW5pbWF0ZSgpO1xuICAgICAgICB9XG5cbiAgICB9LFxuICAgIHN0b3A6IGZ1bmN0aW9uKCkge1xuICAgICAgICBwbGF5aW5nID0gZmFsc2U7XG4gICAgfSxcbiAgICBzdGVwOiBmdW5jdGlvbigpIHtcbiAgICAgICAgc3RlcCgpO1xuICAgIH0sXG4gICAgbmV3SXRlbXM6IFtdXG59O1xuXG5cbm1vZHVsZS5leHBvcnRzID0gcmVuZGVyZXI7XG4iLCJ3aW5kb3cua2V5c1ByZXNzZWQgPSBbXTtcbnZhciBzd2l0Y2hXZWFwb247XG5cbnZhciB3YXNkID0ge1xuICAgIHg6IDAsXG4gICAgcmVzcG9uc2VFZmZlY3Q6IGZ1bmN0aW9uKCkge1xuICAgICAgICBpZiAodGhpcy5ydW5uaW5nKSB7XG4gICAgICAgICAgICB0aGlzLnZlbG9jaXR5ID0gMTI7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICB0aGlzLnZlbG9jaXR5ID0gODtcbiAgICAgICAgfVxuICAgICAgICBpZiAodGhpcy5sZWZ0IHx8IHRoaXMucmlnaHQpIHRoaXMudmVsb2NpdHkgKj0gMC44O1xuICAgICAgICBpZiAoIXRoaXMubGVmdCAmJiAhdGhpcy5yaWdodCAmJiAhdGhpcy51cCAmJiAhdGhpcy5kb3duKSB7XG4gICAgICAgICAgICB0aGlzLmFuaW1hdGUgPSBmYWxzZTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIHRoaXMuYW5pbWF0ZSA9IHRydWU7XG4gICAgICAgIH1cblxuICAgICAgICBpZiAodGhpcy51cCkgeyBcbiAgICAgICAgICAgIHRoaXMucG9zLnggKz0gTWF0aC5jb3ModGhpcy5wb3Mucm90KSAqIHRoaXMudmVsb2NpdHk7XG4gICAgICAgICAgICB0aGlzLnBvcy55ICs9IE1hdGguc2luKHRoaXMucG9zLnJvdCkgKiB0aGlzLnZlbG9jaXR5O1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgdGhpcy52ZWxvY2l0eSA9IDA7XG4gICAgICAgIH1cbiAgICAgICAgaWYgKHRoaXMubGVmdCkgeyBcbiAgICAgICAgICAgIHRoaXMucG9zLnggKz0gTWF0aC5jb3ModGhpcy5wb3Mucm90IC0gTWF0aC5QSSAvIDIpICogNDtcbiAgICAgICAgICAgIHRoaXMucG9zLnkgKz0gTWF0aC5zaW4odGhpcy5wb3Mucm90IC0gTWF0aC5QSSAvIDIpICogNDtcbiAgICAgICAgfVxuICAgICAgICBpZiAodGhpcy5kb3duKSB7IFxuICAgICAgICAgICAgdGhpcy5wb3MueCArPSBNYXRoLmNvcyh0aGlzLnBvcy5yb3QgLSBNYXRoLlBJKSAqIDQ7XG4gICAgICAgICAgICB0aGlzLnBvcy55ICs9IE1hdGguc2luKHRoaXMucG9zLnJvdCAtIE1hdGguUEkpICogNDtcbiAgICAgICAgfVxuICAgICAgICBpZiAodGhpcy5yaWdodCkgeyBcbiAgICAgICAgICAgIHRoaXMucG9zLnggKz0gTWF0aC5jb3ModGhpcy5wb3Mucm90IC0gTWF0aC5QSSAqIDEuNSkgKiA0O1xuICAgICAgICAgICAgdGhpcy5wb3MueSArPSBNYXRoLnNpbih0aGlzLnBvcy5yb3QgLSBNYXRoLlBJICogMS41KSAqIDQ7XG4gICAgICAgIH1cbiAgICAgICAgaWYgKHN3aXRjaFdlYXBvbikge1xuICAgICAgICAgICAgY29uc29sZS5sb2coJ3R0YWInKTtcbiAgICAgICAgICAgIHN3aXRjaFdlYXBvbiA9IGZhbHNlO1xuICAgICAgICAgICAgdGhpcy5uZXh0V2VhcG9uKCk7XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIHRydWU7XG4gICAgfSxcbiAgICByaWdodENsaWNrOiBmdW5jdGlvbihlKSB7XG4gICAgICAgIGUgPSBlIHx8IHdpbmRvdy5ldmVudDtcbiAgICAgICAgaWYgKGUud2hpY2ggPT09IDMgfHwgZS5idXR0b24gPT09IDIpIHtcbiAgICAgICAgICAgIHdhc2QueCA9IGUuY2xpZW50WDtcbiAgICAgICAgICAgIHdpbmRvdy5hZGRFdmVudExpc3RlbmVyKCdtb3VzZW1vdmUnLCB3YXNkLmZvbGxvd01vdXNlKTtcbiAgICAgICAgICAgIHdpbmRvdy5hZGRFdmVudExpc3RlbmVyKCdtb3VzZXVwJywgd2FzZC5yaWdodFVwKTtcbiAgICAgICAgfVxuICAgIH0sXG4gICAgbGVmdENsaWNrOiBmdW5jdGlvbihlKSB7XG4gICAgICAgIGlmIChlLndoaWNoID09PSAxIHx8IGUuYnV0dG9uID09PSAxKSB7XG4gICAgICAgICAgICB3YXNkLmNvbnRyb2xsaW5nLmFkZE1vZGUoJ3Nob290aW5nJyk7XG4gICAgICAgICAgICB3aW5kb3cuYWRkRXZlbnRMaXN0ZW5lcignbW91c2V1cCcsIHdhc2QubGVmdFVwKTtcbiAgICAgICAgfVxuICAgIH0sXG4gICAgZm9sbG93TW91c2U6IGZ1bmN0aW9uKGUpIHtcbiAgICAgICAgZSA9IGUgfHwgd2luZG93LmV2ZW50O1xuICAgICAgICB3YXNkLmNvbnRyb2xsaW5nLnBvcy5yb3QgKz0gKGUuY2xpZW50WCAtIHdhc2QueCkgLyAxNTA7XG4gICAgICAgIHdhc2QueCA9IGUuY2xpZW50WDtcbiAgICB9LFxuICAgIHJpZ2h0VXA6IGZ1bmN0aW9uKGUpIHtcbiAgICAgICAgZSA9IGUgfHwgd2luZG93LmV2ZW50O1xuICAgICAgICBpZiAoZS53aGljaCA9PT0gMyB8fCBlLmJ1dHRvbiA9PT0gMikge1xuICAgICAgICAgICAgd2luZG93LnJlbW92ZUV2ZW50TGlzdGVuZXIoJ21vdXNlbW92ZScsIHdhc2QuZm9sbG93TW91c2UpO1xuICAgICAgICAgICAgd2luZG93LnJlbW92ZUV2ZW50TGlzdGVuZXIoJ21vdXNldXAnLCB3YXNkLnJpZ2h0VXApO1xuICAgICAgICB9XG4gICAgfSxcbiAgICBsZWZ0VXA6IGZ1bmN0aW9uKGUpIHtcbiAgICAgICAgaWYgKGUud2hpY2ggPT09IDEgfHwgZS5idXR0b24gPT09IDEpIHtcbiAgICAgICAgICAgIHdpbmRvdy5yZW1vdmVFdmVudExpc3RlbmVyKCdtb3VzZXVwJywgd2FzZC5sZWZ0VXApO1xuICAgICAgICAgICAgd2FzZC5jb250cm9sbGluZy5hZGRNb2RlKCdzdGFuZGluZycpO1xuICAgICAgICB9XG4gICAgfSxcbiAgICBrZXlQcmVzczogZnVuY3Rpb24oZSkge1xuICAgICAgICBpZiAoZS5rZXlDb2RlID09PSA5KSB7XG4gICAgICAgICAgICBlLnByZXZlbnREZWZhdWx0KCk7XG4gICAgICAgICAgICBzd2l0Y2hXZWFwb24gPSB0cnVlO1xuICAgICAgICB9XG5cbiAgICB9LFxuXG4gICAga2V5RG93bjogZnVuY3Rpb24oZSkge1xuICAgICAgICBpZiAoa2V5c1ByZXNzZWQuaW5kZXhPZihlLmtleUNvZGUpID09PSAtMSkge1xuICAgICAgICAgICAga2V5c1ByZXNzZWQucHVzaChlLmtleUNvZGUpXG4gICAgICAgICAgICBzd2l0Y2ggKGUua2V5Q29kZSkge1xuICAgICAgICAgICAgICAgIGNhc2UgMTY6XG4gICAgICAgICAgICAgICAgICAgIHdhc2QuY29udHJvbGxpbmcucnVubmluZyA9IHRydWU7XG4gICAgICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgICAgIGNhc2UgODc6IFxuICAgICAgICAgICAgICAgICAgICB3YXNkLmNvbnRyb2xsaW5nLnVwID0gdHJ1ZTtcbiAgICAgICAgICAgICAgICAgICAgd2FzZC5jb250cm9sbGluZy5kb3duID0gZmFsc2U7XG4gICAgICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgICAgIGNhc2UgNjU6IFxuICAgICAgICAgICAgICAgICAgICB3YXNkLmNvbnRyb2xsaW5nLmxlZnQgPSB0cnVlO1xuICAgICAgICAgICAgICAgICAgICB3YXNkLmNvbnRyb2xsaW5nLnJpZ2h0ID0gZmFsc2U7XG4gICAgICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgICAgIGNhc2UgODM6IFxuICAgICAgICAgICAgICAgICAgICB3YXNkLmNvbnRyb2xsaW5nLmRvd24gPSB0cnVlO1xuICAgICAgICAgICAgICAgICAgICB3YXNkLmNvbnRyb2xsaW5nLnVwID0gZmFsc2U7XG4gICAgICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgICAgIGNhc2UgNjg6IFxuICAgICAgICAgICAgICAgICAgICB3YXNkLmNvbnRyb2xsaW5nLnJpZ2h0ID0gdHJ1ZTtcbiAgICAgICAgICAgICAgICAgICAgd2FzZC5jb250cm9sbGluZy5sZWZ0ID0gZmFsc2U7XG4gICAgICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgfSxcbiAgICBrZXlVcDogZnVuY3Rpb24oZSkge1xuICAgICAgICBrZXlzUHJlc3NlZC5zcGxpY2Uoa2V5c1ByZXNzZWQuaW5kZXhPZihlLmtleUNvZGUpLCAxKTtcbiAgICAgICAgc3dpdGNoIChlLmtleUNvZGUpIHtcbiAgICAgICAgICAgIGNhc2UgMTY6XG4gICAgICAgICAgICAgICAgd2FzZC5jb250cm9sbGluZy5ydW5uaW5nID0gZmFsc2U7XG4gICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICBjYXNlIDg3OiBcbiAgICAgICAgICAgICAgICB3YXNkLmNvbnRyb2xsaW5nLnVwID0gZmFsc2U7XG4gICAgICAgICAgICAgICAgaWYgKGtleXNQcmVzc2VkLmluZGV4T2YoODMpICE9PSAtMSkgd2FzZC5jb250cm9sbGluZy5kb3duID0gdHJ1ZTtcbiAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgIGNhc2UgNjU6IFxuICAgICAgICAgICAgICAgIHdhc2QuY29udHJvbGxpbmcubGVmdCA9IGZhbHNlO1xuICAgICAgICAgICAgICAgIGlmIChrZXlzUHJlc3NlZC5pbmRleE9mKDY4KSAhPT0gLTEpIHdhc2QuY29udHJvbGxpbmcucmlnaHQgPSB0cnVlO1xuICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgY2FzZSA4MzogXG4gICAgICAgICAgICAgICAgd2FzZC5jb250cm9sbGluZy5kb3duID0gZmFsc2U7XG4gICAgICAgICAgICAgICAgaWYgKGtleXNQcmVzc2VkLmluZGV4T2YoODcpICE9PSAtMSkgd2FzZC5jb250cm9sbGluZy51cCA9IHRydWU7XG4gICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICBjYXNlIDY4OiBcbiAgICAgICAgICAgICAgICB3YXNkLmNvbnRyb2xsaW5nLnJpZ2h0ID0gZmFsc2U7XG4gICAgICAgICAgICAgICAgaWYgKGtleXNQcmVzc2VkLmluZGV4T2YoNjUpICE9PSAtMSkgd2FzZC5jb250cm9sbGluZy5sZWZ0ID0gdHJ1ZTtcbiAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgfVxuXG4gICAgfSxcbiAgICBzdGFydDogZnVuY3Rpb24oKSB7XG4gICAgICAgIHdpbmRvdy5hZGRFdmVudExpc3RlbmVyKCdtb3VzZWRvd24nLCB3YXNkLnJpZ2h0Q2xpY2spO1xuICAgICAgICB3aW5kb3cuYWRkRXZlbnRMaXN0ZW5lcignbW91c2Vkb3duJywgd2FzZC5sZWZ0Q2xpY2spO1xuXG4gICAgICAgIHdpbmRvdy5hZGRFdmVudExpc3RlbmVyKCdrZXlkb3duJywgd2FzZC5rZXlEb3duKTtcbiAgICAgICAgd2luZG93LmFkZEV2ZW50TGlzdGVuZXIoJ2tleWRvd24nLCB3YXNkLmtleVByZXNzKTtcblxuICAgICAgICB3aW5kb3cuYWRkRXZlbnRMaXN0ZW5lcigna2V5dXAnLCB3YXNkLmtleVVwKTtcblxuICAgIH0sXG4gICAgc3RvcDogZnVuY3Rpb24oKSB7XG4gICAgICAgIHdpbmRvdy5yZW1vdmVFdmVudExpc3RlbmVyKCdtb3VzZWRvd24nLCB3YXNkLnJpZ2h0Q2xpY2spO1xuICAgICAgICB3aW5kb3cucmVtb3ZlRXZlbnRMaXN0ZW5lcignbW91c2Vkb3duJywgd2FzZC5sZWZ0Q2xpY2spO1xuXG4gICAgICAgIHdpbmRvdy5yZW1vdmVFdmVudExpc3RlbmVyKCdrZXlkb3duJywgd2FzZC5rZXlEb3duKTtcbiAgICAgICAgd2luZG93LnJlbW92ZUV2ZW50TGlzdGVuZXIoJ2tleWRvd24nLCB3YXNkLmtleVByZXNzKTtcblxuICAgICAgICB3aW5kb3cucmVtb3ZlRXZlbnRMaXN0ZW5lcigna2V5dXAnLCB3YXNkLmtleVVwKTtcblxuICAgIH0sXG5cbiAgICBjb250cm9sbGluZzogbnVsbFxuXG59O1xuXG53aW5kb3cub25jb250ZXh0bWVudSA9IGZ1bmN0aW9uKGUpIHtcbiAgICBlLnByZXZlbnREZWZhdWx0KCk7XG59O1xuXG5cbm1vZHVsZS5leHBvcnRzID0gd2FzZDtcbiIsInZhciBCdWxsZXQgPSByZXF1aXJlKCcuL2J1bGxldC5qcycpO1xudmFyIE1lZWxlZSA9IHJlcXVpcmUoJy4vbWVlbGVlLmpzJyk7XG52YXIgcGlzdG9sSW1nID0gbmV3IEltYWdlKCk7XG5waXN0b2xJbWcuc3JjID0gJy4vaW1nL3Bpc3RvbC5wbmcnO1xudmFyIG1hY2hpbmVJbWcgPSBuZXcgSW1hZ2UoKTtcbm1hY2hpbmVJbWcuc3JjID0gJy4vaW1nL21hY2hpbmVndW4ucG5nJztcbnZhciBzaG90Z3VuSW1nID0gbmV3IEltYWdlKCk7XG5zaG90Z3VuSW1nLnNyYyA9ICcuL2ltZy9zaG90Z3VuLnBuZyc7XG52YXIgYmFzZWJhbGxJbWcgPSBuZXcgSW1hZ2UoKTtcbmJhc2ViYWxsSW1nLnNyYyA9ICcuL2ltZy9iYXNlYmFsbGJhdC5wbmcnO1xuXG52YXIgd2VhcG9uU3RhdHMgPSB7XG4gICAgYW1tbzogZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ2FtbW8nKSxcbiAgICBiYXNlYmFsbEJhdDogZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ2Jhc2ViYWxsYmF0JyksXG4gICAgcGlzdG9sOiBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgncGlzdG9sJyksXG4gICAgc2hvdGd1bjogZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ3Nob3RndW4nKSxcbiAgICByaWZsZTogZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ3JpZmxlJylcbn1cblxuXG5cblxudmFyIGRyb3AgPSBmdW5jdGlvbihkcm9wcGVyLCB3ZWFwb24pIHtcbiAgICB2YXIgc3RhcnQgPSBEYXRlLm5vdygpO1xuICAgIHJldHVybiB7XG4gICAgICAgIG9uVG9wOiB0cnVlLFxuICAgICAgICBuYW1lOiB3ZWFwb25zW3dlYXBvbl0ubmFtZSxcbiAgICAgICAgaW1nOiB3ZWFwb25zW3dlYXBvbl0uaW1nLFxuICAgICAgICBwb3M6IHtcbiAgICAgICAgICAgIHg6IGRyb3BwZXIucG9zLngsXG4gICAgICAgICAgICB5OiBkcm9wcGVyLnBvcy55LFxuICAgICAgICAgICAgcm90OiAwXG4gICAgICAgIH0sXG4gICAgICAgIHZpc2libGU6IHRydWUsXG4gICAgICAgIGdlb21ldHJ5OiAnY2lyY2xlJyxcbiAgICAgICAgcmFkaXVzOiA1MCxcbiAgICAgICAgdHlwZTogJ3dlYXBvbicsXG4gICAgICAgIGNvbGxpc2lvbjoge1xuICAgICAgICAgICAgaHVtYW46IGZ1bmN0aW9uKCkge1xuICAgICAgICAgICAgICAgIHRoaXMuZGllID0gdHJ1ZTtcbiAgICAgICAgICAgIH0sXG4gICAgICAgICAgICBidWxsZXQ6IGZ1bmN0aW9uKCkge30sXG4gICAgICAgICAgICBibG9jazogZnVuY3Rpb24oKSB7fSxcbiAgICAgICAgICAgIGdvYWw6IGZ1bmN0aW9uKCkge30sXG4gICAgICAgICAgICBtZWVsZWU6IGZ1bmN0aW9uKCkge30sXG4gICAgICAgICAgICB6b21iaWU6IGZ1bmN0aW9uKHpvbWJpZSkge30sXG4gICAgICAgICAgICB3ZWFwb246IGZ1bmN0aW9uKCkge31cbiAgICAgICAgfSxcbiAgICAgICAgc3RlcDogZnVuY3Rpb24oKSB7XG4gICAgICAgICAgICBpZiAoRGF0ZS5ub3coKSAtIHN0YXJ0ID4gMjAwMDApIHJldHVybiBmYWxzZTtcbiAgICAgICAgICAgIHRoaXMucG9zLnJvdCArPSAuMDU7XG4gICAgICAgICAgICBpZiAoIXRoaXMuZGllKSByZXR1cm4gdHJ1ZTtcbiAgICAgICAgICAgIHJldHVybiBmYWxzZTtcbiAgICAgICAgfVxuICAgIH1cbn07XG5cblxudmFyIHdlYXBvbnMgPSB7XG4gICAgYmFzZWJhbGxCYXQ6IHtcbiAgICAgICAgYW1tbzogMSxcbiAgICAgICAgcmVsb2FkOiAxMCxcbiAgICAgICAgdHlwZTogJ21lZWxlZScsXG4gICAgICAgIG5hbWU6ICdiYXNlYmFsbEJhdCcsXG4gICAgICAgIGZpcmU6IGZ1bmN0aW9uKCkge1xuICAgICAgICAgICAgdGhpcy5yZW5kZXJlci5uZXdJdGVtcy5wdXNoKE1lZWxlZSh7bmFtZTogJ2JhdCcsIHBhcmVudDogdGhpcywgeDogdGhpcy5wb3MueCwgeTogdGhpcy5wb3MueSwgcm90OiB0aGlzLnBvcy5yb3QsIHBvd2VyOiAxMH0pKTtcbiAgICAgICAgICAgIHRoaXMuYXVkaW8gPSAnYmF0JztcbiAgICAgICAgfSxcbiAgICAgICAgbmV4dDogJ3Bpc3RvbCdcbiAgICB9LFxuICAgIHBpc3RvbDoge1xuICAgICAgICBmaXJlOiBmdW5jdGlvbigpIHtcbiAgICAgICAgICAgIHRoaXMucmVuZGVyZXIubmV3SXRlbXMucHVzaChCdWxsZXQoe25hbWU6ICdwaXN0b2wnLCB4OiB0aGlzLnBvcy54LCB5OiB0aGlzLnBvcy55LCByb3Q6IHRoaXMucG9zLnJvdCwgdmVsb2NpdHk6IDMwLCByYW5nZTogNTAsIHBvd2VyOiAyMH0pKTtcbiAgICAgICAgICAgIHRoaXMuYXVkaW8gPSAncGlzdG9sJztcbiAgICAgICAgICAgIHdlYXBvbnNbdGhpcy5jdXJyZW50V2VhcG9uXS5hbW1vLS07XG4gICAgICAgIH0sXG4gICAgICAgIGltZzogcGlzdG9sSW1nLFxuICAgICAgICBhbW1vOiAyMCxcbiAgICAgICAgcGlja3VwQW1tbzogMjAsXG4gICAgICAgIHBvd2VyOiAyMCxcbiAgICAgICAgcmFuZ2U6IDQwMDAsXG4gICAgICAgIHJlbG9hZDogMTAsXG4gICAgICAgIHR5cGU6ICdwcm9qZWN0aWxlJyxcbiAgICAgICAgbmFtZTogJ3Bpc3RvbCcsXG4gICAgICAgIGZhaWw6ICdiYXNlYmFsbEJhdCcsXG4gICAgICAgIGRyb3A6IGRyb3AsXG4gICAgICAgIG5leHQ6ICdzaG90Z3VuJ1xuICAgIH0sXG4gICAgc2hvdGd1bjoge1xuICAgICAgICBpbWc6IHNob3RndW5JbWcsXG4gICAgICAgIGZpcmU6IGZ1bmN0aW9uKCkge1xuICAgICAgICAgICAgdmFyIGRldmlhdGlvbiwgaTtcbiAgICAgICAgICAgIGZvciAoaSA9IDA7IGkgPCA1OyBpKyspIHtcbiAgICAgICAgICAgICAgICBkZXZpYXRpb24gPSAoTWF0aC5yYW5kb20oKSAtIDAuNSkgLyAzO1xuICAgICAgICAgICAgICAgIHRoaXMucmVuZGVyZXIubmV3SXRlbXMucHVzaChCdWxsZXQoe25hbWU6ICdzaG90Z3VuJywgeDogdGhpcy5wb3MueCwgeTogdGhpcy5wb3MueSwgcm90OiB0aGlzLnBvcy5yb3QgKyBkZXZpYXRpb24sIHZlbG9jaXR5OiAyMCwgcmFuZ2U6IDMwLCBwb3dlcjogN30pKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIHdlYXBvbnNbdGhpcy5jdXJyZW50V2VhcG9uXS5hbW1vLS07XG4gICAgICAgICAgICB0aGlzLmF1ZGlvID0gJ3Nob3RndW4nO1xuICAgICAgICB9LFxuICAgICAgICBhbW1vOiAxMCxcbiAgICAgICAgcGlja3VwQW1tbzogMjAsXG4gICAgICAgIHBvd2VyOiA1LFxuICAgICAgICByYW5nZTogMTUwMCxcbiAgICAgICAgcmVsb2FkOiA0MCxcbiAgICAgICAgdHlwZTogJ3Byb2plY3RpbGUnLFxuICAgICAgICBuYW1lOiAnc2hvdGd1bicsXG4gICAgICAgIGZhaWw6ICdwaXN0b2wnLFxuICAgICAgICBkcm9wOiBkcm9wLFxuICAgICAgICBuZXh0OiAncmlmbGUnXG5cbiAgICB9LFxuICAgIHJpZmxlOiB7XG4gICAgICAgIGltZzogbWFjaGluZUltZyxcbiAgICAgICAgZmlyZTogZnVuY3Rpb24oKSB7XG4gICAgICAgICAgICB0aGlzLnJlbmRlcmVyLm5ld0l0ZW1zLnB1c2goQnVsbGV0KHtuYW1lOiAncmlmbGUnLCB4OiB0aGlzLnBvcy54LCB5OiB0aGlzLnBvcy55LCByb3Q6IHRoaXMucG9zLnJvdCwgdmVsb2NpdHk6IDUwLCByYW5nZTogODAsIHBvd2VyOiAzMH0pKTtcbiAgICAgICAgICAgIHdlYXBvbnNbdGhpcy5jdXJyZW50V2VhcG9uXS5hbW1vLS07XG4gICAgICAgICAgICB0aGlzLmF1ZGlvID0gJ3JpZmxlJztcbiAgICAgICAgfSxcbiAgICAgICAgYW1tbzogMjAsXG4gICAgICAgIHBpY2t1cEFtbW86IDIwLFxuICAgICAgICBwb3dlcjogMjUsXG4gICAgICAgIHJhbmdlOiA0MDAwLFxuICAgICAgICByZWxvYWQ6IDUsXG4gICAgICAgIHR5cGU6ICdwcm9qZWN0aWxlJyxcbiAgICAgICAgZmFpbDogJ3Nob3RndW4nLFxuICAgICAgICBuYW1lOiAncmlmbGUnLFxuICAgICAgICBkcm9wOiBkcm9wLFxuICAgICAgICBuZXh0OiAnYmFzZWJhbGxCYXQnXG5cbiAgICB9LFxuICAgIHVwZGF0ZTogZnVuY3Rpb24ocGxheWVyKSB7XG4gICAgICAgIHZhciB3ZWFwb24gPSB3ZWFwb25zW3BsYXllci5jdXJyZW50V2VhcG9uXTtcbiAgICAgICAgdmFyIGk7XG4gICAgICAgIGZvciAoaSBpbiB3ZWFwb25zKSB7XG4gICAgICAgICAgICBpZiAod2VhcG9uc1tpXS5hbW1vKSB7XG4gICAgICAgICAgICAgICAgd2VhcG9uU3RhdHNbaV0uc3R5bGUuYm9yZGVyID0gJyc7XG4gICAgICAgICAgICAgICAgd2VhcG9uU3RhdHNbaV0uc3R5bGUuZGlzcGxheSA9ICdpbmhlcml0JztcbiAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgaWYgKHdlYXBvblN0YXRzW2ldKSB3ZWFwb25TdGF0c1tpXS5zdHlsZS5kaXNwbGF5ID0gJyc7XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgfVxuXG4gICAgICAgIHdlYXBvblN0YXRzW3BsYXllci5jdXJyZW50V2VhcG9uXS5zdHlsZS5ib3JkZXIgPSAnMXB4IHNvbGlkIHdoaXRlJztcblxuICAgICAgICBpZiAod2VhcG9uLm5hbWUgIT09ICdiYXNlYmFsbEJhdCcpIHtcbiAgICAgICAgICAgIHdlYXBvblN0YXRzLmFtbW8uaW5uZXJUZXh0ID0gd2VhcG9uLmFtbW87XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICB3ZWFwb25TdGF0cy5hbW1vLmlubmVyVGV4dCA9ICcnO1xuICAgICAgICB9XG4gICAgICAgIGlmICghd2VhcG9uLmFtbW8pIHtcbiAgICAgICAgICAgIHBsYXllci5jdXJyZW50V2VhcG9uID0gd2VhcG9uLmZhaWw7XG4gICAgICAgICAgICB3ZWFwb25zLnVwZGF0ZShwbGF5ZXIpO1xuICAgICAgICB9XG5cbiAgICB9XG59O1xuXG5tb2R1bGUuZXhwb3J0cyA9IHdlYXBvbnM7XG4iLCJ2YXIgQ2hhcmFjdGVyID0gcmVxdWlyZSgnLi9jaGFyYWN0ZXIuanMnKTtcbnZhciBXZWFwb25zID0gcmVxdWlyZSgnLi93ZWFwb25zLmpzJyk7XG5cbm1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24ob3B0aW9ucykge1xuXG4gICAgdmFyIFpvbWJpZSA9IENoYXJhY3Rlcih7XG4gICAgICAgIHRhcmdldDogdW5kZWZpbmVkLFxuICAgICAgICByZW5kZXJlcjogb3B0aW9ucy5yZW5kZXJlcixcbiAgICAgICAgaGVhbHRoOiAxMDAsXG4gICAgICAgIHJhZGl1czogNTAsXG4gICAgICAgIHR5cGU6ICd6b21iaWUnLFxuICAgICAgICBzcHJpdGVzOiBbJy4vaW1nL3pvbWJpZTEucG5nJywgJy4vaW1nL3pvbWJpZTIucG5nJywgJy4vaW1nL3pvbWJpZTMucG5nJ10sXG4gICAgICAgIHRleE1hcDoge1xuICAgICAgICAgICAgeDogNixcbiAgICAgICAgICAgIHk6IDQsXG4gICAgICAgICAgICBzbGlkZXM6IFs2LCA1LCAzLCAzXVxuICAgICAgICB9LFxuICAgICAgICBtb2RlOiAnd2FuZGVyaW5nJyxcbiAgICAgICAgbW9kZXM6IHtcbiAgICAgICAgICAgIHdhbmRlcmluZzogZnVuY3Rpb24oKSB7XG4gICAgICAgICAgICAgICAgLy9jb25zb2xlLmxvZygnd2FuZGVyaW5nJyk7XG4gICAgICAgICAgICAgICAgaWYgKE1hdGgucmFuZG9tKCkgPCAwLjA1KSB0aGlzLmF1ZGlvID0gJ2dyb3dsJztcbiAgICAgICAgICAgICAgICB2YXIgdGltZUxlbmd0aCA9IDEgKyBwYXJzZUludChNYXRoLnJhbmRvbSgpICogMyAqIDEwMDApO1xuICAgICAgICAgICAgICAgIHZhciBzdGFydFRpbWUgPSBEYXRlLm5vdygpO1xuICAgICAgICAgICAgICAgIHRoaXMudmVsb2NpdHkgPSAxICsgTWF0aC5yYW5kb20oKSAqIDI7XG4gICAgICAgICAgICAgICAgdGhpcy5wb3Mucm90ID0gTWF0aC5yYW5kb20oKSAqIE1hdGguUEkgKiAyO1xuICAgICAgICAgICAgICAgIHRoaXMucG9zZS55ID0gMTtcblxuICAgICAgICAgICAgICAgIHRoaXMuYWRkRWZmZWN0KGZ1bmN0aW9uKCkge1xuICAgICAgICAgICAgICAgICAgICB2YXIgZWxsYXBzZWRUaW1lID0gbm93IC0gc3RhcnRUaW1lO1xuICAgICAgICAgICAgICAgICAgICB2YXIgbm93ID0gRGF0ZS5ub3coKTtcbiAgICAgICAgICAgICAgICAgICAgaWYgKHRoaXMubW9kZSAhPT0gJ3dhbmRlcmluZycpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHJldHVybiBmYWxzZTtcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICBpZiAoc3RhcnRUaW1lICsgdGltZUxlbmd0aCAgPCBub3cpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHRoaXMuYWRkTW9kZSgnd2FuZGVyaW5nJyk7XG4gICAgICAgICAgICAgICAgICAgICAgICByZXR1cm4gZmFsc2U7IFxuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgIHJldHVybiB0cnVlO1xuICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgfSxcbiAgICAgICAgICAgIHNlYXJjaGluZzogZnVuY3Rpb24oKSB7XG4gICAgICAgICAgICAgICAgLy9jb25zb2xlLmxvZygnc2VhcmNoaW5nJyk7XG4gICAgICAgICAgICAgICAgdmFyIGdvYWwgPSB7XG4gICAgICAgICAgICAgICAgICAgIHRhcmdldDogdGhpcyxcbiAgICAgICAgICAgICAgICAgICAgcG9zOiB7XG4gICAgICAgICAgICAgICAgICAgICAgICB4OiB0aGlzLnRhcmdldC5wb3MueCxcbiAgICAgICAgICAgICAgICAgICAgICAgIHk6IHRoaXMudGFyZ2V0LnBvcy55XG4gICAgICAgICAgICAgICAgICAgIH0sXG4gICAgICAgICAgICAgICAgICAgIHZpc2libGU6IGZhbHNlLFxuICAgICAgICAgICAgICAgICAgICBnZW9tZXRyeTogJ2NpcmNsZScsXG4gICAgICAgICAgICAgICAgICAgIHJhZGl1czogNTAsXG4gICAgICAgICAgICAgICAgICAgIHR5cGU6ICdnb2FsJyxcbiAgICAgICAgICAgICAgICAgICAgY29sbGlzaW9uOiB7XG4gICAgICAgICAgICAgICAgICAgICAgICBodW1hbjogZnVuY3Rpb24oKSB7fSxcbiAgICAgICAgICAgICAgICAgICAgICAgIGJ1bGxldDogZnVuY3Rpb24oKSB7fSxcbiAgICAgICAgICAgICAgICAgICAgICAgIGJsb2NrOiBmdW5jdGlvbigpIHt9LFxuICAgICAgICAgICAgICAgICAgICAgICAgZ29hbDogZnVuY3Rpb24oKSB7fSxcbiAgICAgICAgICAgICAgICAgICAgICAgIG1lZWxlZTogZnVuY3Rpb24oKSB7fSxcbiAgICAgICAgICAgICAgICAgICAgICAgIHpvbWJpZTogZnVuY3Rpb24oem9tYmllKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgY29uc29sZS5sb2coJ2dvYWwgaGl0Jyk7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgaWYgKHpvbWJpZSA9PT0gdGhpcy50YXJnZXQpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgY29uc29sZS5sb2coJ3pvbWJpZSBtYXRjaCcpO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB0aGlzLmRpZSA9IHRydWU7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICB9LFxuICAgICAgICAgICAgICAgICAgICBzdGVwOiBmdW5jdGlvbigpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGlmICghdGhpcy5kaWUpIHJldHVybiB0cnVlO1xuICAgICAgICAgICAgICAgICAgICAgICAgcmV0dXJuIGZhbHNlXG4gICAgICAgICAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICB0aGlzLnJlbmRlcmVyLm5ld0l0ZW1zLnB1c2goZ29hbCk7XG4gICAgICAgICAgICAgICAgdGhpcy50YXJnZXQgPSB1bmRlZmluZWQ7XG4gICAgICAgICAgICAgICAgd2luZG93LmcgPSBnb2FsO1xuICAgICAgICAgICAgfSxcbiAgICAgICAgICAgIGNoYXNpbmc6IGZ1bmN0aW9uKCkge1xuICAgICAgICAgICAgICAgIC8vY29uc29sZS5sb2coJ2NoYXNpbmcnKTtcbiAgICAgICAgICAgICAgICB0aGlzLnBvc2UueSA9IDE7XG4gICAgICAgICAgICAgICAgdGhpcy52ZWxvY2l0eSA9IDM7XG4gICAgICAgICAgICAgICAgdGhpcy5hZGRFZmZlY3QoZnVuY3Rpb24oKSB7XG4gICAgICAgICAgICAgICAgICAgIGlmICh0aGlzLm1vZGUgIT09ICdjaGFzaW5nJykgcmV0dXJuIGZhbHNlO1xuICAgICAgICAgICAgICAgICAgICB0aGlzLnBvcy5yb3QgPSBNYXRoLmF0YW4yKCB0aGlzLnRhcmdldC5wb3MueSAtIHRoaXMucG9zLnksIHRoaXMudGFyZ2V0LnBvcy54IC0gdGhpcy5wb3MueCk7XG4gICAgICAgICAgICAgICAgICAgIHJldHVybiB0cnVlO1xuICAgICAgICAgICAgICAgIH0pO1xuXG4gICAgICAgICAgICB9LFxuICAgICAgICAgICAgcnVubmluZzogZnVuY3Rpb24oKSB7XG4gICAgICAgICAgICB9LFxuICAgICAgICAgICAgYml0aW5nOiBmdW5jdGlvbigpIHtcbiAgICAgICAgICAgIH0sXG4gICAgICAgICAgICBzdGFnZ2VyaW5nOiBmdW5jdGlvbigpIHtcbiAgICAgICAgICAgIH0sXG4gICAgICAgICAgICBkZWFkOiBmdW5jdGlvbigpIHtcbiAgICAgICAgICAgICAgICB2YXIgZHJvcCA9IE1hdGguZmxvb3IoTWF0aC5yYW5kb20oKSAqIDEwKTtcbiAgICAgICAgICAgICAgICBpZiAoZHJvcCA8PSAyKSB0aGlzLnJlbmRlcmVyLm5ld0l0ZW1zLnB1c2goV2VhcG9ucy5waXN0b2wuZHJvcCh0aGlzLCAncGlzdG9sJykpO1xuICAgICAgICAgICAgICAgIGlmIChkcm9wID09PSAzKSB0aGlzLnJlbmRlcmVyLm5ld0l0ZW1zLnB1c2goV2VhcG9ucy5zaG90Z3VuLmRyb3AodGhpcywgJ3Nob3RndW4nKSk7XG4gICAgICAgICAgICAgICAgaWYgKGRyb3AgPT09IDQpIHRoaXMucmVuZGVyZXIubmV3SXRlbXMucHVzaChXZWFwb25zLnJpZmxlLmRyb3AodGhpcywgJ3JpZmxlJykpO1xuICAgICAgICAgICAgICAgIHZhciBzdGFydCA9IERhdGUubm93KCk7XG4gICAgICAgICAgICAgICAgdGhpcy5wb3NlLnkgPSAzO1xuICAgICAgICAgICAgICAgIHRoaXMudmVsb2NpdHkgPSAwO1xuICAgICAgICAgICAgICAgIHRoaXMuZ2VvbWV0cnkgPSAnbm9uZSc7XG4gICAgICAgICAgICAgICAgdGhpcy5vblRvcCA9IGZhbHNlO1xuICAgICAgICAgICAgICAgIHRoaXMuYWRkRWZmZWN0KGZ1bmN0aW9uKCkge1xuICAgICAgICAgICAgICAgICAgICBpZiAodGhpcy5wb3NlLnggPT09IDIpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHRoaXMuYW5pbWF0ZSA9IGZhbHNlO1xuICAgICAgICAgICAgICAgICAgICAgICAgcmV0dXJuIGZhbHNlO1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgIHJldHVybiB0cnVlO1xuICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgICAgIHRoaXMuYWRkRWZmZWN0KGZ1bmN0aW9uKCkge1xuICAgICAgICAgICAgICAgICAgICBpZiAoRGF0ZS5ub3coKSAtIHN0YXJ0ID4gNTAwMCkgdGhpcy5kaWUgPSB0cnVlO1xuICAgICAgICAgICAgICAgICAgICByZXR1cm4gdHJ1ZTtcbiAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfSxcbiAgICAgICAgY29sbGlzaW9uOiB7XG4gICAgICAgICAgICBodW1hbjogZnVuY3Rpb24oKSB7XG4gICAgICAgICAgICB9LFxuICAgICAgICAgICAgem9tYmllOiBmdW5jdGlvbih6b21iaWUpIHtcbiAgICAgICAgICAgICAgICB2YXIgeCA9IHRoaXMucG9zLnggLSB6b21iaWUucG9zLng7XG4gICAgICAgICAgICAgICAgdmFyIHkgPSB0aGlzLnBvcy55IC0gem9tYmllLnBvcy55O1xuICAgICAgICAgICAgICAgIHZhciBzdGFydCA9IERhdGUubm93KCk7XG5cbiAgICAgICAgICAgICAgICB0aGlzLmFkZEVmZmVjdChmdW5jdGlvbigpIHtcbiAgICAgICAgICAgICAgICAgICAgdmFyIGVsYXBzZWQgPSBEYXRlLm5vdygpIC0gc3RhcnQ7XG4gICAgICAgICAgICAgICAgICAgIGlmIChlbGFwc2VkID4gNTApIHJldHVybiBmYWxzZTtcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5wb3MueCAtPSAoMTAwIC0geCkgLyAzMDtcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5wb3MueSAtPSAoMTAwIC0geSkgLyAzMDtcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIHRydWU7XG4gICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICB9LFxuICAgICAgICAgICAgYnVsbGV0OiBmdW5jdGlvbihidWxsZXQpIHtcbiAgICAgICAgICAgICAgICB2YXIgeCA9IE1hdGguY29zKGJ1bGxldC5wb3Mucm90KSAqIDMwO1xuICAgICAgICAgICAgICAgIHZhciB5ID0gTWF0aC5zaW4oYnVsbGV0LnBvcy5yb3QpICogMzA7XG4gICAgICAgICAgICAgICAgdmFyIHN0YXJ0ID0gRGF0ZS5ub3coKTtcbiAgICAgICAgICAgICAgICB0aGlzLmhlYWx0aCAtPSBidWxsZXQucG93ZXI7XG5cbiAgICAgICAgICAgICAgICB0aGlzLmFkZEVmZmVjdChmdW5jdGlvbigpIHtcbiAgICAgICAgICAgICAgICAgICAgdmFyIGVsYXBzZWQgPSBEYXRlLm5vdygpIC0gc3RhcnQ7XG4gICAgICAgICAgICAgICAgICAgIGlmIChlbGFwc2VkID4gNzUpIHJldHVybiBmYWxzZTtcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5wb3MueCArPSB4O1xuICAgICAgICAgICAgICAgICAgICB0aGlzLnBvcy55ICs9IHk7XG4gICAgICAgICAgICAgICAgICAgIHJldHVybiB0cnVlO1xuICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgfSxcbiAgICAgICAgICAgIG1lZWxlZTogZnVuY3Rpb24obWVlbGVlKSB7XG4gICAgICAgICAgICAgICAgdmFyIHggPSBNYXRoLmNvcyhtZWVsZWUucG9zLnJvdCkgKiAzMDtcbiAgICAgICAgICAgICAgICB2YXIgeSA9IE1hdGguc2luKG1lZWxlZS5wb3Mucm90KSAqIDMwO1xuICAgICAgICAgICAgICAgIHZhciBzdGFydCA9IERhdGUubm93KCk7XG4gICAgICAgICAgICAgICAgdGhpcy5oZWFsdGggLT0gbWVlbGVlLnBvd2VyO1xuXG4gICAgICAgICAgICAgICAgdGhpcy5hZGRFZmZlY3QoZnVuY3Rpb24oKSB7XG4gICAgICAgICAgICAgICAgICAgIHZhciBlbGFwc2VkID0gRGF0ZS5ub3coKSAtIHN0YXJ0O1xuICAgICAgICAgICAgICAgICAgICBpZiAoZWxhcHNlZCA+IDc1KSByZXR1cm4gZmFsc2U7XG4gICAgICAgICAgICAgICAgICAgIHRoaXMucG9zLnggKz0geDtcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5wb3MueSArPSB5O1xuICAgICAgICAgICAgICAgICAgICByZXR1cm4gdHJ1ZTtcbiAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgIH0sXG4gICAgICAgICAgICBnb2FsOiBmdW5jdGlvbihibG9jaykge1xuICAgICAgICAgICAgICAgIGlmIChibG9jay50YXJnZXQgPT09IHRoaXMpIHtcbiAgICAgICAgICAgICAgICAgICAgdGhpcy50YXJnZXQgPSB1bmRlZmluZWQ7XG4gICAgICAgICAgICAgICAgICAgIHRoaXMuYWRkTW9kZSgnd2FuZGVyaW5nJyk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfSxcbiAgICAgICAgICAgIHdlYXBvbjogZnVuY3Rpb24oKSB7fVxuICAgICAgICB9XG4gICAgfSk7XG5cbiAgICByZXR1cm4gWm9tYmllKG9wdGlvbnMpO1xufTtcbiJdfQ==
